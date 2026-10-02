import { useEffect, useState } from "react";
import { queryKeys } from "@/constants/query-keys";
import { useGetProfile } from "@/hooks/useGetProfile";
import { getChatListing } from "@/services/message";
import { useQuery } from "@tanstack/react-query";
import { ChatSidebar } from "@/features/message/components/ChatSidebar";
import { ChatArea } from "@/features/message/components/ChatArea";
import { socket } from "@/socket";
import type { ChatListing, ChatMessage } from "@/services/message/types";

export default function Message() {
  const { profileQuery } = useGetProfile();
  const [chats, setChats] = useState<ChatListing[]>([]);
  const messageListingQuery = useQuery({
    queryKey: [queryKeys.messageListing, profileQuery?.data?.data?.id],
    queryFn: getChatListing,
  });

  useEffect(() => {
    if (messageListingQuery.data?.data?.length) {
      setChats(messageListingQuery.data?.data);
    }
  }, [messageListingQuery.data?.data]);

  // Lock main container scrolling strictly while on the Message page
  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (mainEl) {
      const prevOverflow = mainEl.style.overflow;
      mainEl.style.overflow = "hidden";
      return () => {
        mainEl.style.overflow = prevOverflow;
      };
    }
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      console.log(socket.id);
    };

    const handleDisconnect = () => {
      console.log(socket.id);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);


    if (messageListingQuery.data?.data?.length) {
      messageListingQuery.data?.data?.forEach((chat) => {
        socket.emit("joinRoom", chat._id);
      });
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [messageListingQuery.data?.data]);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    const handleIncomingMessage = (data: ChatMessage) => {
      setChats((prevChats) => prevChats.map((chat) => {
        if (chat._id === data.chat_id) {
          return { ...chat, lastMessage: data };
        }
        return chat;
      }));
    };

    socket.on("message", handleIncomingMessage);
    return () => {
      socket.off("message", handleIncomingMessage);
    };
  }, [activeChatId])

  const activeChat = messageListingQuery.data?.data?.find(c => (c?._id) === activeChatId) || null;

  return (
    <div className="flex h-[calc(100dvh-112px)] max-h-[calc(100dvh-112px)] w-full gap-4 overflow-hidden">
      <div className={`${activeChatId ? 'hidden sm:flex' : 'flex'} flex-col h-full w-full sm:w-80 md:w-96 shrink-0 min-h-0 overflow-hidden`}>
        <ChatSidebar
          chats={chats}
          isLoading={messageListingQuery.isLoading}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
        />
      </div>
      <div className={`${!activeChatId ? 'hidden sm:flex' : 'flex'} flex-col flex-1 min-w-0 min-h-0 h-full overflow-hidden`}>
        <ChatArea
          activeChatId={activeChatId}
          activeChat={activeChat}
          onBack={() => setActiveChatId(null)}
          handleLastMessage={(message: ChatMessage) => {
            setChats((prevChats) => prevChats.map((chat) => {
              if (chat._id === message.chat_id) {
                return { ...chat, lastMessage: message };
              }
              return chat;
            }))
          }}
        />
      </div>
    </div>
  );
}
