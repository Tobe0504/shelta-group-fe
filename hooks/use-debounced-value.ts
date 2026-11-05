"use client"

import { useEffect, useState } from "react"

/** `value`, updated only after it stops changing for `ms`. */
export function useDebouncedValue<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}
