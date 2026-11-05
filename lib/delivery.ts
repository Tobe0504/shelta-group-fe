import type { Coords, DeliveryRates } from "./types"

const rad = (deg: number) => (deg * Math.PI) / 180

function haversineKm(a: Coords, b: Coords) {
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

/** Fee for a road distance: base + per km, at least the minimum, rounded up to ₦100. */
export const feeForKm = (rates: DeliveryRates, km: number) => Math.max(rates.deliveryMinFee, Math.ceil((rates.deliveryBaseFee + rates.deliveryPerKm * km) / 100) * 100)

/** Road km from a straight-line distance. */
export const roadKm = (rates: DeliveryRates, straightKm: number) => Math.round(straightKm * rates.roadFactor * 10) / 10

/** Mirrors the API's delivery quote. Without both points the minimum fee applies. */
export function quoteDelivery(rates: DeliveryRates, from?: Coords, to?: Coords) {
  if (!from || !to) return { fee: rates.deliveryMinFee, distanceKm: null, inRange: true }
  const distanceKm = roadKm(rates, haversineKm(from, to))
  return { fee: feeForKm(rates, distanceKm), distanceKm, inRange: distanceKm <= rates.maxDeliveryKm }
}

export const formatKm = (km: number) => `${km < 10 ? km.toFixed(1) : Math.round(km)} km`
