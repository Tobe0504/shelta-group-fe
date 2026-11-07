"use client"

import { BriefcaseBusiness, Inbox, MessagesSquare, UserRound, Wallet } from "lucide-react"
import { useUnreadChats } from "@/hooks/use-conversations"
import { useLeads, useOwnPro } from "@/hooks/use-services"
import { ConsoleSidebar } from "./console-sidebar"

const nav = [
  { href: "/pro", label: "Job leads", icon: Inbox },
  { href: "/pro/jobs", label: "My quotes", icon: BriefcaseBusiness },
  { href: "/pro/messages", label: "Messages", icon: MessagesSquare },
  { href: "/pro/payouts", label: "Payouts", icon: Wallet },
  { href: "/pro/profile", label: "Pro profile", icon: UserRound },
]

export function ProSidebar() {
  const pro = useOwnPro().data
  const leads = useLeads(!!pro).data
  const chats = useUnreadChats().data?.mine ?? 0
  return <ConsoleSidebar title="Pro centre" nav={nav} badges={{ "/pro": leads?.length ?? 0, "/pro/messages": chats }} subtitle={pro?.headline ?? "Set up your pro profile"} />
}
