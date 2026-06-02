"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import Select, { type OnChangeValue } from "react-select"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { queryKeys } from "@/constants/query-keys"
import { getSelectUserListing } from "@/services/user"
import { createTask } from "@/services/task"
import type { CreateTaskPayload } from "@/services/task/types"

const participantSchema = z.object({
  user_id: z.number().int().positive(),
  role: z.enum(["admin", "projectManager", "client", "member"]),
})

export const createTaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().min(1, "Task description is required"),
  deadline: z.string()
    .min(1, "Deadline is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Deadline must be a valid date",
    })
    .transform((value) => new Date(value)),
  notes: z.string().optional().default(""),
  participants: z.array(participantSchema).optional().default([]),
})

type CreateTaskFormInput = z.input<typeof createTaskSchema>
type CreateTaskFormData = z.infer<typeof createTaskSchema>

type ParticipantRole = "admin" | "projectManager" | "client" | "member"

type ParticipantOption = {
  value: string
  label: string
  name: string
  role: ParticipantRole
}

type SelectedParticipant = {
  user_id: number
  role: ParticipantRole
  name: string
}

type CreateTaskModalProps = {
  onCreate?: (task: any) => void
}

export default function CreateTaskModal({ onCreate }: CreateTaskModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTaskFormInput, any, CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: "",
      description: "",
      deadline: "",
      notes: "",
      participants: [],
    },
  })

  const [selectedParticipants, setSelectedParticipants] = React.useState<
    SelectedParticipant[]
  >([])

  const participantsQuery = useQuery({
    queryKey: [queryKeys.selectUserListing],
    queryFn: () => getSelectUserListing(["projectManager", "member", "client"]),
  })

  const participantOptions = participantsQuery.data?.data ?? []

  const participantSelectOptions: ParticipantOption[] = participantOptions.map((user) => ({
    value: String(user.id),
    label: `${user.name} (${user.role})`,
    name: user.name,
    role: user.role as ParticipantRole,
  }))

  const createTaskMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: (response) => {
      const createdTask = response.data ?? response
      setSelectedParticipants([])
      reset()
      onCreate?.(createdTask)
    },
  })

  const handleParticipantChange = (
    selected: OnChangeValue<ParticipantOption, true>,
  ) => {
    const nextParticipants = selected.map((option) => ({
      user_id: Number(option.value),
      role: option.role,
      name: option.name,
    }))
    setSelectedParticipants(nextParticipants)
  }

  const onSubmit = (data: CreateTaskFormData) => {
    const payload: CreateTaskPayload = {
      name: data.name,
      description: data.description,
      deadline: data.deadline.toISOString(),
      notes: data.notes,
      participants: selectedParticipants.map(({ user_id, role }) => ({
        user_id,
        role,
      })),
    }

    createTaskMutation.mutate(payload)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="h-12 rounded-xl px-6 shadow-md">
          New task
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[min(90vw,900px)] sm:max-w-[900px] rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle>Create a task</DialogTitle>
          <DialogDescription>
            Capture work and set a deadline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1">Task name *</label>
            <Input
              placeholder="e.g. Ship dashboard redesign"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              placeholder="What needs to happen?"
              {...register("description")}
              className="w-full rounded-lg border border-border px-2.5 py-2 text-sm"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deadline *</label>
            <Input type="date" {...register("deadline")} />
            {errors.deadline && (
              <p className="text-sm text-red-600 mt-1">{errors.deadline.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              placeholder="Optional notes"
              {...register("notes")}
              className="w-full rounded-lg border border-border px-2.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Participants</label>

            <Select
              isMulti
              options={participantSelectOptions}
              value={selectedParticipants.map((participant) => ({
                value: String(participant.user_id),
                label: participant.name,
                name: participant.name,
                role: participant.role,
              }))}
              onChange={handleParticipantChange}
              isLoading={participantsQuery.isLoading}
              placeholder="Select participants"
              className="react-select-container"
              classNamePrefix="react-select"
            />

            {participantsQuery.isLoading && (
              <p className="text-xs text-slate-500 mt-1">
                Loading participants...
              </p>
            )}
            {participantsQuery.isError && (
              <p className="text-xs text-red-600 mt-1">
                Unable to load participants.
              </p>
            )}
            {createTaskMutation.isError && (
              <p className="text-sm text-red-600 mt-1">
                {createTaskMutation.error instanceof Error
                  ? createTaskMutation.error.message
                  : "Unable to create task."}
              </p>
            )}
            {createTaskMutation.isPending && (
              <p className="text-sm text-slate-500 mt-1">Creating task...</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit" disabled={createTaskMutation.isPending}>
              Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
