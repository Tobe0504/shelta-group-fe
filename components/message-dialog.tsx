"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ChoiceCard } from "./choice-card"

export type MessageValues = { reason?: string; message: string; form: FormData }

/** Dialog with an optional reason picker and a message box. Used for chat, problem reports and enquiries. */
export function MessageDialog({
  title,
  description,
  reasons,
  placeholder = "Write your message",
  submitLabel = "Send",
  success,
  fields,
  onSend,
  children,
}: {
  title: string
  description?: string
  reasons?: string[]
  placeholder?: string
  submitLabel?: string
  success: string
  /** Extra inputs rendered above the message (e.g. name and phone for guests). */
  fields?: React.ReactNode
  onSend: (values: MessageValues) => Promise<unknown>
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setPending(true)
    try {
      await onSend({ reason: form.get("reason")?.toString(), message: String(form.get("message")), form })
      setOpen(false)
      toast.success(success)
    } catch {
      // The failed request already showed an error toast; keep the dialog open to retry.
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {reasons && (
            <RadioGroup name="reason" defaultValue={reasons[0]} aria-label="Reason" className="flex flex-wrap gap-2">
              {reasons.map((r, i) => (
                <ChoiceCard key={r} id={`reason-${i}`} value={r} hideRadio className="rounded-full px-4 py-2 text-sm">
                  {r}
                </ChoiceCard>
              ))}
            </RadioGroup>
          )}
          {fields}
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" required placeholder={placeholder} className="min-h-28" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
