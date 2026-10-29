"use client"

import { useMemo, useState } from "react"
import { BrandMark } from "@/components/tracking/brand-mark"
import { deltaClass, formatChartValue, formatCount, formatFrequency, formatMoney } from "@/components/tracking/format"
import { PerformancePanel } from "@/components/tracking/performance-panel"
import { PostsGrid } from "@/components/tracking/posts-grid"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  type BrandSnapshot,
  type ChartMetric,
  type ContentScope,
  type Network,
  type Period,
  type TrackedBrand,
  type TrackedPost,
  type TrackingConfig,
} from "@/lib/mock-data/tracking"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"

const COMPARE_METRICS: { key: ChartMetric | "creators" | "posts" | "potency" | "frequency"; label: string }[] = [
  { key: "emv", label: "EMV" },
  { key: "engagement", label: "Engajamento" },
  { key: "reach", label: "Alcance" },
  { key: "impressions", label: "Impressões" },
  { key: "creators", label: "Creators" },
  { key: "posts", label: "Publicações" },
  { key: "potency", label: "Potência" },
  { key: "frequency", label: "Frequência" },
  { key: "sponsoredEmv", label: "EMV patrocinado" },
]

const NETWORK_LABEL: Record<Network, { label: string; icon: typeof SiInstagram }> = {
  instagram: { label: "Instagram", icon: SiInstagram },
  tiktok: { label: "TikTok", icon: SiTiktok },
  youtube: { label: "YouTube", icon: SiYoutube },
}

function metricNumber(snapshot: BrandSnapshot, key: (typeof COMPARE_METRICS)[number]["key"]) {
  return snapshot[key]
}

function formatMetricNumber(key: (typeof COMPARE_METRICS)[number]["key"], value: number) {
  if (key === "frequency") return formatFrequency(value)
  if (key === "emv" || key === "potency" || key === "sponsoredEmv") return formatMoney(value)
  if (key === "engagement" || key === "reach" || key === "impressions" || key === "creators" || key === "posts") {
    return formatCount(value)
  }
  return formatChartValue("emv", value)
}

function gap(own: number, other: number) {
  if (own === 0) return 0
  return ((other - own) / Math.abs(own)) * 100
}

function gapLabel(value: number, ownName: string) {
  if (Math.abs(value) < 1) return `No mesmo patamar de ${ownName}`
  const rounded = Math.abs(Math.round(value))
  return value > 0 ? `${rounded}% acima de ${ownName}` : `${rounded}% abaixo de ${ownName}`
}

function averageSnapshot(snapshots: BrandSnapshot[]): BrandSnapshot {
  const count = snapshots.length || 1
  const totals = snapshots.reduce(
    (acc, snapshot) => ({
      creators: acc.creators + snapshot.creators,
      posts: acc.posts + snapshot.posts,
      emv: acc.emv + snapshot.emv,
      engagement: acc.engagement + snapshot.engagement,
      impressions: acc.impressions + snapshot.impressions,
      reach: acc.reach + snapshot.reach,
      sponsoredEmv: acc.sponsoredEmv + snapshot.sponsoredEmv,
      mom: acc.mom + snapshot.mom,
      yoy: acc.yoy + snapshot.yoy,
    }),
    { creators: 0, posts: 0, emv: 0, engagement: 0, impressions: 0, reach: 0, sponsoredEmv: 0, mom: 0, yoy: 0 },
  )
  const posts = totals.posts / count
  const creators = totals.creators / count
  const emv = totals.emv / count
  return {
    brand: {
      id: "average",
      name: "Média",
      initials: "avg",
      color: "#18181b",
      ink: "light",
      chartColor: "zinc",
      handles: { instagram: "", tiktok: "", youtube: "" },
      hashtags: [],
      keywords: [],
      creators: 0,
      posts: 0,
      emv: 0,
      engagement: 0,
      impressions: 0,
      reach: 0,
      sponsoredShare: 0,
      mom: totals.mom / count,
      yoy: totals.yoy / count,
      networks: { instagram: 1 / 3, tiktok: 1 / 3, youtube: 1 / 3 },
      trend: [1, 1, 1, 1, 1, 1],
    },
    creators,
    posts,
    emv,
    engagement: totals.engagement / count,
    impressions: totals.impressions / count,
    reach: totals.reach / count,
    sponsoredEmv: totals.sponsoredEmv / count,
    potency: posts > 0 ? emv / posts : 0,
    frequency: creators > 0 ? posts / creators : 0,
    mom: totals.mom / count,
    yoy: totals.yoy / count,
  }
}

