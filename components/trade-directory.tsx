import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { tones } from "@/lib/tones"
import type { Department } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CategoryIcon } from "./category-icon"

/** Every trade at a glance: one compact card per department, each trade with its number of pros. */
export function TradeDirectory({ departments, counts }: { departments: Department[]; counts: Record<string, number> }) {
  return (
    <ul className="grid gap-4 max-sm:gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {departments.map((d) => (
        <li key={d.slug} className="rounded-3xl p-4 ring-1 ring-border max-sm:rounded-2xl max-sm:p-2.5">
          <h3 className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase max-sm:mb-1">{d.name}</h3>
          <ul className="flex flex-col">
            {d.categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/services/${c.slug}`} className="group flex items-center gap-3 rounded-xl p-1.5 hover:bg-muted max-sm:gap-2 max-sm:p-1">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg max-sm:size-7", tones[c.tone].bg)}>
                    <CategoryIcon slug={c.slug} className={cn("size-4.5 max-sm:size-3.5", tones[c.tone].fg)} />
                  </span>
                  <span className="flex-1 text-sm font-medium max-sm:text-xs">{c.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums max-sm:text-[11px]">{counts[c.slug] ?? 0} {counts[c.slug] === 1 ? "pro" : "pros"}</span>
                  <ChevronRight aria-hidden className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 max-sm:size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
