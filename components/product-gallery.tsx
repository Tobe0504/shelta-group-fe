"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ProductImage } from "./product-image"

/** Main product photo with thumbnails to switch between every uploaded image. */
export function ProductGallery({ images, category, name }: { images: string[]; category: string; name: string }) {
  const [active, setActive] = useState(0)
  const main = images[active] ?? images[0]
  return (
    <div className="flex flex-col gap-3">
      <ProductImage category={category} src={main} sizes="(min-width: 1024px) 50vw, 100vw" className="rounded-[28px]" />
      {images.length > 1 && (
        <ul aria-label={`Photos of ${name}`} className="grid grid-cols-5 gap-2.5">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  "block w-full rounded-2xl ring-2 ring-transparent ring-offset-2 transition focus-visible:ring-ring focus-visible:outline-none",
                  i === active ? "ring-primary" : "opacity-75 hover:opacity-100",
                )}
              >
                <ProductImage category={category} src={src} sizes="120px" className="rounded-2xl" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
