import { data, http } from "@/lib/http"
import type { SpotlightResults } from "@/lib/types"

export const searchService = {
  everything: (q: string) => http.get("/search", { params: { q } }).then(data<SpotlightResults>),
}
