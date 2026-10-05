import { Paperclip, Send, MoreHorizontal, MessageSquare, AlertCircle, RefreshCw, Loader2, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { EditGroupDialog } from "./EditGroupDialog";
import type { ChatListing, ChatMessage } from "@/services/message/types";
import { getMessagesByChatId, createMessage } from "@/services/message";
import { useGetProfile } from "@/hooks/useGetProfile";
import { socket } from "@/socket";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { toast } from "sonner";
import type { ProfileData } from "@/services/user/types";
import { useCreateChat } from "@/hooks/useCreateChat";
import { getPrivateChatName } from "@/utils/getPrivateChatName";

interface ChatAreaProps {
  activeChatId: string | null;
  activeChat?: ChatListing | null;
  newChatUser?: ProfileData | null;
  onBack?: () => void;
  setActiveChatId: (chatId: string | null) => void;
  handleLastMessage: (message: ChatMessage) => void;
}

export function ChatArea({ activeChatId, activeChat, newChatUser, onBack, setActiveChatId, handleLastMessage }: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const [messageListings, setMessageListings] = useState<ChatMessage[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const prevChatIdRef = useRef<string | null>(null);

  const { profileQuery } = useGetProfile();
  const currentUserId = profileQuery?.data?.data?.id;

  const messagesQuery = useQuery({
    queryKey: [queryKeys.messages, activeChatId],
    queryFn: () => getMessagesByChatId(activeChatId!),
    enabled: Boolean(activeChatId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if(messagesQuery.data?.data?.length! >= 0)
      setMessageListings(messagesQuery.data?.data ?? []);
  }, [messagesQuery.data?.data, setMessageListings])

  const createMessageMutation = useMutation({
    mutationFn: createMessage,
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send message");
    },
  });

  const { createChatMutation } = useCreateChat();

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (prevChatIdRef.current !== activeChatId) {
      prevChatIdRef.current = activeChatId;
      container.scrollTop = container.scrollHeight;
    } else {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messageListings, activeChatId]);

  useEffect(() => {

    if(!activeChatId) {
      setMessageListings([]);
    }
    const handleIncomingMessage = (data: ChatMessage) => {
      if (data.chat_id === activeChatId)
        setMessageListings((prevMessages) => [...prevMessages, data]);
    };

    socket.on("message", handleIncomingMessage);
    return () => {
      socket.off("message", handleIncomingMessage);
    };
  }, [activeChatId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || createMessageMutation.isPending) return;

    const trimmedContent = message.trim();
    setMessage("");
    try {
      const newChat = !activeChatId ? await createChatMutation.mutateAsync({
        type: "private", chatParticipants: newChatUser && newChatUser.id !== currentUserId ? [newChatUser.id] : []
      }) : undefined;
      if(newChat) {
        setActiveChatId(newChat?.data?._id || null);
      }
      const response = await createMessageMutation.mutateAsync({
      chat_id: newChat?.data?._id || activeChatId,
      content: trimmedContent,
    });
    if(response?.data) {
      handleLastMessage(response?.data as ChatMessage);
      setMessageListings((prevMessages) => [...prevMessages, response?.data as ChatMessage]);
      socket.emit("message", response?.data);
    }
    } catch (error) {
      
    }
    
  };

  const formatMessageTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!activeChatId && !newChatUser) {
    return (
      <div className="hidden h-full flex-1 items-center justify-center rounded-lg border bg-card shadow-soft sm:flex">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg
              className="size-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Select a conversation
          </h3>
          <p className="text-muted-foreground">
            Choose a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  const chatName = activeChatId && (activeChat?.type === "group" ? activeChat?.name : getPrivateChatName(activeChat, currentUserId)) || 
  (newChatUser?.id === currentUserId ? "You": newChatUser?.name) || "Unknown Chat";
  const initials = chatName ? chatName.substring(0, 2).toUpperCase() : "SC";
  const isGroup = activeChat?.type === "group";

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-soft min-h-0">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b p-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden -ml-2 text-muted-foreground hover:text-foreground"
              onClick={onBack}
              title="Back to chats"
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <Avatar className="size-10 border border-border/50">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${chatName}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {chatName}
            </span>
            <span className="text-xs text-success">
              {isGroup
                ? `${activeChat?.participants?.length || 0} participants`
                : ''}
            </span>
          </div>
        </div>

        {isGroup && profileQuery?.data?.data?.role === "admin" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditDialogOpen(true)}
            title="Group Info"
          >
            <MoreHorizontal className="size-5" />
          </Button>
        )}
      </div>

      {activeChat && (
        <EditGroupDialog
          chat={activeChat}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin p-4 space-y-4 bg-background/50 min-h-0"
      >
        {messagesQuery.isLoading ? (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-end gap-2 justify-start">
              <div className="size-8 rounded-full bg-muted animate-pulse" />
              <div className="h-14 w-48 rounded-2xl rounded-bl-sm bg-muted/60 animate-pulse" />
            </div>
            <div className="flex items-end gap-2 justify-end">
              <div className="h-10 w-40 rounded-2xl rounded-br-sm bg-primary/20 animate-pulse" />
            </div>
            <div className="flex items-end gap-2 justify-start">
              <div className="size-8 rounded-full bg-muted animate-pulse" />
              <div className="h-16 w-60 rounded-2xl rounded-bl-sm bg-muted/60 animate-pulse" />
            </div>
            <div className="flex items-end gap-2 justify-end">
              <div className="h-12 w-52 rounded-2xl rounded-br-sm bg-primary/20 animate-pulse" />
            </div>
          </div>
        ) : messagesQuery.isError ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <p className="text-sm font-medium text-destructive">
              Failed to load messages
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => messagesQuery.refetch()}
              className="gap-2 text-xs"
            >
              <RefreshCw className="size-3.5" /> Retry
            </Button>
          </div>
        ) : messageListings.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80 mb-3">
              <MessageSquare className="size-7" />
            </div>
            <p className="font-medium text-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Be the first to say hello and start this conversation!
            </p>
          </div>
        ) : (
          messageListings.map((msg) => {
            const senderId = typeof msg.sender_id === "object" ? msg.sender_id?.id : msg.sender_id;
            const isMe = Boolean(currentUserId && String(senderId) === String(currentUserId));
            const senderName = typeof msg.sender_id === "object" ? msg.sender_id?.name : "User";
            const senderInitials = senderName ? senderName.substring(0, 2).toUpperCase() : "U";

            return (
              <div
                key={msg._id}
                className={cn(
                  "flex w-full items-end gap-2",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                {!isMe && (
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${senderName}`} />
                    <AvatarFallback>{senderInitials}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "relative max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                    isMe
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-card border text-foreground"
                  )}
                >
                  {!isMe && isGroup && (
                    <span className="mb-0.5 block text-[11px] font-semibold text-primary/80">
                      {senderName}
                    </span>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <span
                    className={cn(
                      "mt-1 block text-[10px] opacity-70",
                      isMe ? "text-right text-primary-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-4 shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-primary"
          >
            <Paperclip className="size-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-muted/50 border-none h-11 focus-visible:ring-1 rounded-full px-4"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || createMessageMutation.isPending}
            className="shrink-0 rounded-full h-11 w-11 shadow-md transition-transform active:scale-95"
          >
            {createMessageMutation.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

