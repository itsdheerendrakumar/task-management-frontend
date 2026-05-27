import type { ApiResponse } from "@/utils/response"

interface ProfileData {
    id: string
    name: string
    email: string
    role: string
    profile_image: string
}

export type GetProfileResponse = ApiResponse<ProfileData>
export type GetUsersResponse = ApiResponse<ProfileData[]>