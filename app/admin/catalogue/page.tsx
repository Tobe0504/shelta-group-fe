import type { Metadata } from "next"
import { AdminCatalogue } from "@/components/admin/admin-catalogue"

export const metadata: Metadata = { title: "Catalogue" }

export default function Page() {
  return <AdminCatalogue />
}
