import { queryKeys } from "@/constants/query-keys"
import { getSelectUserListing } from "@/services/user"
import { useQuery } from "@tanstack/react-query"
export function useParticipantQuery(role: string[] = []) {
    const participantsQuery = useQuery({
    queryKey: [queryKeys.selectUserListing],
    queryFn: () => getSelectUserListing(["projectManager", "member", "client", ...role]),
  });
  return {participantsQuery}
}