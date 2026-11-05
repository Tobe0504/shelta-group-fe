import Image from "next/image"
import { Building2, Hotel, House, MapPin, Trees } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatNaira } from "@/lib/format"
import { tones } from "@/lib/tones"
import type { Estate, EstateKind } from "@/lib/types"
import { cn } from "@/lib/utils"
import { EnquiryDialog } from "./enquiry-dialog"

export const kindIcons: Record<EstateKind, typeof House> = { Land: Trees, Apartment: Building2, House, "Short-let": Hotel }

export function EstateCard({ estate }: { estate: Estate }) {
  const tone = tones[estate.tone]
  const Icon = kindIcons[estate.kind]
  return (
    <Card className="h-full gap-3 p-3">
      <span aria-hidden className={cn("relative grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl", tone.bg)}>
        {estate.images?.[0] ? (
          <Image src={estate.images[0]} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <Icon className={cn("size-10", tone.fg)} strokeWidth={1.6} />
        )}
      </span>
      <div className="flex flex-1 flex-col gap-1 px-1">
        <Badge variant="outline" className="mb-1 bg-background">
          {estate.kind}
        </Badge>
        <h3 className="text-base">{estate.name}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin aria-hidden className="size-3.5" /> {estate.area}, {estate.city}
        </p>
        {estate.detail && <p className="text-sm text-muted-foreground">{estate.detail}</p>}
        <p className="mt-auto pt-2 text-lg font-semibold tabular-nums">
          {formatNaira(estate.price)} {estate.per && <span className="text-sm font-medium text-muted-foreground">{estate.per}</span>}
        </p>
      </div>
      <EnquiryDialog
        topic="estate"
        target={estate.slug}
        title={`Enquire about ${estate.name}`}
        description={`${estate.area}, ${estate.city}`}
        reasons={estate.kind === "Short-let" ? ["Check dates", "Group booking", "Amenities"] : ["Book an inspection", "Payment plans", "Documents"]}
        placeholder="Your question for the developer"
        submitLabel="Send enquiry"
        success="Enquiry sent. The developer will contact you."
      >
        <Button variant="soft" size="sm">
          Enquire
        </Button>
      </EnquiryDialog>
    </Card>
  )
}
