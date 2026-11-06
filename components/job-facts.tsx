import { CalendarClock, MapPin, Wallet } from "lucide-react"
import { formatDay, formatNaira } from "@/lib/format"

/** Where, budget and timing for a job, as a compact definition list. */
export function JobFacts({ place, budget, startBy, createdAt, extra }: { place?: string; budget?: number; startBy?: string; createdAt: string; extra?: string }) {
  const facts = [
    { icon: MapPin, label: "Where", value: [place, extra].filter(Boolean).join(" · ") || "Not given" },
    { icon: Wallet, label: "Budget", value: budget ? `Up to ${formatNaira(budget)}` : "Open to quotes" },
    { icon: CalendarClock, label: "Start", value: `${startBy ?? "Flexible"} · posted ${formatDay(createdAt)}` },
  ]
  return (
    <dl className="grid grid-cols-2 gap-2 max-sm:gap-1.5 sm:grid-cols-3">
      {facts.map(({ icon: Icon, label, value }, i) => (
        <div key={label} className={`flex items-start gap-2.5 rounded-2xl bg-muted p-3 max-sm:gap-2 max-sm:rounded-xl max-sm:p-2 ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
          <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium max-sm:text-xs">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
