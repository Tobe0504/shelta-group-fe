"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMarketplaceSettings, useUpdateSettings } from "@/hooks/use-admin"
import { useDepartments } from "@/hooks/use-catalog"
import { feeForKm, roadKm } from "@/lib/delivery"
import { formatNaira } from "@/lib/format"
import type { MarketplaceSettings } from "@/lib/types"
import { EmptyState } from "../empty-state"
import { PageHeader } from "../page-header"
import { FormSkeleton } from "../skeletons"

const pct = (rate: number) => Math.round(rate * 1000) / 10
const toRate = (value: string) => Math.min(100, Math.max(0, Number(value) || 0)) / 100
const amount = (value: string) => Math.max(0, Math.round(Number(value) || 0))

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="px-6 max-sm:px-3">
        <CardTitle className="text-lg max-sm:text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 max-sm:px-3">
        <FieldGroup>{children}</FieldGroup>
      </CardContent>
    </Card>
  )
}

function NumberField({ id, label, value, onChange, prefix, suffix, help, step }: { id: string; label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string; help?: string; step?: number }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        {prefix && <InputGroupAddon>{prefix}</InputGroupAddon>}
        <InputGroupInput id={id} type="number" inputMode="decimal" min={0} step={step} required value={value} onChange={(e) => onChange(e.target.value)} />
        {suffix && <InputGroupAddon align="inline-end">{suffix}</InputGroupAddon>}
      </InputGroup>
      {help && <FieldDescription>{help}</FieldDescription>}
    </Field>
  )
}

