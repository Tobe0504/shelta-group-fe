"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/** Pill-style section navigation that highlights the current page. */
export function NavTabs({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  const path = usePathname()
  return (
    <nav aria-label={label} className="scrollbar-none flex gap-2 overflow-x-auto max-sm:gap-1.5">
      {items.map((i) => {
        // A section stays highlighted on its own detail pages (e.g. /account/jobs/123), except the root tab.
        const active = path === i.href || (i.href.split("/").length > 2 && path.startsWith(`${i.href}/`))
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cn("rounded-full px-4 py-2.5 text-sm whitespace-nowrap max-sm:px-3 max-sm:py-1.5 max-sm:text-xs", active ? "bg-foreground text-background" : "bg-secondary hover:bg-accent")}
          >
            {i.label}
          </Link>
        )
      })}
    </nav>
  )
}
