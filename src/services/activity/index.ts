import api from "../api";
import type { ActivityResponse } from "./types";

export async function getActivity({ limit, page, userId }: { limit: string; page: number, userId: string }): Promise<ActivityResponse> {
  const response = await api.get("/activity", { params: { limit, page, ...(userId && {userId}) } });
  return response.data;
}