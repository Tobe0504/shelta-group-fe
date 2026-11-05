import type { Metadata } from "next"
import { SellerSettings } from "@/components/seller-settings"

export const metadata: Metadata = { title: "Store settings" }

export default function SellerSettingsPage() {
  return <SellerSettings />
}
