"use client"

import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { formatNaira } from "@/lib/format"
import { cn } from "@/lib/utils"

export type StageRow = { title: string; amount: string }
export const MAX_STAGES = 4
export const toNaira = (value: string) => Number(value.replace(/\D/g, "")) || 0

/** Rows of stage name and amount, with a running total checked against the quoted price. */
export function StagesEditor({ stages, onChange, price }: { stages: StageRow[]; onChange: (stages: StageRow[]) => void; price: number }) {
  const total = stages.reduce((n, s) => n + toNaira(s.amount), 0)
  const set = (i: number, patch: Partial<StageRow>) => onChange(stages.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">Payment stages</legend>
      {stages.map((s, i) => (
        <div key={i} className="flex gap-2">
          <Input aria-label={`Stage ${i + 1} name`} required maxLength={60} placeholder={i ? "e.g. Finishing" : "e.g. Materials and setup"} value={s.title} onChange={(e) => set(i, { title: e.target.value })} />
          <InputGroup className="w-36 shrink-0 max-sm:w-28">
            <InputGroupAddon>₦</InputGroupAddon>
            <InputGroupInput aria-label={`Stage ${i + 1} amount`} required inputMode="numeric" value={s.amount} onChange={(e) => set(i, { amount: e.target.value })} />
          </InputGroup>
          <Button type="button" variant="ghost" size="icon" aria-label={`Remove stage ${i + 1}`} disabled={stages.length <= 2} onClick={() => onChange(stages.filter((_, j) => j !== i))}>
            <X aria-hidden />
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="soft" size="sm" disabled={stages.length >= MAX_STAGES} onClick={() => onChange([...stages, { title: "", amount: "" }])}>
          <Plus aria-hidden /> Add stage
        </Button>
        <p aria-live="polite" className={cn("text-sm tabular-nums max-sm:text-xs", price && total !== price ? "text-destructive" : "text-muted-foreground")}>
          {formatNaira(total)} of {formatNaira(price)}
        </p>
      </div>
    </fieldset>
  )
}
