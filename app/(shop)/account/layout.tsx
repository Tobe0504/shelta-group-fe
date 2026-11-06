import { Suspense } from "react"
import { NavTabs } from "@/components/nav-tabs"
import { RequireAuth } from "@/components/require-auth"
import { ListSkeleton } from "@/components/skeletons"

/** Buyer account sections. */
const tabs = [
  { href: "/account", label: "Orders" },
  { href: "/account/jobs", label: "Jobs" },
  { href: "/account/profile", label: "Profile" },
  { href: "/saved", label: "Saved items" },
]

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="container-page flex flex-col gap-6 py-8 max-sm:gap-3 max-sm:py-3">
      <Suspense fallback={<ListSkeleton rows={3} className="h-20" />}>
        <RequireAuth fallback={<ListSkeleton rows={3} className="h-20" />}>
          <NavTabs label="Account" items={tabs} />
          {children}
        </RequireAuth>
      </Suspense>
    </div>
  )
}
