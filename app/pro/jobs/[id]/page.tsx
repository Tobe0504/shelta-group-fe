import type { Metadata } from "next"
import { ProJobDetail } from "@/components/pro-job-detail"

export const metadata: Metadata = { title: "Job" }

export default async function Page({ params }: PageProps<"/pro/jobs/[id]">) {
  return <ProJobDetail id={(await params).id} />
}
