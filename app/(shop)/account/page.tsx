import type { Metadata } from "next"
import { AccountView } from "@/components/account-view"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "My orders" }

export default function AccountPage() {
  return (
    <>
      <PageHeader title="My orders" description="Track deliveries and release payments once everything arrives." />
      <AccountView />
    </>
  )
}
