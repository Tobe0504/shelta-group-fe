"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { keys } from "@/lib/query-keys"
import type { User } from "@/lib/types"
import { authService } from "@/services/auth.service"
import { useHydrated } from "./use-hydrated"

/**
 * The signed-in user. Reports pending while hydrating: the server never knows who is signed in, so
 * user-dependent UI must render its signed-out/loading state until hydration finishes.
 */
export function useMe() {
  const hydrated = useHydrated()
  const query = useQuery({ queryKey: keys.me, queryFn: authService.me, staleTime: 5 * 60_000 })
  return hydrated ? query : ({ ...query, data: undefined, isPending: true, status: "pending" } as unknown as typeof query)
}

/** Stores the signed-in user and drops anything cached for the previous session. */
function useOnSignedIn() {
  const client = useQueryClient()
  return (user: User) => {
    client.removeQueries({ queryKey: keys.cart })
    client.removeQueries({ queryKey: keys.seller.all })
    client.removeQueries({ queryKey: keys.admin.all })
    client.setQueryData(keys.me, user)
    toast.success(`Welcome, ${user.name.split(" ")[0]}`)
  }
}

export const useSignIn = () => useMutation({ mutationFn: authService.signIn, onSuccess: useOnSignedIn(), meta: { silent: true } })
export const useSignUp = () => useMutation({ mutationFn: authService.signUp, onSuccess: useOnSignedIn(), meta: { silent: true } })
export const useForgotPassword = () => useMutation({ mutationFn: authService.forgotPassword })

export function useSignOut() {
  const client = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: authService.signOut,
    onSettled: () => {
      client.setQueryData(keys.me, null)
      ;[keys.cart, keys.saved, keys.sites, keys.orders, keys.seller.all, keys.admin.all].forEach((queryKey) => client.removeQueries({ queryKey }))
      toast("You’ve signed out")
      router.push("/")
    },
  })
}
