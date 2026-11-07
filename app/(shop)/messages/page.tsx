import type { Metadata } from "next"
import { Suspense } from "react"
import { ChatInbox } from "@/components/chat-inbox"
import { PageHeader } from "@/components/page-header"
import { RequireAuth } from "@/components/require-auth"
import { ListSkeleton } from "@/components/skeletons"

export const metadata: Metadata = { title: "Messages" }

export default function MessagesPage() {
  return (
    <div className="container-page flex min-h-0 flex-1 flex-col gap-4 py-6 max-sm:gap-2 max-sm:py-3">
      <PageHeader title="Messages" description="Chats with sellers, pros and SheltaMart support." />
      <Suspense fallback={<ListSkeleton rows={4} className="h-16" />}>
        <RequireAuth fallback={<ListSkeleton rows={4} className="h-16" />}>
          <ChatInbox base="/messages" />
        </RequireAuth>
      </Suspense>
    </div>
  )
}
