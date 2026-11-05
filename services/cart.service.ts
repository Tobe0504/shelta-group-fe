import { data, http } from "@/lib/http"
import type { Cart, Coords } from "@/lib/types"

export const cartService = {
  /** The cart with each truck priced to `to`. */
  get: (to?: Coords) => http.get("/cart", { params: to }).then(data<Cart>),
  /** Sets a line's quantity; 0 removes it. */
  setLine: (productId: string, qty: number) => http.put(`/cart/lines/${productId}`, { qty }).then(data<Cart>),
}
