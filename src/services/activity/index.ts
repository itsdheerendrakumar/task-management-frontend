import api from "../api";
import type { ActivityResponse } from "./types";

export async function getActivity({ limit, page, userId }: { limit: string; page: number, userId: string }): Promise<ActivityResponse> {
  const response = await api.get("/activity", { params: { limit, page, ...(userId && userId !== "all" && {userId}) } });
  return response.data;
}

export async function deleteActivities(activityIds: string[]) {
  const searchParams = new URLSearchParams();
  activityIds.forEach(id => searchParams.append("activityIds", id));
  const response = await api.delete("/activity", {params: searchParams});
  return response.data;
}