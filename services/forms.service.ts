import { http } from "@/lib/http"

export type QuoteInput = { name: string; phone: string; email?: string; site: string; neededBy?: string; items?: string; files?: string[] }
export type EnquiryInput = { topic: "product" | "estate"; target: string; name: string; phone: string; reason?: string; message: string }

/** Public forms: quote requests and enquiries to sellers or the real estate team. */
export const formsService = {
  requestQuote: (body: QuoteInput) => http.post("/quotes", body),
  enquire: (body: EnquiryInput) => http.post("/enquiries", body),
}
