import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetProfile } from "@/hooks/useGetProfile";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

export function Header() {
    const { profileQuery } = useGetProfile();
    return (
        <header className="border-b border-gray-200 bg-white h-16 flex justify-between items-center pl-2 pr-6 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex items-center justify-between">
                <Avatar>
                    <AvatarImage
                        src={profileQuery.data?.data?.profile_image || ""}
                        alt="@shadcn"
                        className="grayscale"
                    />
                    <AvatarFallback>
                        {profileQuery.data?.data?.name?.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm font-medium">{profileQuery.data?.data?.name}</span>
            </div>
        </header>
    )
}