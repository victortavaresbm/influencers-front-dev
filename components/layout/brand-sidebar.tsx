"use client"
import { startTransition, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  Gauge,
  Gift,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Milestone,
  Radio,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarIconLink } from "@/components/layout/sidebar-icon"
import { brandCreatorIds } from "@/lib/discovery/scope"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useCreatorStore } from "@/lib/stores/creators"
import { useListStore } from "@/lib/stores/lists"
import { DAY_HEALTH_LABEL, buildSchedule, scheduleAttention, todayIso } from "@/lib/schedule"

const NAV: { href: string; icon: LucideIcon; labelKey: MessageKey }[] = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/discovery", icon: Search, labelKey: "nav.discovery" },
  { href: "/campaigns", icon: Megaphone, labelKey: "nav.campaigns" },
  { href: "/seeding", icon: Gift, labelKey: "nav.seeding" },
  { href: "/calendar", icon: CalendarDays, labelKey: "nav.calendar" },
  { href: "/crm", icon: Users, labelKey: "nav.prm" },
  { href: "/community", icon: MessagesSquare, labelKey: "nav.community" },
  { href: "/forms", icon: FileText, labelKey: "nav.forms" },
  { href: "/monitoring", icon: Radio, labelKey: "nav.monitoring" },
  { href: "/benchmark", icon: Gauge, labelKey: "nav.tracking" },
  { href: "/journeys", icon: Milestone, labelKey: "nav.journeys" },
  { href: "/financial", icon: CircleDollarSign, labelKey: "nav.financial" },
]

export function BrandSidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const creators = useCreatorStore((s) => s.creators)
  const lists = useListStore((s) => s.lists)
  const [today, setToday] = useState<string | null>(null)
  useEffect(() => {
    startTransition(() => setToday(todayIso()))
  }, [])
  const pendingApprovals = useMemo(() => {
    if (!user?.organizationId) return 0
    const ids = new Set(brandCreatorIds(user.organizationId))
    for (const list of lists) {
      if (list.organizationId !== user.organizationId) continue
      for (const id of list.creatorIds) ids.add(id)
    }
    return creators.filter((creator) => ids.has(creator.id) && creator.approvalStatus === "pending").length
  }, [creators, lists, user?.organizationId])
  const todayHealth = useMemo(() => {
    if (!user || !today) return null
    const slots = buildSchedule(campaigns, today).filter(
      (slot) => slot.organizationId === user.organizationId,
    )
    return scheduleAttention(slots, today)
  }, [campaigns, today, user])

  return (
    <TooltipProvider delay={200}>
      <aside className="fixed left-0 top-0 h-screen w-14 flex flex-col items-center py-4 bg-white border-r border-zinc-200 z-40">
        <Link href="/dashboard" aria-label="WeSell" className="mb-6 flex size-8 items-center justify-center overflow-hidden rounded-full bg-black">
          <img src="/logos/wesell.png" alt="" className="h-auto w-[22px]" />
        </Link>

        <nav className="flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto">
          {NAV.map(({ href, icon, labelKey }) => (
            <SidebarIconLink
              key={href}
              href={href}
              icon={icon}
              label={
                href === "/crm" && pendingApprovals > 0
                  ? `${t(labelKey)} · ${pendingApprovals} ${pendingApprovals === 1 ? "pendente" : "pendentes"}`
                  : href === "/calendar" && todayHealth
                    ? `${t(labelKey)} · ${DAY_HEALTH_LABEL[todayHealth]}`
                    : t(labelKey)
              }
              active={pathname === href || pathname.startsWith(href + "/")}
              health={href === "/calendar" ? todayHealth : undefined}
              alert={href === "/crm" && pendingApprovals > 0}
            />
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  )
}
