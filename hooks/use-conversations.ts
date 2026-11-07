"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { keys } from "@/lib/query-keys"
import type { ChatMessage, Conversation, Thread } from "@/lib/types"
import { conversationsService, type ChatScope } from "@/services/conversations.service"
import { useMe } from "./use-auth"

export function useConversations(scope: ChatScope = "mine") {
  const { data: me } = useMe()
  return useQuery({ queryKey: keys.conversations(scope), queryFn: () => conversationsService.list(scope), enabled: !!me })
}

export function useUnreadChats() {
  const { data: me } = useMe()
  return useQuery({ queryKey: keys.unreadChats, queryFn: conversationsService.unread, enabled: !!me })
}

export const useThread = (id: string) => useQuery({ queryKey: keys.thread(id), queryFn: () => conversationsService.thread(id) })

/** Adds a message to a cached thread (from a send or a live event), skipping duplicates. */
export function useAppendMessage() {
  const client = useQueryClient()
  return ({ conversation, message }: { conversation: Conversation; message: ChatMessage }) => {
    client.setQueryData<Thread>(keys.thread(conversation.id), (t) =>
      t && !t.messages.some((m) => m.id === message.id) ? { conversation: { ...t.conversation, ...conversation, unread: false }, messages: [...t.messages, message] } : t,
    )
    client.invalidateQueries({ queryKey: ["chats", "list"] })
    client.invalidateQueries({ queryKey: keys.unreadChats })
  }
}

export function useSendMessage(id: string) {
  const append = useAppendMessage()
  return useMutation({ mutationFn: (body: string) => conversationsService.send(id, body), onSuccess: append })
}

export function useStartChat() {
  const client = useQueryClient()
  return useMutation({ mutationFn: conversationsService.start, onSuccess: () => client.invalidateQueries({ queryKey: keys.chats }) })
}

export function useSetChatStatus(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (status: Conversation["status"]) => conversationsService.setStatus(id, status),
    meta: { pending: "Updating…" },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.chats }),
  })
}
