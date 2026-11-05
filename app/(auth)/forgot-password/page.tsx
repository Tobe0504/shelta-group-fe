import type { Metadata } from "next"
import { AuthHeader } from "@/components/auth-header"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export const metadata: Metadata = { title: "Reset password" }

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader title="Reset your password" description="Enter the email you signed up with and we’ll send you a reset link." />
      <ForgotPasswordForm />
    </>
  )
}
