"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useOrders } from "@/hooks/use-orders"
import { formatDay, formatNaira } from "@/lib/format"
import { isDone } from "@/lib/orders"
import type { Order } from "@/lib/types"
import { EmptyState } from "./empty-state"
import { ListSkeleton } from "./skeletons"

const orderBadge = (o: Order) =>
  o.payment.status !== "paid"
    ? { variant: "deal-soft" as const, label: "Awaiting payment" }
    : o.shipments.every((s) => isDone(s.status))
      ? { variant: "success" as const, label: "Completed" }
      : { variant: "accent" as const, label: "In progress" }

export function AccountView() {
  const { data, isPending, isError } = useOrders()
  if (isPending) return <ListSkeleton rows={3} className="h-20" />
  if (isError) return <EmptyState>We couldn’t load your orders. Refresh to try again.</EmptyState>
  if (!data.data.length) return <EmptyState action={{ href: "/", label: "Start shopping" }}>No orders yet.</EmptyState>
  return (
    <ul className="flex flex-col gap-3">
      {data.data.map((o) => {
        const badge = orderBadge(o)
        return (
          <li key={o.id}>
            <Link href={`/orders/${o.number}`} className="flex items-center gap-4 rounded-3xl px-5 py-4 max-sm:gap-2.5 max-sm:rounded-2xl max-sm:px-3 max-sm:py-2.5 max-sm:text-sm ring-1 ring-border transition-colors hover:bg-muted">
              <span className="flex flex-1 flex-col gap-1">
                <span className="text-base font-semibold">Order {o.number}</span>
                <span className="text-muted-foreground">
                  {formatDay(o.createdAt)} · {o.shipments.length} deliveries · {formatNaira(o.total)}
                </span>
              </span>
              <Badge variant={badge.variant}>{badge.label}</Badge>
              <ChevronRight aria-hidden className="size-5 text-muted-foreground" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
