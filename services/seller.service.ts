import { data, http } from "@/lib/http"
import type { Driver, Enquiry, Listing, Order, OwnStore, Paged, ProductInput, ProductStatus, SellerOrder, ShipmentStatus } from "@/lib/types"

const shipment = (number: string, id: string) => `/seller/orders/${number}/shipments/${id}`

export const sellerService = {
  store: () => http.get("/seller/store").then(data<OwnStore>),
  updateStore: (body: Partial<Pick<OwnStore, "name" | "about" | "address" | "location" | "coords">>) => http.patch("/seller/store", body).then(data<OwnStore>),
  setPayout: (body: { bankCode: string; bankName: string; accountNumber: string }) => http.put("/seller/store/payout", body).then(data<OwnStore>),
  banks: () => http.get("/seller/banks").then(data<{ name: string; code: string }[]>),

  products: (params: { status?: ProductStatus; q?: string } = {}) => http.get<Paged<Listing>>("/seller/products", { params: { ...params, limit: 100 } }).then((r) => r.data),
  product: (slug: string) => http.get(`/seller/products/${slug}`).then(data<Listing>),
  createProduct: (body: ProductInput) => http.post("/seller/products", body).then(data<Listing>),
  updateProduct: (slug: string, body: Partial<ProductInput>) => http.patch(`/seller/products/${slug}`, body).then(data<Listing>),
  deleteProduct: (slug: string) => http.delete(`/seller/products/${slug}`),

  orders: (status?: ShipmentStatus) => http.get<Paged<SellerOrder>>("/seller/orders", { params: { status, limit: 100 } }).then((r) => r.data),
  accept: (number: string, id: string) => http.post(`${shipment(number, id)}/accept`).then(data<Order>),
  load: (number: string, id: string) => http.post(`${shipment(number, id)}/load`).then(data<Order>),
  dispatch: (number: string, id: string, driver: Driver) => http.post(`${shipment(number, id)}/dispatch`, driver).then(data<Order>),
  decline: (number: string, id: string, reason: string) => http.post(`${shipment(number, id)}/decline`, { reason }).then(data<Order>),

  enquiries: () => http.get<Paged<Enquiry>>("/seller/enquiries", { params: { limit: 100 } }).then((r) => r.data),
  setEnquiryStatus: (id: string, status: Enquiry["status"]) => http.patch(`/seller/enquiries/${id}`, { status }).then(data<Enquiry>),
}
