import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { deliveryLabel, percentOff } from "@/lib/format"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AddToCartButton } from "./add-to-cart-button"
import { Price } from "./price"
import { ProductImage } from "./product-image"
import { Rating } from "./rating"
import { SaveButton } from "./save-button"

export function ProductCard({ product }: { product: Product }) {
  const href = `/product/${product.slug}`
  const soldOut = product.status === "out-of-stock"
  return (
    <article className="relative flex w-full flex-col gap-3 max-sm:gap-1.5">
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden className="block transition-opacity hover:opacity-90">
          <ProductImage category={product.category} src={product.images[0]} className="max-sm:aspect-5/4 max-sm:rounded-2xl" />
        </Link>
        {product.was && (
          <Badge variant="deal" className="absolute top-3 left-3 max-sm:top-1.5 max-sm:left-1.5 max-sm:h-5 max-sm:px-1.5">
            −{percentOff(product.price, product.was)}%
          </Badge>
        )}
        <SaveButton productId={product.id} label={product.name} size="icon-sm" className="absolute top-2 right-2 sm:size-11 max-sm:top-1 max-sm:right-1" />
        {/* Phones get a one-tap icon on the photo, so the card stays short. */}
        <AddToCartButton productId={product.id} name={product.name} variant="default" size="icon-sm" className="absolute right-1 bottom-1 shadow-md sm:hidden" disabled={soldOut}>
          <span className="sr-only">Add {product.name} to cart</span>
        </AddToCartButton>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-1 max-sm:gap-0.5 max-sm:px-0.5">
        <h3 className="line-clamp-2 min-h-[2.75em] leading-snug font-medium max-sm:text-xs">
          <Link href={href} className="hover:text-primary focus-visible:underline">
            {product.name}
          </Link>
        </h3>
        <Rating value={product.rating} count={product.reviewCount} extra={product.store.location} compact />
        <Price value={product.price} was={product.was} unit={product.unit} compact />
        <p className="text-xs text-success max-sm:text-[11px] max-sm:leading-tight">{soldOut ? <span className="text-muted-foreground">Out of stock</span> : deliveryLabel(product.deliveryDays)}</p>
      </div>
      <AddToCartButton productId={product.id} name={product.name} size="sm" className="max-sm:hidden" disabled={soldOut} />
    </article>
  )
}

/** `rail` makes it one swipeable row on phones, for sections that shouldn't push the page down. */
export function ProductGrid({ products, rail, empty = "No products here yet." }: { products: Product[]; rail?: boolean; empty?: string }) {
  if (!products.length) return <p className="rounded-3xl bg-muted p-10 text-center text-muted-foreground max-sm:rounded-2xl max-sm:p-6">{empty}</p>
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-8 max-sm:grid-cols-3 max-sm:gap-x-2 max-sm:gap-y-3.5 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]", rail && "scrollbar-none max-sm:-mx-3 max-sm:flex max-sm:overflow-x-auto max-sm:px-3")}>
      {products.map((p) => (
        <li key={p.id} className={cn("flex", rail && "max-sm:w-[31%] max-sm:shrink-0")}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  )
}
