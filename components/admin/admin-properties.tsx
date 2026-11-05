"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminEstates, useDeleteEstate, useSaveEstate, useToggleEstate } from "@/hooks/use-admin"
import { estateKinds } from "@/lib/data"
import { formatNaira } from "@/lib/format"
import { tones } from "@/lib/tones"
import type { Estate, EstateKind, Tone } from "@/lib/types"
import { ConfirmDialog } from "../confirm-dialog"
import { EmptyState } from "../empty-state"
import { ImageUploader, readImages } from "../image-uploader"
import { PageHeader } from "../page-header"
import { ListSkeleton } from "../skeletons"
import { FormDialog } from "./form-dialog"

const textFields = [
  { name: "name", label: "Name", placeholder: "e.g. Royal Villas Estate", required: true },
  { name: "developer", label: "Developer", placeholder: "Who to pass enquiries to" },
  { name: "area", label: "Area", placeholder: "e.g. Ikate", required: true },
  { name: "city", label: "City", placeholder: "e.g. Lagos", required: true },
  { name: "detail", label: "Detail line", placeholder: "e.g. 500 m² plots · C of O" },
  { name: "per", label: "Price unit", placeholder: "e.g. per plot, per night" },
] as const

function PropertyDialog({ estate, trigger }: { estate?: Estate; trigger: React.ReactNode }) {
  const save = useSaveEstate()
  return (
    <FormDialog
      wide
      title={estate ? `Edit ${estate.name}` : "Add a property"}
      description="Shown on the real estate page and the home page showcase."
      submitLabel={estate ? "Save changes" : "Add property"}
      success={estate ? "Property updated" : "Property added"}
      trigger={trigger}
      onSave={(f) => {
        const text = (k: string) => String(f.get(k) ?? "").trim() || undefined
        return save.mutateAsync({
          slug: estate?.slug,
          body: {
            kind: String(f.get("kind")) as EstateKind,
            tone: String(f.get("tone")) as Tone,
            name: text("name")!,
            area: text("area")!,
            city: text("city")!,
            detail: text("detail"),
            per: text("per"),
            developer: text("developer"),
            price: Number(f.get("price")),
            images: readImages(f, "images"),
            active: f.get("active") === "on",
          },
        })
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="p-kind">Type</FieldLabel>
          <Select name="kind" defaultValue={estate?.kind ?? "Land"}>
            <SelectTrigger id="p-kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {estateKinds.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="p-price">Price</FieldLabel>
          <Input id="p-price" name="price" type="number" min={0} required defaultValue={estate?.price} />
        </Field>
        {textFields.map((t) => (
          <Field key={t.name}>
            <FieldLabel htmlFor={`p-${t.name}`}>{t.label}</FieldLabel>
            <Input id={`p-${t.name}`} name={t.name} required={"required" in t} placeholder={t.placeholder} defaultValue={estate?.[t.name]} />
          </Field>
        ))}
        <Field>
          <FieldLabel htmlFor="p-tone">Card colour</FieldLabel>
          <Select name="tone" defaultValue={estate?.tone ?? "lilac"}>
            <SelectTrigger id="p-tone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(tones) as Tone[]).map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  <span aria-hidden className={`size-3 rounded-full ${tones[t].bg}`} /> {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>Used when there’s no photo.</FieldDescription>
        </Field>
        <Field orientation="horizontal" className="self-center">
          <Switch id="p-active" name="active" defaultChecked={estate?.active ?? true} />
          <FieldLabel htmlFor="p-active">Show on the site</FieldLabel>
        </Field>
      </div>
      <ImageUploader name="images" kind="estate" label="Photos" initial={estate?.images} />
    </FormDialog>
  )
}

export function AdminProperties() {
  const { data: estates, isPending, isError } = useAdminEstates()
  const toggle = useToggleEstate()
  const remove = useDeleteEstate()

  return (
    <>
      <PageHeader title="Properties" description="Real estate listings are added by the SheltaMart team for verified developers.">
        <PropertyDialog
          trigger={
            <Button>
              <Plus aria-hidden /> Add property
            </Button>
          }
        />
      </PageHeader>
      {isPending ? (
        <ListSkeleton rows={5} className="h-16 rounded-2xl" />
      ) : isError ? (
        <EmptyState>We couldn’t load properties. Refresh to try again.</EmptyState>
      ) : estates.length ? (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="pl-4">Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Showing</TableHead>
                <TableHead className="pr-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estates.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="pl-4">
                    <span className="flex flex-col">
                      <span className="font-medium">{e.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {e.area}, {e.city}
                        {e.images?.length ? ` · ${e.images.length} photos` : ""}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{e.kind}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatNaira(e.price)} <span className="text-muted-foreground">{e.per}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`show-${e.id}`}
                        checked={e.active ?? true}
                        disabled={toggle.isPending}
                        onCheckedChange={(active) => toggle.mutate({ slug: e.slug, active }, { onSuccess: () => toast.success(active ? `${e.name} is showing` : `${e.name} hidden`) })}
                      />
                      <Label htmlFor={`show-${e.id}`} className="sr-only">
                        Show {e.name}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1">
                      <PropertyDialog
                        estate={e}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Edit ${e.name}`}>
                            <Pencil aria-hidden />
                          </Button>
                        }
                      />
                      <ConfirmDialog
                        title={`Delete ${e.name}?`}
                        description="It’s removed from the site. To pause it instead, switch it off."
                        onConfirm={() => remove.mutate(e.slug, { onSuccess: () => toast("Property deleted") })}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Delete ${e.name}`}>
                            <Trash2 aria-hidden />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState>No properties yet.</EmptyState>
      )}
    </>
  )
}
