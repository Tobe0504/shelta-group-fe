"use client"

import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEscrowOrders, useRefundShipment, useReleaseShipment } from "@/hooks/use-admin"
import { useAdminRefund, useAdminRelease, useEscrow } from "@/hooks/use-services"
import { isPickup, statusLabel } from "@/lib/orders"
import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDay, formatNaira } from "@/lib/format"
import type { EscrowJob, EscrowOrder, Shipment, Stage } from "@/lib/types"
import { ConfirmDialog } from "../confirm-dialog"
import { EmptyState } from "../empty-state"
import { StageRows } from "../job-stages"
import { PageHeader } from "../page-header"
import { ListSkeleton } from "../skeletons"

function StageActions({ job, stage }: { job: EscrowJob; stage: Stage }) {
  const release = useAdminRelease()
  const refund = useAdminRefund()
  if (stage.status === "released" && stage.payoutStatus !== "paid")
    return <span className="w-full text-xs text-muted-foreground">Payout {stage.payoutStatus === "failed" ? "failed" : "waiting"}: {formatNaira(stage.payout ?? 0)}. Run due payouts from the overview once the pro has a bank account.</span>
  if (stage.status !== "held") return null
  return (
    <span className="flex w-full flex-col gap-2">
      {stage.issue && (
        <span className="rounded-xl bg-deal-soft p-2.5 text-xs text-deal-soft-foreground">
          <strong className="font-semibold">Buyer reported, {formatDay(stage.issue.at)}:</strong> {stage.issue.message}
        </span>
      )}
      <span className="flex flex-wrap gap-2">
        <ConfirmDialog
          title={`Release ${formatNaira(stage.amount)} to ${job.hired.name}?`}
          description="The pro is paid minus commission. Do this when the work is confirmed done."
          confirmLabel="Release"
          cancelLabel="Back"
          variant="default"
          onConfirm={() => release.mutate({ job: job.id, stage: stage.id }, { onSuccess: () => toast.success("Released to the pro") })}
          trigger={
            <Button size="sm" loading={release.isPending}>
              Release to pro
            </Button>
          }
        />
        <ConfirmDialog
          title={`Refund ${formatNaira(stage.amount)} to ${job.user.name}?`}
          description="The money goes back to the buyer’s card or account through Paystack. Later stages are cancelled."
          confirmLabel="Refund"
          cancelLabel="Back"
          onConfirm={() => refund.mutate({ job: job.id, stage: stage.id }, { onSuccess: () => toast.success("Refund started") })}
          trigger={
            <Button size="sm" variant="ghost" loading={refund.isPending}>
              Refund buyer
            </Button>
          }
        />
      </span>
    </span>
  )
}

const HELD = ["placed", "confirmed", "loaded", "on_the_way"]

/** One delivery's escrow state and the admin's options to settle it. */
function ShipmentRow({ order, shipment }: { order: EscrowOrder; shipment: Shipment }) {
  const release = useReleaseShipment()
  const refund = useRefundShipment()
  const held = HELD.includes(shipment.status)
  return (
    <li className="flex flex-col gap-2 p-3 max-sm:p-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-medium max-sm:text-xs">
            {shipment.storeName} · {isPickup(shipment) ? "pickup" : "delivery"} {shipment.slot}
          </span>
          <span className="text-sm font-semibold tabular-nums max-sm:text-xs">{formatNaira(shipment.amount)}</span>
          {held && <span className="text-xs text-muted-foreground">{statusLabel(shipment)}</span>}
        </span>
        <Badge variant={held ? "accent" : shipment.payoutStatus === "failed" ? "destructive" : "secondary"}>{held ? "In escrow" : `Payout ${shipment.payoutStatus === "failed" ? "failed" : "waiting"}`}</Badge>
      </div>
      {shipment.issue && held && (
        <span className="rounded-xl bg-deal-soft p-2.5 text-xs text-deal-soft-foreground">
          <strong className="font-semibold">
            {shipment.issue.reason}, {formatDay(shipment.issue.at)}:
          </strong>{" "}
          {shipment.issue.message || "No details given."}
        </span>
      )}
      {!held && <span className="text-xs text-muted-foreground">{formatNaira(shipment.payout)} to the seller. Run due payouts from the overview once they’ve added a bank account.</span>}
      {held && (
        <span className="flex flex-wrap gap-2">
          <ConfirmDialog
            title={`Release ${formatNaira(shipment.payout)} to ${shipment.storeName}?`}
            description="Marks the delivery complete as if the buyer had confirmed it, and pays the seller minus commission."
            confirmLabel="Release"
            cancelLabel="Back"
            variant="default"
            onConfirm={() => release.mutate({ number: order.number, id: shipment.id }, { onSuccess: () => toast.success("Released to the seller") })}
            trigger={
              <Button size="sm" loading={release.isPending}>
                Release to seller
              </Button>
            }
          />
          <ConfirmDialog
            title={`Refund ${formatNaira(shipment.amount)} to ${order.buyer.name}?`}
            description="Cancels this delivery, refunds the buyer through Paystack and puts the stock back."
            confirmLabel="Refund"
            cancelLabel="Back"
            onConfirm={() => refund.mutate({ number: order.number, id: shipment.id }, { onSuccess: () => toast.success("Refund started") })}
            trigger={
              <Button size="sm" variant="ghost" loading={refund.isPending}>
                Refund buyer
              </Button>
            }
          />
        </span>
      )}
    </li>
  )
}

