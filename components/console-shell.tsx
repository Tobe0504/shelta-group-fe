import { Suspense } from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type { Role } from "@/lib/types"
import { NotificationBell } from "./notification-bell"
import { RequireAuth } from "./require-auth"
import { ListSkeleton } from "./skeletons"

/** Layout for the seller centre, pro centre and admin console: sidebar, mobile header, centred content, sign-in (and role) gate. */
export function ConsoleShell({ title, role, sidebar, children }: { title: string; role?: Role; sidebar: React.ReactNode; children: React.ReactNode }) {
  return (
    <SidebarProvider className="has-[[data-fill-height]]:h-svh">
      {sidebar}
      <SidebarInset className="min-h-0 min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <SidebarTrigger className="size-11" />
          <span className="flex-1 font-semibold">{title}</span>
          <NotificationBell />
        </header>
        <main id="main" className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-6 p-4 max-sm:gap-3 max-sm:p-3 sm:p-8">
          <Suspense fallback={<ListSkeleton rows={3} />}>
            <RequireAuth role={role} fallback={<ListSkeleton rows={3} />}>
              {children}
            </RequireAuth>
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
