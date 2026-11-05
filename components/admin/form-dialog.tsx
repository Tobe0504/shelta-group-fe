"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { cn } from "@/lib/utils"

/**
 * Dialog wrapping a form. `onSave` gets the form data; the dialog closes and toasts `success` when it resolves.
 * Fields remount each time the dialog opens, so `defaultValue`s always show the current record.
 */
export function FormDialog({
  title,
  description,
  submitLabel = "Save",
  success,
  onSave,
  wide,
  trigger,
  children,
}: {
  title: string
  description?: string
  submitLabel?: string
  success: string
  onSave: (form: FormData) => Promise<unknown>
  wide?: boolean
  trigger: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    try {
      await onSave(new FormData(e.currentTarget))
      setOpen(false)
      toast.success(success)
    } catch {
      // The failed request already showed an error toast; keep the form open to fix it.
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto", wide ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <form onSubmit={submit}>
          <FieldGroup>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            {open && children}
            <DialogFooter>
              <Button type="submit" loading={pending}>
                {submitLabel}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
