"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { NetworkChartPalette } from "@/components/charts/network-colors"
import type { Participant } from "@/lib/mock-data/campaigns"
import { SOCIAL_NETWORK_LABEL, type SocialNetwork } from "@/lib/mock-data/campaigns"
import type { MonitorPost } from "@/lib/mock-data/metrics"
import { cn } from "@/lib/utils"
import { BarChart, LineChart, type CustomTooltipProps } from "@tremor/react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"

const TIERS = ["nano", "micro", "mid", "macro", "mega"] as const
const TIER_LABEL: Record<(typeof TIERS)[number], string> = {
  nano: "Nano",
  micro: "Micro",
  mid: "Mid",
  macro: "Macro",
  mega: "Mega",
}

const chartClass =
  "h-56 overflow-visible text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-500 [&_.recharts-tooltip-cursor]:!fill-transparent [&_.recharts-tooltip-wrapper]:z-30"

const TIER_DOT: Record<string, string> = {
  Nano: "bg-slate-400",
  Micro: "bg-zinc-500",
  Mid: "bg-stone-400",
  Macro: "bg-sky-500",
  Mega: "bg-blue-600",
}

const CHANNEL_STYLE: Record<SocialNetwork, { bar: string; icon: string }> = {
  instagram: {
    bar: "[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-pink-500",
    icon: "text-pink-600",
  },
  tiktok: {
    bar: "[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-zinc-900",
    icon: "text-zinc-900",
  },
  youtube: {
    bar: "[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-red-500",
    icon: "text-red-600",
  },
}

function tooltipValue(value: unknown) {
  const number = typeof value === "number" ? value : Number(value)
  return Number.isFinite(number) ? number : null
}

function ChartTooltip({
  label,
  rows,
}: {
  label?: ReactNode
  rows: { name: string; value: string; dot: string }[]
}) {
  if (rows.length === 0) return null
  return (
    <div className="min-w-40 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-lg">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <div className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs text-zinc-600">
              <span className={cn("size-2 shrink-0 rounded-full", row.dot)} />
              {row.name}
            </span>
            <span className="text-xs font-semibold tabular-nums text-zinc-900">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmvTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const value = tooltipValue(payload[0]?.value)
  if (value === null) return null
  return <ChartTooltip label={label} rows={[{ name: "EMV", value: fmtBrl(value), dot: "bg-sky-500" }]} />
}

function TierTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const rows = payload.flatMap((item) => {
    const value = tooltipValue(item.value)
    const name = String(item.name ?? item.dataKey ?? "")
    if (value === null || value <= 0) return []
    return [{ name, value: String(value), dot: TIER_DOT[name] ?? "bg-zinc-400" }]
  })
  return <ChartTooltip label={label} rows={rows} />
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return Math.round(n).toLocaleString("pt-BR")
}

function fmtBrl(n: number) {
  if (n >= 1000) return `R$ ${fmt(n)}`
  return `R$ ${Math.round(n).toLocaleString("pt-BR")}`
}

function emvOf(post: MonitorPost) {
  const views = post.views ?? post.reach
  return Math.round(views * 0.018 + post.likes * 0.35 + post.comments * 2.5 + post.shares * 1.2)
}

function NetworkIcon({ network, className }: { network: string; className?: string }) {
  if (network === "instagram") return <SiInstagram size={12} className={className} />
  if (network === "tiktok") return <SiTiktok size={12} className={className} />
  if (network === "youtube") return <SiYoutube size={12} className={className} />
  return null
}

function dayLabel(iso: string) {
  const [, month, day] = iso.split("-")
  return `${day}/${month}`
}

function monthLabel(key: string) {
  const names = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
  const [year, month] = key.split("-")
  return `${names[Number(month) - 1]}/${year.slice(2)}`
}

