import type { Metadata } from "next"
import { AdminQuotes } from "@/components/admin/admin-quotes"

export const metadata: Metadata = { title: "Quote requests" }

export default function Page() {
  return <AdminQuotes />
}
