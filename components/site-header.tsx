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
import { SearchBoxFallback } from "./search-box"
import { Spotlight } from "./spotlight"
import { MessagesLink } from "./messages-link"
import { NotificationBell } from "./notification-bell"
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
      <Link key={slug} href={`/search?category=${slug}`} className="py-2 text-muted-foreground hover:text-foreground">
        {c.name}
      </Link>
    ) : []
  })
}

export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-2 py-3 max-sm:gap-x-2 max-sm:gap-y-1.5 max-sm:py-2 md:gap-x-5">
          <Logo />
          <Suspense fallback={<Skeleton className="h-11 w-36 rounded-full max-sm:order-first max-sm:size-9" />}>
            <CatalogNav part="menu" />
          </Suspense>
          <div className="order-last w-full md:order-none md:w-auto md:flex-1">
            <Suspense fallback={<SearchBoxFallback />}>
              <Spotlight />
            </Suspense>
          </div>
          <div className="hidden lg:block">
            <LocationPicker />
          </div>
          <nav aria-label="Account" className="ml-auto flex gap-2 max-sm:gap-1.5 md:ml-0">
            <MessagesLink />
            <NotificationBell />
            <UserMenu />
            <Button asChild variant="secondary" size="icon" className="max-sm:hidden">
              <Link href="/saved" aria-label="Saved items">
                <Heart aria-hidden />
              </Link>
            </Button>
            <CartLink />
          </nav>
        </div>
        <nav aria-label="Popular categories" className="container-page hidden items-center gap-6 pb-2 text-sm whitespace-nowrap lg:flex">
          <Link href="/search?deals=1" className="py-2 font-semibold text-deal-soft-foreground">
            Deals
          </Link>
          <Suspense fallback={<Skeleton className="h-4 w-96" />}>
            <CatalogNav part="links" />
          </Suspense>
          <span className="flex-1" />
          <Link href="/services" className="py-2 text-muted-foreground hover:text-foreground">
            Hire a pro
          </Link>
          <Link href="/quote" className="py-2 text-muted-foreground hover:text-foreground">
            Request a quote
          </Link>
          <Link href="/real-estate" className="py-2 text-muted-foreground hover:text-foreground">
            Real estate
          </Link>
        </nav>
      </header>
      {/* Phones and tablets: one slim line that scrolls away, so the sticky header stays short. */}
      <nav aria-label="Delivery location and shortcuts" className="container-page flex h-9 items-center gap-3 border-b text-xs whitespace-nowrap lg:hidden">
        <LocationPicker compact />
        <Link href="/search?deals=1" className="font-semibold text-deal-soft-foreground">
          Deals
        </Link>
        <Link href="/services" className="text-muted-foreground">
          Hire a pro
        </Link>
        <Link href="/quote" className="text-muted-foreground">
          Quote
        </Link>
        <Link href="/real-estate" className="text-muted-foreground">
          Real estate
        </Link>
      </nav>
    </>
  )
}

function MenuLinks({ items }: { items: { slug: string; name: string; tone: Tone; href: string }[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((c) => (
        <li key={c.slug}>
          <SheetClose asChild>
            <Link href={c.href} className="flex min-h-12 items-center gap-3 rounded-2xl p-2 hover:bg-secondary max-sm:min-h-10 max-sm:p-1">
              <span className={cn("grid size-10 place-items-center rounded-xl max-sm:size-8", tones[c.tone].bg)}>
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

/** What the footer used to hold: selling, help and company links. */
const quickLinks = [
  { label: "Sell on SheltaMart", href: "/sell" },
  { label: "Offer your services", href: "/pro/profile" },
  { label: "Buyer protection", href: "/help#protection" },
  { label: "Help & support", href: "/help" },
  { label: "Contact us", href: "/help#contact" },
]

function CategoriesSheet({ departments }: { departments: Department[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" aria-label="Categories" className="max-sm:order-first max-sm:size-9 max-sm:p-0">
          <Menu aria-hidden />
          <span className="max-sm:hidden">Categories</span>
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
          <MenuLinks
            items={[
              { slug: "builders", name: "Hire a pro", tone: "yellow", href: "/services" },
              { slug: "real-estate", name: "Real estate", tone: "lilac", href: "/real-estate" },
              { slug: "quote", name: "Request a quote", tone: "mint", href: "/quote" },
            ]}
          />
          <section aria-labelledby="quick-links" className="flex flex-col gap-1 border-t pt-4">
            <h3 id="quick-links" className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Quick links
            </h3>
            <ul className="flex flex-col">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <SheetClose asChild>
                    <Link href={l.href} className="flex min-h-10 items-center rounded-xl px-2 text-sm hover:bg-secondary max-sm:min-h-9">
                      {l.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
            <p className="px-2 pt-2 text-xs text-muted-foreground">© 2026 SheltaMart.com</p>
          </section>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
