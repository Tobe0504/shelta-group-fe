import { data, http } from "@/lib/http"
import type { Checkout, Order, Paged, PaymentMethod } from "@/lib/types"

export type CheckoutInput = { siteId: string; paymentMethod: PaymentMethod; shipments: { store: string; slot: string; offload: boolean }[] }
const shipment = (number: string, id: string) => `/orders/${number}/shipments/${id}`

export const ordersService = {
  list: () => http.get<Paged<Order>>("/orders", { params: { limit: 50 } }).then((r) => r.data),
  get: (number: string) => http.get(`/orders/${number}`).then(data<Order>),
  checkout: (body: CheckoutInput) => http.post("/orders", body).then(data<Checkout>),
  retryPayment: (number: string) => http.post(`/orders/${number}/payment`).then(data<Checkout>),
  verifyPayment: (reference: string) => http.get("/payments/verify", { params: { reference } }).then(data<Order>),
  confirm: (number: string, id: string) => http.post(`${shipment(number, id)}/confirm`).then(data<Order>),
  reschedule: (number: string, id: string, slot: string) => http.post(`${shipment(number, id)}/reschedule`, { slot }).then(data<Order>),
  report: (number: string, id: string, body: { reason: string; message: string }) => http.post(`${shipment(number, id)}/report`, body).then(data<Order>),
}
