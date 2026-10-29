"use client"

import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
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

export function UserMenu({ settingsHref }: { settingsHref: string }) {
  const router = useRouter()
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={user?.name ?? t("nav.settings")}
        className="flex size-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring data-popup-open:ring-2 data-popup-open:ring-ring"
      >
        {user?.avatar ?? "??"}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-48" style={{ width: "12rem" }}>
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
  )
}