function networkShare(snapshot: BrandSnapshot, network: Network, selected: Network[]) {
  const selectedWeight = selected.reduce((sum, item) => sum + snapshot.brand.networks[item], 0) || 1
  return snapshot.emv * (snapshot.brand.networks[network] / selectedWeight)
}

export function BrandCompare({
  own,
  competitor,
  setSnapshots,
  config,
  posts,
  brands,
}: {
  own: BrandSnapshot
  competitor: BrandSnapshot
  setSnapshots: BrandSnapshot[]
  config: Pick<TrackingConfig, "period" | "networks" | "scope">
  posts: TrackedPost[]
  brands: TrackedBrand[]
}) {
  const [content, setContent] = useState("competitor")
  const average = useMemo(() => averageSnapshot(setSnapshots), [setSnapshots])
  const visiblePosts = posts.filter((post) => {
    if (content === "own") return post.brandId === own.brand.id
    if (content === "competitor") return post.brandId === competitor.brand.id
    return post.brandId === own.brand.id || post.brandId === competitor.brand.id
  })
  const channelMax = Math.max(
    ...config.networks.flatMap((network) => [
      networkShare(own, network, config.networks),
      networkShare(competitor, network, config.networks),
    ]),
    1,
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {COMPARE_METRICS.map((metric) => {
          const ownValue = metricNumber(own, metric.key)
          const otherValue = metricNumber(competitor, metric.key)
          const delta = gap(ownValue, otherValue)
          return (
            <Card key={metric.key} className="p-4">
              <p className="text-xs text-zinc-500">{metric.label}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <BrandMark brand={own.brand} className="size-4 text-[8px]" />
                    <span className="truncate">{own.brand.name}</span>
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900">
                    {formatMetricNumber(metric.key, ownValue)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <BrandMark brand={competitor.brand} className="size-4 text-[8px]" />
                    <span className="truncate">{competitor.brand.name}</span>
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900">
                    {formatMetricNumber(metric.key, otherValue)}
                  </p>
                </div>
              </div>
              <p className={`mt-2 text-xs ${deltaClass(delta)}`}>{gapLabel(delta, own.brand.name)}</p>
            </Card>
          )
        })}
      </div>

      <Card className="gap-0 py-0">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">EMV por rede</h2>
          <p className="mt-0.5 text-xs text-zinc-500">Como o valor se reparte nas redes do recorte atual.</p>
        </div>
        <div className="grid gap-6 p-4 md:grid-cols-2">
          {[own, competitor].map((snapshot) => (
            <div key={snapshot.brand.id} className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                <BrandMark brand={snapshot.brand} className="size-6 text-[9px]" />
                {snapshot.brand.name}
              </p>
              {config.networks.map((network) => {
                const value = networkShare(snapshot, network, config.networks)
                const Icon = NETWORK_LABEL[network].icon
                return (
                  <div key={network} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="size-3.5" />
                        {NETWORK_LABEL[network].label}
                      </span>
                      <span className="tabular-nums">{formatMoney(value)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(4, (value / channelMax) * 100)}%`, backgroundColor: snapshot.brand.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>

      <PerformancePanel
        snapshots={[own, competitor, average]}
        period={config.period as Period}
        scope={config.scope as ContentScope}
        ownId={own.brand.id}
        linkCompetitors={false}
      />

      <Card className="p-4">
        <Tabs value={content} onValueChange={(value) => setContent(value || "competitor")}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Conteúdos</h2>
              <p className="mt-0.5 text-xs text-zinc-500">As publicações das duas marcas, no mesmo formato do monitoramento.</p>
            </div>
            <TabsList>
              <TabsTrigger value="competitor">{competitor.brand.name}</TabsTrigger>
              <TabsTrigger value="own">{own.brand.name}</TabsTrigger>
              <TabsTrigger value="both">As duas</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={content}>
            <PostsGrid
              posts={visiblePosts}
              brands={brands}
              heading={false}
              description="Ordenadas pelo EMV. A capa segue o mesmo cartão das publicações monitoradas."
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
