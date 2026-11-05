import type { Tone } from "./types"

/** Category pastels: `bg` for tiles, `soft` for image backgrounds, `fg` for icons. Full class strings so Tailwind can see them. */
export const tones: Record<Tone, { bg: string; soft: string; fg: string }> = {
  blue: { bg: "bg-[#E0ECFF]", soft: "bg-[#EEF4FF]", fg: "text-[#1D4ED8]" },
  peach: { bg: "bg-[#FFE8D6]", soft: "bg-[#FFF4EC]", fg: "text-[#C2410C]" },
  mint: { bg: "bg-[#DCF5E7]", soft: "bg-[#F0FAF4]", fg: "text-[#15803D]" },
  lilac: { bg: "bg-[#EDE6FF]", soft: "bg-[#F6F2FF]", fg: "text-[#6D28D9]" },
  yellow: { bg: "bg-[#FFF3C4]", soft: "bg-[#FFF9E6]", fg: "text-[#A16207]" },
  pink: { bg: "bg-[#FFE3EC]", soft: "bg-[#FFF0F5]", fg: "text-[#BE185D]" },
  teal: { bg: "bg-[#D7F3F4]", soft: "bg-[#E9F7F7]", fg: "text-[#0F766E]" },
  slate: { bg: "bg-[#E6EEF7]", soft: "bg-[#F3F6F9]", fg: "text-[#334155]" },
  lime: { bg: "bg-[#F1F5E1]", soft: "bg-[#F7FAEE]", fg: "text-[#4D7C0F]" },
}

/** Tone per category slug, for product image placeholders. Menus and tiles use the tone from the API. */
const categoryTones: Record<string, Tone> = {
  cement: "blue", "iron-rods": "peach", blocks: "mint", roofing: "lilac", tiles: "yellow", paint: "pink", plumbing: "teal", aggregates: "lime",
  plant: "yellow", tools: "slate", furniture: "peach", "doors-windows": "teal", lighting: "yellow", electrical: "blue", solar: "lime",
  garden: "mint", fencing: "slate", ppe: "peach", security: "lilac",
}
export const toneFor = (category: string) => tones[categoryTones[category] ?? "slate"]
