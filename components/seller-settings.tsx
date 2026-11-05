"use client"

import { useState } from "react"
import { BadgeCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useBanks, useOwnStore, useSetPayout, useUpdateStore } from "@/hooks/use-seller"
import type { OwnStore, Place } from "@/lib/types"
import { AddressSearch } from "./address-search"
import { PickedPlace } from "./picked-place"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"
import { FormSkeleton } from "./skeletons"

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="px-6">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-6">{children}</CardContent>
    </Card>
  )
}

function ProfileCard({ store }: { store: OwnStore }) {
  const update = useUpdateStore()
  const [place, setPlace] = useState<Place | null>(store.coords ? { label: store.address ?? store.location ?? "Warehouse", area: store.location ?? "", coords: store.coords } : null)
  const [searching, setSearching] = useState(false)
  return (
    <SettingsCard title="Store profile" description="Shown on your products and in buyers’ carts.">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          update.mutate(
            { name: String(f.get("name")), about: String(f.get("about")), ...(place && { address: place.label, location: place.area, coords: place.coords }) },
            { onSuccess: () => toast.success("Store profile saved") },
          )
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="store-name">Store name</FieldLabel>
            <Input id="store-name" name="name" required defaultValue={store.name} />
          </Field>
          <Field>
            <FieldLabel>Warehouse location</FieldLabel>
            {place && !searching ? (
              <PickedPlace place={place} onChange={() => setSearching(true)} />
            ) : (
              <AddressSearch
                label="Search for your warehouse address"
                near={store.coords}
                onSelect={(p) => {
                  setPlace(p)
                  setSearching(false)
                }}
              />
            )}
            <FieldDescription>Delivery fees are worked out from here to each buyer’s site, so set it as exactly as you can.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="about">About your store</FieldLabel>
            <Textarea id="about" name="about" defaultValue={store.about} placeholder="What you stock, how long you’ve been trading, delivery coverage" />
          </Field>
          <Button type="submit" className="w-fit" loading={update.isPending}>
            Save profile
          </Button>
        </FieldGroup>
      </form>
    </SettingsCard>
  )
}

function PayoutCard({ store }: { store: OwnStore }) {
  const banks = useBanks()
  const setPayout = useSetPayout()
  return (
    <SettingsCard title="Payouts" description="Released payments go to this account. We check the account name with your bank.">
      {store.payout && (
        <p className="mb-5 flex items-center gap-3 rounded-2xl bg-success-soft p-4 text-sm text-success-soft-foreground">
          <BadgeCheck aria-hidden className="size-5 shrink-0 text-success" />
          <span>
            <strong className="font-semibold">{store.payout.accountName}</strong> · {store.payout.bankName} · ••••{store.payout.accountNumber.slice(-4)}
          </span>
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          const bank = banks.data?.find((b) => b.code === f.get("bank"))
          if (!bank) return
          setPayout.mutate({ bankCode: bank.code, bankName: bank.name, accountNumber: String(f.get("account")) }, { onSuccess: (s) => toast.success(`Payouts will go to ${s.payout?.accountName}`) })
        }}
      >
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="bank">Bank</FieldLabel>
              <Select name="bank" required defaultValue={store.payout?.bankCode}>
                <SelectTrigger id="bank" disabled={banks.isPending}>
                  <SelectValue placeholder={banks.isPending ? "Loading banks…" : "Choose bank"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {banks.data?.map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="acct">Account number</FieldLabel>
              <Input id="acct" name="account" inputMode="numeric" pattern="\d{10}" maxLength={10} required defaultValue={store.payout?.accountNumber} />
              <FieldDescription>10-digit NUBAN</FieldDescription>
            </Field>
          </div>
          <Button type="submit" className="w-fit" loading={setPayout.isPending}>
            {store.payout ? "Update payout account" : "Save payout account"}
          </Button>
        </FieldGroup>
      </form>
    </SettingsCard>
  )
}

export function SellerSettings() {
  const { data: store, isPending, isError } = useOwnStore()
  return (
    <>
      <PageHeader title="Store settings" description="How your store appears to buyers, and where we send your money." />
      {isPending ? (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <FormSkeleton fields={3} />
          <FormSkeleton fields={2} />
        </div>
      ) : isError ? (
        <EmptyState>We couldn’t load your store. Refresh to try again.</EmptyState>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <ProfileCard store={store} />
          <PayoutCard store={store} />
        </div>
      )}
    </>
  )
}
