"use client"

import { useAdminEnquiries, useSetAdminEnquiryStatus } from "@/hooks/use-admin"
import { EnquiryInbox } from "../enquiry-inbox"

export function AdminEnquiries() {
  return (
    <EnquiryInbox
      title="Property enquiries"
      description="Inspection requests and questions from the real estate pages. Contact the buyer, then pass them to the developer."
      query={useAdminEnquiries()}
      setStatus={useSetAdminEnquiryStatus()}
    />
  )
}
