import { getProfile } from '@/services/user'
import { queryKeys } from '@/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export function useGetProfile() {
    const profileQuery = useQuery({
        queryKey: [queryKeys.profile],
        queryFn: () => getProfile(),
    })
    return {profileQuery};
}