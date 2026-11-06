import type { Metadata } from "next"
import { CheckoutForm } from "@/components/checkout-form"

export const metadata: Metadata = { title: "Checkout" }

export default function CheckoutPage() {
  return (
    <div className="container-page flex flex-col gap-6 py-8 max-sm:gap-2.5 max-sm:py-3">
      <h1 className="text-3xl font-semibold tracking-tight max-sm:text-xl">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}
