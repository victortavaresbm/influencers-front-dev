"use client"
import { useState } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { creatorCanApply } from "@/lib/campaign-access"
import { CAMPAIGNS } from "@/lib/mock-data/campaigns"
import { CREATORS, type Network } from "@/lib/mock-data/creators"
import { ORG_LOGOS } from "@/lib/mock-data/users"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AreaChart, type CustomTooltipProps } from "@tremor/react"
import Link from "next/link"
import { Megaphone, TrendingUp, TrendingDown, DollarSign, Star, ArrowUpRight, ChevronDown } from "lucide-react"
import { campaignTypeLabel } from "@/lib/campaign-types"
import { useI18n } from "@/lib/i18n"
import { formatDateBR } from "@/lib/dates"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { NETWORK_CHART_COLOR, NetworkChartPalette } from "@/components/charts/network-colors"

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

const MONTHS = [
  { short: "Mai", full: "Maio" },
  { short: "Jun", full: "Junho" },
  { short: "Jul", full: "Julho" },
  { short: "Ago", full: "Agosto" },
  { short: "Set", full: "Setembro" },
  { short: "Out", full: "Outubro" },
] as const

const GROWTH_SHARE = [280, 310, 338, 352, 371, 385]

const NETWORKS = NETWORK_CHART_COLOR

function NetworkGlyph({ network, size = 13 }: { network: string; size?: number }) {
  if (network === "instagram") return <SiInstagram size={size} />
  if (network === "tiktok") return <SiTiktok size={size} />
  if (network === "youtube") return <SiYoutube size={size} />
  return null
}

function growthSeries(followers: number, network: Network) {
  const last = GROWTH_SHARE[GROWTH_SHARE.length - 1]
  return MONTHS.map((month, index) => {
    const value = Math.round((GROWTH_SHARE[index] / last) * followers)
    const previous = index === 0 ? null : Math.round((GROWTH_SHARE[index - 1] / last) * followers)
    const delta = previous == null ? null : value - previous
    const deltaPct = previous == null || previous === 0 ? null : ((value - previous) / previous) * 100
    return {
      month: month.short,
      monthLabel: month.full,
      networkId: network,
      network: NETWORKS[network].label,
      Seguidores: value,
      delta,
      deltaPct,
    }
  })
}

