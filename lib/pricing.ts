import type { PriceTier } from "./types"

/** Unit price for a quantity, applying the best matching bulk tier (mirrors the API). */
export const unitPrice = (product: { price: number; tiers?: PriceTier[] }, qty: number) =>
  (product.tiers ?? []).filter((t) => qty >= t.min).reduce((best, t) => Math.min(best, t.price), product.price)
