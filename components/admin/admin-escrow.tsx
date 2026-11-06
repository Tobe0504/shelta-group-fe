"use client"

import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAdminRefund, useAdminRelease, useEscrow } from "@/hooks/use-services"
import { formatDay, formatNaira } from "@/lib/format"
import type { EscrowJob, Stage } from "@/lib/types"
import { ConfirmDialog } from "../confirm-dialog"
import { EmptyState } from "../empty-state"
import { StageRows } from "../job-stages"
import { PageHeader } from "../page-header"
import { ListSkeleton } from "../skeletons"

function StageActions({ job, stage }: { job: EscrowJob; stage: Stage }) {
  const release = useAdminRelease()
  const refund = useAdminRefund()
  if (stage.status === "released" && stage.payoutStatus !== "paid")
    return <span className="w-full text-xs text-muted-foreground">Payout {stage.payoutStatus === "failed" ? "failed" : "waiting"}: {formatNaira(stage.payout ?? 0)}. Run due payouts from the overview once the pro has a bank account.</span>
  if (stage.status !== "held") return null
  return (
    <span className="flex w-full flex-col gap-2">
      {stage.issue && (
        <span className="rounded-xl bg-deal-soft p-2.5 text-xs text-deal-soft-foreground">
          <strong className="font-semibold">Buyer reported, {formatDay(stage.issue.at)}:</strong> {stage.issue.message}
        </span>
      )}
      <span className="flex flex-wrap gap-2">
        <ConfirmDialog
          title={`Release ${formatNaira(stage.amount)} to ${job.hired.name}?`}
          description="The pro is paid minus commission. Do this when the work is confirmed done."
          confirmLabel="Release"
          cancelLabel="Back"
          variant="default"
          onConfirm={() => release.mutate({ job: job.id, stage: stage.id }, { onSuccess: () => toast.success("Released to the pro") })}
          trigger={
            <Button size="sm" loading={release.isPending}>
              Release to pro
            </Button>
          }
        />
        <ConfirmDialog
          title={`Refund ${formatNaira(stage.amount)} to ${job.user.name}?`}
          description="The money goes back to the buyer’s card or account through Paystack. Later stages are cancelled."
          confirmLabel="Refund"
          cancelLabel="Back"
          onConfirm={() => refund.mutate({ job: job.id, stage: stage.id }, { onSuccess: () => toast.success("Refund started") })}
          trigger={
            <Button size="sm" variant="ghost" loading={refund.isPending}>
              Refund buyer
            </Button>
          }
        />
      </span>
    </span>
  )
}

export function AdminEscrow() {
  const { data, isPending, isError } = useEscrow()
  const jobs = [...(data ?? [])].sort((a, b) => Number(b.stages.some((s) => s.issue)) - Number(a.stages.some((s) => s.issue)))

  return (
    <>
      <PageHeader title="Escrow" description="Service-job money SheltaMart is holding, problems buyers reported, and payouts still to send. Reported problems are listed first." />
      {isPending ? (
        <ListSkeleton rows={3} className="h-40" />
      ) : isError ? (
        <EmptyState>We couldn’t load escrow. Refresh to try again.</EmptyState>
      ) : jobs.length ? (
        <ul className="flex flex-col gap-4 max-sm:gap-2">
          {jobs.map((job) => (
            <li key={job.id}>
              <Card className="gap-3 px-5 py-5 max-sm:gap-2 max-sm:p-3 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h2 className="text-lg max-sm:text-base">{job.title}</h2>
                    <p className="text-sm text-muted-foreground max-sm:text-xs">
                      Buyer <a href={`mailto:${job.user.email}`} className="text-primary hover:underline">{job.user.name}</a> ({job.contactPhone}) · Pro{" "}
                      <Link href={`/pros/${job.hired.slug}`} className="text-primary hover:underline">
                        {job.hired.name}
                      </Link>{" "}
                      ({job.hired.phone})
                    </p>
                  </div>
                  {job.stages.some((s) => s.issue && s.status === "held") && <Badge variant="deal-soft">Problem reported</Badge>}
                </div>
                <StageRows stages={job.stages} action={(s) => <StageActions job={job} stage={s} />} />
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>Nothing in escrow right now.</EmptyState>
      )}
    </>
  )
}
