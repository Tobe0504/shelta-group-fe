"use client";

import { Building2, MapPin } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-auth";
import { useDeliveryLocation } from "@/hooks/use-location";
import { useSites } from "@/hooks/use-sites";
import type { Place } from "@/lib/types";
import { AddressSearch } from "./address-search";

/** Saved delivery sites as one-tap choices (signed-in buyers only). */
function SavedSites({ onSelect }: { onSelect: (place: Place) => void }) {
  const { data: me } = useMe();
  const { data: sites } = useSites(!!me);
  const usable = sites?.filter((s) => s.coords) ?? [];
  if (!usable.length) return null;
  return (
    <section
      aria-labelledby="saved-sites"
      className="flex min-w-0 flex-col gap-1 border-t pt-4"
    >
      <h3 id="saved-sites" className="px-3 text-sm text-muted-foreground">
        Your sites
      </h3>
      {usable.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() =>
            onSelect({
              label: s.address,
              area: s.area ?? s.label,
              coords: s.coords!,
            })
          }
          className="flex min-h-12 w-full min-w-0 items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-secondary"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
            <Building2 aria-hidden className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{s.label}</span>
            <span className="truncate text-sm text-muted-foreground">
              {s.address}
            </span>
          </span>
        </button>
      ))}
    </section>
  );
}

/** Delivery-location chooser. Pass a custom trigger as `children`, or get the header button. */
export function LocationPicker({
  children,
  compact,
}: {
  children?: React.ReactNode;
  /** A single small line, for the slim bar on phones. */
  compact?: boolean;
}) {
  const { location, setLocation, isPending } = useDeliveryLocation();
  const [open, setOpen] = useState(false);
  const pick = (place: Place) => {
    setLocation(place);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (compact ? (
          <button
            type="button"
            aria-label={`Deliver to ${location.area}. Change location`}
            className="mr-auto flex h-full min-w-0 items-center gap-1 text-left"
          >
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate font-semibold">{location.area}</span>
          </button>
        ) : (
          <button
            type="button"
            className="flex min-h-11 max-w-56 items-center gap-2 rounded-full px-2 text-left text-sm hover:bg-secondary"
          >
            <MapPin aria-hidden className="size-5 shrink-0" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-xs text-muted-foreground">Deliver to</span>
              {isPending ? (
                <Skeleton className="mt-0.5 h-4 w-16" />
              ) : (
                <span className="truncate font-semibold">{location.area}</span>
              )}
            </span>
          </button>
        ))}
      </DialogTrigger>
      {/* The dialog is a grid: min-w-0 on its children lets long addresses truncate instead of widening it. */}
      <DialogContent className="max-h-[85vh] gap-5 overflow-x-hidden overflow-y-auto sm:max-w-lg [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>Where should we deliver?</DialogTitle>
          <DialogDescription className="break-words">
            Delivery is priced by distance from each seller to this point. Now:{" "}
            {location.label}.
          </DialogDescription>
        </DialogHeader>
        <AddressSearch onSelect={pick} near={location.coords} autoFocus />
        <SavedSites onSelect={pick} />
      </DialogContent>
    </Dialog>
  );
}