function OrderEscrow() {
  const { data, isPending, isError } = useEscrowOrders()
  if (isPending) return <ListSkeleton rows={3} className="h-40" />
  if (isError) return <EmptyState>We couldn’t load order escrow. Refresh to try again.</EmptyState>
  const relevant = (s: Shipment) => HELD.includes(s.status) || s.payoutStatus === "pending" || s.payoutStatus === "failed"
  const orders = [...data].sort((a, b) => Number(b.shipments.some((s) => s.issue && HELD.includes(s.status))) - Number(a.shipments.some((s) => s.issue && HELD.includes(s.status))))
  if (!orders.length) return <EmptyState>No order money in escrow right now.</EmptyState>
  return (
    <ul className="flex flex-col gap-4 max-sm:gap-2">
      {orders.map((order) => (
        <li key={order.id}>
          <Card className="gap-3 px-5 py-5 max-sm:gap-2 max-sm:p-3 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="text-lg max-sm:text-base">Order {order.number}</h2>
                <p className="text-sm text-muted-foreground max-sm:text-xs">
                  Buyer{" "}
                  <a href={`mailto:${order.buyer.email}`} className="text-primary hover:underline">
                    {order.buyer.name}
                  </a>
                  {order.buyer.phone && ` (${order.buyer.phone})`} · paid {formatDay(order.createdAt)} · {order.site.address}
                </p>
              </div>
              {order.shipments.some((s) => s.issue && HELD.includes(s.status)) && <Badge variant="deal-soft">Problem reported</Badge>}
            </div>
            <ul className="flex flex-col divide-y rounded-2xl ring-1 ring-border max-sm:rounded-xl">
              {order.shipments.filter(relevant).map((s) => (
                <ShipmentRow key={s.id} order={order} shipment={s} />
              ))}
            </ul>
          </Card>
        </li>
      ))}
    </ul>
  )
}

function JobEscrow() {
  const { data, isPending, isError } = useEscrow()
  const jobs = [...(data ?? [])].sort((a, b) => Number(b.stages.some((s) => s.issue)) - Number(a.stages.some((s) => s.issue)))
  if (isPending) return <ListSkeleton rows={3} className="h-40" />
  if (isError) return <EmptyState>We couldn’t load job escrow. Refresh to try again.</EmptyState>
  if (!jobs.length) return <EmptyState>No service-job money in escrow right now.</EmptyState>
  return (
    <ul className="flex flex-col gap-4 max-sm:gap-2">
      {jobs.map((job) => (
        <li key={job.id}>
          <Card className="gap-3 px-5 py-5 max-sm:gap-2 max-sm:p-3 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="text-lg max-sm:text-base">{job.title}</h2>
                <p className="text-sm text-muted-foreground max-sm:text-xs">
                  Buyer <a href={`mailto:${job.user.email}`} className="text-primary hover:underline">{job.user.name}</a> ({job.contactPhone}) · Pro{" "}
                  <Link href={`/pros/${job.hired.slug}`} className="text-primary hover:underline">
                    {job.hired.name}
                  </Link>{" "}
                  ({job.hired.phone})
                </p>
              </div>
              {job.stages.some((s) => s.issue && s.status === "held") && <Badge variant="deal-soft">Problem reported</Badge>}
            </div>
            <StageRows stages={job.stages} action={(s) => <StageActions job={job} stage={s} />} />
          </Card>
        </li>
      ))}
    </ul>
  )
}

export function AdminEscrow() {
  const orders = useEscrowOrders().data?.length ?? 0
  const jobs = useEscrow().data?.length ?? 0
  return (
    <>
      <PageHeader title="Escrow" description="Money SheltaMart is holding for product orders and service jobs, problems buyers reported, and payouts still to send. Reported problems are listed first." />
      <Tabs defaultValue="orders" className="gap-4">
        <TabsList>
          <TabsTrigger value="orders">
            Product orders <TabsCount>{orders}</TabsCount>
          </TabsTrigger>
          <TabsTrigger value="jobs">
            Service jobs <TabsCount>{jobs}</TabsCount>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <OrderEscrow />
        </TabsContent>
        <TabsContent value="jobs">
          <JobEscrow />
        </TabsContent>
      </Tabs>
    </>
  )
}
