import type { Fulfilment, PaymentMethod, Shipment, ShipmentStatus } from "./types"

type Step = { status: ShipmentStatus; label: string }

const deliverySteps: Step[] = [
  { status: "placed", label: "Paid" },
  { status: "confirmed", label: "Confirmed" },
  { status: "loaded", label: "Loaded" },
  { status: "on_the_way", label: "On the way" },
  { status: "delivered", label: "Delivered" },
]
/** A pickup skips the truck: ready at the store, then collected. */
const pickupSteps: Step[] = [
  { status: "placed", label: "Paid" },
  { status: "confirmed", label: "Confirmed" },
  { status: "loaded", label: "Ready" },
  { status: "delivered", label: "Collected" },
]

/** The visible steps for a delivery or a pickup, in order. */
export const stepsFor = (fulfilment: Fulfilment = "delivery") => (fulfilment === "pickup" ? pickupSteps : deliverySteps)

export const isPickup = (s: Pick<Shipment, "fulfilment">) => s.fulfilment === "pickup"

export const statusLabel = (s: Pick<Shipment, "status" | "slot" | "fulfilment">) =>
  ({
    pending_payment: "Awaiting payment",
    placed: `Waiting for seller · ${s.slot}`,
    confirmed: `Confirmed · ${s.slot}`,
    loaded: isPickup(s) ? "Ready for pickup" : "Loaded at depot",
    on_the_way: "On the way",
    delivered: isPickup(s) ? "Collected" : "Delivered",
    cancelled: "Cancelled",
  })[s.status]

export const isDone = (status: ShipmentStatus) => status === "delivered" || status === "cancelled"

export const paymentMethods: { id: PaymentMethod; label: string; text: string; tag?: string }[] = [
  { id: "transfer", label: "Bank transfer", text: "Transfer to a dedicated account. Confirmed in seconds.", tag: "Best for large orders" },
  { id: "card", label: "Card", text: "Visa, Mastercard, Verve" },
  { id: "ussd", label: "USSD", text: "Pay from any bank on your phone" },
]
export const paymentLabel = (id: PaymentMethod) => paymentMethods.find((p) => p.id === id)?.label ?? id
