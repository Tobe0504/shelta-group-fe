import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageHeader } from "@/components/page-header"
import { ProDirectory } from "@/components/pro-directory"
import { ProListSkeleton } from "@/components/skeletons"
import { readProSearch } from "@/lib/pro-search"
import { load } from "@/lib/server-data"
import { catalogService } from "@/services/catalog.service"

export const metadata: Metadata = { title: "Find a pro", description: "Search verified builders, tradespeople and consultants by name, trade and area." }

async function Directory({ searchParams }: Pick<PageProps<"/pros">, "searchParams">) {
  const [params, trades] = await Promise.all([searchParams, load(() => catalogService.departments("services"))])
  return <ProDirectory search={readProSearch(params)} trades={trades} basePath="/pros" />
}

export default function ProsPage({ searchParams }: PageProps<"/pros">) {
  return (
    <div className="container-page flex flex-col gap-6 py-6 max-sm:gap-3 max-sm:py-3">
      <div className="max-sm:hidden">
        <PageBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Find a pro" }]} />
      </div>
      <PageHeader title="Find a pro" description="Search by name, trade or area. Ratings come from buyers who hired them through SheltaMart.">
        <Button asChild className="max-sm:w-full">
          <Link href="/services/request">Post a job instead</Link>
        </Button>
      </PageHeader>
      <Suspense fallback={<ProListSkeleton />}>
        <Directory searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
