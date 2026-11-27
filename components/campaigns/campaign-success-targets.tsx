"use client"

import type { LucideIcon } from "lucide-react"
import {
  Bookmark,
  CircleCheck,
  ClipboardList,
  Clock,
  Download,
  Eye,
  Heart,
  Link,
  Link2,
  ListPlus,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  MousePointerClick,
  Phone,
  Play,
  Repeat2,
  Reply,
  Share2,
  ShoppingBag,
  SkipForward,
  SquareMousePointer,
  SquareUser,
  Ticket,
  Timer,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CampaignType, SocialNetwork } from "@/lib/mock-data/campaigns"
import { SOCIAL_NETWORK_LABEL } from "@/lib/mock-data/campaigns"
import { campaignTypeByValue } from "@/lib/campaign-types"
import {
  SUCCESS_METRIC_GROUPS,
  metricsForNetworks,
  readSuccessTargets,
  suggestSuccessTargets,
  unitCaption,
  type CampaignSuccessTarget,
  type SuccessMetric,
  type SuccessMetricGroup,
  type SuccessMetricId,
} from "@/lib/success-metrics"
import { cn } from "@/lib/utils"

const GROUP_ICONS: Record<SuccessMetricGroup, LucideIcon> = {
  alcance: Eye,
  interacao: Heart,
  perfil: UserRound,
  conversao: MousePointerClick,
  vendas: ShoppingBag,
}

const METRIC_ICONS: Record<SuccessMetricId, LucideIcon> = {
  views: Eye,
  reach: Users,
  engaged_views: Play,
  crossposted_views: Share2,
  watch_time: Clock,
  avg_watch: Timer,
  completion: CircleCheck,
  skip_rate: SkipForward,
  likes: Heart,
  comments: MessageCircle,
  saves: Bookmark,
  shares: Share2,
  reposts: Repeat2,
  replies: Reply,
  interactions: MousePointerClick,
  playlist_adds: ListPlus,
  card_clicks: SquareMousePointer,
  follows: UserPlus,
  profile_visits: SquareUser,
  bio_link_clicks: Link,
  story_link_clicks: Link2,
  call_clicks: Phone,
  direction_clicks: MapPin,
  email_clicks: Mail,
  text_clicks: MessageSquare,
  app_download_clicks: Download,
  leads: ClipboardList,
  tracked_link_clicks: Link2,
  coupon_uses: Ticket,
  orders: ShoppingBag,
  revenue: ShoppingBag,
}

function metricNetworks(metric: SuccessMetric, networks: SocialNetwork[]) {
  const selected = networks.length === 0 ? null : new Set(networks)
  return metric.sources
    .map((source) => source.network)
    .filter((network, index, list) => list.indexOf(network) === index)
    .filter((network) => !selected || selected.has(network))
}

function NetworkMark({ network }: { network: SocialNetwork }) {
  if (network === "instagram") return <SiInstagram className="size-3" aria-hidden />
  if (network === "tiktok") return <SiTiktok className="size-3" aria-hidden />
  return <SiYoutube className="size-3" aria-hidden />
}

export function CampaignSuccessTargets({
  networks,
  type,
  value,
  onChange,
  showHeading = true,
  groups,
}: {
  networks: SocialNetwork[]
  type?: CampaignType
  value?: { metric: string; target: number }[]
  onChange: (value: CampaignSuccessTarget[]) => void
  showHeading?: boolean
  groups?: SuccessMetricGroup[]
}) {
  const selected = new Map(readSuccessTargets(value).map((item) => [item.metric, item.target]))
  const visible = metricsForNetworks(networks)
  const typeLabel = type ? campaignTypeByValue(type)?.label : undefined

  const write = (next: Map<SuccessMetricId, number>) => {
    const hidden = readSuccessTargets(value).filter((item) => !visible.some((metric) => metric.id === item.metric))
    onChange([
      ...hidden,
      ...visible.flatMap((metric) => {
        if (!next.has(metric.id)) return []
        return [{ metric: metric.id, target: next.get(metric.id) ?? 0 }]
      }),
    ])
  }

  const toggle = (id: SuccessMetricId, checked: boolean) => {
    const next = new Map(selected)
    if (checked) next.set(id, next.get(id) ?? 0)
    else next.delete(id)
    write(next)
  }

  const setTarget = (id: SuccessMetricId, raw: string) => {
    const next = new Map(selected)
    next.set(id, raw === "" ? 0 : Math.max(0, Number(raw)))
    write(next)
  }

  const applySuggestion = () => {
    if (!type) return
    const next = new Map(selected)
    for (const item of suggestSuccessTargets(type, networks)) {
      if (!next.has(item.metric)) next.set(item.metric, 0)
    }
    write(next)
  }

  return (
    <div>
      <div className={cn("flex flex-wrap items-center gap-2", showHeading ? "mb-1 justify-between" : "mb-3 justify-end")}>
        {showHeading && <Label>Metas de sucesso</Label>}
        {typeLabel && (
          <Button type="button" variant="outline" size="sm" onClick={applySuggestion}>
            Usar sugestão de {typeLabel}
          </Button>
        )}
      </div>
      {showHeading && (
        <p className="mb-3 text-xs leading-relaxed text-zinc-500">
          Marque os eventos oficiais de Instagram, TikTok e YouTube e coloque o número da campanha.
        </p>
      )}
      {networks.length === 0 && (
        <p className="mb-3 text-xs leading-relaxed text-zinc-500">
          Escolha as redes no formato para ver só o que elas medem.
        </p>
      )}
      <div className="space-y-5">
        {SUCCESS_METRIC_GROUPS.filter((group) => !groups || groups.includes(group.id)).map((group) => {
          const metrics = visible.filter((metric) => metric.group === group.id)
          if (metrics.length === 0) return null
          const GroupIcon = GROUP_ICONS[group.id]
          return (
            <div key={group.id}>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                <GroupIcon className="size-3.5" />
                {group.label}
              </p>
              <div className="space-y-2">
                {metrics.map((metric) => {
                  const checked = selected.has(metric.id)
                  const target = selected.get(metric.id) ?? 0
                  const Icon = METRIC_ICONS[metric.id]
                  const shownNetworks = metricNetworks(metric, networks)
                  return (
                    <div
                      key={metric.id}
                      data-ai-option={metric.id}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3",
                        checked ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white",
                      )}
                    >
                      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                        <Checkbox
                          className="mt-2"
                          checked={checked}
                          onCheckedChange={(next) => toggle(metric.id, next === true)}
                          aria-label={metric.label}
                        />
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            checked ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-sm font-semibold text-zinc-900">{metric.label}</span>
                            <span className="inline-flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                              {shownNetworks.length === 0 ? (
                                <span>WeSell</span>
                              ) : (
                                shownNetworks.map((network) => (
                                  <span key={network} className="inline-flex items-center gap-1">
                                    <NetworkMark network={network} />
                                    {SOCIAL_NETWORK_LABEL[network]}
                                  </span>
                                ))
                              )}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">{metric.description}</span>
                        </span>
                      </label>
                      {checked && (
                        <span className="w-28 shrink-0">
                          <Input
                            type="number"
                            min={0}
                            max={metric.unit === "percent" ? 100 : undefined}
                            inputMode="numeric"
                            value={target || ""}
                            placeholder="0"
                            aria-label={`${unitCaption(metric)} de ${metric.label}`}
                            onChange={(event) => setTarget(metric.id, event.target.value)}
                          />
                          <span className="mt-1 block text-[11px] text-zinc-400">{unitCaption(metric)}</span>
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
