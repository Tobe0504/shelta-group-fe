"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"
import { useMe } from "@/hooks/use-auth"
import { useAppendMessage } from "@/hooks/use-conversations"
import { useRealtimeEvent } from "@/hooks/use-realtime"
import { keys } from "@/lib/query-keys"
import { getSocket } from "@/lib/realtime"
import type { AppNotification, ChatMessage, Conversation } from "@/lib/types"

/** Opens the live connection while someone is signed in, and turns notifications into toasts and fresh data. */
export function RealtimeBridge() {
  const { data: me } = useMe()
  const client = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    const socket = getSocket()
    if (me) socket.connect()
    else socket.disconnect()
  }, [me])

  const append = useAppendMessage()
  const params = useParams<{ id?: string }>()
  useRealtimeEvent<{ conversation: Conversation; message: ChatMessage }>("message", (payload) => {
    append(payload)
    const open = params.id === payload.conversation.id
    // A message from someone else, in a thread that isn't on screen: a quiet heads-up.
    if (!open && payload.message.sender !== me?.id && !(me?.role === "admin" && payload.message.fromSupport))
      toast(`${payload.message.fromSupport ? "SheltaMart support" : payload.conversation.counterpart.name}`, {
        description: payload.message.body.slice(0, 120),
        action: { label: "Open", onClick: () => router.push(`/messages/${payload.conversation.id}`) },
      })
  })

  useRealtimeEvent<AppNotification>("notification", (n) => {
    client.invalidateQueries({ queryKey: keys.notifications })
    // Whatever it's about has changed; refresh the lists it could appear in.
    const stale = { job: [keys.pro.all], quote: [keys.jobs], hired: [keys.pro.all], payment: [keys.pro.all], payout: [keys.pro.all, keys.seller.all], order: [keys.seller.all], message: [], system: [] }[n.kind]
    stale.forEach((queryKey) => client.invalidateQueries({ queryKey }))
    toast(n.title, { description: n.body, action: n.href ? { label: "View", onClick: () => router.push(n.href!) } : undefined })
  })
  return null
}
