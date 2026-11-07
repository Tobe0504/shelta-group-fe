"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { keys } from "@/lib/query-keys"
import { notificationsService } from "@/services/notifications.service"
import { useMe } from "./use-auth"

export function useNotifications() {
  const { data: me } = useMe()
  return useQuery({ queryKey: keys.notifications, queryFn: notificationsService.list, enabled: !!me })
}

export function useMarkNotificationsRead() {
  const client = useQueryClient()
  return useMutation({ mutationFn: (ids?: string[]) => notificationsService.markRead(ids), onSuccess: (list) => client.setQueryData(keys.notifications, list) })
}
