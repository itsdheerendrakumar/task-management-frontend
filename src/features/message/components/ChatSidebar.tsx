import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";


import type { ChatListing } from "@/services/message/types";

interface ChatSidebarProps {
  chats?: ChatListing[];
  isLoading: boolean;
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
}

export function ChatSidebar({
  chats,
  isLoading,
  activeChatId,
  onSelectChat,
}: ChatSidebarProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card shadow-soft sm:w-80 md:w-96">
      <div className="flex flex-col gap-4 border-b p-4">
        <h2 className="text-xl font-semibold text-foreground">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-9 h-10 bg-muted/50 border-none focus-visible:ring-1"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : chats && chats.length > 0 ? (
          <div className="flex flex-col gap-1">
            {chats.map((chatItem) => {
              const isActive = activeChatId === chatItem._id;
              const chatName = chatItem.name || "Unknown Chat";
              const initials = chatName.substring(0, 2).toUpperCase();

              return (
                <button
                  key={chatItem._id}
                  onClick={() => onSelectChat(chatItem._id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50"
                  )}
                >
                  <Avatar className="size-12 border border-border/50 shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${chatName}`} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-medium text-foreground">
                        {chatName}
                      </span>
                      {/* Optional: Add a timestamp if available in future */}
                      <span className="text-xs text-muted-foreground">
                        {new Date(chatItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="truncate text-sm text-muted-foreground">
                      {chatItem.type === "group" ? "Group chat" : "Private chat"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground">
            <p>No chats found</p>
          </div>
        )}
      </div>
    </div>
  );
}
