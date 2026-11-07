import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { tones } from "@/lib/tones"
import type { Tone } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CategoryIcon } from "./category-icon"

export type Tile = { slug: string; name: string; tone?: Tone; href: string; note?: string }

const arrow = "top-9 bottom-auto my-0 z-10 bg-background shadow-md disabled:opacity-0 sm:top-12 max-sm:hidden"

/** One scrollable row of icon tiles (departments, categories or trades); drag, swipe or use the arrows. */
export function CategoryTiles({ items, label = "Shop by category" }: { items: Tile[]; label?: string }) {
  return (
    <nav aria-label={label}>
      <Carousel opts={{ align: "start", dragFree: true, slidesToScroll: "auto" }}>
        <CarouselContent className="-ml-3 max-sm:-ml-2">
          {items.map((c) => {
            const tone = tones[c.tone ?? "blue"]
            return (
              <CarouselItem key={c.slug} className="basis-auto pl-3 max-sm:pl-2">
                <Link href={c.href} className="group flex w-16 flex-col items-center gap-2 text-center text-sm max-sm:gap-1 max-sm:text-xs max-sm:leading-tight sm:w-26">
                  <span className={cn("grid size-13 place-items-center rounded-2xl transition-transform group-hover:-translate-y-0.5 sm:size-24 sm:rounded-3xl", tone.bg)}>
                    <CategoryIcon slug={c.slug} className={cn("size-6 sm:size-10", tone.fg)} />
                  </span>
                  <span className="text-balance">{c.name}</span>
                  {c.note && <span className="-mt-1 text-xs text-muted-foreground max-sm:-mt-0.5 max-sm:text-[11px]">{c.note}</span>}
                </Link>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious className={cn(arrow, "left-0 -translate-x-1/2")} />
        <CarouselNext className={cn(arrow, "right-0 translate-x-1/2")} />
      </Carousel>
    </nav>
  )
}
