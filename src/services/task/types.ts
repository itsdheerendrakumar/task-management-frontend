import type { ApiResponse } from "@/utils/response";

export interface TaskParticipant {
  user_id: number;
  role: "admin" | "projectManager" | "client" | "member";
}

export interface CreateTaskPayload {
  name: string;
  description: string;
  deadline: string;
  notes?: string;
  participants: TaskParticipant[];
}

export type CreateTaskResponse = ApiResponse<{
  id: string;
  name: string;
  description: string;
  deadline: string;
  notes?: string;
  participants: TaskParticipant[];
}>;

export type GetProfileResponse = ApiResponse<unknown>;
export type GetUsersResponse = ApiResponse<unknown>;
export type SelectUsersResponse = ApiResponse<unknown>;
