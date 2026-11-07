"use client"

import { Banknote, Hourglass, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { useOwnPro, useProBanks, useProJobs, useSetProPayout } from "@/hooks/use-services"
import { formatNaira } from "@/lib/format"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"
import { PayoutForm } from "./payout-form"
import { PayoutReminder } from "./payout-reminder"
import { FormSkeleton } from "./skeletons"
import { StatCard } from "./stat-card"

/** Escrow earnings at a glance, and the bank account released money goes to. */
export function ProPayouts() {
  const pro = useOwnPro()
  const jobs = useProJobs(!!pro.data)
  const banks = useProBanks()
  const save = useSetProPayout()
  const stages = jobs.data?.flatMap((j) => j.stages) ?? []
  const sum = (match: (s: (typeof stages)[number]) => boolean, field: "amount" | "payout") => stages.filter(match).reduce((n, s) => n + (s[field] ?? 0), 0)

  if (pro.isPending) return <FormSkeleton fields={2} />
  if (!pro.data) return <EmptyState action={{ href: "/pro/profile", label: "Set up your profile" }}>Create a pro profile before adding a payout account.</EmptyState>

  return (
    <>
      <PageHeader title="Payouts" description="Buyers pay into SheltaMart escrow. When they release a stage, your share goes to this account." />
      {!pro.data.payout && <PayoutReminder amount={sum((s) => s.status === "released" && s.payoutStatus !== "paid", "payout")} href="#acct" />}
      <div className="grid grid-cols-3 gap-4 max-sm:gap-2">
        <StatCard icon={ShieldCheck} tone="blue" label="In escrow" value={formatNaira(sum((s) => s.status === "held", "amount"))} />
        <StatCard icon={Hourglass} tone="peach" label="On its way" value={formatNaira(sum((s) => s.status === "released" && s.payoutStatus !== "paid", "payout"))} />
        <StatCard icon={Banknote} tone="mint" label="Paid to you" value={formatNaira(sum((s) => s.payoutStatus === "paid", "payout"))} />
      </div>
      <Card className="px-5 py-6 max-sm:px-3 max-sm:py-3.5 sm:px-8">
        <PayoutForm
          payout={pro.data.payout}
          banks={banks}
          saving={save.isPending}
          onSave={(body) => save.mutate(body, { onSuccess: (p) => toast.success(`Payouts will go to ${p.payout?.accountName}`) })}
        />
      </Card>
    </>
  )
}
