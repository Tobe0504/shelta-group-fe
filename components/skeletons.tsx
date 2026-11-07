import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Loading placeholders shaped like the content they stand in for. Every async boundary uses one.

const repeat = (n: number) => Array.from({ length: n }, (_, i) => i)

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid grid-cols-2 gap-x-4 gap-y-8 max-sm:grid-cols-3 max-sm:gap-x-2 max-sm:gap-y-3.5 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
      {repeat(count).map((i) => (
        <li key={i} className="flex flex-col gap-3 max-sm:gap-1.5">
          <Skeleton className="aspect-square rounded-[20px] max-sm:aspect-5/4 max-sm:rounded-2xl" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-9 rounded-full max-sm:hidden" />
        </li>
      ))}
    </ul>
  )
}

export function TilesSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div aria-hidden className="flex gap-3 overflow-hidden">
      {repeat(count).map((i) => (
        <div key={i} className="flex w-16 shrink-0 flex-col items-center gap-2 max-sm:gap-1 sm:w-26">
          <Skeleton className="size-13 rounded-2xl sm:size-24 sm:rounded-3xl" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  )
}

export function BannerSkeleton({ className }: { className?: string }) {
  return <Skeleton aria-hidden className={cn("min-h-40 rounded-[28px] max-sm:min-h-28 max-sm:rounded-2xl", className)} />
}

/** Stacked cards, e.g. orders, cart shipments, table rows. */
export function ListSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      {repeat(rows).map((i) => (
        <Skeleton key={i} className={cn("h-36 rounded-3xl", className)} />
      ))}
    </div>
  )
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div aria-hidden className="flex flex-col gap-5 rounded-3xl border p-6 max-sm:gap-3 max-sm:rounded-2xl max-sm:p-3">
      {repeat(fields).map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-11 w-36 rounded-full" />
    </div>
  )
}

/** Content plus a sticky summary column (cart, checkout, order tracking). */
export function SplitSkeleton() {
  return (
    <div aria-hidden className="grid items-start gap-8 max-sm:gap-3 lg:grid-cols-[1fr_360px]">
      <ListSkeleton rows={2} className="h-52" />
      <Skeleton className="h-80 rounded-[28px]" />
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div aria-hidden className="container-page flex flex-col gap-10 pt-6 pb-12 max-sm:gap-4 max-sm:pt-3">
      <Skeleton className="h-4 w-64" />
      <div className="grid gap-10 max-sm:gap-4 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-[28px] max-sm:aspect-4/3 max-sm:rounded-2xl" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-40" />
          <div className="grid grid-cols-3 gap-2.5">
            {repeat(3).map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-13 rounded-full" />
          <Skeleton className="h-20 rounded-3xl" />
        </div>
      </div>
    </div>
  )
}

/** Search/listing page: filter rail plus grid. */
export function ResultsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6 max-sm:gap-2">
      <Skeleton className="h-4 w-40 max-sm:hidden" />
      <Skeleton className="h-9 w-72 max-sm:h-6 max-sm:w-48" />
      <div className="flex flex-col gap-10 max-sm:gap-3 lg:flex-row">
        <div className="hidden flex-col gap-3 lg:flex lg:w-60">
          {repeat(10).map((i) => (
            <Skeleton key={i} className={cn("h-5", ["w-3/4", "w-2/3", "w-4/5", "w-1/2"][i % 4])} />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-6">
          <BannerSkeleton />
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  )
}

/** Shaped like ProList: avatar and three lines per card. */
export function ProListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid gap-3 max-sm:gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {repeat(count).map((i) => (
        <li key={i} className="flex gap-3 rounded-3xl p-4 ring-1 ring-border max-sm:gap-2.5 max-sm:rounded-2xl max-sm:p-2.5">
          <Skeleton className="size-14 rounded-full max-sm:size-11" />
          <div className="flex flex-1 flex-col gap-2 max-sm:gap-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  )
}

