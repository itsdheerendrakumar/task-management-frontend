import api from '../api';
import type { LoginPayload, RegisterUserPayload } from './types';
export async function login(payload: LoginPayload) {
    const response = await api.post('auth/login', payload);
    return response.data;
}

export async function createNewUser(payload: RegisterUserPayload) {
    const response = await api.post("/auth/register", payload);
    return response.data;
}

export async function logout() {
    const response = await api.post('auth/logout');
    return response.data;
}