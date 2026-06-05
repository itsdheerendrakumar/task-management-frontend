import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewUser } from "@/services/auth";
import { queryKeys } from "@/constants/query-keys";

export const inviteUserSchema = z.object({
  name: z
    .string()
    .min(3, "Full name must be at least 3 characters"),

  email: z
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  role: z.enum([
    "projectManager",
    "member",
    "client",
  ]),
});

export type CreateuserFormValues = z.infer<
  typeof inviteUserSchema
>;
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateuserModal({
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient();
  const form = useForm<CreateuserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "member",
    },
  });
  const creareUserMutation = useMutation({
    mutationFn: (payload: CreateuserFormValues) => createNewUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [queryKeys.userListing]});
      form.reset();
      onOpenChange(false);
    }
  })

  async function onSubmit(values: CreateuserFormValues) {
    creareUserMutation.mutate(values);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[640px] rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold">
            Create new account
          </DialogTitle>

          <DialogDescription className="text-base">
            Create a new user account. They'll get
            access based on the role you assign.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-4 space-y-5"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>

            <Input
              id="name"
              placeholder="Jane Doe"
              className="h-12 rounded-xl"
              {...form.register("name")}
            />

            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message as string}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              placeholder="jane@company.com"
              className="h-12 rounded-xl"
              {...form.register("email")}
            />

            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message as string}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              className="h-12 rounded-xl"
              {...form.register("password")}
            />

            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message as string}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role</Label>

            <select
              id="role"
              className="h-12 rounded-xl w-full px-3"
              {...form.register("role")}
            >
              <option value="manager">Project Manager</option>
              <option value="member">Team Member</option>
              <option value="client">Client</option>
            </select>

            {form.formState.errors.role && (
              <p className="text-sm text-red-500">
                {form.formState.errors.role.message as string}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={creareUserMutation.isPending}>Create account</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}