"use client"

import Link from "next/link"
import { MessageCircle, Phone } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDepartments } from "@/hooks/use-catalog"
import { useCancelJob, useHire, useJob } from "@/hooks/use-services"
import { formatNaira, whatsappLink } from "@/lib/format"
import { jobStatus } from "@/lib/job-status"
import { tradeName } from "@/lib/trades"
import type { Bid, Job } from "@/lib/types"
import { ConfirmDialog } from "./confirm-dialog"
import { EmptyState } from "./empty-state"
import { JobFacts } from "./job-facts"
import { BuyerStages } from "./job-stages"
import { PageBreadcrumb } from "./page-breadcrumb"
import { PhotoGrid } from "./photo-viewer"
import { ProAvatar, ProName } from "./pro-card"
import { Rating } from "./rating"
import { ReviewDialog } from "./review-dialog"
import { Section } from "./section"
import { ProductDetailSkeleton } from "./skeletons"

/** One quote in full: the pro, price, timeline, their message and payment stages. */
function QuoteCard({ job, bid }: { job: Job; bid: Bid }) {
  const hire = useHire()
  const won = bid.status === "accepted"
  return (
    <li className="flex flex-col gap-3 rounded-3xl p-4 ring-1 ring-border max-sm:gap-2 max-sm:rounded-2xl max-sm:p-3">
      <div className="flex items-start gap-3 max-sm:gap-2">
        <ProAvatar pro={bid.pro} className="size-12 max-sm:size-10" />
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/pros/${bid.pro.slug}`} className="font-semibold hover:text-primary max-sm:text-sm">
            <ProName pro={bid.pro} />
          </Link>
          <span className="line-clamp-1 text-sm text-muted-foreground max-sm:text-xs">{bid.pro.headline}</span>
          <Rating value={bid.pro.rating} count={bid.pro.reviewCount} extra={`${bid.pro.jobsDone} jobs`} compact />
        </div>
        <p className="flex flex-col items-end text-right">
          <span className="text-lg font-semibold tabular-nums max-sm:text-base">{formatNaira(bid.amount)}</span>
          <span className="text-xs text-muted-foreground">{bid.timeline}</span>
        </p>
      </div>
      {bid.message && <p className="rounded-2xl bg-muted p-3 text-sm whitespace-pre-line max-sm:rounded-xl max-sm:p-2.5 max-sm:text-xs">{bid.message}</p>}
      {bid.stages.length > 0 && !won && (
        <ol aria-label="Proposed payment stages" className="flex flex-col gap-1 text-sm max-sm:text-xs">
          {bid.stages.map((s, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="text-muted-foreground">
                {i + 1}. {s.title}
              </span>
              <span className="tabular-nums">{formatNaira(s.amount)}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {won && bid.pro.phone && (
          <>
            <Button asChild size="sm" variant="soft">
              <a href={`tel:${bid.pro.phone}`}>
                <Phone aria-hidden /> {bid.pro.phone}
              </a>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <a href={whatsappLink(bid.pro.phone, `Hi ${bid.pro.name}, it’s about “${job.title}” on SheltaMart.`)} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden /> WhatsApp
              </a>
            </Button>
          </>
        )}
        {job.status === "open" && (
          <ConfirmDialog
            title={`Hire ${bid.pro.name}?`}
            description={`You’ll swap phone numbers and they’ll get the site address. Other quotes are declined. You then pay into SheltaMart escrow, and the money only reaches ${bid.pro.name} when you release it.`}
            confirmLabel="Hire"
            cancelLabel="Not yet"
            variant="default"
            onConfirm={() => hire.mutate({ job: job.id, bid: bid.id }, { onSuccess: () => toast.success(`${bid.pro.name} is hired. Their number is on the job.`) })}
            trigger={
              <Button size="sm" loading={hire.isPending} className="max-sm:w-full">
                Hire {bid.pro.name.split(" ")[0]}
              </Button>
            }
          />
        )}
        {bid.status === "declined" && <Badge variant="secondary">Not chosen</Badge>}
      </div>
    </li>
  )
}

/** Everything about one of the buyer's jobs: details, photos, every quote, payments and next steps. */
export function JobDetail({ id }: { id: string }) {
  const { data: job, isPending, isError } = useJob(id)
  const trades = useDepartments("services").data ?? []
  const cancel = useCancelJob()

  if (isPending) return <ProductDetailSkeleton />
  if (isError || !job) return <EmptyState action={{ href: "/account/jobs", label: "Back to my jobs" }}>We couldn’t find this job.</EmptyState>

  const status = jobStatus[job.status]
  const hired = job.bids.find((b) => b.status === "accepted")
  const quotes = hired ? [hired] : [...job.bids].sort((a, b) => Number(a.status === "declined") - Number(b.status === "declined") || a.amount - b.amount)
  const moneyIn = job.stages.some((s) => s.status !== "unpaid")

  return (
    <div className="flex flex-col gap-8 max-sm:gap-4">
      <div className="max-sm:hidden">
        <PageBreadcrumb items={[{ label: "My jobs", href: "/account/jobs" }, { label: job.title }]} />
      </div>
      <header className="flex flex-col gap-3 max-sm:gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-3xl max-sm:text-xl">{job.title}</h1>
            <p className="text-muted-foreground max-sm:text-sm">
              {tradeName(trades, job.trade)}
              {job.pro && ` · sent to ${job.pro.name}`}
            </p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <JobFacts place={job.site.address} budget={job.budget} startBy={job.startBy} createdAt={job.createdAt} />
      </header>

      <Section title="Details">
        <p className="max-w-3xl leading-relaxed whitespace-pre-line max-sm:text-sm">{job.description}</p>
        <PhotoGrid images={job.photos} alt={job.title} />
      </Section>

      {hired && job.stages.length > 0 && (
        <Section title="Payments">
          <BuyerStages job={job} proName={hired.pro.name} />
        </Section>
      )}

      <Section title={hired ? "Your pro" : `Quotes (${job.bids.length})`}>
        {quotes.length ? (
          <ul className="grid gap-3 max-sm:gap-2 lg:grid-cols-2">
            {quotes.map((b) => (
              <QuoteCard key={b.id} job={job} bid={b} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{job.pro ? `Waiting for ${job.pro.name} to quote.` : "No quotes yet. Pros who cover your site will reply here."}</p>
        )}
      </Section>

      <div className="flex flex-wrap gap-2 empty:hidden">
        {job.status === "completed" && !job.reviewed && hired && <ReviewDialog job={job.id} proName={hired.pro.name} />}
        {(job.status === "open" || (job.status === "hired" && !moneyIn)) && (
          <ConfirmDialog
            title="Cancel this job?"
            description="Pros stop seeing it and can’t send more quotes."
            confirmLabel="Cancel job"
            onConfirm={() => cancel.mutate(job.id, { onSuccess: () => toast("Job cancelled") })}
            trigger={
              <Button variant="ghost" loading={cancel.isPending}>
                Cancel job
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
