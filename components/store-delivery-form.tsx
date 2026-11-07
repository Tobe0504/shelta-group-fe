"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useSettings } from "@/hooks/use-catalog"
import { useUpdateStore } from "@/hooks/use-seller"
import { formatNaira } from "@/lib/format"
import type { OwnStore } from "@/lib/types"
import { FormSkeleton } from "./skeletons"

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/** When the store delivers, what its offloading crew costs, and whether buyers can collect. */
export function StoreDeliveryForm({ store }: { store: OwnStore }) {
  const settings = useSettings()
  const update = useUpdateStore()
  const [windows, setWindows] = useState<string[]>(store.deliveryWindows ?? [])
  const [days, setDays] = useState<string[]>((store.deliveryDays ?? [1, 2, 3, 4, 5, 6]).map(String))
  const [pickup, setPickup] = useState(store.pickup ?? false)

  if (settings.isPending) return <FormSkeleton fields={4} />
  const defaults = settings.data?.deliveryWindows ?? []
  const minimum = settings.data?.offloadFee ?? 0
  const shown = windows.length ? windows : defaults

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const offloadFee = Number(String(f.get("offload")).replace(/\D/g, ""))
        if (offloadFee < minimum) return toast.error(`Offloading can’t be less than ${formatNaira(minimum)}`)
        const clean = shown.map((w) => w.trim()).filter(Boolean)
        if (!clean.length) return toast.error("Add at least one delivery time")
        if (!days.length) return toast.error("Choose at least one delivery day")
        update.mutate(
          {
            deliveryWindows: clean,
            deliveryDays: days.map(Number).sort(),
            deliveryDaysAhead: Number(f.get("ahead")) || 4,
            offloadFee,
            pickup,
            pickupHours: String(f.get("pickupHours") ?? "").trim(),
          },
          { onSuccess: () => toast.success("Delivery settings saved. Buyers see them at checkout.") },
        )
      }}
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Delivery days</FieldLegend>
          <ToggleGroup type="multiple" value={days} onValueChange={setDays} variant="outline" className="flex-wrap justify-start" aria-label="Delivery days">
            {WEEK.map((d, i) => (
              <ToggleGroupItem key={d} value={String(i)} className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
                {d}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend variant="label">Delivery times</FieldLegend>
          <div className="flex flex-col gap-2">
            {shown.map((w, i) => (
              <div key={i} className="flex gap-2">
                <Input aria-label={`Delivery time ${i + 1}`} value={w} placeholder="e.g. 8–12" maxLength={20} onChange={(e) => setWindows(shown.map((x, j) => (j === i ? e.target.value : x)))} />
                <Button type="button" variant="ghost" size="icon" aria-label={`Remove delivery time ${i + 1}`} disabled={shown.length === 1} onClick={() => setWindows(shown.filter((_, j) => j !== i))}>
                  <X aria-hidden />
                </Button>
              </div>
            ))}
            <Button type="button" variant="soft" size="sm" className="w-fit" disabled={shown.length >= 6} onClick={() => setWindows([...shown, ""])}>
              <Plus aria-hidden /> Add a time
            </Button>
          </div>
          <FieldDescription>Buyers pick one of these for each delivery.</FieldDescription>
        </FieldSet>
        <div className="grid gap-4 max-sm:gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="ahead">Bookable days ahead</FieldLabel>
            <Input id="ahead" name="ahead" type="number" min={1} max={14} defaultValue={store.deliveryDaysAhead ?? settings.data?.deliveryDaysAhead} />
          </Field>
          <Field>
            <FieldLabel htmlFor="offload">Offloading crew price</FieldLabel>
            <InputGroup>
              <InputGroupAddon>₦</InputGroupAddon>
              <InputGroupInput id="offload" name="offload" inputMode="numeric" defaultValue={store.offloadFee ?? minimum} />
            </InputGroup>
            <FieldDescription>At least {formatNaira(minimum)}.</FieldDescription>
          </Field>
        </div>
        <Field orientation="horizontal">
          <Switch id="pickup" checked={pickup} onCheckedChange={setPickup} />
          <FieldLabel htmlFor="pickup">Let buyers pick up from your warehouse</FieldLabel>
        </Field>
        {pickup && (
          <Field>
            <FieldLabel htmlFor="pickupHours">Pickup hours</FieldLabel>
            <Input id="pickupHours" name="pickupHours" maxLength={80} defaultValue={store.pickupHours} placeholder="e.g. Mon–Sat, 8am–5pm" />
            <FieldDescription>Buyers collect from your warehouse address{store.address ? `: ${store.address}` : ""}. No delivery fee is charged.</FieldDescription>
          </Field>
        )}
        <Button type="submit" className="w-fit" loading={update.isPending}>
          Save delivery settings
        </Button>
      </FieldGroup>
    </form>
  )
}
