"use client"

import { useMutation } from "@tanstack/react-query"
import { formsService } from "@/services/forms.service"
import { uploadsService, type UploadKind } from "@/services/uploads.service"

export const useRequestQuote = () => useMutation({ mutationFn: formsService.requestQuote })
export const useEnquiry = () => useMutation({ mutationFn: formsService.enquire })
export const useUpload = (kind: UploadKind) => useMutation({ mutationFn: (file: File) => uploadsService.upload(file, kind) })
