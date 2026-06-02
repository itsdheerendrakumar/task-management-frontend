import type { ApiResponse } from "@/utils/response"

interface ProfileData {
    id: string
    name: string
    email: string
    role: string
    profile_image: string
}

interface SelectUserDaa {
    id: number
    name: string
    role: string
}

export type GetProfileResponse = ApiResponse<ProfileData>
export type GetUsersResponse = ApiResponse<ProfileData[]>
export type SelectUsersResponse = ApiResponse<SelectUserDaa[]>