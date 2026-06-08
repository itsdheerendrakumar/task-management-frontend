import api from "../api";
import type {
    ChangePasswordPayload,
    ChangePasswordResponse,
    GetProfileResponse,
    GetUsersResponse,
    SelectUsersResponse,
    UpdateProfilePayload,
} from "./types";

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

export async function updateProfile(payload: UpdateProfilePayload): Promise<GetProfileResponse> {
    const formData = new FormData();
    formData.append('name', payload.name);

    if (payload.profile_image) {
        formData.append('profile_image', payload.profile_image);
    }

    const response = await api.patch('/user/profile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    const response = await api.patch('/user/change-password', payload);
    return response.data;
}
