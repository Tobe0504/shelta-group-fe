"use client"

import { useSyncExternalStore } from "react"

const noop = () => () => {}

/** False while a component hydrates (so it matches the server HTML), true on every render after. */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false)
