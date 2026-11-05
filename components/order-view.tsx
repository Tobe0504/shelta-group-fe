"use client"

import { CircleCheck, Clock, MessageCircle, Phone, Printer } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup } from "@/components/ui/radio-group"
import { useSettings } from "@/hooks/use-catalog"
import { useOrder, useRetryPayment, useShipmentAction } from "@/hooks/use-orders"
import { formatKm } from "@/lib/delivery"
import { formatDay, formatNaira } from "@/lib/format"
import { isStatus } from "@/lib/http"
import { isDone, paymentLabel, statusLabel } from "@/lib/orders"
import type { Order, Shipment } from "@/lib/types"
import { ChoiceCard } from "./choice-card"
import { DeliveryProgress } from "./delivery-progress"
import { EmptyState } from "./empty-state"
import { EnquiryDialog } from "./enquiry-dialog"
import { MessageDialog } from "./message-dialog"
import { RequireAuth } from "./require-auth"
import { SellerCard } from "./seller-card"
import { SplitSkeleton } from "./skeletons"

type Act = ReturnType<typeof useShipmentAction>

function RescheduleDialog({ shipment, act }: { shipment: Shipment; act: Act }) {
  const [open, setOpen] = useState(false)
  const [slot, setSlot] = useState(shipment.slot)
  const slots = useSettings().data?.deliverySlots ?? []
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Change delivery time</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pick a new delivery time</DialogTitle>
        </DialogHeader>
        <RadioGroup value={slot} onValueChange={setSlot} aria-label="Delivery time" className="gap-2">
          {slots.map((t, i) => (
            <ChoiceCard key={t} id={`resched-${i}`} value={t}>
              {t}
            </ChoiceCard>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button
            disabled={act.isPending || slot === shipment.slot}
            onClick={() =>
              act.mutate(
                { id: shipment.id, action: { type: "reschedule", slot } },
                {
                  onSuccess: () => {
                    setOpen(false)
                    toast.success(`Delivery moved to ${slot}`)
                  },
                },
              )
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ShipmentCard({ order, shipment, index, act }: { order: Order; shipment: Shipment; index: number; act: Act }) {
  const label = `Delivery ${index + 1}`
  const items = shipment.lines.map((l) => `${l.name.split(",")[0]} × ${l.qty}`).join(" · ")
  const { status, driver } = shipment

  return (
    <Card className="gap-5 px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg">
            {label} · {shipment.storeName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {items}
            {shipment.offload && " · offloading crew"}
            {shipment.distanceKm !== undefined && ` · ${formatKm(shipment.distanceKm)}`}
          </p>
        </div>
        <Badge variant={status === "delivered" ? "success" : status === "on_the_way" ? "default" : status === "cancelled" ? "destructive" : "deal-soft"} className="h-8 px-3 text-sm">
          {statusLabel(shipment)}
        </Badge>
      </div>
      {status !== "cancelled" && <DeliveryProgress status={status} label={`${label} progress`} />}
      {shipment.issue && (
        <p className="rounded-2xl bg-deal-soft p-4 text-sm text-deal-soft-foreground">
          <strong className="font-semibold">{shipment.issue.reason}.</strong> {shipment.issue.message}
        </p>
      )}

      {status === "on_the_way" && driver && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted p-4">
          <p className="flex flex-col text-sm">
            <span className="font-semibold">{driver.name}</span>
            <span className="text-muted-foreground">Driver · truck {driver.truck}</span>
          </p>
          <Button asChild variant="outline" size="sm" className="border-0">
            <a href={`tel:${driver.phone}`}>
              <Phone aria-hidden /> Call driver
            </a>
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {status === "on_the_way" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Confirm delivery</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm this delivery?</AlertDialogTitle>
                <AlertDialogDescription>
                  {formatNaira(shipment.amount)} will be released to {shipment.storeName}. Only confirm once you have counted and checked everything.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Not yet</AlertDialogCancel>
                <AlertDialogAction onClick={() => act.mutate({ id: shipment.id, action: { type: "confirm" } }, { onSuccess: () => toast.success(`Payment released to ${shipment.storeName}`) })}>
                  Yes, release payment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {(status === "placed" || status === "confirmed") && <RescheduleDialog shipment={shipment} act={act} />}
        {status !== "pending_payment" && !isDone(status) && (
          <MessageDialog
            title="Report a problem"
            description="Payment stays on hold while we sort it out with the seller."
            reasons={["Short delivery", "Damaged items", "Wrong item", "Late delivery"]}
            placeholder="Tell us what happened"
            submitLabel="Send report"
            success="Report sent. Our support team will call you shortly."
            onSend={({ reason, message }) => act.mutateAsync({ id: shipment.id, action: { type: "report", reason: reason ?? "Other", message } })}
          >
            <Button variant="secondary">Report a problem</Button>
          </MessageDialog>
        )}
        {!isDone(status) && shipment.lines[0] && (
          <EnquiryDialog topic="product" target={shipment.lines[0].slug} title={`Message ${shipment.storeName}`} description={`Order ${order.number}`} success={`Message sent to ${shipment.storeName}`}>
            <Button variant="secondary">
              <MessageCircle aria-hidden /> Chat with seller
            </Button>
          </EnquiryDialog>
        )}
      </div>
    </Card>
  )
}

function PaymentBanner({ order }: { order: Order }) {
  const retry = useRetryPayment()
  const released = order.shipments.filter((s) => s.status === "delivered").reduce((n, s) => n + s.amount, 0)

  if (order.payment.status !== "paid")
    return (
      <div role="status" className="flex flex-wrap items-center gap-4 rounded-3xl bg-deal-soft p-5 text-deal-soft-foreground">
        <Clock aria-hidden className="size-8 shrink-0" />
        <span className="flex flex-1 flex-col">
          <strong className="text-lg font-semibold">Waiting for payment · {formatNaira(order.total)}</strong>
          Sellers start preparing your order once payment is confirmed.
        </span>
        <Button onClick={() => retry.mutate(order.number)} loading={retry.isPending || retry.isSuccess}>
          Pay now
        </Button>
      </div>
    )

  return (
    <p role="status" className="flex flex-wrap items-center gap-4 rounded-3xl bg-success-soft p-5 text-success-soft-foreground">
      <CircleCheck aria-hidden className="size-8 shrink-0 text-success" />
      <span className="flex flex-col">
        <strong className="text-lg font-semibold">Payment received · {formatNaira(order.total)}</strong>
        {released ? `${formatNaira(released)} released so far. The rest is held until you confirm.` : "It is held safely until you confirm each delivery."}
      </span>
    </p>
  )
}

function OrderDetails({ number }: { number: string }) {
  const { data: order, isPending, error } = useOrder(number)
  const act = useShipmentAction(number)

  if (isPending) return <SplitSkeleton />
  if (error)
    return <EmptyState action={{ href: "/account", label: "See your orders" }}>{isStatus(error, 404) ? `We couldn’t find order ${number}.` : "We couldn’t load this order. Refresh to try again."}</EmptyState>

  return (
    <div className="flex flex-col gap-6">
      <PaymentBanner order={order} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Order {order.number}</h1>
          <p className="text-muted-foreground">
            Placed {formatDay(order.createdAt)} · {order.shipments.length} deliveries to {order.site.address}
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer aria-hidden /> Print invoice
        </Button>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div aria-busy={act.isPending} className="flex flex-col gap-5">
          {order.shipments.map((s, i) => (
            <ShipmentCard key={s.id} order={order} shipment={s} index={i} act={act} />
          ))}
        </div>

        <aside aria-labelledby="payment-heading" className="flex flex-col gap-4 rounded-[28px] bg-muted p-6 lg:sticky lg:top-32">
          <h2 id="payment-heading" className="text-xl">
            Your payment
          </h2>
          <ul className="flex flex-col gap-3">
            {order.shipments.map((s) => {
              const released = s.status === "delivered"
              return (
                <li key={s.id} className="flex flex-col gap-2 rounded-2xl bg-background p-4">
                  <SellerCard seller={{ name: s.storeName, verified: false }} showMeta={false} />
                  <p className="flex items-center justify-between gap-2">
                    <Badge variant={released ? "success" : s.status === "cancelled" ? "secondary" : "accent"}>
                      {released ? "Released to seller" : s.status === "cancelled" ? "Refunded" : "Held until you confirm"}
                    </Badge>
                    <span className="font-semibold tabular-nums">{formatNaira(s.amount)}</span>
                  </p>
                </li>
              )
            })}
          </ul>
          <p className="flex justify-between border-t pt-3 font-semibold">
            Total {order.payment.status === "paid" ? "paid" : "due"} <span className="tabular-nums">{formatNaira(order.total)}</span>
          </p>
          <p className="text-sm text-muted-foreground">By {paymentLabel(order.paymentMethod)}</p>
        </aside>
      </div>
    </div>
  )
}

export function OrderView({ number }: { number: string }) {
  return (
    <RequireAuth fallback={<SplitSkeleton />}>
      <OrderDetails number={number} />
    </RequireAuth>
  )
}
