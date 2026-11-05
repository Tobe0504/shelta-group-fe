import Image from "next/image"
import { toneFor } from "@/lib/tones"
import { cn } from "@/lib/utils"
import { CategoryIcon } from "./category-icon"

/** Product photo, or a tinted category placeholder when none has been uploaded. */
export function ProductImage({ category, src, className, sizes = "(min-width: 640px) 240px, 50vw" }: { category: string; src?: string; className?: string; sizes?: string }) {
  const tone = toneFor(category)
  return (
    <div className={cn("relative grid aspect-square place-items-center overflow-hidden rounded-[20px]", tone.soft, className)}>
      {src ? <Image src={src} alt="" fill sizes={sizes} className="object-cover" /> : <CategoryIcon slug={category} className={cn("size-1/3", tone.fg)} />}
    </div>
  )
}
