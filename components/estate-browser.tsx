"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { estateKinds } from "@/lib/data"
import type { Estate } from "@/lib/types"
import { cn } from "@/lib/utils"
import { EstateCard, kindIcons } from "./estate-card"

/** Real estate listings with type chips and a city picker. */
export function EstateBrowser({ estates, initialKind = "all" }: { estates: Estate[]; initialKind?: string }) {
  const cities = [...new Set(estates.map((e) => e.city))].sort()
  const [kind, setKind] = useState(initialKind)
  const [city, setCity] = useState("all")
  const shown = estates.filter((e) => (kind === "all" || e.kind === kind) && (city === "all" || e.city === city))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Property type" className="flex flex-wrap gap-2">
          {["all", ...estateKinds].map((k) => {
            const Icon = k === "all" ? null : kindIcons[k as keyof typeof kindIcons]
            return (
              <Button key={k} variant={kind === k ? "dark" : "secondary"} aria-pressed={kind === k} onClick={() => setKind(k)}>
                {Icon && <Icon aria-hidden />}
                {k === "all" ? "All properties" : k}
                <span className={cn("text-muted-foreground", kind === k && "text-background/70")}>
                  {estates.filter((e) => k === "all" || e.kind === k).length}
                </span>
              </Button>
            )
          })}
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger aria-label="City" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {shown.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((e) => (
            <li key={e.slug}>
              <EstateCard estate={e} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl bg-muted p-12 text-center text-muted-foreground">No properties match. Try another city or type.</p>
      )}
    </div>
  )
}
