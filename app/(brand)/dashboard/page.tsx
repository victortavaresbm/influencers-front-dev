"use client"
import { useState } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { useAuthStore } from "@/lib/stores/auth"
import { CAMPAIGNS, type Campaign } from "@/lib/mock-data/campaigns"
import { CREATORS } from "@/lib/mock-data/creators"
import { MONTHLY_OVERVIEW } from "@/lib/mock-data/metrics"
import { AreaChart, BarChart, DonutChart, type CustomTooltipProps } from "@tremor/react"
import { NETWORK_CHART_COLOR, NetworkChartPalette } from "@/components/charts/network-colors"
import { Card } from "@/components/ui/card"
import { CouponTicket } from "@/components/ui/coupon-ticket"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { campaignStatusKey, translate, useI18n } from "@/lib/i18n"
import { usePreferencesStore } from "@/lib/stores/preferences"
import { formatDateRangeBR } from "@/lib/dates"
import Link from "next/link"
import {
  TrendingUp,
  Users,
  Megaphone,
  DollarSign,
  ArrowUpRight,
  Activity,
} from "lucide-react"

function formatBrlK(value: number) {
  return `R$\u00A0${(value / 1000).toFixed(0)}k`
}

function MonthlyOverviewTooltip({ active, payload, label }: CustomTooltipProps) {
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
                <span
                  className={`h-2 w-2 rounded-full ${name === "Receita" || name === "Revenue" || name === "Ingresos" ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                {name}
              </span>
              <span className="text-xs font-semibold tabular-nums text-zinc-900">
                {formatBrlK(value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const NETWORK_REACH = [
  { name: "Instagram", value: 4200000, dot: NETWORK_CHART_COLOR.instagram.dot },
  { name: "TikTok", value: 6800000, dot: NETWORK_CHART_COLOR.tiktok.dot },
  { name: "YouTube", value: 2100000, dot: NETWORK_CHART_COLOR.youtube.dot },
]

function formatReach(value: number) {
  return `${(value / 1000000).toFixed(1)}M`
}

function NetworkTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const value = typeof item?.value === "number" ? item.value : Number(item?.value)
  if (!Number.isFinite(value)) return null
  const name = String(item?.name ?? "")
  const total = NETWORK_REACH.reduce((sum, network) => sum + network.value, 0)
  const share = Math.round((value / total) * 100)
  const dot = NETWORK_REACH.find((network) => network.name === name)?.dot ?? "bg-zinc-900"

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <p className="text-xs font-medium text-zinc-500">{name}</p>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900 tabular-nums">
        {formatReach(value)}
        <span className="ml-1.5 text-xs font-medium text-zinc-400">{share}%</span>
      </p>
    </div>
  )
}

function CampaignsBarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const raw = payload[0]?.value
  const value = typeof raw === "number" ? raw : Number(raw)
  if (!Number.isFinite(value)) return null

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900 tabular-nums">
        {value}{" "}
        {translate(
          usePreferencesStore.getState().locale,
          value === 1 ? "dashboard.campaignOne" : "dashboard.campaignMany"
        )}
      </p>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  em_execucao: "bg-zinc-900 text-white",
  aberta: "bg-zinc-700 text-white",
  rascunho: "bg-zinc-200 text-zinc-700",
  concluida: "bg-zinc-100 text-zinc-600",
  cancelada: "bg-red-100 text-red-700",
}

type RankingMode = "faturamento" | "audiencia"

interface RankedInfluencer {
  id: string
  name: string
  photo: string
  avatar: string
  coupon: string | null
  revenue: number
  audience: number
  instagramVerified: boolean
}

function formatBrl(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

function formatAudience(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`
  }
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return value.toLocaleString("pt-BR")
}

function buildInfluencerRanking(campaigns: Campaign[]): RankedInfluencer[] {
  const byId = new Map<
    string,
    { revenue: number; coupon: string | null; couponRevenue: number; name: string; avatar: string }
  >()

  for (const campaign of campaigns) {
    for (const participant of campaign.participants) {
      const current = byId.get(participant.creatorId) ?? {
        revenue: 0,
        coupon: participant.couponCode ?? null,
        couponRevenue: participant.couponCode ? (participant.revenue ?? 0) : -1,
        name: participant.creatorName,
        avatar: participant.avatar,
      }
      const revenue = participant.revenue ?? 0
      current.revenue += revenue
      if (participant.couponCode && revenue >= current.couponRevenue) {
        current.coupon = participant.couponCode
        current.couponRevenue = revenue
      }
      byId.set(participant.creatorId, current)
    }
  }

  return [...byId.entries()].map(([id, aggregate]) => {
    const creator = CREATORS.find((item) => item.id === id)
    return {
      id,
      name: creator?.name ?? aggregate.name,
      photo: creator?.photo ?? "",
      avatar: creator?.avatar ?? aggregate.avatar,
      coupon: aggregate.coupon,
      revenue: aggregate.revenue,
      audience: creator?.totalFollowers ?? 0,
      instagramVerified:
        creator?.networks.some((network) => network.network === "instagram" && network.verified) ?? false,
    }
  })
}

