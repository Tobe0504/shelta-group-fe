import { data, http } from "@/lib/http"
import type { Department, DepartmentKind, Promo, Settings } from "@/lib/types"

export const catalogService = {
  departments: (kind: DepartmentKind | "all" = "products") => http.get("/catalog", { params: { kind } }).then(data<Department[]>),
  settings: () => http.get("/settings").then(data<Settings>),
  promos: (category?: string) => http.get("/promos", { params: { category } }).then(data<Promo[]>),
}
