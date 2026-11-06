"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createContext, Suspense, useContext, useEffect, useState, useTransition } from "react"

type Navigate = (href: string, options?: { replace?: boolean; scroll?: boolean }) => void
const Context = createContext<{ navigate: Navigate; pending: boolean } | null>(null)

/** Thin bar across the top while a page or filter change loads. */
function Bar({ active }: { active: boolean }) {
  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-hidden={!active}
      className={`pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-primary transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none ${active ? "scale-x-75 opacity-100" : "scale-x-100 opacity-0"}`}
    />
  )
}

/** Clears the "link clicked" flag once the new URL has rendered. */
function RouteWatcher({ onChange }: { onChange: () => void }) {
  const path = usePathname()
  const query = useSearchParams().toString()
  useEffect(onChange, [path, query, onChange])
  return null
}

/**
 * Shows progress for router navigations started with `useNavigate()` and for plain link clicks,
 * so filters and page changes never look frozen on a slow connection.
 */
export function NavigationProgress({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [clicked, setClicked] = useState(false)
  const navigate: Navigate = (href, { replace, scroll } = {}) => start(() => (replace ? router.replace(href, { scroll }) : router.push(href, { scroll })))

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return
      const url = new URL(a.href, location.href)
      if (url.origin === location.origin && url.pathname + url.search !== location.pathname + location.search) setClicked(true)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  return (
    <Context value={{ navigate, pending }}>
      <Bar active={pending || clicked} />
      <Suspense>
        <RouteWatcher onChange={() => setClicked(false)} />
      </Suspense>
      {children}
    </Context>
  )
}

/** `navigate(href)` plus whether that navigation is still loading. */
export function useNavigate() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error("useNavigate must be used inside NavigationProgress")
  return ctx
}
