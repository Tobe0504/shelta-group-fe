"use client"

import Link from "next/link"
import { Banknote, ChevronRight, FileText, MessagesSquare, Package, ShoppingBag, Store, Users, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminOverview, useRunPayouts } from "@/hooks/use-admin"
import { formatNaira } from "@/lib/format"
import { tones } from "@/lib/tones"
import { cn } from "@/lib/utils"
import { EmptyState } from "../empty-state"
import { PageHeader } from "../page-header"
import { StatCard } from "../stat-card"

export function AdminOverview() {
  const { data: o, isPending, isError } = useAdminOverview()
  const payouts = useRunPayouts()

  if (isPending)
    return (
      <>
        <PageHeader title="Admin console" description="Marketplace health and what needs attention." />
        <div aria-hidden className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </>
    )
  if (isError) return <EmptyState>We couldn’t load the overview. Refresh to try again.</EmptyState>

  const queues = [
    { href: "/admin/quotes", icon: FileText, tone: "peach", count: o.newQuotes, label: "new quote requests" },
    { href: "/admin/enquiries", icon: MessagesSquare, tone: "lilac", count: o.newEnquiries, label: "new property enquiries" },
    { href: "/admin/stores", icon: Store, tone: "blue", count: o.unverifiedStores, label: "stores waiting for verification" },
  ] as const

  return (
    <>
      <PageHeader title="Admin console" description="Marketplace health and what needs attention.">
        <Button
          variant="secondary"
          loading={payouts.isPending}
          disabled={!o.pendingPayouts.count}
          onClick={() => payouts.mutate(undefined, { onSuccess: ({ paid }) => toast.success(paid ? `${paid} payouts sent` : "No payouts were due") })}
        >
          <Banknote aria-hidden /> Run due payouts
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} tone="blue" label="Sales (paid orders)" value={formatNaira(o.gmv)} note={`${o.orders} orders`} />
        <StatCard icon={Banknote} tone="mint" label="Commission earned" value={formatNaira(o.commission)} />
        <StatCard icon={ShoppingBag} tone="peach" label="Payouts pending" value={formatNaira(o.pendingPayouts.amount)} note={`${o.pendingPayouts.count} deliveries`} />
        <StatCard icon={Package} tone="lilac" label="Live products" value={String(o.liveProducts)} note={`${o.buyers} buyers signed up`} />
      </div>

      <section aria-labelledby="queues" className="flex flex-col gap-3">
        <h2 id="queues" className="text-lg">
          Needs attention
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {queues.map(({ href, icon: Icon, tone, count, label }) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-4 rounded-3xl p-5 ring-1 ring-border transition-colors hover:bg-muted">
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", tones[tone].bg)}>
                  <Icon aria-hidden className={cn("size-5", tones[tone].fg)} />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-2xl font-semibold tabular-nums">{count}</span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </span>
                <ChevronRight aria-hidden className="size-5 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users aria-hidden className="size-4" /> Signed in as an admin. Changes here apply to the whole marketplace.
      </p>
    </>
  )
}
