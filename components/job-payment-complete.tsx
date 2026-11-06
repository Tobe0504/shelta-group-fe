"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"
import { useVerifyStagePayment } from "@/hooks/use-services"
import { EmptyState } from "./empty-state"
import { Confirming } from "./payment-complete"
import { RequireAuth } from "./require-auth"

function Verify({ reference }: { reference: string }) {
  const router = useRouter()
  const { data: job, isError } = useVerifyStagePayment(reference)
  const stage = job?.stages.find((s) => reference.includes(s.id))

  useEffect(() => {
    if (!job) return
    if (stage?.status === "held") toast.success(`Paid into escrow. Release it when “${stage.title}” is done.`)
    else toast("We haven’t received this payment yet. If you were charged, it will show shortly.")
    router.replace(`/account/jobs/${job.id}`)
  }, [job, stage, router])

  if (!reference || isError) return <EmptyState action={{ href: "/account/jobs", label: "Back to my jobs" }}>We couldn’t confirm this payment. If you were charged, it will show on the job shortly.</EmptyState>
  return <Confirming />
}

/** Where Paystack returns buyers after paying a job stage. */
export function JobPaymentComplete({ reference }: { reference: string }) {
  return (
    <RequireAuth fallback={<Confirming />}>
      <Verify reference={reference} />
    </RequireAuth>
  )
}
