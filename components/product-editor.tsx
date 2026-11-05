"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { Check, ImagePlus, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useDepartments } from "@/hooks/use-catalog"
import { useUpload } from "@/hooks/use-forms"
import { useSaveListing } from "@/hooks/use-seller"
import { units } from "@/lib/data"
import { deliveryLabel, formatNaira } from "@/lib/format"
import type { Listing, ProductInput, ProductStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { PageHeader } from "./page-header"
import { ProductCard } from "./product-card"
import { ProductImage } from "./product-image"

const steps = ["Details", "Pricing", "Stock & delivery", "Photos", "Review"]
const MAX_PHOTOS = 4

const blank: ProductInput = {
  name: "",
  brand: "",
  category: "",
  price: 0,
  unit: "bag",
  deliveryDays: 1,
  stock: 0,
  specs: [{ label: "", value: "" }],
  tiers: [],
  images: [],
  status: "draft",
}

const toInput = ({ name, brand, category, price, was, unit, deliveryDays, stock, specs, tiers, images, status, description }: Listing): ProductInput => ({
  name, brand, category, price, was, unit, deliveryDays, stock, specs: specs.length ? specs : blank.specs, tiers, images, status, description,
})

/** Step bar; any step up to the furthest one reached can be revisited. */
function Stepper({ current, reached, onPick }: { current: number; reached: number; onPick: (i: number) => void }) {
  return (
    <ol aria-label="Steps" className="grid grid-cols-5 gap-2">
      {steps.map((s, i) => (
        <li key={s}>
          <button
            type="button"
            disabled={i > reached}
            aria-current={i === current ? "step" : undefined}
            onClick={() => onPick(i)}
            className="flex w-full flex-col gap-2 rounded-md text-left text-xs focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default sm:text-sm enabled:hover:[&>span:last-child]:text-foreground"
          >
            <span className={cn("h-1.5 rounded-full bg-secondary", i <= reached && "bg-primary/40", i <= current && "bg-primary")} />
            <span className={cn("flex items-center gap-1.5 text-muted-foreground", i === current && "font-semibold text-foreground")}>
              {i < reached && i !== current && <Check aria-hidden className="size-3.5 text-primary" />}
              <span className="max-sm:sr-only">{s}</span>
              <span className="sm:hidden">{i + 1}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

/** Multi-step create/edit flow for a seller listing. Each step is its own form so native validation gates "Continue". */
export function ProductEditor({ initial }: { initial?: Listing }) {
  const router = useRouter()
  const save = useSaveListing(initial?.slug)
  const upload = useUpload("product")
  const departments = useDepartments()
  const [step, setStep] = useState(0)
  const [reached, setReached] = useState(initial ? steps.length - 1 : 0)
  const [p, setP] = useState<ProductInput>(initial ? toInput(initial) : blank)
  const [uploading, setUploading] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (patch: Partial<ProductInput>) => setP((x) => ({ ...x, ...patch }))
  const categoryName = departments.data?.flatMap((d) => d.categories).find((c) => c.slug === p.category)?.name
  const num = (v: string) => Math.max(0, Number(v) || 0)

  const next = (e: React.FormEvent) => {
    e.preventDefault()
    const to = Math.min(step + 1, steps.length - 1)
    setStep(to)
    setReached((r) => Math.max(r, to))
  }

  const finish = (status: ProductStatus) => {
    const body = { ...p, status, specs: p.specs.filter((s) => s.label && s.value), tiers: p.tiers.map(({ min, price }) => ({ label: `${min}+ ${p.unit}s`, min, price })) }
    save.mutate(body, {
      onSuccess: (listing) => {
        toast.success(status === "live" ? `“${listing.name}” is live` : "Saved as draft")
        router.push("/seller/products")
      },
    })
  }

  /** Uploads each photo straight to storage, adding it once its URL comes back. */
  const addPhotos = (files: FileList | null) => {
    const list = [...(files ?? [])].slice(0, MAX_PHOTOS - p.images.length - uploading)
    setUploading((n) => n + list.length)
    list.forEach((f) =>
      upload.mutate(f, {
        onSuccess: (url) => setP((x) => ({ ...x, images: [...x.images, url].slice(0, MAX_PHOTOS) })),
        onError: (e) => toast.error(e instanceof Error ? e.message : "A photo failed to upload"),
        onSettled: () => setUploading((n) => n - 1),
      }),
    )
  }

  const nav = (
    <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
      <Button type="button" variant="ghost" onClick={() => (step ? setStep(step - 1) : router.push("/seller/products"))}>
        {step ? "Back" : "Cancel"}
      </Button>
      <Button type="submit">Continue</Button>
    </div>
  )

  return (
    <>
      <PageHeader title={initial ? `Edit ${initial.name}` : "Add a product"} description="Buyers see these details on your product page.">
        <Button asChild variant="secondary">
          <Link href="/seller/products">All products</Link>
        </Button>
      </PageHeader>
      <Stepper current={step} reached={reached} onPick={setStep} />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="px-5 py-6 sm:px-8">
          {step === 0 && (
            <form onSubmit={next}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Product name</FieldLabel>
                  <Input id="name" required value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Dangote 3X Cement 42.5R, 50 kg" />
                  <FieldDescription>Include brand, grade and size so buyers find it.</FieldDescription>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    {departments.isPending ? (
                      <Skeleton className="h-11 rounded-xl" />
                    ) : (
                    <Select required value={p.category} onValueChange={(v) => set({ category: v })}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.data?.map((d) => (
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
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="brand">Brand</FieldLabel>
                    <Input id="brand" required value={p.brand} onChange={(e) => set({ brand: e.target.value })} />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea id="description" value={p.description ?? ""} onChange={(e) => set({ description: e.target.value })} placeholder="What it’s for, quality notes, handling" />
                </Field>
                <FieldSet>
                  <FieldLegend variant="label">Specifications</FieldLegend>
                  {p.specs.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <Input aria-label={`Spec ${i + 1} name`} placeholder="e.g. Strength class" value={s.label} onChange={(e) => set({ specs: p.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                      <Input aria-label={`Spec ${i + 1} value`} placeholder="e.g. 42.5R" value={s.value} onChange={(e) => set({ specs: p.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
                      <Button type="button" variant="ghost" size="icon" aria-label={`Remove spec ${i + 1}`} onClick={() => set({ specs: p.specs.filter((_, j) => j !== i) })}>
                        <X aria-hidden />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="soft" size="sm" className="w-fit" onClick={() => set({ specs: [...p.specs, { label: "", value: "" }] })}>
                    <Plus aria-hidden /> Add spec
                  </Button>
                </FieldSet>
                {nav}
              </FieldGroup>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={next}>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="unit">Sold per</FieldLabel>
                    <Select value={p.unit} onValueChange={(v) => set({ unit: v })}>
                      <SelectTrigger id="unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="price">Price</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>₦</InputGroupAddon>
                      <InputGroupInput id="price" inputMode="numeric" required min={1} type="number" value={p.price || ""} onChange={(e) => set({ price: num(e.target.value) })} />
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="was">Was (optional)</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>₦</InputGroupAddon>
                      <InputGroupInput id="was" inputMode="numeric" type="number" min={p.price + 1} value={p.was || ""} onChange={(e) => set({ was: num(e.target.value) || undefined })} />
                    </InputGroup>
                  </Field>
                </div>
                <FieldSet>
                  <FieldLegend variant="label">Bulk prices</FieldLegend>
                  <FieldDescription>Reward bigger orders with a lower price per {p.unit}.</FieldDescription>
                  {p.tiers.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <InputGroup>
                        <InputGroupAddon>From</InputGroupAddon>
                        <InputGroupInput aria-label={`Tier ${i + 1} minimum quantity`} type="number" min={2} required value={t.min || ""} onChange={(e) => set({ tiers: p.tiers.map((x, j) => (j === i ? { ...x, min: num(e.target.value) } : x)) })} />
                      </InputGroup>
                      <InputGroup>
                        <InputGroupAddon>₦</InputGroupAddon>
                        <InputGroupInput aria-label={`Tier ${i + 1} price`} type="number" min={1} required value={t.price || ""} onChange={(e) => set({ tiers: p.tiers.map((x, j) => (j === i ? { ...x, price: num(e.target.value) } : x)) })} />
                      </InputGroup>
                      <Button type="button" variant="ghost" size="icon" aria-label={`Remove tier ${i + 1}`} onClick={() => set({ tiers: p.tiers.filter((_, j) => j !== i) })}>
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="soft" size="sm" className="w-fit" onClick={() => set({ tiers: [...p.tiers, { min: 0, price: 0 }] })}>
                    <Plus aria-hidden /> Add bulk price
                  </Button>
                </FieldSet>
                {nav}
              </FieldGroup>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={next}>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="stock">In stock</FieldLabel>
                    <InputGroup>
                      <InputGroupInput id="stock" type="number" min={0} required value={p.stock || ""} onChange={(e) => set({ stock: num(e.target.value) })} />
                      <InputGroupAddon align="inline-end">{p.unit}s</InputGroupAddon>
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="delivery">Delivery time</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="delivery"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={30}
                        required
                        value={p.deliveryDays}
                        onChange={(e) => set({ deliveryDays: Math.min(30, num(e.target.value)) })}
                        aria-describedby="delivery-help"
                      />
                      <InputGroupAddon align="inline-end">{p.deliveryDays === 1 ? "day" : "days"}</InputGroupAddon>
                    </InputGroup>
                    <FieldDescription id="delivery-help">Buyers see “{deliveryLabel(p.deliveryDays)}”. Use 0 for same-day, up to 30.</FieldDescription>
                  </Field>
                </div>
                <FieldDescription>Delivery fees come from the buyer’s area. Mark a product out of stock any time from your product list.</FieldDescription>
                {nav}
              </FieldGroup>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={next}>
              <FieldGroup>
                <FieldSet>
                  <FieldLegend variant="label">Photos</FieldLegend>
                  <FieldDescription>Up to {MAX_PHOTOS} photos (JPG, PNG or WebP, 5 MB each). The first one is the cover.</FieldDescription>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {p.images.map((src, i) => (
                      <li key={src} className="relative">
                        <ProductImage category={p.category} src={src} sizes="160px" className="rounded-xl" />
                        <Button type="button" variant="outline" size="icon-sm" aria-label={`Remove photo ${i + 1}`} className="absolute top-2 right-2 border-0" onClick={() => set({ images: p.images.filter((_, j) => j !== i) })}>
                          <X aria-hidden />
                        </Button>
                      </li>
                    ))}
                    {Array.from({ length: uploading }, (_, i) => (
                      <li key={`uploading-${i}`} className="grid aspect-square place-items-center rounded-xl bg-muted">
                        <Spinner aria-label="Uploading photo" className="size-6 text-muted-foreground" />
                      </li>
                    ))}
                    {p.images.length + uploading < MAX_PHOTOS && (
                      <li>
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm text-muted-foreground hover:border-primary hover:text-primary"
                        >
                          <ImagePlus aria-hidden className="size-6" /> Add photos
                        </button>
                      </li>
                    )}
                  </ul>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => addPhotos(e.target.files)} />
                </FieldSet>
                {nav}
              </FieldGroup>
            </form>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-6">
              <dl className="grid gap-2.5 sm:grid-cols-2">
                {(
                  [
                    ["Name", p.name, 0],
                    ["Category", categoryName ?? "—", 0],
                    ["Brand", p.brand || "—", 0],
                    ["Specs", `${p.specs.filter((s) => s.label && s.value).length} added`, 0],
                    ["Price", `${formatNaira(p.price)} / ${p.unit}`, 1],
                    ["Bulk prices", p.tiers.length ? p.tiers.map((t) => `${t.min}+ at ${formatNaira(t.price)}`).join(", ") : "None", 1],
                    ["In stock", `${p.stock.toLocaleString()} ${p.unit}s`, 2],
                    ["Delivery", deliveryLabel(p.deliveryDays), 2],
                    ["Photos", `${p.images.length} of ${MAX_PHOTOS}`, 3],
                  ] as const
                ).map(([k, v, to]) => (
                  <div key={k} className="flex items-start justify-between gap-3 rounded-xl bg-muted px-4 py-3">
                    <div className="min-w-0">
                      <dt className="text-sm text-muted-foreground">{k}</dt>
                      <dd className="truncate">{v}</dd>
                    </div>
                    <Button type="button" variant="ghost" size="sm" aria-label={`Edit ${k.toLowerCase()}`} onClick={() => setStep(to)}>
                      Edit
                    </Button>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" disabled={save.isPending || uploading > 0} onClick={() => finish("draft")}>
                    Save as draft
                  </Button>
                  <Button loading={save.isPending} disabled={uploading > 0} onClick={() => finish(p.stock ? "live" : "out-of-stock")}>
                    {initial ? "Save and publish" : "Publish product"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        <aside aria-label="Preview" className="flex flex-col gap-3 xl:sticky xl:top-8">
          <h2 className="text-sm text-muted-foreground">Buyer preview</h2>
          <div className="pointer-events-none max-w-64" inert>
            <ProductCard product={{ ...p, id: "preview", slug: initial?.slug ?? "preview", name: p.name || "Your product name", category: p.category || "tools", rating: 0, reviewCount: 0, store: { id: "", slug: "", name: "", verified: true, replyTime: "", rating: 0 } }} />
          </div>
        </aside>
      </div>
    </>
  )
}
