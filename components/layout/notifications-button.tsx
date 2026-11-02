"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  BadgeCheck,
  Bell,
  Clapperboard,
  Mail,
  Send,
  UserRoundPlus,
  UserRoundX,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n"
import {
  formatNotificationTime,
  isRecentNotification,
  notificationsForUser,
  type NotificationKind,
} from "@/lib/notifications"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useNotificationsStore } from "@/lib/stores/notifications"
import { localeToLang } from "@/lib/stores/preferences"
import { cn } from "@/lib/utils"

const ICONS: Record<NotificationKind, LucideIcon> = {
  application: UserRoundPlus,
  delivered: Clapperboard,
  invite: Mail,
  selected: BadgeCheck,
  declined: UserRoundX,
  submitted: Send,
  approved: BadgeCheck,
}

export function NotificationsButton() {
  const { t, locale } = useI18n()
  const user = useAuthStore((state) => state.user)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const readIds = useNotificationsStore((state) => state.readIds)
  const markRead = useNotificationsStore((state) => state.markRead)
  const markAllRead = useNotificationsStore((state) => state.markAllRead)
  const [open, setOpen] = useState(false)

  const items = useMemo(
    () => (user ? notificationsForUser(user, campaigns) : []),
    [campaigns, user],
  )
  const unreadIds = items
    .filter((item) => isRecentNotification(item.createdAt) && !readIds.includes(item.id))
    .map((item) => item.id)
  const unread = new Set(unreadIds)
  const label = unread.size
    ? `${t("notifications.label")}. ${t("notifications.unread", { count: unread.size })}`
    : t("notifications.label")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative text-zinc-500"
            aria-label={label}
          />
        }
      >
        <Bell />
        {unread.size > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-foreground" />}
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" sideOffset={8} className="w-96 p-0">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <PopoverTitle className="truncate text-sm">{t("notifications.title")}</PopoverTitle>
            {unread.size > 0 && <Badge variant="secondary">{unread.size}</Badge>}
          </div>
          {unread.size > 0 && (
            <Button type="button" variant="ghost" size="xs" className="shrink-0" onClick={() => markAllRead(unreadIds)}>
              {t("notifications.markAll")}
            </Button>
          )}
        </div>
        <Separator />
        {items.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t("notifications.empty")}</p>
        ) : (
          <div className="max-h-96 overflow-y-auto overscroll-contain">
            <ul>
              {items.map((item) => {
                const Icon = ICONS[item.kind]
                const read = !unread.has(item.id)
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        markRead(item.id)
                        setOpen(false)
                      }}
                      className={cn(
                        "flex gap-3 px-3 py-2.5 outline-none hover:bg-muted focus-visible:bg-muted",
                        !read && "bg-muted/40",
                      )}
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className={cn("truncate text-sm text-foreground", !read && "font-medium")}>
                            {t(item.titleKey)}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatNotificationTime(item.createdAt, localeToLang(locale))}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {t(item.bodyKey, item.vars)}
                        </span>
                      </span>
                      {!read && <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
