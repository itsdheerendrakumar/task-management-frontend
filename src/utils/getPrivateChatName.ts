import type { ChatListing } from "@/services/message/types";

export const getPrivateChatName = (chat: ChatListing | null | undefined, currentUserId: string | undefined): string => {
  if (chat && chat.type === "private" && chat.participants.length === 2) {
    const otherParticipant = chat.participants.find((p) => p.id !== currentUserId);
    return otherParticipant ? otherParticipant.name : "Unknown";
  }
  return "You"
}