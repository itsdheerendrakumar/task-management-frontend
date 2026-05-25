import api from "../api";
import type { GetProfileResponse } from "./types";

export async function getProfile(): Promise<GetProfileResponse> {
    const response = await api.get('/user/profile');
    return response.data;
}