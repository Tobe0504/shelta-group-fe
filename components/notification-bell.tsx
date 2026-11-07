"use client"

import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMe } from "@/hooks/use-auth"
import { useMarkNotificationsRead, useNotifications } from "@/hooks/use-notifications"
import { timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Bell with an unread count; the menu lists recent notifications. Hidden when signed out.
 * `align="start"` opens the menu rightwards, for a bell near the left edge (the console sidebar).
 */
export function NotificationBell({ className, align = "end" }: { className?: string; align?: "start" | "end" }) {
  const { data: me } = useMe()
  const { data } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const router = useRouter()
  if (!me) return null
  const unread = data?.unread ?? 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} className={cn("relative max-sm:size-9", className)}>
          <Bell aria-hidden />
          {unread > 0 && (
            <span aria-hidden className="absolute -top-0.5 -right-0.5 grid min-w-4.5 place-items-center rounded-full bg-deal px-1 text-[10px] leading-4.5 font-semibold text-deal-foreground tabular-nums">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} collisionPadding={12} className="w-80 max-sm:w-[calc(100vw-1.5rem)]">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unread > 0 && (
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => markRead.mutate(undefined)}>
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {data?.items.length ? (
            data.items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-0.5 rounded-lg py-2"
                onSelect={() => {
                  if (!n.read) markRead.mutate([n.id])
                  if (n.href) router.push(n.href)
                }}
              >
                <span className="flex w-full items-start gap-2">
                  {!n.read && <span aria-label="Unread" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                  <span className={cn("flex-1 text-sm leading-snug", !n.read && "font-semibold")}>{n.title}</span>
                </span>
                {n.body && <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>}
                <span className="text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">Nothing yet. New jobs, quotes, orders and payments show up here.</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
