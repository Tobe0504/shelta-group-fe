import Link from "next/link"
import { cn } from "@/lib/utils"

/** Page section with a heading, optional side content (link, chips) and body. */
export function Section({
  title,
  action,
  aside,
  className,
  children,
}: {
  title: string
  action?: { href: string; label: string }
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const id = title.toLowerCase().replace(/\W+/g, "-")
  return (
    <section aria-labelledby={id} className={cn("flex flex-col gap-5 max-sm:gap-2.5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id={id} className="text-2xl font-semibold tracking-tight max-sm:text-lg">
            {title}
          </h2>
          {aside}
        </div>
        {action && (
          <Link href={action.href} className="py-2 text-sm font-medium text-primary hover:underline max-sm:py-1">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
