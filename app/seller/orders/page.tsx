import type { Metadata } from "next"
import { SellerOrders } from "@/components/seller-orders"

export const metadata: Metadata = { title: "Orders" }

export default function SellerOrdersPage() {
  return <SellerOrders />
}
