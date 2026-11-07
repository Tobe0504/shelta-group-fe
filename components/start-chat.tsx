"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMe } from "@/hooks/use-auth"
import { useStartChat } from "@/hooks/use-conversations"
import type { ChatTarget } from "@/lib/types"
import { useNavigate } from "./navigation-progress"

/**
 * Opens a chat with a store, a pro or SheltaMart support. The first message starts (or continues)
 * the conversation, then the buyer lands in it. Signed-out visitors are sent to sign in first.
 */
export function StartChat({
  to,
  title,
  description,
  subject,
  about,
  placeholder = "Write your message",
  children,
}: {
  to: ChatTarget
  title: string
  description?: string
  subject?: string
  about?: { label: string; href: string }
  placeholder?: string
  children: React.ReactNode
}) {
  const { data: me } = useMe()
  const router = useRouter()
  const path = usePathname()
  const { navigate, pending } = useNavigate()
  const start = useStartChat()
  const [open, setOpen] = useState(false)

  if (!me)
    return (
      <span
        onClickCapture={(e) => {
          e.preventDefault()
          toast("Sign in to send messages")
          router.push(`/login?next=${encodeURIComponent(path)}`)
        }}
      >
        {children}
      </span>
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const body = String(new FormData(e.currentTarget).get("body") ?? "").trim()
            if (!body) return
            start.mutate({ ...to, subject, about, body }, { onSuccess: ({ conversation }) => navigate(`/messages/${conversation.id}`) })
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="chat-body">Message</Label>
            <Textarea id="chat-body" name="body" required maxLength={4000} placeholder={placeholder} className="min-h-28" autoFocus />
          </div>
          <DialogFooter>
            <Button type="submit" loading={start.isPending || pending}>
              Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
