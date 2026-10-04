import { useEffect, useState } from "react";
import { queryKeys } from "@/constants/query-keys";
import { useGetProfile } from "@/hooks/useGetProfile";
import { getChatListing, getContacts, markAsRead } from "@/services/message";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatSidebar } from "@/features/message/components/ChatSidebar";
import { ChatArea } from "@/features/message/components/ChatArea";
import { socket } from "@/socket";
import type { ChatListing, ChatMessage } from "@/services/message/types";
import NewChat from "@/features/message/components/NewChat";
import type { ProfileData } from "@/services/user/types";

export default function Message() {
  const { profileQuery } = useGetProfile();
  const queryClient = useQueryClient();
  const profileId = profileQuery?.data?.data?.id;
  const messageListingQueryKey = [queryKeys.messageListing, profileId];
  const [chats, setChats] = useState<ChatListing[]>([]);
  const [isNewChat, setIsNewChat] = useState<boolean>(false);
  const [newChatUser, setNewChatUser] = useState<ProfileData | null>(null);
  const messageListingQuery = useQuery({
    queryKey: messageListingQueryKey,
    queryFn: getChatListing,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: messageListingQueryKey }),
  });

  const contactquery = useQuery({
    queryKey: [queryKeys.messageContacts, profileQuery?.data?.data?.id],
    queryFn: getContacts,
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
      if(activeChatId === data.chat_id) {
        markAsReadMutation.mutate(data.chat_id);
      } else {
        queryClient.invalidateQueries({ queryKey: messageListingQueryKey });
      }
      setChats((prevChats) => prevChats.map((chat) => {
        if (chat._id === data.chat_id) {
          return {
            ...chat,
            lastMessage: data,
            unread_count: activeChatId === data.chat_id
              ? 0
              : (chat.unread_count ?? 0) + 1,
          };
        }
        return chat;
      }));
    };

    socket.on("message", handleIncomingMessage);
    return () => {
      socket.off("message", handleIncomingMessage);
    };
  }, [activeChatId, markAsReadMutation.mutate, profileId, queryClient])

  const handleNewChatContactSelection = (userId: string) => {
    const isCurrentUser = profileQuery?.data?.data?.id === userId;

    const existingChat = chats.find(chat => chat.type === "private" && (isCurrentUser ? chat.participants.length === 1 : true) && chat.participants.some(participant => participant.id === userId));
    if(existingChat) {
      setActiveChatId(existingChat._id);
      setIsNewChat(false);
      return;
    }
    
    const selectedContact = contactquery.data?.data?.find((contact) => contact.id === userId) || null;
    setNewChatUser(selectedContact);
    setIsNewChat(false);
    setActiveChatId(null);
  }

  const activeChat = messageListingQuery.data?.data?.find(c => (c?._id) === activeChatId) || null;

  return (
    <div className="flex h-[calc(100dvh-112px)] max-h-[calc(100dvh-112px)] w-full gap-4 overflow-hidden"> 
      {isNewChat &&
        <div className="flex h-full w-full shrink-0 flex-col overflow-hidden sm:w-80 md:w-96">
          <NewChat
            contacts={contactquery.data?.data as ProfileData[] | undefined}
            isLoading={contactquery.isLoading}
            onBack={() => setIsNewChat(false)}
            handleNewChatContactSelection={handleNewChatContactSelection}
          />
        </div>
      }

      {!isNewChat &&
        <div className={`${activeChatId ? 'hidden sm:flex' : 'flex'} flex-col h-full w-full sm:w-80 md:w-96 shrink-0 min-h-0 overflow-hidden`}>
          <ChatSidebar
            chats={chats.toSorted((a, b) => {
              const aTime = a.lastMessage ? Date.parse(a.lastMessage.createdAt) : 0;
              const bTime = b.lastMessage ? Date.parse(b.lastMessage.createdAt) : 0;
              return bTime - aTime;
            })}
            isLoading={messageListingQuery.isLoading}
            activeChatId={activeChatId}
            onSelectChat={(id: string) => {
              if (chats.find((chat) => chat._id === id)?.unread_count) {
                markAsReadMutation.mutate(id);
              }
              setActiveChatId(id);
              setNewChatUser(null);
            }}
            onNewChat={() => setIsNewChat(true)}
          />
        </div>

      }
      <div className={`${isNewChat || !activeChatId ? 'hidden sm:flex' : 'flex'} flex-col flex-1 min-w-0 min-h-0 h-full overflow-hidden`}>
        <ChatArea
          activeChatId={activeChatId}
          activeChat={activeChat}
          onBack={() => setActiveChatId(null)}
          setActiveChatId={setActiveChatId}
          newChatUser={newChatUser}
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
