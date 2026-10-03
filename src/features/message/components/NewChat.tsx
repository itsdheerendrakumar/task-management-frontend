import { useState } from "react";
import { ArrowLeft, Search, UserRoundPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileData } from "@/services/user/types";
import { useGetProfile } from "@/hooks/useGetProfile";

interface NewChatProps {
    contacts?: ProfileData[];
    isLoading: boolean;
    onBack: () => void;
    handleNewChatContactSelection: (userId: string) => void;
}

export default function NewChat({ contacts, isLoading, onBack, handleNewChatContactSelection }: NewChatProps) {
    const { profileQuery } = useGetProfile();
    const currentUserId = profileQuery?.data?.data?.id;
    const [search, setSearch] = useState("");
    const filteredContacts = contacts?.filter((contact) =>
        `${contact.name} ${contact.email ?? ""}`.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <section className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card shadow-soft">
            <header className="flex shrink-0 flex-col gap-4 border-b p-4">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={onBack}
                        aria-label="Back to chats"
                        title="Back to chats"
                    >
                        <ArrowLeft className="size-5" />
                    </Button>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <UserRoundPlus className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-xl font-semibold text-foreground">New message</h2>
                        <p className="text-sm text-muted-foreground">Choose someone to message</p>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search people..."
                        aria-label="Search contacts"
                        className="h-10 border-none bg-muted/50 pl-9 focus-visible:ring-1"
                    />
                </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                {isLoading ? (
                    <div className="flex flex-col gap-2 p-2">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="flex items-center gap-3 p-2">
                                <Skeleton className="size-11 rounded-full" />
                                <div className="flex flex-1 flex-col gap-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredContacts && filteredContacts.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        {filteredContacts.map((contact) => {
                            const initials = contact.name
                                .trim()
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase();

                            return (
                                <div
                                    key={contact.id}
                                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                                    onClick={() => handleNewChatContactSelection(contact.id.toString())}
                                >
                                    <Avatar className="size-11 border border-border/50 shadow-sm">
                                        <AvatarImage src={contact.profile_image} alt={contact.name} />
                                        <AvatarFallback>{initials || "?"}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-foreground">{currentUserId === contact.id ? "You" : contact.name}</p>
                                        {contact.email && (
                                            <p className="truncate text-sm text-muted-foreground">{contact.email}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex h-full min-h-40 flex-col items-center justify-center p-4 text-center text-muted-foreground">
                        <UserRoundPlus className="mb-3 size-8 opacity-50" />
                        <p className="font-medium text-foreground">
                            {search ? "No matching contacts" : "No contacts found"}
                        </p>
                        <p className="mt-1 text-sm">
                            {search ? "Try a different name or email." : "Your contacts will appear here."}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}