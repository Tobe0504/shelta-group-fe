import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

const onServer = typeof window === "undefined"

/**
 * Axios instance for the SheltaMart API. In the browser it calls `/api/v1`, which Next.js proxies to the API
 * (so auth cookies stay same-site). On the server it calls the API directly via API_URL.
 */
export const http = axios.create({
  baseURL: onServer ? `${process.env.API_URL ?? "http://localhost:4000"}/api/v1` : "/api/v1",
  withCredentials: true,
  timeout: 15_000,
  paramsSerializer: { indexes: null }, // brand=a&brand=b
})

/** Set by the API alongside the httpOnly auth cookies; absent means nobody is signed in on this browser. */
export const hasSession = () => !onServer && document.cookie.split("; ").some((c) => c.startsWith("sm_session="))

type Retryable = InternalAxiosRequestConfig & { _retried?: boolean }
let refreshing: Promise<unknown> | null = null

// Access tokens last 15 minutes: on a 401, refresh once and replay the request.
if (!onServer)
  http.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as Retryable | undefined
    if (error.response?.status !== 401 || !config || config._retried || config.url?.startsWith("/auth/") || !hasSession()) throw error
    config._retried = true
    refreshing ??= http.post("/auth/refresh").finally(() => (refreshing = null))
    await refreshing
    return http(config)
  })

type ApiErrorBody = { error?: { code?: string; message?: string; details?: Record<string, string[]> } }

/** A user-facing message for any failed request. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof AxiosError) return (error.response?.data as ApiErrorBody | undefined)?.error?.message ?? (error.response ? fallback : "Can’t reach SheltaMart. Check your connection.")
  return fallback
}

/** Per-field messages from a 400 `invalid_input` response, keyed by field name. */
export function fieldErrors(error: unknown): Record<string, string> {
  const details = error instanceof AxiosError ? (error.response?.data as ApiErrorBody | undefined)?.error?.details : undefined
  return Object.fromEntries(Object.entries(details ?? {}).map(([k, v]) => [k, v[0] ?? ""]))
}

export const isStatus = (error: unknown, status: number) => error instanceof AxiosError && error.response?.status === status

/** Unwraps the API's `{ data }` envelope. */
export const data = <T>(res: { data: { data: T } }) => res.data.data
