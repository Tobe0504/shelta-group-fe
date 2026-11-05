import { data, http } from "@/lib/http"
import type { Site, SiteInput } from "@/lib/types"

export const sitesService = {
  list: () => http.get("/sites").then(data<Site[]>),
  create: (body: SiteInput) => http.post("/sites", body).then(data<Site>),
}
