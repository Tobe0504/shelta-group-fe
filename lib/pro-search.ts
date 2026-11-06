import type { ProSearch, ProSort } from "@/services/pros.service"

const sorts: ProSort[] = ["best", "rating", "jobs", "nearest"]
type Params = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Reads the pro directory's filters from the URL. */
export function readProSearch(params: Params): Required<Pick<ProSearch, "page">> & ProSearch {
  const lat = Number(first(params.lat))
  const lng = Number(first(params.lng))
  const sort = sorts.find((s) => s === first(params.sort))
  return {
    q: first(params.q)?.trim() || undefined,
    trade: first(params.trade) || undefined,
    verified: first(params.verified) === "1",
    sort: sort ?? "best",
    ...(lat && lng && { lat, lng }),
    page: Math.max(1, Number(first(params.page)) || 1),
  }
}

/** Builds a directory URL, dropping defaults so links stay short. */
export function proSearchUrl(base: string, s: ProSearch) {
  const p = new URLSearchParams()
  if (s.q) p.set("q", s.q)
  if (s.trade) p.set("trade", s.trade)
  if (s.verified) p.set("verified", "1")
  if (s.sort && s.sort !== "best") p.set("sort", s.sort)
  if (s.lat && s.lng) {
    p.set("lat", s.lat.toFixed(4))
    p.set("lng", s.lng.toFixed(4))
  }
  if (s.page && s.page > 1) p.set("page", String(s.page))
  const qs = p.toString()
  return qs ? `${base}?${qs}` : base
}
