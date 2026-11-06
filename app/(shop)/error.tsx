"use client"

import { useEffect } from "react"
import { AppError } from "@/components/app-error"

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error])
  return <AppError retry={retry} />
}
