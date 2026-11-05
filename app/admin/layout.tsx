import type { Metadata } from "next"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ConsoleShell } from "@/components/console-shell"

export const metadata: Metadata = { title: { default: "Admin console", template: "%s · Admin" }, robots: { index: false } }

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <ConsoleShell title="Admin console" role="admin" sidebar={<AdminSidebar />}>
      {children}
    </ConsoleShell>
  )
}
