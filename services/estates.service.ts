import { data, http } from "@/lib/http"
import type { Estate, EstateKind, EstateList } from "@/lib/types"

/** Real estate listings (public reads). */
export const estatesService = {
  get: (slug: string) => http.get(`/estates/${slug}`).then(data<Estate>),
  list: (params: { kind?: EstateKind; city?: string; limit?: number } = {}) => http.get<EstateList>("/estates", { params }).then((r) => r.data),
}
