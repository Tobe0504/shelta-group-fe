"use client"

import { Building2, FileText, HardHat, LayoutDashboard, Megaphone, MessagesSquare, Settings, Shapes, ShieldCheck, Store } from "lucide-react"
import { useAdminOverview } from "@/hooks/use-admin"
import { ConsoleSidebar } from "../console-sidebar"

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/quotes", label: "Quote requests", icon: FileText },
  { href: "/admin/enquiries", label: "Property enquiries", icon: MessagesSquare },
  { href: "/admin/stores", label: "Stores", icon: Store },
  { href: "/admin/pros", label: "Pros", icon: HardHat },
  { href: "/admin/escrow", label: "Escrow", icon: ShieldCheck },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/catalogue", label: "Catalogue", icon: Shapes },
  { href: "/admin/promos", label: "Promos", icon: Megaphone },
  { href: "/admin/settings", label: "Fees & delivery", icon: Settings },
]

export function AdminSidebar() {
  const o = useAdminOverview().data
  const badges = { "/admin/quotes": o?.newQuotes ?? 0, "/admin/enquiries": o?.newEnquiries ?? 0, "/admin/stores": o?.unverifiedStores ?? 0, "/admin/pros": o?.unverifiedPros ?? 0, "/admin/escrow": o?.escrow.issues ?? 0 }
  return <ConsoleSidebar title="Admin console" nav={nav} badges={badges} subtitle="SheltaMart admin" />
}
