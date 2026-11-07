import type { Metadata } from "next"
import { ChatInbox } from "@/components/chat-inbox"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Messages" }

export default function Page() {
  return (
    <>
      <PageHeader title="Messages" description="Chats with buyers about your jobs." />
      <ChatInbox base="/pro/messages" scope="mine" />
    </>
  )
}
