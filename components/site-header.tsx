import Link from "next/link"
import { Suspense } from "react"
import { Heart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { headerCategories } from "@/lib/data"
import { load } from "@/lib/server-data"
import { tones } from "@/lib/tones"
import type { Department, Tone } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CartLink } from "./cart-link"
import { CategoryIcon } from "./category-icon"
import { LocationPicker } from "./location-picker"
import { Logo } from "./logo"
import { SearchBox, SearchBoxFallback } from "./search-box"
import { UserMenu } from "./user-menu"
import { catalogService } from "@/services/catalog.service"

/** Categories menu and quick links, both driven by the API catalogue. */
async function CatalogNav({ part }: { part: "menu" | "links" }) {
  const departments = await load(catalogService.departments)
  if (part === "menu") return <CategoriesSheet departments={departments} />
  const categories = departments.flatMap((d) => d.categories)
  return headerCategories.flatMap((slug) => {
    const c = categories.find((x) => x.slug === slug)
    return c ? (
      <Link key={slug} href={`/search?category=${slug}`} className="py-2 text-muted-foreground hover:text-foreground max-lg:hidden">
        {c.name}
      </Link>
    ) : []
  })
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-2 py-3 md:gap-x-5">
        <Logo />
        <Suspense fallback={<Skeleton className="h-11 w-11 rounded-full sm:w-36" />}>
          <CatalogNav part="menu" />
        </Suspense>
        <div className="order-last w-full md:order-none md:w-auto md:flex-1">
          <Suspense fallback={<SearchBoxFallback />}>
            <SearchBox />
          </Suspense>
        </div>
        <div className="hidden lg:block">
          <LocationPicker />
        </div>
        <nav aria-label="Account" className="ml-auto flex gap-2 md:ml-0">
          <UserMenu />
          <Button asChild variant="secondary" size="icon" className="hidden sm:inline-flex">
            <Link href="/saved" aria-label="Saved items">
              <Heart aria-hidden />
            </Link>
          </Button>
          <CartLink />
        </nav>
      </div>
      <nav aria-label="Popular categories" className="container-page flex items-center gap-6 overflow-x-auto pb-2 text-sm whitespace-nowrap">
        <div className="lg:hidden">
          <LocationPicker />
        </div>
        <Link href="/search?deals=1" className="py-2 font-semibold text-deal-soft-foreground max-lg:hidden">
          Deals
        </Link>
        <Suspense fallback={<Skeleton className="h-4 w-96 max-lg:hidden" />}>
          <CatalogNav part="links" />
        </Suspense>
        <span className="flex-1" />
        <Link href="/quote" className="py-2 text-muted-foreground hover:text-foreground">
          Request a quote
        </Link>
        <Link href="/real-estate" className="py-2 text-muted-foreground hover:text-foreground">
          Real estate
        </Link>
      </nav>
    </header>
  )
}

function MenuLinks({ items }: { items: { slug: string; name: string; tone: Tone; href: string }[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((c) => (
        <li key={c.slug}>
          <SheetClose asChild>
            <Link href={c.href} className="flex min-h-12 items-center gap-3 rounded-2xl p-2 hover:bg-secondary">
              <span className={cn("grid size-10 place-items-center rounded-xl", tones[c.tone].bg)}>
                <CategoryIcon slug={c.slug} className={cn("size-5", tones[c.tone].fg)} />
              </span>
              {c.name}
            </Link>
          </SheetClose>
        </li>
      ))}
    </ul>
  )
}

function CategoriesSheet({ departments }: { departments: Department[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <Menu aria-hidden />
          <span className="max-sm:sr-only">Categories</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="gap-0 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>
        <nav aria-label="All categories" className="flex flex-col gap-5 px-3 pb-6">
          <MenuLinks items={[{ slug: "deals", name: "Today’s deals", tone: "peach", href: "/search?deals=1" }]} />
          {departments.map((d) => (
            <section key={d.slug} aria-labelledby={`dept-${d.slug}`} className="flex flex-col gap-1">
              <h3 id={`dept-${d.slug}`} className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {d.name}
              </h3>
              <MenuLinks items={d.categories.map((c) => ({ ...c, href: `/search?category=${c.slug}` }))} />
            </section>
          ))}
          <MenuLinks items={[{ slug: "real-estate", name: "Real estate", tone: "lilac", href: "/real-estate" }]} />
        </nav>
      </SheetContent>
    </Sheet>
  )
}
