import { BadgeCheck } from "lucide-react"

export function VerifiedBadge({ label = "Verified seller" }: { label?: string }) {
  return <BadgeCheck role="img" aria-label={label} className="size-4 shrink-0 fill-primary text-background" />
}
