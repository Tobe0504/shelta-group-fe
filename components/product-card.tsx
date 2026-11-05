import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { deliveryLabel, percentOff } from "@/lib/format"
import type { Product } from "@/lib/types"
import { AddToCartButton } from "./add-to-cart-button"
import { Price } from "./price"
import { ProductImage } from "./product-image"
import { Rating } from "./rating"
import { SaveButton } from "./save-button"

export function ProductCard({ product }: { product: Product }) {
  const href = `/product/${product.slug}`
  return (
    <article className="relative flex w-full flex-col gap-3">
      <Link href={href} tabIndex={-1} aria-hidden className="transition-opacity hover:opacity-90">
        <ProductImage category={product.category} src={product.images[0]} />
      </Link>
      {product.was && (
        <Badge variant="deal" className="absolute top-3 left-3">
          −{percentOff(product.price, product.was)}%
        </Badge>
      )}
      <SaveButton productId={product.id} label={product.name} className="absolute top-2 right-2" />
      <div className="flex flex-1 flex-col gap-1.5 px-1">
        <h3 className="line-clamp-2 min-h-[2.75em] leading-snug font-medium">
          <Link href={href} className="hover:text-primary focus-visible:underline">
            {product.name}
          </Link>
        </h3>
        <Rating value={product.rating} count={product.reviewCount} extra={product.store.location} />
        <Price value={product.price} was={product.was} unit={product.unit} />
        <p className="text-xs text-success">{product.status === "out-of-stock" ? <span className="text-muted-foreground">Out of stock</span> : deliveryLabel(product.deliveryDays)}</p>
      </div>
      <AddToCartButton productId={product.id} name={product.name} size="sm" disabled={product.status === "out-of-stock"} />
    </article>
  )
}

export function ProductGrid({ products, empty = "No products here yet." }: { products: Product[]; empty?: string }) {
  if (!products.length) return <p className="rounded-3xl bg-muted p-10 text-center text-muted-foreground">{empty}</p>
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
      {products.map((p) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  )
}
