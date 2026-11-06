"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDepartments } from "@/hooks/use-catalog"
import { useOwnPro, useProJob } from "@/hooks/use-services"
import { formatDay, formatNaira } from "@/lib/format"
import { tradeName } from "@/lib/trades"
import { EmptyState } from "./empty-state"
import { JobFacts } from "./job-facts"
import { PageBreadcrumb } from "./page-breadcrumb"
import { PhotoGrid } from "./photo-viewer"
import { HiredBy, outcome, ProStages } from "./pro-jobs"
import { QuoteDialog } from "./pro-leads"
import { Section } from "./section"
import { ProductDetailSkeleton } from "./skeletons"

/** A job from the pro's side: the full brief and photos, then either "Send quote" or their quote, payments and the buyer's contact. */
export function ProJobDetail({ id }: { id: string }) {
  const pro = useOwnPro()
  const { data: job, isPending, isError } = useProJob(id, !!pro.data)
  const trades = useDepartments("services").data ?? []

  if (pro.isPending || (pro.data && isPending)) return <ProductDetailSkeleton />
  if (isError || !job) return <EmptyState action={{ href: "/pro", label: "Back to job leads" }}>This job isn’t available. It may have been filled or cancelled.</EmptyState>

  const state = job.quoted ? outcome(job) : job.direct ? { label: "Asked you directly", variant: "accent" as const } : { label: "Open for quotes", variant: "deal-soft" as const }
  const distance = !job.quoted && job.distanceKm != null ? `${job.distanceKm} km from you` : undefined

  return (
    <div className="flex flex-col gap-8 max-sm:gap-4">
      <div className="max-sm:hidden">
        <PageBreadcrumb items={[job.quoted ? { label: "My quotes", href: "/pro/jobs" } : { label: "Job leads", href: "/pro" }, { label: job.title }]} />
      </div>
      <header className="flex flex-col gap-3 max-sm:gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-3xl max-sm:text-xl">{job.title}</h1>
            <p className="text-muted-foreground max-sm:text-sm">
              {tradeName(trades, job.trade)} · {job.quotes} {job.quotes === 1 ? "quote" : "quotes"} so far
            </p>
          </div>
          <Badge variant={state.variant}>{state.label}</Badge>
        </div>
        <JobFacts place={job.quoted && job.address ? job.address : job.area} extra={distance} budget={job.budget} startBy={job.startBy} createdAt={job.createdAt} />
      </header>

      <Section title="What the buyer needs">
        <p className="max-w-3xl leading-relaxed whitespace-pre-line max-sm:text-sm">{job.description}</p>
        <PhotoGrid images={job.photos} alt={job.title} />
      </Section>

      {job.quoted ? (
        <>
          <Section title="Your quote">
            <div className="flex flex-col gap-2 rounded-3xl p-4 ring-1 ring-border max-sm:rounded-2xl max-sm:p-3">
              <p className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xl font-semibold tabular-nums max-sm:text-lg">{formatNaira(job.bid.amount)}</span>
                <span className="text-sm text-muted-foreground max-sm:text-xs">
                  {job.bid.timeline} · sent {formatDay(job.bid.createdAt)}
                </span>
              </p>
              {job.bid.message && <p className="text-sm whitespace-pre-line text-muted-foreground max-sm:text-xs">{job.bid.message}</p>}
              {!job.won && job.bid.stages.length > 0 && (
                <ol className="flex flex-col gap-1 text-sm max-sm:text-xs">
                  {job.bid.stages.map((s, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">
                        {i + 1}. {s.title}
                      </span>
                      <span className="tabular-nums">{formatNaira(s.amount)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Section>
          {job.won && (
            <Section title="Payments and contact">
              <ProStages job={job} />
              <HiredBy job={job} />
            </Section>
          )}
        </>
      ) : (
        <QuoteDialog
          lead={job}
          trigger={
            <Button size="lg" className="w-full sm:w-fit">
              Send your quote
            </Button>
          }
        />
      )}
    </div>
  )
}
