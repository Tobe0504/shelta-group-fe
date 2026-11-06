// Shapes returned by the SheltaMart API (sheltamart-v2-be).

export type Tone = "blue" | "peach" | "mint" | "lilac" | "yellow" | "pink" | "teal" | "slate" | "lime"

export type Paged<T> = { data: T[]; meta: { page: number; limit: number; total: number; pages: number } }

export type Category = { id: string; slug: string; name: string; tone: Tone; department: string }
/** `products` are sold through the cart; `services` are trades people hire through job requests. */
export type DepartmentKind = "products" | "services"
export type Department = { id: string; slug: string; name: string; kind?: DepartmentKind; categories: Category[] }
export type Coords = { lat: number; lng: number }
/** A searched or pinned location. */
export type Place = { label: string; area: string; state?: string; coords: Coords }
export type DeliveryRates = { deliveryBaseFee: number; deliveryPerKm: number; deliveryMinFee: number; roadFactor: number; maxDeliveryKm: number }
export type Settings = { offloadFee: number; serviceFee: number; deliverySlots: string[]; delivery: DeliveryRates }

export type Store = {
  id: string
  slug: string
  name: string
  area?: string
  /** e.g. "Oregun, Ikeja" */
  location?: string
  address?: string
  coords?: Coords
  about?: string
  verified: boolean
  replyTime: string
  rating: number
}
export type Payout = { bankCode: string; bankName: string; accountNumber: string; accountName: string }
export type OwnStore = Store & { payout?: Payout }

export type PriceTier = { label?: string; min: number; price: number }
export type ProductStatus = "live" | "draft" | "out-of-stock"

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  store: Store
  price: number
  was?: number
  unit: string
  tiers: PriceTier[]
  stock: number
  deliveryDays: number
  specs: { label: string; value: string }[]
  images: string[]
  description?: string
  status: ProductStatus
  rating: number
  reviewCount: number
}
/** A seller's own listing: `store` is just the id. */
export type Listing = Omit<Product, "store"> & { store: string; updatedAt: string }
export type ProductInput = Pick<Product, "name" | "brand" | "category" | "price" | "unit" | "stock" | "deliveryDays" | "specs" | "images" | "tiers" | "status"> & {
  was?: number
  description?: string
}

export type CartItem = { product: Pick<Product, "id" | "slug" | "name" | "unit" | "price" | "category" | "images"> & { store: { id: string; name: string } }; qty: number; unitPrice: number; total: number; saving: number }
export type CartShipment = { store: { id: string; name: string }; items: CartItem[]; goods: number; delivery: number; distanceKm: number | null; inRange: boolean; offload: number; amount: number }
export type CartSummary = { shipments: CartShipment[]; itemCount: number; subtotal: number; delivery: number; offload: number; savings: number; total: number }
export type Cart = { lines: { product: CartItem["product"] & { stock: number }; qty: number }[]; summary: CartSummary }

export type Site = { id: string; label: string; address: string; area?: string; coords?: Coords; contactName: string; contactPhone: string; notes?: string }
export type SiteInput = Omit<Site, "id">

export type PaymentMethod = "transfer" | "card" | "ussd"
export type ShipmentStatus = "pending_payment" | "placed" | "confirmed" | "loaded" | "on_the_way" | "delivered" | "cancelled"
export type Driver = { name: string; truck: string; phone: string }

export type Shipment = {
  id: string
  store: string
  storeName: string
  lines: { product: string; slug: string; name: string; unit: string; qty: number; unitPrice: number; total: number }[]
  slot: string
  offload: boolean
  goods: number
  deliveryFee: number
  distanceKm?: number
  offloadFee: number
  amount: number
  payout: number
  status: ShipmentStatus
  driver?: Driver
  issue?: { reason: string; message: string; at: string }
  payoutStatus: "not_due" | "pending" | "paid" | "failed"
}

export type Order = {
  id: string
  number: string
  site: Omit<Site, "id" | "notes">
  paymentMethod: PaymentMethod
  payment: { status: "pending" | "paid" | "failed" | "refunded"; reference: string }
  subtotal: number
  delivery: number
  offload: number
  serviceFee: number
  total: number
  shipments: Shipment[]
  createdAt: string
}
export type SellerOrder = Pick<Order, "number" | "site" | "paymentMethod"> & { placedAt: string; shipments: Shipment[] }
export type Checkout = { order: Order; payment: { authorizationUrl: string; reference: string } }

export type Role = "buyer" | "seller" | "admin"
export type User = {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
  avatar?: string
  notify: { whatsapp: boolean; email: boolean }
  saved: string[]
}

export type EstateKind = "Land" | "Apartment" | "House" | "Short-let"
export type Estate = {
  id: string
  slug: string
  kind: EstateKind
  name: string
  area: string
  city: string
  /** Plot size, bedrooms or stay length, shown under the name. */
  detail?: string
  price: number
  /** Price suffix, e.g. "per plot" or "per night". */
  per?: string
  tone: Tone
  images?: string[]
  developer?: string
  active?: boolean
  address?: string
  coords?: Coords
  /** Full write-up for the property page. */
  description?: string
}
export type EstateList = Paged<Estate> & { facets: { kinds: Partial<Record<EstateKind, number>>; cities: string[] } }

/** Sponsored banner. `category` targets it to that category's search page. */
export type Promo = {
  id: string
  badge: string
  title: string
  text: string
  cta: string
  href: string
  theme: "primary" | "dark" | "deal" | "success"
  icon: "cement" | "rods" | "roof" | "truck" | "quote" | "paint" | "tiles" | "solar" | "safety"
  category?: string
  sponsor?: string
}

// ——— Services ———

