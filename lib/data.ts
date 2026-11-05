import type { EstateKind } from "./types"

// Fixed option lists. Everything else (catalogue, prices, orders) comes from the API.

export const units = ["bag", "length", "block", "metre", "m²", "sheet", "carton", "bucket", "roll", "coil", "tonne", "trip", "piece", "pair", "panel", "unit", "kit"]
export const estateKinds: EstateKind[] = ["Land", "Apartment", "House", "Short-let"]
/** Categories linked from the header bar, in order. */
export const headerCategories = ["cement", "iron-rods", "roofing", "tiles", "plant", "furniture", "solar", "ppe"]

export const promoThemes = [
  { value: "primary", label: "Blue" },
  { value: "dark", label: "Dark" },
  { value: "deal", label: "Orange" },
  { value: "success", label: "Green" },
] as const
export const promoIcons = ["cement", "rods", "roof", "truck", "quote", "paint", "tiles", "solar", "safety"] as const
