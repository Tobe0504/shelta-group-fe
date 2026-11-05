import { data, http } from "@/lib/http"
import type { Product, User } from "@/lib/types"

export type ProfileInput = Partial<Pick<User, "name" | "phone" | "notify">> & { avatar?: string | null }

export const accountService = {
  update: (body: ProfileInput) => http.patch("/me", body).then(data<User>),
  changePassword: (body: { current: string; next: string }) => http.put("/me/password", body),
  saved: () => http.get("/me/saved").then(data<Product[]>),
  save: (productId: string) => http.put(`/me/saved/${productId}`).then(data<Product[]>),
  unsave: (productId: string) => http.delete(`/me/saved/${productId}`).then(data<Product[]>),
}
