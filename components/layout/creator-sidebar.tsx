"use client"
import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, CircleDollarSign, LayoutDashboard, Megaphone, Search, type LucideIcon } from "lucide-react"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { SidebarIconLink } from "@/components/layout/sidebar-icon"
import { UserMenu } from "@/components/layout/user-menu"
import { PartnerCommunitySwitcher } from "@/components/community/partner-community-switcher"
import { usePartnerCommunity } from "@/lib/stores/partner-community"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { CREATORS } from "@/lib/mock-data/creators"
import { DAY_HEALTH_LABEL, buildSchedule, scheduleAttention, todayIso } from "@/lib/schedule"

const GLOBAL_NAV: { href: string; icon: LucideIcon; labelKey: MessageKey }[] = [
  { href: "/creator/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/creator/financial", icon: CircleDollarSign, labelKey: "nav.financial" },
  { href: "/creator/campaigns", icon: Megaphone, labelKey: "nav.myCampaigns" },
  { href: "/creator/calendar", icon: CalendarDays, labelKey: "nav.calendar" },
  { href: "/creator/opportunities", icon: Search, labelKey: "nav.opportunities" },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

export function CreatorSidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const { selected } = usePartnerCommunity()
  const user = useAuthStore((s) => s.user)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const today = todayIso()
  const creatorId = CREATORS.find((creator) => creator.email === user?.email)?.id
  const todayHealth = useMemo(() => {
    if (!creatorId) return null
    const slots = buildSchedule(campaigns, today).filter((slot) => slot.creatorId === creatorId)
    return scheduleAttention(slots, today)
  }, [campaigns, creatorId, today])

  return (
    <TooltipProvider delay={200}>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col items-center border-r border-zinc-200 bg-white py-4">
        <Link href="/creator/dashboard" className="mb-6 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
          WS
        </Link>

        <nav className="flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto">
          {GLOBAL_NAV.map(({ href, icon, labelKey }) => (
            <SidebarIconLink
              key={href}
              href={href}
              icon={icon}
              label={href === "/creator/calendar" && todayHealth ? `${t(labelKey)} · ${DAY_HEALTH_LABEL[todayHealth]}` : t(labelKey)}
              active={isActive(pathname, href)}
              health={href === "/creator/calendar" ? todayHealth : undefined}
            />
          ))}

          {selected && (
            <>
              <Separator className="my-2 w-8" />
              <PartnerCommunitySwitcher variant="icon" />
            </>
          )}
        </nav>

        <UserMenu settingsHref="/creator/settings" />
      </aside>
    </TooltipProvider>
  )
}
