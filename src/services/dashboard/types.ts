import type { ApiResponse } from "@/utils/response";

export interface TaskMetrics {
  totaltask: number;
  pendingTask: number;
  inProgressTask: number;
  completedTask: number;
  overedueTask: number;
}

export interface MonthlyTaskMetrics {
  month: string;
  created_tasks: string;
  completed_tasks: string;
}

export type DashboardDataResponse = ApiResponse<TaskMetrics>;
export type LastOneYearTaskCountResponse = ApiResponse<MonthlyTaskMetrics[]>;
