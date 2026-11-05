import { data, hasSession, http, isStatus } from "@/lib/http"
import type { Role, User } from "@/lib/types"

export type SignUpInput = { name: string; email: string; phone: string; password: string; role: Exclude<Role, "admin">; business?: string }

export const authService = {
  /** The signed-in user, or null when signed out. */
  me: () =>
    !hasSession()
      ? Promise.resolve(null)
      : http
      .get("/me")
      .then(data<User>)
      .catch((e) => (isStatus(e, 401) ? null : Promise.reject(e))),
  signIn: (body: { email: string; password: string }) => http.post("/auth/login", body).then(data<User>),
  signUp: (body: SignUpInput) => http.post("/auth/register", body).then(data<User>),
  signOut: () => http.post("/auth/logout"),
  forgotPassword: (email: string) => http.post("/auth/forgot-password", { email }),
}