function SettingsForm({ initial }: { initial: MarketplaceSettings }) {
  const [s, setS] = useState(initial)
  const update = useUpdateSettings()
  // Overrides apply to product categories and service trades alike.
  const categories = useDepartments("all").data?.flatMap((d) => d.categories) ?? []
  const set = (patch: Partial<MarketplaceSettings>) => setS((x) => ({ ...x, ...patch }))
  const unused = categories.filter((c) => !s.categoryCommission.some((o) => o.category === c.slug))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const { commissionRate, categoryCommission, offloadFee, serviceFee, deliveryWindows, deliveryDaysAhead, payoutDelayHours, deliveryBaseFee, deliveryPerKm, deliveryMinFee, roadFactor, maxDeliveryKm, jobQuoteLimit, serviceCommissionRate } = s
        update.mutate(
          {
            commissionRate,
            categoryCommission: categoryCommission.filter((c) => c.category),
            offloadFee,
            serviceFee,
            deliveryWindows: deliveryWindows.map((w) => w.trim()).filter(Boolean),
            deliveryDaysAhead,
            payoutDelayHours,
            deliveryBaseFee,
            deliveryPerKm,
            deliveryMinFee,
            roadFactor,
            maxDeliveryKm,
            jobQuoteLimit,
            serviceCommissionRate,
          },
          { onSuccess: (saved) => (setS(saved), toast.success("Settings saved. New orders use them straight away.")) },
        )
      }}
      className="grid items-start gap-6 max-sm:gap-3 lg:grid-cols-2"
    >
      <Section title="Commission" description="What SheltaMart keeps from the goods value of each delivery. Existing orders keep the rate they were placed with.">
        <NumberField id="commission" label="Default commission" value={pct(s.commissionRate)} onChange={(v) => set({ commissionRate: toRate(v) })} suffix="%" step={0.1} />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Category overrides</p>
          {s.categoryCommission.map((o, i) => (
            <div key={i} className="flex gap-2">
              <Select value={o.category} onValueChange={(category) => set({ categoryCommission: s.categoryCommission.map((x, j) => (j === i ? { ...x, category } : x)) })}>
                <SelectTrigger aria-label={`Override ${i + 1} category`}>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c.slug === o.category || unused.includes(c))
                    .map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <InputGroup className="w-36 shrink-0">
                <InputGroupInput
                  aria-label={`Override ${i + 1} rate`}
                  type="number"
                  min={0}
                  step={0.1}
                  value={pct(o.rate)}
                  onChange={(e) => set({ categoryCommission: s.categoryCommission.map((x, j) => (j === i ? { ...x, rate: toRate(e.target.value) } : x)) })}
                />
                <InputGroupAddon align="inline-end">%</InputGroupAddon>
              </InputGroup>
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove override ${i + 1}`} onClick={() => set({ categoryCommission: s.categoryCommission.filter((_, j) => j !== i) })}>
                <X aria-hidden />
              </Button>
            </div>
          ))}
          <Button type="button" variant="soft" size="sm" className="w-fit" disabled={!unused.length} onClick={() => set({ categoryCommission: [...s.categoryCommission, { category: "", rate: s.commissionRate }] })}>
            <Plus aria-hidden /> Add override
          </Button>
        </div>
      </Section>

      <Section title="Delivery pricing" description="Each truck costs base + rate × road distance from the seller’s warehouse, never below the minimum.">
        <div className="grid gap-4 max-sm:gap-3 sm:grid-cols-2">
          <NumberField id="base" label="Base fee" value={s.deliveryBaseFee} onChange={(v) => set({ deliveryBaseFee: amount(v) })} prefix="₦" />
          <NumberField id="perkm" label="Rate per km" value={s.deliveryPerKm} onChange={(v) => set({ deliveryPerKm: amount(v) })} prefix="₦" />
          <NumberField id="min" label="Minimum fee" value={s.deliveryMinFee} onChange={(v) => set({ deliveryMinFee: amount(v) })} prefix="₦" />
          <NumberField id="max" label="Furthest delivery" value={s.maxDeliveryKm} onChange={(v) => set({ maxDeliveryKm: Math.max(1, amount(v)) })} suffix="km" />
        </div>
        <NumberField
          id="road"
          label="Road factor"
          value={s.roadFactor}
          step={0.05}
          onChange={(v) => set({ roadFactor: Math.min(3, Math.max(1, Number(v) || 1)) })}
          suffix="×"
          help="Straight-line distance × this ≈ road distance. 1.3 suits Lagos; raise it where roads wind more."
        />
        <p className="rounded-2xl bg-muted p-4 text-sm">
          Example: 15 km straight line → {roadKm(s, 15)} km by road → {formatNaira(feeForKm(s, roadKm(s, 15)))} per truck.
        </p>
      </Section>

      <Section title="Buyer fees" description="Added at checkout on top of delivery.">
        <NumberField id="offload" label="Offloading crew, per delivery" value={s.offloadFee} onChange={(v) => set({ offloadFee: amount(v) })} prefix="₦" />
        <NumberField id="service" label="Service fee, per order" value={s.serviceFee} onChange={(v) => set({ serviceFee: amount(v) })} prefix="₦" help="Use 0 for no service fee." />
      </Section>

      <Section title="Delivery slots" description="The times buyers can pick at checkout.">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Time windows</p>
          {s.deliveryWindows.map((w, i) => (
            <div key={i} className="flex gap-2">
              <Input aria-label={`Window ${i + 1}`} value={w} placeholder="e.g. 8–12" onChange={(e) => set({ deliveryWindows: s.deliveryWindows.map((x, j) => (j === i ? e.target.value : x)) })} />
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove window ${i + 1}`} disabled={s.deliveryWindows.length === 1} onClick={() => set({ deliveryWindows: s.deliveryWindows.filter((_, j) => j !== i) })}>
                <X aria-hidden />
              </Button>
            </div>
          ))}
          <Button type="button" variant="soft" size="sm" className="w-fit" onClick={() => set({ deliveryWindows: [...s.deliveryWindows, ""] })}>
            <Plus aria-hidden /> Add window
          </Button>
        </div>
        <NumberField id="days" label="Bookable days ahead" value={s.deliveryDaysAhead} onChange={(v) => set({ deliveryDaysAhead: Math.min(14, Math.max(1, amount(v))) })} suffix="days" help="Starting tomorrow, up to 14." />
      </Section>

      <Section title="Seller payouts" description="When sellers are paid after a buyer confirms delivery.">
        <NumberField id="delay" label="Wait before paying out" value={s.payoutDelayHours} onChange={(v) => set({ payoutDelayHours: amount(v) })} suffix="hours" help="0 pays immediately. With a delay, use “Run due payouts” on the overview." />
      </Section>

      <Section title="Services" description="Job requests and escrow. Trades can have their own rate in the commission overrides.">
        <NumberField id="service-commission" label="Commission on service jobs" value={pct(s.serviceCommissionRate)} onChange={(v) => set({ serviceCommissionRate: toRate(v) })} suffix="%" step={0.1} help="Kept from each stage when the buyer releases it. Existing releases keep their rate." />
        <NumberField id="quotes" label="Quotes per job" value={s.jobQuoteLimit} onChange={(v) => set({ jobQuoteLimit: Math.min(20, Math.max(1, amount(v))) })} suffix="quotes" help="Once a job has this many quotes, it stops showing to other pros." />
      </Section>

      <div className="lg:col-span-2">
        <Button type="submit" size="lg" loading={update.isPending}>
          Save settings
        </Button>
      </div>
    </form>
  )
}

export function AdminSettings() {
  const { data, isPending, isError } = useMarketplaceSettings()
  return (
    <>
      <PageHeader title="Fees & delivery" description="Marketplace-wide rules. Changes apply to new orders only." />
      {isPending ? (
        <div className="grid items-start gap-6 max-sm:gap-3 lg:grid-cols-2">
          <FormSkeleton fields={3} />
          <FormSkeleton fields={2} />
        </div>
      ) : isError ? (
        <EmptyState>We couldn’t load settings. Refresh to try again.</EmptyState>
      ) : (
        <SettingsForm key={JSON.stringify(data)} initial={data} />
      )}
    </>
  )
}
