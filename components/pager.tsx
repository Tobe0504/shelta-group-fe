import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Previous / next links with "Page 2 of 5". Renders nothing for a single page. */
export function Pager({ page, pages, href }: { page: number; pages: number; href: (page: number) => string }) {
  if (pages <= 1) return null
  return (
    <nav aria-label="Pages" className="flex items-center justify-center gap-3 max-sm:gap-2">
      {page > 1 ? (
        <Button asChild variant="secondary" size="sm">
          <Link href={href(page - 1)} rel="prev">
            <ChevronLeft aria-hidden /> Previous
          </Link>
        </Button>
      ) : (
        <Button variant="secondary" size="sm" disabled>
          <ChevronLeft aria-hidden /> Previous
        </Button>
      )}
      <span className="text-sm text-muted-foreground tabular-nums max-sm:text-xs">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Button asChild variant="secondary" size="sm">
          <Link href={href(page + 1)} rel="next">
            Next <ChevronRight aria-hidden />
          </Link>
        </Button>
      ) : (
        <Button variant="secondary" size="sm" disabled>
          Next <ChevronRight aria-hidden />
        </Button>
      )}
    </nav>
  )
}
