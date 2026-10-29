"use client"
import { TopBar } from "@/components/layout/top-bar"
import { useAuthStore } from "@/lib/stores/auth"
import { CAMPAIGNS } from "@/lib/mock-data/campaigns"
import { CAMPAIGN_METRICS, MONTHLY_OVERVIEW, NETWORK_DISTRIBUTION } from "@/lib/mock-data/metrics"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, BarChart, DonutChart, type CustomTooltipProps } from "@tremor/react"
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { networkChartColor, NetworkChartPalette } from "@/components/charts/network-colors"
import { TrendingUp, Eye, Heart, DollarSign, MousePointerClick } from "lucide-react"
import { useI18n } from "@/lib/i18n"

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

function formatBrlK(value: number) {
  return `R$\u00A0${(value / 1000).toFixed(0)}k`
}

const SERIES_DOT: Record<string, string> = {
  Gasto: "bg-rose-500",
  Receita: "bg-emerald-500",
  Alcance: "bg-sky-500",
  Engajamento: "bg-violet-500",
  Cliques: "bg-amber-500",
}

const INVESTMENT_CHART = MONTHLY_OVERVIEW.map(({ month, spend, revenue }) => ({
  month,
  Receita: revenue,
  Gasto: spend,
}))

function SeriesTooltip({
  active,
  payload,
  label,
  formatValue = (value) => fmt(value),
}: CustomTooltipProps & { formatValue?: (value: number) => string }) {
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
                <span className={`h-2 w-2 rounded-full ${SERIES_DOT[name] ?? "bg-zinc-900"}`} />
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

function CreatorReachTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const raw = payload[0]?.value
  const value = typeof raw === "number" ? raw : Number(raw)
  if (!Number.isFinite(value)) return null

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900">{fmt(value)} alcance</p>
    </div>
  )
}

function formatReachMillions(value: number) {
  return `${(value / 1000000).toFixed(1)}M`
}

