import { BadgeCheck, House, ShieldCheck, Truck } from "lucide-react"
import { tones } from "@/lib/tones"
import type { Tone } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CategoryIcon } from "./category-icon"

const points = [
  { icon: BadgeCheck, text: "Verified suppliers near your site" },
  { icon: Truck, text: "Delivery cost shown before you pay" },
  { icon: ShieldCheck, text: "Payment held until you confirm delivery" },
]

/** Eight categories around the SheltaMart mark, read left to right, top to bottom. */
const ring: ({ slug: string; tone: Tone } | "mark")[] = [
  { slug: "cement", tone: "blue" },
  { slug: "iron-rods", tone: "peach" },
  { slug: "blocks", tone: "mint" },
  { slug: "tiles", tone: "yellow" },
  "mark",
  { slug: "plant", tone: "lilac" },
  { slug: "paint", tone: "pink" },
  { slug: "plumbing", tone: "teal" },
  { slug: "solar", tone: "lime" },
]

/** Brand side of the sign-in pages: a centred tile composition, headline and trust points. */
export function AuthBrandPanel() {
  return (
    <aside
      aria-label="Why SheltaMart"
      className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:items-center lg:justify-center lg:gap-12 lg:p-12"
    >
      {/* Soft glow behind the tiles so the composition reads as one object. */}
      <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-[36rem] -translate-1/2 rounded-full bg-primary-foreground/10 blur-3xl" />

      <ul aria-hidden className="relative grid w-full max-w-[19rem] grid-cols-3 gap-4 xl:max-w-sm">
        {ring.map((t) =>
          t === "mark" ? (
            <li key="mark" className="grid aspect-square place-items-center rounded-[28px] bg-background text-primary shadow-xl shadow-black/15">
              <House className="size-2/5" strokeWidth={2.2} />
            </li>
          ) : (
            <li key={t.slug} className={cn("grid aspect-square place-items-center rounded-[28px] shadow-lg shadow-black/10", tones[t.tone].bg)}>
              <CategoryIcon slug={t.slug} className={cn("size-2/5", tones[t.tone].fg)} />
            </li>
          ),
        )}
      </ul>

      <div className="relative flex max-w-md flex-col items-center gap-6 text-center">
        <h2 className="text-3xl leading-tight text-balance xl:text-4xl">Everything for your build, from suppliers you can trust.</h2>
        <ul className="flex flex-wrap justify-center gap-2">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 rounded-full bg-primary-foreground/12 px-4 py-2 text-sm text-primary-foreground/95">
              <Icon aria-hidden className="size-4 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
