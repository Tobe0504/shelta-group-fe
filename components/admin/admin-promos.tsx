"use client"

import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAdminPromos, useDeletePromo, useTogglePromo } from "@/hooks/use-admin"
import { useDepartments } from "@/hooks/use-catalog"
import type { AdminPromo } from "@/lib/types"
import { EmptyState } from "../empty-state"
import { PageHeader } from "../page-header"
import { PromoCarousel } from "../promo-carousel"
import { ListSkeleton } from "../skeletons"
import { PromoDialog } from "./promo-dialog"

function PromoRow({ promo, categoryName, onDelete }: { promo: AdminPromo; categoryName?: string; onDelete: () => void }) {
  const toggle = useTogglePromo()
  return (
    <Card className="gap-4 p-4 max-sm:gap-2.5 max-sm:p-3 sm:flex-row sm:items-center">
      <div className="pointer-events-none sm:w-80 sm:shrink-0" inert>
        <PromoCarousel promos={[promo]} size="banner" label={promo.title} />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{promo.title}</span>
          {promo.sponsor && <Badge variant="outline">Ad · {promo.sponsor}</Badge>}
        </p>
        <p className="text-sm text-muted-foreground">
          {categoryName ? `Leads ${categoryName}` : "Home and every category"} · position {promo.order} · links to {promo.href}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-h-9 items-center gap-2 pr-2">
            <Switch
              id={`active-${promo.id}`}
              checked={promo.active}
              disabled={toggle.isPending}
              onCheckedChange={(active) => toggle.mutate({ id: promo.id, active }, { onSuccess: () => toast.success(active ? "Promo is showing" : "Promo hidden") })}
            />
            <Label htmlFor={`active-${promo.id}`}>{promo.active ? "Showing" : "Hidden"}</Label>
          </div>
          <PromoDialog promo={promo}>
            <Button variant="secondary" size="sm">
              <Pencil aria-hidden /> Edit
            </Button>
          </PromoDialog>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onDelete}>
            <Trash2 aria-hidden /> Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function AdminPromos() {
  const { data: promos, isPending, isError } = useAdminPromos()
  const categories = useDepartments().data?.flatMap((d) => d.categories) ?? []
  const remove = useDeletePromo()
  const [deleting, setDeleting] = useState<AdminPromo | null>(null)

  return (
    <>
      <PageHeader title="Promos" description="Banners in the home page carousel and above search results.">
        <PromoDialog>
          <Button>
            <Plus aria-hidden /> New promo
          </Button>
        </PromoDialog>
      </PageHeader>
      {isPending ? (
        <ListSkeleton rows={4} className="h-40" />
      ) : isError ? (
        <EmptyState>We couldn’t load promos. Refresh to try again.</EmptyState>
      ) : promos.length ? (
        <ul className="flex flex-col gap-4">
          {promos.map((p) => (
            <li key={p.id}>
              <PromoRow promo={p} categoryName={categories.find((c) => c.slug === p.category)?.name} onDelete={() => setDeleting(p)} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>No promos yet. Create one to fill the home page carousel.</EmptyState>
      )}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>It disappears from the carousel straight away. To pause it instead, switch it to hidden.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deleting && remove.mutate(deleting.id, { onSuccess: () => toast("Promo deleted") })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
