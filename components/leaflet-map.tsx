"use client"

import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect } from "react"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"
import type { Coords } from "@/lib/types"
import { cn } from "@/lib/utils"

/** A CSS pin, so no marker images need bundling. */
const pin = L.divIcon({
  className: "",
  html: '<span class="block size-7 -rotate-45 rounded-full rounded-bl-none bg-primary shadow-md ring-4 ring-white"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 30],
})

function Follow({ center }: { center: Coords }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom())
  }, [map, center.lat, center.lng])
  return null
}

function ClickToMove({ onMove }: { onMove: (c: Coords) => void }) {
  useMapEvents({ click: (e) => onMove({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

/** OpenStreetMap with one pin. With `onMove`, the pin can be dragged or placed by tapping the map. */
export function LeafletMap({ center, onMove, zoom = 15, label, className }: { center: Coords; onMove?: (c: Coords) => void; zoom?: number; label: string; className?: string }) {
  return (
    <div role="region" aria-label={label} className={cn("isolate overflow-hidden rounded-2xl ring-1 ring-border", className)}>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false} className="size-full min-h-56">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker
          position={[center.lat, center.lng]}
          icon={pin}
          draggable={!!onMove}
          eventHandlers={onMove && { dragend: (e) => onMove((e.target as L.Marker).getLatLng()) }}
          keyboard={false}
        />
        <Follow center={center} />
        {onMove && <ClickToMove onMove={onMove} />}
      </MapContainer>
    </div>
  )
}
