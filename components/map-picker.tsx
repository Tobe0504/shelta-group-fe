"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { Coords, Place } from "@/lib/types"
import { AddressSearch } from "./address-search"
import { LocationMap } from "./location-map"

export type PickedLocation = { address: string; coords: Coords }

/**
 * Search an address, then drag the pin (or tap the map) to the exact spot.
 * Submits as `address`, `lat` and `lng` fields, so it works inside any form.
 */
export function MapPicker({ initial, onPick, label = "Address" }: { initial?: Partial<PickedLocation>; onPick?: (place: Place) => void; label?: string }) {
  const [address, setAddress] = useState(initial?.address ?? "")
  const [coords, setCoords] = useState<Coords | undefined>(initial?.coords)

  return (
    <Field>
      <FieldLabel htmlFor="map-address">{label}</FieldLabel>
      {coords ? (
        <>
          <div className="flex gap-2">
            <Input id="map-address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={240} required />
            <Button type="button" variant="secondary" onClick={() => setCoords(undefined)}>
              Search again
            </Button>
          </div>
          <LocationMap center={coords} onMove={setCoords} label="Drag the pin to the exact spot" className="h-64 max-sm:h-52" />
          <FieldDescription>Drag the pin, or tap the map, to the exact spot. You can tidy the address text above.</FieldDescription>
          <input type="hidden" name="lat" value={coords.lat} />
          <input type="hidden" name="lng" value={coords.lng} />
        </>
      ) : (
        <AddressSearch
          label={label}
          placeholder="Search street, estate or landmark"
          onSelect={(p) => {
            setAddress(p.label)
            setCoords(p.coords)
            onPick?.(p)
          }}
        />
      )}
    </Field>
  )
}

/** Reads what a MapPicker put in a form. */
export function readLocation(form: FormData): PickedLocation | null {
  const lat = Number(form.get("lat"))
  const lng = Number(form.get("lng"))
  const address = String(form.get("address") ?? "").trim()
  return address && lat && lng ? { address, coords: { lat, lng } } : null
}
