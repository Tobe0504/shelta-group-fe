"use client"

import { Camera, LogOut, Trash2 } from "lucide-react"
import { useRef } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useChangePassword, useUpdateProfile } from "@/hooks/use-account"
import { useMe, useSignOut } from "@/hooks/use-auth"
import { useUpload } from "@/hooks/use-forms"
import { errorMessage } from "@/lib/http"
import type { User } from "@/lib/types"
import { PasswordInput } from "./password-input"
import { FormSkeleton } from "./skeletons"
import { UserAvatar } from "./user-avatar"

const notifications = [
  { key: "whatsapp", label: "WhatsApp updates", text: "Order confirmations, driver details and arrival times" },
  { key: "email", label: "Email updates", text: "Receipts, delivery updates and price drops" },
] as const

function PhotoCard({ user }: { user: User }) {
  const file = useRef<HTMLInputElement>(null)
  const update = useUpdateProfile()
  const upload = useUpload("avatar")
  const signOut = useSignOut()
  const busy = upload.isPending || update.isPending

  const pick = (f?: File) =>
    f && upload.mutate(f, { onSuccess: (avatar) => update.mutate({ avatar }, { onSuccess: () => toast.success("Photo updated") }), onError: (e) => toast.error(e instanceof Error ? e.message : errorMessage(e)) })

  return (
    <Card className="items-center gap-4 p-6 text-center max-sm:gap-2.5 max-sm:p-4 lg:sticky lg:top-32">
      <UserAvatar user={user} className="size-28 text-3xl max-sm:size-14 max-sm:text-lg" />
      <div>
        <p className="text-lg font-semibold max-sm:text-base">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <Badge variant={user.role === "buyer" ? "secondary" : "accent"}>{user.role === "buyer" ? "Buyer account" : user.role === "seller" ? "Seller account" : "Admin"}</Badge>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => pick(e.target.files?.[0])} />
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" size="sm" loading={busy} onClick={() => file.current?.click()}>
          {!busy && <Camera aria-hidden />} {user.avatar ? "Change photo" : "Add photo"}
        </Button>
        {user.avatar && (
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => update.mutate({ avatar: null })}>
            <Trash2 aria-hidden /> Remove
          </Button>
        )}
      </div>
      <Button variant="ghost" onClick={() => signOut.mutate()} className="text-muted-foreground">
        <LogOut aria-hidden /> Sign out
      </Button>
    </Card>
  )
}

function DetailsCard({ user }: { user: User }) {
  const update = useUpdateProfile()
  return (
    <Card>
      <CardHeader className="px-6 max-sm:px-3">
        <CardTitle className="text-lg max-sm:text-base">Personal details</CardTitle>
        <CardDescription>Used for delivery contacts and receipts.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 max-sm:px-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            update.mutate({ name: String(f.get("name")), phone: String(f.get("phone")) }, { onSuccess: () => toast.success("Profile saved") })
          }}
        >
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="p-name">Full name</FieldLabel>
              <Input id="p-name" name="name" defaultValue={user.name} required autoComplete="name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="p-phone">Phone</FieldLabel>
              <Input id="p-phone" name="phone" type="tel" defaultValue={user.phone} required autoComplete="tel" />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="p-email">Email</FieldLabel>
              <Input id="p-email" type="email" value={user.email} readOnly aria-describedby="p-email-help" />
              <FieldDescription id="p-email-help">Contact support to change the email you sign in with.</FieldDescription>
            </Field>
            <Button type="submit" className="w-fit" loading={update.isPending}>
              Save changes
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordCard() {
  const change = useChangePassword()
  return (
    <Card>
      <CardHeader className="px-6 max-sm:px-3">
        <CardTitle className="text-lg max-sm:text-base">Password</CardTitle>
        <CardDescription>You’ll stay signed in on this device.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 max-sm:px-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const f = new FormData(form)
            change.mutate({ current: String(f.get("current")), next: String(f.get("next")) }, { onSuccess: () => (form.reset(), toast.success("Password changed")) })
          }}
        >
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="pw-current">Current password</FieldLabel>
              <PasswordInput id="pw-current" name="current" autoComplete="current-password" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="pw-next">New password</FieldLabel>
              <PasswordInput id="pw-next" name="next" autoComplete="new-password" minLength={8} required />
            </Field>
            {change.isError && <FieldError className="sm:col-span-2">{errorMessage(change.error)}</FieldError>}
            <Button type="submit" variant="secondary" className="w-fit" loading={change.isPending}>
              Change password
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

function NotificationsCard({ user }: { user: User }) {
  const update = useUpdateProfile()
  return (
    <Card>
      <CardHeader className="px-6 max-sm:px-3">
        <CardTitle className="text-lg max-sm:text-base">Notifications</CardTitle>
        <CardDescription>How we tell you about orders and deliveries.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 max-sm:px-3">
        <FieldGroup>
          {notifications.map((n) => (
            <Field key={n.key} orientation="horizontal" className="justify-between">
              <div>
                <FieldLabel htmlFor={`n-${n.key}`}>{n.label}</FieldLabel>
                <FieldDescription>{n.text}</FieldDescription>
              </div>
              <Switch id={`n-${n.key}`} checked={user.notify[n.key]} disabled={update.isPending} onCheckedChange={(on) => update.mutate({ notify: { ...user.notify, [n.key]: on } })} />
            </Field>
          ))}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

export function ProfileForm() {
  const { data: user } = useMe()
  if (!user) return <FormSkeleton />
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
      <PhotoCard user={user} />
      <div className="flex flex-col gap-6">
        <DetailsCard user={user} />
        <PasswordCard />
        <NotificationsCard user={user} />
      </div>
    </div>
  )
}
