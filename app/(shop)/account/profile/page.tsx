import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { ProfileForm } from "@/components/profile-form"

export const metadata: Metadata = { title: "Profile" }

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="Your details, photo and notification settings." />
      <ProfileForm />
    </>
  )
}
