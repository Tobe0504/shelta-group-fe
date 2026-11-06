"use client"

import { BriefcaseBusiness, Inbox, UserRound, Wallet } from "lucide-react"
import { useLeads, useOwnPro } from "@/hooks/use-services"
import { ConsoleSidebar } from "./console-sidebar"

const nav = [
  { href: "/pro", label: "Job leads", icon: Inbox },
  { href: "/pro/jobs", label: "My quotes", icon: BriefcaseBusiness },
  { href: "/pro/payouts", label: "Payouts", icon: Wallet },
  { href: "/pro/profile", label: "Pro profile", icon: UserRound },
]

export function ProSidebar() {
  const pro = useOwnPro().data
  const leads = useLeads(!!pro).data
  return <ConsoleSidebar title="Pro centre" nav={nav} badges={{ "/pro": leads?.length ?? 0 }} subtitle={pro?.headline ?? "Set up your pro profile"} />
}
