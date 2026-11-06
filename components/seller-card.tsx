import type { Store } from "@/lib/types"
import { cn } from "@/lib/utils"
import { VerifiedBadge } from "./verified-badge"

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")

/** Seller avatar, name and meta line. `children` slots in actions on the right. */
export function SellerCard({
  seller,
  showMeta = true,
  className,
  children,
}: {
  seller: Pick<Store, "name" | "verified"> & Partial<Pick<Store, "location" | "replyTime">>
  showMeta?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <span aria-hidden className="grid size-11 place-items-center rounded-xl max-sm:size-8 max-sm:rounded-lg max-sm:text-xs bg-[#FFE8D6] font-semibold text-[#9A3412]">
        {initials(seller.name)}
      </span>
      <span className="flex min-w-40 flex-1 flex-col max-sm:min-w-0 max-sm:text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          {seller.name}
          {seller.verified && <VerifiedBadge />}
        </span>
        {showMeta && (
          <span className="text-sm text-muted-foreground max-sm:text-xs">{[seller.location, seller.replyTime && `replies in ${seller.replyTime}`].filter(Boolean).join(" · ")}</span>
        )}
      </span>
      {children}
    </div>
  )
}
