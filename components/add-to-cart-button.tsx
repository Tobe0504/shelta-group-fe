"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAddToCart } from "@/hooks/use-cart"

export function AddToCartButton({
  productId,
  name,
  qty = 1,
  children = "Add to cart",
  ...props
}: { productId: string; name: string; qty?: number } & Omit<React.ComponentProps<typeof Button>, "onClick">) {
  const { add, isPending } = useAddToCart()
  return (
    <Button variant="soft" onClick={() => add({ productId, qty, name })} loading={isPending} {...props}>
      {!isPending && <Plus aria-hidden />}
      {children}
    </Button>
  )
}
