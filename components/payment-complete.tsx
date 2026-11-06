"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { useVerifyPayment } from "@/hooks/use-orders"
import { EmptyState } from "./empty-state"
import { RequireAuth } from "./require-auth"

export function Confirming() {
  return (
    <div role="status" className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
      <Spinner role={undefined} aria-hidden className="size-10 text-primary" />
      <p>Confirming your payment</p>
    </div>
  )
}

function Verify({ reference }: { reference: string }) {
  const router = useRouter()
  const { data: order, isError } = useVerifyPayment(reference)

  useEffect(() => {
    if (order) router.replace(`/orders/${order.number}`)
  }, [order, router])

  if (!reference || isError) return <EmptyState action={{ href: "/account", label: "See your orders" }}>We couldn’t confirm this payment. If you were charged, it will show on your order shortly.</EmptyState>
  return <Confirming />
}

export function PaymentComplete({ reference }: { reference: string }) {
  return (
    <RequireAuth fallback={<Confirming />}>
      <Verify reference={reference} />
    </RequireAuth>
  )
}
