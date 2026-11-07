import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Briefcase, MapPin, MessageCircle, Star } from "lucide-react";
import { StartChat } from "@/components/start-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { ProAvatar, ProName } from "@/components/pro-card";
import { Rating } from "@/components/rating";
import { Section } from "@/components/section";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { formatDay, formatRate } from "@/lib/format";
import { load, loadOrNull } from "@/lib/server-data";
import { tradeName } from "@/lib/trades";
import { catalogService } from "@/services/catalog.service";
import { prosService } from "@/services/pros.service";

export async function generateMetadata({
  params,
}: PageProps<"/pros/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pro = await loadOrNull(() => prosService.get(slug));
  return { title: pro?.name ?? "Pro", description: pro?.headline };
}

async function ProDetail({
  params,
}: Pick<PageProps<"/pros/[slug]">, "params">) {
  const { slug } = await params;
  const [pro, departments] = await load(() =>
    Promise.all([
      prosService.get(slug),
      catalogService.departments("services"),
    ]),
  );
  const facts = [
    { icon: MapPin, text: `${pro.location} · works within ${pro.radiusKm} km` },
    {
      icon: Briefcase,
      text: `${pro.jobsDone} jobs done${pro.years ? ` · ${pro.years} years’ experience` : ""}`,
    },
  ];

  console.log("PRO JSON:", JSON.stringify(pro, null, 2));

  return (
    <>
      <div className="max-sm:hidden">
        <PageBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: pro.name },
          ]}
        />
      </div>
      <header className="flex flex-wrap items-start gap-5 rounded-[28px] bg-muted p-6 max-sm:gap-3 max-sm:rounded-2xl max-sm:p-3">
        <ProAvatar
          pro={pro}
          className="size-24 text-2xl max-sm:size-16 max-sm:text-lg"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 max-sm:gap-0.5">
          <h1 className="text-2xl max-sm:text-lg">
            <ProName pro={pro} />
          </h1>
          <p className="text-muted-foreground max-sm:text-sm">{pro.headline}</p>
          <Rating
            value={pro.rating}
            count={pro.reviewCount}
            extra={pro.kind === "company" ? "Company" : "Individual"}
          />
          <ul className="flex flex-col gap-0.5 text-sm text-muted-foreground max-sm:text-xs">
            {facts.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-1.5">
                <Icon aria-hidden className="size-3.5 shrink-0" /> {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-end gap-2 max-sm:w-full max-sm:flex-row max-sm:items-center max-sm:justify-between">
          {pro.rate && (
            <p className="font-semibold tabular-nums max-sm:text-sm">
              {formatRate(pro.rate)}
            </p>
          )}
          <div className="flex gap-2">
            <StartChat to={{ pro: pro.slug }} about={{ label: pro.name, href: `/pros/${pro.slug}` }} title={`Message ${pro.name}`} description="Ask about availability, prices or past work before you post a job." placeholder="Hi, are you available next week for…">
              <Button variant="secondary">
                <MessageCircle aria-hidden /> Message
              </Button>
            </StartChat>
            <Button asChild>
              <Link href={`/services/request?pro=${pro.slug}&trade=${pro.trades[0] ?? ""}`}>Request a quote</Link>
            </Button>
          </div>
        </div>
      </header>

      <ul aria-label="Trades" className="flex flex-wrap gap-2 max-sm:gap-1.5">
        {pro.trades.map((t) => (
          <li key={t}>
            <Badge
              asChild
              variant="secondary"
              className="h-8 px-3 text-sm max-sm:h-6 max-sm:px-2 max-sm:text-xs"
            >
              <Link href={`/services/${t}`}>{tradeName(departments, t)}</Link>
            </Badge>
          </li>
        ))}
      </ul>

      {pro.about && (
        <Section title="About">
          <p className="max-w-3xl leading-relaxed whitespace-pre-line text-muted-foreground max-sm:text-sm">
            {pro.about}
          </p>
        </Section>
      )}

      {pro.portfolio.length > 0 && (
        <Section title="Past work">
          <ul className="grid grid-cols-2 gap-3 max-sm:grid-cols-3 max-sm:gap-1.5 sm:grid-cols-4">
            {pro.portfolio.map((src, i) => (
              <li
                key={src}
                className="relative aspect-square overflow-hidden rounded-2xl bg-muted max-sm:rounded-xl"
              >
                <Image
                  src={src}
                  alt={`${pro.name}, past work ${i + 1}`}
                  fill
                  sizes="(min-width: 640px) 25vw, 33vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={`Reviews (${pro.reviewCount})`}>
        {pro.reviews.length ? (
          <ul className="grid gap-3 max-sm:gap-2 md:grid-cols-2">
            {pro.reviews.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-1 rounded-2xl p-4 ring-1 ring-border max-sm:rounded-xl max-sm:p-3"
              >
                <p className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDay(r.createdAt)}
                  </span>
                </p>
                <p
                  className="flex items-center gap-0.5"
                  aria-label={`${r.rating} out of 5`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      aria-hidden
                      className={
                        n <= r.rating
                          ? "size-3.5 fill-deal text-deal"
                          : "size-3.5 text-muted-foreground/40"
                      }
                    />
                  ))}
                </p>
                {r.text && (
                  <p className="text-sm text-muted-foreground max-sm:text-xs">
                    {r.text}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Reviews appear here after buyers hire {pro.name} through SheltaMart.
          </p>
        )}
      </Section>
    </>
  );
}

export default function ProPage({ params }: PageProps<"/pros/[slug]">) {
  return (
    <div className="container-page flex flex-col gap-8 py-6 max-sm:gap-4 max-sm:py-3">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProDetail params={params} />
      </Suspense>
    </div>
  );
}
