import type { Metadata } from "next"
import { AdminStores } from "@/components/admin/admin-stores"

export const metadata: Metadata = { title: "Stores" }

export default function Page() {
  return <AdminStores />
}
