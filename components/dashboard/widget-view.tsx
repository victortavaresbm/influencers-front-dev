"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { AreaChart, BarChart, DonutChart, type CustomTooltipProps } from "@tremor/react"
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Activity,
  ArrowUpRight,
  DollarSign,
  Eye,
  Heart,
  Megaphone,
  MousePointerClick,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"
import { MembershipBadge } from "@/components/members/membership-badge"
import { networkChartColor, NetworkChartPalette } from "@/components/charts/network-colors"
import { useDashboardData, type RankedInfluencer } from "@/components/dashboard/dashboard-data"
import { CouponTicket } from "@/components/ui/coupon-ticket"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { campaignStatusKey, useI18n } from "@/lib/i18n"
import { NETWORK_DISTRIBUTION } from "@/lib/mock-data/metrics"
import { formatDateRangeBR } from "@/lib/dates"
import { membershipRoleOf } from "@/lib/stores/membership"
import { campaignRoi, ROI_TOOLTIP } from "@/lib/roi"
import type { WidgetId } from "@/lib/dashboard/layout"

const STATUS_COLORS: Record<string, string> = {
  em_execucao: "bg-zinc-900 text-white",
  aberta: "bg-zinc-700 text-white",
  rascunho: "bg-zinc-200 text-zinc-700",
  concluida: "bg-zinc-100 text-zinc-600",
  cancelada: "bg-red-100 text-red-700",
}

const NETWORK_BAR: Record<string, string> = {
  Instagram: "[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-pink-500",
  TikTok: "[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-zinc-900",
  YouTube: "[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-red-500",
}

const chartClass =
  "h-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-500 [&_.recharts-tooltip-cursor]:!fill-transparent"

const barClass =
  "h-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-500 [&_.recharts-bar-rectangle_rect]:fill-zinc-900 dark:[&_.recharts-bar-rectangle_rect]:fill-zinc-100 [&_.recharts-active-bar_.recharts-rectangle]:fill-zinc-900 dark:[&_.recharts-active-bar_.recharts-rectangle]:fill-zinc-100 [&_.recharts-tooltip-cursor]:!fill-transparent"

function fmt(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return value.toString()
}

function formatBrlK(value: number) {
  return `R$\u00A0${(value / 1000).toFixed(0)}k`
}

