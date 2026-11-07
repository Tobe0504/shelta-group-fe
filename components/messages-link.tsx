"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMe } from "@/hooks/use-auth"
import { useUnreadChats } from "@/hooks/use-conversations"

/** Header shortcut to the inbox, with the number of conversations that have something new. */
export function MessagesLink() {
  const { data: me } = useMe()
  const unread = useUnreadChats().data?.mine ?? 0
  if (!me) return null
  return (
    <Button asChild variant="secondary" size="icon" className="relative max-sm:size-9">
      <Link href="/messages" aria-label={unread ? `Messages, ${unread} unread` : "Messages"}>
        <MessageCircle aria-hidden />
        {unread > 0 && (
          <span aria-hidden className="absolute -top-0.5 -right-0.5 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4.5 font-semibold text-primary-foreground tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </Button>
  )
}
