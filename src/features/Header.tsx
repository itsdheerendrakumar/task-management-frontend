import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
    return (
        <header className="border-b border-gray-200 bg-white h-16 flex items-center pl-2 pr-6">
                <SidebarTrigger />
            <div className="flex items-center justify-between w-full">
                <h1 className="text-xl font-semibold text-gray-900">Task Management</h1>
            </div>
        </header>
    )
}