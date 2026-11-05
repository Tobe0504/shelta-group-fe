"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useMe } from "@/hooks/use-auth"
import { useRequestQuote, useUpload } from "@/hooks/use-forms"
import { errorMessage, fieldErrors } from "@/lib/http"
import { cn } from "@/lib/utils"

type QuoteField = { name: string; label: string; type?: "text" | "tel" | "email" | "textarea"; placeholder?: string; required?: boolean; wide?: boolean }

const fields: QuoteField[] = [
  { name: "items", label: "Or list what you need", type: "textarea", placeholder: "e.g. 600 bags of 42.5R cement, 3 tonnes of Y12 rods…", wide: true },
  { name: "site", label: "Delivery site", placeholder: "Area and city", required: true },
  { name: "neededBy", label: "Needed by", placeholder: "e.g. next Friday" },
  { name: "name", label: "Your name", required: true },
  { name: "phone", label: "Phone or WhatsApp", type: "tel", required: true },
]

/** Request-for-quote form. The bill of quantities uploads straight to storage before the request is sent. */
export function QuoteForm() {
  const { data: me } = useMe()
  const upload = useUpload("quote")
  const quote = useRequestQuote()
  const errors = fieldErrors(quote.error)
  const pending = upload.isPending || quote.isPending
  const defaults: Record<string, string | undefined> = { name: me?.name, phone: me?.phone }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const text = (k: string) => String(f.get(k) ?? "").trim() || undefined
    const file = f.get("boq")
    try {
      const files = file instanceof File && file.size ? [await upload.mutateAsync(file)] : []
      await quote.mutateAsync({ name: text("name")!, phone: text("phone")!, site: text("site")!, neededBy: text("neededBy"), items: text("items"), files })
      form.reset()
      toast.success("Request sent. Quotes will arrive by SMS and WhatsApp.")
    } catch (err) {
      if (upload.isError) toast.error(err instanceof Error ? err.message : errorMessage(err))
    }
  }

  return (
    <form onSubmit={submit}>
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="q-boq">
            Bill of quantities <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Input id="q-boq" name="boq" type="file" accept=".pdf,.xls,.xlsx,.csv,image/*" className="h-auto py-3" aria-describedby="q-boq-hint" />
          <FieldDescription id="q-boq-hint">PDF, Excel or a photo, up to 20 MB</FieldDescription>
        </Field>
        {fields.map(({ name, label, type = "text", placeholder, required, wide }) => {
          const props = { id: `q-${name}`, name, placeholder, required, defaultValue: defaults[name], "aria-invalid": !!errors[name] }
          return (
            <Field key={name} data-invalid={!!errors[name]} className={cn((wide || type === "textarea") && "sm:col-span-2")}>
              <FieldLabel htmlFor={props.id}>
                {label}
                {!required && <span className="font-normal text-muted-foreground"> (optional)</span>}
              </FieldLabel>
              {type === "textarea" ? <Textarea {...props} className="min-h-32" /> : <Input {...props} type={type} />}
              <FieldError>{errors[name]}</FieldError>
            </Field>
          )
        })}
        <Button type="submit" size="lg" className="w-fit sm:col-span-2" loading={pending}>
          Send to suppliers
        </Button>
      </FieldGroup>
    </form>
  )
}
