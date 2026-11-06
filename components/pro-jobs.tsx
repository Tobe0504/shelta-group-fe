"use client"

import Link from "next/link"
import { MapPin, MessageCircle, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDepartments } from "@/hooks/use-catalog"
import { useOwnPro, useProJobs } from "@/hooks/use-services"
import { formatDay, formatNaira, whatsappLink } from "@/lib/format"
import { tradeName } from "@/lib/trades"
import type { ProJob } from "@/lib/types"
import { EmptyState } from "./empty-state"
import { jobStatus } from "@/lib/job-status"
import { PageHeader } from "./page-header"
import { StageRows } from "./job-stages"
import { ListSkeleton } from "./skeletons"

/** What the pro's quote came to, from their side. */
export function outcome(job: ProJob) {
  if (job.won) return job.status === "hired" ? { label: "Hired", variant: "success" as const } : jobStatus[job.status]
  if (job.bid.status === "declined") return { label: "Not chosen", variant: "secondary" as const }
  return job.status === "open" ? { label: "Waiting for buyer", variant: "deal-soft" as const } : jobStatus[job.status]
}

/** Payment stages as the pro sees them: what's in escrow and what's been paid out. */
export function ProStages({ job }: { job: ProJob }) {
  if (!job.won || !job.stages.length) return null
  return (
    <StageRows
      stages={job.stages}
      closed={job.status === "cancelled"}
      action={(s) =>
        s.status === "held" ? (
          <span className="w-full text-xs text-muted-foreground">Paid into escrow. Start this stage; it’s released to you when the buyer confirms.</span>
        ) : s.status === "released" ? (
          <span className="w-full text-xs text-muted-foreground">
            {s.payoutStatus === "paid" ? `${formatNaira(s.payout ?? 0)} sent to your bank` : `${formatNaira(s.payout ?? 0)} on its way`}
            {s.payoutStatus !== "paid" && (
              <>
                {" · "}
                <Link href="/pro/payouts" className="text-primary hover:underline">
                  check your bank details
                </Link>
              </>
            )}
          </span>
        ) : null
      }
    />
  )
}

/** The buyer's contact details, shown once they hire the pro. */
export function HiredBy({ job }: { job: ProJob }) {
  if (!job.won || !job.contactPhone) return null
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-success-soft p-3 text-success-soft-foreground max-sm:rounded-xl max-sm:p-2.5">
      <p className="text-sm font-medium max-sm:text-xs">
        {job.contactName} hired you
        {job.address && (
          <span className="flex items-center gap-1 font-normal">
            <MapPin aria-hidden className="size-3.5 shrink-0" /> {job.address}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="border-0">
          <a href={`tel:${job.contactPhone}`}>
            <Phone aria-hidden /> {job.contactPhone}
          </a>
        </Button>
        <Button asChild size="sm" variant="outline" className="border-0">
          <a href={whatsappLink(job.contactPhone, `Hi ${job.contactName}, it’s about “${job.title}” on SheltaMart.`)} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden /> WhatsApp
          </a>
        </Button>
      </div>
    </div>
  )
}

function ProJobCard({ job, trade }: { job: ProJob; trade: string }) {
  const state = outcome(job)
  return (
    <Card className="relative gap-3 px-5 py-5 transition-colors hover:bg-muted/40 max-sm:gap-2 max-sm:p-3 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-lg max-sm:text-base">
            <Link href={`/pro/jobs/${job.id}`} className="after:absolute after:inset-0 hover:text-primary focus-visible:underline">
              {job.title}
            </Link>
          </h2>
          <p className="text-sm text-muted-foreground max-sm:text-xs">
            {trade} · {job.area ?? "Area not given"} · quoted {formatDay(job.bid.createdAt)}
          </p>
        </div>
        <Badge variant={state.variant}>{state.label}</Badge>
      </div>
      <p className="text-sm max-sm:text-xs">
        Your quote: <span className="font-semibold tabular-nums">{formatNaira(job.bid.amount)}</span> · {job.bid.timeline}
      </p>
      <div className="relative z-10 flex flex-col gap-3 empty:hidden max-sm:gap-2">
        <ProStages job={job} />
        <HiredBy job={job} />
      </div>
    </Card>
  )
}

export function ProJobs() {
  const pro = useOwnPro()
  const jobs = useProJobs(!!pro.data)
  const trades = useDepartments("services").data ?? []

  if (pro.isPending || (pro.data && jobs.isPending)) return <ListSkeleton rows={3} className="h-32" />
  if (!pro.data) return <EmptyState action={{ href: "/pro/profile", label: "Set up your profile" }}>Create a pro profile to start quoting on jobs.</EmptyState>

  return (
    <>
      <PageHeader title="My quotes" description="Jobs you’ve quoted on. When a buyer hires you, their number and the site address appear here." />
      {jobs.isError ? (
        <EmptyState>We couldn’t load your quotes. Refresh to try again.</EmptyState>
      ) : jobs.data?.length ? (
        <ul className="flex flex-col gap-4 max-sm:gap-2">
          {jobs.data.map((job) => (
            <li key={job.id}>
              <ProJobCard job={job} trade={tradeName(trades, job.trade)} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState action={{ href: "/pro", label: "See job leads" }}>You haven’t quoted on any jobs yet.</EmptyState>
      )}
    </>
  )
}
