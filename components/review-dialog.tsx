"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useReviewJob } from "@/hooks/use-services"
import { cn } from "@/lib/utils"

const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"]

/** Star rating and comment for a pro, after a completed job. */
export function ReviewDialog({ job, proName }: { job: string; proName: string }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const review = useReviewJob()

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!rating) return toast.error("Choose a star rating")
    const text = String(new FormData(e.currentTarget).get("text") ?? "").trim() || undefined
    review.mutate({ job, rating, text }, { onSuccess: () => (toast.success("Thanks. Your review is on their profile."), setOpen(false)) })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Leave a review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Review {proName}</DialogTitle>
            <DialogDescription>Other buyers see this on their profile.</DialogDescription>
          </DialogHeader>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="sr-only">Rating</legend>
            <div className="flex gap-1">
              {labels.map((label, i) => (
                <label key={label} className="cursor-pointer rounded-md p-1 has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
                  <input type="radio" name="rating" value={i + 1} className="sr-only" checked={rating === i + 1} onChange={() => setRating(i + 1)} />
                  <Star aria-hidden className={cn("size-8", i < rating ? "fill-deal text-deal" : "text-muted-foreground/40")} />
                  <span className="sr-only">{label}</span>
                </label>
              ))}
            </div>
            <p className="h-5 text-sm text-muted-foreground" aria-live="polite">
              {rating ? labels[rating - 1] : ""}
            </p>
          </fieldset>
          <div className="flex flex-col gap-2">
            <Label htmlFor="review-text">What was it like? (optional)</Label>
            <Textarea id="review-text" name="text" maxLength={1000} placeholder="Quality, timekeeping, tidiness" />
          </div>
          <DialogFooter>
            <Button type="submit" loading={review.isPending}>
              Post review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
