"use client"

import Link from "next/link"
import { AlertTriangle, Banknote, MapPin, Package, PackagePlus, ShoppingBag, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMe } from "@/hooks/use-auth"
import { useListings, useOwnStore, useSellerOrders } from "@/hooks/use-seller"
import { formatNaira } from "@/lib/format"
import { isDone, statusLabel } from "@/lib/orders"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"
import { ProductImage } from "./product-image"
import { ListSkeleton } from "./skeletons"
import { PayoutReminder } from "./payout-reminder"
import { StatCard } from "./stat-card"

const LOW_STOCK = 100

function DashboardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 max-sm:gap-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-3xl" />
        ))}
      </div>
      <ListSkeleton rows={2} className="h-48" />
    </div>
  )
}

export function SellerDashboard() {
  const { data: user } = useMe()
  const orders = useSellerOrders()
  const products = useListings()
  const store = useOwnStore().data

  const header = (
    <PageHeader title={`Good day, ${user?.name.split(" ")[0] ?? "there"}`} description="Here’s how your store is doing.">
      <Button asChild>
        <Link href="/seller/products/new">
          <PackagePlus aria-hidden /> Add product
        </Link>
      </Button>
    </PageHeader>
  )
  if (orders.isPending || products.isPending)
    return (
      <>
        {header}
        <DashboardSkeleton />
      </>
    )
  if (orders.isError || products.isError)
    return (
      <>
        {header}
        <EmptyState>We couldn’t load your dashboard. Refresh to try again.</EmptyState>
      </>
    )

  const listings = products.data.data
  const mine = orders.data.data.flatMap((order) => order.shipments.map((shipment) => ({ order, shipment })))
  const open = mine.filter(({ shipment }) => !isDone(shipment.status))
  const released = mine.filter(({ shipment }) => shipment.payoutStatus === "paid").reduce((n, { shipment }) => n + shipment.payout, 0)
  const held = open.reduce((n, { shipment }) => n + shipment.payout, 0)
  const waiting = mine.filter(({ shipment }) => shipment.payoutStatus === "pending" || shipment.payoutStatus === "failed").reduce((n, { shipment }) => n + shipment.payout, 0)
  const low = listings.filter((l) => l.stock < LOW_STOCK || l.status === "out-of-stock")

  return (
    <>
      {header}
      {store && !store.payout && <PayoutReminder amount={waiting} href="/seller/settings" />}
      {store && !store.coords && (
        <p role="status" className="flex flex-wrap items-center gap-3 rounded-3xl bg-deal-soft p-5 text-deal-soft-foreground max-sm:gap-2 max-sm:rounded-2xl max-sm:p-3 max-sm:text-sm">
          <MapPin aria-hidden className="size-5 shrink-0" />
          <span className="flex-1">Set your warehouse location so buyers see accurate delivery fees. Until then they pay the minimum fee.</span>
          <Button asChild variant="outline" size="sm" className="border-0">
            <Link href="/seller/settings">Set location</Link>
          </Button>
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 max-sm:gap-2 xl:grid-cols-4">
        <StatCard icon={Wallet} tone="blue" label="Due to you" value={formatNaira(held)} note="Released when buyers confirm" />
        <StatCard icon={Banknote} tone="mint" label="Paid out" value={formatNaira(released)} />
        <StatCard icon={ShoppingBag} tone="peach" label="Open orders" value={String(open.length)} />
        <StatCard icon={Package} tone="lilac" label="Live products" value={String(listings.filter((l) => l.status === "live").length)} note={`${listings.length} total`} />
      </div>

      <div className="grid items-start gap-6 max-sm:gap-3 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between px-6 max-sm:px-3">
            <CardTitle className="text-lg max-sm:text-base">Orders to handle</CardTitle>
            <Link href="/seller/orders" className="py-2 text-sm text-primary hover:underline">
              All orders
            </Link>
          </CardHeader>
          <CardContent className="px-6 max-sm:px-3">
            {open.length ? (
              <ul className="flex flex-col divide-y">
                {open.map(({ order, shipment }) => (
                  <li key={shipment.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="flex flex-col">
                      <span className="font-semibold">Order {order.number}</span>
                      <span className="text-sm text-muted-foreground">{order.site.address}</span>
                    </span>
                    <Badge variant="deal-soft">{statusLabel(shipment)}</Badge>
                    <span className="font-semibold tabular-nums">{formatNaira(shipment.payout)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-muted-foreground">No open orders right now.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-6 max-sm:px-3">
            <CardTitle className="flex items-center gap-2 text-lg max-sm:text-base">
              <AlertTriangle aria-hidden className="size-5 text-deal" /> Needs restocking
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 max-sm:px-3">
            {low.length ? (
              <ul className="flex flex-col gap-3">
                {low.map((l) => (
                  <li key={l.slug}>
                    <Link href={`/seller/products/${l.slug}`} className="flex items-center gap-3 rounded-xl p-1 hover:bg-muted">
                      <ProductImage category={l.category} src={l.images[0]} sizes="48px" className="size-12 rounded-lg" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm">{l.name}</span>
                        <span className="text-sm text-muted-foreground">{l.status === "out-of-stock" ? "Out of stock" : `${l.stock} left`}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-muted-foreground">Stock levels look good.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
