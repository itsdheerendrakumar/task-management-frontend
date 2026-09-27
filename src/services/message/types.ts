import type { ApiResponse } from "@/utils/response";

export interface ChatListing {
  _id: string;
  name?: string;
  type?: "private" | "group";
  created_by?: string;
  participants: { name: string; id: string }[];
  __v?: number;
  createdAt: string;
  updatedAt: string;
}

export type ChatListingResponse = ApiResponse<ChatListing[]>;

export interface UpdateGroupPayload {
  chat_id: string;
  name: string;
  chatParticipants: string[];
}

export interface MessageSender {
  id: string;
  name: string;
}

export interface ChatMessage {
  _id: string;
  chat_id: string;
  sender_id: string | MessageSender;
  content: string;
  type: "text" | string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export type GetMessagesResponse = ApiResponse<ChatMessage[]>;

export interface CreateMessagePayload {
  chat_id: string;
  content: string;
}

export type CreateMessageResponse = ApiResponse<ChatMessage>;

