"use client"

import Link from "next/link"
import { useState } from "react"
import { Archive, CircleCheck, FileText, Hourglass, Inbox, MessageCircle, Paperclip, Phone } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAdminQuotes, useUpdateQuote } from "@/hooks/use-admin"
import { formatDay, whatsappLink } from "@/lib/format"
import type { Quote, QuoteStatus } from "@/lib/types"
import { EmptyState } from "../empty-state"
import { PhotoGrid } from "../photo-viewer"
import { PageHeader } from "../page-header"
import { ListSkeleton } from "../skeletons"
import { StatusFilter, type StatusOption } from "../status-filter"

type Filter = "all" | QuoteStatus

const statuses: { value: QuoteStatus; label: string; variant: "deal-soft" | "accent" | "success" | "secondary" }[] = [
  { value: "new", label: "New", variant: "deal-soft" },
  { value: "in_progress", label: "Getting prices", variant: "accent" },
  { value: "quoted", label: "Quote sent", variant: "success" },
  { value: "closed", label: "Closed", variant: "secondary" },
]
export const quoteStatusOf = (s: QuoteStatus) => statuses.find((x) => x.value === s)!
const statusOf = quoteStatusOf

const stages: Omit<StatusOption<Filter>, "count">[] = [
  { value: "new", label: "New", icon: Inbox, tone: "peach" },
  { value: "in_progress", label: "Getting prices", icon: Hourglass, tone: "yellow" },
  { value: "quoted", label: "Quote sent", icon: CircleCheck, tone: "mint" },
  { value: "closed", label: "Closed", icon: Archive, tone: "slate" },
  { value: "all", label: "All requests", icon: FileText, tone: "blue" },
]

const isImage = (url: string) => /\.(jpe?g|png|webp|gif)$/i.test(url)

/** Attached files: photos open full size, documents open in a new tab. */
export function QuoteFiles({ quote }: { quote: Quote }) {
  const photos = quote.files.filter(isImage)
  const docs = quote.files.filter((f) => !isImage(f))
  return (
    <>
      <PhotoGrid images={photos} alt={`Files from ${quote.name}`} />
      {docs.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {docs.map((url, i) => (
            <li key={url}>
              <Button asChild variant="secondary" size="sm">
                <a href={url} target="_blank" rel="noreferrer">
                  <Paperclip aria-hidden /> {url.split(".").pop()?.toUpperCase()} file {docs.length > 1 ? i + 1 : ""}
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export function QuoteContact({ quote }: { quote: Quote }) {
  return (
    <div className="flex flex-wrap gap-2.5 max-sm:gap-2">
      <Button asChild>
        <a href={whatsappLink(quote.phone, `Hi ${quote.name.split(" ")[0]}, it’s SheltaMart about your quote request for ${quote.site}.`)} target="_blank" rel="noreferrer">
          <MessageCircle aria-hidden /> WhatsApp
        </a>
      </Button>
      <Button asChild variant="secondary">
        <a href={`tel:${quote.phone}`}>
          <Phone aria-hidden /> Call {quote.phone}
        </a>
      </Button>
      {quote.email && (
        <Button asChild variant="ghost">
          <a href={`mailto:${quote.email}`}>{quote.email}</a>
        </Button>
      )}
    </div>
  )
}

/** Status and the team's private notes. */
export function QuoteControls({ quote }: { quote: Quote }) {
  const update = useUpdateQuote()
  const [notes, setNotes] = useState(quote.notes ?? "")
  return (
    <form
      className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault()
        update.mutate({ id: quote.id, notes }, { onSuccess: () => toast.success("Notes saved") })
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={`status-${quote.id}`}>Status</Label>
        <Select value={quote.status} onValueChange={(v) => update.mutate({ id: quote.id, status: v as QuoteStatus }, { onSuccess: () => toast.success(`Marked “${statusOf(v as QuoteStatus).label}”`) })}>
          <SelectTrigger id={`status-${quote.id}`} disabled={update.isPending}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`notes-${quote.id}`}>Team notes</Label>
        <Textarea id={`notes-${quote.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Suppliers contacted, prices, next steps" className="min-h-11" />
      </div>
      <Button type="submit" variant="secondary" loading={update.isPending} disabled={notes === (quote.notes ?? "")}>
        Save notes
      </Button>
    </form>
  )
}

/** One request in the list: who, where, a preview of the list, and a link to the full request. */
function QuoteCard({ quote }: { quote: Quote }) {
  const status = statusOf(quote.status)
  return (
    <Card className="relative gap-3 px-5 py-5 transition-colors hover:bg-muted/40 max-sm:gap-2 max-sm:p-3 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3 max-sm:gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg max-sm:text-base">
            <Link href={`/admin/quotes/${quote.id}`} className="after:absolute after:inset-0 hover:text-primary focus-visible:underline">
              {quote.name}
            </Link>
          </h2>
          <p className="text-sm text-muted-foreground max-sm:text-xs">
            {formatDay(quote.createdAt)} · deliver to {quote.site}
            {quote.neededBy && ` · needed by ${quote.neededBy}`}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      {quote.items && <p className="line-clamp-3 rounded-2xl bg-muted p-4 text-sm whitespace-pre-line max-sm:rounded-xl max-sm:p-2.5 max-sm:text-xs">{quote.items}</p>}
      <p className="flex items-center gap-1.5 text-sm text-primary max-sm:text-xs">
        {quote.files.length > 0 && (
          <>
            <Paperclip aria-hidden className="size-3.5" /> {quote.files.length} {quote.files.length === 1 ? "file" : "files"} ·{" "}
          </>
        )}
        Open request
      </p>
    </Card>
  )
}

export function AdminQuotes() {
  const { data, isPending, isError } = useAdminQuotes()
  const [filter, setFilter] = useState<Filter>("new")
  const all = data?.data ?? []
  const matches = (f: Filter, q: Quote) => f === "all" || q.status === f
  const shown = all.filter((q) => matches(filter, q))
  const options = stages.map((o) => ({ ...o, count: all.filter((q) => matches(o.value, q)).length }))

  return (
    <>
      <PageHeader title="Quote requests" description="Buyers’ lists and bills of quantities. Gather prices from suppliers, send the quote, then close it." />
      <StatusFilter label="Filter quote requests" options={options} value={filter} onChange={setFilter} />
      {isPending ? (
        <ListSkeleton rows={3} className="h-56" />
      ) : isError ? (
        <EmptyState>We couldn’t load quote requests. Refresh to try again.</EmptyState>
      ) : shown.length ? (
        <ul className="flex flex-col gap-4">
          {shown.map((q) => (
            <li key={q.id}>
              <QuoteCard quote={q} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>{filter === "new" ? "No new requests." : "Nothing here."}</EmptyState>
      )}
    </>
  )
}
