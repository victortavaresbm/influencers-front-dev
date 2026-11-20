"use client"

import { useEffect, useMemo, useState } from "react"
import { ExternalLink, Flag, Info, Mail, Mars, Shield, StickyNote, Tv, UserRound, Venus } from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { CreatorContact } from "@/components/creators/creator-contact"
import { CampaignFitPanel } from "@/components/discovery/campaign-fit-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { formatCompact, platformProfile, type Platform } from "@/lib/discovery/discover-query"
import {
  buildProfileWidgets,
  formatBRL,
  riskLabel,
  type GradeMetric,
  type ProfileWidgets,
  type RiskLevel,
  type SafetyAxis,
} from "@/lib/discovery/profile-widgets"
import { type Campaign } from "@/lib/mock-data/campaigns"
import { type Creator } from "@/lib/mock-data/creators"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const THEME: Record<Platform, { wash: string; solid: string; text: string; line: string; heat: string; chip: string }> = {
  instagram: { wash: "bg-rose-500/10", solid: "bg-[#e1306c] text-white", text: "text-[#e1306c]", line: "#e11d48", heat: "#e1306c", chip: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  youtube: { wash: "bg-red-500/10", solid: "bg-[#ff0033] text-white", text: "text-[#ff0033]", line: "#e11d48", heat: "#ff0033", chip: "bg-red-500/15 text-red-700 dark:text-red-300" },
  tiktok: { wash: "bg-muted", solid: "bg-foreground text-background", text: "text-foreground", line: "var(--foreground)", heat: "#71717a", chip: "bg-muted text-foreground" },
}

const NETWORK_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
}

const DAY_LABELS = ["Do", "Se", "Te", "Qa", "Qi", "Sx", "Sá"]
const HOURS = ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"]
const POST_DAYS = ["Se", "Te", "Qa", "Qi", "Sx"]
const POST_MONTHS = ["Jun", "Jul", "Ago", "Set", "Out"]
const COLLAB_MONTHS = ["Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov"]

const CREATOR_STATUSES = [
  { value: "lead", label: "Lead", hint: "Ainda sem contato", dot: "bg-amber-500", chip: "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200" },
  { value: "novo", label: "Novo", hint: "Salvo, conversa ainda não começou", dot: "bg-sky-500", chip: "border-sky-500/40 bg-sky-500/15 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200" },
  { value: "conversa", label: "Em conversa", hint: "Contato em andamento", dot: "bg-violet-500", chip: "border-violet-500/40 bg-violet-500/15 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200" },
  { value: "parceiro", label: "Parceiro", hint: "Já colabora com a marca", dot: "bg-emerald-500", chip: "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200" },
] as const

function heatColor(hex: string, opacity: number) {
  const value = hex.replace("#", "")
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function NetworkGlyph({ network, className }: { network: Platform; className?: string }) {
  if (network === "instagram") return <SiInstagram className={className} />
  if (network === "tiktok") return <SiTiktok className={className} />
  return <SiYoutube className={className} />
}

function Hint({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-xs" aria-label={text} className="size-4 text-zinc-400" />}>
        <Info className="size-3" />
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="min-w-[92px] px-3">
      <p className="text-[15px] font-semibold tracking-tight text-zinc-900 tabular-nums">{value}</p>
      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
        {label}
        <Hint text={hint} />
      </p>
    </div>
  )
}

function ShareBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr_28px] items-center gap-2">
      <span className="truncate text-[11px] text-zinc-500">{label}</span>
      <span className="relative h-1 overflow-hidden rounded-full bg-muted">
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </span>
      <span className="text-right text-[11px] text-zinc-500 tabular-nums">{pct}%</span>
    </div>
  )
}

function gradeClass(grade: string) {
  if (grade.startsWith("A")) return "bg-zinc-900 text-white"
  if (grade.startsWith("B")) return "bg-[#ec4899] text-white"
  if (grade.startsWith("C")) return "bg-amber-400 text-zinc-900"
  return "bg-[#fb7185] text-white"
}

