import Link from "next/link"
import { Logo } from "./logo"

const groups = [
  { title: "Shop", links: [{ label: "Deals", href: "/search?deals=1" }, { label: "All products", href: "/search" }, { label: "Request a quote", href: "/quote" }, { label: "Real estate", href: "/real-estate" }] },
  { title: "Account", links: [{ label: "My orders", href: "/account" }, { label: "Saved items", href: "/saved" }, { label: "Cart", href: "/cart" }] },
  { title: "Company", links: [{ label: "Sell on SheltaMart", href: "/sell" }, { label: "Buyer protection", href: "/help#protection" }, { label: "Help", href: "/help" }, { label: "Contact", href: "/help#contact" }] },
]

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t bg-muted/60">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm text-muted-foreground">Building materials from verified suppliers, delivered to your site.</p>
        </div>
        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title} className="flex flex-col gap-1 text-sm">
            <h2 className="mb-1 text-sm">{g.title}</h2>
            {g.links.map((l) => (
              <Link key={l.href} href={l.href} className="py-1.5 text-muted-foreground hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <p className="container-page border-t py-5 text-sm text-muted-foreground">© 2026 SheltaMart.com</p>
    </footer>
  )
}
