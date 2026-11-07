"use client"

import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUnreadChats } from "@/hooks/use-conversations"
import { useSellerEnquiries, useSetEnquiryStatus } from "@/hooks/use-seller"
import { ChatInbox } from "./chat-inbox"
import { EnquiryInbox } from "./enquiry-inbox"
import { PageHeader } from "./page-header"

/** Live chats with buyers, plus the older one-off questions sent before chat existed. */
export function SellerMessages() {
  const unread = useUnreadChats().data?.mine ?? 0
  const enquiries = useSellerEnquiries()
  const waiting = enquiries.data?.data.filter((e) => e.status === "new").length ?? 0
  return (
    <>
      <PageHeader title="Messages" description="Chats with buyers about your products and orders." />
      <Tabs defaultValue="chats" className="min-h-0 flex-1 gap-4">
        <TabsList>
          <TabsTrigger value="chats">Chats {unread > 0 && <TabsCount>{unread}</TabsCount>}</TabsTrigger>
          <TabsTrigger value="enquiries">Older questions {waiting > 0 && <TabsCount>{waiting}</TabsCount>}</TabsTrigger>
        </TabsList>
        <TabsContent value="chats" className="flex min-h-0 flex-col">
          <ChatInbox base="/seller/messages" />
        </TabsContent>
        <TabsContent value="enquiries">
          <EnquiryInbox title="" description="" query={enquiries} setStatus={useSetEnquiryStatus()} />
        </TabsContent>
      </Tabs>
    </>
  )
}
