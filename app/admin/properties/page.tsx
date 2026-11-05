import type { Metadata } from "next"
import { AdminProperties } from "@/components/admin/admin-properties"

export const metadata: Metadata = { title: "Properties" }

export default function Page() {
  return <AdminProperties />
}
