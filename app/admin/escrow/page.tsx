import type { Metadata } from "next"
import { AdminEscrow } from "@/components/admin/admin-escrow"

export const metadata: Metadata = { title: "Escrow" }

export default function Page() {
  return <AdminEscrow />
}
