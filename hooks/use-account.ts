"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { keys } from "@/lib/query-keys"
import type { User } from "@/lib/types"
import { accountService } from "@/services/account.service"
import { useMe } from "./use-auth"

export function useUpdateProfile() {
  const client = useQueryClient()
  return useMutation({ mutationFn: accountService.update, onSuccess: (user) => client.setQueryData(keys.me, user) })
}

export const useChangePassword = () => useMutation({ mutationFn: accountService.changePassword, meta: { silent: true } })

export function useSaved() {
  const { data: me } = useMe()
  return useQuery({ queryKey: keys.saved, queryFn: accountService.saved, enabled: !!me })
}

/** Whether a product is saved, and a toggle that sends signed-out buyers to sign in. */
export function useToggleSaved(productId: string) {
  const client = useQueryClient()
  const router = useRouter()
  const path = usePathname()
  const { data: me } = useMe()
  const saved = me?.saved.includes(productId) ?? false

  const mutation = useMutation({
    mutationFn: () => (saved ? accountService.unsave(productId) : accountService.save(productId)),
    meta: { pending: saved ? "Removing…" : "Saving…" },
    onSuccess: (products) => {
      client.setQueryData(keys.saved, products)
      client.setQueryData<User | null>(keys.me, (u) => u && { ...u, saved: products.map((p) => p.id) })
      toast(saved ? "Removed from saved items" : "Saved for later", saved ? undefined : { action: { label: "View saved", onClick: () => router.push("/saved") } })
    },
  })

  const toggle = () => {
    if (!me) {
      toast("Sign in to save items")
      return router.push(`/login?next=${encodeURIComponent(path)}`)
    }
    mutation.mutate()
  }
  return { saved, toggle, isPending: mutation.isPending }
}
