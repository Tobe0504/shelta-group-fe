"use client"

import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { keys } from "@/lib/query-keys"
import type { BidInput } from "@/lib/types"
import { jobsService } from "@/services/jobs.service"
import { prosService } from "@/services/pros.service"
import { useMe } from "./use-auth"

/** A mutation that refreshes the given lists once it succeeds. `pending` shows a loading toast. */
function useRefreshing<V, R>(mutationFn: (vars: V) => Promise<R>, lists: QueryKey[], pending?: string) {
  const client = useQueryClient()
  return useMutation({ mutationFn, meta: { pending }, onSuccess: () => lists.forEach((queryKey) => client.invalidateQueries({ queryKey })) })
}

// ——— Buyers ———

export function useMyJobs() {
  const { data: me } = useMe()
  return useQuery({ queryKey: keys.jobs, queryFn: jobsService.mine, enabled: !!me })
}
export function useJob(id: string) {
  const { data: me } = useMe()
  return useQuery({ queryKey: keys.job(id), queryFn: () => jobsService.get(id), enabled: !!me })
}
export const useCreateJob = () => useRefreshing(jobsService.create, [keys.jobs])
export const useHire = () => useRefreshing((v: { job: string; bid: string }) => jobsService.hire(v.job, v.bid), [keys.jobs], "Hiring…")
export const usePayStage = () => useMutation({ mutationFn: (v: { job: string; stage: string }) => jobsService.payStage(v.job, v.stage), onSuccess: ({ authorizationUrl }) => window.location.assign(authorizationUrl) })
export const useReleaseStage = () => useRefreshing((v: { job: string; stage: string }) => jobsService.releaseStage(v.job, v.stage), [keys.jobs], "Releasing payment…")
export const useReportStage = () => useRefreshing((v: { job: string; stage: string; message: string }) => jobsService.reportStage(v.job, v.stage, v.message), [keys.jobs])
/** Confirms a stage payment after Paystack sends the buyer back. */
export const useVerifyStagePayment = (reference: string) =>
  useQuery({ queryKey: [...keys.jobs, "verify", reference], queryFn: () => jobsService.verifyPayment(reference), enabled: !!reference, retry: false })
export const useCancelJob = () => useRefreshing(jobsService.cancel, [keys.jobs], "Cancelling job…")
export const useReviewJob = () => useRefreshing((v: { job: string; rating: number; text?: string }) => jobsService.review(v.job, { rating: v.rating, text: v.text }), [keys.jobs])

// ——— Pros ———

export function useOwnPro() {
  const { data: me } = useMe()
  return useQuery({ queryKey: keys.pro.profile, queryFn: prosService.mine, enabled: !!me })
}
export function useSavePro() {
  const client = useQueryClient()
  return useMutation({ mutationFn: prosService.save, onSuccess: (pro) => (client.setQueryData(keys.pro.profile, pro), client.invalidateQueries({ queryKey: keys.pro.leads })) })
}
export const useProJob = (id: string, enabled = true) => useQuery({ queryKey: keys.pro.job(id), queryFn: () => jobsService.proJob(id), enabled })
export const useLeads = (enabled = true) => useQuery({ queryKey: keys.pro.leads, queryFn: jobsService.leads, enabled })
export const useProJobs = (enabled = true) => useQuery({ queryKey: keys.pro.jobs, queryFn: jobsService.proJobs, enabled })
export const useSendBid = () => useRefreshing(({ job, ...bid }: { job: string } & BidInput) => jobsService.bid(job, bid), [keys.pro.leads, keys.pro.jobs])
export const useProBanks = () => useQuery({ queryKey: keys.pro.banks, queryFn: prosService.banks, staleTime: Infinity })
export function useSetProPayout() {
  const client = useQueryClient()
  return useMutation({ mutationFn: prosService.setPayout, onSuccess: (pro) => client.setQueryData(keys.pro.profile, pro) })
}

// ——— Admin ———

export const useAdminPros = () => useQuery({ queryKey: keys.admin.pros, queryFn: prosService.adminList })
export const useUpdatePro = () => useRefreshing((v: { id: string; verified?: boolean; active?: boolean }) => prosService.adminUpdate(v.id, { verified: v.verified, active: v.active }), [keys.admin.pros, keys.admin.overview], "Updating pro…")
export const useEscrow = () => useQuery({ queryKey: keys.admin.escrow, queryFn: jobsService.escrow })
export const useAdminRelease = () => useRefreshing((v: { job: string; stage: string }) => jobsService.adminRelease(v.job, v.stage), [keys.admin.escrow, keys.admin.overview], "Releasing payment…")
export const useAdminRefund = () => useRefreshing((v: { job: string; stage: string }) => jobsService.adminRefund(v.job, v.stage), [keys.admin.escrow, keys.admin.overview], "Starting refund…")
