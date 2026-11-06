"use client"

import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDeleteCategory, useDeleteDepartment, useSaveCategory, useSaveDepartment } from "@/hooks/use-admin"
import { useDepartments } from "@/hooks/use-catalog"
import { slugify } from "@/lib/slug"
import { tones } from "@/lib/tones"
import type { Category, Department, DepartmentKind, Tone } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CategoryIcon } from "../category-icon"
import { ConfirmDialog } from "../confirm-dialog"
import { EmptyState } from "../empty-state"
import { PageHeader } from "../page-header"
import { ListSkeleton } from "../skeletons"
import { FormDialog } from "./form-dialog"

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim()
const row = "flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 ring-1 ring-border max-sm:gap-2 max-sm:rounded-xl max-sm:px-2.5 max-sm:py-1.5"

/** Icon button used as a dialog trigger, so it forwards the props the trigger adds. */
function EditButton({ label, ...props }: { label: string } & React.ComponentProps<typeof Button>) {
  return (
    <Button variant="ghost" size="icon" aria-label={label} {...props}>
      <Pencil aria-hidden />
    </Button>
  )
}

function DeleteButton({ label, description, onConfirm }: { label: string; description: string; onConfirm: () => void }) {
  return (
    <ConfirmDialog
      title={`${label}?`}
      description={description}
      onConfirm={onConfirm}
      trigger={
        <Button variant="ghost" size="icon" aria-label={label}>
          <Trash2 aria-hidden />
        </Button>
      }
    />
  )
}

function NameField({ id, label, defaultValue, slug }: { id: string; label: string; defaultValue?: string; slug?: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} name="name" required maxLength={80} defaultValue={defaultValue} />
      {slug && <FieldDescription>Link: /{slug} (can’t be changed)</FieldDescription>}
    </Field>
  )
}

function OrderField({ defaultValue }: { defaultValue?: number }) {
  return (
    <Field>
      <FieldLabel htmlFor="order">Position</FieldLabel>
      <Input id="order" name="order" type="number" min={0} defaultValue={defaultValue ?? 0} />
      <FieldDescription>Lower numbers show first.</FieldDescription>
    </Field>
  )
}

// ——— Categories ———

function CategoryDialog({ category, departments, trigger }: { category?: Category & { order?: number }; departments: Department[]; trigger: React.ReactNode }) {
  const save = useSaveCategory()
  return (
    <FormDialog
      title={category ? `Edit ${category.name}` : "Add a category"}
      success={category ? "Category updated" : "Category added"}
      trigger={trigger}
      onSave={(f) =>
        save.mutateAsync({
          slug: category?.slug,
          body: { slug: category?.slug ?? slugify(str(f, "name")), name: str(f, "name"), department: str(f, "department"), tone: str(f, "tone") as Tone, order: Number(f.get("order")) || 0 },
        })
      }
    >
      <NameField id="cat-name" label="Name" defaultValue={category?.name} slug={category && `search?category=${category.slug}`} />
      <Field>
        <FieldLabel htmlFor="cat-dept">Department</FieldLabel>
        <Select name="department" required defaultValue={category?.department ?? departments[0]?.slug}>
          <SelectTrigger id="cat-dept">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.slug} value={d.slug}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="cat-tone">Tile colour</FieldLabel>
        <Select name="tone" defaultValue={category?.tone ?? "blue"}>
          <SelectTrigger id="cat-tone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(tones) as Tone[]).map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                <span aria-hidden className={cn("size-3 rounded-full", tones[t].bg)} /> {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <OrderField defaultValue={category?.order} />
    </FormDialog>
  )
}

