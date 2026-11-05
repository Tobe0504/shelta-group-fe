import type { Metadata } from "next"
import { ConsoleShell } from "@/components/console-shell"
import { SellerSidebar } from "@/components/seller-sidebar"

export const metadata: Metadata = { title: { default: "Seller centre", template: "%s · Seller centre" } }

export default function SellerLayout({ children }: LayoutProps<"/seller">) {
  return (
    <ConsoleShell title="Seller centre" role="seller" sidebar={<SellerSidebar />}>
      {children}
    </ConsoleShell>
  )
}
