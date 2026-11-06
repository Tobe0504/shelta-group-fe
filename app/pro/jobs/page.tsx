import type { Metadata } from "next"
import { ProJobs } from "@/components/pro-jobs"

export const metadata: Metadata = { title: "My quotes" }

export default function Page() {
  return <ProJobs />
}