function CategoriesTab({ departments }: { departments: Department[] }) {
  const remove = useDeleteCategory()
  return (
    <div className="flex flex-col gap-6">
      <CategoryDialog
        departments={departments}
        trigger={
          <Button className="w-fit" disabled={!departments.length}>
            <Plus aria-hidden /> Add category
          </Button>
        }
      />
      {departments.map((d) => (
        <section key={d.slug} aria-labelledby={`dept-h-${d.slug}`} className="flex flex-col gap-2">
          <h2 id={`dept-h-${d.slug}`} className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {d.name}
          </h2>
          {d.categories.length ? (
            <ul className="grid gap-2 max-sm:gap-1.5 md:grid-cols-2">
              {d.categories.map((c) => (
                <li key={c.slug} className={row}>
                  <span className={cn("grid size-10 place-items-center rounded-xl max-sm:size-8 max-sm:rounded-lg", tones[c.tone].bg)}>
                    <CategoryIcon slug={c.slug} className={cn("size-5 max-sm:size-4", tones[c.tone].fg)} />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="font-medium max-sm:text-sm">{c.name}</span>
                    <span className="text-sm text-muted-foreground max-sm:text-xs">{c.slug}</span>
                  </span>
                  <CategoryDialog category={c} departments={departments} trigger={<EditButton label={`Edit ${c.name}`} />} />
                  <DeleteButton
                    label={`Delete ${c.name}`}
                    description="Only possible once no products use it. Move its products to another category first."
                    onConfirm={() => remove.mutate(c.slug, { onSuccess: () => toast("Category deleted") })}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          )}
        </section>
      ))}
    </div>
  )
}

// ——— Departments ———

function DepartmentDialog({ department, index, trigger }: { department?: Department; index: number; trigger: React.ReactNode }) {
  const save = useSaveDepartment()
  return (
    <FormDialog
      title={department ? `Edit ${department.name}` : "Add a department"}
      description="Product departments group categories in the menu and filters. Service departments group the trades buyers hire."
      success={department ? "Department updated" : "Department added"}
      trigger={trigger}
      onSave={(f) => save.mutateAsync({ slug: department?.slug ?? slugify(str(f, "name")), name: str(f, "name"), kind: str(f, "kind") as DepartmentKind, order: Number(f.get("order")) || 0 })}
    >
      <NameField id="dept-name" label="Name" defaultValue={department?.name} />
      <Field>
        <FieldLabel htmlFor="dept-kind">Type</FieldLabel>
        <Select name="kind" defaultValue={department?.kind ?? "products"}>
          <SelectTrigger id="dept-kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="products">Products (sold through the cart)</SelectItem>
            <SelectItem value="services">Services (trades people hire)</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <OrderField defaultValue={index} />
    </FormDialog>
  )
}

function DepartmentsTab({ departments }: { departments: Department[] }) {
  const remove = useDeleteDepartment()
  return (
    <div className="flex flex-col gap-4">
      <DepartmentDialog
        index={departments.length}
        trigger={
          <Button className="w-fit">
            <Plus aria-hidden /> Add department
          </Button>
        }
      />
      <ul className="flex flex-col gap-2">
        {departments.map((d, i) => (
          <li key={d.slug} className={row}>
            <span className="flex flex-1 flex-col">
              <span className="font-medium">{d.name}</span>
              <span className="text-sm text-muted-foreground">{d.categories.map((c) => c.name).join(", ") || "No categories"}</span>
            </span>
            <Badge variant={d.kind === "services" ? "accent" : "secondary"}>
              {d.kind === "services" ? "Services" : "Products"} · {d.categories.length}
            </Badge>
            <DepartmentDialog department={d} index={i} trigger={<EditButton label={`Edit ${d.name}`} />} />
            <DeleteButton label={`Delete ${d.name}`} description="Only possible once it has no categories." onConfirm={() => remove.mutate(d.slug, { onSuccess: () => toast("Department deleted") })} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AdminCatalogue() {
  const { data: departments, isPending, isError } = useDepartments("all")
  const [tab, setTab] = useState("categories")
  return (
    <>
      <PageHeader title="Catalogue" description="Product categories, service trades and the departments that group them. Changes show on the site straight away." />
      <Tabs value={tab} onValueChange={setTab} className="gap-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>
        {isPending ? (
          <ListSkeleton rows={4} className="h-16 rounded-2xl" />
        ) : isError ? (
          <EmptyState>We couldn’t load the catalogue. Refresh to try again.</EmptyState>
        ) : (
          <>
            <TabsContent value="categories">
              <CategoriesTab departments={departments} />
            </TabsContent>
            <TabsContent value="departments">
              <DepartmentsTab departments={departments} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </>
  )
}
