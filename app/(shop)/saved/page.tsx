import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { SavedView } from "@/components/saved-view"

export const metadata: Metadata = { title: "Saved items" }

export default function SavedPage() {
  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <PageHeader title="Saved items" description="Products you’ve kept for later." />
      <SavedView />
    </div>
  )
}
