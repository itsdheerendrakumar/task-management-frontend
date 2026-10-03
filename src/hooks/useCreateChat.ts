import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createChat } from "@/services/message";

export function useCreateChat() {
    const queryClient = useQueryClient();
    const createChatMutation = useMutation({
        mutationFn: createChat,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messageListing"] });
        }
    })
    return { createChatMutation };
}