"use client"

import { useRouter } from "next/navigation"
import { LogOut, Settings, UserRound } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"

export function UserMenu() {
  const router = useRouter()
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const profileHref = user?.role === "creator" ? "/creator/account" : "/profile"
  const settingsHref = user?.role === "creator" ? "/creator/settings" : "/settings"

  return (
    <div className="flex items-center border-l border-zinc-200 pl-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={user?.name ?? t("nav.settings")}
          className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar>
            {user?.photo ? <AvatarImage src={user.photo} alt="" /> : null}
            <AvatarFallback>{user?.avatar ?? "??"}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" sideOffset={8} className="min-w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-foreground">
              <span className="block truncate font-medium">{user?.name}</span>
              {user?.organizationName && (
                <span className="block truncate font-normal text-muted-foreground">{user.organizationName}</span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(profileHref)}>
              <UserRound />
              {t("nav.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(settingsHref)}>
              <Settings />
              {t("nav.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                logout()
                router.push("/login")
              }}
            >
              <LogOut />
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
