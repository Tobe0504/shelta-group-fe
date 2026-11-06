import { data, http } from "@/lib/http"
import type { BidInput, EscrowJob, Job, JobInput, Lead, Paged, ProJob, ProJobDetail } from "@/lib/types"

export const jobsService = {
  create: (body: JobInput) => http.post("/jobs", body).then(data<Job>),
  get: (id: string) => http.get(`/jobs/${id}`).then(data<Job>),
  proJob: (id: string) => http.get(`/pro/jobs/${id}`).then(data<ProJobDetail>),
  mine: () => http.get<Paged<Job>>("/jobs", { params: { limit: 50 } }).then((r) => r.data),
  hire: (id: string, bid: string) => http.post(`/jobs/${id}/hire`, { bid }).then(data<Job>),
  cancel: (id: string) => http.post(`/jobs/${id}/cancel`).then(data<Job>),
  review: (id: string, body: { rating: number; text?: string }) => http.post(`/jobs/${id}/review`, body).then(data<Job>),
  /** Starts a Paystack checkout for a stage; resolves to where to send the buyer. */
  payStage: (id: string, stage: string) => http.post(`/jobs/${id}/stages/${stage}/pay`).then(data<{ authorizationUrl: string; reference: string }>),
  verifyPayment: (reference: string) => http.get("/jobs/payments/verify", { params: { reference } }).then(data<Job>),
  releaseStage: (id: string, stage: string) => http.post(`/jobs/${id}/stages/${stage}/release`).then(data<Job>),
  reportStage: (id: string, stage: string, message: string) => http.post(`/jobs/${id}/stages/${stage}/report`, { message }).then(data<Job>),
  leads: () => http.get("/pro/leads").then(data<Lead[]>),
  proJobs: () => http.get("/pro/jobs").then(data<ProJob[]>),
  bid: (id: string, body: BidInput) => http.post(`/pro/leads/${id}/bids`, body),
  escrow: () => http.get("/admin/escrow").then(data<EscrowJob[]>),
  adminRelease: (id: string, stage: string) => http.post(`/admin/jobs/${id}/stages/${stage}/release`),
  adminRefund: (id: string, stage: string) => http.post(`/admin/jobs/${id}/stages/${stage}/refund`),
}
