"use client"

import Link from "next/link"
import { useState } from "react"
import { BadgeCheck, Search } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsCount, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDepartments } from "@/hooks/use-catalog"
import { useAdminPros, useUpdatePro } from "@/hooks/use-services"
import { formatDay } from "@/lib/format"
import { tradeName } from "@/lib/trades"
import type { AdminPro } from "@/lib/types"
import { EmptyState } from "../empty-state"
import { PageHeader } from "../page-header"
import { ListSkeleton } from "../skeletons"

const tabs = [
  { value: "pending", label: "Waiting", match: (p: AdminPro) => !p.verified && p.active },
  { value: "verified", label: "Verified", match: (p: AdminPro) => p.verified },
  { value: "all", label: "All", match: () => true },
] as const

function Actions({ pro }: { pro: AdminPro }) {
  const update = useUpdatePro()
  const run = (body: { verified?: boolean; active?: boolean }, message: string) => update.mutate({ id: pro.id, ...body }, { onSuccess: () => toast.success(message) })
  return (
    <span className="flex justify-end gap-1">
      <Button variant={pro.verified ? "ghost" : "default"} size="sm" disabled={update.isPending} onClick={() => run({ verified: !pro.verified }, pro.verified ? `Verification removed from ${pro.name}` : `${pro.name} is verified`)}>
        {pro.verified ? "Unverify" : "Verify"}
      </Button>
      <Button variant="ghost" size="sm" disabled={update.isPending} onClick={() => run({ active: !pro.active }, pro.active ? `${pro.name} is hidden from buyers` : `${pro.name} is listed again`)}>
        {pro.active ? "Hide" : "List"}
      </Button>
    </span>
  )
}

export function AdminPros() {
  const { data, isPending, isError } = useAdminPros()
  const trades = useDepartments("services").data ?? []
  const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("pending")
  const [query, setQuery] = useState("")
  const pros = data?.data ?? []
  const term = query.trim().toLowerCase()
  const match = tabs.find((t) => t.value === tab)!.match
  const shown = pros.filter((p) => match(p) && (!term || `${p.name} ${p.owner.email}`.toLowerCase().includes(term)))

  return (
    <>
      <PageHeader title="Pros" description="Check ID, registration and trade certificates before giving a pro the verified badge. Hide anyone who breaks the rules." />
      <div className="flex flex-wrap items-center justify-between gap-3 max-sm:gap-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                <TabsCount>{pros.filter(t.match).length}</TabsCount>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search pros" placeholder="Name or owner email" />
        </InputGroup>
      </div>
      {isPending ? (
        <ListSkeleton rows={5} className="h-16 rounded-2xl" />
      ) : isError ? (
        <EmptyState>We couldn’t load pros. Refresh to try again.</EmptyState>
      ) : shown.length ? (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="pl-4">Pro</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-4">
                    <span className="flex flex-col">
                      <Link href={`/pros/${p.slug}`} className="font-medium hover:text-primary">
                        {p.name}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {p.location} · joined {formatDay(p.createdAt)}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-col text-sm">
                      <a href={`mailto:${p.owner.email}`} className="text-primary hover:underline">
                        {p.owner.email}
                      </a>
                      <span className="text-muted-foreground">{p.phone}</span>
                    </span>
                  </TableCell>
                  <TableCell className="max-w-56 text-sm whitespace-normal">{p.trades.map((t) => tradeName(trades, t)).join(", ")}</TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {p.rating} ({p.reviewCount}) · {p.jobsDone} jobs
                  </TableCell>
                  <TableCell>
                    {!p.active ? (
                      <Badge variant="secondary">Hidden</Badge>
                    ) : p.verified ? (
                      <Badge variant="accent">
                        <BadgeCheck aria-hidden /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="deal-soft">Waiting</Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Actions pro={p} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState>No pros here.</EmptyState>
      )}
    </>
  )
}
