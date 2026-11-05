"use client"

import { useEffect, useState } from "react"

/** useState that survives reloads via localStorage. Renders `initial` on the server and first paint; `loaded` turns true once storage is read. */
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
      if (stored) setValue(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [key])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value, loaded])

  return [value, setValue, loaded] as const
}
