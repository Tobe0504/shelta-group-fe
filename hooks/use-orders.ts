"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { keys } from "@/lib/query-keys"
import type { Order } from "@/lib/types"
import { ordersService } from "@/services/orders.service"

export const useOrders = () => useQuery({ queryKey: keys.orders, queryFn: ordersService.list })
export const useOrder = (number: string) => useQuery({ queryKey: keys.order(number), queryFn: () => ordersService.get(number) })

/** Places the order and sends the buyer to Paystack. */
export const useCheckout = () =>
  useMutation({ mutationFn: ordersService.checkout, onSuccess: ({ payment }) => window.location.assign(payment.authorizationUrl) })

export const useRetryPayment = () =>
  useMutation({ mutationFn: ordersService.retryPayment, onSuccess: ({ payment }) => window.location.assign(payment.authorizationUrl) })

export function useVerifyPayment(reference: string) {
  const client = useQueryClient()
  return useQuery({
    queryKey: ["payment", reference],
    queryFn: async () => {
      const order = await ordersService.verifyPayment(reference)
      client.setQueryData(keys.order(order.number), order)
      if (order.payment.status === "paid") client.invalidateQueries({ queryKey: keys.cart })
      return order
    },
    enabled: !!reference,
    staleTime: Infinity,
  })
}

type ShipmentAction =
  | { type: "confirm" }
  | { type: "reschedule"; slot: string }
  | { type: "report"; reason: string; message: string }

/** Buyer actions on one delivery; the updated order replaces the cached one. */
export function useShipmentAction(number: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: ShipmentAction }) =>
      action.type === "confirm"
        ? ordersService.confirm(number, id)
        : action.type === "reschedule"
          ? ordersService.reschedule(number, id, action.slot)
          : ordersService.report(number, id, { reason: action.reason, message: action.message }),
    onSuccess: (order: Order) => {
      client.setQueryData(keys.order(number), order)
      client.invalidateQueries({ queryKey: keys.orders, exact: true })
    },
  })
}
