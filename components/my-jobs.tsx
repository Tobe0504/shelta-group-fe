"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDepartments } from "@/hooks/use-catalog"
import { useMyJobs } from "@/hooks/use-services"
import { formatDay, formatNaira } from "@/lib/format"
import { jobStatus } from "@/lib/job-status"
import { tradeName } from "@/lib/trades"
import type { Job } from "@/lib/types"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"
import { ListSkeleton } from "./skeletons"

/** What needs the buyer's attention on a job, in one line. */
function nextStep(job: Job) {
  const hired = job.bids.find((b) => b.status === "accepted")
  if (job.status === "open") {
    const live = job.bids.filter((b) => b.status === "sent")
    if (!live.length) return job.pro ? `Waiting for ${job.pro.name} to quote` : "Waiting for quotes"
    return `${live.length} ${live.length === 1 ? "quote" : "quotes"} from ${formatNaira(Math.min(...live.map((b) => b.amount)))} · compare and hire`
  }
  if (job.status === "hired" && hired) {
    const held = job.stages.find((s) => s.status === "held")
    const unpaid = job.stages.find((s) => s.status === "unpaid" || s.status === "pending")
    if (held) return held.issue ? `${hired.pro.name} · problem reported` : `${hired.pro.name} · release ${formatNaira(held.amount)} when “${held.title}” is done`
    if (unpaid) return `${hired.pro.name} · pay ${formatNaira(unpaid.amount)} to start “${unpaid.title}”`
    return `${hired.pro.name} is on it`
  }
  if (job.status === "completed") return hired ? `${hired.pro.name} · ${job.reviewed ? "reviewed" : "leave a review"}` : "Done"
  return "Cancelled"
}

function JobSummary({ job, trade }: { job: Job; trade: string }) {
  const status = jobStatus[job.status]
  return (
    <Link href={`/account/jobs/${job.id}`} className="group flex items-center gap-3 rounded-3xl p-4 ring-1 ring-border transition-colors hover:bg-muted/60 max-sm:gap-2.5 max-sm:rounded-2xl max-sm:p-3">
      {job.photos[0] && (
        <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted max-sm:size-12 max-sm:rounded-xl">
          <Image src={job.photos[0]} alt="" fill sizes="64px" className="object-cover" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold max-sm:text-sm">{job.title}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </span>
        <span className="text-sm text-muted-foreground max-sm:text-xs">
          {trade} · {job.site.area ?? job.site.address} · {formatDay(job.createdAt)}
        </span>
        <span className="text-sm font-medium text-primary max-sm:text-xs">{nextStep(job)}</span>
      </span>
      <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export function MyJobs() {
  const { data, isPending, isError } = useMyJobs()
  const trades = useDepartments("services").data ?? []

  return (
    <>
      <PageHeader title="My jobs" description="Quotes from pros, who you hired, payments and reviews.">
        <Button asChild size="sm">
          <Link href="/services/request">Post a job</Link>
        </Button>
      </PageHeader>
      {isPending ? (
        <ListSkeleton rows={3} className="h-24" />
      ) : isError ? (
        <EmptyState>We couldn’t load your jobs. Refresh to try again.</EmptyState>
      ) : data.data.length ? (
        <ul className="flex flex-col gap-3 max-sm:gap-2">
          {data.data.map((job) => (
            <li key={job.id}>
              <JobSummary job={job} trade={tradeName(trades, job.trade)} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState action={{ href: "/services", label: "Find a pro" }}>No jobs yet. Post one to get quotes from pros near your site.</EmptyState>
      )}
    </>
  )
}
