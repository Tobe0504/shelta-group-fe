/** Static stand-in for the header search, rendered until search params are available. */
export function SearchBoxFallback() {
  return <div aria-hidden className="h-12 w-full rounded-full bg-secondary max-sm:h-10" />
}
