import type { Metadata } from "next"
import { ProLeads } from "@/components/pro-leads"

export const metadata: Metadata = { title: "Job leads" }

export default function Page() {
  return <ProLeads />
}
