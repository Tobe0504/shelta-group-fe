import type { Metadata } from "next"
import { AdminEnquiries } from "@/components/admin/admin-enquiries"

export const metadata: Metadata = { title: "Property enquiries" }

export default function Page() {
  return <AdminEnquiries />
}
