import type { ApiResponse } from "@/utils/response";

interface ActivityData {
  id: number;
  action: string;
  message: string;
  task_id: number | null;
  subtask_id: number | null;
  meta_data: Record<string, unknown> | null;
  performed_by: number;
  created_at: string; // ISO date string
}
interface ActivityWithPagination {
  data: ActivityData[];
  pagination: {
    limit: number;
    page: number;
    totalItems: number;
    totalPages: number;
  }
}
export type ActivityResponse = ApiResponse<ActivityWithPagination>;