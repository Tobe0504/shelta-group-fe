import type { Metadata } from "next"
import { Suspense } from "react"
import { OrderView } from "@/components/order-view"
import { SplitSkeleton } from "@/components/skeletons"

export const metadata: Metadata = { title: "Order tracking" }

async function Order({ params }: Pick<PageProps<"/orders/[id]">, "params">) {
  return <OrderView number={(await params).id} />
}

export default function OrderPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <div className="container-page py-8 max-sm:py-3">
      <Suspense fallback={<SplitSkeleton />}>
        <Order params={params} />
      </Suspense>
    </div>
  )
}
