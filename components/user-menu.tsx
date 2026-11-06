"use client"

import Link from "next/link"
import { ClipboardList, HardHat, Heart, LayoutDashboard, LogOut, Package, Store, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useMe, useSignOut } from "@/hooks/use-auth"
import { UserAvatar } from "./user-avatar"

const itemClass = "min-h-10 rounded-lg"

/** Header account control: sign-in links when signed out, profile menu when signed in. */
export function UserMenu() {
  const { data: user, isPending } = useMe()
  const signOut = useSignOut()
  if (isPending) return <Skeleton className="size-11 rounded-full max-sm:size-9" />

  if (!user)
    return (
      <Button asChild variant="secondary" className="max-sm:size-9 max-sm:p-0">
        <Link href="/login" aria-label="Sign in">
          <UserRound aria-hidden />
          <span className="max-sm:hidden">Sign in</span>
        </Link>
      </Button>
    )

  const seller = user.role !== "buyer"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Account menu for ${user.name}`} className="p-0">
          <UserAvatar user={user} className="size-11 max-sm:size-9" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        <DropdownMenuLabel className="flex items-center gap-3 p-2 font-normal">
          <UserAvatar user={user} className="size-12" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-sm text-muted-foreground">{user.email}</span>
            <Badge variant={seller ? "accent" : "secondary"} className="mt-1">
              {user.role === "admin" ? "Admin" : seller ? "Seller account" : "Buyer account"}
            </Badge>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className={itemClass}>
            <Link href="/account/profile">
              <UserRound aria-hidden /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <Link href="/account">
              <Package aria-hidden /> Orders
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <Link href="/account/jobs">
              <ClipboardList aria-hidden /> My jobs
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <Link href="/saved">
              <Heart aria-hidden /> Saved items
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={itemClass}>
          <Link href={user.role === "admin" ? "/admin" : seller ? "/seller" : "/sell"}>
            {seller ? <LayoutDashboard aria-hidden /> : <Store aria-hidden />}
            {user.role === "admin" ? "Admin console" : seller ? "Seller dashboard" : "Start selling"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={itemClass}>
          <Link href="/pro">
            <HardHat aria-hidden /> Pro centre
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={itemClass} onSelect={() => signOut.mutate()}>
          <LogOut aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
