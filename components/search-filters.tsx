"use client"

import { usePathname } from "next/navigation"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Department } from "@/lib/types"
import { useNavigate } from "./navigation-progress"

export type Filters = { q?: string; category?: string; brands?: string[]; deals?: boolean; sort?: "best" | "price-asc" | "price-desc" }

const sorts = [
  { value: "best", label: "Best match" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

/** Builds the /search URL for a set of filters, dropping empty values. */
function toUrl(f: Filters) {
  const p = new URLSearchParams()
  if (f.q) p.set("q", f.q)
  if (f.category) p.set("category", f.category)
  f.brands?.forEach((b) => p.append("brand", b))
  if (f.deals) p.set("deals", "1")
  if (f.sort && f.sort !== "best") p.set("sort", f.sort)
  const qs = p.toString()
  return qs ? `/search?${qs}` : "/search"
}

function Option({ id, label, control }: { id: string; label: string; control: React.ReactNode }) {
  return (
    <div className="flex min-h-9 items-center gap-3">
      {control}
      <Label htmlFor={id} className="cursor-pointer font-medium">
        {label}
      </Label>
    </div>
  )
}

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-2 font-semibold">{legend}</legend>
      {children}
    </fieldset>
  )
}

/** Live filters: every change updates the URL, so results, back button and sharing all work. */
export function SearchFilters({ filters, departments, brands }: { filters: Filters; departments: Department[]; brands: string[] }) {
  const pathname = usePathname()
  const { navigate, pending } = useNavigate()
  const update = (patch: Partial<Filters>) => navigate(toUrl({ ...filters, ...patch }), { replace: true, scroll: false })
  const active = [
    filters.q && { label: `“${filters.q}”`, clear: { q: undefined } },
    filters.category && { label: departments.flatMap((d) => d.categories).find((c) => c.slug === filters.category)?.name ?? filters.category, clear: { category: undefined } },
    ...(filters.brands ?? []).map((b) => ({ label: b, clear: { brands: filters.brands?.filter((x) => x !== b) } })),
    filters.deals && { label: "On sale", clear: { deals: false } },
  ].filter(Boolean) as { label: string; clear: Partial<Filters> }[]

  const panel = (
    <div aria-busy={pending} className="flex flex-col gap-5">
      <Group legend="Sort by">
        <RadioGroup value={filters.sort ?? "best"} onValueChange={(v) => update({ sort: v as Filters["sort"] })} className="gap-1">
          {sorts.map((s) => (
            <Option key={s.value} id={`sort-${s.value}`} label={s.label} control={<RadioGroupItem id={`sort-${s.value}`} value={s.value} />} />
          ))}
        </RadioGroup>
      </Group>
      <Separator />
      <Group legend="Category">
        <RadioGroup value={filters.category ?? ""} onValueChange={(v) => update({ category: v || undefined, brands: [] })} className="gap-1">
          <Option id="cat-all" label="All categories" control={<RadioGroupItem id="cat-all" value="" />} />
          {departments.map((d) => (
            <div key={d.slug} role="group" aria-labelledby={`cat-dept-${d.slug}`} className="flex flex-col gap-1">
              <span id={`cat-dept-${d.slug}`} className="mt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {d.name}
              </span>
              {d.categories.map((c) => (
                <Option key={c.slug} id={`cat-${c.slug}`} label={c.name} control={<RadioGroupItem id={`cat-${c.slug}`} value={c.slug} />} />
              ))}
            </div>
          ))}
        </RadioGroup>
      </Group>
      <Separator />
      <Group legend="Brand">
        {brands.map((b) => (
          <Option
            key={b}
            id={`brand-${b}`}
            label={b}
            control={
              <Checkbox
                id={`brand-${b}`}
                checked={filters.brands?.includes(b) ?? false}
                onCheckedChange={(on) => update({ brands: on ? [...(filters.brands ?? []), b] : filters.brands?.filter((x) => x !== b) })}
              />
            }
          />
        ))}
      </Group>
      <Separator />
      <Option id="deals" label="On sale only" control={<Checkbox id="deals" checked={filters.deals ?? false} onCheckedChange={(on) => update({ deals: on === true })} />} />
    </div>
  )

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 max-sm:gap-1.5 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm">
              {pending ? <Spinner aria-label="Updating results" /> : <SlidersHorizontal aria-hidden />} Filters &amp; sort
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">Filters &amp; sort {pending && <Spinner aria-label="Updating results" className="size-4 text-primary" />}</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-8">{panel}</div>
          </SheetContent>
        </Sheet>
        {active.length > 0 && (
          <ul aria-label="Active filters" className="contents">
            {active.map((a) => (
              <li key={a.label}>
                <Button variant="secondary" size="sm" onClick={() => update(a.clear)}>
                  {a.label} <X aria-hidden />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
        {active.length > 1 && (
          <Button variant="ghost" size="sm" onClick={() => navigate(pathname, { replace: true })}>
            Clear all
          </Button>
        )}
      </div>
      <div className="hidden lg:sticky lg:top-32 lg:block lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg max-sm:text-base">
            Filters {pending && <Spinner aria-label="Updating results" className="size-4 text-primary" />}
          </h2>
          {active.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate(pathname, { replace: true })}>
              Clear all
            </Button>
          )}
        </div>
        {panel}
      </div>
    </>
  )
}
