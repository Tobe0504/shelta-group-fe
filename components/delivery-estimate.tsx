"use client"

import { Truck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings } from "@/hooks/use-catalog"
import { useDeliveryLocation } from "@/hooks/use-location"
import { formatKm, quoteDelivery } from "@/lib/delivery"
import { deliveryLabel, formatNaira } from "@/lib/format"
import type { Coords } from "@/lib/types"
import { InfoTile } from "./info-tile"
import { LocationPicker } from "./location-picker"

/** Estimated delivery fee from the seller's warehouse to the buyer's location, with a shortcut to change it. */
export function DeliveryEstimate({ days, from, className }: { days: number; from?: Coords; className?: string }) {
  const { location, isPending } = useDeliveryLocation()
  const rates = useSettings().data?.delivery
  const quote = rates && quoteDelivery(rates, from, location.coords)
  return (
    <InfoTile icon={Truck} tone="mint" title={quote && !quote.inRange ? "Outside this seller’s delivery range" : deliveryLabel(days)} className={className}>
      {quote && !isPending ? (
        <>
          To {location.area} · {quote.distanceKm !== null && `${formatKm(quote.distanceKm)} · `}
          {formatNaira(quote.fee)}{" "}
          <LocationPicker>
            <button type="button" className="font-semibold text-primary underline-offset-4 hover:underline">
              Change
            </button>
          </LocationPicker>
        </>
      ) : (
        <Skeleton className="h-4 w-32" />
      )}
    </InfoTile>
  )
}
