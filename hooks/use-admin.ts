"use client"

import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { keys } from "@/lib/query-keys"
import { adminService } from "@/services/admin.service"

export const useAdminOverview = () => useQuery({ queryKey: keys.admin.overview, queryFn: adminService.overview })
export const useAdminQuotes = () => useQuery({ queryKey: keys.admin.quotes, queryFn: adminService.quotes })
export const useAdminQuote = (id: string) => useQuery({ queryKey: keys.admin.quote(id), queryFn: () => adminService.quote(id) })
export const useAdminEnquiries = () => useQuery({ queryKey: keys.admin.enquiries, queryFn: adminService.enquiries })
export const useAdminStores = () => useQuery({ queryKey: keys.admin.stores, queryFn: adminService.stores })
export const useAdminPromos = () => useQuery({ queryKey: keys.admin.promos, queryFn: adminService.promos })
export const useMarketplaceSettings = () => useQuery({ queryKey: keys.admin.settings, queryFn: adminService.settings })

export const useAdminEstates = () => useQuery({ queryKey: keys.admin.estates, queryFn: adminService.estates })

/** A mutation that refreshes the given lists (and the overview counts) once it succeeds. `pending` shows a loading toast. */
function useAdminMutation<V, R>(mutationFn: (vars: V) => Promise<R>, lists: QueryKey[], pending?: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    meta: { pending },
    onSuccess: () => [...lists, keys.admin.overview].forEach((queryKey) => client.invalidateQueries({ queryKey })),
  })
}

export const useUpdateQuote = () => useAdminMutation((v: { id: string; status?: Parameters<typeof adminService.updateQuote>[1]["status"]; notes?: string }) => adminService.updateQuote(v.id, { status: v.status, notes: v.notes }), [keys.admin.quotes], "Updating request…")
export const useSetAdminEnquiryStatus = () => useAdminMutation((v: { id: string; status: Parameters<typeof adminService.setEnquiryStatus>[1] }) => adminService.setEnquiryStatus(v.id, v.status), [keys.admin.enquiries], "Updating enquiry…")
export const useVerifyStore = () => useAdminMutation((v: { id: string; verified: boolean }) => adminService.verifyStore(v.id, v.verified), [keys.admin.stores], "Updating store…")
export const useSavePromo = () =>
  useAdminMutation((v: { id?: string; body: Parameters<typeof adminService.createPromo>[0] }) => (v.id ? adminService.updatePromo(v.id, v.body) : adminService.createPromo(v.body)), [keys.admin.promos])
export const useTogglePromo = () => useAdminMutation((v: { id: string; active: boolean }) => adminService.updatePromo(v.id, { active: v.active }), [keys.admin.promos], "Updating promo…")
export const useDeletePromo = () => useAdminMutation(adminService.deletePromo, [keys.admin.promos], "Deleting promo…")
export const useUpdateSettings = () => useAdminMutation(adminService.updateSettings, [keys.admin.settings])
export const useRunPayouts = () => useAdminMutation(() => adminService.runPayouts(), [keys.admin.overview], "Sending payouts…")

type EstateVars = { slug?: string; body: Parameters<typeof adminService.createEstate>[0] }
export const useSaveEstate = () => useAdminMutation((v: EstateVars) => (v.slug ? adminService.updateEstate(v.slug, v.body) : adminService.createEstate(v.body)), [keys.admin.estates])
export const useToggleEstate = () => useAdminMutation((v: { slug: string; active: boolean }) => adminService.updateEstate(v.slug, { active: v.active }), [keys.admin.estates], "Updating property…")
export const useDeleteEstate = () => useAdminMutation(adminService.deleteEstate, [keys.admin.estates], "Deleting property…")

// Catalogue edits also refresh the public menus, filters and tiles cached in this browser.
export const useSaveDepartment = () => useAdminMutation(adminService.saveDepartment, [keys.catalog])
export const useDeleteDepartment = () => useAdminMutation(adminService.deleteDepartment, [keys.catalog], "Deleting department…")
type CategoryVars = { slug?: string; body: Parameters<typeof adminService.createCategory>[0] }
export const useSaveCategory = () =>
  useAdminMutation((v: CategoryVars) => (v.slug ? adminService.updateCategory(v.slug, { name: v.body.name, tone: v.body.tone, department: v.body.department, order: v.body.order }) : adminService.createCategory(v.body)), [keys.catalog])
export const useDeleteCategory = () => useAdminMutation(adminService.deleteCategory, [keys.catalog], "Deleting category…")
