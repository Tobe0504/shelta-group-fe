import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { estateKinds } from "@/lib/data"
import { formatNaira } from "@/lib/format"
import { load } from "@/lib/server-data"
import { estatesService } from "@/services/estates.service"
import { EstateCard, kindIcons } from "./estate-card"

/** Home-page showcase for the separate real estate module. */
export async function RealEstateFeature() {
  const { data: estates, meta, facets } = await load(() => estatesService.list({ limit: 50 }))
  const featured = (["Apartment", "House", "Land"] as const).flatMap((kind) => estates.find((e) => e.kind === kind) ?? [])
  const plots = estates.filter((e) => e.kind === "Land").map((e) => e.price)

  return (
    <section aria-labelledby="re-feature" className="grid gap-6 rounded-[28px] bg-[#EDE6FF] p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:p-10">
      <div className="flex flex-col justify-between gap-8">
        <div className="flex flex-col gap-4">
          <Badge className="bg-[#6D28D9] text-white">SheltaMart Real Estate</Badge>
          <h2 id="re-feature" className="text-3xl leading-tight text-[#2E1065] sm:text-4xl">
            Land and homes, checked before they’re listed
          </h2>
          <p className="text-[#4C1D95]">Plots, apartments and short-lets from verified developers. Book an inspection in one message.</p>
          <dl className="flex flex-wrap gap-6 text-[#2E1065]">
            {[
              [String(meta.total), "listings"],
              [String(facets.cities.length), "cities"],
              ...(plots.length ? [[formatNaira(Math.min(...plots)), "cheapest plot"]] : []),
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col-reverse">
                <dt className="text-sm text-[#4C1D95]">{l}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col gap-4">
          <ul aria-label="Browse by type" className="flex flex-wrap gap-2">
            {estateKinds.map((k) => {
              const Icon = kindIcons[k]
              return (
                <li key={k}>
                  <Link href={`/real-estate?kind=${k}`} className="flex min-h-10 items-center gap-2 rounded-full bg-white/70 px-4 text-sm text-[#2E1065] hover:bg-white">
                    <Icon aria-hidden className="size-4 text-[#6D28D9]" /> {k}
                  </Link>
                </li>
              )
            })}
          </ul>
          <Button asChild size="lg" className="w-fit bg-[#6D28D9] hover:bg-[#5B21B6]">
            <Link href="/real-estate">
              Explore properties <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {featured.map((e) => (
          <li key={e.slug}>
            <EstateCard estate={e} />
          </li>
        ))}
      </ul>
    </section>
  )
}
