"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/** Full-screen photo with previous/next (buttons or arrow keys) and a counter. */
function Lightbox({ images, alt, index, onIndex, onClose }: { images: string[]; alt: string; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const open = index !== null
  const i = index ?? 0
  const go = (step: number) => onIndex((i + step + images.length) % images.length)
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="flex h-[92dvh] max-w-[min(96vw,1200px)] flex-col gap-3 border-0 bg-black p-3 text-white sm:max-w-[min(96vw,1200px)] [&>button]:text-white"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1)
          if (e.key === "ArrowLeft") go(-1)
        }}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogDescription className="text-center text-sm text-white/70 tabular-nums">
          {i + 1} of {images.length}
        </DialogDescription>
        <div className="relative flex-1">{open && <Image src={images[i]} alt={`${alt}, photo ${i + 1}`} fill sizes="96vw" className="object-contain" priority />}</div>
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" size="icon" aria-label="Previous photo" onClick={() => go(-1)}>
              <ChevronLeft aria-hidden />
            </Button>
            <ul className="scrollbar-none flex max-w-[60vw] gap-1.5 overflow-x-auto">
              {images.map((src, j) => (
                <li key={src}>
                  <button type="button" aria-label={`Show photo ${j + 1}`} aria-current={j === i} onClick={() => onIndex(j)} className={cn("relative block size-12 overflow-hidden rounded-lg ring-2 ring-transparent max-sm:size-9", j === i ? "ring-white" : "opacity-60 hover:opacity-100")}>
                    <Image src={src} alt="" fill sizes="48px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="icon" aria-label="Next photo" onClick={() => go(1)}>
              <ChevronRight aria-hidden />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Large cover photo with thumbnails; any photo opens full screen. */
export function PhotoGallery({ images, alt, fallback, className }: { images: string[]; alt: string; fallback?: React.ReactNode; className?: string }) {
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState<number | null>(null)
  if (!images.length) return fallback ?? null
  return (
    <div className={cn("flex flex-col gap-2.5 max-sm:gap-1.5", className)}>
      <button type="button" onClick={() => setOpen(active)} className="group relative aspect-[4/3] overflow-hidden rounded-[28px] bg-muted max-sm:rounded-2xl">
        <Image src={images[active]} alt={`${alt}, photo ${active + 1}`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform group-hover:scale-[1.02]" priority />
        <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white max-sm:right-2 max-sm:bottom-2">
          <Expand aria-hidden className="size-3.5" /> {images.length > 1 ? `View ${images.length} photos` : "View full size"}
        </span>
      </button>
      {images.length > 1 && (
        <ul aria-label={`Photos of ${alt}`} className="grid grid-cols-6 gap-2 max-sm:gap-1.5">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                className={cn("relative block aspect-square w-full overflow-hidden rounded-xl ring-2 ring-transparent ring-offset-2 focus-visible:ring-ring focus-visible:outline-none max-sm:rounded-lg max-sm:ring-offset-1", i === active ? "ring-primary" : "opacity-75 hover:opacity-100")}
              >
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Lightbox images={images} alt={alt} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </div>
  )
}

/** A grid of thumbnails that open full screen. */
export function PhotoGrid({ images, alt, className }: { images: string[]; alt: string; className?: string }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!images.length) return null
  return (
    <>
      <ul aria-label={`Photos: ${alt}`} className={cn("grid grid-cols-4 gap-2 max-sm:grid-cols-3 max-sm:gap-1.5 sm:grid-cols-6", className)}>
        {images.map((src, i) => (
          <li key={src}>
            <button type="button" aria-label={`Open photo ${i + 1} full size`} onClick={() => setOpen(i)} className="relative block aspect-square w-full overflow-hidden rounded-xl bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none max-sm:rounded-lg">
              <Image src={src} alt="" fill sizes="(min-width: 640px) 160px, 33vw" className="object-cover transition-transform hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox images={images} alt={alt} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  )
}
