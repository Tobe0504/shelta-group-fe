"use client"

import { useSyncExternalStore } from "react"
import { toast } from "sonner"
import type { Place } from "@/lib/types"

/** Used until the buyer picks where to deliver. */
const DEFAULT: Place = { label: "Ikeja, Lagos", area: "Ikeja, Lagos", state: "Lagos", coords: { lat: 6.6018, lng: 3.3515 } }
const KEY = "sm-location"

// One shared value for every component, backed by localStorage and kept in sync across tabs.
let current: Place | null = null
const listeners = new Set<() => void>()

function read(): Place {
  if (current) return current
  try {
    const stored = localStorage.getItem(KEY)
    current = stored ? (JSON.parse(stored) as Place) : DEFAULT
  } catch {
    current = DEFAULT
  }
  return current
}

function write(place: Place) {
  current = place
  try {
    localStorage.setItem(KEY, JSON.stringify(place))
  } catch {}
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return
    current = null
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

/** Where the buyer wants things delivered, shared across the app and remembered on this device. */
export function useDeliveryLocation() {
  const location = useSyncExternalStore(subscribe, read, () => DEFAULT)
  const setLocation = (place: Place) => {
    write(place)
    toast.success(`Delivering to ${place.area}`)
  }
  return { location, setLocation, isPending: false }
}
