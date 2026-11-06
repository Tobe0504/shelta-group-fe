"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { MapPin } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { useDepartments } from "@/hooks/use-catalog"
import { useLeads, useOwnPro, useSendBid } from "@/hooks/use-services"
import { formatDay, formatNaira } from "@/lib/format"
import { tradeName } from "@/lib/trades"
import type { Lead } from "@/lib/types"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"
import { ListSkeleton } from "./skeletons"
import { StagesEditor, toNaira, type StageRow } from "./stages-editor"

export function QuoteDialog({ lead, trigger }: { lead: Pick<Lead, "id" | "title">; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState("")
  const [staged, setStaged] = useState(false)
  const [stages, setStages] = useState<StageRow[]>([
    { title: "", amount: "" },
    { title: "", amount: "" },
  ])
  const send = useSendBid()
  const amount = toNaira(price)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!amount) return toast.error("Enter your price")
    const parts = staged ? stages.map((s) => ({ title: s.title.trim(), amount: toNaira(s.amount) })) : undefined
    if (parts && parts.reduce((n, s) => n + s.amount, 0) !== amount) return toast.error("The stages must add up to your price")
    const f = new FormData(e.currentTarget)
    send.mutate(
      { job: lead.id, amount, timeline: String(f.get("timeline")).trim(), message: String(f.get("message") ?? "").trim() || undefined, stages: parts },
      { onSuccess: () => (toast.success("Quote sent. You’ll see it in My quotes."), setOpen(false)) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button size="sm">Send quote</Button>}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Quote for “{lead.title}”</DialogTitle>
            <DialogDescription>The buyer pays into SheltaMart escrow and releases it to you when the work is done. You’ll get their number if they pick you.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="grid grid-cols-2">
            <Field>
              <FieldLabel htmlFor="bid-amount">Your price</FieldLabel>
              <InputGroup>
                <InputGroupAddon>₦</InputGroupAddon>
                <InputGroupInput id="bid-amount" inputMode="numeric" required placeholder="250,000" value={price} onChange={(e) => setPrice(e.target.value)} />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="bid-timeline">How long</FieldLabel>
              <Input id="bid-timeline" name="timeline" required maxLength={80} placeholder="e.g. 3 days" />
            </Field>
            <Field orientation="horizontal" className="col-span-2">
              <Checkbox id="bid-staged" checked={staged} onCheckedChange={(v) => setStaged(v === true)} />
              <FieldLabel htmlFor="bid-staged" className="font-normal">
                Get paid in stages
              </FieldLabel>
            </Field>
            {staged && (
              <div className="col-span-2">
                <StagesEditor stages={stages} onChange={setStages} price={amount} />
              </div>
            )}
            <Field className="col-span-2">
              <FieldLabel htmlFor="bid-message">Message (optional)</FieldLabel>
              <Textarea id="bid-message" name="message" maxLength={1000} placeholder="What’s included, when you can start" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" loading={send.isPending}>
              Send quote
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LeadCard({ lead, trade }: { lead: Lead; trade: string }) {
  return (
    <Card className="relative gap-3 px-5 py-5 transition-colors hover:bg-muted/40 max-sm:gap-2 max-sm:p-3 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-lg max-sm:text-base">
            <Link href={`/pro/jobs/${lead.id}`} className="after:absolute after:inset-0 hover:text-primary focus-visible:underline">
              {lead.title}
            </Link>
          </h2>
          <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground max-sm:text-xs">
            <span>{trade}</span>·
            <span className="inline-flex items-center gap-0.5">
              <MapPin aria-hidden className="size-3" /> {lead.area ?? "Area not given"}
              {lead.distanceKm != null && ` · ${lead.distanceKm} km away`}
            </span>
            · {formatDay(lead.createdAt)}
          </p>
        </div>
        {lead.direct && <Badge variant="accent">Asked you directly</Badge>}
      </div>
      <p className="line-clamp-4 text-sm whitespace-pre-line text-muted-foreground max-sm:text-xs">{lead.description}</p>
      {lead.photos.length > 0 && (
        <ul aria-label="Photos" className="flex gap-2">
          {lead.photos.slice(0, 4).map((src) => (
            <li key={src} className="relative size-16 overflow-hidden rounded-xl bg-muted max-sm:size-12">
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm max-sm:text-xs">
          {lead.budget ? <span className="font-semibold">Budget {formatNaira(lead.budget)}</span> : <span className="text-muted-foreground">No budget given</span>}
          {lead.startBy && <span className="text-muted-foreground"> · start {lead.startBy}</span>}
          <span className="text-muted-foreground"> · {lead.quotes} {lead.quotes === 1 ? "quote" : "quotes"} so far</span>
        </p>
        <span className="relative z-10">
          <QuoteDialog lead={lead} />
        </span>
      </div>
    </Card>
  )
}

export function ProLeads() {
  const pro = useOwnPro()
  const leads = useLeads(!!pro.data)
  const trades = useDepartments("services").data ?? []

  if (pro.isPending || (pro.data && leads.isPending)) return <ListSkeleton rows={3} className="h-40" />
  if (!pro.data)
    return <EmptyState action={{ href: "/pro/profile", label: "Set up your profile" }}>Create a pro profile to get job leads from buyers near you.</EmptyState>

  return (
    <>
      <PageHeader title="Job leads" description={`Open jobs in your trades within ${pro.data.radiusKm} km of ${pro.data.location}, and jobs buyers sent you directly.`} />
      {leads.isError ? (
        <EmptyState>We couldn’t load leads. Refresh to try again.</EmptyState>
      ) : leads.data?.length ? (
        <ul className="flex flex-col gap-4 max-sm:gap-2">
          {leads.data.map((lead) => (
            <li key={lead.id}>
              <LeadCard lead={lead} trade={tradeName(trades, lead.trade)} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>No open jobs right now. New ones show up here as buyers post them.</EmptyState>
      )}
    </>
  )
}
