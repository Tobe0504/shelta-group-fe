import { ShieldCheck } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { formatNaira } from "@/lib/format"

type Row = { label: string; value: number | string; tone?: "success" }

/** Totals panel shared by cart and checkout. `children` holds the call to action. */
export function OrderSummary({ title = "Order summary", rows, total, children }: { title?: string; rows: Row[]; total: number; children: React.ReactNode }) {
  return (
    <aside aria-label={title} className="flex flex-col gap-4 max-sm:gap-2.5 lg:sticky lg:top-32">
      <div className="flex flex-col gap-4 rounded-[28px] bg-muted p-6 max-sm:gap-2.5 max-sm:rounded-2xl max-sm:p-4">
        <h2 className="text-xl font-semibold max-sm:text-base">{title}</h2>
        <dl className="flex flex-col gap-3 max-sm:gap-1.5 max-sm:text-sm">
          {rows.map((r) => (
            <div key={r.label} className={`flex justify-between gap-3 ${r.tone === "success" ? "text-success" : ""}`}>
              <dt className={r.tone ? "" : "text-muted-foreground"}>{r.label}</dt>
              <dd className="tabular-nums">{typeof r.value === "number" ? formatNaira(r.value) : r.value}</dd>
            </div>
          ))}
        </dl>
        <Separator />
        <p className="flex items-baseline justify-between">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-semibold tabular-nums max-sm:text-xl">{formatNaira(total)}</span>
        </p>
        {children}
      </div>
      <p className="flex gap-3 rounded-3xl bg-accent p-5 text-sm text-accent-foreground max-sm:rounded-2xl max-sm:p-3 max-sm:text-xs">
        <ShieldCheck aria-hidden className="size-5 shrink-0" />
        <span>
          <strong className="font-medium">Your money is held safely.</strong> Each seller is paid only after you confirm their delivery.
        </span>
      </p>
    </aside>
  )
}
