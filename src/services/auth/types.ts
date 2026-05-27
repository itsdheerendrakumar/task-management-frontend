export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterUserPayload {
    name: string;
    email: string;
    role: "client" | "member" | "projectManager"
}