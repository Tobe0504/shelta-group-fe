"use client"

import { useQuery } from "@tanstack/react-query"
import { keys } from "@/lib/query-keys"
import { catalogService } from "@/services/catalog.service"

const DAY = 24 * 60 * 60 * 1000

export const useDepartments = () => useQuery({ queryKey: keys.departments, queryFn: catalogService.departments, staleTime: DAY })
export const useSettings = () => useQuery({ queryKey: keys.settings, queryFn: catalogService.settings, staleTime: 5 * 60_000 })
