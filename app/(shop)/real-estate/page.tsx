import type { Metadata } from "next"
import { Suspense } from "react"
import { EstateBrowser } from "@/components/estate-browser"
import { PageHeader } from "@/components/page-header"
import { ListSkeleton } from "@/components/skeletons"
import { estateKinds } from "@/lib/data"
import { load } from "@/lib/server-data"
import { estatesService } from "@/services/estates.service"

export const metadata: Metadata = { title: "Real estate" }

async function Listings({ searchParams }: Pick<PageProps<"/real-estate">, "searchParams">) {
  const [{ kind }, { data: estates }] = await Promise.all([searchParams, load(() => estatesService.list({ limit: 100 }))])
  return <EstateBrowser estates={estates} initialKind={estateKinds.find((k) => k === kind) ?? "all"} />
}

export default function RealEstatePage({ searchParams }: PageProps<"/real-estate">) {
  return (
    <div className="container-page flex flex-col gap-8 py-8 max-sm:gap-3 max-sm:py-3">
      <PageHeader title="Real estate" description="Land, homes and short-lets from verified developers across Nigeria." />
      <Suspense fallback={<ListSkeleton rows={2} className="h-80" />}>
        <Listings searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
