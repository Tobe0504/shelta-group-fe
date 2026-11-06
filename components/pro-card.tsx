import Link from "next/link"
import { MapPin } from "lucide-react"
import { formatRate } from "@/lib/format"
import type { Pro } from "@/lib/types"
import { Rating } from "./rating"
import { UserAvatar } from "./user-avatar"
import { VerifiedBadge } from "./verified-badge"

/** Photo or initials for a pro. */
export function ProAvatar({ pro, className }: { pro: Pick<Pro, "name" | "photo">; className?: string }) {
  return <UserAvatar user={{ name: pro.name, avatar: pro.photo }} className={className} />
}

/** Name line with the verified tick. */
export function ProName({ pro, className }: { pro: Pick<Pro, "name" | "verified">; className?: string }) {
  return (
    <span className={className}>
      <span className="inline-flex max-w-full items-center gap-1">
        <span className="truncate">{pro.name}</span>
        {pro.verified && <VerifiedBadge label="Verified pro" />}
      </span>
    </span>
  )
}

export function ProCard({ pro }: { pro: Pro }) {
  return (
    <article className="relative flex h-full gap-3 rounded-3xl p-4 ring-1 ring-border transition-colors hover:bg-muted/60 max-sm:gap-2.5 max-sm:rounded-2xl max-sm:p-2.5">
      <ProAvatar pro={pro} className="size-14 text-lg max-sm:size-11 max-sm:text-sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="font-semibold max-sm:text-sm">
          <Link href={`/pros/${pro.slug}`} className="after:absolute after:inset-0 focus-visible:underline">
            <ProName pro={pro} />
          </Link>
        </h3>
        <p className="line-clamp-1 text-sm text-muted-foreground max-sm:text-xs">{pro.headline}</p>
        <Rating value={pro.rating} count={pro.reviewCount} extra={`${pro.jobsDone} jobs`} compact />
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground max-sm:text-[11px]">
          <span className="inline-flex items-center gap-0.5">
            <MapPin aria-hidden className="size-3" /> {pro.location}
            {pro.distanceKm != null && ` · ${pro.distanceKm} km`}
          </span>
          {pro.rate && <span className="font-medium text-foreground">{formatRate(pro.rate)}</span>}
        </p>
      </div>
    </article>
  )
}

export function ProList({ pros, empty = "No pros here yet." }: { pros: Pro[]; empty?: string }) {
  if (!pros.length) return <p className="rounded-3xl bg-muted p-10 text-center text-muted-foreground max-sm:rounded-2xl max-sm:p-6 max-sm:text-sm">{empty}</p>
  return (
    <ul className="grid gap-3 max-sm:gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {pros.map((p) => (
        <li key={p.id}>
          <ProCard pro={p} />
        </li>
      ))}
    </ul>
  )
}
