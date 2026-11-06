"use client"

import Link from "next/link"
import { useState } from "react"
import { MoreHorizontal, PackagePlus, Search } from "lucide-react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsCount, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDepartments } from "@/hooks/use-catalog"
import { useDeleteListing, useListings, useUpdateListing } from "@/hooks/use-seller"
import { formatNaira } from "@/lib/format"
import type { Listing, ProductStatus } from "@/lib/types"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"
import { ProductImage } from "./product-image"
import { ListSkeleton } from "./skeletons"

export const statusBadge: Record<ProductStatus, { label: string; variant: "success" | "secondary" | "deal-soft" }> = {
  live: { label: "Live", variant: "success" },
  draft: { label: "Draft", variant: "secondary" },
  "out-of-stock": { label: "Out of stock", variant: "deal-soft" },
}

function DeleteDialog({ listing, onClose }: { listing: Listing | null; onClose: () => void }) {
  const remove = useDeleteListing()
  return (
    <AlertDialog open={!!listing} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {listing?.name}?</AlertDialogTitle>
          <AlertDialogDescription>Buyers won’t see it any more. Past orders keep their details. This can’t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => listing && remove.mutate(listing.slug, { onSuccess: () => toast("Product deleted") })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function SellerProducts() {
  const { data, isPending, isError } = useListings()
  const departments = useDepartments().data ?? []
  const update = useUpdateListing()
  const [tab, setTab] = useState<"all" | ProductStatus>("all")
  const [query, setQuery] = useState("")
  const [deleting, setDeleting] = useState<Listing | null>(null)
  const listings = data?.data ?? []
  const term = query.trim().toLowerCase()
  const shown = listings.filter((l) => (tab === "all" || l.status === tab) && (!term || l.name.toLowerCase().includes(term)))
  const categoryName = (slug: string) => departments.flatMap((d) => d.categories).find((c) => c.slug === slug)?.name

  return (
    <>
      <PageHeader title="Products" description={isPending ? undefined : `${listings.length} products in your store`}>
        <Button asChild>
          <Link href="/seller/products/new">
            <PackagePlus aria-hidden /> Add product
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            {(["all", "live", "draft", "out-of-stock"] as const).map((t) => (
              <TabsTrigger key={t} value={t}>
                {t === "all" ? "All" : statusBadge[t].label}
                <TabsCount>{t === "all" ? listings.length : listings.filter((l) => l.status === t).length}</TabsCount>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search your products" placeholder="Search products" />
        </InputGroup>
      </div>

      {isPending ? (
        <ListSkeleton rows={5} className="h-16 rounded-2xl" />
      ) : isError ? (
        <EmptyState>We couldn’t load your products. Refresh to try again.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="pl-4">Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-14 pr-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="pl-4">
                    <Link href={`/seller/products/${l.slug}`} className="flex items-center gap-3 hover:text-primary">
                      <ProductImage category={l.category} src={l.images[0]} sizes="48px" className="size-12 rounded-lg" />
                      <span className="flex flex-col">
                        <span className="max-w-72 truncate">{l.name}</span>
                        <span className="text-sm text-muted-foreground">{categoryName(l.category)}</span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatNaira(l.price)} <span className="text-muted-foreground">/ {l.unit}</span>
                  </TableCell>
                  <TableCell className="tabular-nums">{l.stock.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadge[l.status].variant}>{statusBadge[l.status].label}</Badge>
                  </TableCell>
                  <TableCell className="pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${l.name}`}>
                          <MoreHorizontal aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/seller/products/${l.slug}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            const status = l.status === "live" ? "draft" : "live"
                            update.mutate({ slug: l.slug, body: { status } }, { onSuccess: () => toast.success(status === "live" ? "Product is live" : "Moved to drafts") })
                          }}
                        >
                          {l.status === "live" ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(l)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!shown.length && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No products here yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <DeleteDialog listing={deleting} onClose={() => setDeleting(null)} />
    </>
  )
}
