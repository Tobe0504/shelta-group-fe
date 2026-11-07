import type { Metadata } from "next"
import { Suspense } from "react"
import { ChatInbox } from "@/components/chat-inbox"
import { RequireAuth } from "@/components/require-auth"
import { ListSkeleton } from "@/components/skeletons"

export const metadata: Metadata = { title: "Messages" }

async function Thread({ params }: Pick<PageProps<"/messages/[id]">, "params">) {
  return <ChatInbox base="/messages" activeId={(await params).id} />
}

export default function ThreadPage({ params }: PageProps<"/messages/[id]">) {
  const fallback = <ListSkeleton rows={4} className="h-16" />
  return (
    <div className="container-page flex min-h-0 flex-1 flex-col py-6 max-sm:py-3">
      <Suspense fallback={fallback}>
        <RequireAuth fallback={fallback}>
          <Thread params={params} />
        </RequireAuth>
      </Suspense>
    </div>
  )
}
