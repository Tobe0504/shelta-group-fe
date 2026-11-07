"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, CheckCircle2, Headset, RotateCcw, SendHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useQueryClient } from "@tanstack/react-query"
import { useMe } from "@/hooks/use-auth"
import { keys } from "@/lib/query-keys"
import { useConversations, useSendMessage, useSetChatStatus, useThread } from "@/hooks/use-conversations"
import { formatDay, timeAgo } from "@/lib/format"
import type { ChatMessage, Conversation } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { ChatScope } from "@/services/conversations.service"
import { EmptyState } from "./empty-state"
import { ListSkeleton } from "./skeletons"
import { UserAvatar } from "./user-avatar"

const kindLabel = { store: "Seller", pro: "Pro", support: "Help desk" } as const

function Avatar({ c, className }: { c: Conversation; className?: string }) {
  if (c.kind === "support" && c.counterpart.name === "SheltaMart support")
    return (
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full bg-accent text-primary", className)}>
        <Headset aria-hidden className="size-5" />
      </span>
    )
  return <UserAvatar user={{ name: c.counterpart.name, avatar: c.counterpart.avatar }} className={cn("size-10 shrink-0", className)} />
}

/** Every thread, newest first, with an unread dot. */
function ConversationList({ scope, base, activeId }: { scope: ChatScope; base: string; activeId?: string }) {
  const { data, isPending, isError } = useConversations(scope)
  if (isPending) return <ListSkeleton rows={5} className="h-16 rounded-2xl" />
  if (isError) return <EmptyState>We couldn’t load your messages. Refresh to try again.</EmptyState>
  if (!data.length)
    return (
      <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
        {scope === "support" ? "No help requests yet." : "No messages yet. Chat with a seller from a product or order, or with a pro from their profile or your job."}
      </p>
    )
  return (
    <ul aria-label="Conversations" className="flex flex-col gap-1">
      {data.map((c) => (
        <li key={c.id}>
          <Link
            href={`${base}/${c.id}`}
            aria-current={c.id === activeId ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-muted max-sm:gap-2.5 max-sm:p-2", c.id === activeId && "bg-accent hover:bg-accent")}
          >
            <Avatar c={c} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-2">
                <span className={cn("flex-1 truncate text-sm", c.unread ? "font-semibold" : "font-medium")}>{c.counterpart.name}</span>
                {c.last?.at && <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(c.last.at)}</span>}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {kindLabel[c.kind]} · {c.subject}
              </span>
              <span className={cn("truncate text-xs", c.unread ? "text-foreground" : "text-muted-foreground")}>{c.last?.body}</span>
            </span>
            {c.unread && <span aria-label="Unread" className="size-2.5 shrink-0 rounded-full bg-primary" />}
            {c.kind === "support" && c.status === "resolved" && <Badge variant="secondary">Resolved</Badge>}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Bubble({ m, mine, showDay }: { m: ChatMessage; mine: boolean; showDay: boolean }) {
  return (
    <>
      {showDay && <li className="my-2 text-center text-[11px] font-medium text-muted-foreground">{formatDay(m.createdAt)}</li>}
      <li className={cn("flex", mine ? "justify-end" : "justify-start")}>
        <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line max-sm:text-[13px]", mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted")}>
          {m.fromSupport && !mine && <span className="mb-0.5 block text-[11px] font-semibold text-primary">SheltaMart support</span>}
          {m.body}
          <span className={cn("mt-0.5 block text-right text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {new Date(m.createdAt).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      </li>
    </>
  )
}

/** One thread: header, messages (newest at the bottom) and a reply box. Enter sends; Shift+Enter adds a line. */
export function ChatThread({ id, base, team }: { id: string; base: string; team?: boolean }) {
  const { data: me } = useMe()
  const { data, isPending, isError, refetch } = useThread(id)
  const client = useQueryClient()
  const send = useSendMessage(id)
  const status = useSetChatStatus(id)
  const [text, setText] = useState("")
  const end = useRef<HTMLLIElement>(null)
  const count = data?.messages.length ?? 0

  const last = data?.messages.at(-1)
  const theirs = !!last && (team ? !last.fromSupport : last.sender !== me?.id)
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" })
  }, [count])
  // A reply that arrives while the thread is open counts as read: re-reading the thread marks it so.
  // (Opening the thread already marked everything before it.)
  const seen = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!last) return
    if (seen.current && seen.current !== last.id && theirs) void refetch().then(() => client.invalidateQueries({ queryKey: keys.unreadChats }))
    seen.current = last.id
  }, [last, theirs, refetch, client])

  if (isPending) return <ListSkeleton rows={4} className="h-14 rounded-2xl" />
  if (isError || !data) return <EmptyState action={{ href: base, label: "Back to messages" }}>We couldn’t open this conversation.</EmptyState>
  const { conversation: c, messages } = data
  // On the help desk, the team's replies are "mine" whichever admin sent them.
  const isMine = (m: ChatMessage) => (team ? m.fromSupport : m.sender === me?.id)
  const submit = () => {
    const body = text.trim()
    if (!body) return
    send.mutate(body, { onSuccess: () => setText("") })
  }

  return (
    <section aria-label={`Conversation with ${c.counterpart.name}`} className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b pb-3 max-sm:gap-2 max-sm:pb-2">
        <Button asChild variant="ghost" size="icon" className="lg:hidden" aria-label="Back to conversations">
          <Link href={base}>
            <ArrowLeft aria-hidden />
          </Link>
        </Button>
        <Avatar c={c} className="max-sm:size-9" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="truncate text-base font-semibold max-sm:text-sm">{c.counterpart.href ? <Link href={c.counterpart.href} className="hover:text-primary">{c.counterpart.name}</Link> : c.counterpart.name}</h2>
          <p className="truncate text-xs text-muted-foreground">
            {kindLabel[c.kind]} · {c.subject}
            {c.about?.href && (
              <>
                {" · "}
                <Link href={c.about.href} className="text-primary hover:underline">
                  {c.about.label}
                </Link>
              </>
            )}
          </p>
        </div>
        {c.kind === "support" &&
          (c.status === "open" ? (
            <Button size="sm" variant="secondary" loading={status.isPending} onClick={() => status.mutate("resolved")}>
              <CheckCircle2 aria-hidden /> <span className="max-sm:hidden">Mark resolved</span>
            </Button>
          ) : (
            <Button size="sm" variant="ghost" loading={status.isPending} onClick={() => status.mutate("open")}>
              <RotateCcw aria-hidden /> <span className="max-sm:hidden">Reopen</span>
            </Button>
          ))}
      </header>
      <ol aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto py-4 max-sm:py-3">
        {messages.map((m, i) => (
          <Bubble key={m.id} m={m} mine={isMine(m)} showDay={i === 0 || formatDay(m.createdAt) !== formatDay(messages[i - 1].createdAt)} />
        ))}
        <li ref={end} aria-hidden />
      </ol>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="flex items-end gap-2 border-t pt-3 max-sm:pt-2"
      >
        <Textarea
          aria-label="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={c.kind === "support" && team ? "Reply as SheltaMart support" : "Write a message"}
          maxLength={4000}
          className="max-h-40 min-h-11 flex-1 resize-none max-sm:min-h-10"
        />
        <Button type="submit" size="icon" aria-label="Send" loading={send.isPending} disabled={!text.trim()}>
          {!send.isPending && <SendHorizontal aria-hidden />}
        </Button>
      </form>
    </section>
  )
}

/**
 * Inbox: conversation list and the open thread side by side on large screens.
 * On phones the list and the thread are separate pages.
 * It fills the rest of the screen: any page containing it is locked to the viewport height (see the root and console layouts).
 */
export function ChatInbox({ base, scope = "mine", activeId, team }: { base: string; scope?: ChatScope; activeId?: string; team?: boolean }) {
  return (
    <div data-fill-height className="grid min-h-80 flex-1 grid-cols-1 gap-4 rounded-3xl p-4 ring-1 ring-border max-sm:rounded-2xl max-sm:p-2.5 lg:grid-cols-[320px_1fr]">
      <div className={cn("min-h-0 min-w-0 overflow-y-auto", activeId && "max-lg:hidden")}>
        <ConversationList scope={scope} base={base} activeId={activeId} />
      </div>
      <div className={cn("min-h-0 min-w-0", !activeId && "max-lg:hidden")}>
        {activeId ? <ChatThread id={activeId} base={base} team={team} /> : <p className="grid h-full place-items-center text-sm text-muted-foreground">Choose a conversation.</p>}
      </div>
    </div>
  )
}
