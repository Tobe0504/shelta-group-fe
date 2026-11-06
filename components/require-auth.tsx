"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-auth";
import type { Role } from "@/lib/types";
import { EmptyState } from "./empty-state";

/** Renders children only for a signed-in user (optionally of a given role); otherwise a sign-in prompt. */
export function RequireAuth({
  role,
  fallback,
  children,
}: {
  role?: Role;
  fallback: React.ReactNode;
  children: React.ReactNode;
}) {
  const { data: user, isPending } = useMe();
  const path = usePathname();
  if (isPending) return fallback;
  if (user && (!role || user.role === role || user.role === "admin"))
    return children;

  if (user && role === "admin")
    return (
      <EmptyState action={{ href: "/", label: "Back to the marketplace" }}>
        This area is for SheltaMart staff only.
      </EmptyState>
    );
  const seller = role === "seller";
  return (
    <div className="mx-auto my-auto flex max-w-md flex-col items-center gap-4 rounded-3xl bg-muted p-10 text-center max-sm:gap-3 max-sm:rounded-2xl max-sm:p-6">
      <span className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">
        <Lock aria-hidden className="size-6" />
      </span>
      <h1 className="text-2xl max-sm:text-lg">
        {seller ? "Seller account needed" : "Sign in to continue"}
      </h1>
      <p className="text-muted-foreground">
        {seller
          ? "Create a seller account to list products and manage orders."
          : "Your cart, orders, profile and saved items live in your account."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link
            href={
              seller
                ? "/signup?role=seller"
                : `/login?next=${encodeURIComponent(path)}`
            }
          >
            {seller ? "Create seller account" : "Sign in"}
          </Link>
        </Button>
        {!seller && (
          <Button asChild variant="secondary">
            <Link href={`/signup?next=${encodeURIComponent(path)}`}>
              Create account
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
