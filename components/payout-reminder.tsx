import Link from "next/link"
import { Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatNaira } from "@/lib/format"

/** Shown when money is waiting but there's no bank account to send it to. Adding one pays it straight away. */
export function PayoutReminder({ amount, href }: { amount: number; href: string }) {
  if (amount <= 0) return null
  return (
    <p role="status" className="flex flex-wrap items-center gap-3 rounded-3xl bg-deal-soft p-5 text-deal-soft-foreground max-sm:gap-2 max-sm:rounded-2xl max-sm:p-3 max-sm:text-sm">
      <Landmark aria-hidden className="size-5 shrink-0" />
      <span className="flex-1">
        <strong className="font-semibold">{formatNaira(amount)} is waiting for you.</strong> Add your bank account and it’s sent straight away.
      </span>
      <Button asChild variant="outline" size="sm" className="border-0">
        <Link href={href}>Add bank account</Link>
      </Button>
    </p>
  )
}
