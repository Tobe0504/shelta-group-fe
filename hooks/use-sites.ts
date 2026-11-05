"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { keys } from "@/lib/query-keys"
import type { Site } from "@/lib/types"
import { sitesService } from "@/services/sites.service"

export const useSites = (enabled = true) => useQuery({ queryKey: keys.sites, queryFn: sitesService.list, enabled })

export function useCreateSite() {
  const client = useQueryClient()
  return useMutation({ mutationFn: sitesService.create, onSuccess: (site) => client.setQueryData<Site[]>(keys.sites, (sites = []) => [site, ...sites]) })
}
