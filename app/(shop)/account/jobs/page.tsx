import type { Metadata } from "next"
import { MyJobs } from "@/components/my-jobs"

export const metadata: Metadata = { title: "My jobs" }

export default function MyJobsPage() {
  return <MyJobs />
}
