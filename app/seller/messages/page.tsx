import type { Metadata } from "next"
import { SellerMessages } from "@/components/seller-messages"

export const metadata: Metadata = { title: "Messages" }

export default function SellerMessagesPage() {
  return <SellerMessages />
}
