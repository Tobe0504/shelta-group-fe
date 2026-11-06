import type { Metadata } from "next"
import { AdminQuoteDetail } from "@/components/admin/admin-quote-detail"

export const metadata: Metadata = { title: "Quote request" }

export default async function Page({ params }: PageProps<"/admin/quotes/[id]">) {
  return <AdminQuoteDetail id={(await params).id} />
}
