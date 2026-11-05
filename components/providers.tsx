"use client"

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { errorMessage } from "@/lib/http"

declare module "@tanstack/react-query" {
  interface Register {
    /** Set `meta: { silent: true }` on a mutation that shows its own error UI. */
    mutationMeta: { silent?: boolean }
  }
}

const makeClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Don't retry 4xx responses: they won't succeed on a second try.
        retry: (count, error) => count < 2 && !/^4/.test(String((error as { status?: number }).status ?? "")),
      },
    },
    mutationCache: new MutationCache({ onError: (error, _v, _c, mutation) => void (!mutation.meta?.silent && toast.error(errorMessage(error))) }),
  })

let browserClient: QueryClient | undefined
// A fresh client per server render; one shared client in the browser.
const getClient = () => (typeof window === "undefined" ? makeClient() : (browserClient ??= makeClient()))

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getClient()}>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster position="bottom-center" />
    </QueryClientProvider>
  )
}
