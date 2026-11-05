import type { Metadata } from "next"
import { Suspense } from "react"
import { PaymentComplete } from "@/components/payment-complete"
import { Spinner } from "@/components/ui/spinner"

export const metadata: Metadata = { title: "Confirming payment" }

async function Complete({ searchParams }: Pick<PageProps<"/checkout/complete">, "searchParams">) {
  const { reference } = await searchParams
  return <PaymentComplete reference={typeof reference === "string" ? reference : ""} />
}

/** Paystack redirects here after payment with `?reference=…`. */
export default function PaymentCompletePage({ searchParams }: PageProps<"/checkout/complete">) {
  return (
    <div className="container-page py-8">
      <Suspense fallback={<Spinner className="mx-auto my-[25vh] size-10 text-primary" />}>
        <Complete searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
