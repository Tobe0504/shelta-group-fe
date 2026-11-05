"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMe } from "@/hooks/use-auth"
import { useEnquiry } from "@/hooks/use-forms"
import { MessageDialog } from "./message-dialog"

type Props = Omit<React.ComponentProps<typeof MessageDialog>, "onSend" | "fields"> & { topic: "product" | "estate"; target: string }

/** A message to a seller (about a product) or to the real estate team. Asks guests for their name and phone. */
export function EnquiryDialog({ topic, target, ...props }: Props) {
  const { data: me } = useMe()
  const enquiry = useEnquiry()
  const needsContact = !me?.phone

  return (
    <MessageDialog
      {...props}
      fields={
        needsContact && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="enq-name">Your name</Label>
              <Input id="enq-name" name="name" required autoComplete="name" defaultValue={me?.name} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="enq-phone">Phone or WhatsApp</Label>
              <Input id="enq-phone" name="phone" type="tel" required autoComplete="tel" />
            </div>
          </div>
        )
      }
      onSend={({ reason, message, form }) =>
        enquiry.mutateAsync({ topic, target, reason, message, name: me?.name ?? String(form.get("name")), phone: me?.phone ?? String(form.get("phone")) })
      }
    />
  )
}
