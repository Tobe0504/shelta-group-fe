import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { BadgeCheck, ClipboardList, MessageSquareQuote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InfoTile } from "@/components/info-tile"
import { PageHeader } from "@/components/page-header"
import { ProList } from "@/components/pro-card"
import { Section } from "@/components/section"
import { ListSkeleton, ProListSkeleton } from "@/components/skeletons"
import { TradeDirectory } from "@/components/trade-directory"
import { load } from "@/lib/server-data"
import { catalogService } from "@/services/catalog.service"
import { prosService } from "@/services/pros.service"

export const metadata: Metadata = { title: "Hire a pro", description: "Builders, tilers, plumbers, electricians, architects and more. Post a job and compare quotes." }

const steps = [
  { icon: ClipboardList, tone: "blue", title: "Post a job", text: "Say what you need and where" },
  { icon: MessageSquareQuote, tone: "peach", title: "Compare quotes", text: "Pros near your site reply" },
  { icon: BadgeCheck, tone: "mint", title: "Hire safely", text: "Ratings come from real jobs" },
] as const

async function Trades() {
  const [departments, counts] = await load(() => Promise.all([catalogService.departments("services"), prosService.tradeCounts()]))
  return <TradeDirectory departments={departments} counts={counts} />
}

async function TopPros() {
  const { data } = await load(() => prosService.list({ limit: 6 }))
  return <ProList pros={data} />
}

export default function ServicesPage() {
  return (
    <div className="container-page flex flex-col gap-10 py-8 max-sm:gap-4 max-sm:py-3">
      <PageHeader title="Hire a pro" description="Verified tradespeople and firms for your build. Post a job and compare quotes from pros who cover your site.">
        <div className="flex gap-2 max-sm:grid max-sm:w-full max-sm:grid-cols-2">
          <Button asChild>
            <Link href="/services/request">Post a job</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/pro/profile">Offer your services</Link>
          </Button>
        </div>
      </PageHeader>
      <ul aria-label="How it works" className="scrollbar-none grid gap-4 rounded-3xl bg-muted p-5 max-sm:flex max-sm:gap-3 max-sm:overflow-x-auto max-sm:rounded-xl max-sm:p-2 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.title}>
            <InfoTile icon={s.icon} tone={s.tone} title={s.title} compact>
              {s.text}
            </InfoTile>
          </li>
        ))}
      </ul>
      <Section title="Browse by trade">
        <Suspense fallback={<ListSkeleton rows={3} className="h-56" />}>
          <Trades />
        </Suspense>
      </Section>
      <Section title="Top-rated pros" action={{ href: "/pros", label: "See all pros" }}>
        <Suspense fallback={<ProListSkeleton />}>
          <TopPros />
        </Suspense>
      </Section>
    </div>
  )
}
