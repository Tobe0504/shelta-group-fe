"use client"

import Form from "next/form"
import { usePathname, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

/** Header product search. Client-side navigation via next/form; keeps the query on the results page only. */
export function SearchBox() {
  const params = useSearchParams()
  const q = usePathname() === "/search" ? (params.get("q") ?? "") : ""
  return (
    <Form action="/search" role="search">
      <InputGroup className="h-12 rounded-full pr-1 max-sm:h-10">
        <InputGroupAddon className="pl-4">
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput key={q} name="q" type="search" defaultValue={q} aria-label="Search products" placeholder="Search cement, iron rods, tiles…" />
        <Button type="submit" size="sm" className="max-sm:hidden">
          Search
        </Button>
      </InputGroup>
    </Form>
  )
}

/** Static stand-in rendered until search params are available. */
export function SearchBoxFallback() {
  return <div aria-hidden className="h-12 w-full rounded-full bg-secondary max-sm:h-10" />
}
