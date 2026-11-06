"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSignIn } from "@/hooks/use-auth"
import { errorMessage } from "@/lib/http"
import { PasswordInput } from "./password-input"
import { useNavigate } from "./navigation-progress"

/** Demo accounts created by the API seed (development only). */
const demoAccounts = [
  { role: "buyer", email: "buyer@example.com" },
  { role: "seller", email: "seller@example.com" },
]
const DEMO_PASSWORD = "Password123!"

export function LoginForm() {
  const { navigate, pending: navigating } = useNavigate()
  const next = useSearchParams().get("next")
  const signIn = useSignIn()

  const submit = (body: { email: string; password: string }) =>
    signIn.mutate(body, { onSuccess: (user) => navigate(next ?? ({ seller: "/seller", admin: "/admin", buyer: "/" } as const)[user.role]) })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        submit({ email: String(f.get("email")), password: String(f.get("password")) })
      }}
    >
      <FieldGroup>
        {signIn.isError && <FieldError role="alert">{errorMessage(signIn.error)}</FieldError>}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" name="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit" size="lg" loading={signIn.isPending || navigating}>
          Sign in
        </Button>
        <FieldSeparator>Or try a demo account</FieldSeparator>
        <div className="grid grid-cols-2 gap-3">
          {demoAccounts.map((u) => (
            <Button key={u.email} type="button" variant="secondary" disabled={signIn.isPending} onClick={() => submit({ email: u.email, password: DEMO_PASSWORD })}>
              Demo {u.role}
            </Button>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          New to SheltaMart?{" "}
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </FieldGroup>
    </form>
  )
}
