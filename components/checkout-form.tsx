"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
  const [payment, setPayment] = useState<PaymentMethod>("transfer")
  const site = sites.data?.find((s) => s.id === siteId) ?? sites.data?.[0]
  // Each truck is priced from its seller's warehouse to the chosen site.
  const cart = useCart(site?.coords)

  if (cart.isPending || sites.isPending || settings.isPending) return <SplitSkeleton />
  if (cart.isError || sites.isError || settings.isError) return <EmptyState>We couldn’t load checkout. Refresh to try again.</EmptyState>
  const { summary } = cart.data
  if (!summary.itemCount) return <EmptyState action={{ href: "/", label: "Browse products" }}>There is nothing to check out.</EmptyState>

  const { deliverySlots, offloadFee, serviceFee } = settings.data
  const slotFor = (store: string) => slots[store] ?? deliverySlots[0]
  const outOfRange = summary.shipments.filter((s) => !s.inRange)
  const total = summary.subtotal + summary.delivery + offload.length * offloadFee + serviceFee

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!site) return
    checkout.mutate({ siteId: site.id, paymentMethod: payment, shipments: summary.shipments.map((s) => ({ store: s.store.id, slot: slotFor(s.store.id), offload: offload.includes(s.store.id) })) })
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

        <Step n={2} title="Delivery times">
          {summary.shipments.map((s) => (
            <fieldset key={s.store.id} className="flex flex-col gap-3 rounded-3xl bg-muted p-5 max-sm:gap-2 max-sm:rounded-xl max-sm:p-2.5">
              <legend className="sr-only">Delivery from {s.store.name}</legend>
              <p className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold max-sm:text-sm">{s.store.name}</span>
                <span className="text-sm text-muted-foreground max-sm:text-xs">
                  {s.distanceKm !== null && `${formatKm(s.distanceKm)} · `}
                  {s.inRange ? `delivery ${formatNaira(s.delivery)}` : "too far"}
                </span>
              </p>
              <p className="-mt-2 text-sm text-muted-foreground max-sm:-mt-1.5 max-sm:text-xs">{s.items.map((i) => `${i.product.name.split(",")[0]} × ${i.qty}`).join(", ")}</p>
              {!s.inRange && (
                <p role="alert" className="rounded-2xl bg-deal-soft p-3 text-sm text-deal-soft-foreground">
                  {s.store.name} doesn’t deliver this far. Choose a closer site or remove their items from your cart.
                </p>
              )}
              <RadioGroup value={slotFor(s.store.id)} onValueChange={(v) => setSlots((x) => ({ ...x, [s.store.id]: v }))} aria-label={`Delivery time from ${s.store.name}`} className="flex flex-wrap gap-2 max-sm:gap-1">
                {deliverySlots.map((t, i) => (
                  <ChoiceCard key={t} id={`slot-${s.store.id}-${i}`} value={t} hideRadio className="rounded-full bg-background px-4 py-2.5 text-sm max-sm:gap-0 max-sm:px-2.5 max-sm:py-1 max-sm:text-xs">
                    {t}
                  </ChoiceCard>
                ))}
              </RadioGroup>
              <div className="flex min-h-9 items-center gap-3 max-sm:min-h-8 max-sm:gap-2 max-sm:text-xs">
                <Checkbox
                  id={`offload-${s.store.id}`}
                  checked={offload.includes(s.store.id)}
                  onCheckedChange={(on) => setOffload((o) => (on ? [...o, s.store.id] : o.filter((x) => x !== s.store.id)))}
                />
                <Label htmlFor={`offload-${s.store.id}`} className="cursor-pointer max-sm:text-xs">
                  Add offloading crew <span className="text-muted-foreground">+{formatNaira(offloadFee)}</span>
                </Label>
              </div>
            </fieldset>
          ))}
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
          { label: `Delivery${site?.area ? ` to ${site.area}` : ""} (${summary.shipments.length} trucks)`, value: summary.delivery },
          ...(offload.length ? [{ label: "Offloading crew", value: offload.length * offloadFee }] : []),
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
