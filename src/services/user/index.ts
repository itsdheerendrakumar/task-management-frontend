import api from "../api";
import type { GetProfileResponse, GetUsersResponse, SelectUsersResponse } from "./types";
export async function getProfile(): Promise<GetProfileResponse> {
    const response = await api.get('/user/profile');
    return response.data;
}

export async function getUsers(): Promise<GetUsersResponse> {
    const response = await api.get('/user/listing');
    return response.data;
}

export async function getSelectUserListing(roles: string[]): Promise<SelectUsersResponse> {
    const response = await api.get('/user/role-listing', { params: { roles: roles.join(',') } });
    return response.data;
}