function InfluencerRanking({ influencers }: { influencers: RankedInfluencer[] }) {
  const { t, locale } = useI18n()
  const [mode, setMode] = useState<RankingMode>("faturamento")
  const ranked = [...influencers]
    .sort((a, b) => {
      const primary = mode === "faturamento" ? b.revenue - a.revenue : b.audience - a.audience
      if (primary !== 0) return primary
      const secondary = mode === "faturamento" ? b.audience - a.audience : b.revenue - a.revenue
      if (secondary !== 0) return secondary
      return a.name.localeCompare(b.name, locale === "pt" ? "pt-BR" : locale)
    })
    .slice(0, 3)

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">{t("dashboard.rankingTitle")}</h2>
          <p className="text-xs text-zinc-400">{t("dashboard.rankingSub")}</p>
        </div>
        <div className="flex rounded-lg bg-zinc-100 p-0.5">
          {(
            [
              ["faturamento", t("dashboard.revenueTab")],
              ["audiencia", t("dashboard.audienceTab")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                mode === value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {ranked.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-zinc-400">{t("dashboard.emptyRanking")}</p>
      ) : (
        <div className="space-y-2">
          {ranked.map((influencer, index) => (
            <div
              key={influencer.id}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-4 text-xs font-semibold tabular-nums text-zinc-400">{index + 1}</span>
                <div className="relative h-9 w-9 shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                    {influencer.avatar}
                  </div>
                  {influencer.photo && (
                    <img
                      src={influencer.photo}
                      alt=""
                      className="absolute inset-0 h-9 w-9 rounded-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none"
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-medium text-zinc-900">
                    <span className="truncate">{influencer.name}</span>
                    {influencer.instagramVerified && <VerifiedBadge className="size-3.5" />}
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
                    <p className="text-sm font-semibold tabular-nums text-zinc-900">
                      {formatAudience(influencer.audience)}
                    </p>
                    <p className="text-xs text-zinc-400">{t("dashboard.followers")}</p>
                    <p className="mt-0.5 text-xs font-medium tabular-nums text-zinc-600">
                      {formatBrl(influencer.revenue)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-semibold tabular-nums text-zinc-900">
                    {formatBrl(influencer.revenue)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const orgCampaigns = CAMPAIGNS.filter((c) => c.organizationId === user?.organizationId)
  const activeCampaigns = orgCampaigns.filter((c) => c.status === "em_execucao")
  const totalSpend = orgCampaigns.reduce((s, c) => s + c.budgetSpent, 0)
  const totalRevenue = orgCampaigns.reduce((s, c) => s + (c.totalRevenue ?? 0), 0)
  const roi = totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) : 0
  const influencerRanking = buildInfluencerRanking(orgCampaigns)
  const { t } = useI18n()
  const revenueSeries = t("dashboard.revenueSeries")
  const spendSeries = t("dashboard.spendSeries")
  const monthlyChart = MONTHLY_OVERVIEW.map(({ month, spend, revenue }) => ({
    month,
    [revenueSeries]: revenue,
    [spendSeries]: spend,
  }))

  const stats = [
    {
      label: t("dashboard.activeCampaigns"),
      value: activeCampaigns.length,
      sub: t("dashboard.totalCount", { count: orgCampaigns.length }),
      icon: Megaphone,
    },
    {
      label: t("dashboard.creatorsInBase"),
      value: CREATORS.length,
      sub: t("dashboard.thisWeek"),
      icon: Users,
    },
    {
      label: t("dashboard.totalInvestment"),
      value: `R$ ${(totalSpend / 1000).toFixed(0)}k`,
      sub: t("dashboard.revenueSub", { value: `R$ ${(totalRevenue / 1000).toFixed(0)}k` }),
      icon: DollarSign,
    },
    {
      label: t("dashboard.averageRoi"),
      value: `${roi}%`,
      sub: t("dashboard.completedCampaigns"),
      icon: TrendingUp,
    },
  ]

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Dashboard"
        subtitle={t("dashboard.welcome", { name: user?.name?.split(" ")[0] ?? "" })}
      />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, sub, icon: Icon }) => (
            <Card key={label} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500 font-medium">{label}</p>
                  <p className="text-2xl font-semibold text-zinc-900 mt-1">{value}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                  <Icon size={16} className="text-zinc-600" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Monthly overview chart */}
          <Card className="lg:col-span-2 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">{t("dashboard.monthlyView")}</h2>
                <p className="text-xs text-zinc-400">{t("dashboard.monthlyViewSub")}</p>
              </div>
              <Activity size={16} className="text-zinc-400" />
            </div>
            <span className="hidden text-emerald-500 stroke-emerald-500 text-rose-500 stroke-rose-500 dark:text-emerald-500 dark:stroke-emerald-500 dark:text-rose-500 dark:stroke-rose-500" />
            <AreaChart
              data={monthlyChart}
              index="month"
              categories={[revenueSeries, spendSeries]}
              colors={["emerald", "rose"]}
              valueFormatter={formatBrlK}
              showLegend
              showGridLines={false}
              yAxisWidth={84}
              allowDecimals={false}
              customTooltip={MonthlyOverviewTooltip}
              className="h-52 text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-500"
            />
          </Card>

          {/* Campaign distribution */}
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-zinc-900 mb-1">{t("dashboard.campaignsByNetwork")}</h2>
            <p className="text-xs text-zinc-400 mb-4">{t("dashboard.reachDistribution")}</p>
            <NetworkChartPalette />
            <DonutChart
              data={NETWORK_REACH.map(({ name, value }) => ({ name, value }))}
              category="value"
              index="name"
              colors={["pink", "black", "red"]}
              valueFormatter={formatReach}
              showTooltip
              customTooltip={NetworkTooltip}
              className="h-36 [&_.recharts-pie-sector]:!opacity-100 [&_.recharts-pie-sector_path]:!opacity-100"
            />
            <ul className="mt-4 space-y-2">
              {NETWORK_REACH.map((network) => {
                const total = NETWORK_REACH.reduce((sum, item) => sum + item.value, 0)
                const share = Math.round((network.value / total) * 100)
                return (
                  <li key={network.name} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 text-zinc-600">
                      <span className={`h-2 w-2 rounded-full ${network.dot}`} />
                      {network.name}
                    </span>
                    <span className="font-medium tabular-nums text-zinc-900">
                      {formatReach(network.value)}
                      <span className="ml-2 font-normal text-zinc-400">{share}%</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-900">{t("dashboard.recentCampaigns")}</h2>
              <Link href="/campaigns" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
                {t("dashboard.seeAll")} <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {orgCampaigns.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-zinc-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-700">
                      {c.organizationName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 group-hover:underline">{c.name}</p>
                      <p className="text-xs text-zinc-400">
                        {t("dashboard.creatorsCount", { count: c.participants.length })} · {formatDateRangeBR(c.startDate, c.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.roi !== undefined && (
                      <span className="text-xs font-medium text-zinc-600">ROI {c.roi}%</span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        STATUS_COLORS[c.status] ?? "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {t(campaignStatusKey(c.status))}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <InfluencerRanking influencers={influencerRanking} />
        </div>

        {/* Monthly bar chart */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-zinc-900 mb-1">{t("dashboard.campaignsByMonth")}</h2>
          <p className="text-xs text-zinc-400 mb-4">{t("dashboard.campaignsByMonthSub")}</p>
          <BarChart
            data={MONTHLY_OVERVIEW}
            index="month"
            categories={["campaigns"]}
            colors={["zinc"]}
            valueFormatter={(v) => `${v}`}
            showLegend={false}
            showGridLines={false}
            yAxisWidth={36}
            allowDecimals={false}
            customTooltip={CampaignsBarTooltip}
            className="h-44 text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-500 [&_.recharts-bar-rectangle_rect]:fill-zinc-900 dark:[&_.recharts-bar-rectangle_rect]:fill-zinc-100 [&_.recharts-active-bar_.recharts-rectangle]:fill-zinc-900 dark:[&_.recharts-active-bar_.recharts-rectangle]:fill-zinc-100 [&_.recharts-tooltip-cursor]:!fill-transparent"
          />
        </Card>
      </div>
    </div>
  )
}
