import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageHeader } from "@/components/page-header"
import { ProDirectory } from "@/components/pro-directory"
import { ProListSkeleton } from "@/components/skeletons"
import { readProSearch } from "@/lib/pro-search"
import { load, loadOrNull } from "@/lib/server-data"
import { allTrades } from "@/lib/trades"
import { catalogService } from "@/services/catalog.service"

export async function generateMetadata({ params }: PageProps<"/services/[trade]">): Promise<Metadata> {
  const { trade } = await params
  const departments = (await loadOrNull(() => catalogService.departments("services"))) ?? []
  return { title: allTrades(departments).find((t) => t.slug === trade)?.name ?? "Services" }
}

async function TradePage({ params, searchParams }: PageProps<"/services/[trade]">) {
  const [{ trade }, query, departments] = await Promise.all([params, searchParams, load(() => catalogService.departments("services"))])
  const found = allTrades(departments).find((t) => t.slug === trade)
  if (!found) notFound()
  return (
    <>
      <div className="max-sm:hidden">
        <PageBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: found.name }]} />
      </div>
      <PageHeader title={found.name} description="Compare profiles and reviews, or post your job to get quotes from pros who cover your site.">
        <Button asChild className="max-sm:w-full">
          <Link href={`/services/request?trade=${trade}`}>Get quotes</Link>
        </Button>
      </PageHeader>
      <ProDirectory search={readProSearch(query)} trades={departments} basePath={`/services/${trade}`} fixedTrade={trade} />
    </>
  )
}

export default function Page(props: PageProps<"/services/[trade]">) {
  return (
    <div className="container-page flex flex-col gap-6 py-6 max-sm:gap-3 max-sm:py-3">
      <Suspense fallback={<ProListSkeleton />}>
        <TradePage {...props} />
      </Suspense>
    </div>
  )
}
