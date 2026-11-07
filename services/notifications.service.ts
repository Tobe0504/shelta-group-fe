import { data, http } from "@/lib/http"
import type { NotificationList } from "@/lib/types"

export const notificationsService = {
  list: () => http.get("/notifications").then(data<NotificationList>),
  markRead: (ids?: string[]) => http.post("/notifications/read", { ids }).then(data<NotificationList>),
  /** A 60-second ticket for opening the live connection. */
  ticket: () => http.post("/realtime/ticket").then(data<{ token: string }>),
}
