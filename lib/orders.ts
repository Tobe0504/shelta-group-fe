import type { PaymentMethod, Shipment, ShipmentStatus } from "./types"

/** The visible delivery steps, in order. */
export const deliverySteps: { status: ShipmentStatus; label: string }[] = [
  { status: "placed", label: "Paid" },
  { status: "confirmed", label: "Confirmed" },
  { status: "loaded", label: "Loaded" },
  { status: "on_the_way", label: "On the way" },
  { status: "delivered", label: "Delivered" },
]

/** Index into `deliverySteps`; -1 before payment or when cancelled. */
export const stepIndex = (status: ShipmentStatus) => deliverySteps.findIndex((s) => s.status === status)

export const statusLabel = (s: Pick<Shipment, "status" | "slot">) =>
  ({
    pending_payment: "Awaiting payment",
    placed: `Waiting for seller · ${s.slot}`,
    confirmed: `Confirmed · ${s.slot}`,
    loaded: "Loaded at depot",
    on_the_way: "On the way",
    delivered: "Delivered",
    cancelled: "Cancelled",
  })[s.status]

export const isDone = (status: ShipmentStatus) => status === "delivered" || status === "cancelled"

export const paymentMethods: { id: PaymentMethod; label: string; text: string; tag?: string }[] = [
  { id: "transfer", label: "Bank transfer", text: "Transfer to a dedicated account. Confirmed in seconds.", tag: "Best for large orders" },
  { id: "card", label: "Card", text: "Visa, Mastercard, Verve" },
  { id: "ussd", label: "USSD", text: "Pay from any bank on your phone" },
]
export const paymentLabel = (id: PaymentMethod) => paymentMethods.find((p) => p.id === id)?.label ?? id
