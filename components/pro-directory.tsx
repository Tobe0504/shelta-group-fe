import { Suspense } from "react"
import { load } from "@/lib/server-data"
import { proSearchUrl } from "@/lib/pro-search"
import { allTrades } from "@/lib/trades"
import type { Department } from "@/lib/types"
import { prosService, type ProSearch } from "@/services/pros.service"
import { Pager } from "./pager"
import { ProList } from "./pro-card"
import { ProFilters } from "./pro-filters"
import { ProListSkeleton } from "./skeletons"

const PAGE_SIZE = 24

async function Results({ search, basePath, tradeName }: { search: ProSearch & { page: number }; basePath: string; tradeName?: string }) {
  const { data, meta } = await load(() => prosService.list({ ...search, limit: PAGE_SIZE }))
  const filtered = search.q || search.verified || search.lat
  return (
    <>
      <p aria-live="polite" className="text-sm text-muted-foreground max-sm:text-xs">
        {meta.total} {meta.total === 1 ? "pro" : "pros"}
        {search.q && ` matching “${search.q}”`}
        {search.lat && " covering your location"}
      </p>
      <ProList
        pros={data}
        empty={filtered ? "No pros match these filters. Try removing one." : `No ${tradeName?.toLowerCase() ?? "pros"} have joined yet. Post your job and we’ll find one for you.`}
      />
      <Pager page={meta.page} pages={meta.pages} href={(page) => proSearchUrl(basePath, { ...search, page })} />
    </>
  )
}

/** Searchable, filterable, paged list of pros. Used for all pros and for each trade. */
export function ProDirectory({ search, trades, basePath, fixedTrade }: { search: ProSearch & { page: number }; trades: Department[]; basePath: string; fixedTrade?: string }) {
  const query = fixedTrade ? { ...search, trade: fixedTrade } : search
  return (
    <div className="flex flex-col gap-4 max-sm:gap-2.5">
      <ProFilters search={search} trades={trades} basePath={basePath} fixedTrade={!!fixedTrade} />
      <Suspense key={JSON.stringify(query)} fallback={<ProListSkeleton />}>
        <Results search={query} basePath={basePath} tradeName={fixedTrade ? allTrades(trades).find((t) => t.slug === fixedTrade)?.name : undefined} />
      </Suspense>
    </div>
  )
}
