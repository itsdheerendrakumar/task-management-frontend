import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { useGetProfile } from "@/hooks/useGetProfile";

export function AppSidebar() {
    const { profileQuery } = useGetProfile();
    return (
        <Sidebar>
            <SidebarHeader>
                Welcome back
                <h2 className="text-lg font-semibold">{profileQuery.data?.data?.name} ({profileQuery.data?.data?.role})</h2>
            </SidebarHeader>
            <SidebarContent>
            </SidebarContent>
        </Sidebar>
    )
}