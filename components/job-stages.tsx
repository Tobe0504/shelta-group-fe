"use client"

import { ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePayStage, useReleaseStage, useReportStage } from "@/hooks/use-services"
import { formatNaira } from "@/lib/format"
import type { Job, Stage, StageStatus } from "@/lib/types"
import { ConfirmDialog } from "./confirm-dialog"
import { MessageDialog } from "./message-dialog"

type BadgeVariant = "deal-soft" | "accent" | "success" | "secondary"
export const stageStatus: Record<StageStatus, { label: string; variant: BadgeVariant }> = {
  unpaid: { label: "To pay", variant: "secondary" },
  pending: { label: "Payment started", variant: "deal-soft" },
  held: { label: "In escrow", variant: "accent" },
  released: { label: "Released", variant: "success" },
  refunded: { label: "Refunded", variant: "secondary" },
}

const cancelled = { label: "Cancelled", variant: "secondary" as const }

/** One row per stage: name, amount, status and an action slot. `closed` marks unpaid stages of a cancelled job. */
export function StageRows<S extends Pick<Stage, "id" | "title" | "amount" | "status">>({ stages, closed, action }: { stages: S[]; closed?: boolean; action?: (stage: S, index: number) => React.ReactNode }) {
  return (
    <ol aria-label="Payment stages" className="flex flex-col divide-y rounded-2xl ring-1 ring-border max-sm:rounded-xl">
      {stages.map((s, i) => {
        const neverPaid = s.status === "unpaid" || s.status === "pending" || (s.status === "refunded" && !("paidAt" in s && s.paidAt))
        const status = neverPaid && (closed || s.status === "refunded") ? cancelled : stageStatus[s.status]
        return (
          <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 max-sm:gap-x-2 max-sm:p-2.5">
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium max-sm:text-xs">
                {stages.length > 1 && <span className="text-muted-foreground">{i + 1}. </span>}
                {s.title}
              </span>
              <span className="text-sm font-semibold tabular-nums max-sm:text-xs">{formatNaira(s.amount)}</span>
            </span>
            <Badge variant={status.variant}>{status.label}</Badge>
            {action?.(s, i)}
          </li>
        )
      })}
    </ol>
  )
}

/** The buyer's stages for a hired job: pay into escrow, release when done, or report a problem. */
export function BuyerStages({ job, proName }: { job: Job; proName: string }) {
  const pay = usePayStage()
  const release = useReleaseStage()
  const report = useReportStage()
  const next = job.stages.find((s) => s.status === "unpaid" || s.status === "pending")

  return (
    <div className="flex flex-col gap-2">
      <StageRows
        stages={job.stages}
        closed={job.status === "cancelled"}
        action={(s) => {
          if (s.id === next?.id && job.status === "hired")
            return (
              <Button size="sm" loading={pay.isPending} onClick={() => pay.mutate({ job: job.id, stage: s.id })} className="max-sm:w-full">
                {s.status === "pending" ? "Finish payment" : `Pay ${formatNaira(s.amount)}`}
              </Button>
            )
          if (s.status !== "held") return null
          if (s.issue) return <p className="w-full text-xs text-deal-soft-foreground">Problem reported. Our team will contact you both and settle it.</p>
          return (
            <span className="flex w-full flex-wrap gap-2 sm:w-auto">
              <ConfirmDialog
                title={`Release ${formatNaira(s.amount)} to ${proName}?`}
                description={`Only release it once “${s.title}” is done the way you agreed. This can’t be undone.`}
                confirmLabel="Release payment"
                cancelLabel="Not yet"
                variant="default"
                onConfirm={() => release.mutate({ job: job.id, stage: s.id }, { onSuccess: () => toast.success(`Payment released to ${proName}`) })}
                trigger={
                  <Button size="sm" loading={release.isPending}>
                    Release
                  </Button>
                }
              />
              <MessageDialog
                title="Report a problem"
                description="The money stays in escrow while our team looks into it with you and the pro."
                placeholder="What’s wrong with the work?"
                submitLabel="Report problem"
                success="Reported. We’ll be in touch within a working day."
                onSend={({ message }) => report.mutateAsync({ job: job.id, stage: s.id, message })}
              >
                <Button size="sm" variant="ghost">
                  Report a problem
                </Button>
              </MessageDialog>
            </span>
          )
        }}
      />
      {job.status === "hired" && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden className="size-3.5 shrink-0 text-success" />
          Your payment is held by SheltaMart and only goes to {proName} when you release it.
        </p>
      )}
    </div>
  )
}
