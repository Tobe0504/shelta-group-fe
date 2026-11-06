import Link from "next/link"
import { Logo } from "./logo"

const groups = [
  { title: "Shop", links: [{ label: "Deals", href: "/search?deals=1" }, { label: "All products", href: "/search" }, { label: "Hire a pro", href: "/services" }, { label: "Request a quote", href: "/quote" }, { label: "Real estate", href: "/real-estate" }] },
  { title: "Account", links: [{ label: "My orders", href: "/account" }, { label: "My jobs", href: "/account/jobs" }, { label: "Saved items", href: "/saved" }, { label: "Cart", href: "/cart" }] },
  { title: "Company", links: [{ label: "Sell on SheltaMart", href: "/sell" }, { label: "Offer your services", href: "/pro/profile" }, { label: "Buyer protection", href: "/help#protection" }, { label: "Help", href: "/help" }, { label: "Contact", href: "/help#contact" }] },
]

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t bg-muted/60 max-sm:mt-6">
      <div className="container-page grid grid-cols-3 gap-8 py-10 max-sm:gap-x-3 max-sm:gap-y-4 max-sm:py-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-3 flex flex-col gap-3 max-sm:gap-1 sm:col-span-1">
          <Logo />
          <p className="text-sm text-muted-foreground max-sm:text-xs">Building materials from verified suppliers, delivered to your site.</p>
        </div>
        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title} className="flex flex-col gap-1 text-sm max-sm:gap-0 max-sm:text-xs">
            <h2 className="mb-1 text-sm max-sm:text-xs">{g.title}</h2>
            {g.links.map((l) => (
              <Link key={l.href} href={l.href} className="py-1.5 text-muted-foreground hover:text-foreground max-sm:py-1">
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <p className="container-page border-t py-5 text-sm text-muted-foreground max-sm:py-3 max-sm:text-xs">© 2026 SheltaMart.com</p>
    </footer>
  )
}