function GradeRow({ metric }: { metric: GradeMetric }) {
  const bottom = metric.top > 55
  const place = bottom ? 100 - metric.top : metric.top
  const left = Math.min(96, Math.max(4, 100 - metric.top))
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-700">{metric.label}</span>
        <span className="text-xs text-zinc-400">{bottom ? `bottom ${place}%` : `top ${place}%`}</span>
        <Badge className={cn("ml-auto h-6 min-w-8 rounded-md px-1.5 text-xs font-semibold", gradeClass(metric.grade))}>{metric.grade}</Badge>
      </div>
      <div className="relative h-3">
        <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-border" />
        <span className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-foreground" style={{ left: `${left}%` }} />
      </div>
    </div>
  )
}

function EngagementChart({ series, color }: { series: ProfileWidgets["series"]; color: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const width = 640
  const height = 188
  const pad = { l: 36, r: 8, t: 16, b: 24 }
  const max = Math.max(...series.map((point) => Math.max(point.engagements, point.community)), 1)
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const x = (index: number) => pad.l + (index + 0.5) * (innerW / series.length)
  const y = (value: number) => pad.t + innerH - (value / max) * innerH
  const line = series.map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.engagements)}`).join(" ")
  const active = hover == null ? null : series[hover]

  return (
    <div className="relative">
      <div className="mb-2 flex items-center gap-4 text-[11px] text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4" style={{ backgroundColor: color }} />
          Engajamento médio
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2 rounded-sm bg-muted-foreground/40" />
          Comunidade
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full">
        {[0.25, 0.5, 0.75, 1].map((step) => (
          <line key={step} x1={pad.l} x2={width - pad.r} y1={y(max * step)} y2={y(max * step)} stroke="var(--border)" />
        ))}
        {series.map((point, index) => (
          <rect
            key={point.label}
            x={x(index) - 10}
            y={y(point.community)}
            width={20}
            height={Math.max(0, pad.t + innerH - y(point.community))}
            rx={3}
            fill="var(--muted-foreground)"
            opacity={hover === index ? 0.55 : 0.28}
          />
        ))}
        <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {series.map((point, index) => (
          <circle key={point.label} cx={x(index)} cy={y(point.engagements)} r={hover === index ? 4.5 : 3} fill={color} />
        ))}
        {series.map((point, index) => (
          <text key={`${point.label}-l`} x={x(index)} y={height - 6} textAnchor="middle" className="fill-muted-foreground text-[11px]">
            {point.label}
          </text>
        ))}
        {series.map((point, index) => (
          <rect
            key={`${point.label}-hit`}
            x={x(index) - innerW / series.length / 2}
            y={0}
            width={innerW / series.length}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {active && hover != null && (
        <div
          className="pointer-events-none absolute top-8 rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md"
          style={{ left: `${((hover + 0.5) / series.length) * 100}%`, transform: "translateX(-50%)" }}
        >
          <p className="font-medium text-zinc-800">{active.label}</p>
          <p className="text-zinc-500">{formatCompact(active.engagements)} engajamentos</p>
          <p className="text-zinc-500">{formatCompact(active.followers)} seguidores</p>
        </div>
      )}
    </div>
  )
}

function Radar({ axes, color }: { axes: SafetyAxis[]; color: string }) {
  const cx = 116
  const cy = 108
  const radius = 72
  const point = (index: number, scale: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / axes.length
    return [cx + Math.cos(angle) * radius * scale, cy + Math.sin(angle) * radius * scale]
  }
  const levelScale = (level: RiskLevel) => (level === "medium" ? 0.82 : level === "low" ? 0.48 : 0.18)
  const polygon = axes.map((axis, index) => point(index, levelScale(axis.level)).join(",")).join(" ")
  const rings = [0.35, 0.65, 1]

  return (
    <svg viewBox="0 0 232 220" className="mx-auto h-52 w-full max-w-[260px]">
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={axes.map((_, index) => point(index, ring).join(",")).join(" ")}
          fill="none"
          stroke="var(--border)"
        />
      ))}
      {axes.map((_, index) => {
        const [x, y] = point(index, 1)
        return <line key={index} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" />
      })}
      <polygon points={polygon} fill={color} opacity={0.2} stroke={color} strokeWidth={1.5} />
      {axes.map((axis, index) => {
        const [x, y] = point(index, 1.22)
        return (
          <text key={axis.key} x={x} y={y} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            {axis.label.split(" ")[0]}
          </text>
        )
      })}
    </svg>
  )
}

function riskTone(level: RiskLevel) {
  if (level === "safe") return "text-emerald-600"
  if (level === "low") return "text-amber-600"
  return "text-orange-600"
}

function SafetyOverview({ axes, culture }: { axes: SafetyAxis[]; culture: string }) {
  const ranked = [...axes].sort((a, b) => (a.level === b.level ? 0 : a.level === "safe" ? 1 : -1))
  return (
    <Card size="sm" className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          <Shield className="size-3.5 text-amber-500" />
          Visão de segurança
        </CardTitle>
        <Hint text="As três categorias de maior risco aparecem primeiro. O nível sai do índice de fraude já registrado na base." />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {ranked.slice(0, 3).map((axis) => (
            <div key={axis.key} className="grid grid-cols-[1fr_72px_52px] items-center gap-2 text-xs">
              <span className="truncate text-zinc-600">{axis.label}</span>
              <span className="relative h-1 rounded-full bg-zinc-100">
                <span
                  className={cn("absolute inset-y-0 left-0 rounded-full", axis.level === "safe" ? "bg-zinc-300" : "bg-amber-400")}
                  style={{ width: axis.level === "medium" ? "78%" : axis.level === "low" ? "46%" : "12%" }}
                />
              </span>
              <span className={cn("text-right font-medium", riskTone(axis.level))}>{riskLabel(axis.level)}</span>
            </div>
          ))}
          <p className="text-[11px] text-zinc-400">Top 3 de {axes.length} categorias, por risco</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-200 pt-3 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1"><span className="text-amber-500">🏆</span> Em atividade</span>
          <span className="inline-flex items-center gap-1"><span className="text-violet-500">⚑</span> {culture}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function CreatorProfile({
  creator,
  platform,
  campaign,
  initialTab,
  onLookalikes,
}: {
  creator: Creator
  platform: Platform
  campaign: Campaign | null
  initialTab: string
  onLookalikes: (creator: Creator) => void
}) {
  const available = creator.networks.map((network) => network.network)
  const [network, setNetwork] = useState<Platform>(available.includes(platform) ? platform : available[0])
  const [tab, setTab] = useState(initialTab === "collaborations" ? "profile" : "channels")
  useEffect(() => {
    setTab(initialTab === "collaborations" ? "profile" : "channels")
    const networks = creator.networks.map((item) => item.network)
    setNetwork(networks.includes(platform) ? platform : networks[0])
  }, [creator, initialTab, platform])
  useEffect(() => {
    setRelationship("lead")
  }, [creator.id])
  const [relationship, setRelationship] = useState("lead")
  const [note, setNote] = useState("")
  const [customEmail, setCustomEmail] = useState("")
  const [tracking, setTracking] = useState(false)
  const [strictSafety, setStrictSafety] = useState(false)
  const [tolerance, setTolerance] = useState<Record<string, number>>({})
  const widgets = useMemo(() => buildProfileWidgets(creator, network), [creator, network])
  const profile = platformProfile(creator, network) ?? creator.networks[0]
  const theme = THEME[network]
  const costLabel = network === "youtube" ? "CPV" : "CPE"
  const cost = network === "youtube" ? widgets.cpv : widgets.cpe
  const [first, ...rest] = creator.name.split(" ")
  const worst = widgets.safety.find((axis) => axis.level !== "safe")
  const maxTime = Math.max(1, ...widgets.timeHeat.flatMap((row) => row.map((value) => value ?? 0)))
  const maxDay = Math.max(1, ...widgets.dayHeat.flat())

  return (
    <TooltipProvider delay={200}>
      <div className="bg-zinc-50 text-foreground">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white px-5">
            <TabsList variant="line" className="h-11">
              <TabsTrigger value="channels"><Tv /> Canais</TabsTrigger>
              <TabsTrigger value="safety"><Shield /> Brand safety</TabsTrigger>
              <TabsTrigger value="email"><Mail /> E-mail</TabsTrigger>
              <TabsTrigger value="notes"><StickyNote /> Notas</TabsTrigger>
              <TabsTrigger value="profile"><UserRound /> Perfil</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="channels" className="space-y-4 p-4">
            <div className="grid items-start gap-3 xl:grid-cols-[1fr_320px]">
              <Card size="sm">
                <CardContent className="flex gap-3">
                  <img src={creator.photo} alt="" className="size-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="flex min-w-0 items-center gap-1.5 truncate text-base font-semibold text-zinc-900">
                        <span className="truncate">{creator.name}</span>
                        {profile.verified && <VerifiedBadge className="size-4 shrink-0" />}
                      </p>
                      <CreatorStatus value={relationship} onChange={setRelationship} />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {first} {rest.length > 0 && <span className="text-zinc-400">· {rest.join(" ")}</span>}
                    </p>
                    <p className="text-xs text-zinc-500">{creator.email}</p>
                    <p className="mt-1 text-xs text-zinc-500">Brasil · {creator.location}</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">{creator.bio}</p>
                  </div>
                </CardContent>
              </Card>
              <SafetyOverview axes={widgets.safety} culture={widgets.culture} />
            </div>

            <Card size="sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  Audiência engajada
                  <Hint text="Distribuição estimada a partir da audiência já salva neste creator." />
                </CardTitle>
                <Tabs value={network} onValueChange={(value) => value && setNetwork(value as Platform)}>
                  <TabsList>
                    {available.map((item) => (
                      <TabsTrigger key={item} value={item}>
                        <NetworkGlyph network={item} className="size-3" />
                        {NETWORK_LABEL[item]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-[120px_1fr_1fr_1fr_120px]">
                <div>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">{widgets.credibility.toLocaleString("pt-BR")}%</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">● Real</p>
                </div>
                <div>
                  <p className="mb-2 text-[11px] text-zinc-400">Cidades</p>
                  <div className="space-y-1.5">
                    {widgets.cities.map((city) => (
                      <ShareBar key={city.label} label={city.label} pct={city.pct} color="var(--foreground)" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] text-zinc-400">Países</p>
                  <div className="space-y-1.5">
                    {widgets.countries.map((country) => (
                      <ShareBar key={country.label} label={country.label} pct={country.pct} color="color-mix(in oklch, var(--foreground) 72%, transparent)" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] text-zinc-400">Idade</p>
                  <div className="space-y-1.5">
                    {widgets.ages.map((age) => (
                      <ShareBar key={age.label} label={age.label} pct={age.pct} color="color-mix(in oklch, var(--foreground) 48%, transparent)" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] text-zinc-400">Gênero</p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-1.5 font-semibold text-[#e11d48]">
                      <Venus className="size-4" />
                      {widgets.female}%
                    </p>
                    <p className="text-[11px] text-zinc-400">Feminino</p>
                    <p className="flex items-center gap-1.5 font-semibold text-[#2563eb]">
                      <Mars className="size-4" />
                      {widgets.male}%
                    </p>
                    <p className="text-[11px] text-zinc-400">Masculino</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className={cn("flex overflow-hidden rounded-xl", theme.wash)}>
              <div className={cn("flex w-[76px] shrink-0 flex-col items-center justify-center gap-1", theme.solid)}>
                <span className="text-lg font-semibold tabular-nums">{formatCompact(profile.followers)}</span>
                <NetworkGlyph network={network} className="size-4" />
              </div>
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 py-3 pr-2">
                <div className="min-w-[120px] px-3">
                  <p className="flex items-center gap-1 truncate text-sm font-medium text-zinc-900">
                    {profile.handle.replace(/^@/, "")}
                    {profile.verified && <VerifiedBadge className="size-3.5" />}
                  </p>
                  <p className="text-[11px] text-zinc-500">{NETWORK_LABEL[network]}</p>
                </div>
                <Metric label="Faixa de preço est." value={`${formatBRL(widgets.priceMin)} – ${formatBRL(widgets.priceMax)}`} hint="Estimada a partir do valor de mídia deste creator." />
                <Metric label="Engajamento médio" value={`${profile.engagementRate.toLocaleString("pt-BR")}%`} hint="Taxa média da rede selecionada." />
                <Metric label={costLabel} value={formatBRL(cost, 2)} hint={network === "youtube" ? "Custo estimado por view." : "Custo estimado por engajamento."} />
                <Metric label={network === "youtube" ? "Views médios" : "Curtidas médias"} value={formatCompact(network === "youtube" ? profile.avgViews : widgets.avgLikes)} hint="Média estimada dos conteúdos recentes." />
                <Metric label={network === "youtube" ? "Curtidas médias" : "Comentários médios"} value={network === "youtube" ? widgets.avgLikes.toLocaleString("pt-BR", { maximumFractionDigits: 0 }) : formatCompact(widgets.avgComments)} hint="Derivado do engajamento e das views médias." />
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
                {widgets.posts.map((post) => (
                  <Card key={post.id} size="sm" className="w-[250px] shrink-0">
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className={cn("rounded-full px-2 py-0.5 font-medium", theme.chip)}>
                          {post.engagement.toLocaleString("pt-BR")}% engajamento
                        </span>
                        <span className="text-zinc-400">{costLabel} ~{formatBRL(post.unitCost, 2)}</span>
                      </div>
                      <div className="relative h-36 overflow-hidden rounded-lg bg-zinc-100">
                        {post.image ? (
                          <img src={post.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className={cn("flex h-full items-center justify-center text-xs font-medium", theme.solid)}>
                            {creator.avatar}
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="absolute top-2 right-2 bg-background/90"
                          aria-label="Abrir post"
                          onClick={() => openPostLink(post.url)}
                        >
                          <ExternalLink />
                        </Button>
                      </div>
                      <p className="line-clamp-2 min-h-10 text-sm font-medium text-zinc-900">{post.title}</p>
                      <div className="flex justify-between text-[11px] text-zinc-500">
                        <span><b className="font-semibold text-zinc-800">{formatCompact(post.views)}</b> views</span>
                        <span><b className="font-semibold text-zinc-800">{formatCompact(post.likes)}</b> ♥</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {formatCompact(post.impressions)} est. impressões · {formatCompact(post.reach)} est. alcance
                      </p>
                      <p className="line-clamp-2 text-[11px] text-zinc-500">{post.caption}</p>
                      <p className="text-[11px] text-zinc-400">{post.ago}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => toast.add({ type: "info", title: "Divergência registrada", description: "A conta foi marcada para revisão nesta sessão." })}
              >
                <Flag />
                Relatar divergência de conta
              </Button>
            </div>

            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">Comparar com influenciadores semelhantes</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="space-y-4">
                  {widgets.grades.map((metric) => (
                    <GradeRow key={metric.key} metric={metric} />
                  ))}
                </div>
                <EngagementChart series={widgets.series} color={theme.line} />
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Engajamento médio por horário</CardTitle>
                <span className="text-[11px] text-zinc-400">UTC</span>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="grid min-w-[640px] grid-cols-[28px_repeat(8,1fr)] gap-1">
                  <span />
                  {HOURS.map((hour) => (
                    <span key={hour} className="text-center text-[10px] text-zinc-400">{hour}</span>
                  ))}
                  {widgets.timeHeat.map((row, rowIndex) => (
                    <div key={DAY_LABELS[rowIndex]} className="contents">
                      <span className="text-[10px] text-zinc-400">{DAY_LABELS[rowIndex]}</span>
                      {row.map((value, colIndex) => {
                        const hot = value != null && value >= maxTime * 0.92
                        return (
                          <span
                            key={colIndex}
                            className={cn("flex h-7 items-center justify-center rounded-[4px] text-[10px] tabular-nums", hot ? "font-semibold text-white" : "text-zinc-700")}
                            style={{ backgroundColor: value == null ? "var(--muted)" : heatColor(theme.heat, hot ? 1 : 0.16 + (value / maxTime) * 0.55) }}
                          >
                            {value == null ? "–" : formatCompact(value)}
                          </span>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid items-start gap-3 lg:grid-cols-2">
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Posts por dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-[20px_repeat(5,1fr)] gap-1">
                    <span />
                    {POST_MONTHS.map((month) => (
                      <span key={month} className="text-center text-[10px] text-zinc-400">{month}</span>
                    ))}
                    {widgets.dayHeat.map((row, rowIndex) => (
                      <div key={POST_DAYS[rowIndex]} className="contents">
                        <span className="text-[10px] text-zinc-400">{POST_DAYS[rowIndex]}</span>
                        {row.map((value, colIndex) => (
                          <span key={colIndex} className="block">
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <span
                                    className="block h-5 w-full cursor-default rounded-[3px]"
                                    style={{ backgroundColor: heatColor(theme.heat, value === 0 ? 0.12 : 0.18 + (value / maxDay) * 0.82) }}
                                  />
                                }
                              />
                              <TooltipContent>
                                {value.toLocaleString("pt-BR")} {value === 1 ? "post" : "posts"}
                              </TooltipContent>
                            </Tooltip>
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Desempenho de menções</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <MentionStat label="Engajamento médio na menção" value={`${widgets.mentionEr.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`} />
                  <MentionStat label="Efetividade contra todos os posts" value={`${widgets.mentionEffectiveness.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`} />
                  <MentionStat label="Saturação da menção" value={`${widgets.mentionSaturation.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`} />
                  <div className="space-y-2 border-t border-zinc-100 pt-3">
                    {widgets.mentions.length === 0 && <p className="text-xs text-zinc-400">Nenhuma marca mencionada nos posts desta rede.</p>}
                    {widgets.mentions.map((mention) => (
                      <div key={mention.name} className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-center gap-2">
                          <BrandMark name={mention.name} logo={mention.logo} color="#71717a" />
                          <span className="truncate font-medium text-zinc-800">{mention.name}</span>
                        </span>
                        <span className="shrink-0 text-zinc-400">{mention.count} menções · {mention.effectiveness.toLocaleString("pt-BR")}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="safety" className="space-y-4 p-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Sensibilidade do conteúdo por categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <Radar axes={widgets.safety} color={theme.line} />
                </CardContent>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Resumo de risco</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-600">
                  <p>
                    {worst
                      ? `O sinal mais alto é ${worst.label.toLowerCase()}, classificado como ${riskLabel(worst.level).toLowerCase()}.`
                      : "O risco geral é baixo. Nenhuma categoria passou de seguro."}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {strictSafety
                      ? "Com a tolerância estrita, qualquer sinal acima de seguro pede revisão antes da campanha."
                      : "A recomendação usa o índice de fraude e o nicho já cadastrados. Não há classificação de vídeo quadro a quadro."}
                  </p>
                  {widgets.safety.filter((axis) => axis.level !== "safe").map((axis) => (
                    <div key={axis.key} className="flex gap-3 rounded-lg border border-zinc-200 p-2">
                      <img src={creator.photo} alt="" className="size-14 rounded-md object-cover" />
                      <div>
                        <Badge variant="outline" className={riskTone(axis.level)}>{axis.label} · {riskLabel(axis.level)}</Badge>
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{creator.bio}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">Sinais marcados</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-zinc-100">
                {widgets.safety.map((axis) => (
                  <div key={axis.key} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-sm text-zinc-700">{axis.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="relative h-1 w-24 rounded-full bg-zinc-100">
                        <span
                          className={cn("absolute inset-y-0 left-0 rounded-full", axis.level === "safe" ? "bg-emerald-400" : "bg-amber-400")}
                          style={{ width: axis.level === "medium" ? "78%" : axis.level === "low" ? "46%" : "18%" }}
                        />
                      </span>
                      <span className={cn("w-14 text-right text-xs font-medium", riskTone(axis.level))}>{riskLabel(axis.level)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Limiares de brand safety</CardTitle>
                <Label className="font-normal text-xs">
                  <Checkbox checked={strictSafety} onCheckedChange={(checked) => setStrictSafety(checked === true)} />
                  Tolerância estrita
                </Label>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {widgets.safety.map((axis) => {
                  const value = tolerance[axis.key] ?? (strictSafety ? 0 : 100)
                  return (
                    <div key={axis.key} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-700">{axis.label}</span>
                        <span className="text-zinc-400">{value === 0 ? "Nenhuma" : value === 50 ? "Baixa" : "Total"}</span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-zinc-200">
                        <span className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-card bg-foreground shadow" style={{ left: `calc(${value}% - 6px)` }} />
                      </div>
                      <RadioGroup
                        value={String(value)}
                        onValueChange={(next) => setTolerance((current) => ({ ...current, [axis.key]: Number(next) }))}
                        className="grid grid-cols-3 gap-2"
                      >
                        <Label className="text-xs font-normal"><RadioGroupItem value="0" />Nenhuma</Label>
                        <Label className="text-xs font-normal"><RadioGroupItem value="50" />Baixa</Label>
                        <Label className="text-xs font-normal"><RadioGroupItem value="100" />Total</Label>
                      </RadioGroup>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-3 p-4">
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">E-mails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CreatorContact email={creator.email} phone={creator.phone} showPhone />
                <p className="text-xs text-zinc-400">Este e-mail já está na base. O desbloqueio por crédito não se aplica a ele.</p>
                <Input
                  value={customEmail}
                  placeholder="Adicionar e-mail"
                  onChange={(event) => setCustomEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && customEmail.includes("@")) {
                      event.preventDefault()
                      toast.add({ type: "success", title: "E-mail anotado", description: customEmail })
                      setCustomEmail("")
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="p-4">
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={note} placeholder="Notas sobre o creator" onChange={(event) => setNote(event.target.value)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 p-4">
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-600">{creator.bio}</p>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Atividade de colaboração</CardTitle>
                <span className="text-[11px] text-zinc-400">Últimos 14 meses</span>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-dashed border-zinc-200 p-3 text-xs text-zinc-500">
                    Defina o setor da campanha para ver sobreposição. Os pontos abaixo usam as campanhas já registradas com este creator.
                  </div>
                  <div className="rounded-lg border border-dashed border-zinc-200 p-3 text-xs text-zinc-500">
                    Concorrentes entram como conflito quando a mesma marca aparece na linha do tempo.
                  </div>
                </div>
                {widgets.collabs.length === 0 ? (
                  <p className="text-sm text-zinc-400">Nenhuma colaboração de campanha nesta base.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[760px]">
                      <div className="grid grid-cols-[220px_repeat(14,1fr)] gap-1 text-[10px] text-zinc-400">
                        <span />
                        {COLLAB_MONTHS.map((month, index) => (
                          <span key={`${month}-${index}`} className="text-center">{index % 2 === 0 ? month : ""}</span>
                        ))}
                      </div>
                      {widgets.collabs.map((row) => (
                        <div key={row.brand} className="grid grid-cols-[220px_repeat(14,1fr)] items-center gap-1 py-1.5">
                          <span className="flex min-w-0 items-center gap-2 text-xs text-zinc-700">
                            <BrandMark name={row.brand} logo={row.logo} color={row.color} />
                            <span className="truncate">{row.brand}</span>
                            <span className="text-zinc-400">{row.count}</span>
                          </span>
                          {COLLAB_MONTHS.map((_, index) => (
                            <span key={index} className="flex h-4 items-center justify-center">
                              {row.slots.includes(index) && <span className="size-2 rounded-full" style={{ backgroundColor: row.color }} />}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">Rastrear conteúdo de {first}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <p className="text-xs text-zinc-500">
                  {tracking ? "Marcado nesta sessão. A coleta automática ainda não está ligada." : "Guarda os próximos posts desta rede na biblioteca de conteúdo."}
                </p>
                <Button type="button" size="sm" variant={tracking ? "outline" : "default"} onClick={() => { setTracking(true); toast.add({ type: "success", title: "Rastreio anotado nesta sessão" }) }}>
                  {tracking ? "Rastreando" : "Começar rastreio"}
                </Button>
              </CardContent>
            </Card>

            {campaign && <CampaignFitPanel campaign={campaign} creator={creator} />}

            <Button type="button" variant="outline" size="sm" onClick={() => onLookalikes(creator)}>
              Ver todos os semelhantes
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

function CreatorStatus({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const current = CREATOR_STATUSES.find((status) => status.value === value) ?? CREATOR_STATUSES[0]
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger size="sm" aria-label="Status do creator" className={cn("h-7 w-auto shrink-0 font-medium *:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:overflow-visible", current.chip)}>
        <SelectValue>
          {() => (
            <span className="flex items-center gap-1.5">
              <span className={cn("size-2 shrink-0 rounded-full", current.dot)} />
              {current.label}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-64">
        {CREATOR_STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            <span className="flex flex-col items-start gap-0.5 py-0.5">
              <span className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", status.dot)} />
                {status.label}
              </span>
              <span className="status-hint pl-4 text-xs font-normal text-muted-foreground">{status.hint}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function openPostLink(url: string) {
  if (url.startsWith("http")) {
    window.open(url, "_blank", "noopener,noreferrer")
    return
  }
  toast.add({ type: "info", title: "Este post de exemplo não tem link externo." })
}

function BrandMark({ name, logo, color }: { name: string; logo: string | null; color: string }) {
  if (logo) return <img src={logo} alt="" className="size-7 shrink-0 rounded-lg object-cover" />
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white" style={{ backgroundColor: color }}>
      {name.trim().slice(0, 1).toUpperCase()}
    </span>
  )
}

function MentionStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-zinc-900">{value}</p>
    </div>
  )
}
