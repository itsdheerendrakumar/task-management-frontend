import api from "../api";
import type { GetProfileResponse, GetUsersResponse } from "./types";
export async function getProfile(): Promise<GetProfileResponse> {
    const response = await api.get('/user/profile');
    return response.data;
}

export async function getUsers(): Promise<GetUsersResponse> {
    const response = await api.get('/user/listing');
    return response.data;
}