function formatCompactPt(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

const REACH_REVENUE = MONTHLY_OVERVIEW.map(({ month, reach, revenue }) => ({
  month,
  Alcance: reach,
  Receita: revenue,
}))

function ReachRevenueTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const rows = payload
    .map((item) => {
      const value = typeof item.value === "number" ? item.value : Number(item.value)
      const name = String(item.name ?? item.dataKey ?? "")
      return { name, value }
    })
    .filter((row) => (row.name === "Alcance" || row.name === "Receita") && Number.isFinite(row.value))
    .sort((a, b) => (a.name === "Alcance" ? -1 : 1) - (b.name === "Alcance" ? -1 : 1))

  if (!rows.length) return null

  return (
    <div
      data-keep-theme
      className="min-w-44 rounded-lg border border-zinc-400 bg-white px-3 py-2.5 shadow-lg"
    >
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <div className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-xs text-zinc-700">
              <span className={`h-2 w-2 rounded-full ${SERIES_DOT[row.name] ?? "bg-zinc-900"}`} />
              {row.name}
            </span>
            <span className="text-xs font-semibold tabular-nums text-zinc-700">
              {row.name === "Receita" ? formatBrl(row.value) : formatCompactPt(row.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatAxisBrl(value: number) {
  return `R$\u00A0${formatCompactPt(value)}`
}

function ReachRevenueChart() {
  return (
    <div className="h-44 text-xs text-zinc-500">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={REACH_REVENUE} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <YAxis
            yAxisId="reach"
            axisLine={false}
            tickLine={false}
            width={58}
            domain={[0, "auto"]}
            tickFormatter={formatCompactPt}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            axisLine={false}
            tickLine={false}
            width={78}
            domain={[0, "auto"]}
            tickFormatter={formatAxisBrl}
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
            dataKey="Receita"
            fill="var(--color-emerald-500)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Line
            yAxisId="reach"
            dataKey="Alcance"
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
        {formatReachMillions(value)}
        <span className="ml-1.5 text-xs font-medium text-zinc-400">{share}%</span>
      </p>
    </div>
  )
}

const chartClass =
  "h-48 text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-500 [&_.recharts-tooltip-cursor]:!fill-transparent [&_.recharts-bar-rectangles_rect]:[fill:inherit] [&_.recharts-active-bar_.recharts-rectangle]:![fill:inherit]"

export default function MetricsPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const orgCampaigns = CAMPAIGNS.filter((c) => c.organizationId === user?.organizationId)
  const activeCamp = orgCampaigns.find((c) => c.status === "em_execucao")
  const metrics = activeCamp ? CAMPAIGN_METRICS.find((m) => m.campaignId === activeCamp.id) : null

  const totalReach = orgCampaigns.reduce((s, c) => s + (c.totalReach ?? 0), 0)
  const totalEngagement = orgCampaigns.reduce((s, c) => s + (c.totalEngagement ?? 0), 0)
  const totalRevenue = orgCampaigns.reduce((s, c) => s + (c.totalRevenue ?? 0), 0)
  const totalClicks = orgCampaigns.reduce((s, c) => s + (c.totalClicks ?? 0), 0)
  const avgRoi = orgCampaigns.filter((c) => c.roi).reduce((s, c, _, arr) => s + (c.roi ?? 0) / arr.length, 0)

  const creatorPerformance = orgCampaigns
    .flatMap((c) => c.participants.filter((p) => p.totalReach))
    .sort((a, b) => (b.totalReach ?? 0) - (a.totalReach ?? 0))
    .slice(0, 5)
    .map((p) => ({ creator: p.creatorHandle, Alcance: p.totalReach ?? 0 }))

  return (
    <div className="flex flex-col flex-1">
      <TopBar title={t("pages.metrics")} subtitle={t("pages.metricsSub")} />

      <div className="p-6 space-y-4">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Alcance total", value: fmt(totalReach), icon: Eye },
            { label: "Engajamento", value: fmt(totalEngagement), icon: Heart },
            { label: "Cliques", value: fmt(totalClicks), icon: MousePointerClick },
            { label: "Receita gerada", value: `R$ ${fmt(totalRevenue)}`, icon: DollarSign },
            { label: "ROI médio", value: `${Math.round(avgRoi)}%`, icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-400">{label}</p>
                <Icon size={14} className="text-zinc-300" />
              </div>
              <p className="text-xl font-semibold text-zinc-900">{value}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="campaigns">Por campanha</TabsTrigger>
            <TabsTrigger value="networks">Por rede</TabsTrigger>
            <TabsTrigger value="creators">Por creator</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="overflow-visible p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 mb-1">Alcance e receita mensais</h3>
                    <p className="text-xs text-zinc-400">Últimos 6 meses</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-3 rounded-full bg-sky-500" />
                      Alcance
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                      Receita
                    </span>
                  </div>
                </div>
                <ReachRevenueChart />
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">Investimento vs Receita</h3>
                <p className="text-xs text-zinc-400 mb-4">Comparativo mensal</p>
                <span className="hidden fill-rose-500 fill-emerald-500 text-rose-500 text-emerald-500 stroke-rose-500 stroke-emerald-500 text-sky-500 stroke-sky-500 text-violet-500 stroke-violet-500 text-amber-500 stroke-amber-500" />
                <BarChart
                  data={INVESTMENT_CHART}
                  index="month"
                  categories={["Receita", "Gasto"]}
                  colors={["emerald", "rose"]}
                  valueFormatter={formatBrlK}
                  showLegend
                  showGridLines={false}
                  yAxisWidth={84}
                  allowDecimals={false}
                  customTooltip={MoneyTooltip}
                  className={chartClass}
                />
              </Card>
            </div>

            {metrics && (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                    Alcance — {activeCamp?.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4">Alcance diário da campanha ativa</p>
                  <AreaChart
                    data={metrics.series.map((point) => ({ date: point.date, Alcance: point.reach }))}
                    index="date"
                    categories={["Alcance"]}
                    colors={["sky"]}
                    valueFormatter={(v: number) => fmt(v)}
                    showLegend={false}
                    showGridLines={false}
                    yAxisWidth={44}
                    customTooltip={SeriesTooltip}
                    className={chartClass}
                  />
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                    Engajamento e cliques — {activeCamp?.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4">Interações diárias da campanha ativa</p>
                  <AreaChart
                    data={metrics.series.map((point) => ({
                      date: point.date,
                      Engajamento: point.engagement,
                      Cliques: point.clicks,
                    }))}
                    index="date"
                    categories={["Engajamento", "Cliques"]}
                    colors={["violet", "amber"]}
                    valueFormatter={(v: number) => fmt(v)}
                    showLegend
                    showGridLines={false}
                    yAxisWidth={40}
                    customTooltip={SeriesTooltip}
                    className={chartClass}
                  />
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="mt-4">
            <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {["Campanha", "Alcance", "Engajamento", "Cliques", "Receita", "ROI"].map((h) => (
                      <th key={h} className="py-2.5 px-4 text-xs font-medium text-zinc-500 bg-zinc-50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orgCampaigns.filter((c) => c.totalReach).map((c) => (
                    <tr key={c.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                      <td className="py-3 px-4 text-sm font-medium text-zinc-900">{c.name}</td>
                      <td className="py-3 px-4 text-sm text-zinc-700">{fmt(c.totalReach ?? 0)}</td>
                      <td className="py-3 px-4 text-sm text-zinc-700">{fmt(c.totalEngagement ?? 0)}</td>
                      <td className="py-3 px-4 text-sm text-zinc-700">{fmt(c.totalClicks ?? 0)}</td>
                      <td className="py-3 px-4 text-sm text-zinc-700">R$ {fmt(c.totalRevenue ?? 0)}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-zinc-900">{c.roi}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="networks" className="mt-4 space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">Alcance por rede</h3>
                <p className="text-xs text-zinc-400 mb-4">Distribuição do alcance total</p>
                <NetworkChartPalette />
                <DonutChart
                  data={NETWORK_DISTRIBUTION.map((n) => ({ name: n.network, value: n.reach }))}
                  category="value"
                  index="name"
                  colors={NETWORK_DISTRIBUTION.map((n) => networkChartColor(n.network)?.tremor ?? "zinc")}
                  valueFormatter={formatReachMillions}
                  customTooltip={NetworkReachTooltip}
                  className="h-40 [&_.recharts-pie-sector]:!opacity-100 [&_.recharts-pie-sector_path]:!opacity-100"
                />
                <ul className="mt-4 space-y-2">
                  {NETWORK_DISTRIBUTION.map((network) => {
                    const total = NETWORK_DISTRIBUTION.reduce((sum, item) => sum + item.reach, 0)
                    const share = total > 0 ? Math.round((network.reach / total) * 100) : 0
                    return (
                      <li key={network.network} className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-2 text-zinc-600">
                          <span className={`h-2 w-2 rounded-full ${networkChartColor(network.network)?.dot ?? "bg-zinc-900"}`} />
                          {network.network}
                        </span>
                        <span className="font-medium tabular-nums text-zinc-900">
                          {formatReachMillions(network.reach)}
                          <span className="ml-2 font-normal text-zinc-400">{share}%</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Engajamento médio por rede</h3>
                <div className="space-y-4">
                  {NETWORK_DISTRIBUTION.map((n) => (
                    <div key={n.network}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-zinc-800 capitalize">{n.network}</span>
                        <span className="text-zinc-500">{n.engagement}%</span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded overflow-hidden">
                        <div
                          className={`h-full rounded ${networkChartColor(n.network)?.dot ?? "bg-zinc-900"}`}
                          style={{ width: `${(n.engagement / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{n.creators} creators ativos</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="creators" className="mt-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Top 5 creators por alcance</h3>
              {creatorPerformance.length > 0 ? (
                <BarChart
                  data={creatorPerformance}
                  index="creator"
                  categories={["Alcance"]}
                  colors={["zinc"]}
                  valueFormatter={(v: number) => fmt(v)}
                  showLegend={false}
                  showGridLines={false}
                  yAxisWidth={48}
                  allowDecimals={false}
                  rotateLabelX={{ angle: -32, verticalShift: 10, xAxisHeight: 64 }}
                  customTooltip={CreatorReachTooltip}
                  className="h-72 text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-500 [&_.recharts-bar-rectangle_rect]:fill-zinc-900 dark:[&_.recharts-bar-rectangle_rect]:fill-zinc-100 [&_.recharts-active-bar_.recharts-rectangle]:fill-zinc-900 dark:[&_.recharts-active-bar_.recharts-rectangle]:fill-zinc-100 [&_.recharts-tooltip-cursor]:!fill-transparent"
                />
              ) : (
                <p className="text-sm text-zinc-400">Ainda sem dados suficientes.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
