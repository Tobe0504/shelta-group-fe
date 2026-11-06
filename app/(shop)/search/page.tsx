import type { Metadata } from "next"
import { Suspense } from "react"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { ProductGrid } from "@/components/product-card"
import { PromoCarousel } from "@/components/promo-carousel"
import { SearchFilters, type Filters } from "@/components/search-filters"
import { ResultsSkeleton } from "@/components/skeletons"
import { load } from "@/lib/server-data"
import { catalogService } from "@/services/catalog.service"
import { productsService } from "@/services/products.service"

export const metadata: Metadata = { title: "Search" }

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const sorts = ["best", "price-asc", "price-desc"] as const

function toFilters(params: Awaited<PageProps<"/search">["searchParams"]>): Filters {
  const sort = first(params.sort)
  return {
    q: first(params.q),
    category: first(params.category) || undefined,
    brands: params.brand ? [params.brand].flat() : [],
    deals: first(params.deals) === "1",
    sort: sorts.find((s) => s === sort) ?? "best",
  }
}

async function Results({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const filters = toFilters(await searchParams)
  const [results, departments, brands, promos] = await load(() =>
    Promise.all([
      productsService.search({ q: filters.q, category: filters.category, brand: filters.brands, deals: filters.deals || undefined, sort: filters.sort, limit: 48 }),
      catalogService.departments(),
      productsService.brands(filters.category),
      catalogService.promos(filters.category),
    ]),
  )
  const category = departments.flatMap((d) => d.categories).find((c) => c.slug === filters.category)
  const title = filters.q ? `Results for “${filters.q}”` : (category?.name ?? (filters.deals ? "Deals" : "All products"))

  return (
    <>
      <div className="max-sm:hidden">
        <PageBreadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight max-sm:text-lg">
        {title} <span className="text-base font-normal text-muted-foreground max-sm:text-xs">{results.meta.total} results</span>
      </h1>
      <div className="flex flex-col gap-10 max-sm:gap-2.5 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <SearchFilters filters={filters} departments={departments} brands={brands} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6 max-sm:gap-3">
          <PromoCarousel promos={promos} size="banner" label="Sponsored offers" />
          <ProductGrid products={results.data} empty="No products match these filters. Try removing one." />
        </div>
      </div>
    </>
  )
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="container-page flex flex-col gap-6 py-6 max-sm:gap-2 max-sm:py-2.5">
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
