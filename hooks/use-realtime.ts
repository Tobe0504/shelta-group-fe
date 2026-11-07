"use client"

import { useEffect, useRef } from "react"
import { getSocket } from "@/lib/realtime"

/** Runs `handler` for a live event while the component is mounted. */
export function useRealtimeEvent<T>(event: string, handler: (payload: T) => void) {
  const latest = useRef(handler)
  useEffect(() => {
    latest.current = handler
  })
  useEffect(() => {
    const socket = getSocket()
    const listener = (payload: T) => latest.current(payload)
    socket.on(event, listener)
    return () => void socket.off(event, listener)
  }, [event])
}