function formatSigned(value: number) {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toLocaleString("pt-BR")}`
}

function formatPct(value: number) {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

function activeBrandsFor(creatorId: string) {
  const brands = new Map<string, { id: string; name: string; logo?: string; campaignId: string }>()
  for (const campaign of CAMPAIGNS) {
    if (campaign.status !== "em_execucao") continue
    const participating = campaign.participants.some(
      (participant) =>
        participant.creatorId === creatorId &&
        (participant.status === "selecionado" || participant.status === "entregue")
    )
    if (!participating || brands.has(campaign.organizationId)) continue
    brands.set(campaign.organizationId, {
      id: campaign.organizationId,
      name: campaign.organizationName,
      logo: ORG_LOGOS[campaign.organizationId]?.logo,
      campaignId: campaign.id,
    })
  }
  return [...brands.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
}

function FollowersTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const raw = payload[0]?.value
  const value = typeof raw === "number" ? raw : Number(raw)
  if (!Number.isFinite(value)) return null

  const row = payload[0]?.payload
  const meta = row && typeof row === "object" ? (row as Record<string, unknown>) : null
  const monthLabel = typeof meta?.monthLabel === "string" ? meta.monthLabel : String(label ?? "")
  const networkId = typeof meta?.networkId === "string" ? meta.networkId : ""
  const network = typeof meta?.network === "string" ? meta.network : ""
  const delta = typeof meta?.delta === "number" ? meta.delta : null
  const deltaPct = typeof meta?.deltaPct === "number" ? meta.deltaPct : null
  const dot = networkId in NETWORKS ? NETWORKS[networkId as Network].dot : "bg-zinc-900"
  const rising = delta != null && delta > 0
  const falling = delta != null && delta < 0

  return (
    <div className="min-w-[188px] rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium text-zinc-500">{monthLabel}</p>
        {network && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {network}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm font-semibold tabular-nums text-zinc-900">
        {value.toLocaleString("pt-BR")}
      </p>
      <p className="text-[11px] text-zinc-400">seguidores</p>
      {delta != null && deltaPct != null && (
        <p
          className={`mt-1.5 flex items-center gap-1 text-xs font-medium tabular-nums ${
            rising ? "text-emerald-600" : falling ? "text-rose-600" : "text-zinc-500"
          }`}
        >
          {rising ? <TrendingUp size={12} /> : falling ? <TrendingDown size={12} /> : null}
          {formatSigned(delta)}
          <span className="font-normal text-zinc-400">·</span>
          {formatPct(deltaPct)}
        </p>
      )}
    </div>
  )
}

export default function CreatorDashboardPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const creator = CREATORS.find((c) => c.email === user?.email) ?? CREATORS[0]
  const [networkId, setNetworkId] = useState<Network>(creator.networks[0]?.network ?? "instagram")
  const selected = creator.networks.find((n) => n.network === networkId) ?? creator.networks[0]
  const series = selected ? growthSeries(selected.followers, selected.network) : []
  const activeCampaigns = CAMPAIGNS.filter((c) =>
    c.participants.some((p) => p.creatorId === creator.id && p.status === "selecionado")
  )
  const activeBrands = activeBrandsFor(creator.id)
  const openCampaigns = campaigns.filter((c) => creatorCanApply(c, creator.id, campaigns))

  return (
    <div className="flex flex-col flex-1">
      <TopBar title={t("pages.myDashboard")} subtitle={t("pages.hello", { name: user?.name?.split(" ")[0] ?? "" })} />

      <div className="p-6 space-y-4">
        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-zinc-900 flex items-center justify-center text-white text-lg font-bold shrink-0">
                {creator.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-semibold text-zinc-900">{creator.name}</h2>
                  <span className="text-sm text-zinc-400">{creator.handle}</span>
                  <Badge variant="outline" className="text-xs capitalize">{creator.tier}</Badge>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-zinc-600 fill-zinc-600" />
                    <span className="text-xs font-semibold text-zinc-700">{creator.score}/100</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-500 mt-1">{creator.bio}</p>
                <div className="flex flex-wrap gap-4 mt-3">
                  {creator.networks.map((n) => (
                    <div key={n.network} className="flex items-center gap-1.5 text-sm">
                      {n.network === "instagram" && <SiInstagram size={14} className="text-zinc-500" />}
                      {n.network === "tiktok" && <SiTiktok size={14} className="text-zinc-500" />}
                      {n.network === "youtube" && <SiYoutube size={14} className="text-zinc-500" />}
                      <span className="font-semibold text-zinc-800">{fmt(n.followers)}</span>
                      <span className="text-zinc-400 text-xs">· {n.engagementRate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900">Minhas marcas</h3>
            {activeBrands.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-400">Nenhuma marca ativa.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {activeBrands.map((brand) => (
                  <li key={brand.id}>
                    <Link
                      href={`/creator/campaigns/${brand.campaignId}`}
                      className="flex items-center gap-3 rounded-lg p-1.5 -mx-1.5 transition-colors hover:bg-zinc-50"
                    >
                      {brand.logo ? (
                        <img
                          src={ORG_LOGOS[brand.id]?.icon ?? brand.logo}
                          alt={brand.name}
                          className="size-10 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <Avatar className="size-10">
                          <AvatarFallback>{brand.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="min-w-0 truncate text-sm font-medium text-zinc-900">{brand.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total seguidores", value: fmt(creator.totalFollowers), icon: Star },
            { label: "Engajamento médio", value: `${creator.avgEngagement.toFixed(1)}%`, icon: TrendingUp },
            { label: "Campanhas ativas", value: activeCampaigns.length, icon: Megaphone },
            { label: "Valor de mídia", value: `R$ ${creator.mediaValue.toLocaleString("pt-BR")}`, icon: DollarSign },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-zinc-400">{label}</p>
                <Icon size={14} className="text-zinc-300" />
              </div>
              <p className="text-xl font-semibold text-zinc-900">{value}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Growth chart */}
          <Card className="overflow-visible p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Crescimento de seguidores</h3>
                <p className="text-xs text-zinc-700">Últimos 6 meses</p>
              </div>
              {selected && creator.networks.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-normal"
                        aria-label="Alterar rede social"
                      />
                    }
                  >
                    <NetworkGlyph network={selected.network} />
                    {NETWORKS[selected.network].label}
                    <ChevronDown data-icon="inline-end" className="text-zinc-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-auto min-w-52">
                    <DropdownMenuRadioGroup
                      value={selected.network}
                      onValueChange={(value) => {
                        if (value === "instagram" || value === "tiktok" || value === "youtube") {
                          setNetworkId(value)
                        }
                      }}
                    >
                      {creator.networks.map((n) => (
                        <DropdownMenuRadioItem key={n.network} value={n.network}>
                          <NetworkGlyph network={n.network} />
                          {NETWORKS[n.network].label}
                          <span className="ml-auto pl-4 text-xs tabular-nums text-zinc-400">{fmt(n.followers)}</span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {selected && (
              <>
                <NetworkChartPalette />
                <AreaChart
                  key={selected.network}
                  data={series}
                  index="month"
                  categories={["Seguidores"]}
                  colors={[NETWORKS[selected.network].tremor]}
                  valueFormatter={(v) => fmt(v)}
                  showLegend={false}
                  showGridLines={false}
                  yAxisWidth={56}
                  customTooltip={FollowersTooltip}
                  className={`h-40 [&_.recharts-cartesian-axis-tick_text]:fill-zinc-700 dark:[&_.recharts-cartesian-axis-tick_text]:fill-zinc-100${selected.network === "tiktok" ? " tiktok-chart" : ""}`}
                />
              </>
            )}
          </Card>

          {/* Active campaigns */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900">Campanhas ativas</h3>
              <Link href="/creator/campaigns" className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1">
                Ver todas <ArrowUpRight size={12} />
              </Link>
            </div>
            {activeCampaigns.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-zinc-400">Nenhuma campanha ativa.</p>
                <Link href="/creator/opportunities" className="text-xs text-zinc-600 underline mt-1 block">
                  Ver campanhas abertas
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCampaigns.slice(0, 3).map((c) => {
                  const participant = c.participants.find((p) => p.creatorId === creator.id)
                  const delivered = participant?.postsDelivered ?? 0
                  const total = participant?.deliverables.reduce((s, d) => s + d.quantity, 0) ?? 0
                  return (
                    <Link key={c.id} href={`/creator/campaigns/${c.id}`}>
                      <div className="p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-zinc-900 line-clamp-1">{c.name}</p>
                          <span className="text-xs text-zinc-400 shrink-0 ml-2">{formatDateBR(c.endDate)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                          <span>{delivered}/{total} entregáveis</span>
                          <span>R$ {participant?.fee.toLocaleString("pt-BR")}</span>
                        </div>
                        <Progress value={total > 0 ? (delivered / total) * 100 : 0} className="h-1" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Open campaigns */}
        {openCampaigns.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900">Campanhas abertas para candidatura</h3>
              <Link href="/creator/opportunities" className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1">
                Ver todas <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {openCampaigns.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/creator/campaigns/${c.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {c.organizationName.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 line-clamp-1 group-hover:underline">{c.name}</p>
                    <p className="text-xs text-zinc-400">{c.organizationName} · {campaignTypeLabel(c.type)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
