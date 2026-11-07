import Link from "next/link"
import { Suspense } from "react"
import { FileText, House, Lock, ShieldCheck, Tags, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryTiles } from "@/components/category-tiles"
import { InfoTile } from "@/components/info-tile"
import { ProductGrid } from "@/components/product-card"
import { PromoCarousel } from "@/components/promo-carousel"
import { RealEstateFeature } from "@/components/real-estate-feature"
import { Section } from "@/components/section"
import { BannerSkeleton, ProductGridSkeleton, TilesSkeleton } from "@/components/skeletons"
import { load } from "@/lib/server-data"
import { tones } from "@/lib/tones"
import { cn } from "@/lib/utils"
import { catalogService } from "@/services/catalog.service"
import { productsService, type ProductSearch } from "@/services/products.service"

const benefits = [
  { icon: ShieldCheck, tone: "blue", title: "Verified sellers", text: "Every store is checked" },
  { icon: Truck, tone: "mint", title: "Delivered to site", text: "Cost shown before you pay" },
  { icon: Lock, tone: "lilac", title: "Buyer protection", text: "Paid out after delivery" },
  { icon: Tags, tone: "peach", title: "Bulk pricing", text: "Lower price as you buy more" },
] as const

const sideOffers = [
  { title: "Roofing week", text: "Long-span and stone-coated", cta: "See offers", href: "/search?category=roofing", tone: "peach", icon: House },
  { title: "Quotes for your list", text: "Upload a bill of quantities", cta: "Request a quote", href: "/quote", tone: "mint", icon: FileText },
] as const

async function Departments() {
  const departments = await load(() => catalogService.departments("all"))
  const featured = departments.filter((d) => d.featured).sort((a, b) => Number(a.kind === "services") - Number(b.kind === "services"))
  return <CategoryTiles label="Shop by department" items={featured.slice(0, 8).map((d) => ({ ...d, href: `/departments/${d.slug}` }))} />
}

async function Trades() {
  const departments = await load(() => catalogService.departments("services"))
  return <CategoryTiles label="Hire a pro" items={departments.flatMap((d) => d.categories).map((c) => ({ ...c, href: `/services/${c.slug}` }))} />
}

async function Promos() {
  return <PromoCarousel promos={await load(() => catalogService.promos())} className="min-w-0 lg:flex-[2]" />
}

async function Products({ query, rail }: { query: ProductSearch; rail?: boolean }) {
  const { data } = await load(() => productsService.search({ limit: 10, ...query }))
  return <ProductGrid products={data} rail={rail} />
}

async function Brands() {
  const brands = await load(() => productsService.brands())
  return (
    <ul className="scrollbar-none grid grid-cols-2 gap-3 max-sm:-mx-3 max-sm:flex max-sm:gap-1.5 max-sm:overflow-x-auto max-sm:px-3 sm:grid-cols-4">
      {brands.slice(0, 12).map((b) => (
        <li key={b} className="max-sm:shrink-0">
          <Link href={`/search?q=${encodeURIComponent(b)}`} className="flex min-h-16 items-center justify-center rounded-2xl bg-muted px-3 text-center text-sm font-semibold text-balance hover:bg-accent hover:text-accent-foreground max-sm:min-h-8 max-sm:rounded-full max-sm:text-xs max-sm:whitespace-nowrap">
            {b}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function HomePage() {
  return (
    <div className="container-page flex flex-col gap-14 py-8 max-sm:gap-5 max-sm:py-3">
      <h1 className="sr-only">SheltaMart: building materials delivered to your site</h1>
      <Suspense fallback={<TilesSkeleton count={8} />}>
        <Departments />
      </Suspense>

      <section aria-label="Offers" className="flex flex-col gap-4 max-sm:gap-2 lg:flex-row">
        <Suspense fallback={<BannerSkeleton className="min-h-72 max-sm:min-h-36 lg:flex-[2]" />}>
          <Promos />
        </Suspense>
        <div className="flex flex-col gap-4 max-sm:grid max-sm:grid-cols-2 max-sm:gap-2 lg:flex-1">
          {sideOffers.map(({ icon: Icon, ...o }) => (
            <Link key={o.title} href={o.href} className={cn("flex flex-1 items-center justify-between gap-4 rounded-[28px] p-6 max-sm:gap-1 max-sm:rounded-xl max-sm:px-3 max-sm:py-2", tones[o.tone].bg)}>
              <span className="flex flex-col gap-1">
                <span className="text-xl font-semibold max-sm:text-xs">{o.title}</span>
                <span className="text-sm text-foreground/75 max-sm:hidden">{o.text}</span>
                <span className="mt-2 text-sm font-medium max-sm:mt-0 max-sm:text-xs">{o.cta} →</span>
              </span>
              <Icon aria-hidden className={cn("size-12 shrink-0 max-sm:size-6", tones[o.tone].fg)} strokeWidth={1.4} />
            </Link>
          ))}
        </div>
      </section>

      <ul aria-label="Why buy on SheltaMart" className="scrollbar-none -mt-6 grid gap-4 rounded-3xl bg-muted p-5 max-sm:-mt-2 max-sm:flex max-sm:gap-3 max-sm:overflow-x-auto max-sm:rounded-xl max-sm:p-2 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <li key={b.title}>
            <InfoTile compact icon={b.icon} tone={b.tone} title={b.title}>
              {b.text}
            </InfoTile>
          </li>
        ))}
      </ul>

      <Section title="Deals of the day" action={{ href: "/search?deals=1", label: "See all" }} aside={<Badge variant="deal-soft">Ends tonight</Badge>}>
        <Suspense fallback={<ProductGridSkeleton count={5} />}>
          <Products rail query={{ deals: true, limit: 5 }} />
        </Suspense>
      </Section>

      <Section title="Popular right now" action={{ href: "/search", label: "See all" }}>
        <Suspense fallback={<ProductGridSkeleton />}>
          <Products query={{ sort: "best" }} />
        </Suspense>
      </Section>

      <Section title="Hire a pro" action={{ href: "/services", label: "All services" }} aside={<Badge variant="accent">Free quotes</Badge>}>
        <Suspense fallback={<TilesSkeleton />}>
          <Trades />
        </Suspense>
      </Section>

      <Section title="Shop by brand">
        <Suspense fallback={<Skeleton className="h-36 rounded-2xl" />}>
          <Brands />
        </Suspense>
      </Section>

      <Suspense fallback={<Skeleton className="h-[28rem] rounded-[28px]" />}>
        <RealEstateFeature />
      </Suspense>
    </div>
  )
}
