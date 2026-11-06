import { cn } from "@/lib/utils"
import { formatNaira } from "@/lib/format"

export function Price({
  value,
  was,
  unit,
  compact,
  className,
}: {
  value: number
  was?: number
  unit?: string
  /** For product cards: smaller on phones, without the old price (the discount badge covers it). */
  compact?: boolean
  className?: string
}) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 tabular-nums", compact && "max-sm:gap-x-1")}>
      <span className={cn("text-lg font-semibold", compact && "max-sm:text-sm", className)}>{formatNaira(value)}</span>
      {was && (
        <s className={cn("text-sm text-muted-foreground", compact && "max-sm:hidden")}>
          <span className="sr-only">Was </span>
          {formatNaira(was)}
        </s>
      )}
      {unit && <span className={cn("text-sm text-muted-foreground", compact && "max-sm:text-[11px]")}>/ {unit}</span>}
    </p>
  )
}
