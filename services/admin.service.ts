import { data, http } from "@/lib/http"
import type { CategoryInput, DepartmentInput, Estate, EstateInput, AdminEnquiry, AdminOverview, AdminPromo, AdminStore, Enquiry, MarketplaceSettings, Paged, PromoInput, Quote, QuoteStatus } from "@/lib/types"

const all = { limit: 100 }

export const adminService = {
  overview: () => http.get("/admin/overview").then(data<AdminOverview>),
  runPayouts: () => http.post("/admin/payouts/run").then(data<{ paid: number }>),

  quotes: () => http.get<Paged<Quote>>("/admin/quotes", { params: all }).then((r) => r.data),
  updateQuote: (id: string, body: { status?: QuoteStatus; notes?: string }) => http.patch(`/admin/quotes/${id}`, body).then(data<Quote>),

  enquiries: () => http.get<Paged<AdminEnquiry>>("/admin/enquiries", { params: { ...all, topic: "estate" } }).then((r) => r.data),
  setEnquiryStatus: (id: string, status: Enquiry["status"]) => http.patch(`/admin/enquiries/${id}`, { status }).then(data<AdminEnquiry>),

  stores: () => http.get<Paged<AdminStore>>("/admin/stores", { params: all }).then((r) => r.data),
  verifyStore: (id: string, verified: boolean) => http.patch(`/admin/stores/${id}/verification`, { verified }),

  promos: () => http.get("/admin/promos").then(data<AdminPromo[]>),
  createPromo: (body: PromoInput) => http.post("/admin/promos", body).then(data<AdminPromo>),
  updatePromo: (id: string, body: Partial<PromoInput>) => http.patch(`/admin/promos/${id}`, body).then(data<AdminPromo>),
  deletePromo: (id: string) => http.delete(`/admin/promos/${id}`),

  estates: () => http.get("/admin/estates").then(data<Estate[]>),
  createEstate: (body: EstateInput) => http.post("/admin/estates", body).then(data<Estate>),
  updateEstate: (slug: string, body: Partial<EstateInput>) => http.patch(`/admin/estates/${slug}`, body).then(data<Estate>),
  deleteEstate: (slug: string) => http.delete(`/admin/estates/${slug}`).then(() => undefined),

  saveDepartment: (body: DepartmentInput) => http.put("/admin/departments", body).then(() => undefined),
  deleteDepartment: (slug: string) => http.delete(`/admin/departments/${slug}`).then(() => undefined),
  createCategory: (body: CategoryInput) => http.post("/admin/categories", body).then(() => undefined),
  updateCategory: (slug: string, body: Partial<Omit<CategoryInput, "slug">>) => http.patch(`/admin/categories/${slug}`, body).then(() => undefined),
  deleteCategory: (slug: string) => http.delete(`/admin/categories/${slug}`).then(() => undefined),

  settings: () => http.get("/admin/settings").then(data<MarketplaceSettings>),
  updateSettings: (body: Partial<MarketplaceSettings>) => http.patch("/admin/settings", body).then(data<MarketplaceSettings>),
}