export function CampaignAnalytics({
  posts,
  participants,
}: {
  posts: MonitorPost[]
  participants: Participant[]
}) {
  const tierByCreator = new Map(participants.map((participant) => [participant.creatorId, participant.tier]))

  const emvSeries = [...posts]
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
    .reduce<{ date: string; EMV: number }[]>((series, post) => {
      const label = dayLabel(post.publishedAt)
      const last = series.at(-1)
      const value = emvOf(post)
      if (last?.date === label) last.EMV += value
      else series.push({ date: label, EMV: value })
      return series
    }, [])

  const likes = posts.reduce((sum, post) => sum + post.likes, 0)
  const comments = posts.reduce((sum, post) => sum + post.comments, 0)
  const shares = posts.reduce((sum, post) => sum + post.shares, 0)
  const engagedViews = posts.reduce((sum, post) => {
    const views = post.views ?? post.reach
    return sum + Math.round(views * (post.engagement / 100))
  }, 0)

  const channels = (["instagram", "tiktok", "youtube"] as const)
    .map((network) => {
      const items = posts.filter((post) => post.network === network)
      const reach = items.reduce((sum, post) => sum + post.reach, 0)
      const emv = items.reduce((sum, post) => sum + emvOf(post), 0)
      const engagement = items.length
        ? items.reduce((sum, post) => sum + post.engagement, 0) / items.length
        : 0
      return { network, reach, emv, engagement, count: items.length }
    })
    .filter((channel) => channel.count > 0)
  const totalReach = channels.reduce((sum, channel) => sum + channel.reach, 0)

  const spanDays = posts.length
    ? (Date.parse(posts.reduce((max, post) => (post.publishedAt > max ? post.publishedAt : max), posts[0].publishedAt))
      - Date.parse(posts.reduce((min, post) => (post.publishedAt < min ? post.publishedAt : min), posts[0].publishedAt)))
      / 86400000
    : 0
  const byMonth = spanDays > 45
  const activity = new Map<string, Record<string, number>>()
  for (const post of posts) {
    const key = byMonth ? post.publishedAt.slice(0, 7) : post.publishedAt
    const tier = tierByCreator.get(post.creatorId) ?? "micro"
    const row = activity.get(key) ?? { Nano: 0, Micro: 0, Mid: 0, Macro: 0, Mega: 0 }
    row[TIER_LABEL[tier]] += 1
    activity.set(key, row)
  }
  const activitySeries = [...activity.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, row]) => ({
      period: byMonth ? monthLabel(key) : dayLabel(key),
      ...row,
    }))

  return (
    <div className="space-y-4">
      <NetworkChartPalette />
      <Card className="overflow-visible p-4">
        <h3 className="text-sm font-semibold text-zinc-900">EMV ao longo do tempo</h3>
        <p className="mb-4 text-xs text-zinc-400">Valor de mídia estimada dos conteúdos publicados em cada dia</p>
        <LineChart
          data={emvSeries}
          index="date"
          categories={["EMV"]}
          colors={["sky"]}
          valueFormatter={fmtBrl}
          showLegend={false}
          showGridLines={false}
          curveType="monotone"
          yAxisWidth={56}
          customTooltip={EmvTooltip}
          className={chartClass}
        />
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Views engajadas", value: fmt(engagedViews) },
          { label: "Compartilhamentos", value: fmt(shares) },
          { label: "Curtidas", value: fmt(likes) },
          { label: "Comentários", value: fmt(comments) },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-zinc-400">{label}</p>
            <p className="mt-1 text-xl font-semibold text-zinc-900">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Canais</h3>
          <p className="mb-4 text-xs text-zinc-400">Participação de cada rede no alcance</p>
          <div className="space-y-4">
            {channels.map((channel) => {
              const share = totalReach > 0 ? Math.round((channel.reach / totalReach) * 100) : 0
              const style = CHANNEL_STYLE[channel.network]
              return (
                <div key={channel.network}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-zinc-800">
                      <NetworkIcon network={channel.network} className={style.icon} />
                      {SOCIAL_NETWORK_LABEL[channel.network]}
                    </span>
                    <span className="shrink-0 tabular-nums text-zinc-500">
                      {share}% · {fmtBrl(channel.emv)} · {channel.engagement.toFixed(1)}% ER
                    </span>
                  </div>
                  <Progress value={share} className={style.bar} />
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="overflow-visible p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Atividade por tier</h3>
          <p className="mb-4 text-xs text-zinc-400">
            Conteúdos publicados {byMonth ? "por mês" : "por dia"}, separados pelo tier do creator
          </p>
          <BarChart
            data={activitySeries}
            index="period"
            categories={[...TIERS.map((tier) => TIER_LABEL[tier])]}
            colors={["slate", "zinc", "stone", "sky", "blue"]}
            stack
            showGridLines={false}
            yAxisWidth={32}
            allowDecimals={false}
            customTooltip={TierTooltip}
            className={chartClass}
          />
        </Card>
      </div>
    </div>
  )
}
