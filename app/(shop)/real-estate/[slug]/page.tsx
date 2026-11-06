import type { Metadata } from "next"
import { Suspense } from "react"
import { Building2, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EstateCard, kindIcons } from "@/components/estate-card"
import { EstateEnquire } from "@/components/estate-enquire"
import { LocationMap } from "@/components/location-map"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PhotoGallery } from "@/components/photo-viewer"
import { Section } from "@/components/section"
import { ProductDetailSkeleton } from "@/components/skeletons"
import { formatNaira } from "@/lib/format"
import { load, loadOrNull } from "@/lib/server-data"
import { tones } from "@/lib/tones"
import { cn } from "@/lib/utils"
import { estatesService } from "@/services/estates.service"

export async function generateMetadata({ params }: PageProps<"/real-estate/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const estate = await loadOrNull(() => estatesService.get(slug))
  return { title: estate?.name ?? "Property", description: estate?.detail }
}

async function More({ slug, kind }: { slug: string; kind: string }) {
  const { data } = await load(() => estatesService.list({ limit: 9 }))
  const others = data.filter((e) => e.slug !== slug).sort((a, b) => Number(b.kind === kind) - Number(a.kind === kind)).slice(0, 4)
  if (!others.length) return null
  return (
    <Section title="More properties" action={{ href: "/real-estate", label: "See all" }}>
      <ul className="grid grid-cols-2 gap-4 max-sm:gap-2 lg:grid-cols-4">
        {others.map((e) => (
          <li key={e.slug}>
            <EstateCard estate={e} />
          </li>
        ))}
      </ul>
    </Section>
  )
}

async function Detail({ params }: Pick<PageProps<"/real-estate/[slug]">, "params">) {
  const { slug } = await params
  const estate = await load(() => estatesService.get(slug))
  const Icon = kindIcons[estate.kind]
  const tone = tones[estate.tone]

  return (
    <>
      <div className="max-sm:hidden">
        <PageBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Real estate", href: "/real-estate" }, { label: estate.name }]} />
      </div>
      <div className="grid items-start gap-10 max-sm:gap-3 lg:grid-cols-[1.3fr_1fr]">
        <PhotoGallery
          images={estate.images ?? []}
          alt={estate.name}
          fallback={
            <div className={cn("grid aspect-[4/3] place-items-center rounded-[28px] max-sm:aspect-[16/9] max-sm:rounded-2xl", tone.bg)}>
              <Icon aria-hidden className={cn("size-20 max-sm:size-12", tone.fg)} strokeWidth={1.4} />
            </div>
          }
        />
        <div className="flex flex-col gap-5 max-sm:gap-3 lg:sticky lg:top-32">
          <div className="flex flex-col gap-2 max-sm:gap-1">
            <Badge variant="outline" className="w-fit">
              {estate.kind}
            </Badge>
            <h1 className="text-3xl max-sm:text-xl">{estate.name}</h1>
            <p className="flex items-start gap-1.5 text-muted-foreground max-sm:text-sm">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
              {estate.address ?? `${estate.area}, ${estate.city}`}
            </p>
            {estate.detail && <p className="text-muted-foreground max-sm:text-sm">{estate.detail}</p>}
          </div>
          <p className="text-3xl font-semibold tabular-nums max-sm:text-xl">
            {formatNaira(estate.price)} {estate.per && <span className="text-base font-medium text-muted-foreground max-sm:text-sm">{estate.per}</span>}
          </p>
          {estate.developer && (
            <p className="flex items-center gap-2 rounded-2xl bg-muted p-3 text-sm max-sm:rounded-xl max-sm:p-2.5 max-sm:text-xs">
              <Building2 aria-hidden className="size-4 shrink-0 text-muted-foreground" /> Listed for <strong className="font-semibold">{estate.developer}</strong>
            </p>
          )}
          <EstateEnquire estate={estate}>
            <Button size="lg" className="w-full sm:w-fit">
              Enquire or book an inspection
            </Button>
          </EstateEnquire>
        </div>
      </div>

      {estate.description && (
        <Section title="About this property">
          <p className="max-w-3xl leading-relaxed whitespace-pre-line text-muted-foreground max-sm:text-sm">{estate.description}</p>
        </Section>
      )}

      {estate.coords && (
        <Section title="Location">
          <LocationMap center={estate.coords} label={`Map of ${estate.name}`} className="h-80 max-sm:h-56" />
          <a href={`https://www.openstreetmap.org/?mlat=${estate.coords.lat}&mlon=${estate.coords.lng}#map=16/${estate.coords.lat}/${estate.coords.lng}`} target="_blank" rel="noreferrer" className="w-fit text-sm text-primary hover:underline">
            Open in a full map
          </a>
        </Section>
      )}

      <Suspense>
        <More slug={estate.slug} kind={estate.kind} />
      </Suspense>
    </>
  )
}

export default function EstatePage({ params }: PageProps<"/real-estate/[slug]">) {
  return (
    <div className="container-page flex flex-col gap-10 py-6 max-sm:gap-4 max-sm:py-3">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </div>
  )
}
