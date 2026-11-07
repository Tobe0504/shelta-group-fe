"use client"

import Link from "next/link"
import { useState } from "react"
import { Archive, Inbox, MessageCircle, MessagesSquare, Phone, Reply } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatDay, whatsappLink } from "@/lib/format"
import type { AdminEnquiry } from "@/lib/types"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"
import { ListSkeleton } from "./skeletons"
import { StatusFilter, type StatusOption } from "./status-filter"

type Enquiry = AdminEnquiry
type Status = Enquiry["status"]
type Filter = "all" | Status
type SetStatus = { mutate: (v: { id: string; status: Status }, o?: { onSuccess?: () => void }) => void; isPending: boolean }

const stages: Omit<StatusOption<Filter>, "count">[] = [
  { value: "new", label: "New", icon: Inbox, tone: "peach" },
  { value: "replied", label: "Replied", icon: Reply, tone: "mint" },
  { value: "closed", label: "Closed", icon: Archive, tone: "slate" },
  { value: "all", label: "All messages", icon: MessagesSquare, tone: "blue" },
]

const badge: Record<Enquiry["status"], { label: string; variant: "deal-soft" | "success" | "secondary" }> = {
  new: { label: "New", variant: "deal-soft" },
  replied: { label: "Replied", variant: "success" },
  closed: { label: "Closed", variant: "secondary" },
}

function MessageCard({ enquiry, setStatus }: { enquiry: Enquiry; setStatus: SetStatus }) {
  const mark = (status: Status, message: string) => setStatus.mutate({ id: enquiry.id, status }, { onSuccess: () => toast.success(message) })
  const subject = enquiry.product ?? enquiry.estate
  const href = enquiry.product ? `/product/${enquiry.product.slug}` : `/real-estate`
  const greeting = `Hi ${enquiry.name.split(" ")[0]}, thanks for your message about ${subject?.name ?? "your enquiry"} on SheltaMart.`

  return (
    <Card className="gap-4 px-5 py-5 max-sm:gap-2.5 max-sm:p-3 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg max-sm:text-base">{enquiry.name}</h2>
          <p className="text-sm text-muted-foreground">
            {formatDay(enquiry.createdAt)}
            {subject && (
              <>
                {" · about "}
                <Link href={href} className="text-primary hover:underline">
                  {subject.name}
                </Link>
              </>
            )}
          </p>
        </div>
        <Badge variant={badge[enquiry.status].variant}>{badge[enquiry.status].label}</Badge>
      </div>
      {enquiry.reason && <p className="w-fit rounded-full bg-muted px-3 py-1 text-sm">{enquiry.reason}</p>}
      <p className="whitespace-pre-line">{enquiry.message}</p>
      <div className="flex flex-wrap gap-2.5">
        <Button asChild>
          <a href={whatsappLink(enquiry.phone, greeting)} target="_blank" rel="noreferrer" onClick={() => enquiry.status === "new" && mark("replied", "Marked as replied")}>
            <MessageCircle aria-hidden /> Reply on WhatsApp
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href={`tel:${enquiry.phone}`}>
            <Phone aria-hidden /> Call {enquiry.phone}
          </a>
        </Button>
        {enquiry.status === "new" && (
          <Button variant="ghost" loading={setStatus.isPending} onClick={() => mark("replied", "Marked as replied")}>
            Mark as replied
          </Button>
        )}
        {enquiry.status !== "closed" ? (
          <Button variant="ghost" className="text-muted-foreground" loading={setStatus.isPending} onClick={() => mark("closed", "Message closed")}>
            Close
          </Button>
        ) : (
          <Button variant="ghost" loading={setStatus.isPending} onClick={() => mark("new", "Moved back to new")}>
            Reopen
          </Button>
        )}
      </div>
    </Card>
  )
}

/** Filterable list of buyer enquiries with reply and status actions. Used by sellers and admins. */
export function EnquiryInbox({
  title,
  description,
  query,
  setStatus,
}: {
  title: string
  description: string
  query: { data?: { data: Enquiry[] }; isPending: boolean; isError: boolean }
  setStatus: SetStatus
}) {
  const [filter, setFilter] = useState<Filter>("new")
  const all = query.data?.data ?? []
  const matches = (f: Filter, e: Enquiry) => f === "all" || e.status === f
  const shown = all.filter((e) => matches(filter, e))
  const options = stages.map((o) => ({ ...o, count: all.filter((e) => matches(o.value, e)).length }))

  return (
    <>
      {title && <PageHeader title={title} description={description} />}
      <StatusFilter label="Filter messages" options={options} value={filter} onChange={setFilter} />
      {query.isPending ? (
        <ListSkeleton rows={3} className="h-44" />
      ) : query.isError ? (
        <EmptyState>We couldn’t load these messages. Refresh to try again.</EmptyState>
      ) : shown.length ? (
        <ul className="flex flex-col gap-4">
          {shown.map((e) => (
            <li key={e.id}>
              <MessageCard enquiry={e} setStatus={setStatus} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>{filter === "new" ? "You’re all caught up." : "Nothing here."}</EmptyState>
      )}
    </>
  )
}
