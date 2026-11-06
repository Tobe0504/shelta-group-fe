import type { JobStatus } from "./types"

export const jobStatus: Record<JobStatus, { label: string; variant: "deal-soft" | "accent" | "success" | "secondary" }> = {
  open: { label: "Taking quotes", variant: "deal-soft" },
  hired: { label: "In progress", variant: "accent" },
  completed: { label: "Done", variant: "success" },
  cancelled: { label: "Cancelled", variant: "secondary" },
}
