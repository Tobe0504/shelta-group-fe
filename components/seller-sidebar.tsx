"use client"

import { LayoutDashboard, MessagesSquare, Package, PackagePlus, Settings, ShoppingBag } from "lucide-react"
import { useUnreadChats } from "@/hooks/use-conversations"
import { useOwnStore, useSellerEnquiries, useSellerOrders } from "@/hooks/use-seller"
import { ConsoleSidebar } from "./console-sidebar"

const nav = [
  { href: "/seller", label: "Overview", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/products/new", label: "Add product", icon: PackagePlus },
  { href: "/seller/orders", label: "Orders", icon: ShoppingBag },
  { href: "/seller/messages", label: "Messages", icon: MessagesSquare },
  { href: "/seller/settings", label: "Store settings", icon: Settings },
]

export function SellerSidebar() {
  const orders = useSellerOrders().data
  const enquiries = useSellerEnquiries().data
  const store = useOwnStore().data
  const chats = useUnreadChats().data?.mine
  const badges = {
    "/seller/orders": orders?.data.flatMap((o) => o.shipments).filter((s) => s.status === "placed").length ?? 0,
    "/seller/messages": (enquiries?.data.filter((e) => e.status === "new").length ?? 0) + (chats ?? 0),
  }
  return <ConsoleSidebar title="Seller centre" nav={nav} badges={badges} subtitle={store?.name ?? "Seller account"} />
}
