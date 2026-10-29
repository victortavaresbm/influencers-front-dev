"use client"
import { useState, type ReactNode } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { LocationField } from "@/components/discovery/location-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NewListSheet } from "@/components/crm/new-list-sheet"
import { emptyCreatorFilters, useCreatorStore, type FilterState } from "@/lib/stores/creators"
import { useFilterPresetStore } from "@/lib/stores/filter-presets"
import { useAuthStore } from "@/lib/stores/auth"
import { useListStore } from "@/lib/stores/lists"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { CreatorContact } from "@/components/creators/creator-contact"
import { POST_TYPE_LABELS } from "@/components/posts/post-card"
import { toast } from "@/components/ui/toast"
import { useI18n } from "@/lib/i18n"
import {
  Search, X, Star, Users, TrendingUp, Heart, UserPlus, ListPlus,
  ChevronLeft, ChevronRight, RefreshCw, Clock, Info,
  History, Bookmark, Trash2, Eye, Play, MapPin, Check,
} from "lucide-react"
import { MONITOR_POSTS, type MonitorPost } from "@/lib/mock-data/metrics"
import { campaignFit, campaignFitScore, filtersFromCampaign, type CampaignFitItem } from "@/lib/discovery/campaign-filters"
import { type Campaign } from "@/lib/mock-data/campaigns"
import { fold, isLinkedPlatformMember, locationTokenLabel, locationTokens } from "@/lib/discovery/scope"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { type Creator } from "@/lib/mock-data/creators"
import { SAVED_CREATOR_IDS } from "@/lib/mock-data/saved-creators"
import { formatDateBR, formatDateRangeBR } from "@/lib/dates"
import { cn } from "@/lib/utils"

const NICHES = ["beleza", "moda", "fitness", "gastronomia", "tecnologia", "lifestyle", "humor", "games", "finanças", "viagem", "maternidade", "sustentabilidade", "pets", "decoração", "esportes"]
const TIERS = ["nano", "micro", "mid", "macro", "mega"]
const TIER_LABELS: Record<string, string> = { nano: "Nano", micro: "Micro", mid: "Mid", macro: "Macro", mega: "Mega" }
const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  aberta: "Aberta",
  em_execucao: "Em execução",
  concluida: "Concluída",
  cancelada: "Cancelada",
  arquivada: "Arquivada",
}
const ENGAGEMENT_OPTIONS = [0, 3, 5, 8]

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

const NetworkIcon = ({ network, size = 12 }: { network: string; size?: number }) => {
  if (network === "instagram") return <SiInstagram size={size} className="text-zinc-500" />
  if (network === "tiktok") return <SiTiktok size={size} className="text-zinc-500" />
  if (network === "youtube") return <SiYoutube size={size} className="text-zinc-500" />
  return null
}

const SEARCH_HISTORY = [
  { query: "micro influencers beleza SP", date: "27/10/2026", results: 12 },
  { query: "macro fitness TikTok", date: "24/10/2026", results: 8 },
  { query: "gastronomia 100k-500k", date: "22/10/2026", results: 5 },
  { query: "sustentabilidade lifestyle", date: "18/10/2026", results: 7 },
]

function cloneFilters(filters: FilterState): FilterState {
  return {
    ...filters,
    niches: [...filters.niches],
    networks: [...filters.networks],
    tiers: [...filters.tiers],
    locations: [...filters.locations],
  }
}

function filterSummary(filters: FilterState, creators: Creator[]) {
  const chips: { key: string; label: string; pin?: boolean }[] = []
  for (const word of keywordWords(filters.search)) chips.push({ key: `nome-${word}`, label: word })
  for (const word of keywordWords(filters.bio ?? "")) chips.push({ key: `bio-${word}`, label: `Bio: ${word}` })
  for (const token of locationTokens(filters.creatorLocation ?? "")) {
    chips.push({ key: `local-${token}`, label: locationTokenLabel(token), pin: true })
  }
  for (const token of locationTokens(filters.audienceLocation ?? "")) {
    chips.push({ key: `audiencia-${token}`, label: `Audiência: ${locationTokenLabel(token)}`, pin: true })
  }
  if (filters.similarTo) {
    const name = creators.find((creator) => creator.id === filters.similarTo)?.name
    if (name) chips.push({ key: "similar", label: `Semelhante a ${name}` })
  }
  if (filters.brandCustomers) chips.push({ key: "customers", label: "Clientes da marca" })
  if (filters.ownBase) chips.push({ key: "base", label: "Base própria" })
  if (filters.availableForPartnership) chips.push({ key: "available", label: "Disponíveis para parceria" })
  for (const niche of filters.niches) chips.push({ key: `nicho-${niche}`, label: niche.charAt(0).toUpperCase() + niche.slice(1) })
  for (const network of filters.networks) chips.push({ key: `rede-${network}`, label: network.charAt(0).toUpperCase() + network.slice(1) })
  for (const tier of filters.tiers) chips.push({ key: `tier-${tier}`, label: TIER_LABELS[tier] ?? tier })
  if ((filters.minFollowers ?? 0) > 0 || (filters.maxFollowers ?? 10000000) < 10000000) {
    chips.push({
      key: "followers",
      label: `${fmt(filters.minFollowers)} – ${fmt(filters.maxFollowers)} seguidores`,
    })
  }
  if ((filters.minEngagement ?? 0) > 0) {
    chips.push({ key: "engagement", label: `Engajamento > ${filters.minEngagement.toLocaleString("pt-BR")}%` })
  }
  return chips
}

