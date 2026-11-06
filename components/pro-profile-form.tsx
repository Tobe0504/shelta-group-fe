"use client"

import Link from "next/link"
import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { RadioGroup } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useMe } from "@/hooks/use-auth"
import { useDepartments } from "@/hooks/use-catalog"
import { useOwnPro, useSavePro } from "@/hooks/use-services"
import { fieldErrors } from "@/lib/http"
import type { Coords, OwnPro, ProKind, RateUnit } from "@/lib/types"
import { AddressSearch } from "./address-search"
import { ChoiceCard } from "./choice-card"
import { EmptyState } from "./empty-state"
import { ImageUploader, readImages } from "./image-uploader"
import { PageHeader } from "./page-header"
import { FormSkeleton } from "./skeletons"

const MAX_TRADES = 5
const radii = [10, 25, 50, 100, 250, 500]
const units: { value: RateUnit; label: string }[] = [
  { value: "job", label: "per job" },
  { value: "day", label: "per day" },
  { value: "hour", label: "per hour" },
  { value: "m²", label: "per m²" },
]

type Base = { label: string; coords: Coords }

function Form({ pro }: { pro: OwnPro | null }) {
  const { data: me } = useMe()
  const departments = useDepartments("services").data ?? []
  const save = useSavePro()
  const errors = fieldErrors(save.error)
  const [kind, setKind] = useState<ProKind>(pro?.kind ?? "individual")
  const [trades, setTrades] = useState<string[]>(pro?.trades ?? [])
  const [base, setBase] = useState<Base | null>(pro?.coords ? { label: pro.location, coords: pro.coords } : null)
  const [radius, setRadius] = useState(String(pro?.radiusKm ?? 25))
  const [unit, setUnit] = useState<RateUnit>(pro?.rate?.unit ?? "job")

  const toggle = (slug: string, on: boolean) => setTrades((t) => (on ? [...t, slug] : t.filter((x) => x !== slug)))

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!trades.length) return toast.error("Choose at least one trade")
    if (!base) return toast.error("Set where you’re based")
    const f = new FormData(e.currentTarget)
    const text = (k: string) => String(f.get(k) ?? "").trim()
    const amount = Number(text("rate").replace(/\D/g, ""))
    const years = Number(text("years"))
    save.mutate(
      {
        name: text("name"),
        kind,
        headline: text("headline"),
        trades,
        about: text("about") || undefined,
        location: base.label,
        coords: base.coords,
        radiusKm: Number(radius),
        rate: amount > 0 ? { amount, unit } : null,
        years: years > 0 ? years : undefined,
        photo: readImages(f, "photo")[0] ?? null,
        portfolio: readImages(f, "portfolio"),
        phone: text("phone"),
      },
      { onSuccess: () => toast.success(pro ? "Profile saved" : "You’re listed. Job leads will appear in the pro centre.") },
    )
  }

  return (
    <form onSubmit={submit} className="grid items-start gap-6 max-sm:gap-3 lg:grid-cols-[1fr_320px]">
      <Card className="px-5 py-6 max-sm:px-3 max-sm:py-3.5 sm:px-8">
        <FieldGroup className="grid sm:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="pro-name">Business or trading name</FieldLabel>
            <Input id="pro-name" name="name" required maxLength={80} defaultValue={pro?.name ?? me?.name} />
            <FieldError>{errors.name}</FieldError>
          </Field>
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="pro-phone">Phone or WhatsApp</FieldLabel>
            <Input id="pro-phone" name="phone" type="tel" required defaultValue={pro?.phone ?? me?.phone} aria-invalid={!!errors.phone} />
            <FieldDescription>Shared only with buyers who hire you.</FieldDescription>
            <FieldError>{errors.phone}</FieldError>
          </Field>
          <FieldSet className="sm:col-span-2">
            <FieldLegend variant="label">You are</FieldLegend>
            <RadioGroup value={kind} onValueChange={(v) => setKind(v as ProKind)} aria-label="You are" className="grid grid-cols-2 gap-2">
              <ChoiceCard id="kind-individual" value="individual">
                <span className="text-sm">An individual</span>
              </ChoiceCard>
              <ChoiceCard id="kind-company" value="company">
                <span className="text-sm">A company</span>
              </ChoiceCard>
            </RadioGroup>
          </FieldSet>
          <Field className="sm:col-span-2" data-invalid={!!errors.headline}>
            <FieldLabel htmlFor="pro-headline">Headline</FieldLabel>
            <Input id="pro-headline" name="headline" required maxLength={120} placeholder="e.g. Floor and wall tiling, 9 years" defaultValue={pro?.headline} />
            <FieldError>{errors.headline}</FieldError>
          </Field>

          <FieldSet className="sm:col-span-2">
            <FieldLegend variant="label">
              Trades <span className="font-normal text-muted-foreground">({trades.length}/{MAX_TRADES})</span>
            </FieldLegend>
            <FieldDescription>You’ll get leads for these.</FieldDescription>
            <div className="flex flex-col gap-3 max-sm:gap-2">
              {departments.map((d) => (
                <div key={d.slug} className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{d.name}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {d.categories.map((c) => {
                      const on = trades.includes(c.slug)
                      return (
                        <li key={c.slug}>
                          <Label htmlFor={`trade-${c.slug}`} className="flex cursor-pointer items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-normal has-data-[state=checked]:bg-accent has-data-[state=checked]:text-accent-foreground max-sm:px-2.5 max-sm:py-1 max-sm:text-xs">
                            <Checkbox id={`trade-${c.slug}`} checked={on} disabled={!on && trades.length >= MAX_TRADES} onCheckedChange={(v) => toggle(c.slug, v === true)} />
                            {c.name}
                          </Label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </FieldSet>

          <FieldSet className="sm:col-span-2">
            <FieldLegend variant="label">Where you’re based</FieldLegend>
            {base ? (
              <p className="flex items-center justify-between gap-2 rounded-2xl bg-accent p-3 text-sm text-accent-foreground max-sm:rounded-xl max-sm:p-2.5">
                {base.label}
                <Button type="button" size="sm" variant="outline" className="border-0" onClick={() => setBase(null)}>
                  Change
                </Button>
              </p>
            ) : (
              <AddressSearch label="Search your base area" placeholder="e.g. Surulere, Lagos" onSelect={(p) => setBase({ label: [p.area, p.state].filter(Boolean).join(", ") || p.label, coords: p.coords })} />
            )}
          </FieldSet>
          <Field>
            <FieldLabel htmlFor="pro-radius">You take jobs within</FieldLabel>
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger id="pro-radius">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...new Set([...radii, Number(radius)])].sort((a, b) => a - b).map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r} km
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="pro-years">
              Years of experience <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input id="pro-years" name="years" type="number" min={0} max={70} defaultValue={pro?.years} />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="pro-rate">
              Starting price <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <div className="flex gap-2">
              <InputGroup className="flex-1">
                <InputGroupAddon>₦</InputGroupAddon>
                <InputGroupInput id="pro-rate" name="rate" inputMode="numeric" placeholder="e.g. 6,000" defaultValue={pro?.rate?.amount} />
              </InputGroup>
              <Select value={unit} onValueChange={(v) => setUnit(v as RateUnit)}>
                <SelectTrigger aria-label="Price unit" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="pro-about">
              About your work <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea id="pro-about" name="about" maxLength={2000} className="min-h-28" defaultValue={pro?.about} placeholder="What you do best, tools and crew, guarantees" />
          </Field>
          <div className="sm:col-span-2">
            <ImageUploader name="portfolio" kind="pro" max={12} initial={pro?.portfolio} label="Photos of past work" />
          </div>
          <Button type="submit" size="lg" className="w-fit max-sm:w-full sm:col-span-2" loading={save.isPending}>
            {pro ? "Save profile" : "Create profile"}
          </Button>
        </FieldGroup>
      </Card>
      <aside className="flex flex-col gap-4 rounded-3xl bg-muted p-5 max-sm:order-first max-sm:gap-2.5 max-sm:rounded-2xl max-sm:p-3 lg:sticky lg:top-8">
        <ImageUploader name="photo" kind="pro" max={1} initial={pro?.photo ? [pro.photo] : []} label="Profile photo or logo" />
        {pro && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={pro.verified ? "success" : "deal-soft"}>{pro.verified ? "Verified" : "Waiting for verification"}</Badge>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/pros/${pro.slug}`}>
                View public profile <ExternalLink aria-hidden />
              </Link>
            </Button>
          </div>
        )}
      </aside>
    </form>
  )
}

export function ProProfileForm() {
  const pro = useOwnPro()
  return (
    <>
      <PageHeader title="Pro profile" description="Buyers see this when they browse services and compare your quotes." />
      {pro.isPending ? <FormSkeleton fields={6} /> : pro.isError ? <EmptyState>We couldn’t load your profile. Refresh to try again.</EmptyState> : <Form pro={pro.data} />}
    </>
  )
}
