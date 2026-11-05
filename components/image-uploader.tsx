"use client"

import { useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useUpload } from "@/hooks/use-forms"
import type { UploadKind } from "@/services/uploads.service"
import { ProductImage } from "./product-image"

/**
 * Photo picker that uploads straight to storage. The URLs are kept in a hidden `name` input (JSON),
 * so it works inside any form.
 */
export function ImageUploader({ name, kind, initial = [], max = 6, label }: { name: string; kind: UploadKind; initial?: string[]; max?: number; label: string }) {
  const [images, setImages] = useState(initial)
  const [uploading, setUploading] = useState(0)
  const upload = useUpload(kind)
  const file = useRef<HTMLInputElement>(null)

  const add = (files: FileList | null) => {
    const list = [...(files ?? [])].slice(0, max - images.length - uploading)
    setUploading((n) => n + list.length)
    list.forEach((f) =>
      upload.mutate(f, {
        onSuccess: (url) => setImages((x) => [...x, url].slice(0, max)),
        onError: (e) => toast.error(e instanceof Error ? e.message : "A photo failed to upload"),
        onSettled: () => setUploading((n) => n - 1),
      }),
    )
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((src, i) => (
          <li key={src} className="relative">
            <ProductImage category="" src={src} sizes="120px" className="rounded-xl" />
            <Button type="button" variant="outline" size="icon-sm" aria-label={`Remove photo ${i + 1}`} className="absolute top-1.5 right-1.5 border-0" onClick={() => setImages((x) => x.filter((_, j) => j !== i))}>
              <X aria-hidden />
            </Button>
          </li>
        ))}
        {Array.from({ length: uploading }, (_, i) => (
          <li key={`up-${i}`} className="grid aspect-square place-items-center rounded-xl bg-muted">
            <Spinner aria-label="Uploading photo" className="size-6 text-muted-foreground" />
          </li>
        ))}
        {images.length + uploading < max && (
          <li>
            <button
              type="button"
              onClick={() => file.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-sm text-muted-foreground hover:border-primary hover:text-primary"
            >
              <ImagePlus aria-hidden className="size-5" /> Add
            </button>
          </li>
        )}
      </ul>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => add(e.target.files)} />
      <p className="text-sm text-muted-foreground">Up to {max} photos. The first is the cover.</p>
    </fieldset>
  )
}

/** Reads the URLs an ImageUploader stored in a form. */
export const readImages = (form: FormData, name: string): string[] => JSON.parse(String(form.get(name) ?? "[]"))
