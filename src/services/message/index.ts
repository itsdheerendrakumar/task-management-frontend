import api from "../api";
import type { ChatListingResponse, UpdateGroupPayload } from "./types";

export async function getChatListing(): Promise<ChatListingResponse> {
    const response = await api.get("/message/chat-listing");
    return response.data;
}

export async function updateGroup(payload: UpdateGroupPayload) {
    const response = await api.patch("/message/group", payload);
    return response.data;
}