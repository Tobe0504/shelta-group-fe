"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"
import { BrickWall, FileText, HardHat, House, SunMedium, Paintbrush, Pause, Play, Grid2x2, Truck, Wrench, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import type { Promo } from "@/lib/types"
import { cn } from "@/lib/utils"

const icons: Record<Promo["icon"], LucideIcon> = { cement: BrickWall, rods: Wrench, roof: House, truck: Truck, quote: FileText, paint: Paintbrush, tiles: Grid2x2, solar: SunMedium, safety: HardHat }

const themes: Record<Promo["theme"], string> = {
  primary: "bg-primary text-primary-foreground",
  dark: "bg-foreground text-background",
  deal: "bg-deal text-deal-foreground",
  success: "bg-success text-white",
}

const sizes = {
  hero: { slide: "min-h-72 p-8 lg:p-10", title: "text-3xl sm:text-4xl max-w-md", icon: "size-40 sm:size-52" },
  banner: { slide: "min-h-40 p-6 sm:px-8", title: "text-xl sm:text-2xl max-w-sm", icon: "size-28 sm:size-32" },
}

/** Auto-advancing ad carousel. Pauses on hover/focus, never autoplays with reduced motion, and has a pause button. */
export function PromoCarousel({ promos, size = "hero", label = "Offers", className }: { promos: Promo[]; size?: keyof typeof sizes; label?: string; className?: string }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [plugin] = useState(() => Autoplay({ delay: 6000, stopOnMouseEnter: true, stopOnFocusIn: true, stopOnInteraction: false, playOnInit: false }))
  const s = sizes[size]
  const multiple = promos.length > 1

  useEffect(() => {
    if (!api) return
    const sync = () => setCurrent(api.selectedScrollSnap())
    sync()
    api.on("select", sync).on("reInit", sync)
    return () => void api.off("select", sync).off("reInit", sync)
  }, [api])

  useEffect(() => {
    const autoplay = api?.plugins().autoplay
    if (!autoplay) return
    if (playing && multiple && !matchMedia("(prefers-reduced-motion: reduce)").matches) autoplay.play()
    else autoplay.stop()
  }, [api, playing, multiple])

  return (
    <Carousel setApi={setApi} opts={{ loop: true }} plugins={[plugin]} aria-label={label} className={cn("group/promo", className)}>
      <CarouselContent>
        {promos.map((p, i) => {
          const Icon = icons[p.icon]
          return (
            <CarouselItem key={p.id} aria-label={`${i + 1} of ${promos.length}`}>
              <div className={cn("relative flex h-full flex-col justify-center gap-3 overflow-hidden rounded-[28px] max-sm:pb-20", themes[p.theme], s.slide)}>
                <Icon aria-hidden strokeWidth={1} className={cn("pointer-events-none absolute -right-4 -bottom-6 opacity-15", s.icon)} />
                <span className="flex flex-wrap items-center gap-2">
                  <Badge variant={p.theme === "deal" ? "secondary" : "deal"} className="h-7 px-3 text-sm">{p.badge}</Badge>
                  {p.sponsor && <span className="text-sm opacity-80">Ad · {p.sponsor}</span>}
                </span>
                <h2 className={cn("relative leading-tight font-semibold tracking-tight text-balance", s.title)}>{p.title}</h2>
                <p className="relative opacity-85">{p.text}</p>
                <Button asChild variant="outline" size={size === "hero" ? "lg" : "default"} className="relative mt-1 w-fit border-0 bg-background text-foreground hover:bg-background/90">
                  <Link href={p.href} tabIndex={i === current ? undefined : -1}>{p.cta}</Link>
                </Button>
              </div>
            </CarouselItem>
          )
        })}
      </CarouselContent>
      {multiple && (
        <div className="absolute right-4 bottom-4 flex items-center gap-1 rounded-full bg-background/90 p-1 shadow-sm backdrop-blur sm:right-6 sm:bottom-6">
          <CarouselPrevious variant="ghost" className="static size-8 translate-none" />
          <div className="flex items-center gap-1.5 px-1">
            {promos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === current}
                onClick={() => api?.scrollTo(i)}
                className={cn("h-2 rounded-full bg-foreground/25 transition-all focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none", i === current ? "w-5 bg-foreground" : "w-2 hover:bg-foreground/50")}
              />
            ))}
          </div>
          <CarouselNext variant="ghost" className="static size-8 translate-none" />
          <Button variant="ghost" size="icon-sm" className="size-8" aria-label={playing ? "Pause slides" : "Play slides"} onClick={() => setPlaying((v) => !v)}>
            {playing ? <Pause /> : <Play />}
          </Button>
        </div>
      )}
    </Carousel>
  )
}
