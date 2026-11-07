import type { Metadata } from "next"
import { ChatInbox } from "@/components/chat-inbox"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Help desk" }

export default function Page() {
  return (
    <>
      <PageHeader title="Help desk" description="Questions from buyers, sellers and pros. Replies go out as SheltaMart support." />
      <ChatInbox base="/admin/support" scope="support" team />
    </>
  )
}
