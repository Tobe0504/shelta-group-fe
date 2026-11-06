import type { Category, Department } from "./types"

/** Every trade across the service departments. */
export const allTrades = (departments: Department[]): Category[] => departments.flatMap((d) => d.categories)

/** A trade's display name, falling back to its slug. */
export const tradeName = (departments: Department[], slug: string) => allTrades(departments).find((t) => t.slug === slug)?.name ?? slug
