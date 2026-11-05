import type { Metadata } from "next"
import { CheckoutForm } from "@/components/checkout-form"

export const metadata: Metadata = { title: "Checkout" }

export default function CheckoutPage() {
  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}
