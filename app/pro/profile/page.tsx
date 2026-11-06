import type { Metadata } from "next"
import { ProProfileForm } from "@/components/pro-profile-form"

export const metadata: Metadata = { title: "Pro profile" }

export default function Page() {
  return <ProProfileForm />
}
