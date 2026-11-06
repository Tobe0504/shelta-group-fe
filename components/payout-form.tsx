"use client"

import { BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Payout } from "@/lib/types"

type Bank = { name: string; code: string }
export type PayoutBody = { bankCode: string; bankName: string; accountNumber: string }

/** Bank account for payouts, shared by the seller centre and the pro centre. Shows the verified account when one is saved. */
export function PayoutForm({ payout, banks, saving, onSave }: { payout?: Payout; banks: { data?: Bank[]; isPending: boolean }; saving: boolean; onSave: (body: PayoutBody) => void }) {
  return (
    <div className="flex flex-col gap-5 max-sm:gap-3">
      {payout && (
        <p className="flex items-center gap-3 rounded-2xl bg-success-soft p-4 text-sm text-success-soft-foreground max-sm:gap-2 max-sm:rounded-xl max-sm:p-2.5 max-sm:text-xs">
          <BadgeCheck aria-hidden className="size-5 shrink-0 text-success" />
          <span>
            <strong className="font-semibold">{payout.accountName}</strong> · {payout.bankName} · ••••{payout.accountNumber.slice(-4)}
          </span>
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          const bank = banks.data?.find((b) => b.code === f.get("bank"))
          if (bank) onSave({ bankCode: bank.code, bankName: bank.name, accountNumber: String(f.get("account")) })
        }}
      >
        <FieldGroup>
          <div className="grid gap-4 max-sm:gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="bank">Bank</FieldLabel>
              <Select name="bank" required defaultValue={payout?.bankCode}>
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
              <Input id="acct" name="account" inputMode="numeric" pattern="\d{10}" maxLength={10} required defaultValue={payout?.accountNumber} />
              <FieldDescription>10-digit NUBAN</FieldDescription>
            </Field>
          </div>
          <Button type="submit" className="w-fit" loading={saving}>
            {payout ? "Update payout account" : "Save payout account"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
