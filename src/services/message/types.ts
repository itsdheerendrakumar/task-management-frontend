import type { ApiResponse } from "@/utils/response";

interface Chat {
  _id: string;
  type: "private" | "group";
  name: string;
  created_by: string;
}

export interface ChatListing {
  _id: string;
  chat_id: Chat;
  name?: string;
  type?: "private" | "group";
  created_by?: string;
  participants: { name: string, id: string }[];
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export type ChatListingResponse = ApiResponse<ChatListing[]>;

export interface UpdateGroupPayload {
    chat_id: string;
    name: string;
    chatParticipants: string[];
}