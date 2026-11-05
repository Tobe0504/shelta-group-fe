import { data, http } from "@/lib/http"
import type { Department, Promo, Settings } from "@/lib/types"

export const catalogService = {
  departments: () => http.get("/catalog").then(data<Department[]>),
  settings: () => http.get("/settings").then(data<Settings>),
  promos: (category?: string) => http.get("/promos", { params: { category } }).then(data<Promo[]>),
}
