import type { Metadata } from "next"
import { SellerProducts } from "@/components/seller-products"

export const metadata: Metadata = { title: "Products" }

export default function SellerProductsPage() {
  return <SellerProducts />
}
