"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/** Pill-style section navigation that highlights the current page. */
export function NavTabs({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  const path = usePathname()
  return (
    <nav aria-label={label} className="flex gap-2 overflow-x-auto">
      {items.map((i) => {
        const active = path === i.href
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cn("rounded-full px-4 py-2.5 text-sm whitespace-nowrap", active ? "bg-foreground text-background" : "bg-secondary hover:bg-accent")}
          >
            {i.label}
          </Link>
        )
      })}
    </nav>
  )
}
