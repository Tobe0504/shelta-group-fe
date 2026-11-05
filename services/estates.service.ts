import { http } from "@/lib/http"
import type { EstateKind, EstateList } from "@/lib/types"

export const estatesService = {
  list: (params: { kind?: EstateKind; city?: string; limit?: number } = {}) => http.get<EstateList>("/estates", { params }).then((r) => r.data),
}
