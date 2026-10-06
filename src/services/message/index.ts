import api from "../api";
import type {
  ChatListingResponse,
  CreateChatPayload,
  CreateChatResponse,
  CreateMessagePayload,
  CreateMessageResponse,
  GetContactsResponse,
  GetMessagesResponse,
  TotalUnreadCountResponse,
  UpdateGroupPayload,
} from "./types";

export async function getChatListing(): Promise<ChatListingResponse> {
  const response = await api.get("/message/chat-listing");
  return response.data;
}

export async function getMessagesByChatId(chatId: string): Promise<GetMessagesResponse> {
  const response = await api.get(`/message/${chatId}`);
  return response.data;
}

export async function createMessage(payload: FormData): Promise<CreateMessageResponse> {
  const response = await api.post("/message", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateGroup(payload: UpdateGroupPayload) {
  const response = await api.patch("/message/group", payload);
  return response.data;
}

export async function createChat(payload: CreateChatPayload): Promise<CreateChatResponse> {
  const response = await api.post("/message/group", payload);
  return response.data;
}

export async function getContacts(): Promise<GetContactsResponse> {
  const response = await api.get("/message/contact");
  return response.data;
}

export async function markAsRead(chatId: string) {
  const response = await api.patch(`/message/${chatId}/read`);
  return response.data;
}

export async function getTotalUnreadCount(): Promise<TotalUnreadCountResponse> {
  const response = await api.get("/message/unread-count");
  return response.data;
}

export async function getMessageFile(messageId: string): Promise<Blob> {
  const response = await api.get(`/message/${messageId}/file`, {
    responseType: "blob",
  });
  return response.data;
}