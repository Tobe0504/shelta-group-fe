"use client"

import { useState } from "react"
import { BadgeCheck, Search } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminStores, useVerifyStore } from "@/hooks/use-admin"
import { formatDay } from "@/lib/format"
import type { AdminStore } from "@/lib/types"
import { EmptyState } from "../empty-state"
import { PageHeader } from "../page-header"
import { ListSkeleton } from "../skeletons"

const tabs = [
  { value: "pending", label: "Waiting", match: (s: AdminStore) => !s.verified },
  { value: "verified", label: "Verified", match: (s: AdminStore) => s.verified },
  { value: "all", label: "All", match: () => true },
] as const

function VerifyButton({ store }: { store: AdminStore }) {
  const verify = useVerifyStore()
  const next = !store.verified
  return (
    <Button
      variant={next ? "default" : "ghost"}
      size="sm"
      loading={verify.isPending}
      onClick={() => verify.mutate({ id: store.id, verified: next }, { onSuccess: () => toast.success(next ? `${store.name} is verified` : `Verification removed from ${store.name}`) })}
    >
      {next ? "Verify" : "Remove"}
    </Button>
  )
}

export function AdminStores() {
  const { data, isPending, isError } = useAdminStores()
  const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("pending")
  const [query, setQuery] = useState("")
  const stores = data?.data ?? []
  const term = query.trim().toLowerCase()
  const match = tabs.find((t) => t.value === tab)!.match
  const shown = stores.filter((s) => match(s) && (!term || `${s.name} ${s.owner.email}`.toLowerCase().includes(term)))

  return (
    <>
      <PageHeader title="Stores" description="Check a seller’s business before giving them the verified badge buyers look for." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label} ({stores.filter(t.match).length})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search stores" placeholder="Store or owner email" />
        </InputGroup>
      </div>
      {isPending ? (
        <ListSkeleton rows={5} className="h-16 rounded-2xl" />
      ) : isError ? (
        <EmptyState>We couldn’t load stores. Refresh to try again.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="pl-4">Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Payouts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="pl-4">
                    <span className="flex flex-col">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {s.location ?? "No area set"} · joined {formatDay(s.createdAt)}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-col text-sm">
                      <span>{s.owner.name}</span>
                      <a href={`mailto:${s.owner.email}`} className="text-primary hover:underline">
                        {s.owner.email}
                      </a>
                      {s.owner.phone && <span className="text-muted-foreground">{s.owner.phone}</span>}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums">{s.productCount}</TableCell>
                  <TableCell>
                    <Badge variant={s.hasPayout ? "success" : "secondary"}>{s.hasPayout ? "Bank added" : "No bank yet"}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.verified ? (
                      <Badge variant="accent">
                        <BadgeCheck aria-hidden /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="deal-soft">Waiting</Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <VerifyButton store={s} />
                  </TableCell>
                </TableRow>
              ))}
              {!shown.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No stores here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
