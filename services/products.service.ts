import { data, http } from "@/lib/http"
import type { Paged, Product } from "@/lib/types"

export type ProductSearch = { q?: string; category?: string; department?: string; brand?: string[]; deals?: boolean; sort?: "best" | "price-asc" | "price-desc" | "newest"; page?: number; limit?: number }

export const productsService = {
  search: (params: ProductSearch = {}) => http.get<Paged<Product>>("/products", { params }).then((r) => r.data),
  brands: (category?: string) => http.get("/products/brands", { params: { category } }).then(data<string[]>),
  get: (slug: string) => http.get(`/products/${slug}`).then(data<Product>),
  related: (slug: string) => http.get(`/products/${slug}/related`).then(data<Product[]>),
}
