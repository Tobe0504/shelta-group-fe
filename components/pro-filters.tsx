"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeliveryLocation } from "@/hooks/use-location"
import { proSearchUrl } from "@/lib/pro-search"
import type { Department } from "@/lib/types"
import type { ProSearch, ProSort } from "@/services/pros.service"
import { useNavigate } from "./navigation-progress"

const sorts: { value: ProSort; label: string }[] = [
  { value: "best", label: "Best match" },
  { value: "rating", label: "Highest rated" },
  { value: "jobs", label: "Most jobs done" },
  { value: "nearest", label: "Nearest first" },
]

/** Search box and filters for the pro directory. Every change updates the URL. */
export function ProFilters({ search, trades, basePath, fixedTrade }: { search: ProSearch; trades: Department[]; basePath: string; fixedTrade?: boolean }) {
  const { navigate, pending } = useNavigate()
  const { location } = useDeliveryLocation()
  const near = !!(search.lat && search.lng)
  const go = (patch: Partial<ProSearch>) => navigate(proSearchUrl(basePath, { ...search, ...patch, page: 1 }), { replace: true, scroll: false })

  return (
    <div aria-busy={pending} className="flex flex-col gap-3 max-sm:gap-2">
      {search.q && (
        <Button variant="secondary" size="sm" className="w-fit" onClick={() => go({ q: undefined })}>
          Matching “{search.q}” <X aria-hidden />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
      <div className="scrollbar-none flex items-center gap-2 max-sm:-mx-3 max-sm:overflow-x-auto max-sm:px-3 max-sm:pb-0.5">
        {!fixedTrade && (
          <Select value={search.trade ?? "all"} onValueChange={(v) => go({ trade: v === "all" ? undefined : v })}>
            <SelectTrigger aria-label="Trade" size="sm" className="w-auto shrink-0 text-sm data-[size=sm]:rounded-full max-sm:h-8 max-sm:text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All trades</SelectItem>
              {trades.map((d) => (
                <SelectGroup key={d.slug}>
                  <SelectLabel>{d.name}</SelectLabel>
                  {d.categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={search.sort ?? "best"} onValueChange={(v) => go({ sort: v as ProSort, ...(v === "nearest" && !near && location.coords) })}>
          <SelectTrigger aria-label="Sort" size="sm" className="w-auto shrink-0 text-sm data-[size=sm]:rounded-full max-sm:h-8 max-sm:text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sorts.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Label className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 text-sm font-normal whitespace-nowrap has-data-[state=checked]:bg-accent has-data-[state=checked]:text-accent-foreground max-sm:h-8 max-sm:text-xs">
          <Checkbox checked={near} onCheckedChange={(on) => go(on ? location.coords : { lat: undefined, lng: undefined, sort: search.sort === "nearest" ? "best" : search.sort })} />
          Covers {location.area.split(",")[0]}
        </Label>
        <Label className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 text-sm font-normal whitespace-nowrap has-data-[state=checked]:bg-accent has-data-[state=checked]:text-accent-foreground max-sm:h-8 max-sm:text-xs">
          <Checkbox checked={!!search.verified} onCheckedChange={(on) => go({ verified: on === true })} />
          Verified only
        </Label>
      </div>
    </div>
  )
}
