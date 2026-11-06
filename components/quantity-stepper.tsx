"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuantityStepper({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (value: number) => void
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="flex h-11 w-fit items-center rounded-full bg-secondary max-sm:h-9">
      <Button variant="ghost" size="icon" aria-label="Decrease" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus aria-hidden />
      </Button>
      <input
        aria-label="Quantity"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1))}
        className="w-14 bg-transparent max-sm:w-10 text-center font-medium tabular-nums outline-none focus-visible:underline"
      />
      <Button variant="ghost" size="icon" aria-label="Increase" onClick={() => onChange(value + 1)}>
        <Plus aria-hidden />
      </Button>
    </div>
  )
}