function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactPt(value: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function formatAudience(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`
  }
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return value.toLocaleString("pt-BR")
}

function seriesDot(name: string, series: { revenue: string; spend: string; reach: string; engagement: string; clicks: string }) {
  if (name === series.revenue) return "bg-emerald-500"
  if (name === series.spend) return "bg-rose-500"
  if (name === series.reach) return "bg-sky-500"
  if (name === series.engagement) return "bg-violet-500"
  if (name === series.clicks) return "bg-amber-500"
  return "bg-zinc-900"
}

function SeriesTooltip({
  active,
  payload,
  label,
  formatValue = (value) => fmt(value),
}: CustomTooltipProps & { formatValue?: (value: number) => string }) {
  const data = useDashboardData()
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((item) => {
          const value = typeof item.value === "number" ? item.value : Number(item.value)
          if (!Number.isFinite(value)) return null
          const name = String(item.name ?? item.dataKey ?? "")
          return (
            <div key={name} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                <span className={`h-2 w-2 rounded-full ${seriesDot(name, data.series)}`} />
                {name}
              </span>
              <span className="text-xs font-semibold tabular-nums text-zinc-900">{formatValue(value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MoneyTooltip(props: CustomTooltipProps) {
  return <SeriesTooltip {...props} formatValue={formatBrlK} />
}

function CampaignsBarTooltip({ active, payload, label }: CustomTooltipProps) {
  const { t } = useI18n()
  if (!active || !payload?.length) return null
  const raw = payload[0]?.value
  const value = typeof raw === "number" ? raw : Number(raw)
  if (!Number.isFinite(value)) return null

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900 tabular-nums">
        {value} {t(value === 1 ? "dashboard.campaignOne" : "dashboard.campaignMany")}
      </p>
    </div>
  )
}

const NUMBER_LOCALE = { pt: "pt-BR", en: "en", es: "es" } as const
const REACH_COLUMNS = "grid-cols-[minmax(6.5rem,9.25rem)_minmax(0,1fr)]"

function niceCeiling(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
  const step = steps.find((candidate) => candidate + 1e-9 >= normalized) ?? 10
  return step * magnitude
}

function CreatorReachChart({ items }: { items: { creator: string; reach: number }[] }) {
  const { t, locale } = useI18n()
  const max = niceCeiling(Math.max(...items.map((item) => item.reach)))
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((share) => share * max)
  const reachLabel = t("dashboard.reachLabel")

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative min-h-0 flex-1">
        <div className={`pointer-events-none absolute inset-0 grid ${REACH_COLUMNS}`} aria-hidden>
          <span />
          <span className="border-l border-zinc-200" />
        </div>
        <ul className="relative flex h-full flex-col justify-center gap-4">
          {items.map((item, index) => (
            <CreatorReachRow
              key={`${item.creator}-${index}`}
              creator={item.creator}
              reach={item.reach}
              max={max}
              detail={`${item.creator}: ${item.reach.toLocaleString(NUMBER_LOCALE[locale])} ${reachLabel}`}
            />
          ))}
        </ul>
      </div>
      <div className={`grid ${REACH_COLUMNS}`}>
        <span />
        <div className="relative h-5 border-t border-zinc-200">
          {ticks.map((tick, index) => {
            const share = (tick / max) * 100
            const align =
              index === 0 ? "translate-x-0" : index === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"
            return (
              <span
                key={`${tick}-${index}`}
                className={`absolute top-1 text-[11px] tabular-nums text-zinc-400 ${align}`}
                style={{ left: `${share}%` }}
              >
                {fmt(tick)}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CreatorReachRow({
  creator,
  reach,
  max,
  detail,
}: {
  creator: string
  reach: number
  max: number
  detail: string
}) {
  const width = max > 0 ? (reach / max) * 100 : 0
  const visual = reach > 0 ? Math.max(width, 0.8) : 0
  const label = fmt(reach)
  const trackRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const [inside, setInside] = useState(width >= 28)

  useLayoutEffect(() => {
    const track = trackRef.current
    const text = labelRef.current
    if (!track || !text) return

    const measure = () => {
      const barWidth = (visual / 100) * track.clientWidth
      setInside(barWidth >= text.offsetWidth + 20)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [visual, label])

  return (
    <li className={`group grid h-10 items-center ${REACH_COLUMNS}`} title={detail}>
      <p className="truncate pr-3 text-right text-xs text-zinc-500 group-hover:text-zinc-800" title={creator}>
        {creator}
      </p>
      <div ref={trackRef} className="relative flex h-full items-center">
        <div
          className="h-10 bg-zinc-900 transition-[width] duration-300 ease-out group-hover:bg-zinc-700 dark:bg-zinc-100 dark:group-hover:bg-white"
          style={{ width: `${visual}%` }}
        />
        <span
          ref={labelRef}
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-xs font-semibold whitespace-nowrap tabular-nums ${
            inside ? "text-white dark:text-zinc-900" : "text-zinc-900 dark:text-zinc-100"
          }`}
          style={inside ? { right: `calc(${100 - visual}% + 10px)` } : { left: `calc(${visual}% + 8px)` }}
        >
          {label}
        </span>
      </div>
    </li>
  )
}

function NetworkReachTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const value = typeof item?.value === "number" ? item.value : Number(item?.value)
  if (!Number.isFinite(value)) return null
  const name = String(item?.name ?? "")
  const total = NETWORK_DISTRIBUTION.reduce((sum, network) => sum + network.reach, 0)
  const share = total > 0 ? Math.round((value / total) * 100) : 0
  const dot = networkChartColor(name)?.dot ?? "bg-zinc-900"

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <p className="text-xs font-medium text-zinc-500">{name}</p>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900 tabular-nums">
        {`${(value / 1_000_000).toFixed(1)}M`}
        <span className="ml-1.5 text-xs font-medium text-zinc-400">{share}%</span>
      </p>
    </div>
  )
}

