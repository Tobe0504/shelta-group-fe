import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { MessageCircle, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BuyBox } from "@/components/buy-box"
import { DeliveryEstimate } from "@/components/delivery-estimate"
import { InfoTile } from "@/components/info-tile"
import { EnquiryDialog } from "@/components/enquiry-dialog"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { Price } from "@/components/price"
import { ProductGrid } from "@/components/product-card"
import { ProductGallery } from "@/components/product-gallery"
import { Rating } from "@/components/rating"
import { Section } from "@/components/section"
import { SellerCard } from "@/components/seller-card"
import { ProductDetailSkeleton, ProductGridSkeleton } from "@/components/skeletons"
import { percentOff } from "@/lib/format"
import { load } from "@/lib/server-data"
import { catalogService } from "@/services/catalog.service"
import { productsService } from "@/services/products.service"

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await productsService.get((await params).slug).catch(() => null)
  return { title: product?.name ?? "Product", description: product?.description }
}

async function Related({ slug }: { slug: string }) {
  return <ProductGrid products={await load(() => productsService.related(slug))} empty="No similar products yet." />
}

async function ProductDetail({ params }: Pick<PageProps<"/product/[slug]">, "params">) {
  const { slug } = await params
  const [product, departments] = await load(() => Promise.all([productsService.get(slug), catalogService.departments()]))
  const seller = product.store
  const category = departments.flatMap((d) => d.categories).find((c) => c.slug === product.category)

  return (
    <div className="container-page flex flex-col gap-12 pt-6 pb-28 lg:pb-12">
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: category?.name ?? "Products", href: `/search?category=${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative self-start lg:sticky lg:top-32">
          <ProductGallery images={product.images} category={product.category} name={product.name} />
          {product.was && (
            <Badge variant="deal" className="absolute top-5 left-5 h-7 px-3 text-sm">
              −{percentOff(product.price, product.was)}%
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Link href={`/search?q=${encodeURIComponent(product.brand)}`} className="text-sm font-medium text-primary hover:underline">
              {product.brand}
            </Link>
            <h1 className="text-3xl leading-tight font-semibold tracking-tight">{product.name}</h1>
            <Rating value={product.rating} count={product.reviewCount} extra={product.stock ? `${product.stock.toLocaleString()} in stock` : "Out of stock"} />
          </div>
          <Price value={product.price} was={product.was} unit={product.unit} className="text-4xl" />
          <BuyBox product={product} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DeliveryEstimate days={product.deliveryDays} from={product.store.coords} className="rounded-2xl border p-4" />
            <InfoTile icon={ShieldCheck} tone="blue" title="Buyer protection" className="rounded-2xl border p-4">
              Paid to seller after delivery
            </InfoTile>
          </div>
          {product.description && <p className="text-muted-foreground">{product.description}</p>}
          <SellerCard seller={seller} className="rounded-3xl bg-muted p-4">
              <EnquiryDialog
                topic="product"
                target={product.slug}
                title={`Message ${seller.name}`}
                description={`About: ${product.name}`}
                placeholder="Ask about stock, delivery or bulk prices"
                success={`Message sent. ${seller.name} usually replies in ${seller.replyTime}.`}
              >
                <Button variant="outline" size="sm" className="border-0">
                  <MessageCircle aria-hidden /> Chat
                </Button>
              </EnquiryDialog>
          </SellerCard>
        </div>
      </div>

      {product.specs.length > 0 && <Section title="Specifications">
        <dl className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {product.specs.map((s) => (
            <div key={s.label} className="rounded-2xl bg-muted px-4 py-3">
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </Section>}

      <Section title="More like this">
        <Suspense fallback={<ProductGridSkeleton count={5} />}>
          <Related slug={product.slug} />
        </Suspense>
      </Section>
    </div>
  )
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  )
}
