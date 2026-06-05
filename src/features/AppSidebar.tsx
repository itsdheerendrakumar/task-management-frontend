import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { useGetProfile } from "@/hooks/useGetProfile";
import { userRoutes } from "@/constants/sidebar-item";
import { Link, useRouter } from "@tanstack/react-router";
import type { ComponentType } from "react";
import {
    Activity,
    Bell,
    ClipboardList,
    Home,
    LayoutDashboard,
    MessageCircle,
    Settings,
    User,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";

const routeIcons: Record<string, ComponentType<{ className?: string }>> = {
    "/dashboard": Home,
    "/messages": MessageCircle,
    "/notifications": Bell,
    "/settings": Settings,
    "/tasks": ClipboardList,
    "/kanban": LayoutDashboard,
    "/activity": Activity,
    "/users": User,
};

export function AppSidebar() {
    const { profileQuery } = useGetProfile();
    const router = useRouter();

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: async () => {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            await router.navigate({ to: '/login' });
        },
        onError: (error) => {
            console.error('Logout failed:', error);
        },
    });

    const handleLogout = async () => {
        await logoutMutation.mutateAsync();
    };

    return (
        <Sidebar
            style={{
                backgroundColor: "var(--color-sidebar)",
                color: "var(--color-sidebar-foreground)",
                borderColor: "var(--color-sidebar-border)",
            }}
            className="border-r"
        >
            <SidebarHeader
                className="space-y-2 px-4 py-5 text-center bg-white"
            >
                <span className="text-sm font-medium">Welcome back</span>
            </SidebarHeader>
            <SidebarContent className="space-y-2 px-4 py-4">
                {userRoutes.map((routes) => {
                    if (routes.allowedRoles === "all" || routes.allowedRoles.includes(profileQuery.data?.data?.role as string)) {
                        const Icon = routeIcons[routes.route] || Home;
                        return (
                            <Link
                                key={routes.route}
                                to={routes.route}
                                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar-accent-foreground)] hover:bg-[var(--color-sidebar-primary)] hover:text-[var(--color-sidebar-primary-foreground)]"
                                style={{
                                    color: "var(--color-sidebar-accent-foreground)",
                                    backgroundColor: "var(--color-sidebar-accent)",
                                }}
                            >
                                <Icon className="h-4 w-4" />
                                {routes.label}
                            </Link>
                        )
                    }
                })}
            </SidebarContent>
            <SidebarFooter className="px-4 py-4">
                <Button
                    onClick={handleLogout}
                    disabled={logoutMutation?.isPending}
                    variant="destructive"
                    className="w-full flex items-center gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    {logoutMutation?.isPending ? 'Logging out...' : 'Logout'}
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}