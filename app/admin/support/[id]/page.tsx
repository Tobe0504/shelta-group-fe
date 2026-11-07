import type { Metadata } from "next"
import { ChatInbox } from "@/components/chat-inbox"

export const metadata: Metadata = { title: "Help desk" }

export default async function Page({ params }: PageProps<"/admin/support/[id]">) {
  return <ChatInbox base="/admin/support" scope="support" activeId={(await params).id} team />
}
