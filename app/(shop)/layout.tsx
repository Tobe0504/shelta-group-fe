import { SiteHeader } from "@/components/site-header"

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex min-h-0 flex-1 flex-col">
        {children}
      </main>
    </>
  )
}
