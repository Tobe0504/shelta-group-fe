"use client";

import { useId, useState } from "react";
import { LocateFixed, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useAddressSearch, useCurrentLocation } from "@/hooks/use-geo";
import { errorMessage } from "@/lib/http";
import type { Coords, Place } from "@/lib/types";
import { cn } from "@/lib/utils";

type Option = { id: string; place?: Place; current?: true };

/**
 * Address combobox: type to search Nigerian streets and places (OpenStreetMap), or use the device's location.
 * Arrow keys move through results, Enter picks one.
 */
export function AddressSearch({
  onSelect,
  near,
  placeholder = "Search street, area or landmark",
  autoFocus,
  label = "Search for an address",
}: {
  onSelect: (place: Place) => void;
  near?: Coords;
  placeholder?: string;
  autoFocus?: boolean;
  label?: string;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const search = useAddressSearch(query, near);
  const current = useCurrentLocation();
  const searching = query.trim().length >= 3;
  const options: Option[] = [
    { id: `${id}-current`, current: true },
    ...(searching
      ? (search.data ?? []).map((place, i) => ({ id: `${id}-${i}`, place }))
      : []),
  ];

  const choose = (o?: Option) => {
    if (!o) return;
    if (o.place) return onSelect(o.place);
    current.mutate(undefined, {
      onSuccess: onSelect,
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : errorMessage(e)),
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive(
        (i) =>
          (i + (e.key === "ArrowDown" ? 1 : -1) + options.length) %
          options.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(options[active]);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <InputGroup className="rounded-full">
        <InputGroupAddon className="pl-4">
          {search.isFetching ? (
            <Spinner aria-hidden role={undefined} aria-label={undefined} />
          ) : (
            <Search aria-hidden />
          )}
        </InputGroupAddon>
        <InputGroupInput
          role="combobox"
          aria-label={label}
          aria-expanded
          aria-controls={`${id}-list`}
          aria-activedescendant={options[active]?.id}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
      </InputGroup>
      <ul
        id={`${id}-list`}
        role="listbox"
        aria-label="Suggestions"
        className="flex flex-col gap-1"
      >
        {options.map((o, i) => (
          <li
            key={o.id}
            id={o.id}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(o)}
            className={cn(
              "flex min-h-12 min-w-0 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2",
              i === active && "bg-accent text-accent-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl bg-muted",
                o.current && "bg-accent text-primary",
              )}
            >
              {o.current ? (
                current.isPending ? (
                  <Spinner
                    aria-hidden
                    role={undefined}
                    aria-label={undefined}
                  />
                ) : (
                  <LocateFixed aria-hidden className="size-4" />
                )
              ) : (
                <MapPin aria-hidden className="size-4" />
              )}
            </span>
            {o.current ? (
              <span className="font-medium">
                {current.isPending ? "Finding you…" : "Use my current location"}
              </span>
            ) : (
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{o.place!.label}</span>
                <span className="truncate text-sm text-muted-foreground">
                  {[o.place!.area, o.place!.state].filter(Boolean).join(" · ")}
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
      {searching && !search.isFetching && search.data?.length === 0 && (
        <p className="px-3 text-sm text-muted-foreground">
          No matches. Try a nearby street or landmark.
        </p>
      )}
      {search.isError && (
        <p className="px-3 text-sm text-destructive">
          {errorMessage(search.error)}
        </p>
      )}
    </div>
  );
}
