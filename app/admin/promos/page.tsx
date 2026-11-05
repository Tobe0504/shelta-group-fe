import type { Metadata } from "next"
import { AdminPromos } from "@/components/admin/admin-promos"

export const metadata: Metadata = { title: "Promos" }

export default function Page() {
  return <AdminPromos />
}
