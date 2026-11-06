import type { LucideIcon } from "lucide-react"
import { tones } from "@/lib/tones"
import type { Tone } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Icon + title + description, used for benefits, delivery and protection notes. */
export function InfoTile({
  icon: Icon,
  tone,
  title,
  children,
  className,
  compact,
}: {
  icon: LucideIcon
  tone: Tone
  title: string
  children: React.ReactNode
  className?: string
  /** On phones: icon and title only, on one small line. */
  compact?: boolean
}) {
  return (
    <div className={cn("flex items-start gap-3 max-sm:gap-2", compact && "max-sm:items-center max-sm:gap-1.5", className)}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl max-sm:size-8", compact && "max-sm:size-6 max-sm:rounded-md", tones[tone].bg)}>
        <Icon aria-hidden className={cn("size-5", compact && "max-sm:size-3.5", tones[tone].fg)} />
      </span>
      <div className="flex flex-col text-sm">
        <span className={cn("font-medium", compact && "max-sm:text-xs max-sm:whitespace-nowrap")}>{title}</span>
        <div className={cn("text-muted-foreground", compact && "max-sm:hidden")}>{children}</div>
      </div>
    </div>
  )
}
