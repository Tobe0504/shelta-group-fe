const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
})

export const formatNaira = (value: number) => naira.format(value)

export const percentOff = (price: number, was: number) =>
  Math.round(((was - price) / was) * 100)

export const deliveryLabel = (days: number) =>
  days === 0 ? "Arrives today" : days === 1 ? "Arrives tomorrow" : `Arrives in ${days} days`


const day = new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short" })
/** e.g. "Mon 3 Nov" */
export const formatDay = (iso: string) => day.format(new Date(iso)).replace(",", "")

/** wa.me link for a Nigerian number written locally (0803…) or internationally (+234…). */
export const whatsappLink = (phone: string, text?: string) => {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "234")
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`
}
