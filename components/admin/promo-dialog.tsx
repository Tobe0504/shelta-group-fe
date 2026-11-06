"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSavePromo } from "@/hooks/use-admin"
import { useDepartments } from "@/hooks/use-catalog"
import { promoIcons, promoThemes } from "@/lib/data"
import { fieldErrors } from "@/lib/http"
import type { AdminPromo, PromoInput } from "@/lib/types"
import { PromoCarousel } from "../promo-carousel"

const EVERYWHERE = "everywhere"
const blank: PromoInput = { badge: "", title: "", text: "", cta: "Shop now", href: "/search", theme: "primary", icon: "cement", active: true }

const textFields = [
  { key: "badge", label: "Badge", placeholder: "e.g. Up to 9% off", max: 30 },
  { key: "title", label: "Headline", placeholder: "e.g. Bulk cement, lower price per bag", max: 80 },
  { key: "text", label: "Supporting line", placeholder: "e.g. From 100 bags · Dangote, BUA", max: 140 },
  { key: "cta", label: "Button label", placeholder: "e.g. Shop cement", max: 30 },
  { key: "href", label: "Button link", placeholder: "/search?category=cement", max: 200 },
  { key: "sponsor", label: "Sponsor (optional)", placeholder: "Shows “Ad · Name”", max: 60 },
] as const

/** Create or edit a promo banner, with a live preview. */
export function PromoDialog({ promo, children }: { promo?: AdminPromo; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [p, setP] = useState<PromoInput>(promo ?? blank)
  const save = useSavePromo()
  const categories = useDepartments().data?.flatMap((d) => d.categories) ?? []
  const errors = fieldErrors(save.error)
  const set = (patch: Partial<PromoInput>) => setP((x) => ({ ...x, ...patch }))

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setP(promo ?? blank)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const { badge, title, text, cta, href, theme, icon, category, sponsor, order, active } = p
            save.mutate(
              { id: promo?.id, body: { badge, title, text, cta, href, theme, icon, category: category || undefined, sponsor: sponsor || undefined, order, active } },
              { onSuccess: () => (setOpen(false), toast.success(promo ? "Promo updated" : "Promo created")) },
            )
          }}
        >
          <FieldGroup>
            <DialogHeader>
              <DialogTitle>{promo ? "Edit promo" : "New promo"}</DialogTitle>
            </DialogHeader>
            <PromoCarousel promos={[{ ...p, id: "preview", title: p.title || "Your headline", badge: p.badge || "Badge", text: p.text || "Supporting line", cta: p.cta || "Button" }]} size="banner" label="Preview" />
            <div className="grid gap-4 max-sm:gap-3 sm:grid-cols-2">
              {textFields.map((f) => (
                <Field key={f.key} data-invalid={!!errors[f.key]}>
                  <FieldLabel htmlFor={`promo-${f.key}`}>{f.label}</FieldLabel>
                  <Input
                    id={`promo-${f.key}`}
                    required={f.key !== "sponsor"}
                    maxLength={f.max}
                    placeholder={f.placeholder}
                    value={p[f.key] ?? ""}
                    onChange={(e) => set({ [f.key]: e.target.value })}
                    aria-invalid={!!errors[f.key]}
                  />
                  <FieldError>{errors[f.key]}</FieldError>
                </Field>
              ))}
              <Field>
                <FieldLabel htmlFor="promo-theme">Colour</FieldLabel>
                <Select value={p.theme} onValueChange={(v) => set({ theme: v as PromoInput["theme"] })}>
                  <SelectTrigger id="promo-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {promoThemes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="promo-icon">Picture</FieldLabel>
                <Select value={p.icon} onValueChange={(v) => set({ icon: v as PromoInput["icon"] })}>
                  <SelectTrigger id="promo-icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {promoIcons.map((i) => (
                      <SelectItem key={i} value={i} className="capitalize">
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="promo-category">Show on</FieldLabel>
                <Select value={p.category ?? EVERYWHERE} onValueChange={(v) => set({ category: v === EVERYWHERE ? undefined : v })}>
                  <SelectTrigger id="promo-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EVERYWHERE}>Home and every category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name} first
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>Category promos lead that category’s search page.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="promo-order">Position</FieldLabel>
                <Input id="promo-order" type="number" min={0} value={p.order ?? 0} onChange={(e) => set({ order: Number(e.target.value) || 0 })} />
                <FieldDescription>Lower numbers show first.</FieldDescription>
              </Field>
            </div>
            <DialogFooter>
              <Button type="submit" loading={save.isPending}>
                {promo ? "Save changes" : "Create promo"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
