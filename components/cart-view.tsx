"use client"

import Link from "next/link"
import { Trash2, Truck } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCart, useSetCartLine } from "@/hooks/use-cart"
import { useDeliveryLocation } from "@/hooks/use-location"
import { formatKm } from "@/lib/delivery"
import { formatNaira } from "@/lib/format"
import { EmptyState } from "./empty-state"
import { LocationPicker } from "./location-picker"
import { OrderSummary } from "./order-summary"
import { ProductImage } from "./product-image"
import { QuantityStepper } from "./quantity-stepper"
import { RequireAuth } from "./require-auth"
import { SellerCard } from "./seller-card"
import { SplitSkeleton } from "./skeletons"

function CartContents() {
  const { data: cart, isPending, isError } = useCart()
  const { location } = useDeliveryLocation()
  const setLine = useSetCartLine()

  if (isPending) return <SplitSkeleton />
  if (isError) return <EmptyState>We couldn’t load your cart. Refresh to try again.</EmptyState>
  const { summary } = cart
  if (!summary.itemCount) return <EmptyState action={{ href: "/", label: "Browse products" }}>Your cart is empty.</EmptyState>

  const remove = (productId: string, qty: number) =>
    setLine.mutate({ productId, qty: 0 }, { onSuccess: () => toast("Removed from cart", { action: { label: "Undo", onClick: () => setLine.mutate({ productId, qty }) } }) })

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <div aria-busy={setLine.isPending} className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted px-5 py-3 text-sm">
          <span>
            {summary.itemCount} items from {summary.shipments.length} sellers
, delivering to <strong className="font-semibold">{location.label}</strong>
          </span>
          <LocationPicker>
            <Button variant="outline" size="sm" className="border-0">
              Change
            </Button>
          </LocationPicker>
        </div>
        {summary.shipments.map((s) => (
          <Card key={s.store.id} className="gap-0 py-0">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-accent/60 px-5 py-4">
              <SellerCard seller={{ name: s.store.name, verified: false }} showMeta={false} />
              <Badge variant="outline" className="h-8 gap-1.5 border-0 bg-background px-3 text-sm font-normal">
                <Truck aria-hidden className="text-success" /> {s.distanceKm !== null && `${formatKm(s.distanceKm)} · `}
                {s.inRange ? `Delivery ${formatNaira(s.delivery)}` : "Too far to deliver"}
              </Badge>
            </div>
            {!s.inRange && (
              <p role="alert" className="border-t bg-deal-soft px-5 py-3 text-sm text-deal-soft-foreground">
                {s.store.name} doesn’t deliver this far. Remove these items or pick a closer delivery location.
              </p>
            )}
            <ul>
              {s.items.map(({ product, qty, unitPrice, total, saving }) => (
                <li key={product.id} className="flex flex-wrap items-center gap-4 border-t px-5 py-4">
                  <ProductImage category={product.category} src={product.images[0]} sizes="80px" className="size-20 rounded-2xl" />
                  <div className="flex min-w-48 flex-1 flex-col gap-1">
                    <Link href={`/product/${product.slug}`} className="hover:text-primary">
                      {product.name}
                    </Link>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {formatNaira(unitPrice)} / {product.unit}
                    </span>
                    {saving > 0 && <Badge variant="success">Bulk price · you save {formatNaira(saving)}</Badge>}
                  </div>
                  <div className="flex items-center gap-3">
                    <QuantityStepper value={qty} onChange={(v) => setLine.mutate({ productId: product.id, qty: Math.max(1, v) })} label={`Quantity of ${product.name}`} />
                    <span className="min-w-28 text-right font-semibold tabular-nums">{formatNaira(total)}</span>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${product.name}`} onClick={() => remove(product.id, qty)}>
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <OrderSummary
        rows={[
          { label: `Items (${summary.itemCount})`, value: summary.subtotal },
          { label: `Delivery (${summary.shipments.length} sellers)`, value: summary.delivery },
          { label: "Buyer protection", value: "Free", tone: "success" },
          ...(summary.savings ? [{ label: "Bulk savings included", value: summary.savings, tone: "success" as const }] : []),
        ]}
        total={summary.total}
      >
        <Button asChild size="lg">
          <Link href="/checkout">Checkout</Link>
        </Button>
      </OrderSummary>
    </div>
  )
}

export function CartView() {
  return (
    <RequireAuth fallback={<SplitSkeleton />}>
      <CartContents />
    </RequireAuth>
  )
}
