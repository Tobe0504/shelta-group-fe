import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { tones } from "@/lib/tones"
import type { Tone } from "@/lib/types"
import { cn } from "@/lib/utils"

export function StatCard({ icon: Icon, tone, label, value, note }: { icon: LucideIcon; tone: Tone; label: string; value: string; note?: string }) {
  return (
    <Card className="gap-3 px-5 py-5">
      <span className={cn("grid size-10 place-items-center rounded-xl", tones[tone].bg)}>
        <Icon aria-hidden className={cn("size-5", tones[tone].fg)} />
      </span>
      <p className="flex flex-col gap-0.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {note && <span className="text-sm text-muted-foreground">{note}</span>}
      </p>
    </Card>
  )
}
