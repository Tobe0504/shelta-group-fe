"use client"

import { useState } from "react"
import { RadioGroup } from "@/components/ui/radio-group"
import { formatNaira } from "@/lib/format"
import { unitPrice } from "@/lib/pricing"
import type { Product } from "@/lib/types"
import { AddToCartButton } from "./add-to-cart-button"
import { ChoiceCard } from "./choice-card"
import { QuantityStepper } from "./quantity-stepper"
import { SaveButton } from "./save-button"

export function BuyBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(product.tiers?.[1]?.min ?? 1)
  const price = unitPrice(product, qty)
  const activeTier = product.tiers.findLast((t) => qty >= t.min)
  const soldOut = product.status === "out-of-stock"

  return (
    <div className="flex flex-col gap-5 max-sm:gap-2.5">
      {product.tiers.length > 0 && (
        <RadioGroup
          aria-label="Bulk pricing"
          value={String(activeTier?.min)}
          onValueChange={(v) => setQty(Number(v))}
          className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2.5 max-sm:grid-cols-3 max-sm:gap-1.5"
        >
          {product.tiers.map((t) => (
            <ChoiceCard key={t.min} id={`tier-${t.min}`} value={String(t.min)} hideRadio className="flex-col gap-1 text-muted-foreground max-sm:gap-0 max-sm:rounded-xl max-sm:p-2 max-sm:text-xs">
              {t.label ?? `${t.min}+ ${product.unit}s`}
              <span className="text-lg font-semibold text-foreground tabular-nums max-sm:text-sm">{formatNaira(t.price)}</span>
            </ChoiceCard>
          ))}
        </RadioGroup>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} label={`Quantity in ${product.unit}s`} />
        <AddToCartButton productId={product.id} name={product.name} qty={qty} variant="default" size="lg" className="flex-1 max-sm:hidden" disabled={soldOut}>
          Add to cart · <span className="tabular-nums">{formatNaira(price * qty)}</span>
        </AddToCartButton>
        <SaveButton productId={product.id} label={product.name} className="bg-secondary max-sm:ml-auto" />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t bg-background/95 p-3 backdrop-blur max-sm:gap-2 max-sm:px-3 max-sm:py-2 lg:hidden">
        <p className="flex flex-col text-sm leading-tight">
          <span className="text-muted-foreground">
            {qty} {product.unit}s
          </span>
          <span className="text-lg font-semibold tabular-nums max-sm:text-base">{formatNaira(price * qty)}</span>
        </p>
        <AddToCartButton productId={product.id} name={product.name} qty={qty} variant="default" className="flex-1" disabled={soldOut} />
      </div>
    </div>
  )
}
