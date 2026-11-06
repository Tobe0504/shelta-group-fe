import type { Metadata } from "next"
import { Suspense } from "react"
import { JobPaymentComplete } from "@/components/job-payment-complete"
import { Confirming } from "@/components/payment-complete"

export const metadata: Metadata = { title: "Confirming payment" }

async function Complete({ searchParams }: Pick<PageProps<"/account/jobs/paid">, "searchParams">) {
  const { reference } = await searchParams
  return <JobPaymentComplete reference={typeof reference === "string" ? reference : ""} />
}

/** Paystack redirects here after a job stage payment with `?reference=…`. */
export default function JobPaidPage({ searchParams }: PageProps<"/account/jobs/paid">) {
  return (
    <Suspense fallback={<Confirming />}>
      <Complete searchParams={searchParams} />
    </Suspense>
  )
}
