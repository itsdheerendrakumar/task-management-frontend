import api from '../api';
import type { LoginPayload } from './types';
export async function login(payload: LoginPayload) {
    const response = await api.post('auth/login', payload);
    return response.data;
}