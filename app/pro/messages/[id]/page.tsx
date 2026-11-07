import type { Metadata } from "next"
import { ChatInbox } from "@/components/chat-inbox"

export const metadata: Metadata = { title: "Messages" }

export default async function Page({ params }: PageProps<"/pro/messages/[id]">) {
  return <ChatInbox base="/pro/messages" scope="mine" activeId={(await params).id} />
}
