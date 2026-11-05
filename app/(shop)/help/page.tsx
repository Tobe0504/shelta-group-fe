import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Help" }

const sections = [
  { id: "ordering", title: "Ordering", body: "Add products to your cart, choose a delivery time for each seller and pay once. Every seller delivers separately and you can track each truck from My orders." },
  { id: "protection", title: "Buyer protection", body: "Your payment is held by SheltaMart and only released to a seller after you confirm their delivery. If something is short, damaged or wrong, report it before confirming and we will resolve it with the seller." },
  { id: "terms", title: "Terms", body: "Prices are set by sellers and confirmed at checkout. Delivery fees depend on your delivery area. Full terms will be published before launch." },
  { id: "contact", title: "Contact", body: "Email support@sheltamart.com or chat with us from any order page. We reply within working hours, Monday to Saturday." },
]

export default function HelpPage() {
  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <PageHeader title="Help" description="How buying, delivery and payments work on SheltaMart." />
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-32 rounded-3xl bg-muted p-6">
            <h2 id={`${s.id}-h`} className="mb-2 text-xl">
              {s.title}
            </h2>
            <p className="leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
