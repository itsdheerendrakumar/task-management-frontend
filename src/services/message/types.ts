import type { ApiResponse } from "@/utils/response";
import type { ProfileData } from "../user/types";

export interface ChatListing {
  _id: string;
  name?: string;
  type?: "private" | "group";
  created_by?: string;
  participants: { name: string; id: string }[];
  lastMessage: ChatMessage | null;
  unread_count: number;
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
  sender_id: MessageSender | string;
  content: string;
  attachment_public_id?: string;
  attachment_format?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface MessageEventData {
  chatId: string;
  messageId: string
}

export type GetMessagesResponse = ApiResponse<ChatMessage[]>;

export interface CreateMessagePayload {
  chat_id: string;
  content: string;
}

export interface CreateChatPayload {
  type: "private" | "group";
  name?: string;
  chatParticipants?: string[];
}

interface CreateChatData {
    _id: any;
    type: "private" | "group";
    name?: string;
    created_by?: any;
    image_url?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface TotalUnreadCountData {
  unread_count: number;
}

export type CreateMessageResponse = ApiResponse<ChatMessage>;
export type GetContactsResponse = ApiResponse<ProfileData[]>;
export type CreateChatResponse = ApiResponse<CreateChatData>;
export type TotalUnreadCountResponse = ApiResponse<TotalUnreadCountData>;

