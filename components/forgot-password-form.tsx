"use client"

import Link from "next/link"
import { useState } from "react"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForgotPassword } from "@/hooks/use-auth"

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const forgot = useForgotPassword()
  const send = (email: string) => forgot.mutate(email, { onSuccess: () => setSentTo(email) })

  if (sentTo)
    return (
      <div role="status" className="flex flex-col gap-5">
        <span className="grid size-14 place-items-center rounded-2xl bg-success-soft text-success">
          <MailCheck aria-hidden className="size-7" />
        </span>
        <p>
          If an account exists for <strong className="font-semibold">{sentTo}</strong>, a reset link is on its way. It expires in an hour.
        </p>
        <Button variant="secondary" loading={forgot.isPending} onClick={() => send(sentTo)}>
          Resend link
        </Button>
        <Button asChild variant="ghost">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        send(String(new FormData(e.currentTarget).get("email")))
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
        </Field>
        <Button type="submit" size="lg" loading={forgot.isPending}>
          Send reset link
        </Button>
        <Button asChild variant="ghost">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </FieldGroup>
    </form>
  )
}
