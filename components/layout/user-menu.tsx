"use client"

import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
  const settingsHref = user?.role === "creator" ? "/creator/settings" : "/settings"

  return (
    <div className="flex items-center border-l border-zinc-200 pl-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={user?.name ?? t("nav.settings")}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-left outline-none hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-zinc-100"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
            {user?.avatar ?? "??"}
          </span>
          <span className="hidden sm:block">
            <span className="block text-xs font-medium leading-none text-zinc-800">{user?.name}</span>
            {user?.organizationName && (
              <span className="mt-0.5 block text-xs text-zinc-400">{user.organizationName}</span>
            )}
          </span>
          {user?.plan && (
            <Badge variant="outline" className="hidden text-xs sm:flex">
              {user.plan}
            </Badge>
          )}
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
