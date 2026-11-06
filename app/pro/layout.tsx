import type { Metadata } from "next"
import { ConsoleShell } from "@/components/console-shell"
import { ProSidebar } from "@/components/pro-sidebar"

export const metadata: Metadata = { title: { default: "Pro centre", template: "%s · Pro centre" } }

/** Any signed-in account can offer services, so there's no role gate. */
export default function ProLayout({ children }: LayoutProps<"/pro">) {
  return (
    <ConsoleShell title="Pro centre" sidebar={<ProSidebar />}>
      {children}
    </ConsoleShell>
  )
}
