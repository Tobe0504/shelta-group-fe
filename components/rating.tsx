import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

/** `compact` shrinks the text and drops `extra` on phones, for product cards. */
export function Rating({ value, count, extra, compact }: { value: number; count: number; extra?: string; compact?: boolean }) {
  return (
    <p className={cn("flex items-center gap-1 text-sm text-muted-foreground", compact && "max-sm:gap-0.5 max-sm:text-[11px]")}>
      <Star aria-hidden className="size-3.5 fill-deal text-deal" />
      <span className="text-foreground">{value}</span>
      <span>
        ({count}
        <span className="sr-only"> reviews</span>)
      </span>
      {extra && <span className={cn(compact && "max-sm:hidden")}>· {extra}</span>}
    </p>
  )
}
