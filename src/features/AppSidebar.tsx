import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <h2 className="text-lg font-semibold">Navigation</h2>
            </SidebarHeader>
            <SidebarContent>
            </SidebarContent>
        </Sidebar>
    )
}