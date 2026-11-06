"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToggleSaved } from "@/hooks/use-account"
import { cn } from "@/lib/utils"

export function SaveButton({ productId, label, size = "icon", className }: { productId: string; label: string; size?: "icon" | "icon-sm"; className?: string }) {
  const { saved, toggle, isPending } = useToggleSaved(productId)
  return (
    <Button
      variant="outline"
      size={size}
      aria-label={`Save ${label}`}
      aria-pressed={saved}
      disabled={isPending}
      onClick={toggle}
      className={cn("border-0 bg-background", className)}
    >
      <Heart aria-hidden className={cn(saved && "fill-deal text-deal")} />
    </Button>
  )
}
