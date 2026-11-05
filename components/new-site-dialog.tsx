"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useDeliveryLocation } from "@/hooks/use-location"
import { useCreateSite } from "@/hooks/use-sites"
import { fieldErrors } from "@/lib/http"
import type { Place, Site } from "@/lib/types"
import { AddressSearch } from "./address-search"
import { PickedPlace } from "./picked-place"

const fields = [
  { name: "label", label: "Site name", placeholder: "e.g. Ajah warehouse", required: true },
  { name: "details", label: "House number, gate or landmark", placeholder: "e.g. Plot 22, blue gate", required: false },
  { name: "contactName", label: "Site contact", placeholder: "Who receives deliveries", required: true },
  { name: "contactPhone", label: "Contact phone", placeholder: "0803 000 0000", type: "tel", required: true },
] as const

export function NewSiteDialog({ onAdd }: { onAdd: (site: Site) => void }) {
  const [open, setOpen] = useState(false)
  const [place, setPlace] = useState<Place | null>(null)
  const { location } = useDeliveryLocation()
  const create = useCreateSite()
  const errors = fieldErrors(create.error)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setPlace(null)
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="soft" className="w-fit">
          <Plus aria-hidden /> Add a new site
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation() // Don't submit the checkout form behind the dialog.
            if (!place) return
            const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
            const details = f.details?.trim()
            create.mutate(
              { label: f.label, address: details ? `${details}, ${place.label}` : place.label, area: place.area, coords: place.coords, contactName: f.contactName, contactPhone: f.contactPhone },
              {
                onSuccess: (site) => {
                  onAdd(site)
                  setOpen(false)
                  setPlace(null)
                },
              },
            )
          }}
        >
          <FieldGroup>
            <DialogHeader>
              <DialogTitle>Add a delivery site</DialogTitle>
              <DialogDescription>{place ? "Add the details drivers need." : "Find the site’s street or a landmark next to it."}</DialogDescription>
            </DialogHeader>
            {place ? (
              <>
                <PickedPlace place={place} onChange={() => setPlace(null)} />
                {fields.map((f) => (
                  <Field key={f.name} data-invalid={!!errors[f.name]}>
                    <FieldLabel htmlFor={`site-${f.name}`}>
                      {f.label}
                      {!f.required && <span className="font-normal text-muted-foreground"> (optional)</span>}
                    </FieldLabel>
                    <Input id={`site-${f.name}`} name={f.name} type={"type" in f ? f.type : "text"} required={f.required} placeholder={f.placeholder} aria-invalid={!!errors[f.name]} />
                    <FieldError>{errors[f.name]}</FieldError>
                  </Field>
                ))}
                <DialogFooter>
                  <Button type="submit" loading={create.isPending}>
                    Save site
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <AddressSearch onSelect={setPlace} near={location.coords} autoFocus label="Search for the site address" />
            )}
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
