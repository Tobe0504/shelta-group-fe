import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthHeader } from "@/components/auth-header"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = { title: "Sign in" }

export default function LoginPage() {
  return (
    <>
      <AuthHeader title="Welcome back" description="Sign in to track orders, reorder and manage your sites." />
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  )
}
