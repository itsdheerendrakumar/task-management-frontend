import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers } from "@/services/user";
import { updateGroup } from "@/services/message";
import { queryKeys } from "@/constants/query-keys";
import type { ChatListing } from "@/services/message/types";
import { toast } from "sonner";
import { Users, UserPlus, Shield } from "lucide-react";

interface EditGroupDialogProps {
  chat: ChatListing;
  isOpen: boolean;
  onClose: () => void;
}

export function EditGroupDialog({ chat, isOpen, onClose }: EditGroupDialogProps) {
  const [name, setName] = useState(chat.name || "");
  const [selectedParticipants, setSelectedParticipants] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      setName(chat.name || "");
      setSelectedParticipants([]);
    }
  }, [isOpen, chat]);

  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: [queryKeys.userListing],
    queryFn: getUsers,
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: updateGroup,
    onSuccess: () => {
      toast.success("Group updated successfully");
      queryClient.invalidateQueries({ queryKey: [queryKeys.messageListing] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to update group");
    },
  });

  // Filter out existing participants
  const existingParticipantIds = new Set(chat.participants?.map((p) => p.id) || []);
  const createdBy = chat.created_by;
  if (createdBy) {
    existingParticipantIds.add(createdBy);
  }

  const userOptions =
    usersQuery.data?.data
      ?.filter((user) => !existingParticipantIds.has(user.id))
      .map((user) => ({
        value: user.id,
        label: user.name,
      })) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    const newParticipants = Array.from(
      new Set(selectedParticipants.map((p) => p.value))
    );

    mutation.mutate({
      chat_id: chat._id,
      name,
      chatParticipants: newParticipants,
    });
  };

  const participantsList = chat.participants || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-card p-6 shadow-xl border border-border">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader className="gap-1.5 text-left">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                Edit Group
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Update group name and invite new team members.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Group Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="group-name" className="text-xs font-semibold text-foreground">
                Group Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design Team"
                className="h-10 rounded-lg border-border bg-background px-3 text-sm focus-visible:ring-primary"
              />
            </div>

            {/* Current Participants */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Current Members
                </label>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {participantsList.length} {participantsList.length === 1 ? "member" : "members"}
                </span>
              </div>
              <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-2.5">
                {participantsList.length > 0 ? (
                  participantsList.map((p) => {
                    const isAdmin = createdBy === p.id;
                    const initials = p.name ? p.name.substring(0, 2).toUpperCase() : "U";
                    return (
                      <div
                        key={p.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-xs"
                      >
                        <span className="flex size-4 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
                          {initials}
                        </span>
                        <span>{p.name}</span>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 px-1 py-0.2 text-[9px] font-semibold text-amber-600">
                            <Shield className="size-2.5" /> Admin
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">No current members listed</span>
                )}
              </div>
            </div>

            {/* Add New Participants */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <UserPlus className="size-3.5 text-primary" />
                <label className="text-xs font-semibold text-foreground">
                  Add New Members
                </label>
              </div>
              <Select
                isMulti
                options={userOptions}
                value={selectedParticipants}
                onChange={(newValue) =>
                  setSelectedParticipants(Array.isArray(newValue) ? [...newValue] : [])
                }
                placeholder={usersQuery.isLoading ? "Loading users..." : "Search users to add..."}
                noOptionsMessage={() => "No additional users available"}
                isLoading={usersQuery.isLoading}
                closeMenuOnSelect={false}
                menuPlacement="auto"
                maxMenuHeight={160}
                styles={{
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.75rem",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    padding: "4px",
                    zIndex: 60,
                  }),
                  menuList: (base) => ({
                    ...base,
                    padding: "4px",
                    maxHeight: "150px",
                  }),
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: "#ffffff",
                    borderColor: state.isFocused ? "#2563eb" : "#cbd5e1",
                    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
                    borderRadius: "0.5rem",
                    minHeight: "40px",
                    fontSize: "13px",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: state.isFocused ? "#2563eb" : "#94a3b8",
                    },
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#2563eb"
                      : state.isFocused
                      ? "#f1f5f9"
                      : "transparent",
                    color: state.isSelected ? "#ffffff" : "#102a43",
                    borderRadius: "0.375rem",
                    padding: "7px 10px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    margin: "1px 0",
                    "&:active": {
                      backgroundColor: "#e2e8f0",
                    },
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "0.375rem",
                    padding: "1px 4px",
                    margin: "2px",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#1d4ed8",
                    fontWeight: 600,
                    fontSize: "12px",
                    padding: "0 2px",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "#1d4ed8",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    ":hover": {
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#94a3b8",
                    fontSize: "13px",
                  }),
                  noOptionsMessage: (base) => ({
                    ...base,
                    color: "#64748b",
                    fontSize: "12px",
                    padding: "8px",
                  }),
                }}
              />
            </div>
          </div>

          <DialogFooter className="mt-2 flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
              className="h-9 rounded-lg px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="h-9 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

