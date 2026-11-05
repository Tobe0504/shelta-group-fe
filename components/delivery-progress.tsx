import { deliverySteps, stepIndex } from "@/lib/orders"
import type { ShipmentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Step bar for one delivery. */
export function DeliveryProgress({ status, label }: { status: ShipmentStatus; label: string }) {
  const current = stepIndex(status)
  return (
    <ol aria-label={label} className="grid grid-cols-5 gap-2 text-xs sm:text-sm">
      {deliverySteps.map((step, i) => (
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
