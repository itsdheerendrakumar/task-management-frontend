import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, CircleDashed, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTaskListing, updateTaskStatus } from "@/services/task";
import { useGetProfile } from "@/hooks/useGetProfile";
import { SectionLoader } from "@/features/Loader";
import { ShowError } from "@/features/ShowError";

export const Route = createFileRoute("/_private/kanban")({
  component: RouteComponent,
});

type KanbanStatus = "pending" | "in-progress" | "completed";

type KanbanTask = {
  id: string;
  title: string;
  description: string;
  status: KanbanStatus;
  due: string;
  participants: string[];
  participantCount: number;
  updatedAt: string;
};

type ColumnDefinition = {
  id: KanbanStatus;
  title: string;
  description: string;
  accent: string;
  badgeClassName: string;
};

const columns: ColumnDefinition[] = [
  {
    id: "pending",
    title: "Pending",
    description: "Tasks waiting to be started",
    accent: "from-amber-500 to-orange-500",
    badgeClassName: "bg-amber-100 text-amber-700",
  },
  {
    id: "in-progress",
    title: "In progress",
    description: "Open work that needs momentum",
    accent: "from-sky-500 to-cyan-500",
    badgeClassName: "bg-sky-100 text-sky-700",
  },
  {
    id: "completed",
    title: "Completed",
    description: "Wrapped up and ready to celebrate",
    accent: "from-emerald-500 to-lime-500",
    badgeClassName: "bg-emerald-100 text-emerald-700",
  },
];

function RouteComponent() {
  const queryClient = useQueryClient();
  const { profileQuery } = useGetProfile();
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const taskListingQuery = useQuery({
    queryKey: ["kanban-tasks"],
    queryFn: () => getTaskListing("both"),
  });

  const role = (profileQuery.data?.data?.role as string | undefined) ?? "member";

  useEffect(() => {
    if (taskListingQuery.isSuccess) {
      const apiTasks = taskListingQuery.data?.data ?? [];
      const mappedTasks = apiTasks.map((task: any): KanbanTask => {
        const deadline = task.deadline ? new Date(task.deadline) : null;
        const due = deadline
          ? deadline.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
          : "No deadline";

        const participants = (task.task_participants ?? [])
          .map((participant: any) => participant?.user?.name || participant?.user?.email || null)
          .filter(Boolean) as string[];

        return {
          id: String(task.id),
          title: task.name || "Untitled task",
          description: task.description || "No description yet",
          status: task.status === "completed" ? "completed" : task.status === "in-progress" ? "in-progress" : "pending",
          due,
          participants,
          participantCount: participants.length,
          updatedAt: task.updated_at ? new Date(task.updated_at).toLocaleDateString() : "Recently updated",
        };
      });

      setTasks(mappedTasks);
    }
  }, [taskListingQuery.data, taskListingQuery.isSuccess]);

  const mutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: KanbanStatus }) => updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["kanban-tasks"] });
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-tasks"] });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const taskId = String(active.id);
    const nextStatus = over.data.current?.columnId as KanbanStatus | undefined;
    const task = tasks.find((item) => item.id === taskId);

    if (!task || !nextStatus || task.status === nextStatus) return;

    mutation.mutate({ taskId, status: nextStatus });
  };

  const activeTask = useMemo(() => tasks.find((task) => task.id === activeTaskId) ?? null, [activeTaskId, tasks]);
  const visibleLabel = role === "member"
    ? "My assignments"
    : role === "projectManager"
      ? "Shared team work"
      : "All workspace tasks";

  if (profileQuery.isLoading || taskListingQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-border/70 bg-background/70 p-8">
        <SectionLoader />
      </div>
    );
  }

  if (taskListingQuery.isError) {
    return <ShowError message={(taskListingQuery.error as any)?.message || "Failed to load the kanban board."} />;
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100 backdrop-blur">
              <Sparkles className="size-4" />
              Drag cards between lanes to update status
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Kanban board</h1>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                A polished board for tracking work, with visibility tailored to your role. {visibleLabel} is currently active.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Workspace view</div>
            <div className="mt-1 text-lg font-semibold">{visibleLabel}</div>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveTaskId(null)}>
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks.filter((task) => task.status === column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

type KanbanColumnProps = {
  column: ColumnDefinition;
  tasks: KanbanTask[];
};

function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm transition-all duration-200",
        isOver && "border-sky-400 ring-2 ring-sky-400/20"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", column.badgeClassName)}>
            {column.title}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{column.description}</p>
        </div>
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
          {tasks.length}
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            No tasks in this lane yet.
          </div>
        ) : (
          <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

type TaskCardProps = {
  task: KanbanTask;
  isOverlay?: boolean;
};

function TaskCard({ task, isOverlay = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-[20px] border border-border/70 bg-white/90 p-4 shadow-sm transition-all duration-200",
        isDragging && "scale-[1.01] shadow-xl",
        isOverlay && "cursor-grabbing shadow-2xl"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {task.status === "completed" ? (
              <CheckCircle2 className="size-4 text-emerald-600" />
            ) : task.status === "in-progress" ? (
              <CircleDashed className="size-4 text-sky-600" />
            ) : (
              <CircleDashed className="size-4 text-amber-600" />
            )}
            <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
        </div>
        {task.status === "completed" ? (
          <Badge variant="default" className="shrink-0 rounded-full px-3 py-1 text-[11px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Done</Badge>
        ) : task.status === "in-progress" ? (
          <Badge variant="secondary" className="shrink-0 rounded-full px-3 py-1 text-[11px] bg-sky-100 text-sky-700 hover:bg-sky-200 border-none">Active</Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0 rounded-full px-3 py-1 text-[11px] bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Pending</Badge>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          <span>{task.due}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          <span>{task.participantCount}</span>
        </div>
      </div>

      {task.participants.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {task.participants.slice(0, 3).map((participant) => (
            <span key={participant} className="rounded-full border border-border/70 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {participant}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-3 text-xs text-slate-400">No participants yet</div>
      )}
    </div>
  );
}
