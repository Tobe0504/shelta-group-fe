import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

/** A selectable card for use inside a shadcn RadioGroup. Styles itself from the radio's checked state. */
export function ChoiceCard({
  value,
  id,
  hideRadio,
  className,
  children,
}: {
  value: string
  id: string
  hideRadio?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-transparent bg-muted p-4 font-normal",
        "has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-accent",
        className,
      )}
    >
      <RadioGroupItem id={id} value={value} className={cn("mt-0.5", hideRadio && "sr-only")} />
      {children}
    </Label>
  )
}
