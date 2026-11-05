import axios from "axios"
import { data, http } from "@/lib/http"

export type UploadKind = "avatar" | "product" | "estate" | "quote"
type Signature = { uploadUrl: string; apiKey: string; timestamp: number; signature: string; folder: string; allowed_formats: string; maxBytes: number }

export const uploadsService = {
  /** Uploads straight to Cloudinary with a signature from the API; resolves to the file's URL. */
  async upload(file: File, kind: UploadKind) {
    const sig = await http.post("/uploads/sign", { kind }).then(data<Signature>)
    if (file.size > sig.maxBytes) throw new Error(`Files must be under ${Math.round(sig.maxBytes / 1_000_000)} MB`)
    const form = new FormData()
    Object.entries({ file, api_key: sig.apiKey, timestamp: String(sig.timestamp), signature: sig.signature, folder: sig.folder, allowed_formats: sig.allowed_formats }).forEach(([k, v]) => form.append(k, v))
    const res = await axios.post<{ secure_url: string }>(sig.uploadUrl, form)
    return res.data.secure_url
  },
}
