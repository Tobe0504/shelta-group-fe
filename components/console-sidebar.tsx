"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { Store, type LucideIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useMe } from "@/hooks/use-auth"
import { Logo } from "./logo"
import { UserAvatar } from "./user-avatar"

export type ConsoleNavItem = { href: string; label: string; icon: LucideIcon }

type Props = {
  title: string
  nav: ConsoleNavItem[]
  /** Counts of items waiting, keyed by nav href. */
  badges?: Record<string, number>
  /** Second line under the user's name. */
  subtitle?: string
}

function NavList({ nav, badges = {}, active }: Pick<Props, "nav" | "badges"> & { active: string }) {
  return (
    <SidebarMenu>
      {nav.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton asChild isActive={active === href} size="lg">
            <Link href={href}>
              <Icon aria-hidden /> {label}
            </Link>
          </SidebarMenuButton>
          {(badges[href] ?? 0) > 0 && <SidebarMenuBadge className="bg-deal text-deal-foreground">{badges[href]}</SidebarMenuBadge>}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

/** Reads the URL, so it renders inside Suspense with an un-highlighted fallback. */
function ActiveNav(props: Pick<Props, "nav" | "badges">) {
  return <NavList {...props} active={usePathname()} />
}

/** Sidebar shared by the seller centre and the admin console. */
export function ConsoleSidebar({ title, nav, badges, subtitle }: Props) {
  const { data: user } = useMe()
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Logo />
        <p className="pl-1 text-xs text-muted-foreground">{title}</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Suspense fallback={<NavList nav={nav} badges={badges} active="" />}>
              <ActiveNav nav={nav} badges={badges} />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <Store aria-hidden /> View marketplace
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {user && (
          <Link href="/account/profile" className="flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-accent">
            <UserAvatar user={user} />
            <span className="flex min-w-0 flex-col text-sm">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-muted-foreground">{subtitle}</span>
            </span>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
