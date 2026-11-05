import { Star } from "lucide-react"

export function Rating({ value, count, extra }: { value: number; count: number; extra?: string }) {
  return (
    <p className="flex items-center gap-1 text-sm text-muted-foreground">
      <Star aria-hidden className="size-3.5 fill-deal text-deal" />
      <span className="text-foreground">{value}</span>
      <span>
        ({count}
        <span className="sr-only"> reviews</span>)
      </span>
      {extra && <span>· {extra}</span>}
    </p>
  )
}
