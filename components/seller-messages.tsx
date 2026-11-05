"use client"

import { useSellerEnquiries, useSetEnquiryStatus } from "@/hooks/use-seller"
import { EnquiryInbox } from "./enquiry-inbox"

export function SellerMessages() {
  return (
    <EnquiryInbox
      title="Messages"
      description="Questions buyers send from your product pages and orders. Reply by WhatsApp or phone, then mark them done."
      query={useSellerEnquiries()}
      setStatus={useSetEnquiryStatus()}
    />
  )
}
