import Image from "next/image"
import Link from "next/link"
import { Building2, Hotel, House, MapPin, Trees } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatNaira } from "@/lib/format"
import { tones } from "@/lib/tones"
import type { Estate, EstateKind } from "@/lib/types"
import { cn } from "@/lib/utils"
import { EstateEnquire } from "./estate-enquire"

export const kindIcons: Record<EstateKind, typeof House> = { Land: Trees, Apartment: Building2, House, "Short-let": Hotel }

export function EstateCard({ estate }: { estate: Estate }) {
  const tone = tones[estate.tone]
  const Icon = kindIcons[estate.kind]
  return (
    <Card className="relative h-full gap-3 p-3 transition-colors hover:bg-muted/40 max-sm:gap-1.5 max-sm:p-2">
      <span aria-hidden className={cn("relative grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl max-sm:rounded-xl", tone.bg)}>
        {estate.images?.[0] ? (
          <Image src={estate.images[0]} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <Icon className={cn("size-10 max-sm:size-7", tone.fg)} strokeWidth={1.6} />
        )}
      </span>
      <div className="flex flex-1 flex-col gap-1 px-1 max-sm:gap-0.5 max-sm:px-0.5">
        <Badge variant="outline" className="mb-1 bg-background max-sm:mb-0 max-sm:h-5 max-sm:px-1.5 max-sm:text-[11px]">
          {estate.kind}
        </Badge>
        <h3 className="text-base max-sm:line-clamp-1 max-sm:text-sm">
          <Link href={`/real-estate/${estate.slug}`} className="after:absolute after:inset-0 hover:text-primary focus-visible:underline">
            {estate.name}
          </Link>
        </h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground max-sm:text-xs">
          <MapPin aria-hidden className="size-3.5 shrink-0 max-sm:size-3" /> {estate.area}, {estate.city}
        </p>
        {estate.detail && <p className="text-sm text-muted-foreground max-sm:line-clamp-1 max-sm:text-xs">{estate.detail}</p>}
        <p className="mt-auto pt-2 text-lg font-semibold tabular-nums max-sm:pt-1 max-sm:text-sm">
          {formatNaira(estate.price)} {estate.per && <span className="text-sm font-medium text-muted-foreground max-sm:text-xs">{estate.per}</span>}
        </p>
      </div>
      <EstateEnquire estate={estate}>
        <Button variant="soft" size="sm" className="relative z-10 max-sm:h-7 max-sm:text-xs">
          Enquire
        </Button>
      </EstateEnquire>
    </Card>
  )
}
