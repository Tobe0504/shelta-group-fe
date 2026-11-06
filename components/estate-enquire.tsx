import { Button } from "@/components/ui/button"
import type { Estate } from "@/lib/types"
import { EnquiryDialog } from "./enquiry-dialog"

/** "Enquire" for a property, with reasons that suit its type. */
export function EstateEnquire({ estate, children }: { estate: Estate; children?: React.ReactNode }) {
  return (
    <EnquiryDialog
      topic="estate"
      target={estate.slug}
      title={`Enquire about ${estate.name}`}
      description={`${estate.area}, ${estate.city}`}
      reasons={estate.kind === "Short-let" ? ["Check dates", "Group booking", "Amenities"] : ["Book an inspection", "Payment plans", "Documents"]}
      placeholder="Your question for the developer"
      submitLabel="Send enquiry"
      success="Enquiry sent. The developer will contact you."
    >
      {children ?? <Button>Enquire</Button>}
    </EnquiryDialog>
  )
}
