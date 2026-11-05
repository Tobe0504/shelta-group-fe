"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"

export function CartLink() {
  const count = useCart().data?.lines.length ?? 0
  return (
    <Button asChild variant="secondary" size="icon" className="relative">
      <Link href="/cart" aria-label={`Cart, ${count} items`}>
        <ShoppingCart aria-hidden />
        {count > 0 && (
          <span aria-hidden className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-background bg-deal text-[11px] font-semibold text-deal-foreground">
            {count}
          </span>
        )}
      </Link>
    </Button>
  )
}
