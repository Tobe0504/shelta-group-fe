import Link from "next/link"
import { Button } from "@/components/ui/button"

/** Friendly empty or error panel with an optional call to action. */
export function EmptyState({ children, action }: { children: React.ReactNode; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[28px] bg-muted p-12 text-center">
      <p className="text-lg">{children}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
