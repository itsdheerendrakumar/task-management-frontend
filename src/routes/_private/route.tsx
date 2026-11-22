import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from '@/features/AppSidebar'
import { Header } from '@/features/Header'
import { useGetProfile } from '@/hooks/useGetProfile'
import { FullPageLoader } from '@/features/Loader'

export const Route = createFileRoute('/_private')({
  component: RouteComponent,
})

function RouteComponent() {
  const { profileQuery } = useGetProfile();

  if(profileQuery?.isLoading) return <FullPageLoader />
  
  return (
    <>
      {profileQuery?.isSuccess &&
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Header />
            <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto min-w-0">
              <Outlet />
            </main>
          </div>
        </SidebarProvider>}
    </>
  )
}
