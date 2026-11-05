import { cn } from "@/lib/utils"
import { formatNaira } from "@/lib/format"

export function Price({
  value,
  was,
  unit,
  className,
}: {
  value: number
  was?: number
  unit?: string
  className?: string
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
      <span className={cn("text-lg font-semibold", className)}>{formatNaira(value)}</span>
      {was && (
        <s className="text-sm text-muted-foreground">
          <span className="sr-only">Was </span>
          {formatNaira(was)}
        </s>
      )}
      {unit && <span className="text-sm text-muted-foreground">/ {unit}</span>}
    </p>
  )
}
