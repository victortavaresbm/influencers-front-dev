"use client"
import { use, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { CAMPAIGN_METRICS, MONITOR_POSTS, type MonitorPost } from "@/lib/mock-data/metrics"
import { PeriodFilter } from "@/components/ui/period-filter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { toast } from "@/components/ui/toast"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AreaChart } from "@tremor/react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import {
  ArrowLeft, Users, DollarSign, TrendingUp, Eye, Heart, Download,
  CheckCircle, AlertTriangle, XCircle, Trophy, Star, Send, FileBarChart2, UserPlus,
  LayoutGrid, List,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CouponTicket } from "@/components/ui/coupon-ticket"
import { campaignStatusKey, participantStatusKey, useI18n } from "@/lib/i18n"
import { isSocialNetwork, SOCIAL_NETWORK_LABEL, type Campaign } from "@/lib/mock-data/campaigns"
import { CampaignTypeBadge } from "@/components/campaigns/campaign-type-badge"
import { CampaignVisibilityPicker } from "@/components/campaigns/campaign-visibility-picker"
import { CampaignSuccessTargets } from "@/components/campaigns/campaign-success-targets"
import { InviteCreatorsSheet } from "@/components/campaigns/invite-creators-sheet"
import { contentFormatByValue } from "@/lib/campaign-types"
import { CREATORS } from "@/lib/mock-data/creators"
import { formatDateBR, formatDateRangeBR } from "@/lib/dates"
import { ALL_PERIOD, dateInPeriod, type PeriodValue } from "@/lib/period"
import { campaignRoi, participantRoi, ROI_TOOLTIP } from "@/lib/roi"
import { CampaignAnalytics } from "@/components/campaigns/campaign-analytics"
import { SeedingResults, seedingCampaignFor } from "@/components/seeding/seeding-results"
import { useSeedingStore } from "@/lib/stores/seeding"
import { ContentCalendar } from "@/components/calendar/content-calendar"
import { GuidelineLists, cleanGuidelines } from "@/components/campaigns/guideline-list"
import { buildSchedule } from "@/lib/schedule"
import { PostCard, PostDetailSheet } from "@/components/posts/post-card"
import { CreatorContact } from "@/components/creators/creator-contact"
import { MembershipBadge, NotTracked } from "@/components/members/membership-badge"
import { memberTracksContent, useMembershipStore } from "@/lib/stores/membership"

const CREATOR_PHOTOS: Record<string, string> = Object.fromEntries(
  CREATORS.map((c: { id: string; photo: string }) => [c.id, c.photo])
)

const STATUS_COLORS: Record<string, string> = {
  em_execucao: "bg-blue-50 text-blue-700", aberta: "bg-emerald-50 text-emerald-700",
  rascunho: "bg-zinc-100 text-zinc-600", concluida: "bg-zinc-900 text-white",
  cancelada: "bg-red-50 text-red-700", arquivada: "bg-zinc-100 text-zinc-500",
}
const P_STATUS_COLORS: Record<string, string> = {
  convidado: "bg-zinc-100 text-zinc-600", candidato: "bg-yellow-50 text-yellow-700",
  selecionado: "bg-zinc-900 text-white", recusado: "bg-red-50 text-red-700",
  entregue: "bg-emerald-50 text-emerald-700",
}
const TIER_LABELS: Record<string, string> = { nano: "Nano", micro: "Micro", mid: "Mid", macro: "Macro", mega: "Mega" }
const LEVEL_LABELS: Record<string, string> = { bronze: "Bronze", silver: "Prata", gold: "Ouro", platinum: "Platina" }

const NetworkIcon = ({ network }: { network: string }) => {
  if (network === "instagram") return <SiInstagram size={12} className="text-zinc-500" />
  if (network === "tiktok") return <SiTiktok size={12} className="text-zinc-500" />
  if (network === "youtube") return <SiYoutube size={12} className="text-zinc-500" />
  return null
}

const AI_CONFIG = {
  aprovado: { label: "Aprovado", icon: CheckCircle, classes: "text-emerald-600 bg-emerald-50" },
  alerta: { label: "Alerta", icon: AlertTriangle, classes: "text-amber-600 bg-amber-50" },
  reprovado: { label: "Reprovado", icon: XCircle, classes: "text-red-600 bg-red-50" },
} as const

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

function RoiCell({ roi }: { roi?: number }) {
  if (roi === undefined) return <span className="text-zinc-300 text-xs">—</span>
  const color = roi > 50 ? "text-emerald-700" : roi > 0 ? "text-zinc-700" : "text-red-600"
  return (
    <span className={cn("text-sm font-semibold", color)} title={ROI_TOOLTIP}>
      {roi > 0 ? "+" : ""}{roi}%
    </span>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const colors = ["bg-yellow-400 text-yellow-900", "bg-zinc-300 text-zinc-700", "bg-orange-300 text-orange-900"]
  if (rank <= 3) {
    return (
      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", colors[rank - 1])}>
        {rank}
      </span>
    )
  }
  return <span className="text-xs text-zinc-400 w-6 text-center">{rank}</span>
}

function ParticipantsTable({ campaign, period }: { campaign: Campaign; period: PeriodValue }) {
  const { t } = useI18n()
  const participants = campaign.participants
  const roles = useMembershipStore((state) => state.roles)
  const addParticipant = useCampaignStore((s) => s.addParticipant)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"reach" | "roi" | "revenue">("reach")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  function toggleSort(column: "reach" | "roi" | "revenue") {
    if (sortBy === column) setSortDir((dir) => (dir === "desc" ? "asc" : "desc"))
    else {
      setSortBy(column)
      setSortDir("desc")
    }
  }

  const sorted = [...participants]
    .filter((participant) => dateInPeriod(memberTracksContent(participant.creatorId, roles) ? participant.lastPost : undefined, period))
    .sort((a, b) => {
    const reachOf = (creatorId: string, reach?: number) => (memberTracksContent(creatorId, roles) ? reach ?? 0 : 0)
    const left = sortBy === "reach" ? reachOf(a.creatorId, a.totalReach) : sortBy === "roi" ? (participantRoi(a) ?? -999) : (a.revenue ?? 0)
    const right = sortBy === "reach" ? reachOf(b.creatorId, b.totalReach) : sortBy === "roi" ? (participantRoi(b) ?? -999) : (b.revenue ?? 0)
    return sortDir === "desc" ? right - left : left - right
  })

  const total = sorted.filter((p) => memberTracksContent(p.creatorId, roles) && p.totalReach)
  const active = sorted.filter((p) => p.status !== "recusado" && p.status !== "convidado")

  return (
    <>
      {/* KPIs above table */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-zinc-600">
          <Users size={14} className="text-zinc-400" />
          <span className="font-semibold text-zinc-900">{sorted.length}</span> membros na campanha
        </div>
        <div className="h-4 w-px bg-zinc-200" />
        <div className="flex items-center gap-1.5 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-900">{active.length}</span> ativos
        </div>
        <div className="h-4 w-px bg-zinc-200" />
        <div className="flex items-center gap-1.5 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-900">{total.length}</span> com posts entregues
        </div>
        <div className="flex-1" />
        <ActionsMenu
          items={[
            { label: "Convidar creator", icon: UserPlus, onSelect: () => setInviteOpen(true) },
            { label: "Exportar CSV", icon: Download },
          ]}
        />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center text-sm text-zinc-400">
          {participants.length === 0
            ? "Nenhum creator adicionado a esta campanha."
            : "Nenhum creator com post neste período."}
        </div>
      ) : (
      <div className="rounded-xl border border-zinc-200 overflow-x-auto bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50">
              <th className="py-2.5 px-3 text-xs font-medium text-zinc-500">#</th>
              <th className="py-2.5 px-4 text-xs font-medium text-zinc-500">Creator</th>
              <th className="py-2.5 px-3 text-xs font-medium text-zinc-500">Contato</th>
              <th className="py-2.5 px-3 text-xs font-medium text-zinc-500">Status</th>
              <th className="py-2.5 px-3 text-xs font-medium text-zinc-500">Tier · Nível</th>
              <th className="py-2.5 px-3 text-xs font-medium text-zinc-500">Fee</th>
              <th className="py-2.5 px-3 text-left">
                <Button variant="ghost" size="xs" className="-ml-1.5 font-medium text-zinc-500" aria-pressed={sortBy === "reach"} onClick={() => toggleSort("reach")}>
                  Alcance {sortBy === "reach" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </Button>
              </th>
              <th className="py-2.5 px-3 text-xs font-medium text-zinc-500">Posts</th>
              <th className="py-2.5 px-3 text-left">
                <Button variant="ghost" size="xs" className="-ml-1.5 font-medium text-zinc-500" aria-pressed={sortBy === "revenue"} onClick={() => toggleSort("revenue")}>
                  Receita {sortBy === "revenue" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </Button>
              </th>
              <th className="py-2.5 px-3 text-left">
                <Button variant="ghost" size="xs" className="-ml-1.5 font-medium text-zinc-500" aria-pressed={sortBy === "roi"} onClick={() => toggleSort("roi")}>
                  ROI {sortBy === "roi" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </Button>
              </th>
              <th className="py-2.5 px-3 text-xs font-medium text-zinc-500">Cupom</th>
              <th className="py-2.5 px-3 text-xs font-medium text-zinc-500">Último post</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const creator = CREATORS.find((item) => item.id === p.creatorId)
              const content = memberTracksContent(p.creatorId, roles)
              return (
              <tr key={p.creatorId} className="border-t border-zinc-100 hover:bg-zinc-50">
                <td className="py-2.5 px-3">
                  {content && total.length > 0 && p.totalReach ? <RankBadge rank={i + 1} /> : <span className="text-xs text-zinc-300">—</span>}
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    {CREATOR_PHOTOS[p.creatorId] ? (
                      <img
                        src={CREATOR_PHOTOS[p.creatorId]}
                        alt={p.creatorName}
                        className="h-7 w-7 rounded-full object-cover shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700 shrink-0">
                        {p.avatar}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-900 whitespace-nowrap">{p.creatorName}</p>
                      <p className="text-xs text-zinc-400">{p.creatorHandle}</p>
                      <div className="mt-1"><MembershipBadge role={roles[p.creatorId] ?? creator?.membershipRole} /></div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  {creator ? <CreatorContact email={creator.email} phone={creator.phone} /> : <span className="text-xs text-zinc-300">—</span>}
                </td>
                <td className="py-2.5 px-3">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", P_STATUS_COLORS[p.status])}>
                    {t(participantStatusKey(p.status))}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-xs text-zinc-600">
                  {p.tier ? TIER_LABELS[p.tier] : "—"}{p.level ? ` · ${LEVEL_LABELS[p.level]}` : ""}
                </td>
                <td className="py-2.5 px-3 text-sm text-zinc-700">R$ {(p.fee || 0).toLocaleString("pt-BR")}</td>
                <td className="py-2.5 px-3 text-sm text-zinc-700">{content ? (p.totalReach ? fmt(p.totalReach) : "—") : <NotTracked />}</td>
                <td className="py-2.5 px-3 text-sm text-zinc-700">
                  {content ? (
                    p.postsDelivered !== undefined ? (
                      <span>{p.postsApproved ?? p.postsDelivered}/{p.postsDelivered}</span>
                    ) : "—"
                  ) : <NotTracked />}
                </td>
                <td className="py-2.5 px-3 text-sm text-zinc-700">{p.revenue ? `R$ ${fmt(p.revenue)}` : "—"}</td>
                <td className="py-2.5 px-3"><RoiCell roi={participantRoi(p)} /></td>
                <td className="py-2.5 px-3">
                  {p.couponCode ? (
                    <CouponTicket code={p.couponCode} />
                  ) : <span className="text-zinc-300 text-xs">—</span>}
                </td>
                <td className="py-2.5 px-3 text-xs text-zinc-500">{content ? (p.lastPost ? formatDateBR(p.lastPost) : "—") : <NotTracked />}</td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      )}
      <InviteCreatorsSheet
        open={inviteOpen}
        organizationId={campaign.organizationId}
        participantIds={participants.map((item) => item.creatorId)}
        onOpenChange={setInviteOpen}
        onInvite={(creators) => {
          for (const creator of creators) {
            addParticipant(campaign.id, {
              creatorId: creator.id,
              creatorName: creator.name,
              creatorHandle: creator.handle,
              avatar: creator.avatar,
              tier: creator.tier,
              status: "convidado",
              fee: 0,
              deliverables: [],
              level: creator.level,
              memberType: creator.memberType,
            })
          }
          toast.add({
            type: "success",
            title: creators.length === 1 ? "Creator convidado" : "Creators convidados",
            description:
              creators.length === 1
                ? `${creators[0].name} entrou como convidado.`
                : `${creators.length} creators entraram como convidados.`,
          })
          setInviteOpen(false)
        }}
      />
    </>
  )
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n()
  const { id } = use(params)
  const router = useRouter()
  const campaigns = useCampaignStore((s) => s.campaigns)
  const seedingCampaigns = useSeedingStore((s) => s.campaigns)
  const setVisibility = useCampaignStore((s) => s.setVisibility)
  const setSuccessTargets = useCampaignStore((s) => s.setSuccessTargets)
  const setStatus = useCampaignStore((s) => s.setStatus)
  const campaign = campaigns.find((c) => c.id === id)
  const metrics = CAMPAIGN_METRICS.find((m) => m.campaignId === id)
  const roles = useMembershipStore((state) => state.roles)
  const posts = MONITOR_POSTS.filter((p) => p.campaignId === id && memberTracksContent(p.creatorId, roles))
  const schedule = useMemo(
    () => buildSchedule(campaigns).filter((slot) => slot.campaignId === id),
    [campaigns, id, roles],
  )
  const [contentView, setContentView] = useState<"grid" | "list">("grid")
  const [period, setPeriod] = useState<PeriodValue>(ALL_PERIOD)
  const [tab, setTab] = useState("overview")
  const [aiFilter, setAiFilter] = useState<MonitorPost["aiStatus"] | null>(null)
  const [selectedPost, setSelectedPost] = useState<MonitorPost | null>(null)

  if (!campaign) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <p className="text-zinc-500">{t("pages.notFound")}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/campaigns")}>{t("pages.back")}</Button>
      </div>
    )
  }

  const contentReach = campaign.participants.reduce(
    (sum, participant) => sum + (memberTracksContent(participant.creatorId, roles) ? participant.totalReach ?? 0 : 0),
    0,
  )
  const contentEngagement = campaign.participants.reduce(
    (sum, participant) => sum + (memberTracksContent(participant.creatorId, roles) ? participant.totalEngagement ?? 0 : 0),
    0,
  )
  const isCompleted = campaign.status === "concluida"
  const roi = campaignRoi(campaign)
  const postsInPeriod = posts.filter((post) => dateInPeriod(post.publishedAt, period))
  const participantsInPeriod = campaign.participants.filter((participant) =>
    dateInPeriod(memberTracksContent(participant.creatorId, roles) ? participant.lastPost : undefined, period),
  )
  const approvedPosts = postsInPeriod.filter((p) => p.aiStatus === "aprovado").length
  const alertPosts = postsInPeriod.filter((p) => p.aiStatus === "alerta").length
  const rejectedPosts = postsInPeriod.filter((p) => p.aiStatus === "reprovado").length
  const visiblePosts = aiFilter ? postsInPeriod.filter((post) => post.aiStatus === aiFilter) : postsInPeriod

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title={campaign.name}
        subtitle={`${campaign.organizationName} · ${formatDateRangeBR(campaign.startDate, campaign.endDate)}`}
        leading={
          <Link href="/campaigns">
            <Button variant="outline" size="sm" className="gap-1.5"><ArrowLeft size={14} /> Voltar</Button>
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            {campaign.status === "rascunho" ? (
              <Button
                size="sm"
                onClick={() => {
                  setStatus(campaign.id, "aberta")
                  toast.add({
                    type: "success",
                    title: "Campanha aberta",
                    description: "Os creators já podem encontrá-la, conforme o acesso escolhido.",
                  })
                }}
              >
                Abrir campanha
              </Button>
            ) : null}
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", STATUS_COLORS[campaign.status])}>
              {t(campaignStatusKey(campaign.status))}
            </span>
          </div>
        }
      />

      {/* Completed campaign banner */}
      {isCompleted && (
        <div className="mx-6 mt-4 rounded-xl border border-zinc-200 bg-zinc-900 text-white px-5 py-4 flex items-center gap-4">
          <Trophy size={20} className="text-yellow-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Campanha concluída com sucesso</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              ROI final: <span className="text-white font-medium" title={ROI_TOOLTIP}>{roi !== undefined ? `${roi > 0 ? "+" : ""}${roi}%` : "—"}</span> ·
              Alcance: <span className="text-white font-medium">{fmt(contentReach || campaign.totalReach || 0)}</span> ·
              Receita: <span className="text-white font-medium">R$ {fmt(campaign.totalRevenue ?? 0)}</span>
            </p>
          </div>
          <ActionsMenu
            items={[
              { label: "Gerar relatório", icon: FileBarChart2 },
              { label: "Enviar pagamentos", icon: Send },
            ]}
          />
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Creators", value: String(campaign.participants.length), icon: Users, tab: "participants" },
            { label: "Orçamento", value: `R$ ${fmt(campaign.budget)}`, icon: DollarSign, tab: "overview" },
            { label: "Alcance total", value: contentReach ? fmt(contentReach) : "—", icon: Eye, tab: "metrics" },
            { label: "Engajamento", value: contentEngagement ? fmt(contentEngagement) : "—", icon: Heart, tab: "metrics" },
            { label: "ROI", value: roi !== undefined ? `${roi > 0 ? "+" : ""}${roi}%` : "—", icon: TrendingUp, tab: "metrics", title: ROI_TOOLTIP },
          ].map(({ label, value, icon: Icon, tab: target, title }) => (
            <Button
              key={label}
              variant="outline"
              title={title}
              onClick={() => setTab(target)}
              className="h-auto w-full flex-col items-stretch gap-1 rounded-xl bg-card px-3 py-3 text-left font-normal whitespace-normal shadow-none hover:bg-zinc-50"
            >
              <span className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{label}</span>
                <Icon size={14} className="text-zinc-300" />
              </span>
              <span className="text-xl font-semibold text-zinc-900">{value}</span>
            </Button>
          ))}
        </div>

        <Tabs value={tab} onValueChange={(value) => setTab(value || "overview")}>
          <div className="flex flex-wrap items-center gap-2">
          <TabsList>
            <TabsTrigger value="overview">Informações</TabsTrigger>
            <TabsTrigger value="participants">Creators ({participantsInPeriod.length})</TabsTrigger>
            <TabsTrigger value="content">Conteúdos ({postsInPeriod.length})</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="metrics">Performance</TabsTrigger>
            {campaign.type === "seeding" && (
              <TabsTrigger value="seeding-results">Resultados</TabsTrigger>
            )}
          </TabsList>
          <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-zinc-800">Quem pode ver</h3>
              <p className="mt-1 mb-3 text-xs text-zinc-500">
                Pública entra em oportunidades. Privada fica só para a sua comunidade. Exclusiva só aparece no convite.
              </p>
              <CampaignVisibilityPicker
                value={campaign.visibility}
                onChange={(visibility) => setVisibility(campaign.id, visibility)}
              />
            </Card>
            <Card className="p-4">
              <CampaignSuccessTargets
                networks={campaign.targetNetworks.filter(isSocialNetwork)}
                type={campaign.type}
                value={campaign.successTargets}
                onChange={(successTargets) => setSuccessTargets(campaign.id, successTargets)}
              />
            </Card>
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-zinc-800 mb-3">Detalhes da campanha</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-28 text-zinc-400 shrink-0">Tipo</span>
                    <CampaignTypeBadge type={campaign.type} />
                  </div>
                  {[
                    { label: "Objetivo", value: campaign.objective },
                    { label: "Período", value: formatDateRangeBR(campaign.startDate, campaign.endDate) },
                    { label: "Orçamento total", value: `R$ ${campaign.budget.toLocaleString("pt-BR")}` },
                    { label: "Investido", value: `R$ ${campaign.budgetSpent.toLocaleString("pt-BR")}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-3">
                      <span className="w-28 text-zinc-400 shrink-0">{label}</span>
                      <span className="text-zinc-800 capitalize">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Orçamento utilizado</span>
                    <span>{campaign.budget > 0 ? Math.round((campaign.budgetSpent / campaign.budget) * 100) : 0}%</span>
                  </div>
                  <Progress value={campaign.budget > 0 ? (campaign.budgetSpent / campaign.budget) * 100 : 0} className="h-2" />
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold text-zinc-800 mb-3">Requisitos de conteúdo</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1.5">Hashtags obrigatórias</p>
                    <div className="flex flex-wrap gap-1">
                      {campaign.mandatoryHashtags.map((h) => <Badge key={h} variant="outline" className="text-xs">{h}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1.5">Menções obrigatórias</p>
                    <div className="flex flex-wrap gap-1">
                      {campaign.mandatoryMentions.map((m) => (
                        <Badge key={`${m.network}:${m.handle}`} variant="outline" className="gap-1 text-xs">
                          <NetworkIcon network={m.network} />
                          <span className="text-zinc-400">{SOCIAL_NETWORK_LABEL[m.network]}</span>
                          {m.handle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1.5">Nichos-alvo</p>
                    <div className="flex flex-wrap gap-1">
                      {campaign.targetNiches.map((n) => <Badge key={n} variant="outline" className="text-xs capitalize">{n}</Badge>)}
                    </div>
                  </div>
                  {campaign.targetNetworks.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-400 mb-1.5">Redes</p>
                      <div className="flex flex-wrap gap-1">
                        {campaign.targetNetworks.map((network) => (
                          <Badge key={network} variant="outline" className="text-xs capitalize">{network}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(campaign.contentFormats ?? []).length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-400 mb-1.5">Formatos</p>
                      <div className="flex flex-wrap gap-1">
                        {(campaign.contentFormats ?? []).map((format) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {contentFormatByValue(format)?.label ?? format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
            {cleanGuidelines(campaign.doList).length > 0 || cleanGuidelines(campaign.dontList).length > 0 ? (
              <Card className="p-4">
                <GuidelineLists doList={cleanGuidelines(campaign.doList)} dontList={cleanGuidelines(campaign.dontList)} />
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="participants" className="mt-4">
            <ParticipantsTable campaign={campaign} period={period} />
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <p className="mb-3 text-sm text-zinc-500">Só creators. Publicações de afiliados não entram neste rastreio.</p>
            {posts.length > 0 ? (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {([
                    { status: "aprovado" as const, icon: CheckCircle, label: "Aprovados", count: approvedPosts, cls: "text-emerald-600" },
                    { status: "alerta" as const, icon: AlertTriangle, label: "Alerta", count: alertPosts, cls: "text-amber-600" },
                    { status: "reprovado" as const, icon: XCircle, label: "Reprovados", count: rejectedPosts, cls: "text-red-600" },
                  ]).map(({ status, icon: Icon, label, count, cls }) => (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant={aiFilter === status ? "secondary" : "ghost"}
                      aria-pressed={aiFilter === status}
                      onClick={() => setAiFilter((current) => (current === status ? null : status))}
                    >
                      <Icon className={cls} />
                      <span className="font-semibold text-zinc-900">{count}</span>
                      <span className="text-zinc-500">{label}</span>
                    </Button>
                  ))}
                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center overflow-hidden rounded-lg border border-zinc-200">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant={contentView === "grid" ? "default" : "ghost"}
                        className="rounded-none"
                        aria-label="Ver em grade"
                        aria-pressed={contentView === "grid"}
                        onClick={() => setContentView("grid")}
                      >
                        <LayoutGrid />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant={contentView === "list" ? "default" : "ghost"}
                        className="rounded-none"
                        aria-label="Ver em lista"
                        aria-pressed={contentView === "list"}
                        onClick={() => setContentView("list")}
                      >
                        <List />
                      </Button>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download /> Exportar
                    </Button>
                  </div>
                </div>
                {visiblePosts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-sm text-zinc-400">
                      {postsInPeriod.length === 0 ? "Nenhum conteúdo neste período." : "Nenhum conteúdo com esse status."}
                    </p>
                    {postsInPeriod.length > 0 && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setAiFilter(null)}>
                        Ver todos
                      </Button>
                    )}
                  </Card>
                ) : contentView === "grid" ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {visiblePosts.map((post) => (
                      <PostCard key={post.id} post={post} onSelect={() => setSelectedPost(post)} />
                    ))}
                  </div>
                ) : (
                <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50">
                        {["Creator", "Rede · Formato", "Data", "Alcance", "Curtidas", "Coment.", "Eng.%", "IA", "Avaliação"].map((h) => (
                          <th key={h} className="py-2.5 px-3 text-xs font-medium text-zinc-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePosts.map((post) => {
                        const cfg = AI_CONFIG[post.aiStatus]
                        const Icon = cfg.icon
                        return (
                          <tr
                            key={post.id}
                            className="cursor-pointer border-t border-zinc-100 hover:bg-zinc-50"
                            onClick={() => setSelectedPost(post)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                setSelectedPost(post)
                              }
                            }}
                            tabIndex={0}
                          >
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700 shrink-0">
                                  {post.avatar}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-zinc-900 whitespace-nowrap">{post.creatorName}</p>
                                  <p className="text-[10px] text-zinc-400">{post.creatorHandle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1 text-xs text-zinc-600">
                                <NetworkIcon network={post.network} />
                                {post.type.replace(/_/g, " ")}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-xs text-zinc-600 whitespace-nowrap">{formatDateBR(post.publishedAt)}</td>
                            <td className="py-2.5 px-3 text-xs font-medium text-zinc-800">{fmt(post.reach)}</td>
                            <td className="py-2.5 px-3 text-xs text-zinc-700">{fmt(post.likes)}</td>
                            <td className="py-2.5 px-3 text-xs text-zinc-700">{fmt(post.comments)}</td>
                            <td className="py-2.5 px-3 text-xs font-medium text-zinc-800">{post.engagement.toFixed(1)}%</td>
                            <td className="py-2.5 px-3">
                              <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", cfg.classes)}>
                                <Icon size={10} />{cfg.label} · {post.aiScore}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {post.humanRating ? (
                                <span className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star key={i} size={11} className={i < post.humanRating! ? "fill-zinc-800 text-zinc-800" : "text-zinc-200"} />
                                  ))}
                                </span>
                              ) : <span className="text-zinc-300 text-xs">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                )}
              </>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-sm text-zinc-400">Nenhum conteúdo capturado ainda.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <ContentCalendar slots={schedule} audience="brand" campaignId={campaign.id} />
          </TabsContent>

          <TabsContent value="metrics" className="mt-4 space-y-4">
            {posts.length > 0 && (
              <CampaignAnalytics posts={posts} participants={campaign.participants} />
            )}
            {metrics ? (
              <>
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1">Alcance e engajamento diários</h3>
                  <p className="text-xs text-zinc-400 mb-4">Evolução ao longo da campanha</p>
                  <AreaChart
                    data={metrics.series}
                    index="date"
                    categories={["reach", "engagement"]}
                    colors={["zinc", "stone"]}
                    valueFormatter={(v) => fmt(v)}
                    showGridLines={false}
                    showLegend
                    className="h-52"
                  />
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1">Receita e cliques</h3>
                  <AreaChart
                    data={metrics.series}
                    index="date"
                    categories={["revenue", "clicks"]}
                    colors={["zinc", "neutral"]}
                    valueFormatter={(v) => fmt(v)}
                    showGridLines={false}
                    showLegend
                    className="h-52"
                  />
                </Card>
              </>
            ) : posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-zinc-400">Dados de métricas ainda não disponíveis para esta campanha.</p>
              </Card>
            ) : null}
          </TabsContent>

          {campaign.type === "seeding" && (
            <TabsContent value="seeding-results" className="mt-4">
              <SeedingResults campaign={seedingCampaignFor(campaign, seedingCampaigns)} />
            </TabsContent>
          )}
        </Tabs>
      </div>
      <PostDetailSheet
        post={selectedPost}
        onOpenChange={(open) => {
          if (!open) setSelectedPost(null)
        }}
      />
    </div>
  )
}
