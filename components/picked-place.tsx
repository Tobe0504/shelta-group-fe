import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Place } from "@/lib/types"

/** The address chosen in an AddressSearch, with a way to search again. */
export function PickedPlace({ place, onChange }: { place: Place; onChange: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-accent p-3 text-accent-foreground">
      <MapPin aria-hidden className="size-5 shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{place.label}</span>
        <span className="truncate text-sm opacity-80">{[place.area, place.state].filter(Boolean).join(" · ")}</span>
      </span>
      <Button type="button" variant="outline" size="sm" className="border-0" onClick={onChange}>
        Change
      </Button>
    </div>
  )
}