function filtersActive(filters: FilterState) {
  return (
    filters.search.trim().length > 0 ||
    (filters.bio ?? "").trim().length > 0 ||
    (filters.creatorLocation ?? "").trim().length > 0 ||
    (filters.audienceLocation ?? "").trim().length > 0 ||
    Boolean(filters.similarTo) ||
    filters.brandCustomers ||
    filters.ownBase ||
    filters.availableForPartnership ||
    filters.niches.length > 0 ||
    filters.tiers.length > 0 ||
    filters.networks.length > 0 ||
    filters.minEngagement > 0 ||
    (filters.minFollowers ?? 0) > 0 ||
    (filters.maxFollowers ?? 10000000) < 10000000
  )
}

function keywordWords(value: string) {
  return value.split(/\s+/).filter(Boolean)
}

function mergeKeywords(current: string, input: string) {
  const words = keywordWords(current)
  const seen = new Set(words.map((word) => fold(word)))
  for (const word of input.split(/[,;\s]+/).map((part) => part.trim()).filter(Boolean)) {
    const key = fold(word)
    if (seen.has(key)) continue
    seen.add(key)
    words.push(word)
  }
  return words.join(" ")
}

function KeywordField({
  value,
  onChange,
  onApply,
  placeholder,
  icon,
}: {
  value: string
  onChange: (value: string) => void
  onApply: (value: string) => void
  placeholder: string
  icon?: ReactNode
}) {
  const [text, setText] = useState("")
  const words = keywordWords(value)

  function addWords() {
    const next = mergeKeywords(value, text)
    onChange(next)
    setText("")
    return next
  }

  return (
    <div className="space-y-1.5">
      {words.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {words.map((word) => (
            <Badge key={word} variant="secondary" className="pr-0.5">
              {word}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-4"
                aria-label={`Remover ${word}`}
                onClick={() => onChange(words.filter((item) => item !== word).join(" "))}
              >
                <X />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        {icon}
        <Input
          placeholder={placeholder}
          className={cn("h-8 bg-white text-sm", icon && "pl-8")}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.ctrlKey) {
              event.preventDefault()
              event.stopPropagation()
              const next = text.trim() ? addWords() : value
              onApply(next)
              return
            }
            if (event.key === "Enter") {
              event.preventDefault()
              if (text.trim()) addWords()
              return
            }
            if (event.key === "Backspace" && text === "" && words.length > 0) {
              onChange(words.slice(0, -1).join(" "))
            }
          }}
        />
      </div>
    </div>
  )
}

function PillToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs px-3 py-1 rounded-full border capitalize transition-colors",
        active ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
      )}
    >
      {label}
    </button>
  )
}

function CreatorRow({
  creator,
  onSelect,
  onPlatform,
  fit,
}: {
  creator: Creator
  onSelect: () => void
  onPlatform: boolean
  fit?: { matched: number; total: number } | null
}) {
  return (
    <tr className="cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50" onClick={onSelect}>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2.5">
          <img
            src={creator.photo}
            alt={creator.name}
            className={cn(
              "size-9 shrink-0 rounded-full border-2 object-cover",
              onPlatform ? "border-blue-500" : "border-zinc-200",
            )}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
          <div className={cn("flex h-9 min-w-0 flex-col", onPlatform ? "justify-between" : "justify-center gap-1")}>
            <p className="flex items-center gap-1 truncate text-xs font-medium leading-none text-zinc-900">
              {creator.name}
              {creator.networks.some((network) => network.network === "instagram" && network.verified) && (
                <VerifiedBadge className="size-3" />
              )}
            </p>
            <p className="truncate text-[11px] leading-none text-zinc-400">
              {creator.handle} · {creator.location}
            </p>
            {onPlatform && (
              <p className="text-[10px] leading-none tracking-wide text-blue-500">PARCEIRO WESELL</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {creator.niche.slice(0, 2).map((n) => (
            <Badge key={n} variant="outline" className="text-xs capitalize">{n}</Badge>
          ))}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-zinc-700 font-medium">{fmt(creator.totalFollowers)}</td>
      <td className="py-3 px-4">
        <span className="text-sm text-zinc-700">{creator.avgEngagement.toFixed(1)}%</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          {creator.networks.map((n) => (
            <span key={n.network} className="flex items-center gap-1 text-xs text-zinc-500">
              <NetworkIcon network={n.network} />
              {fmt(n.followers)}
            </span>
          ))}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-zinc-100 text-zinc-700 capitalize">
          {TIER_LABELS[creator.tier]}
        </span>
      </td>
      {fit && (
        <td className="px-4 py-3 text-sm font-medium text-zinc-800">
          {fit.matched}/{fit.total}
        </td>
      )}
    </tr>
  )
}

function DataBadge({ type }: { type: "official" | "estimated" | "inferred" }) {
  if (type === "official") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F3FF] px-1.5 py-0.5 text-xs font-semibold text-[#0095F6]">
        <VerifiedBadge className="size-3.5" label="Verificado" />
        Verificado
      </span>
    )
  }

  const cfg = {
    estimated: { label: "Estimado", icon: Info, cls: "bg-zinc-100 text-zinc-600" },
    inferred: { label: "Inferido", icon: Clock, cls: "bg-amber-50 text-amber-700" },
  }[type]
  const Icon = cfg.icon
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded", cfg.cls)}>
      <Icon size={12} /> {cfg.label}
    </span>
  )
}

