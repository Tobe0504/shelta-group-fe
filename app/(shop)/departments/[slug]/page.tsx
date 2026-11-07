import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { CategoryTiles } from "@/components/category-tiles"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageHeader } from "@/components/page-header"
import { ProList } from "@/components/pro-card"
import { ProductGrid } from "@/components/product-card"
import { Section } from "@/components/section"
import { ProductGridSkeleton, ProListSkeleton, TilesSkeleton } from "@/components/skeletons"
import { load, loadOrNull } from "@/lib/server-data"
import type { Department } from "@/lib/types"
import { catalogService } from "@/services/catalog.service"
import { productsService } from "@/services/products.service"
import { prosService } from "@/services/pros.service"

const findDepartment = (all: Department[], slug: string) => all.find((d) => d.slug === slug)

export async function generateMetadata({ params }: PageProps<"/departments/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const d = findDepartment((await loadOrNull(() => catalogService.departments("all"))) ?? [], slug)
  return { title: d?.name ?? "Department", description: d?.blurb }
}

/** Sub-categories as a carousel. Product categories open search; trades open their pros, with a count. */
async function Subcategories({ department }: { department: Department }) {
  const services = department.kind === "services"
  const counts = services ? await load(prosService.tradeCounts) : {}
  const items = department.categories.map((c) => ({
    ...c,
    href: services ? `/services/${c.slug}` : `/search?category=${c.slug}`,
    note: services ? `${counts[c.slug] ?? 0} ${counts[c.slug] === 1 ? "pro" : "pros"}` : undefined,
  }))
  return <CategoryTiles items={items} label={`${department.name} categories`} />
}

async function Popular({ department }: { department: Department }) {
  if (department.kind === "services") {
    const results = await Promise.all(department.categories.map((c) => load(() => prosService.list({ trade: c.slug, limit: 3 }))))
    const pros = [...new Map(results.flatMap((r) => r.data).map((p) => [p.id, p])).values()].sort((a, b) => b.rating - a.rating).slice(0, 6)
    return <ProList pros={pros} empty="No pros in this department yet." />
  }
  const { data } = await load(() => productsService.search({ department: department.slug, limit: 10 }))
  return <ProductGrid products={data} empty="No products in this department yet." />
}

async function DepartmentPage({ params }: Pick<PageProps<"/departments/[slug]">, "params">) {
  const { slug } = await params
  const department = findDepartment(await load(() => catalogService.departments("all")), slug)
  if (!department) notFound()
  const services = department.kind === "services"
  return (
    <>
      <div className="max-sm:hidden">
        <PageBreadcrumb items={[{ label: "Home", href: "/" }, { label: department.name }]} />
      </div>
      <PageHeader title={department.name} description={department.blurb} />
      <Suspense fallback={<TilesSkeleton count={8} />}>
        <Subcategories department={department} />
      </Suspense>
      <Section
        title={services ? "Top-rated pros" : `Popular in ${department.name.toLowerCase()}`}
        action={services ? { href: "/services", label: "All services" } : { href: `/search?department=${department.slug}`, label: "See all" }}
      >
        <Suspense fallback={services ? <ProListSkeleton /> : <ProductGridSkeleton />}>
          <Popular department={department} />
        </Suspense>
      </Section>
    </>
  )
}

export default function Page({ params }: PageProps<"/departments/[slug]">) {
  return (
    <div className="container-page flex flex-col gap-8 py-6 max-sm:gap-4 max-sm:py-3">
      <Suspense fallback={<TilesSkeleton count={8} />}>
        <DepartmentPage params={params} />
      </Suspense>
    </div>
  )
}
