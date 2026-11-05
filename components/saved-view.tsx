"use client"

import { useSaved } from "@/hooks/use-account"
import { EmptyState } from "./empty-state"
import { ProductGrid } from "./product-card"
import { RequireAuth } from "./require-auth"
import { ProductGridSkeleton } from "./skeletons"

function SavedList() {
  const { data: products, isPending, isError } = useSaved()
  if (isPending) return <ProductGridSkeleton count={5} />
  if (isError) return <EmptyState>We couldn’t load your saved items. Refresh to try again.</EmptyState>
  if (!products.length) return <EmptyState action={{ href: "/", label: "Browse products" }}>Nothing saved yet. Tap the heart on any product to keep it here.</EmptyState>
  return <ProductGrid products={products} />
}

export function SavedView() {
  return (
    <RequireAuth fallback={<ProductGridSkeleton count={5} />}>
      <SavedList />
    </RequireAuth>
  )
}
