import { Paperclip, Send, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { EditGroupDialog } from "./EditGroupDialog";
import type { ChatListing } from "@/services/message/types";

interface Message {
  id: string;
  content: string;
  senderId: "me" | "other";
  timestamp: string;
}

// Mock messages for demonstration
const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    content: "Hey, how are you doing?",
    senderId: "other",
    timestamp: "10:00 AM",
  },
  {
    id: "2",
    content: "I'm doing well! Just working on the new feature.",
    senderId: "me",
    timestamp: "10:02 AM",
  },
  {
    id: "3",
    content: "That sounds great. Do you need any help?",
    senderId: "other",
    timestamp: "10:05 AM",
  },
  {
    id: "4",
    content: "Maybe later, I'll let you know. Thanks!",
    senderId: "me",
    timestamp: "10:06 AM",
  },
  {
    id: "5",
    content: "Alright, good luck!",
    senderId: "other",
    timestamp: "10:10 AM",
  },
];

interface ChatAreaProps {
  activeChatId: string | null;
  activeChat?: ChatListing | null;
}

export function ChatArea({ activeChatId, activeChat }: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      senderId: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  if (!activeChatId) {
    return (
      <div className="hidden flex-1 items-center justify-center rounded-lg border bg-card shadow-soft sm:flex">
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

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-soft">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border border-border/50">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeChat?.chat_id?.name || activeChat?.name || 'SelectedChat'}`} />
            <AvatarFallback>{(activeChat?.chat_id?.name || activeChat?.name) ? (activeChat?.chat_id?.name || activeChat?.name)?.substring(0, 2).toUpperCase() : 'SC'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {activeChat?.chat_id?.name || activeChat?.name || `Chat ${activeChatId.slice(-4)}`}
            </span>
            <span className="text-xs text-success">
              {(activeChat?.chat_id?.type || activeChat?.type) === 'group' 
                ? `${activeChat?.participants?.length || 0} participants` 
                : 'Online'}
            </span>
          </div>
        </div>
        
        {(activeChat?.chat_id?.type || activeChat?.type) === "group" && (
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
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4 bg-background/50">
        {messages.map((msg) => {
          const isMe = msg.senderId === "me";
          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-full items-end gap-2",
                isMe ? "justify-end" : "justify-start"
              )}
            >
              {!isMe && (
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=SelectedChat`} />
                  <AvatarFallback>SC</AvatarFallback>
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
                <p>{msg.content}</p>
                <span
                  className={cn(
                    "mt-1 block text-[10px] opacity-70",
                    isMe ? "text-right text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-4">
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
            disabled={!message.trim()}
            className="shrink-0 rounded-full h-11 w-11 shadow-md transition-transform active:scale-95"
          >
            <Send className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
