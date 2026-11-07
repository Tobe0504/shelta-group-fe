import type { Metadata } from "next"
import Link from "next/link"
import { CreditCard, Hammer, Headset, Mail, MessageCircle, Store, Truck, UserRound } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
import { StartChat } from "@/components/start-chat"
import { tones } from "@/lib/tones"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Help & support", description: "Answers to common questions, and a chat with the SheltaMart team." }

const topics = [
  { icon: Truck, tone: "blue", title: "Orders and delivery", hint: "Late, short or damaged deliveries, pickup, changing times" },
  { icon: CreditCard, tone: "mint", title: "Payments and refunds", hint: "Payment failed, refunds, escrow" },
  { icon: Hammer, tone: "peach", title: "Services and pros", hint: "Quotes, hiring, paying in stages" },
  { icon: Store, tone: "lilac", title: "Selling on SheltaMart", hint: "Listings, orders, payouts" },
  { icon: UserRound, tone: "yellow", title: "My account", hint: "Sign-in, phone number, sites" },
] as const

const faqs = [
  { id: "protection", q: "How is my money protected?", a: "You pay SheltaMart, not the seller or pro. We hold the money until you confirm a delivery (or release a job stage). If something is short, damaged or wrong, report it before confirming and our team settles it, including refunds." },
  { id: "ordering", q: "How do delivery and pickup work?", a: "Each seller delivers separately at a time you choose from their schedule, priced by distance from their warehouse to your site. Some sellers let you collect instead, with no delivery fee. Track everything from My orders." },
  { id: "change", q: "Can I change my delivery or pickup time?", a: "Yes, until the seller loads your order. Open the order and choose “Change delivery time”." },
  { id: "refunds", q: "How long do refunds take?", a: "Refunds go back to the card or account you paid with, usually within 3 to 5 working days once started." },
  { id: "pros", q: "How do I hire a pro?", a: "Post a job (or ask one pro directly) and compare quotes. After you hire, you pay each stage into escrow and release it when that part of the work is done." },
  { id: "payouts", q: "When do sellers and pros get paid?", a: "When the buyer confirms a delivery or releases a stage, minus SheltaMart’s commission. Add a bank account in your settings; anything waiting is sent as soon as you do." },
  { id: "terms", q: "Terms", a: "Prices are set by sellers and pros and confirmed at checkout. Full terms will be published before launch." },
]

export default function HelpPage() {
  return (
    <div className="container-page flex flex-col gap-10 py-8 max-sm:gap-5 max-sm:py-3">
      <PageHeader title="Help & support" description="Find a quick answer, or chat with the SheltaMart team. We reply within working hours, Monday to Saturday.">
        <Button asChild variant="secondary" className="max-sm:w-full">
          <Link href="/messages">
            <MessageCircle aria-hidden /> My conversations
          </Link>
        </Button>
      </PageHeader>

      <Section title="Chat with us">
        <ul className="grid gap-3 max-sm:gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ icon: Icon, tone, title, hint }) => (
            <li key={title}>
              <StartChat to={{ support: true }} subject={title} title={title} description="Tell us what happened. Include an order number or job if it’s about one." placeholder="How can we help?">
                <button type="button" className="flex h-full w-full items-start gap-3 rounded-3xl p-4 text-left ring-1 ring-border transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none max-sm:gap-2.5 max-sm:rounded-2xl max-sm:p-3">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl max-sm:size-9", tones[tone].bg)}>
                    <Icon aria-hidden className={cn("size-5", tones[tone].fg)} />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium max-sm:text-sm">{title}</span>
                    <span className="text-sm text-muted-foreground max-sm:text-xs">{hint}</span>
                  </span>
                </button>
              </StartChat>
            </li>
          ))}
          <li>
            <StartChat to={{ support: true }} subject="Something else" title="Something else" placeholder="How can we help?">
              <button type="button" className="flex h-full w-full items-center gap-3 rounded-3xl bg-primary p-4 text-left text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none max-sm:gap-2.5 max-sm:rounded-2xl max-sm:p-3">
                <Headset aria-hidden className="size-6 shrink-0" />
                <span className="flex flex-col">
                  <span className="font-medium max-sm:text-sm">Something else</span>
                  <span className="text-sm opacity-80 max-sm:text-xs">Start a chat with our team</span>
                </span>
              </button>
            </StartChat>
          </li>
        </ul>
      </Section>

      <Section title="Common questions">
        <Accordion type="single" collapsible className="rounded-3xl px-5 ring-1 ring-border max-sm:rounded-2xl max-sm:px-3">
          {faqs.map((f) => (
            <AccordionItem key={f.id} value={f.id} id={f.id} className="scroll-mt-32">
              <AccordionTrigger className="text-base max-sm:text-sm">{f.q}</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground max-sm:text-sm">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <p id="contact" className="flex items-center gap-2 text-sm text-muted-foreground max-sm:text-xs">
        <Mail aria-hidden className="size-4" /> Prefer email? Write to{" "}
        <a href="mailto:support@sheltamart.com" className="text-primary hover:underline">
          support@sheltamart.com
        </a>
      </p>
    </div>
  )
}
