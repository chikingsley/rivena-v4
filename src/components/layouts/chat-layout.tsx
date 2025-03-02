import { Outlet } from "react-router"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ChatLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
