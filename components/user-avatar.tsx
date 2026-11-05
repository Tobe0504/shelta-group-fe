import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")

export function UserAvatar({ user, className }: { user: Pick<User, "name" | "avatar">; className?: string }) {
  return (
    <Avatar className={cn("size-9", className)}>
      {user.avatar && <AvatarImage src={user.avatar} alt="" className="object-cover" />}
      <AvatarFallback className="bg-[#E0ECFF] font-semibold text-[#1D4ED8]">{initials(user.name)}</AvatarFallback>
    </Avatar>
  )
}
