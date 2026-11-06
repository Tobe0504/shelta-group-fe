import type { Metadata } from "next"
import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { JobForm } from "@/components/job-form"
import { PageHeader } from "@/components/page-header"
import { RequireAuth } from "@/components/require-auth"
import { FormSkeleton } from "@/components/skeletons"
import { load } from "@/lib/server-data"
import { catalogService } from "@/services/catalog.service"
import { prosService } from "@/services/pros.service"

export const metadata: Metadata = { title: "Post a job" }

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

async function Form({ searchParams }: Pick<PageProps<"/services/request">, "searchParams">) {
  const params = await searchParams
  const proSlug = first(params.pro)
  const [trades, pro] = await load(() => Promise.all([catalogService.departments("services"), proSlug ? prosService.get(proSlug).catch(() => null) : null]))
  return (
    <>
      <PageHeader
        title={pro ? `Request a quote from ${pro.name}` : "Post a job"}
        description={pro ? `${pro.name} will see your job and reply with a price. Your phone number is shared only if you hire them.` : "Pros in this trade who cover your site will send quotes. Compare them in My jobs and hire the one you like."}
      />
      <Card className="px-5 py-6 max-sm:px-3 max-sm:py-3.5 sm:px-8">
        <RequireAuth fallback={<FormSkeleton fields={6} />}>
          <JobForm trades={trades} initialTrade={first(params.trade)} pro={pro ? { slug: pro.slug, name: pro.name } : undefined} />
        </RequireAuth>
      </Card>
    </>
  )
}

export default function PostJobPage({ searchParams }: PageProps<"/services/request">) {
  return (
    <div className="container-page flex max-w-3xl flex-col gap-8 py-8 max-sm:gap-3 max-sm:py-3">
      <Suspense fallback={<FormSkeleton fields={6} />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
