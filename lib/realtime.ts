"use client"

import { io, type Socket } from "socket.io-client"
import { notificationsService } from "@/services/notifications.service"

const URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000"
let socket: Socket | null = null

/**
 * The one live connection for this tab, created idle so components can subscribe before it connects.
 * Each (re)connect fetches a fresh short-lived ticket through the normal API, so the socket server
 * never needs the auth cookies.
 */
export function getSocket() {
  socket ??= io(URL, {
    path: "/realtime",
    autoConnect: false,
    transports: ["websocket", "polling"],
    auth: (cb) => void notificationsService.ticket().then(({ token }) => cb({ token }), () => cb({})),
  })
  return socket
}
