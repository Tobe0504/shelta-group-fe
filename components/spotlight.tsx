"use client"

import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Building2, CornerDownLeft, FileText, Hammer, Headset, Search, Tags, Users } from "lucide-react"
import { CommandDialog, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Spinner } from "@/components/ui/spinner"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatNaira } from "@/lib/format"
import { keys } from "@/lib/query-keys"
import { tones } from "@/lib/tones"
import { cn } from "@/lib/utils"
import { searchService } from "@/services/search.service"
import { CategoryIcon } from "./category-icon"
import { useNavigate } from "./navigation-progress"
import { ProductImage } from "./product-image"
import { UserAvatar } from "./user-avatar"
import { VerifiedBadge } from "./verified-badge"

const shortcuts = [
  { label: "Today’s deals", href: "/search?deals=1", icon: Tags },
  { label: "Hire a pro", href: "/services", icon: Hammer },
  { label: "Find a pro", href: "/pros", icon: Users },
  { label: "Real estate", href: "/real-estate", icon: Building2 },
  { label: "Request a quote", href: "/quote", icon: FileText },
  { label: "Help & support", href: "/help", icon: Headset },
]

/**
 * One search for everything (products, categories, trades, pros, properties), opened from the header
 * box, ⌘K / Ctrl+K, or "/". Results update as you type; Enter on the first row searches all products.
 */
export function Spotlight() {
  const params = useSearchParams()
  const onResults = usePathname() === "/search"
  const current = onResults ? (params.get("q") ?? "") : ""
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const term = useDebouncedValue(q.trim(), 200)
  const { navigate } = useNavigate()
  const results = useQuery({ queryKey: keys.spotlight(term), queryFn: () => searchService.everything(term), enabled: open && term.length >= 2, staleTime: 60_000, placeholderData: (prev) => prev })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName))
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    navigate(href)
  }
  const r = term.length >= 2 ? results.data : undefined
  const found = r && r.products.length + r.pros.length + r.categories.length + r.departments.length + r.estates.length

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setQ(current)
          setOpen(true)
        }}
        className="flex h-12 w-full items-center gap-3 rounded-full bg-secondary pr-2 pl-4 text-left text-base text-muted-foreground transition-colors hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_4%)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none max-sm:h-10 max-sm:text-sm"
      >
        <Search aria-hidden className="size-4 shrink-0" />
        <span className={cn("flex-1 truncate", current && "text-foreground")}>{current || "Search products, pros, services, property…"}</span>
        <kbd className="rounded-md bg-background px-1.5 py-0.5 font-sans text-xs max-md:hidden">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} showCloseButton title="Search SheltaMart" description="Search products, categories, pros and properties" className="max-sm:top-0 max-sm:h-dvh max-sm:max-w-full max-sm:rounded-none! sm:max-w-xl">
        <Command shouldFilter={false} className="max-sm:h-full">
          <CommandInput value={q} onValueChange={setQ} placeholder="Search products, pros, services, property…" className="pr-8" />
          <CommandList className="max-h-[min(70vh,32rem)] max-sm:max-h-none max-sm:flex-1">
            {q.trim().length >= 2 && results.isFetching && !found && (
              <div role="status" className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                <Spinner /> Searching…
              </div>
            )}
            {q.trim() && (
              <CommandGroup heading="Search">
                <CommandItem value={`all-products:${q}`} onSelect={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}>
                  <Search aria-hidden /> Products matching “{q.trim()}”
                  <CornerDownLeft aria-hidden className="ml-auto text-muted-foreground" />
                </CommandItem>
                <CommandItem value={`all-pros:${q}`} onSelect={() => go(`/pros?q=${encodeURIComponent(q.trim())}`)}>
                  <Users aria-hidden /> Pros and services matching “{q.trim()}”
                </CommandItem>
              </CommandGroup>
            )}
            {!q.trim() && (
              <CommandGroup heading="Go to">
                {shortcuts.map(({ label, href, icon: Icon }) => (
                  <CommandItem key={href} value={href} onSelect={() => go(href)}>
                    <Icon aria-hidden /> {label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {r && !results.isFetching && !found && <CommandEmpty>Nothing matches “{term}”. Try a product, trade or area.</CommandEmpty>}
            {r && r.departments.length + r.categories.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Categories and trades">
                  {r.departments.map((d) => (
                    <CommandItem key={`d-${d.slug}`} value={`d-${d.slug}`} onSelect={() => go(`/departments/${d.slug}`)}>
                      <span className={cn("grid size-7 place-items-center rounded-md", tones[d.tone ?? "blue"].bg)}>
                        <CategoryIcon slug={d.slug} className={cn("size-4", tones[d.tone ?? "blue"].fg)} />
                      </span>
                      {d.name} <span className="ml-auto text-xs text-muted-foreground">Department</span>
                    </CommandItem>
                  ))}
                  {r.categories.map((c) => (
                    <CommandItem key={`c-${c.slug}`} value={`c-${c.slug}`} onSelect={() => go(c.service ? `/services/${c.slug}` : `/search?category=${c.slug}`)}>
                      <span className={cn("grid size-7 place-items-center rounded-md", tones[c.tone].bg)}>
                        <CategoryIcon slug={c.slug} className={cn("size-4", tones[c.tone].fg)} />
                      </span>
                      {c.name} <span className="ml-auto text-xs text-muted-foreground">{c.service ? "Hire a pro" : "Products"}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {r && r.products.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Products">
                  {r.products.map((p) => (
                    <CommandItem key={p.id} value={`p-${p.slug}`} onSelect={() => go(`/product/${p.slug}`)}>
                      <ProductImage category={p.category} src={p.images[0]} sizes="32px" className="size-8 shrink-0 rounded-md" />
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="text-xs font-medium tabular-nums">
                        {formatNaira(p.price)} <span className="text-muted-foreground">/ {p.unit}</span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {r && r.pros.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Pros">
                  {r.pros.map((p) => (
                    <CommandItem key={p.id} value={`pro-${p.slug}`} onSelect={() => go(`/pros/${p.slug}`)}>
                      <UserAvatar user={{ name: p.name, avatar: p.photo }} className="size-8" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex items-center gap-1 truncate">
                          {p.name} {p.verified && <VerifiedBadge label="Verified pro" />}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {p.headline} · {p.location}
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {r && r.estates.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Real estate">
                  {r.estates.map((e) => (
                    <CommandItem key={e.id} value={`e-${e.slug}`} onSelect={() => go(`/real-estate/${e.slug}`)}>
                      {e.images?.[0] ? (
                        <Image src={e.images[0]} alt="" width={32} height={32} className="size-8 rounded-md object-cover" />
                      ) : (
                        <span className="grid size-8 place-items-center rounded-md bg-muted">
                          <Building2 aria-hidden className="size-4 text-muted-foreground" />
                        </span>
                      )}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{e.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {e.kind} · {e.area}, {e.city}
                        </span>
                      </span>
                      <span className="text-xs font-medium tabular-nums">{formatNaira(e.price)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
