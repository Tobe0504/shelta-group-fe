import { data, http } from "@/lib/http"
import type { Coords, Place } from "@/lib/types"

export const geoService = {
  /** Address suggestions in Nigeria, ranked closer to `near` when given. */
  search: (q: string, near?: Coords) => http.get("/geo/search", { params: { q, lat: near?.lat, lng: near?.lng } }).then(data<Place[]>),
  reverse: (coords: Coords) => http.get("/geo/reverse", { params: coords }).then(data<Place>),
}
