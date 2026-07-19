import api from "../api";
import type {
  CreateTaskPayload,
  CreateTaskResponse,
} from "./types";

export async function createTask(payload: CreateTaskPayload): Promise<CreateTaskResponse> {
  const response = await api.post('/task', payload);
  return response.data;
}

export async function getTaskListing(type: string): Promise<any> {
  const response = await api.get('/task', { params: { type } });
  return response.data;
}

export async function updateTaskStatus(taskId: string | number, status: "pending" | "in-progress" | "completed"): Promise<any> {
  const response = await api.patch(`/task/${taskId}/status`, { status });
  return response.data;
}
