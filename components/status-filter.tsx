import type { LucideIcon } from "lucide-react"
import { tones } from "@/lib/tones"
import type { Tone } from "@/lib/types"
import { cn } from "@/lib/utils"

export type StatusOption<T extends string | number> = { value: T; label: string; count: number; icon: LucideIcon; tone: Tone }

/** Row of large toggle cards (icon, count, label) for filtering a list by status. */
export function StatusFilter<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: StatusOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-3 gap-3 max-sm:gap-1.5 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
      {options.map(({ value: v, label: l, count, icon: Icon, tone }) => {
        const active = v === value
        return (
          <button
            key={String(v)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={cn(
              "flex flex-col items-start gap-3 rounded-2xl border-2 border-transparent bg-muted p-4 text-left max-sm:gap-1 max-sm:rounded-xl max-sm:p-2 transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              active && "border-primary bg-accent hover:bg-accent",
            )}
          >
            <span className={cn("grid size-9 place-items-center rounded-xl max-sm:hidden", tones[tone].bg)}>
              <Icon aria-hidden className={cn("size-4.5", tones[tone].fg)} />
            </span>
            <span className="flex flex-col">
              <span className="text-2xl leading-none font-semibold tabular-nums max-sm:text-base">{count}</span>
              <span className={cn("text-sm text-muted-foreground max-sm:text-xs", active && "text-accent-foreground")}>{l}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
