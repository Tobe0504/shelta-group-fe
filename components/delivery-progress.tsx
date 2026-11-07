import { stepsFor } from "@/lib/orders"
import type { Fulfilment, ShipmentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Step bar for one delivery or pickup. */
export function DeliveryProgress({ status, fulfilment, label }: { status: ShipmentStatus; fulfilment?: Fulfilment; label: string }) {
  const steps = stepsFor(fulfilment)
  const current = steps.findIndex((s) => s.status === status)
  return (
    <ol aria-label={label} className={cn("grid gap-2 text-xs sm:text-sm", steps.length === 4 ? "grid-cols-4" : "grid-cols-5")}>
      {steps.map((step, i) => (
        <li key={step.status} aria-current={i === current ? "step" : undefined} className="flex flex-col gap-2">
          <span aria-hidden className={cn("h-1.5 rounded-full bg-secondary", i <= current && "bg-primary")} />
          <span className={cn("text-muted-foreground", i <= current && "text-foreground", i === current && "font-medium text-primary")}>
            {step.label}
            {i < current && <span className="sr-only"> (done)</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}
