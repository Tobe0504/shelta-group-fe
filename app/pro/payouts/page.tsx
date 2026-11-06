import type { Metadata } from "next"
import { ProPayouts } from "@/components/pro-payouts"

export const metadata: Metadata = { title: "Payouts" }

export default function Page() {
  return <ProPayouts />
}
