import type { Metadata } from "next"
import { Suspense } from "react"
import { EditListing } from "@/components/edit-listing"
import { FormSkeleton } from "@/components/skeletons"

export const metadata: Metadata = { title: "Edit product" }

async function Editor({ params }: Pick<PageProps<"/seller/products/[slug]">, "params">) {
  return <EditListing slug={(await params).slug} />
}

export default function EditProductPage({ params }: PageProps<"/seller/products/[slug]">) {
  return (
    <Suspense fallback={<FormSkeleton fields={5} />}>
      <Editor params={params} />
    </Suspense>
  )
}