function topContents(creatorId: string) {
  const posts = MONITOR_POSTS.filter((post) => post.creatorId === creatorId)
  const durable = posts.filter((post) => post.type !== "stories")
  const source = durable.length > 0 ? durable : posts
  return [...source]
    .sort((a, b) => b.engagement - a.engagement || (b.views ?? b.reach) - (a.views ?? a.reach))
    .slice(0, 6)
}

function ContentPreview({ post }: { post: MonitorPost }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(post.image) && !failed
  const isVideo = post.type === "reels" || post.type === "tiktok" || post.type === "video_youtube"
  const audience = post.views ?? post.reach

  return (
    <Card size="sm" className="gap-0 py-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
        {showImage ? (
          <img
            src={post.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-zinc-300">
            {post.avatar}
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="gap-1 bg-white/95 text-zinc-700 shadow-sm">
            <NetworkIcon network={post.network} />
            {POST_TYPE_LABELS[post.type] ?? post.type}
          </Badge>
        </div>
        {isVideo && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-black/55 text-white">
              <Play className="ml-0.5 size-4 fill-white" />
            </span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <p className="line-clamp-2 min-h-8 text-xs text-zinc-600">{post.caption}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3" />
            {fmt(audience)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="size-3" />
            {fmt(post.likes)}
          </span>
          <Badge variant="outline">{post.engagement.toFixed(1)}%</Badge>
        </div>
        <p className="text-[11px] text-zinc-400">{formatDateBR(post.publishedAt)}</p>
      </div>
    </Card>
  )
}

function fitHeadline(matched: number, total: number) {
  if (total === 0) return "Esta campanha não pede critérios de busca."
  const ratio = matched / total
  if (matched === total) return "Atende todos os critérios."
  if (ratio >= 0.75) return "Combina bem com esta campanha."
  if (ratio >= 0.5) return "Combina em parte com esta campanha."
  return "Combina pouco com esta campanha."
}

function FitMark({ matches }: { matches: boolean }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full",
        matches ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-500",
      )}
    >
      {matches ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
      <span className="sr-only">{matches ? "Atende" : "Não atende"}</span>
    </span>
  )
}

function CampaignFitPanel({
  campaign,
  fit,
}: {
  campaign: Campaign
  fit: CampaignFitItem[]
}) {
  const matched = fit.filter((item) => item.matches).length
  const percent = fit.length === 0 ? 0 : Math.round((matched / fit.length) * 100)
  const groups = [
    { title: "Nicho", items: fit.filter((item) => item.key.startsWith("niche-")) },
    { title: "Redes", items: fit.filter((item) => item.key.startsWith("network-")) },
    { title: "Alcance", items: fit.filter((item) => item.key === "followers" || item.key === "engagement") },
  ].filter((group) => group.items.length > 0)

  return (
    <div className="space-y-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle>{campaign.name}</CardTitle>
          <CardDescription>{fitHeadline(matched, fit.length)}</CardDescription>
          <CardAction>
            <p className="text-xl font-semibold tabular-nums text-zinc-900">
              {matched}
              <span className="text-sm font-medium text-zinc-400">/{fit.length}</span>
            </p>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Progress value={percent} aria-label={`${percent}% dos critérios`} />
        </CardContent>
      </Card>

      {groups.map((group) => {
        const groupMatches = group.items.filter((item) => item.matches).length
        const wide = group.title === "Alcance"
        return (
          <section key={group.title} className="space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{group.title}</p>
              <p className="text-[11px] text-zinc-400">
                {groupMatches} de {group.items.length}
              </p>
            </div>
            <div className={cn("grid gap-2", wide ? "grid-cols-1" : "grid-cols-2")}>
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-3",
                    item.matches ? "border-emerald-200 bg-emerald-50/70" : "border-zinc-200 bg-white",
                  )}
                >
                  <FitMark matches={item.matches} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-zinc-900">
                      {item.key.startsWith("network-") && <NetworkIcon network={item.key.slice("network-".length)} />}
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function CreatorDrawer({
  creator,
  campaign,
  open,
  onClose,
}: {
  creator: Creator | null
  campaign: Campaign | null
  open: boolean
  onClose: () => void
}) {
  const { t } = useI18n()
  const [section, setSection] = useState("overview")
  if (!creator) return null
  const enrichedDate = "15/10/2026"
  const daysSince = 12
  const posts = topContents(creator.id)
  const fit = campaign ? campaignFit(campaign, creator) : []
  const activeSection = !campaign && section === "campaign" ? "overview" : section

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 pt-6 pb-4 z-10">
          <SheetHeader>
            <div className="flex items-center gap-4 pr-8">
              <img
                src={creator.photo}
                alt={creator.name}
                className="h-16 w-16 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 pb-1">
                <SheetTitle className="flex items-center gap-1 text-base leading-tight">
                  {creator.name}
                  {creator.networks.some((network) => network.network === "instagram" && network.verified) && (
                    <VerifiedBadge className="size-4" />
                  )}
                </SheetTitle>
                <p className="text-xs text-zinc-400 mt-0.5">{creator.handle} · {creator.location}</p>
              </div>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium shrink-0",
                creator.status === "available" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
              )}>
                {creator.status === "available" ? "Disponível" : "Em campanha"}
              </span>
            </div>
          </SheetHeader>

          {/* Data freshness banner */}
          <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock size={12} />
              Dados de audiência atualizados em {enrichedDate} · <span className="font-medium text-zinc-700">{daysSince} dias atrás</span>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900">
              <RefreshCw size={11} /> Atualizar dados
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 border-b border-zinc-100">
          {[
            { label: "Seguidores", value: fmt(creator.totalFollowers), badge: "official" as const },
            { label: "Engaj. médio", value: `${creator.avgEngagement.toFixed(1)}%`, badge: "estimated" as const },
            { label: "Score WeSell", value: `${creator.score}/100`, badge: "inferred" as const },
            { label: "Valor mídia", value: `R$ ${fmt(creator.mediaValue)}`, badge: "estimated" as const },
          ].map(({ label, value, badge }) => (
            <div key={label} className="py-3 px-3 text-center border-r border-zinc-100 last:border-r-0">
              <p className="text-sm font-semibold text-zinc-900">{value}</p>
              <p className="text-[10px] text-zinc-400 mb-1">{label}</p>
              <DataBadge type={badge} />
            </div>
          ))}
        </div>

        <Tabs value={activeSection} onValueChange={setSection} className="px-6 pt-4">
          <TabsList className="mb-4 h-auto! w-fit max-w-full flex-nowrap justify-start overflow-x-auto overflow-y-hidden bg-zinc-100">
            <TabsTrigger value="overview" className="h-7 flex-none px-2.5">Visão geral</TabsTrigger>
            <TabsTrigger value="contents" className="h-7 flex-none px-2.5">Conteúdos</TabsTrigger>
            <TabsTrigger value="audience" className="h-7 flex-none px-2.5">Audiência</TabsTrigger>
            <TabsTrigger value="networks" className="h-7 flex-none px-2.5">Redes</TabsTrigger>
            <TabsTrigger value="contact" className="h-7 flex-none px-2.5">Contato</TabsTrigger>
            {campaign && (
              <TabsTrigger value="campaign" className="h-7 flex-none px-2.5">
                Critérios
                {activeSection !== "campaign" && (
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                )}
                <span className="sr-only">Abrir critérios</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pb-6 [[hidden]]:hidden">
            <p className="text-sm text-zinc-600">{creator.bio}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tier", value: TIER_LABELS[creator.tier] },
                { label: "Campanhas realizadas", value: creator.pastCampaigns },
                { label: "Total posts", value: creator.totalPosts ?? "—" },
                { label: "Última atividade", value: formatDateBR(creator.lastActivity) },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                  <p className="text-xs text-zinc-400">{label}</p>
                  <p className="text-base font-semibold text-zinc-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {creator.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Risco de fraude</p>
              <div className="flex items-center gap-3">
                <Progress value={creator.fraudScore * 10} className="h-2 flex-1" />
                <span className={cn("text-xs font-medium", creator.fraudScore <= 2 ? "text-emerald-600" : creator.fraudScore <= 4 ? "text-yellow-600" : "text-red-600")}>
                  {creator.fraudScore <= 2 ? "Baixo" : creator.fraudScore <= 4 ? "Médio" : "Alto"}
                </span>
              </div>
            </div>
            {creator.totalSales !== undefined && creator.totalSales > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Histórico de vendas</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Total vendas", value: `R$ ${creator.totalSales?.toLocaleString("pt-BR") ?? 0}` },
                    { label: "Comissão paga", value: `R$ ${creator.totalCommission?.toLocaleString("pt-BR") ?? 0}` },
                    { label: "Posts entregues", value: creator.totalPosts ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-2 rounded-lg bg-zinc-50 border border-zinc-100 text-center">
                      <p className="text-sm font-semibold text-zinc-900">{value}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <ActionsMenu
                items={[
                  { label: "Convidar para campanha", icon: UserPlus },
                  {
                    label: t("discovery.saveToList"),
                    icon: ListPlus,
                    onSelect: () =>
                      toast.add({
                        type: "success",
                        title: t("discovery.savedTitle"),
                        description: t("discovery.savedDescription", { name: creator.name }),
                      }),
                  },
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="contents" className="space-y-3 pb-6 [[hidden]]:hidden">
            {posts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-10 text-center">
                <p className="text-sm font-medium text-zinc-700">Nenhum conteúdo para pré-visualizar</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Os conteúdos de melhor desempenho aparecem aqui quando houver publicações.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Top conteúdos</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Pré-visualização dos {posts.length} conteúdos com melhor engajamento.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {posts.map((post) => (
                    <ContentPreview key={post.id} post={post} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="audience" className="space-y-4 pb-6 [[hidden]]:hidden">
            <div>
              <p className="text-sm font-medium text-zinc-700 mb-3 flex items-center gap-2">
                Faixa etária <DataBadge type="estimated" />
              </p>
              {creator.audienceAge.map((a) => (
                <div key={a.range} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-zinc-500 w-12">{a.range}</span>
                  <Progress value={a.pct} className="h-2 flex-1" />
                  <span className="text-xs text-zinc-700 w-8 text-right">{a.pct}%</span>
                </div>
              ))}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-zinc-700 mb-3 flex items-center gap-2">
                Gênero <DataBadge type="estimated" />
              </p>
              {creator.audienceGender.map((g) => (
                <div key={g.label} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-zinc-500 w-16">{g.label}</span>
                  <Progress value={g.pct} className="h-2 flex-1" />
                  <span className="text-xs text-zinc-700 w-8 text-right">{g.pct}%</span>
                </div>
              ))}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-zinc-700 mb-3 flex items-center gap-2">
                Principais cidades <DataBadge type="inferred" />
              </p>
              {creator.audienceLocation.map((l) => (
                <div key={l.city} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-zinc-500 w-24">{l.city}</span>
                  <Progress value={l.pct} className="h-2 flex-1" />
                  <span className="text-xs text-zinc-700 w-8 text-right">{l.pct}%</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="networks" className="space-y-3 pb-6 [[hidden]]:hidden">
            {creator.networks.map((n) => (
              <div key={n.network} className="p-4 rounded-xl border border-zinc-200">
                <div className="flex items-center gap-2 mb-3">
                  <NetworkIcon network={n.network} />
                  <span className="text-sm font-semibold text-zinc-800 capitalize">{n.network}</span>
                  <span className="text-xs text-zinc-400 ml-1">{n.handle}</span>
                  {n.verified && <VerifiedBadge className="size-4" />}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Seguidores", value: fmt(n.followers), badge: "official" as const },
                    { label: "Média de views", value: fmt(n.avgViews), badge: "estimated" as const },
                    { label: "Engajamento", value: `${n.engagementRate}%`, badge: "estimated" as const },
                  ].map(({ label, value, badge }) => (
                    <div key={label} className="text-center p-2 rounded-lg bg-zinc-50">
                      <p className="text-base font-semibold text-zinc-900">{value}</p>
                      <p className="text-xs text-zinc-400">{label}</p>
                      <div className="mt-1 flex justify-center"><DataBadge type={badge} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="contact" className="space-y-3 pb-6 [[hidden]]:hidden">
            <div className="p-4 rounded-xl border border-zinc-200 space-y-3">
              <CreatorContact email={creator.email} phone={creator.phone} />
              <Separator />
              {[
                { label: "Na plataforma desde", value: formatDateBR(creator.joined) },
                { label: "Última atividade", value: formatDateBR(creator.lastActivity) },
                { label: "Tipo de membro", value: creator.memberType === "ambassador" ? "Embaixador" : creator.memberType === "vip" ? "VIP" : "Padrão" },
                { label: "Origem do cadastro", value: creator.origin === "invite" ? "Convite" : creator.origin === "brand_page" ? "Página da marca" : "Orgânico" },
              ].map(({ label, value }, i, arr) => (
                <div key={label}>
                  <p className="text-xs text-zinc-400">{label}</p>
                  <p className="text-sm font-medium text-zinc-800">{value}</p>
                  {i < arr.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </TabsContent>

          {campaign && (
            <TabsContent value="campaign" className="pb-6 [[hidden]]:hidden">
              <CampaignFitPanel campaign={campaign} fit={fit} />
            </TabsContent>
          )}
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

export default function DiscoveryPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const addList = useListStore((s) => s.createList)
  const { creators: catalog, filteredCreators, filters, applyFilters, resetFilters, selectCreator, selected, drawerOpen, setDrawerOpen } = useCreatorStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [tab, setTab] = useState("search")
  const [creatingList, setCreatingList] = useState(false)
  const [namingPreset, setNamingPreset] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [filterPanel, setFilterPanel] = useState("filters")
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [appliedCampaignId, setAppliedCampaignId] = useState<string | null>(null)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const [draft, setDraft] = useState<FilterState>(() => cloneFilters(filters))
  const savePreset = useFilterPresetStore((state) => state.savePreset)
  const removePreset = useFilterPresetStore((state) => state.removePreset)
  const presets = useFilterPresetStore((state) => state.presets)
  const organizationId = user?.organizationId
  const creators = filteredCreators(organizationId)
  const linkedToPlatform = (creator: Creator) =>
    organizationId ? isLinkedPlatformMember(creator, organizationId) : false
  const savedCreators = catalog.filter((creator) => SAVED_CREATOR_IDS.includes(creator.id))
  const hasFilters = filtersActive(draft) || filtersActive(filters)
  const appliedSummary = filterSummary(filters, catalog)

  function applyDraft(patch?: Partial<FilterState>) {
    const next = { ...draft, ...patch }
    setDraft(next)
    applyFilters(cloneFilters(next))
    setAppliedCampaignId(selectedCampaignId)
  }

  function clearFilters() {
    setDraft(emptyCreatorFilters())
    setSelectedPresetId(null)
    setSelectedCampaignId(null)
    setAppliedCampaignId(null)
    resetFilters()
  }

  function selectPreset(presetId: string, nextFilters: FilterState, campaignId?: string) {
    setSelectedPresetId(presetId)
    setSelectedCampaignId(campaignId ?? null)
    setDraft(cloneFilters(nextFilters))
  }

  function selectCampaign(campaignId: string) {
    const campaign = campaigns.find((item) => item.id === campaignId)
    if (!campaign) return
    setSelectedPresetId(null)
    setSelectedCampaignId(campaign.id)
    setDraft(filtersFromCampaign(campaign))
  }

  function confirmPreset() {
    if (!organizationId || !presetName.trim()) return
    const saved = savePreset(organizationId, presetName, draft, selectedCampaignId ?? undefined)
    if (!saved) {
      toast.add({ type: "error", title: "Já existe um pré-set com esse nome." })
      return
    }
    toast.add({ type: "success", title: "Pré-set salvo", description: saved.name })
    setPresetName("")
    setNamingPreset(false)
    setSelectedPresetId(saved.id)
    setFilterPanel("presets")
  }

  const orgPresets = organizationId ? presets.filter((preset) => preset.organizationId === organizationId) : []
  const orgCampaigns = campaigns.filter(
    (campaign) => campaign.organizationId === organizationId && campaign.status !== "cancelada" && campaign.status !== "arquivada"
  )
  const selectedPreset = orgPresets.find((preset) => preset.id === selectedPresetId) ?? null
  const previewCampaign = campaigns.find((campaign) => campaign.id === (selectedPreset?.campaignId ?? selectedCampaignId)) ?? null
  const appliedCampaign = campaigns.find((campaign) => campaign.id === appliedCampaignId) ?? null
  const rankedCreators = appliedCampaign
    ? [...creators].sort((a, b) => campaignFitScore(appliedCampaign, b).matched - campaignFitScore(appliedCampaign, a).matched)
    : creators
  const searchHeaders = ["Creator", "Nicho", "Seguidores", "Engajamento", "Redes", "Tier", ...(appliedCampaign ? ["Critérios"] : [])]
  const previewSummary = previewCampaign || selectedPreset ? filterSummary(draft, catalog) : []

  return (
    <div className="flex h-screen min-h-0 max-h-screen flex-1 flex-col overflow-hidden">
      <TopBar title={t("pages.discovery")} subtitle={t("pages.creatorsFound", { count: creators.length })} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left filter sidebar */}
        <div
          className={cn(
            "shrink-0 border-r border-zinc-200 bg-zinc-50 flex flex-col min-h-0 h-full transition-all duration-200 overflow-hidden",
            sidebarCollapsed ? "w-10" : "w-64"
          )}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.ctrlKey) {
              event.preventDefault()
              applyDraft()
            }
          }}
        >
          <div className="flex items-start justify-between gap-2 border-b border-zinc-200 px-3 py-3">
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Filtros</p>
                <p className="mt-1 text-[11px] leading-snug text-zinc-400">
                  Nos textos livres, Enter cria a palavra da busca. Ctrl + Enter aplica os filtros.
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="ml-auto flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-200 text-zinc-500"
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {!sidebarCollapsed && (
            <>
              <Tabs
                value={filterPanel}
                onValueChange={(value) => {
                  if (value === "filters" || value === "presets") setFilterPanel(value)
                }}
                className="min-h-0 flex-1 gap-0"
              >
                <div className="border-b border-zinc-200 px-3 py-2">
                  <TabsList className="w-full">
                    <TabsTrigger value="filters">Filtros</TabsTrigger>
                    <TabsTrigger value="presets">Pré-sets</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="filters" className="min-h-0 flex-1 overflow-y-auto p-3 [[hidden]]:hidden">
              <div className="space-y-5">
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Nome ou @</p>
                    <KeywordField
                      value={draft.search}
                      placeholder="Buscar por nome ou @"
                      icon={<Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />}
                      onChange={(search) => setDraft((current) => ({ ...current, search }))}
                      onApply={(search) => applyDraft({ search })}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Palavras-chave na bio</p>
                    <KeywordField
                      value={draft.bio ?? ""}
                      placeholder="Ex.: skincare, receitas"
                      onChange={(bio) => setDraft((current) => ({ ...current, bio }))}
                      onApply={(bio) => applyDraft({ bio })}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Localização do creator</p>
                    <LocationField
                      value={draft.creatorLocation ?? ""}
                      placeholder="Cidade ou estado"
                      onChange={(creatorLocation) => setDraft((current) => ({ ...current, creatorLocation }))}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Localização da audiência</p>
                    <LocationField
                      value={draft.audienceLocation ?? ""}
                      placeholder="Cidade predominante"
                      onChange={(audienceLocation) => setDraft((current) => ({ ...current, audienceLocation }))}
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Semelhantes a</p>
                      {draft.similarTo && (
                        <button
                          type="button"
                          className="text-[11px] text-zinc-400 hover:text-zinc-700"
                          onClick={() => setDraft((current) => ({ ...current, similarTo: "" }))}
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                    <Select
                      value={draft.similarTo || null}
                      onValueChange={(value) => setDraft((current) => ({ ...current, similarTo: value ?? "" }))}
                    >
                      <SelectTrigger size="sm" className="w-full bg-white">
                        <SelectValue placeholder="Creator de referência">
                          {(value) => catalog.find((creator) => creator.id === value)?.name ?? "Creator de referência"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {catalog.map((creator) => (
                          <SelectItem key={creator.id} value={creator.id}>
                            {creator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Base</p>
                  <div className="space-y-2">
                    {[
                      { key: "brandCustomers" as const, label: "Clientes da marca que também são creators" },
                      { key: "ownBase" as const, label: "Base própria da marca" },
                      { key: "availableForPartnership" as const, label: "Disponíveis para novas parcerias" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-start gap-2 cursor-pointer">
                        <Checkbox
                          className="mt-0.5"
                          checked={Boolean(draft[key])}
                          onCheckedChange={(checked) => setDraft((current) => ({ ...current, [key]: checked === true }))}
                        />
                        <span className="text-xs text-zinc-600">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700">
                    <X size={11} /> Limpar filtros
                  </button>
                )}

                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Seguidores</p>
                  <div className="space-y-1.5">
                    {[
                      { label: "Qualquer", val: "" },
                      { label: "< 10k (Nano)", val: "nano" },
                      { label: "10k – 100k (Micro)", val: "micro" },
                      { label: "100k – 500k (Mid)", val: "mid" },
                      { label: "500k – 1M (Macro)", val: "macro" },
                      { label: "> 1M (Mega)", val: "mega" },
                    ].map(({ label, val }) => (
                      <label key={label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={
                            val === ""
                              ? draft.tiers.length === 0 && draft.minFollowers === 0 && draft.maxFollowers >= 10000000
                              : draft.tiers.includes(val)
                          }
                          onChange={() => {
                            if (val === "") {
                              setDraft((current) => ({ ...current, tiers: [], minFollowers: 0, maxFollowers: 10000000 }))
                              return
                            }
                            setDraft((current) => ({
                              ...current,
                              tiers: current.tiers.includes(val)
                                ? current.tiers.filter((tier) => tier !== val)
                                : [...current.tiers, val],
                            }))
                          }}
                        />
                        <span className="text-xs text-zinc-600">{label}</span>
                      </label>
                    ))}
                  </div>
                  {(draft.minFollowers > 0 || draft.maxFollowers < 10000000) && (
                    <p className="mt-2 text-[11px] text-zinc-500">
                      Faixa da campanha: {fmt(draft.minFollowers)} – {fmt(draft.maxFollowers)}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Rede social</p>
                  <div className="space-y-1.5">
                    {["instagram", "tiktok", "youtube"].map((net) => (
                      <label key={net} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={draft.networks.includes(net)}
                          onChange={() =>
                            setDraft((current) => ({
                              ...current,
                              networks: current.networks.includes(net)
                                ? current.networks.filter((network) => network !== net)
                                : [...current.networks, net],
                            }))
                          }
                        />
                        <span className="flex items-center gap-1.5 text-xs text-zinc-600 capitalize">
                          <NetworkIcon network={net} /> {net}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Nicho</p>
                  <div className="flex flex-wrap gap-1.5">
                    {NICHES.map((n) => (
                      <PillToggle
                        key={n}
                        label={n}
                        active={draft.niches.includes(n)}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            niches: current.niches.includes(n)
                              ? current.niches.filter((niche) => niche !== n)
                              : [...current.niches, n],
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Engajamento mínimo</p>
                  <div className="space-y-1.5">
                    {[{ label: "Qualquer", val: 0 }, { label: "> 3%", val: 3 }, { label: "> 5%", val: 5 }, { label: "> 8%", val: 8 }].map(({ label, val }) => (
                      <label key={label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="engMin"
                          className="rounded"
                          checked={draft.minEngagement === val}
                          onChange={() => setDraft((current) => ({ ...current, minEngagement: val }))}
                        />
                        <span className="text-xs text-zinc-600">{label}</span>
                      </label>
                    ))}
                  </div>
                  {!ENGAGEMENT_OPTIONS.includes(draft.minEngagement) && draft.minEngagement > 0 && (
                    <p className="mt-2 text-[11px] text-zinc-500">
                      Mínimo da campanha: {draft.minEngagement.toLocaleString("pt-BR")}%
                    </p>
                  )}
                </div>
              </div>
                </TabsContent>

                <TabsContent value="presets" className="min-h-0 flex-1 overflow-y-auto p-3 [[hidden]]:hidden">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Campanhas</p>
                      {orgCampaigns.length === 0 ? (
                        <p className="text-[11px] text-zinc-400">Nenhuma campanha desta marca.</p>
                      ) : (
                        orgCampaigns.map((campaign) => (
                          <Button
                            key={campaign.id}
                            type="button"
                            size="sm"
                            variant={selectedCampaignId === campaign.id && !selectedPresetId ? "default" : "outline"}
                            className="h-auto w-full justify-start whitespace-normal py-2 text-left"
                            onClick={() => selectCampaign(campaign.id)}
                          >
                            {campaign.name}
                          </Button>
                        ))
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={!filtersActive(draft) || !organizationId}
                      onClick={() => {
                        setPresetName("")
                        setNamingPreset(true)
                      }}
                    >
                      <Bookmark />
                      Salvar pré-set
                    </Button>

                    {orgPresets.length === 0 ? (
                      <p className="text-[11px] text-zinc-400">Nenhum pré-set salvo.</p>
                    ) : (
                      <div className="space-y-1">
                        {orgPresets.map((preset) => (
                          <Button
                            key={preset.id}
                            type="button"
                            size="sm"
                            variant={selectedPresetId === preset.id ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => selectPreset(preset.id, preset.filters, preset.campaignId)}
                          >
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                    )}

                    {(previewCampaign || selectedPreset) && (
                      <div className="space-y-2">
                        {previewCampaign && (
                          <div className="space-y-1 rounded-lg border border-zinc-200 bg-white p-2">
                            <p className="text-xs font-medium text-zinc-900">{previewCampaign.name}</p>
                            <p className="text-[11px] leading-snug text-zinc-500">{previewCampaign.objective}</p>
                            <p className="text-[11px] text-zinc-400">
                              {CAMPAIGN_STATUS_LABEL[previewCampaign.status] ?? previewCampaign.status}
                              {" · "}
                              {formatDateRangeBR(previewCampaign.startDate, previewCampaign.endDate)}
                            </p>
                            {previewCampaign.mandatoryHashtags.length > 0 && (
                              <p className="text-[11px] text-zinc-500">
                                Hashtags: {previewCampaign.mandatoryHashtags.join(" ")}
                              </p>
                            )}
                            {previewCampaign.mandatoryMentions.length > 0 && (
                              <p className="text-[11px] text-zinc-500">
                                Menções: {previewCampaign.mandatoryMentions.map((mention) => mention.handle).join(", ")}
                              </p>
                            )}
                          </div>
                        )}
                        <p className="text-[11px] leading-snug text-zinc-500">
                          Estes filtros entram na busca quando você clicar em Aplicar filtros.
                        </p>
                        {previewSummary.length === 0 ? (
                          <p className="text-[11px] text-zinc-400">Este pré-set não tem filtros.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {previewSummary.map((chip) => (
                              <Badge key={chip.key} variant="secondary">
                                {chip.pin && <MapPin />}
                                {chip.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {selectedPreset && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              removePreset(selectedPreset.id)
                              setSelectedPresetId(null)
                            }}
                          >
                            <Trash2 />
                            Excluir
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="border-t border-zinc-200 p-3">
                <Button type="button" className="w-full" size="sm" onClick={() => applyDraft()}>
                  Aplicar filtros
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs: Buscar / Histórico / Enriquecidos */}
          <div className="border-b border-zinc-200 bg-white px-4">
            <div className="flex items-center gap-1">
              {[
                { id: "search", icon: Search, label: "Buscar" },
                { id: "history", icon: History, label: "Histórico de buscas" },
                { id: "saved", icon: Bookmark, label: `Salvos (${SAVED_CREATOR_IDS.length})` },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors",
                    tab === id ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  <Icon size={13} />{label}
                </button>
              ))}

              <div className="flex-1" />

              {tab === "saved" && (
                <Button
                  size="sm"
                  className="my-1.5 mr-2"
                  disabled={savedCreators.length === 0}
                  onClick={() => setCreatingList(true)}
                >
                  <ListPlus size={14} />
                  {t("discovery.createList")}
                </Button>
              )}

              {/* Live result count chip */}
              <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full font-medium">
                {creators.length} resultado{creators.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {appliedSummary.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 bg-white px-4 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Filtros</span>
              {appliedSummary.map((chip) => (
                <Badge key={chip.key} variant="secondary">
                  {chip.pin && <MapPin />}
                  {chip.label}
                </Badge>
              ))}
            </div>
          )}

          {tab === "search" && (
            <>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-zinc-200 bg-white sticky top-0 z-10">
                    <tr>
                      {searchHeaders.map((h) => (
                        <th key={h} className="py-2.5 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rankedCreators.map((c) => (
                      <CreatorRow
                        key={c.id}
                        creator={c}
                        onPlatform={linkedToPlatform(c)}
                        fit={appliedCampaign ? campaignFitScore(appliedCampaign, c) : null}
                        onSelect={() => selectCreator(c.id)}
                      />
                    ))}
                    {rankedCreators.length === 0 && (
                      <tr>
                        <td colSpan={searchHeaders.length} className="py-16 text-center text-sm text-zinc-400">
                          Nenhum creator encontrado com os filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "history" && (
            <div className="flex-1 p-6">
              <div className="max-w-xl space-y-2">
                <p className="text-xs text-zinc-400 mb-4">Últimas buscas realizadas nesta conta</p>
                {SEARCH_HISTORY.map((h) => (
                  <button
                    key={h.query}
                    onClick={() => {
                      const next = { ...draft, search: h.query }
                      setDraft(next)
                      applyFilters(cloneFilters(next))
                      setAppliedCampaignId(null)
                      setTab("search")
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <History size={14} className="text-zinc-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-800">{h.query}</p>
                        <p className="text-xs text-zinc-400">{h.date} · {h.results} resultados</p>
                      </div>
                    </div>
                    <Search size={13} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "saved" && (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-200 bg-white sticky top-0 z-10">
                  <tr>
                    {["Creator", "Nicho", "Seguidores", "Engajamento", "Redes", "Tier"].map((h) => (
                      <th key={h} className="py-2.5 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {creators.filter((c) => SAVED_CREATOR_IDS.includes(c.id)).map((c) => (
                    <CreatorRow
                      key={c.id}
                      creator={c}
                      onPlatform={linkedToPlatform(c)}
                      onSelect={() => selectCreator(c.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={namingPreset} onOpenChange={setNamingPreset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar pré-set</DialogTitle>
            <DialogDescription>Dê um nome para reutilizar estes filtros depois.</DialogDescription>
          </DialogHeader>
          <Input
            value={presetName}
            placeholder="Ex.: Beleza em São Paulo"
            onChange={(event) => setPresetName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                confirmPreset()
              }
            }}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNamingPreset(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!presetName.trim()} onClick={confirmPreset}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreatorDrawer creator={selected} campaign={previewCampaign} open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <NewListSheet
        open={creatingList}
        candidates={savedCreators.map((creator) => ({ creator, favorite: true, community: false }))}
        initialCreatorIds={savedCreators.map((creator) => creator.id)}
        description={t("discovery.createListDescription")}
        onOpenChange={setCreatingList}
        onCreate={(input) => {
          if (!user?.organizationId) return
          addList({ organizationId: user.organizationId, ...input })
          setCreatingList(false)
          toast.add({
            type: "success",
            title: t("discovery.listCreated"),
            description: input.name,
          })
        }}
      />
    </div>
  )
}
