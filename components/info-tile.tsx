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
}: {
  icon: LucideIcon
  tone: Tone
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tones[tone].bg)}>
        <Icon aria-hidden className={cn("size-5", tones[tone].fg)} />
      </span>
      <div className="flex flex-col text-sm">
        <span className="font-medium">{title}</span>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}
