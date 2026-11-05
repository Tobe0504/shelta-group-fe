import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] })

export const metadata: Metadata = {
  title: { default: "SheltaMart — Building materials delivered", template: "%s · SheltaMart" },
  description: "Buy cement, iron rods, roofing and more from verified suppliers near your site.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
