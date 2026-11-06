import type { Metadata } from "next"
import { JobDetail } from "@/components/job-detail"

export const metadata: Metadata = { title: "Job" }

export default async function JobPage({ params }: PageProps<"/account/jobs/[id]">) {
  return <JobDetail id={(await params).id} />
}
