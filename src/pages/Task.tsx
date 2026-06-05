import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import CreateTaskModal from "@/features/tasks/CreateTaskModal";
import { getTaskListing } from "@/services/task";
import { useQuery } from "@tanstack/react-query";
import { ShowError } from "@/features/ShowError";
import { SectionLoader } from "@/features/Loader";
import { NoDataFound } from "@/features/NoDataFound";

// UI task shape used by this page
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
type UiTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  due: string;
  assignees: string[];
  subtasks: string;
};

const statusStyles: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-slate-100 text-slate-800",
};

// priority concept removed — UI does not use priority

export function Task() {
const [status, setStatus] = useState("both");
  const taskListingQuery = useQuery({
    queryKey: ["taskListing", status],
    queryFn: () => getTaskListing(status),
  });
  const [tasksState, setTasks] = useState<UiTask[]>([]);

  const mapApiTaskToUi = (t: any): UiTask => {
    const deadline = t.deadline ? new Date(t.deadline) : null;
    const due = deadline
      ? deadline.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

    const assignees = (t.task_participants || []).map((p: any) => {
      const name = p?.user?.name || p?.user?.email || "U";
      const parts = name.split(" ").filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
    });

    return {
      id: String(t.id),
      title: t.name || "Untitled",
      description: t.description || "",
      status:
        typeof t.status === "string" && t.status.toLowerCase() === "completed"
          ? "Completed"
          : "Pending",
      due,
      assignees: assignees.length ? assignees : ["U"],
      subtasks: "—",
    };
  };

  useEffect(() => {
    if (taskListingQuery.isSuccess) {
      const apiTasks = taskListingQuery.data?.data || [];
      setTasks(apiTasks.map(mapApiTaskToUi));
    }
  }, [taskListingQuery.data, taskListingQuery.isSuccess]);


  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">All tasks</h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Filter, sort, and act on every task in your workspace.
          </p>
        </div>

        <CreateTaskModal onCreate={(t: any) => {
          const newTask = t && t.name ? mapApiTaskToUi(t) : t;
          setTasks((prev) => [newTask, ...prev]);
        }} />
      </div>

      {/* Rendering directly from API response; no client-side filters */}

        <div className="mb-6 flex justify-end">
          <div className="w-full md:w-48 bg-white rounded-lg border">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full" size="sm">
                <SelectValue>{status === "both" ? "All statuses" : status.charAt(0).toUpperCase() + status.slice(1)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="font-semibold">TITLE</TableHead>
              <TableHead className="font-semibold">STATUS</TableHead>
              <TableHead className="font-semibold">DUE</TableHead>
              <TableHead className="font-semibold">ASSIGNEES</TableHead>
              <TableHead className="font-semibold">SUBTASKS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskListingQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="p-6">
                  <SectionLoader />
                </TableCell>
              </TableRow>
            )}

            {taskListingQuery.isError && (
              <TableRow>
                <TableCell colSpan={5} className="p-6">
                  <ShowError message={(taskListingQuery.error as any)?.message || "Failed to load tasks."} />
                </TableCell>
              </TableRow>
            )}

            {!taskListingQuery.isLoading && !taskListingQuery.isError && tasksState.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="p-6 text-center text-muted-foreground">
                  <NoDataFound />
                </TableCell>
              </TableRow>
            )}

            {!taskListingQuery.isLoading && !taskListingQuery.isError && tasksState.length > 0 && tasksState.map((task) => (
              <TableRow key={task.id} className="border-b last:border-b-0">
                <TableCell className="py-4 align-top">
                  <div className="font-semibold text-base">{task.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{task.description}</div>
                </TableCell>
                <TableCell>
                  <Badge className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyles[task.status] ?? "bg-slate-100 text-slate-800"}`}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>{task.due}</TableCell>
                <TableCell>
                  <AvatarGroup>
                    {task.assignees.map((assignee) => (
                      <Avatar key={assignee} size="sm">
                        <AvatarFallback>{assignee}</AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </TableCell>
                <TableCell>{task.subtasks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
