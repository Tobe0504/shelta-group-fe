import { Suspense } from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type { Role } from "@/lib/types"
import { RequireAuth } from "./require-auth"
import { ListSkeleton } from "./skeletons"

/** Layout for the seller centre, pro centre and admin console: sidebar, mobile header, centred content, sign-in (and role) gate. */
export function ConsoleShell({ title, role, sidebar, children }: { title: string; role?: Role; sidebar: React.ReactNode; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <SidebarTrigger className="size-11" />
          <span className="font-semibold">{title}</span>
        </header>
        <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 max-sm:gap-3 max-sm:p-3 sm:p-8">
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