function WidgetShell({
  title,
  subtitle,
  action,
  legend,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  legend?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <div className="mb-3 flex items-start justify-between gap-3 pr-8">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
          {subtitle ? <p className="text-xs text-zinc-400">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {legend}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  title,
}: {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  title?: string
}) {
  return (
    <div className="flex h-full items-start justify-between gap-3 p-4" title={title}>
      <div className="min-w-0 pr-6">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <p className="mt-1 truncate text-2xl font-semibold text-zinc-900">{value}</p>
        {sub ? <p className="mt-0.5 truncate text-xs text-zinc-400">{sub}</p> : null}
      </div>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 group-hover:opacity-0">
        <Icon size={16} />
      </div>
    </div>
  )
}

function ReachRevenueChart() {
  const data = useDashboardData()
  const chartData = data.monthly.map((point) => ({
    month: point.month,
    [data.series.reach]: point.reach,
    [data.series.revenue]: point.revenue,
  }))

  return (
    <div className="h-full min-h-32 text-xs text-zinc-500">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
          <YAxis
            yAxisId="reach"
            axisLine={false}
            tickLine={false}
            width={48}
            domain={[0, "auto"]}
            tickFormatter={formatCompactPt}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            axisLine={false}
            tickLine={false}
            width={64}
            domain={[0, "auto"]}
            tickFormatter={(value: number) => `R$\u00A0${formatCompactPt(value)}`}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <Tooltip
            content={(props) => (
              <ReachRevenueTooltip active={props.active} payload={props.payload} label={props.label} />
            )}
            cursor={{ fill: "rgba(128,128,128,0.12)" }}
            wrapperStyle={{ zIndex: 30, outline: "none" }}
          />
          <Bar
            yAxisId="revenue"
            dataKey={data.series.revenue}
            fill="var(--color-emerald-500)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Line
            yAxisId="reach"
            dataKey={data.series.reach}
            type="monotone"
            stroke="var(--color-sky-500)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-sky-500)" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function ReachRevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name?: unknown; dataKey?: unknown; value?: unknown }>
  label?: unknown
}) {
  const data = useDashboardData()
  if (!active || !payload?.length) return null
  const rows = payload
    .map((item) => ({
      name: String(item.name ?? item.dataKey ?? ""),
      value: typeof item.value === "number" ? item.value : Number(item.value),
    }))
    .filter(
      (row) =>
        (row.name === data.series.reach || row.name === data.series.revenue) && Number.isFinite(row.value),
    )
  if (!rows.length) return null

  return (
    <div data-keep-theme className="min-w-44 rounded-lg border border-zinc-400 bg-white px-3 py-2.5 shadow-lg">
      <p className="text-xs font-medium text-zinc-500">{String(label ?? "")}</p>
      <div className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-xs text-zinc-700">
              <span className={`h-2 w-2 rounded-full ${seriesDot(row.name, data.series)}`} />
              {row.name}
            </span>
            <span className="text-xs font-semibold tabular-nums text-zinc-700">
              {row.name === data.series.revenue ? formatBrl(row.value) : formatCompactPt(row.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InfluencerRanking({ influencers }: { influencers: RankedInfluencer[] }) {
  const { t, locale } = useI18n()
  const roles = useDashboardData().roles
  const [mode, setMode] = useState<"faturamento" | "audiencia">("faturamento")
  const pool = mode === "audiencia" ? influencers.filter((item) => item.contentTracked) : influencers
  const ranked = [...pool]
    .sort((a, b) => {
      const primary = mode === "faturamento" ? b.revenue - a.revenue : b.audience - a.audience
      if (primary !== 0) return primary
      const secondary = mode === "faturamento" ? b.audience - a.audience : b.revenue - a.revenue
      if (secondary !== 0) return secondary
      return a.name.localeCompare(b.name, locale === "pt" ? "pt-BR" : locale)
    })
    .slice(0, 3)

  return (
    <WidgetShell
      title={t("dashboard.rankingTitle")}
      subtitle={t("dashboard.rankingSub")}
      action={
        <Tabs value={mode} onValueChange={(value) => value === "audiencia" ? setMode("audiencia") : setMode("faturamento")}>
          <TabsList>
            <TabsTrigger value="faturamento" className="px-2 text-xs">
              {t("dashboard.revenueTab")}
            </TabsTrigger>
            <TabsTrigger value="audiencia" className="px-2 text-xs">
              {t("dashboard.audienceTab")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      {ranked.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-zinc-400">{t("dashboard.emptyRanking")}</p>
      ) : (
        <div className="space-y-2 overflow-auto">
          {ranked.map((influencer, index) => (
            <div key={influencer.id} className="flex items-center justify-between gap-3 rounded-lg px-1 py-2">
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-4 text-xs font-semibold tabular-nums text-zinc-400">{index + 1}</span>
                <div className="relative size-9 shrink-0">
                  <div className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                    {influencer.avatar}
                  </div>
                  {influencer.photo ? (
                    <img
                      src={influencer.photo}
                      alt=""
                      className="absolute inset-0 size-9 rounded-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none"
                      }}
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-medium text-zinc-900">
                    <span className="truncate">{influencer.name}</span>
                    {influencer.instagramVerified ? <VerifiedBadge className="size-3.5" /> : null}
                    <MembershipBadge role={membershipRoleOf(influencer.id, roles)} />
                  </p>
                  {influencer.coupon ? (
                    <CouponTicket code={influencer.coupon} className="mt-1" />
                  ) : (
                    <p className="mt-0.5 text-xs text-zinc-400">{t("dashboard.noCoupon")}</p>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                {mode === "audiencia" ? (
                  <>
                    <p className="text-sm font-semibold tabular-nums text-zinc-900">{formatAudience(influencer.audience)}</p>
                    <p className="text-xs text-zinc-400">{t("dashboard.followers")}</p>
                    <p className="mt-0.5 text-xs font-medium tabular-nums text-zinc-600">{formatBrl(influencer.revenue)}</p>
                  </>
                ) : (
                  <p className="text-sm font-semibold tabular-nums text-zinc-900">{formatBrl(influencer.revenue)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  )
}

export function WidgetView({ widget }: { widget: WidgetId }) {
  const { t } = useI18n()
  const data = useDashboardData()
  const revenue = data.series.revenue
  const spend = data.series.spend
  const reach = data.series.reach
  const engagement = data.series.engagement
  const clicks = data.series.clicks

  switch (widget) {
    case "active-campaigns":
      return (
        <KpiCard
          label={t("dashboard.activeCampaigns")}
          value={data.activeCampaigns.length}
          sub={t("dashboard.totalCount", { count: data.orgCampaigns.length })}
          icon={Megaphone}
        />
      )
    case "creators":
      return (
        <KpiCard
          label={t("dashboard.creatorsInBase")}
          value={data.creatorsCount}
          sub={t("dashboard.thisWeek")}
          icon={Users}
        />
      )
    case "investment":
      return (
        <KpiCard
          label={t("dashboard.totalInvestment")}
          value={`R$ ${(data.totalSpend / 1000).toFixed(0)}k`}
          sub={t("dashboard.revenueSub", { value: `R$ ${(data.totalRevenue / 1000).toFixed(0)}k` })}
          icon={DollarSign}
        />
      )
    case "roi":
      return (
        <KpiCard
          label={t("dashboard.averageRoi")}
          value={data.roi !== undefined ? `${data.roi}%` : "—"}
          sub={t("dashboard.completedCampaigns")}
          icon={TrendingUp}
          title={ROI_TOOLTIP}
        />
      )
    case "reach":
      return <KpiCard label={t("dashboard.totalReach")} value={fmt(data.totalReach)} icon={Eye} />
    case "engagement":
      return <KpiCard label={t("dashboard.totalEngagement")} value={fmt(data.totalEngagement)} icon={Heart} />
    case "clicks":
      return <KpiCard label={t("dashboard.clicks")} value={fmt(data.totalClicks)} icon={MousePointerClick} />
    case "revenue":
      return (
        <KpiCard
          label={t("dashboard.revenueGenerated")}
          value={`R$ ${fmt(data.totalRevenue)}`}
          icon={DollarSign}
        />
      )
    case "monthly-overview":
      return (
        <WidgetShell title={t("dashboard.monthlyView")} subtitle={t("dashboard.monthlyViewSub")} action={<Activity size={16} className="text-zinc-400" />}>
          <AreaChart
            data={data.monthly.map((point) => ({ month: point.month, [revenue]: point.revenue, [spend]: point.spend }))}
            index="month"
            categories={[revenue, spend]}
            colors={["emerald", "rose"]}
            valueFormatter={formatBrlK}
            showLegend
            showGridLines={false}
            yAxisWidth={72}
            allowDecimals={false}
            customTooltip={MoneyTooltip}
            className={chartClass}
          />
        </WidgetShell>
      )
    case "reach-revenue":
      return (
        <WidgetShell
          title={t("dashboard.reachRevenue")}
          subtitle={t("dashboard.reachRevenueSub")}
          legend={
            <div className="mb-3 flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 rounded-full bg-sky-500" />
                {reach}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-emerald-500" />
                {revenue}
              </span>
            </div>
          }
        >
          <ReachRevenueChart />
        </WidgetShell>
      )
    case "investment-vs-revenue":
      return (
        <WidgetShell title={t("dashboard.investmentVsRevenue")} subtitle={t("dashboard.investmentVsRevenueSub")}>
          <BarChart
            data={data.monthly.map((point) => ({ month: point.month, [revenue]: point.revenue, [spend]: point.spend }))}
            index="month"
            categories={[revenue, spend]}
            colors={["emerald", "rose"]}
            valueFormatter={formatBrlK}
            showLegend
            showGridLines={false}
            yAxisWidth={72}
            allowDecimals={false}
            customTooltip={MoneyTooltip}
            className={chartClass}
          />
        </WidgetShell>
      )
    case "reach-by-network": {
      const total = NETWORK_DISTRIBUTION.reduce((sum, network) => sum + network.reach, 0)
      return (
        <WidgetShell title={t("dashboard.reachByNetwork")} subtitle={t("dashboard.reachByNetworkSub")}>
          <div className="flex h-full min-h-0 flex-col">
            <NetworkChartPalette />
            <DonutChart
              data={NETWORK_DISTRIBUTION.map((network) => ({ name: network.network, value: network.reach }))}
              category="value"
              index="name"
              colors={NETWORK_DISTRIBUTION.map((network) => networkChartColor(network.network)?.tremor ?? "zinc")}
              valueFormatter={(value) => `${(value / 1_000_000).toFixed(1)}M`}
              customTooltip={NetworkReachTooltip}
              className="h-32 shrink-0 [&_.recharts-pie-sector]:!opacity-100 [&_.recharts-pie-sector_path]:!opacity-100"
            />
            <ul className="mt-3 space-y-2 overflow-auto">
              {NETWORK_DISTRIBUTION.map((network) => {
                const share = total > 0 ? Math.round((network.reach / total) * 100) : 0
                return (
                  <li key={network.network} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 text-zinc-600">
                      <span className={`size-2 rounded-full ${networkChartColor(network.network)?.dot ?? "bg-zinc-900"}`} />
                      {network.network}
                    </span>
                    <span className="font-medium tabular-nums text-zinc-900">
                      {`${(network.reach / 1_000_000).toFixed(1)}M`}
                      <span className="ml-2 font-normal text-zinc-400">{share}%</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </WidgetShell>
      )
    }
    case "engagement-by-network":
      return (
        <WidgetShell title={t("dashboard.engagementByNetwork")}>
          <div className="space-y-4 overflow-auto">
            {NETWORK_DISTRIBUTION.map((network) => (
              <div key={network.network}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-zinc-800">{network.network}</span>
                  <span className="tabular-nums text-zinc-500">{network.engagement}%</span>
                </div>
                <Progress value={(network.engagement / 10) * 100} className={NETWORK_BAR[network.network]} />
                <p className="mt-1 text-xs text-zinc-400">
                  {t("dashboard.activeCreators", { count: network.creators })}
                </p>
              </div>
            ))}
          </div>
        </WidgetShell>
      )
    case "campaign-reach":
      return (
        <WidgetShell
          title={data.activeCampaign ? `${t("dashboard.campaignReach")} — ${data.activeCampaign.name}` : t("dashboard.campaignReach")}
          subtitle={data.activeSeries.length ? t("dashboard.campaignReachSub") : t("dashboard.noActiveCampaign")}
        >
          {data.activeSeries.length ? (
            <AreaChart
              data={data.activeSeries.map((point) => ({ date: point.date, [reach]: point.reach }))}
              index="date"
              categories={[reach]}
              colors={["sky"]}
              valueFormatter={(value) => fmt(value)}
              showLegend={false}
              showGridLines={false}
              yAxisWidth={44}
              customTooltip={SeriesTooltip}
              className={chartClass}
            />
          ) : (
            <p className="text-sm text-zinc-400">{t("dashboard.noActiveCampaign")}</p>
          )}
        </WidgetShell>
      )
    case "campaign-engagement":
      return (
        <WidgetShell
          title={
            data.activeCampaign
              ? `${t("dashboard.campaignEngagement")} — ${data.activeCampaign.name}`
              : t("dashboard.campaignEngagement")
          }
          subtitle={data.activeSeries.length ? t("dashboard.campaignEngagementSub") : t("dashboard.noActiveCampaign")}
        >
          {data.activeSeries.length ? (
            <AreaChart
              data={data.activeSeries.map((point) => ({
                date: point.date,
                [engagement]: point.engagement,
                [clicks]: point.clicks,
              }))}
              index="date"
              categories={[engagement, clicks]}
              colors={["violet", "amber"]}
              valueFormatter={(value) => fmt(value)}
              showLegend
              showGridLines={false}
              yAxisWidth={40}
              customTooltip={SeriesTooltip}
              className={chartClass}
            />
          ) : (
            <p className="text-sm text-zinc-400">{t("dashboard.noActiveCampaign")}</p>
          )}
        </WidgetShell>
      )
    case "campaigns-by-month":
      return (
        <WidgetShell title={t("dashboard.campaignsByMonth")} subtitle={t("dashboard.campaignsByMonthSub")}>
          <BarChart
            data={data.monthly}
            index="month"
            categories={["campaigns"]}
            colors={["zinc"]}
            valueFormatter={(value) => `${value}`}
            showLegend={false}
            showGridLines={false}
            yAxisWidth={36}
            allowDecimals={false}
            customTooltip={CampaignsBarTooltip}
            className={barClass}
          />
        </WidgetShell>
      )
    case "top-creators":
      return (
        <WidgetShell title={t("dashboard.topCreators")} subtitle={t("dashboard.topCreatorsSub")}>
          {data.creatorPerformance.length > 0 ? (
            <CreatorReachChart items={data.creatorPerformance} />
          ) : (
            <p className="text-sm text-zinc-400">{t("dashboard.noData")}</p>
          )}
        </WidgetShell>
      )
    case "recent-campaigns":
      return (
        <WidgetShell
          title={t("dashboard.recentCampaigns")}
          action={
            <Link href="/campaigns" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900">
              {t("dashboard.seeAll")} <ArrowUpRight size={12} />
            </Link>
          }
        >
          <div className="space-y-1 overflow-auto">
            {data.orgCampaigns.slice(0, 5).map((campaign) => {
              const recentRoi = campaignRoi(campaign)
              return (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="group/campaign flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-zinc-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-700">
                      {campaign.organizationName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 group-hover/campaign:underline">{campaign.name}</p>
                      <p className="truncate text-xs text-zinc-400">
                        {t("dashboard.creatorsCount", { count: campaign.participants.length })} ·{" "}
                        {formatDateRangeBR(campaign.startDate, campaign.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {recentRoi !== undefined ? (
                      <span className="text-xs font-medium text-zinc-600" title={ROI_TOOLTIP}>
                        ROI {recentRoi}%
                      </span>
                    ) : null}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[campaign.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {t(campaignStatusKey(campaign.status))}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </WidgetShell>
      )
    case "influencer-ranking":
      return <InfluencerRanking influencers={data.ranking} />
    case "tracked-sales":
      return (
        <WidgetShell title={t("dashboard.trackedSales")} subtitle={t("dashboard.trackedSalesSub")}>
          {data.salesRanking.length === 0 ? (
            <p className="text-sm text-zinc-400">{t("dashboard.noSales")}</p>
          ) : (
            <ul className="divide-y divide-zinc-100 overflow-auto">
              {data.salesRanking.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">{member.name}</p>
                    <p className="text-xs text-zinc-400">{member.handle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MembershipBadge role={membershipRoleOf(member.id, data.roles)} />
                    <span className="text-sm font-semibold tabular-nums text-zinc-900">{formatBrl(member.sales)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </WidgetShell>
      )
    case "campaigns-table":
      return (
        <WidgetShell title={t("dashboard.campaignsTable")} subtitle={t("dashboard.campaignsTableSub")}>
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    t("dashboard.col.campaign"),
                    t("dashboard.col.reach"),
                    t("dashboard.col.engagement"),
                    t("dashboard.col.clicks"),
                    t("dashboard.col.revenue"),
                    t("dashboard.col.roi"),
                  ].map((heading) => (
                    <TableHead key={heading} className="text-xs text-zinc-500">
                      {heading}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.orgCampaigns
                  .filter((campaign) => campaign.totalReach)
                  .map((campaign) => {
                    const roi = campaignRoi(campaign)
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="text-sm font-medium text-zinc-900">{campaign.name}</TableCell>
                        <TableCell className="text-sm text-zinc-700">{fmt(campaign.totalReach ?? 0)}</TableCell>
                        <TableCell className="text-sm text-zinc-700">{fmt(campaign.totalEngagement ?? 0)}</TableCell>
                        <TableCell className="text-sm text-zinc-700">{fmt(campaign.totalClicks ?? 0)}</TableCell>
                        <TableCell className="text-sm text-zinc-700">R$ {fmt(campaign.totalRevenue ?? 0)}</TableCell>
                        <TableCell className="text-sm font-semibold text-zinc-900" title={ROI_TOOLTIP}>
                          {roi !== undefined ? `${roi}%` : "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
        </WidgetShell>
      )
    default:
      return null
  }
}
