"use client"

import Link from "next/link"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Shown when a page can't load, usually because the API is still starting up. */
export function AppError({ retry }: { retry: () => void }) {
  return (
    <div role="alert" className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">
        <RefreshCw aria-hidden className="size-6" />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-2xl max-sm:text-lg">We’re having trouble loading this</h1>
        <p className="text-muted-foreground">SheltaMart may still be starting up. Give it a moment, then try again.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={retry}>Try again</Button>
        <Button asChild variant="secondary">
          <Link href="/">Go to home</Link>
        </Button>
      </div>
    </div>
  )
}
