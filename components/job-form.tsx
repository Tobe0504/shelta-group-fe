"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { RadioGroup } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useMe } from "@/hooks/use-auth"
import { useCreateJob } from "@/hooks/use-services"
import { useSites } from "@/hooks/use-sites"
import { fieldErrors } from "@/lib/http"
import type { Department } from "@/lib/types"
import { ChoiceCard } from "./choice-card"
import { ImageUploader, readImages } from "./image-uploader"
import { NewSiteDialog } from "./new-site-dialog"
import { ListSkeleton } from "./skeletons"
import { useNavigate } from "./navigation-progress"

/** Post a job for pros to quote on, or (with `pro`) ask one pro directly. */
export function JobForm({ trades, initialTrade, pro }: { trades: Department[]; initialTrade?: string; pro?: { slug: string; name: string } }) {
  const { navigate, pending: navigating } = useNavigate()
  const { data: me } = useMe()
  const sites = useSites()
  const create = useCreateJob()
  const errors = fieldErrors(create.error)
  const [trade, setTrade] = useState(initialTrade ?? "")
  const [siteId, setSiteId] = useState<string>()
  const site = sites.data?.find((s) => s.id === siteId) ?? sites.data?.[0]

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!trade) return toast.error("Choose the kind of work")
    if (!site) return toast.error("Add the site where the work is")
    const f = new FormData(e.currentTarget)
    const text = (k: string) => String(f.get(k) ?? "").trim() || undefined
    const budget = Number(text("budget")?.replace(/\D/g, ""))
    create.mutate(
      {
        trade,
        title: text("title")!,
        description: text("description")!,
        site: { address: site.address, area: site.area, coords: site.coords },
        photos: readImages(f, "photos"),
        budget: budget > 0 ? budget : undefined,
        startBy: text("startBy"),
        contactName: text("contactName")!,
        contactPhone: text("contactPhone")!,
        pro: pro?.slug,
      },
      {
        onSuccess: () => {
          toast.success(pro ? `Sent to ${pro.name}. You’ll see their quote in My jobs.` : "Job posted. Quotes will appear in My jobs.")
          navigate("/account/jobs")
        },
      },
    )
  }

  return (
    <form onSubmit={submit}>
      <FieldGroup className="grid sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="job-trade">Kind of work</FieldLabel>
          <Select value={trade} onValueChange={setTrade}>
            <SelectTrigger id="job-trade" aria-invalid={!!errors.trade}>
              <SelectValue placeholder="Choose a trade" />
            </SelectTrigger>
            <SelectContent>
              {trades.map((d) => (
                <SelectGroup key={d.slug}>
                  <SelectLabel>{d.name}</SelectLabel>
                  {d.categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field className="sm:col-span-2" data-invalid={!!errors.title}>
          <FieldLabel htmlFor="job-title">What do you need done?</FieldLabel>
          <Input id="job-title" name="title" required maxLength={120} placeholder="e.g. Tile a 40 m² living room" aria-invalid={!!errors.title} />
          <FieldError>{errors.title}</FieldError>
        </Field>
        <Field className="sm:col-span-2" data-invalid={!!errors.description}>
          <FieldLabel htmlFor="job-description">Details</FieldLabel>
          <Textarea id="job-description" name="description" required maxLength={3000} className="min-h-28" placeholder="Sizes, materials already on site, access, anything a pro should know before quoting" />
          <FieldError>{errors.description}</FieldError>
        </Field>

        <FieldSet className="sm:col-span-2">
          <FieldLegend variant="label">Where is the work?</FieldLegend>
          {sites.isPending ? (
            <ListSkeleton rows={1} className="h-16 rounded-2xl" />
          ) : sites.data?.length ? (
            <RadioGroup value={site?.id} onValueChange={setSiteId} aria-label="Job site" className="grid gap-3 max-sm:gap-1.5 sm:grid-cols-2">
              {sites.data.map((s) => (
                <ChoiceCard key={s.id} id={`job-site-${s.id}`} value={s.id}>
                  <span className="flex flex-col text-sm text-muted-foreground max-sm:text-xs">
                    <span className="font-semibold text-foreground">{s.label}</span>
                    {s.address}
                  </span>
                </ChoiceCard>
              ))}
            </RadioGroup>
          ) : (
            <FieldDescription>Add the site so nearby pros can see the job. Only its area is shown until you hire.</FieldDescription>
          )}
          <NewSiteDialog onAdd={(s) => setSiteId(s.id)} />
        </FieldSet>

        <Field>
          <FieldLabel htmlFor="job-budget">
            Budget <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>₦</InputGroupAddon>
            <InputGroupInput id="job-budget" name="budget" inputMode="numeric" placeholder="e.g. 300,000" />
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="job-start">
            Start by <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Input id="job-start" name="startBy" maxLength={80} placeholder="e.g. next week" />
        </Field>
        <Field data-invalid={!!errors.contactName}>
          <FieldLabel htmlFor="job-name">Your name</FieldLabel>
          <Input id="job-name" name="contactName" required autoComplete="name" defaultValue={me?.name} />
        </Field>
        <Field data-invalid={!!errors.contactPhone}>
          <FieldLabel htmlFor="job-phone">Phone or WhatsApp</FieldLabel>
          <Input id="job-phone" name="contactPhone" type="tel" required autoComplete="tel" defaultValue={me?.phone} aria-invalid={!!errors.contactPhone} />
          <FieldDescription>Shared only with the pro you hire.</FieldDescription>
          <FieldError>{errors.contactPhone}</FieldError>
        </Field>
        <div className="sm:col-span-2">
          <ImageUploader name="photos" kind="job" max={6} label="Photos of the space (optional)" />
        </div>
        <Button type="submit" size="lg" className="w-fit sm:col-span-2 max-sm:w-full" loading={create.isPending || navigating}>
          {pro ? `Send to ${pro.name}` : "Post job"}
        </Button>
      </FieldGroup>
    </form>
  )
}
