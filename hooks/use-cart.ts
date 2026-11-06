"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { keys } from "@/lib/query-keys"
import type { Cart, Coords } from "@/lib/types"
import { cartService } from "@/services/cart.service"
import { useDeliveryLocation } from "./use-location"
import { useMe } from "./use-auth"

/** The signed-in buyer's cart, with delivery priced to `to` (default: their chosen delivery location). */
export function useCart(to?: Coords) {
  const { data: me } = useMe()
  const { location, isPending } = useDeliveryLocation()
  const dest = to ?? location.coords
  return useQuery({ queryKey: keys.cartFor(dest), queryFn: () => cartService.get(dest), enabled: !!me && !isPending, placeholderData: (prev) => prev })
}

/** Refreshes every cached cart variant after a change. */
function useStoreCart() {
  const client = useQueryClient()
  return () => {
    // The write returns the cart without delivery pricing; refetch every priced variant.
    client.invalidateQueries({ queryKey: keys.cart })
  }
}

export function useSetCartLine() {
  const storeCart = useStoreCart()
  return useMutation({ mutationFn: ({ productId, qty }: { productId: string; qty: number }) => cartService.setLine(productId, qty), onSuccess: storeCart, meta: { pending: "Updating cart…" } })
}

/** Adds to the current quantity. Signed-out buyers are sent to sign in first. */
export function useAddToCart() {
  const client = useQueryClient()
  const router = useRouter()
  const path = usePathname()
  const { data: me } = useMe()
  const storeCart = useStoreCart()

  const mutation = useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number; name: string }) => {
      const cart = client.getQueriesData<Cart>({ queryKey: keys.cart })[0]?.[1]
      const current = cart?.lines.find((l) => l.product.id === productId)?.qty ?? 0
      return cartService.setLine(productId, current + qty)
    },
    onSuccess: (_cart, { name }) => {
      storeCart()
      toast.success(`${name} added`, { action: { label: "View cart", onClick: () => router.push("/cart") } })
    },
  })

  const add = (vars: { productId: string; qty: number; name: string }) => {
    if (!me) {
      toast("Sign in to add items to your cart")
      return router.push(`/login?next=${encodeURIComponent(path)}`)
    }
    mutation.mutate(vars)
  }
  return { add, isPending: mutation.isPending }
}
