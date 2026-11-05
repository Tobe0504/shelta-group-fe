"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import type { Coords } from "@/lib/types"
import { geoService } from "@/services/geo.service"
import { useDebouncedValue } from "./use-debounced-value"

/** Type-as-you-search address suggestions (debounced, cached for the session). */
export function useAddressSearch(query: string, near?: Coords) {
  const q = useDebouncedValue(query.trim(), 350)
  return useQuery({
    queryKey: ["geo", q, near?.lat.toFixed(2), near?.lng.toFixed(2)],
    queryFn: () => geoService.search(q, near),
    enabled: q.length >= 3,
    staleTime: Infinity,
    placeholderData: (prev) => prev,
  })
}

/** Asks the browser for the device's position, then names it. */
export const useCurrentLocation = () =>
  useMutation({
    mutationFn: () =>
      new Promise<Coords>((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("Your browser can’t share its location"))
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => reject(new Error("Allow location access, or search for your address instead")),
          { enableHighAccuracy: true, timeout: 10_000 },
        )
      }).then(geoService.reverse),
    meta: { silent: true },
  })
