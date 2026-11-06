"use client"

import { Badge } from "@/components/ui/badge"
import { useAdminQuote } from "@/hooks/use-admin"
import { formatDay } from "@/lib/format"
import { EmptyState } from "../empty-state"
import { PageBreadcrumb } from "../page-breadcrumb"
import { Section } from "../section"
import { ProductDetailSkeleton } from "../skeletons"
import { QuoteContact, QuoteControls, QuoteFiles, quoteStatusOf } from "./admin-quotes"

/** One quote request in full: the whole list, every attachment, contact options, status and notes. */
export function AdminQuoteDetail({ id }: { id: string }) {
  const { data: quote, isPending, isError } = useAdminQuote(id)
  if (isPending) return <ProductDetailSkeleton />
  if (isError || !quote) return <EmptyState action={{ href: "/admin/quotes", label: "Back to quote requests" }}>We couldn’t find this request.</EmptyState>
  const status = quoteStatusOf(quote.status)

  return (
    <div className="flex flex-col gap-8 max-sm:gap-4">
      <div className="max-sm:hidden">
        <PageBreadcrumb items={[{ label: "Quote requests", href: "/admin/quotes" }, { label: quote.name }]} />
      </div>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl max-sm:text-xl">{quote.name}</h1>
          <p className="text-muted-foreground max-sm:text-sm">
            Sent {formatDay(quote.createdAt)} · deliver to {quote.site}
            {quote.neededBy && ` · needed by ${quote.neededBy}`}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </header>
      <QuoteContact quote={quote} />
      <Section title="What they need">
        {quote.items ? <p className="rounded-2xl bg-muted p-4 leading-relaxed whitespace-pre-line max-sm:rounded-xl max-sm:p-3 max-sm:text-sm">{quote.items}</p> : <p className="text-sm text-muted-foreground">No list typed. See the attached files.</p>}
      </Section>
      {quote.files.length > 0 && (
        <Section title={`Attached files (${quote.files.length})`}>
          <QuoteFiles quote={quote} />
        </Section>
      )}
      <Section title="Progress">
        <QuoteControls quote={quote} />
      </Section>
    </div>
  )
}
