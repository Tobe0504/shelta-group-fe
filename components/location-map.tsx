"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

/** Leaflet needs the browser, so the map loads on the client with a placeholder of the same size. */
export const LocationMap = dynamic(() => import("./leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-56 rounded-2xl" />,
})
