import type { Metadata } from "next"
import { Clock, FileText, Scale, ShieldCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { InfoTile } from "@/components/info-tile"
import { PageHeader } from "@/components/page-header"
import { QuoteForm } from "@/components/quote-form"

export const metadata: Metadata = { title: "Request a quote" }

const steps = [
  { icon: FileText, tone: "blue", title: "Send your list once", text: "Upload a BoQ or type what you need." },
  { icon: Clock, tone: "peach", title: "Quotes within 24 hours", text: "Verified suppliers near your site reply." },
  { icon: Scale, tone: "lilac", title: "Compare side by side", text: "Price, delivery fee and arrival date." },
  { icon: ShieldCheck, tone: "mint", title: "Pay safely", text: "Held until you confirm each delivery." },
] as const

export default function QuotePage() {
  return (
    <div className="container-page flex flex-col gap-8 py-8 max-sm:gap-3 max-sm:py-3">
      <PageHeader title="Request a quote" description="Get competing prices from verified suppliers for a whole project." />
      <div className="grid items-start gap-6 max-sm:gap-3 lg:grid-cols-[1fr_340px]">
        <Card className="px-5 py-6 max-sm:px-3 max-sm:py-3.5 sm:px-8">
          <QuoteForm />
        </Card>
        <aside aria-labelledby="how-quotes" className="flex flex-col gap-5 rounded-3xl bg-muted p-6 max-sm:gap-3 max-sm:rounded-2xl max-sm:p-3.5 lg:sticky lg:top-32">
          <h2 id="how-quotes" className="text-lg">
            How quotes work
          </h2>
          <ol className="flex flex-col gap-5 max-sm:gap-2.5">
            {steps.map((s) => (
              <li key={s.title}>
                <InfoTile icon={s.icon} tone={s.tone} title={s.title}>
                  {s.text}
                </InfoTile>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  )
}
