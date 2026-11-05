"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { keys } from "@/lib/query-keys"
import type { Driver, Enquiry, Listing, ProductInput } from "@/lib/types"
import { sellerService } from "@/services/seller.service"

export const useOwnStore = () => useQuery({ queryKey: keys.seller.store, queryFn: sellerService.store })
export const useBanks = () => useQuery({ queryKey: keys.seller.banks, queryFn: sellerService.banks, staleTime: Infinity })
export const useListings = () => useQuery({ queryKey: keys.seller.listings, queryFn: () => sellerService.products() })
export const useListing = (slug: string) => useQuery({ queryKey: keys.seller.listing(slug), queryFn: () => sellerService.product(slug) })
export const useSellerOrders = () => useQuery({ queryKey: keys.seller.orders, queryFn: () => sellerService.orders() })
export const useSellerEnquiries = () => useQuery({ queryKey: keys.seller.enquiries, queryFn: sellerService.enquiries })

export function useUpdateStore() {
  const client = useQueryClient()
  return useMutation({ mutationFn: sellerService.updateStore, onSuccess: (store) => client.setQueryData(keys.seller.store, store) })
}

export function useSetPayout() {
  const client = useQueryClient()
  return useMutation({ mutationFn: sellerService.setPayout, onSuccess: (store) => client.setQueryData(keys.seller.store, store) })
}

/** Creates a listing, or updates it when `slug` is given. */
export function useSaveListing(slug?: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (body: ProductInput) => (slug ? sellerService.updateProduct(slug, body) : sellerService.createProduct(body)),
    onSuccess: (listing) => {
      client.setQueryData(keys.seller.listing(listing.slug), listing)
      client.invalidateQueries({ queryKey: keys.seller.listings, exact: true })
    },
  })
}

export function useUpdateListing() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, body }: { slug: string; body: Partial<ProductInput> }) => sellerService.updateProduct(slug, body),
    onSuccess: (listing: Listing) => {
      client.setQueryData(keys.seller.listing(listing.slug), listing)
      client.invalidateQueries({ queryKey: keys.seller.listings, exact: true })
    },
  })
}

export function useDeleteListing() {
  const client = useQueryClient()
  return useMutation({ mutationFn: sellerService.deleteProduct, onSuccess: () => client.invalidateQueries({ queryKey: keys.seller.listings, exact: true }) })
}

type Step = { type: "accept" } | { type: "load" } | { type: "dispatch"; driver: Driver } | { type: "decline"; reason: string }

/** Moves one of the seller's deliveries to its next status. */
export function useShipmentStep() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ number, id, step }: { number: string; id: string; step: Step }) =>
      step.type === "dispatch"
        ? sellerService.dispatch(number, id, step.driver)
        : step.type === "decline"
          ? sellerService.decline(number, id, step.reason)
          : sellerService[step.type](number, id),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.seller.orders }),
  })
}

export function useSetEnquiryStatus() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Enquiry["status"] }) => sellerService.setEnquiryStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.seller.enquiries }),
  })
}
