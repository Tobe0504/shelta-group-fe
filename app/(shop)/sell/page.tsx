import type { Metadata } from "next"
import Link from "next/link"
import { BadgeCheck, Banknote, Store } from "lucide-react"
import { InfoTile } from "@/components/info-tile"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Sell on SheltaMart" }

export default function SellPage() {
  return (
    <div className="container-page flex flex-col gap-8 py-8 max-sm:gap-3 max-sm:py-3">
      <PageHeader title="Sell on SheltaMart" description="Reach builders and contractors in your delivery area. Listing is free; you only pay commission on completed orders." />
      <ul className="grid gap-4 rounded-3xl bg-muted p-5 max-sm:gap-2.5 max-sm:rounded-2xl max-sm:p-3 sm:grid-cols-3">
        <li>
          <InfoTile icon={Store} tone="blue" title="Free listing">
            Unlimited products
          </InfoTile>
        </li>
        <li>
          <InfoTile icon={BadgeCheck} tone="mint" title="Verified badge">
            After a quick check
          </InfoTile>
        </li>
        <li>
          <InfoTile icon={Banknote} tone="peach" title="Fast payouts">
            After delivery is confirmed
          </InfoTile>
        </li>
      </ul>
      <div className="flex flex-wrap gap-3 max-sm:grid max-sm:grid-cols-2 max-sm:gap-2">
        <Button asChild size="lg">
          <Link href="/signup?role=seller">Create a seller account</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/login?next=/seller">I already sell here</Link>
        </Button>
      </div>
    </div>
  )
}
