"use client"

import { useState } from "react"
import { CircleCheck, Inbox, PackageCheck, ShoppingBag, ThumbsUp, Truck } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSellerOrders, useShipmentStep } from "@/hooks/use-seller"
import { formatNaira } from "@/lib/format"
import { isDone, statusLabel } from "@/lib/orders"
import type { Driver, ShipmentStatus } from "@/lib/types"
import { DeliveryProgress } from "./delivery-progress"
import { EmptyState } from "./empty-state"
import { MessageDialog } from "./message-dialog"
import { PageHeader } from "./page-header"
import { ListSkeleton } from "./skeletons"
import { StatusFilter, type StatusOption } from "./status-filter"

type Filter = "open" | ShipmentStatus

const stages: Omit<StatusOption<Filter>, "count">[] = [
  { value: "open", label: "All open", icon: ShoppingBag, tone: "blue" },
  { value: "placed", label: "New", icon: Inbox, tone: "peach" },
  { value: "confirmed", label: "Accepted", icon: ThumbsUp, tone: "yellow" },
  { value: "loaded", label: "Loaded", icon: PackageCheck, tone: "lilac" },
  { value: "on_the_way", label: "On the way", icon: Truck, tone: "teal" },
  { value: "delivered", label: "Completed", icon: CircleCheck, tone: "mint" },
]

function DispatchDialog({ pending, onDispatch }: { pending: boolean; onDispatch: (driver: Driver, done: () => void) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Truck aria-hidden /> Dispatch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            onDispatch({ name: String(f.get("driver")), truck: String(f.get("truck")), phone: String(f.get("phone")) }, () => setOpen(false))
          }}
        >
          <FieldGroup>
            <DialogHeader>
              <DialogTitle>Dispatch delivery</DialogTitle>
              <DialogDescription>The buyer gets these details so they can reach the driver.</DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="driver">Driver name</FieldLabel>
              <Input id="driver" name="driver" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="truck">Truck plate</FieldLabel>
                <Input id="truck" name="truck" required placeholder="LND 482 XA" />
              </Field>
              <Field>
                <FieldLabel htmlFor="dphone">Driver phone</FieldLabel>
                <Input id="dphone" name="phone" type="tel" required />
              </Field>
            </div>
            <DialogFooter>
              <Button type="submit" loading={pending}>
                Send out for delivery
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SellerOrders() {
  const { data, isPending, isError } = useSellerOrders()
  const step = useShipmentStep()
  const [filter, setFilter] = useState<Filter>("open")
  const mine = (data?.data ?? []).flatMap((order) => order.shipments.map((shipment) => ({ order, shipment })))
  const matches = (f: Filter, status: ShipmentStatus) => (f === "open" ? !isDone(status) : f === status)
  const shown = mine.filter(({ shipment }) => matches(filter, shipment.status))
  const options = stages.map((o) => ({ ...o, count: mine.filter(({ shipment }) => matches(o.value, shipment.status)).length }))

  return (
    <>
      <PageHeader title="Orders" description="Accept, load and dispatch deliveries. You’re paid when the buyer confirms." />
      <StatusFilter label="Filter orders by status" options={options} value={filter} onChange={setFilter} />
      {isPending ? (
        <ListSkeleton rows={3} className="h-56" />
      ) : isError ? (
        <EmptyState>We couldn’t load your orders. Refresh to try again.</EmptyState>
      ) : (
        <ul aria-busy={step.isPending} className="flex flex-col gap-4">
          {shown.map(({ order, shipment }) => {
            const move = (s: Parameters<typeof step.mutate>[0]["step"], message: string, done?: () => void) =>
              step.mutate({ number: order.number, id: shipment.id, step: s }, { onSuccess: () => (toast.success(message), done?.()) })
            return (
              <li key={shipment.id}>
                <Card className="gap-5 px-5 py-5 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg">Order {order.number}</h2>
                      <p className="text-sm text-muted-foreground">
                        {shipment.lines.map((l) => `${l.name.split(",")[0]} × ${l.qty}`).join(" · ")}
                        {shipment.offload && " · offloading crew"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        To {order.site.address} · {shipment.slot}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-lg font-semibold tabular-nums">{formatNaira(shipment.payout)}</span>
                      <Badge variant={shipment.status === "delivered" ? "success" : shipment.status === "cancelled" ? "secondary" : "deal-soft"}>{statusLabel(shipment)}</Badge>
                    </div>
                  </div>
                  {shipment.status !== "cancelled" && <DeliveryProgress status={shipment.status} label={`Order ${order.number} progress`} />}
                  {shipment.issue && (
                    <p className="rounded-2xl bg-deal-soft p-4 text-sm text-deal-soft-foreground">
                      <strong className="font-semibold">{shipment.issue.reason}.</strong> {shipment.issue.message}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2.5">
                    {shipment.status === "placed" && <Button onClick={() => move({ type: "accept" }, `Order ${order.number} accepted`)}>Accept order</Button>}
                    {shipment.status === "confirmed" && <Button onClick={() => move({ type: "load" }, "Marked as loaded")}>Mark as loaded</Button>}
                    {shipment.status === "loaded" && (
                      <DispatchDialog pending={step.isPending} onDispatch={(driver, done) => move({ type: "dispatch", driver }, "Out for delivery. The buyer has the driver’s details.", done)} />
                    )}
                    {(shipment.status === "placed" || shipment.status === "confirmed") && (
                      <MessageDialog
                        title="Decline this order?"
                        description="The buyer is refunded for your part of the order straight away."
                        placeholder="Why can’t you fulfil it? The buyer sees this."
                        submitLabel="Decline and refund"
                        success="Order declined. The buyer has been refunded."
                        onSend={({ message }) => step.mutateAsync({ number: order.number, id: shipment.id, step: { type: "decline", reason: message } })}
                      >
                        <Button variant="ghost" className="text-muted-foreground">
                          Decline
                        </Button>
                      </MessageDialog>
                    )}
                    {shipment.status === "on_the_way" && <p className="text-sm text-muted-foreground">Waiting for the buyer to confirm delivery.</p>}
                    {shipment.status === "delivered" && (
                      <p className="text-sm text-success">{shipment.payoutStatus === "paid" ? "Paid out to your account." : "Payout pending. Add your bank account in Store settings."}</p>
                    )}
                  </div>
                </Card>
              </li>
            )
          })}
          {!shown.length && <li className="rounded-3xl bg-muted p-12 text-center text-muted-foreground">Nothing here.</li>}
        </ul>
      )}
    </>
  )
}
