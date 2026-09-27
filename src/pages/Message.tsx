import { useState } from "react";
import { queryKeys } from "@/constants/query-keys";
import { useGetProfile } from "@/hooks/useGetProfile";
import { getChatListing } from "@/services/message";
import { useQuery } from "@tanstack/react-query";
import { ChatSidebar } from "@/features/message/components/ChatSidebar";
import { ChatArea } from "@/features/message/components/ChatArea";

export default function Message() {
    const { profileQuery } = useGetProfile();
    const messageListingQuery = useQuery({
        queryKey: [queryKeys.messageListing, profileQuery?.data?.data?.id],
        queryFn: getChatListing,
    });
    
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const activeChat = messageListingQuery.data?.data?.find(c => (c?.chat_id?._id || c?._id) === activeChatId) || null;

  return (
    <div className="flex h-[calc(100vh-100px)] w-full gap-4 overflow-hidden">
      <div className={`${activeChatId ? 'hidden sm:block' : 'block'} w-full sm:w-80 md:w-96 shrink-0`}>
        <ChatSidebar 
          chats={messageListingQuery.data?.data} 
          isLoading={messageListingQuery.isLoading} 
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
        />
      </div>
      <div className={`${!activeChatId ? 'hidden sm:flex' : 'flex'} flex-1 min-w-0`}>
        <ChatArea activeChatId={activeChatId} activeChat={activeChat} />
      </div>
    </div>
  );
}