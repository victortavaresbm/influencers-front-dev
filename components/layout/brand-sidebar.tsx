"use client"
import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  ChartColumn,
  CircleDollarSign,
  ClipboardList,
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
import { UserMenu } from "@/components/layout/user-menu"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
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
  { href: "/briefing", icon: ClipboardList, labelKey: "nav.briefing" },
  { href: "/monitoring", icon: Radio, labelKey: "nav.monitoring" },
  { href: "/benchmark", icon: Gauge, labelKey: "nav.tracking" },
  { href: "/journeys", icon: Milestone, labelKey: "nav.journeys" },
  { href: "/metrics", icon: ChartColumn, labelKey: "nav.metrics" },
  { href: "/financial", icon: CircleDollarSign, labelKey: "nav.financial" },
]

export function BrandSidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const today = todayIso()
  const todayHealth = useMemo(() => {
    if (!user) return null
    const slots = buildSchedule(campaigns, today).filter(
      (slot) => slot.organizationId === user.organizationId,
    )
    return scheduleAttention(slots, today)
  }, [campaigns, today, user])

  return (
    <TooltipProvider delay={200}>
      <aside className="fixed left-0 top-0 h-screen w-14 flex flex-col items-center py-4 bg-white border-r border-zinc-200 z-40">
        <Link href="/dashboard" className="mb-6 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white text-xs font-bold">
          WS
        </Link>

        <nav className="flex flex-col items-center gap-1 flex-1">
          {NAV.map(({ href, icon, labelKey }) => (
            <SidebarIconLink
              key={href}
              href={href}
              icon={icon}
              label={href === "/calendar" && todayHealth ? `${t(labelKey)} · ${DAY_HEALTH_LABEL[todayHealth]}` : t(labelKey)}
              active={pathname === href || pathname.startsWith(href + "/")}
              health={href === "/calendar" ? todayHealth : undefined}
            />
          ))}
        </nav>

        <UserMenu settingsHref="/settings" />
      </aside>
    </TooltipProvider>
  )
}
