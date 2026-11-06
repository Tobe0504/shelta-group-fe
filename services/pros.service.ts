import { data, http } from "@/lib/http"
import type { AdminPro, OwnPro, Paged, Pro, ProInput, ProProfile } from "@/lib/types"

export type ProSort = "best" | "rating" | "jobs" | "nearest"
export type ProSearch = { trade?: string; q?: string; verified?: boolean; sort?: ProSort; lat?: number; lng?: number; page?: number; limit?: number }

export const prosService = {
  list: ({ verified, ...params }: ProSearch = {}) => http.get<Paged<Pro>>("/pros", { params: { ...params, verified: verified ? "1" : undefined } }).then((r) => r.data),
  /** Active pros per trade slug. */
  tradeCounts: () => http.get("/pros/trade-counts").then(data<Record<string, number>>),
  get: (slug: string) => http.get(`/pros/${slug}`).then(data<ProProfile>),
  mine: () => http.get("/pro/profile").then(data<OwnPro | null>),
  save: (body: ProInput) => http.put("/pro/profile", body).then(data<OwnPro>),
  banks: () => http.get("/pro/banks").then(data<{ name: string; code: string }[]>),
  setPayout: (body: { bankCode: string; bankName: string; accountNumber: string }) => http.put("/pro/payout", body).then(data<OwnPro>),
  adminList: () => http.get<Paged<AdminPro>>("/admin/pros", { params: { limit: 100 } }).then((r) => r.data),
  adminUpdate: (id: string, body: { verified?: boolean; active?: boolean }) => http.patch(`/admin/pros/${id}`, body).then(data<AdminPro>),
}
