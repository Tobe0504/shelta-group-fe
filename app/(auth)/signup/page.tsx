import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthHeader } from "@/components/auth-header"
import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = { title: "Create account" }

export default function SignupPage() {
  return (
    <>
      <AuthHeader title="Create your account" description="Buy materials for your projects or sell to builders near you." />
      <Suspense>
        <SignupForm />
      </Suspense>
    </>
  )
}