export type ProKind = "individual" | "company"
export type RateUnit = "job" | "day" | "hour" | "m²"
/** A tradesperson or firm buyers can hire. */
export type Pro = {
  id: string
  slug: string
  name: string
  kind: ProKind
  headline: string
  trades: string[]
  about?: string
  location: string
  coords?: Coords
  radiusKm: number
  rate?: { amount: number; unit: RateUnit }
  years?: number
  photo?: string
  portfolio: string[]
  verified: boolean
  rating: number
  reviewCount: number
  jobsDone: number
  /** Only on location searches. */
  distanceKm?: number
}
export type ProReview = { id: string; name: string; rating: number; text?: string; createdAt: string }
export type ProProfile = Pro & { reviews: ProReview[] }
/** The signed-in user's own profile, including their private phone and payout account. */
export type OwnPro = Pro & { phone: string; active: boolean; payout?: Payout }
export type ProInput = Omit<Pro, "id" | "slug" | "verified" | "rating" | "reviewCount" | "jobsDone" | "distanceKm" | "rate"> & { phone: string; rate?: Pro["rate"] | null; photo?: string | null }

export type JobStatus = "open" | "hired" | "completed" | "cancelled"
export type BidStatus = "sent" | "accepted" | "declined"
/** A quoting pro as the buyer sees them; `phone` only once hired. */
export type BidPro = Pick<Pro, "id" | "slug" | "name" | "headline" | "photo" | "rating" | "reviewCount" | "jobsDone" | "verified"> & { phone?: string }
export type StageDraft = { title: string; amount: number }
export type Bid = { id: string; pro: BidPro; amount: number; timeline: string; message?: string; stages: StageDraft[]; status: BidStatus; createdAt: string }
/** unpaid → pending (at checkout) → held in escrow → released to the pro, or refunded. */
export type StageStatus = "unpaid" | "pending" | "held" | "released" | "refunded"
export type PayoutStatus = "not_due" | "pending" | "paid" | "failed"
export type Stage = StageDraft & {
  id: string
  status: StageStatus
  paidAt?: string
  releasedAt?: string
  commission?: number
  payout?: number
  payoutStatus: PayoutStatus
  issue?: { message: string; at: string }
}
export type Job = {
  id: string
  trade: string
  title: string
  description: string
  site: { address: string; area?: string; coords?: Coords }
  photos: string[]
  budget?: number
  startBy?: string
  contactName: string
  contactPhone: string
  pro?: { slug: string; name: string }
  status: JobStatus
  bids: Bid[]
  stages: Stage[]
  reviewed: boolean
  createdAt: string
}
export type JobInput = Pick<Job, "trade" | "title" | "description" | "site" | "photos" | "budget" | "startBy" | "contactName" | "contactPhone"> & { pro?: string }
/** An open job as a pro sees it before being hired. */
export type Lead = Pick<Job, "id" | "trade" | "title" | "description" | "photos" | "budget" | "startBy" | "status" | "createdAt"> & { area?: string; quotes: number; direct: boolean; distanceKm: number | null }
/** A job the pro quoted on; contact details only when they won it. */
export type ProJob = Omit<Lead, "direct" | "distanceKm"> & {
  bid: Omit<Bid, "pro">
  won: boolean
  stages: Pick<Stage, "id" | "title" | "amount" | "status" | "paidAt" | "payout" | "payoutStatus">[]
  contactName?: string
  contactPhone?: string
  address?: string
}
/** One job on the pro's detail page: a lead they can still quote on, or a job they quoted on. */
export type ProJobDetail = (Lead & { quoted: false }) | (ProJob & { quoted: true })
export type BidInput = { amount: number; timeline: string; message?: string; stages?: StageDraft[] }
/** A job with money in escrow or a payout outstanding, for admins. */
export type EscrowJob = Omit<Job, "bids" | "pro"> & { user: { id: string; name: string; email: string }; hired: { id: string; slug: string; name: string; phone: string } }

export type Enquiry = { id: string; topic: "product" | "estate"; name: string; phone: string; reason?: string; message: string; status: "new" | "replied" | "closed"; product?: { slug: string; name: string }; createdAt: string }

// ——— Admin ———

export type QuoteStatus = "new" | "in_progress" | "quoted" | "closed"
export type Quote = { id: string; name: string; phone: string; email?: string; site: string; neededBy?: string; items?: string; files: string[]; status: QuoteStatus; notes?: string; createdAt: string }
export type AdminEnquiry = Enquiry & { estate?: { slug: string; name: string } }
export type AdminStore = Store & { owner: { id: string; name: string; email: string; phone?: string }; productCount: number; hasPayout: boolean; createdAt: string }
export type AdminOverview = {
  orders: number
  gmv: number
  commission: number
  pendingPayouts: { count: number; amount: number }
  newQuotes: number
  newEnquiries: number
  unverifiedStores: number
  unverifiedPros: number
  escrow: { amount: number; count: number; issues: number }
  buyers: number
  liveProducts: number
}
export type MarketplaceSettings = {
  commissionRate: number
  categoryCommission: { category: string; rate: number }[]
  offloadFee: number
  serviceFee: number
  deliveryWindows: string[]
  deliveryDaysAhead: number
  payoutDelayHours: number
  jobQuoteLimit: number
  serviceCommissionRate: number
} & DeliveryRates
export type PromoInput = Omit<Promo, "id"> & { order?: number; active?: boolean }
export type EstateInput = Omit<Estate, "id" | "slug" | "coords"> & { coords?: Coords | null }
export type CategoryInput = Omit<Category, "id"> & { order?: number }
export type DepartmentInput = { slug: string; name: string; kind?: DepartmentKind; order?: number }

export type AdminPro = OwnPro & { owner: { id: string; name: string; email: string }; createdAt: string }

export type AdminPromo = Promo & { order: number; active: boolean }
