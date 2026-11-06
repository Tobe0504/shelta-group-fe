"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { HardHat, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { RadioGroup } from "@/components/ui/radio-group"
import { useSignUp } from "@/hooks/use-auth"
import { errorMessage, fieldErrors } from "@/lib/http"
import type { SignUpInput } from "@/services/auth.service"
import { ChoiceCard } from "./choice-card"
import { PasswordInput } from "./password-input"
import { useNavigate } from "./navigation-progress"

type Role = SignUpInput["role"]

const roles = [
  { value: "buyer", icon: HardHat, title: "I’m buying", text: "For a project or business" },
  { value: "seller", icon: Store, title: "I’m selling", text: "List products and get orders" },
] as const

const strength = (pw: string) => [pw.length >= 8, /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length
const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"]

export function SignupForm() {
  const { navigate, pending: navigating } = useNavigate()
  const params = useSearchParams()
  const signUp = useSignUp()
  const [role, setRole] = useState<Role>(params.get("role") === "seller" ? "seller" : "buyer")
  const [password, setPassword] = useState("")
  const score = strength(password)
  const errors = fieldErrors(signUp.error)
  const fieldError = (name: string) => errors[name] && <FieldError>{errors[name]}</FieldError>

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const get = (k: string) => String(f.get(k) ?? "")
        signUp.mutate(
          { name: get("name"), email: get("email"), phone: get("phone"), password: get("password"), role, business: role === "seller" ? get("business") : undefined },
          { onSuccess: () => navigate(params.get("next") ?? (role === "seller" ? "/seller" : "/")) },
        )
      }}
    >
      <FieldGroup>
        {signUp.isError && !Object.keys(errors).length && <FieldError role="alert">{errorMessage(signUp.error)}</FieldError>}
        <RadioGroup value={role} onValueChange={(v) => setRole(v as Role)} aria-label="Account type" className="grid grid-cols-2 gap-3">
          {roles.map(({ value, icon: Icon, title, text }) => (
            <ChoiceCard key={value} id={`role-${value}`} value={value} hideRadio className="flex-col gap-2">
              <Icon aria-hidden className="size-6 text-primary" />
              <span className="flex flex-col">
                <span className="font-semibold">{title}</span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </span>
            </ChoiceCard>
          ))}
        </RadioGroup>
        <Field>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input id="name" name="name" autoComplete="name" required />
            {fieldError("name")}
        </Field>
        {role === "seller" && (
          <Field>
            <FieldLabel htmlFor="business">Business name</FieldLabel>
            <Input id="business" name="business" autoComplete="organization" required />
            {fieldError("business")}
          </Field>
        )}
        <div className="grid gap-4 max-sm:gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" required />
            {fieldError("email")}
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" required placeholder="0803 000 0000" />
            {fieldError("phone")}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-help"
          />
          <Progress value={score * 25} aria-label="Password strength" className="h-1.5" />
          <FieldDescription id="password-help">
            {password ? strengthLabel[score] : "At least 8 characters"} · use upper case, a number and a symbol
          </FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="terms" name="terms" required />
          <FieldLabel htmlFor="terms" className="font-medium">
            I agree to the terms and buyer protection policy
          </FieldLabel>
        </Field>
        <Button type="submit" size="lg" loading={signUp.isPending || navigating}>
          {role === "seller" ? "Create seller account" : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </FieldGroup>
    </form>
  )
}
