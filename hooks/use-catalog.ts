"use client"

import { useQuery } from "@tanstack/react-query"
import { keys } from "@/lib/query-keys"
import type { DepartmentKind } from "@/lib/types"
import { catalogService } from "@/services/catalog.service"

const DAY = 24 * 60 * 60 * 1000

/** Product departments by default; `services` for trades, `all` for the admin catalogue. */
export const useDepartments = (kind: DepartmentKind | "all" = "products") =>
  useQuery({ queryKey: keys.departments(kind), queryFn: () => catalogService.departments(kind), staleTime: DAY })
export const useSettings = () => useQuery({ queryKey: keys.settings, queryFn: catalogService.settings, staleTime: 5 * 60_000 })
