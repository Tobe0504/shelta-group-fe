"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { MapPin } from "lucide-react"
import { RadioGroup } from "@/components/ui/radio-group"
import { useCart } from "@/hooks/use-cart"
import { useSettings } from "@/hooks/use-catalog"
import { useCheckout } from "@/hooks/use-orders"
import { useSites } from "@/hooks/use-sites"
import { formatKm } from "@/lib/delivery"
import { formatNaira } from "@/lib/format"
import { paymentMethods } from "@/lib/orders"
import type { PaymentMethod } from "@/lib/types"
import { ChoiceCard } from "./choice-card"
import { EmptyState } from "./empty-state"
import { NewSiteDialog } from "./new-site-dialog"
import { OrderSummary } from "./order-summary"
import { RequireAuth } from "./require-auth"
import { SplitSkeleton } from "./skeletons"

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="flex flex-col gap-5 rounded-[28px] border p-5 max-sm:gap-2.5 max-sm:rounded-2xl max-sm:p-3 sm:p-6">
      <h2 id={`step-${n}`} className="flex items-center gap-3 text-xl max-sm:gap-2 max-sm:text-base">
        <span aria-hidden className="grid size-8 place-items-center rounded-full bg-primary text-sm max-sm:size-6 max-sm:text-xs text-primary-foreground">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Checkout() {
  const sites = useSites()
  const settings = useSettings()
  const checkout = useCheckout()
  const [siteId, setSiteId] = useState<string>()
  const [slots, setSlots] = useState<Record<string, string>>({})
  const [offload, setOffload] = useState<string[]>([])
  const [pickup, setPickup] = useState<string[]>([])
  const [payment, setPayment] = useState<PaymentMethod>("transfer")
  const site = sites.data?.find((s) => s.id === siteId) ?? sites.data?.[0]
  // Each truck is priced from its seller's warehouse to the chosen site.
  const cart = useCart(site?.coords)

  if (cart.isPending || sites.isPending || settings.isPending) return <SplitSkeleton />
  if (cart.isError || sites.isError || settings.isError) return <EmptyState>We couldn’t load checkout. Refresh to try again.</EmptyState>
  const { summary } = cart.data
  if (!summary.itemCount) return <EmptyState action={{ href: "/", label: "Browse products" }}>There is nothing to check out.</EmptyState>

  const { serviceFee } = settings.data
  // Each seller has its own slots and offloading price, and may let buyers collect instead.
  const collects = (s: (typeof summary.shipments)[number]) => !!s.options.pickup && pickup.includes(s.store.id)
  const slotFor = (s: (typeof summary.shipments)[number]) => (s.options.slots.includes(slots[s.store.id]) ? slots[s.store.id] : s.options.slots[0])
  const offloads = summary.shipments.filter((s) => !collects(s) && offload.includes(s.store.id))
  const delivery = summary.shipments.reduce((n, s) => n + (collects(s) ? 0 : s.delivery), 0)
  const offloadTotal = offloads.reduce((n, s) => n + s.options.offloadFee, 0)
  const trucks = summary.shipments.filter((s) => !collects(s)).length
  const outOfRange = summary.shipments.filter((s) => !s.inRange && !collects(s))
  const total = summary.subtotal + delivery + offloadTotal + serviceFee
  const toggle = (set: typeof setPickup, id: string, on: boolean) => set((list) => (on ? [...list, id] : list.filter((x) => x !== id)))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!site) return
    checkout.mutate({
      siteId: site.id,
      paymentMethod: payment,
      shipments: summary.shipments.map((s) => ({ store: s.store.id, slot: slotFor(s), offload: !collects(s) && offload.includes(s.store.id), fulfilment: collects(s) ? "pickup" : "delivery" })),
    })
  }

  return (
    <form onSubmit={submit} className="grid items-start gap-8 max-sm:gap-3 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-5 max-sm:gap-2.5">
        <Step n={1} title="Delivery site">
          {sites.data.length > 0 ? (
            <RadioGroup value={site?.id} onValueChange={setSiteId} aria-label="Delivery site" className="grid gap-3 max-sm:gap-1.5 sm:grid-cols-2">
              {sites.data.map((s) => (
                <ChoiceCard key={s.id} id={`site-${s.id}`} value={s.id}>
                  <span className="flex flex-col gap-0.5 text-sm text-muted-foreground max-sm:gap-0 max-sm:text-xs">
                    <span className="text-base font-semibold text-foreground max-sm:text-sm">{s.label}</span>
                    {s.address}
                    <span>
                      Site contact: {s.contactName} · {s.contactPhone}
                    </span>
                  </span>
                </ChoiceCard>
              ))}
            </RadioGroup>
          ) : (
            <p className="text-muted-foreground">Add the site we should deliver to.</p>
          )}
          <NewSiteDialog onAdd={(s) => setSiteId(s.id)} />
        </Step>

        <Step n={2} title="Delivery or pickup">
          {cart.isFetching && (
            <p role="status" className="-mt-2 flex items-center gap-2 text-sm text-muted-foreground max-sm:-mt-1 max-sm:text-xs">
              <Spinner className="size-3.5" /> Updating delivery prices for {site?.label ?? "your site"}…
            </p>
          )}
          {summary.shipments.map((s) => {
            const isPickup = collects(s)
            return (
              <fieldset key={s.store.id} className="flex flex-col gap-3 rounded-3xl bg-muted p-5 max-sm:gap-2 max-sm:rounded-xl max-sm:p-2.5">
                <legend className="sr-only">From {s.store.name}</legend>
                <p className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold max-sm:text-sm">{s.store.name}</span>
                  <span className="text-sm text-muted-foreground tabular-nums max-sm:text-xs">
                    {isPickup ? "You collect · free" : <>{s.distanceKm !== null && `${formatKm(s.distanceKm)} · `}{s.inRange ? `delivery ${formatNaira(s.delivery)}` : "too far to deliver"}</>}
                  </span>
                </p>
                <p className="-mt-2 text-sm text-muted-foreground max-sm:-mt-1.5 max-sm:text-xs">{s.items.map((i) => `${i.product.name.split(",")[0]} × ${i.qty}`).join(", ")}</p>
                {s.options.pickup && (
                  <RadioGroup value={isPickup ? "pickup" : "delivery"} onValueChange={(v) => toggle(setPickup, s.store.id, v === "pickup")} aria-label={`Delivery or pickup from ${s.store.name}`} className="grid grid-cols-2 gap-2 max-sm:gap-1.5">
                    <ChoiceCard id={`ful-${s.store.id}-delivery`} value="delivery" className="bg-background">
                      <span className="text-sm font-medium max-sm:text-xs">Deliver to my site</span>
                    </ChoiceCard>
                    <ChoiceCard id={`ful-${s.store.id}-pickup`} value="pickup" className="bg-background">
                      <span className="text-sm font-medium max-sm:text-xs">I’ll pick it up</span>
                    </ChoiceCard>
                  </RadioGroup>
                )}
                {isPickup && s.options.pickup && (
                  <p className="flex items-start gap-1.5 rounded-2xl bg-background p-3 text-sm max-sm:rounded-xl max-sm:p-2.5 max-sm:text-xs">
                    <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>
                      Collect from <strong className="font-semibold">{s.options.pickup.address}</strong>
                      {s.options.pickup.hours && <span className="text-muted-foreground"> · {s.options.pickup.hours}</span>}
                    </span>
                  </p>
                )}
                {!s.inRange && !isPickup && (
                  <p role="alert" className="rounded-2xl bg-deal-soft p-3 text-sm text-deal-soft-foreground max-sm:rounded-xl max-sm:p-2.5 max-sm:text-xs">
                    {s.store.name} doesn’t deliver this far. {s.options.pickup ? "Choose pickup, a closer site," : "Choose a closer site"} or remove their items from your cart.
                  </p>
                )}
                <p className="text-xs font-medium text-muted-foreground">{isPickup ? "Pickup time" : "Delivery time"}</p>
                <RadioGroup value={slotFor(s)} onValueChange={(v) => setSlots((x) => ({ ...x, [s.store.id]: v }))} aria-label={`${isPickup ? "Pickup" : "Delivery"} time from ${s.store.name}`} className="-mt-1.5 flex flex-wrap gap-2 max-sm:gap-1">
                  {s.options.slots.map((t, i) => (
                    <ChoiceCard key={t} id={`slot-${s.store.id}-${i}`} value={t} hideRadio className="rounded-full bg-background px-4 py-2.5 text-sm max-sm:gap-0 max-sm:px-2.5 max-sm:py-1 max-sm:text-xs">
                      {t}
                    </ChoiceCard>
                  ))}
                </RadioGroup>
                {!isPickup && (
                  <div className="flex min-h-9 items-center gap-3 max-sm:min-h-8 max-sm:gap-2 max-sm:text-xs">
                    <Checkbox id={`offload-${s.store.id}`} checked={offload.includes(s.store.id)} onCheckedChange={(on) => toggle(setOffload, s.store.id, on === true)} />
                    <Label htmlFor={`offload-${s.store.id}`} className="cursor-pointer max-sm:text-xs">
                      Add offloading crew <span className="text-muted-foreground">+{formatNaira(s.options.offloadFee)}</span>
                    </Label>
                  </div>
                )}
              </fieldset>
            )
          })}
        </Step>

        <Step n={3} title="Payment">
          <RadioGroup value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)} aria-label="Payment method" className="gap-2.5 max-sm:gap-1.5">
            {paymentMethods.map((p) => (
              <ChoiceCard key={p.id} id={`pay-${p.id}`} value={p.id}>
                <span className="flex flex-1 flex-col gap-0.5 text-sm text-muted-foreground max-sm:gap-0 max-sm:text-xs">
                  <span className="text-base font-semibold text-foreground max-sm:text-sm">{p.label}</span>
                  {p.text}
                </span>
                {p.tag && <Badge variant="success">{p.tag}</Badge>}
              </ChoiceCard>
            ))}
          </RadioGroup>
        </Step>
      </div>

      <OrderSummary
        title="Your order"
        rows={[
          { label: "Items", value: summary.subtotal },
          { label: trucks ? `Delivery${site?.area ? ` to ${site.area}` : ""} (${trucks} ${trucks === 1 ? "truck" : "trucks"})` : "Delivery (you collect)", value: delivery },
          ...(offloads.length ? [{ label: "Offloading crew", value: offloadTotal }] : []),
          ...(serviceFee ? [{ label: "Service fee", value: serviceFee }] : []),
          { label: "Buyer protection", value: "Free", tone: "success" as const },
        ]}
        total={total}
      >
        <Button type="submit" size="lg" loading={checkout.isPending || checkout.isSuccess} disabled={!site || outOfRange.length > 0}>
          {`Pay ${formatNaira(total)}`}
        </Button>
      </OrderSummary>
    </form>
  )
}

export function CheckoutForm() {
  return (
    <RequireAuth fallback={<SplitSkeleton />}>
      <Checkout />
    </RequireAuth>
  )
}
