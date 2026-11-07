"use client"

import { Suspense } from "react"
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { NavigationProgress } from "./navigation-progress"
import { RealtimeBridge } from "./realtime-bridge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { errorMessage } from "@/lib/http"

declare module "@tanstack/react-query" {
  interface Register {
    /**
     * `silent`: the mutation shows its own error UI.
     * `pending`: text for a loading toast, for actions with no button to show a spinner on (switches, menus, steppers).
     */
    mutationMeta: { silent?: boolean; pending?: string }
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
    mutationCache: new MutationCache({
      onMutate: (_v, mutation) => void (mutation.meta?.pending && toast.loading(mutation.meta.pending, { id: `m-${mutation.mutationId}` })),
      onSettled: (_d, _e, _v, _c, mutation) => void (mutation.meta?.pending && toast.dismiss(`m-${mutation.mutationId}`)),
      onError: (error, _v, _c, mutation) => void (!mutation.meta?.silent && toast.error(errorMessage(error))),
    }),
  })

let browserClient: QueryClient | undefined
// A fresh client per server render; one shared client in the browser.
const getClient = () => (typeof window === "undefined" ? makeClient() : (browserClient ??= makeClient()))

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getClient()}>
      <TooltipProvider>
        <NavigationProgress>
          <Suspense>
            <RealtimeBridge />
          </Suspense>
          {children}
        </NavigationProgress>
      </TooltipProvider>
      <Toaster position="bottom-center" />
    </QueryClientProvider>
  )
}
