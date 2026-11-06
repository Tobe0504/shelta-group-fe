import type { Metadata } from "next"
import { AdminPros } from "@/components/admin/admin-pros"

export const metadata: Metadata = { title: "Pros" }

export default function Page() {
  return <AdminPros />
}
