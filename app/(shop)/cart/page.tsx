import type { Metadata } from "next"
import { CartView } from "@/components/cart-view"

export const metadata: Metadata = { title: "Cart" }

export default function CartPage() {
  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
      <CartView />
    </div>
  )
}
