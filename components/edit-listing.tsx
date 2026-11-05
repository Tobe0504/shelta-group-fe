"use client"

import { useListing } from "@/hooks/use-seller"
import { isStatus } from "@/lib/http"
import { EmptyState } from "./empty-state"
import { ProductEditor } from "./product-editor"
import { FormSkeleton } from "./skeletons"

export function EditListing({ slug }: { slug: string }) {
  const { data: listing, isPending, error } = useListing(slug)
  if (isPending) return <FormSkeleton fields={5} />
  if (error)
    return <EmptyState action={{ href: "/seller/products", label: "Back to products" }}>{isStatus(error, 404) ? "This product no longer exists." : "We couldn’t load this product. Refresh to try again."}</EmptyState>
  return <ProductEditor key={listing.updatedAt} initial={listing} />
}
