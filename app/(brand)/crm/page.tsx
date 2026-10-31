"use client"
import { useMemo, useState } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { RELATIONSHIP_HISTORY, type RelationshipEvent, type RelationshipEventType } from "@/lib/mock-data/crm"
import { SOCIAL_NETWORK_LABEL, type SocialNetwork } from "@/lib/mock-data/campaigns"
import { useListStore } from "@/lib/stores/lists"
import { SAVED_CREATOR_IDS } from "@/lib/mock-data/saved-creators"
import { CREATORS, type Creator } from "@/lib/mock-data/creators"
import { brandCreatorIds } from "@/lib/discovery/scope"
import { PeriodFilter } from "@/components/ui/period-filter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { NewListSheet } from "@/components/crm/new-list-sheet"
import { toast } from "@/components/ui/toast"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { ApproveCreatorDialog } from "@/components/crm/approve-creator-dialog"
import { MembershipBadge, NotTracked } from "@/components/members/membership-badge"
import { CONTENT_TRACKED_EVENTS, MEMBERSHIP_ROLE_LABEL } from "@/lib/membership"
import { useMembershipStore } from "@/lib/stores/membership"
import { CreatorContact } from "@/components/creators/creator-contact"
import {
  Plus, ListPlus, Send, UserPlus, FileText, Wallet, MessageSquare, StickyNote,
  Check, X, CheckSquare, Square, Download, Image, Clapperboard, Video, Smartphone,
  CircleDot, Radio, AtSign, MousePointerClick, Ticket,
} from "lucide-react"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { formatDateBR } from "@/lib/dates"
import { ALL_PERIOD, dateInPeriod, type PeriodValue } from "@/lib/period"
import { creatorFeeCost, creatorRoi, creatorSeedingCost, ROI_TOOLTIP } from "@/lib/roi"
import { useSeedingStore } from "@/lib/stores/seeding"

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

const EVENT_META: Record<
  RelationshipEventType,
  { label: string; icon: typeof Send; tone: string }
> = {
  convite: { label: "Convite", icon: Send, tone: "bg-zinc-100 text-zinc-700" },
  candidatura: { label: "Candidatura", icon: UserPlus, tone: "bg-sky-50 text-sky-700" },
  proposta: { label: "Proposta", icon: FileText, tone: "bg-amber-50 text-amber-800" },
  pagamento: { label: "Pagamento", icon: Wallet, tone: "bg-emerald-50 text-emerald-700" },
  mensagem: { label: "Mensagem", icon: MessageSquare, tone: "bg-violet-50 text-violet-700" },
  nota: { label: "Nota", icon: StickyNote, tone: "bg-zinc-100 text-zinc-600" },
  post: { label: "Post", icon: Image, tone: "bg-zinc-100 text-zinc-700" },
  reel: { label: "Reel", icon: Clapperboard, tone: "bg-pink-50 text-pink-700" },
  video: { label: "Vídeo", icon: Video, tone: "bg-red-50 text-red-700" },
  short: { label: "Short", icon: Smartphone, tone: "bg-rose-50 text-rose-700" },
  story: { label: "Story", icon: CircleDot, tone: "bg-fuchsia-50 text-fuchsia-700" },
  live: { label: "Live", icon: Radio, tone: "bg-orange-50 text-orange-700" },
  mencao: { label: "Menção", icon: AtSign, tone: "bg-indigo-50 text-indigo-700" },
  clique: { label: "Clique", icon: MousePointerClick, tone: "bg-blue-50 text-blue-700" },
  cupom: { label: "Cupom", icon: Ticket, tone: "bg-teal-50 text-teal-700" },
}

const EVENT_TYPE_ORDER: RelationshipEventType[] = [
  "convite", "candidatura", "proposta", "pagamento", "mensagem", "nota",
  "post", "reel", "video", "short", "story", "live", "mencao", "clique", "cupom",
]

const NETWORK_ORDER: SocialNetwork[] = ["instagram", "tiktok", "youtube"]

function NetworkGlyph({ network, size = 11 }: { network: SocialNetwork; size?: number }) {
  if (network === "instagram") return <SiInstagram size={size} />
  if (network === "tiktok") return <SiTiktok size={size} />
  return <SiYoutube size={size} />
}

function eventDetails(event: RelationshipEvent) {
  const parts: string[] = []
  if (event.reach) parts.push(`${fmt(event.reach)} alcance`)
  if (event.engagement != null) {
    parts.push(`${event.engagement.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% engajamento`)
  }
  if (event.clicks) parts.push(`${event.clicks.toLocaleString("pt-BR")} cliques`)
  if (event.orders) parts.push(`${event.orders.toLocaleString("pt-BR")} pedidos`)
  if (event.couponCode) parts.push(event.couponCode)
  if (event.type === "cupom" && event.amount) {
    parts.push(`R$ ${event.amount.toLocaleString("pt-BR")} em vendas`)
  }
  return parts
}

function groupHistory(events: RelationshipEvent[]) {
  const chronological = [...events].sort((a, b) => a.date.localeCompare(b.date))
  const groups = new Map<string, { id: string; title: string; events: RelationshipEvent[] }>()
  for (const event of chronological) {
    const id = event.campaignId ?? "outras"
    const group = groups.get(id) ?? {
      id,
      title: event.campaignName ?? "Outras interações",
      events: [],
    }
    group.events.push(event)
    groups.set(id, group)
  }
  return [...groups.values()].sort((a, b) => {
    const aDate = a.events[a.events.length - 1]?.date ?? ""
    const bDate = b.events[b.events.length - 1]?.date ?? ""
    return bDate.localeCompare(aDate)
  })
}

function RelationshipDrawer({ creator, history }: { creator: Creator; history: RelationshipEvent[] }) {
  const role = useMembershipStore((state) => state.roles[creator.id]) ?? creator.membershipRole
  const [typeFilter, setTypeFilter] = useState("all")
  const [networkFilter, setNetworkFilter] = useState("all")
  const [campaignFilter, setCampaignFilter] = useState("all")

  const typeOptions = EVENT_TYPE_ORDER.filter((type) => history.some((event) => event.type === type))
  const networkOptions = NETWORK_ORDER.filter((network) => history.some((event) => event.network === network))
  const campaignOptions = [...new Map(
    history.map((event) => [event.campaignId ?? "outras", event.campaignName ?? "Outras interações"] as const)
  ).entries()]

  const filtered = history.filter((event) => {
    if (typeFilter !== "all" && event.type !== typeFilter) return false
    if (networkFilter !== "all" && event.network !== networkFilter) return false
    if (campaignFilter !== "all" && (event.campaignId ?? "outras") !== campaignFilter) return false
    return true
  })
  const groups = groupHistory(filtered)
  const paid = filtered.reduce((sum, event) => sum + (event.type === "pagamento" ? event.amount ?? 0 : 0), 0)
  const filtersActive = typeFilter !== "all" || networkFilter !== "all" || campaignFilter !== "all"

  const approval = APPROVAL_META[creator.approvalStatus]

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-6 py-5 pr-14">
        <SheetHeader className="p-0">
          <div className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
            <Avatar className="size-12">
              {creator.photo && <AvatarImage src={creator.photo} alt={creator.name} />}
              <AvatarFallback className="text-base font-semibold">{creator.avatar}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="leading-5">{creator.name}</SheetTitle>
              <p className="text-sm leading-5 text-zinc-400">{creator.handle}</p>
            </div>
            <div className="col-start-2 flex min-w-0 flex-wrap items-center gap-x-1">
              <Badge className={approval.className}>{approval.label}</Badge>
              <MembershipBadge role={role} />
              <CreatorContact email={creator.email} phone={creator.phone} showPhone />
            </div>
          </div>
        </SheetHeader>
      </div>

      <div className="grid grid-cols-4 gap-2 px-6 py-4">
        {[
          { label: "Seguidores", value: fmt(creator.totalFollowers) },
          { label: "Engajamento", value: `${creator.avgEngagement.toFixed(1)}%` },
          { label: "Campanhas", value: creator.pastCampaigns },
          { label: "Score", value: `${creator.score}/100` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-zinc-50 px-2 py-3 text-center">
            <p className="text-sm font-semibold text-zinc-900">{value}</p>
            <p className="text-xs text-zinc-400">{label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="history" className="border-t border-zinc-100 px-6 py-5">
        <TabsList className="mb-4 h-auto! w-full flex-nowrap justify-start overflow-x-auto bg-zinc-100">
          <TabsTrigger value="networks" className="h-7 flex-none px-3">Informações das redes sociais</TabsTrigger>
          <TabsTrigger value="history" className="h-7 flex-none px-3">Histórico do usuário</TabsTrigger>
        </TabsList>

        <TabsContent value="networks" className="space-y-3 pb-2 [[hidden]]:hidden">
          {creator.networks.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">Nenhuma rede social conectada.</p>
          ) : (
            creator.networks.map((network) => (
              <div key={network.network} className="rounded-xl border border-zinc-200 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <NetworkGlyph network={network.network} size={14} />
                  <span className="text-sm font-semibold text-zinc-800">{SOCIAL_NETWORK_LABEL[network.network]}</span>
                  <span className="text-xs text-zinc-400">{network.handle}</span>
                  {network.verified && <VerifiedBadge className="size-4" />}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Seguidores", value: fmt(network.followers) },
                    { label: "Média de views", value: fmt(network.avgViews) },
                    { label: "Engajamento", value: `${network.engagementRate}%` },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-zinc-50 px-2 py-2 text-center">
                      <p className="text-sm font-semibold text-zinc-900">{value}</p>
                      <p className="text-xs text-zinc-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="pb-2 [[hidden]]:hidden">
        <div className="mb-4 flex items-center justify-end">
          {history.length > 0 && (
            <p className="text-xs text-zinc-400">
              {filtered.length === history.length
                ? `${history.length} ${history.length === 1 ? "evento" : "eventos"}`
                : `${filtered.length} de ${history.length} eventos`}
              {paid > 0 && ` · R$ ${paid.toLocaleString("pt-BR")} pagos`}
            </p>
          )}
        </div>

        {history.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value ?? "all")}>
              <SelectTrigger size="sm" className="min-w-36">
                <SelectValue placeholder="Tipo">
                  {(value) => (value && value !== "all" ? EVENT_META[value as RelationshipEventType]?.label : "Todos os tipos")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {typeOptions.map((type) => (
                  <SelectItem key={type} value={type}>{EVENT_META[type].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={networkFilter} onValueChange={(value) => setNetworkFilter(value ?? "all")}>
              <SelectTrigger size="sm" className="min-w-36">
                <SelectValue placeholder="Rede">
                  {(value) => (value && value !== "all" ? SOCIAL_NETWORK_LABEL[value as SocialNetwork] : "Todas as redes")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as redes</SelectItem>
                {networkOptions.map((network) => (
                  <SelectItem key={network} value={network}>
                    <NetworkGlyph network={network} />
                    {SOCIAL_NETWORK_LABEL[network]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={(value) => setCampaignFilter(value ?? "all")}>
              <SelectTrigger size="sm" className="max-w-56">
                <SelectValue placeholder="Campanha">
                  {(value) => {
                    if (!value || value === "all") return "Todas as campanhas"
                    return campaignOptions.find(([id]) => id === value)?.[1] ?? "Campanha"
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as campanhas</SelectItem>
                {campaignOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filtersActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTypeFilter("all")
                  setNetworkFilter("all")
                  setCampaignFilter("all")
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        )}

        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">Nenhuma interação registrada.</p>
        ) : groups.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">Nenhum evento com esses filtros.</p>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => {
              const first = group.events[0]
              const latest = group.events[group.events.length - 1]
              return (
                <section key={group.id}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-medium text-zinc-900">{group.title}</h3>
                    {first && latest && first.date !== latest.date && (
                      <span className="shrink-0 text-xs text-zinc-400">
                        {formatDateBR(first.date)} — {formatDateBR(latest.date)}
                      </span>
                    )}
                  </div>
                  <ol className="ml-3 space-y-3 border-l border-zinc-200 pl-5">
                    {group.events.map((event) => {
                      const meta = EVENT_META[event.type]
                      const Icon = meta.icon
                      return (
                        <li key={event.id} className="relative">
                          <span
                            className={cn(
                              "absolute -left-8 top-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white",
                              meta.tone
                            )}
                          >
                            <Icon size={12} />
                          </span>
                          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", meta.tone)}>
                                  {meta.label}
                                </span>
                                {event.network && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                                    <NetworkGlyph network={event.network} />
                                    {SOCIAL_NETWORK_LABEL[event.network]}
                                  </span>
                                )}
                              </div>
                              <time dateTime={event.date} className="shrink-0 text-xs text-zinc-400">{formatDateBR(event.date)}</time>
                            </div>
                            <p className="mt-1.5 text-sm leading-5 text-zinc-700">{event.description}</p>
                            {event.type === "pagamento" && event.amount !== undefined && (
                              <p className="mt-2 text-sm font-semibold text-zinc-900">
                                R$ {event.amount.toLocaleString("pt-BR")}
                              </p>
                            )}
                            {eventDetails(event).length > 0 && (
                              <p className="mt-1.5 text-xs text-zinc-500">{eventDetails(event).join(" · ")}</p>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </section>
              )
            })}
          </div>
        )}
        </TabsContent>
      </Tabs>
    </>
  )
}

const TIER_LABELS: Record<string, string> = { nano: "Nano", micro: "Micro", mid: "Mid", macro: "Macro", mega: "Mega" }

const ALL_LISTS = "all"

const APPROVAL_META = {
  approved: { label: "Aprovado", className: "bg-emerald-50 text-emerald-700" },
  pending: { label: "Aguardando", className: "bg-yellow-50 text-yellow-700" },
  rejected: { label: "Recusado", className: "bg-red-50 text-red-700" },
} as const

function approvalOf(creator: Creator, approvedIds: Set<string>) {
  return APPROVAL_META[approvedIds.has(creator.id) ? "approved" : creator.approvalStatus]
}

function isApprovedCreator(creator: Creator, approvedIds: Set<string>) {
  return approvedIds.has(creator.id) || creator.approvalStatus === "approved"
}

function RoiCell({ roi }: { roi?: number }) {
  if (roi === undefined) return <span className="text-zinc-300 text-xs" title={ROI_TOOLTIP}>—</span>
  const color = roi > 50 ? "text-emerald-700" : roi > 0 ? "text-zinc-700" : "text-red-600"
  return <span className={cn("text-sm font-semibold", color)} title={ROI_TOOLTIP}>{roi > 0 ? "+" : ""}{roi}%</span>
}

function listCandidates(campaignCreatorIds: Set<string>) {
  const saved = new Set(SAVED_CREATOR_IDS)
  return CREATORS.filter((creator) => saved.has(creator.id) || campaignCreatorIds.has(creator.id))
    .map((creator) => ({
      creator,
      favorite: saved.has(creator.id),
      community: campaignCreatorIds.has(creator.id),
    }))
    .filter((item) => item.favorite || item.community)
    .sort((a, b) => a.creator.name.localeCompare(b.creator.name, "pt-BR"))
}

export default function CRMPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const seedingCampaigns = useSeedingStore((s) => s.campaigns)
  const allLists = useListStore((s) => s.lists)
  const addList = useListStore((s) => s.createList)
  const lists = allLists.filter((l) => l.organizationId === user?.organizationId)
  const [period, setPeriod] = useState<PeriodValue>(ALL_PERIOD)
  const [tab, setTab] = useState("active")
  const [listId, setListId] = useState(ALL_LISTS)
  const [creating, setCreating] = useState(false)
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const roles = useMembershipStore((state) => state.roles)
  const assignRole = useMembershipStore((state) => state.assign)
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())
  const [approveIds, setApproveIds] = useState<string[] | null>(null)
  const activeTab = tab === "active" || tab === "approval" || tab === "excluded" || tab === "performance" ? tab : "active"
  const activeListId = listId === ALL_LISTS || lists.some((list) => list.id === listId) ? listId : ALL_LISTS

  const communityIds = useMemo(() => {
    const ids = new Set<string>()
    for (const campaign of campaigns) {
      if (campaign.organizationId !== user?.organizationId) continue
      for (const participant of campaign.participants) ids.add(participant.creatorId)
    }
    return ids
  }, [campaigns, user?.organizationId])

  const allCreatorIds = useMemo(() => {
    const ids = new Set<string>()
    if (user?.organizationId) {
      for (const id of brandCreatorIds(user.organizationId)) ids.add(id)
    }
    for (const list of lists) {
      for (const id of list.creatorIds) ids.add(id)
    }
    return ids
  }, [lists, user?.organizationId])

  const activeList = lists.find((list) => list.id === activeListId) ?? null
  const rosterCreators = activeListId === ALL_LISTS
    ? CREATORS.filter((creator) => allCreatorIds.has(creator.id))
    : CREATORS.filter((creator) => activeList?.creatorIds.includes(creator.id))
  const visibleCreators = rosterCreators.filter((creator) => isApprovedCreator(creator, approvedIds))
  function interactionDate(creator: Creator) {
    const memberRole = roles[creator.id] ?? creator.membershipRole
    const events = RELATIONSHIP_HISTORY.filter((event) => {
      if (event.creatorId !== creator.id || event.organizationId !== user?.organizationId) return false
      if (memberRole === "affiliate" && CONTENT_TRACKED_EVENTS.has(event.type)) return false
      return true
    })
    return events.reduce<RelationshipEvent | undefined>((latest, event) => {
      if (!latest || event.date > latest.date) return event
      return latest
    }, undefined)?.date
  }
  const shownCreators = visibleCreators.filter((creator) => dateInPeriod(interactionDate(creator), period))
  const performanceCreators = CREATORS.filter((creator) => lists.some((list) => list.creatorIds.includes(creator.id)))
    .filter((creator) => {
      const role = roles[creator.id] ?? creator.membershipRole
      return dateInPeriod(role === "affiliate" ? undefined : creator.lastPost, period)
    })
  const approvedCount = (ids: Iterable<string>) => {
    let count = 0
    for (const id of ids) {
      const creator = CREATORS.find((item) => item.id === id)
      if (creator && isApprovedCreator(creator, approvedIds)) count += 1
    }
    return count
  }
  const listDescription = activeListId === ALL_LISTS
    ? "Todos os influenciadores da marca"
    : activeList?.description
  const listSelected = shownCreators.map((creator) => creator.id).filter((id) => selected.has(id))

  function createList(input: { name: string; description: string; creatorIds: string[] }) {
    if (!user?.organizationId) return
    const list = addList({
      organizationId: user.organizationId,
      name: input.name,
      description: input.description,
      creatorIds: input.creatorIds,
    })
    setTab("active")
    setListId(list.id)
    setCreating(false)
    toast.add({
      type: "success",
      title: "Lista criada",
      description: input.name,
    })
  }

  const selectedCreator = selectedCreatorId ? CREATORS.find((c) => c.id === selectedCreatorId) : null
  const selectedRole = selectedCreatorId ? roles[selectedCreatorId] ?? selectedCreator?.membershipRole : undefined
  const history = selectedCreatorId
    ? RELATIONSHIP_HISTORY.filter((e) => {
        if (e.creatorId !== selectedCreatorId || e.organizationId !== user?.organizationId) return false
        if (selectedRole === "affiliate" && CONTENT_TRACKED_EVENTS.has(e.type)) return false
        return true
      })
    : []

  // Approval queue: all creators with pending status in this org's lists
  const pendingCreators = CREATORS.filter(
    (c) => allCreatorIds.has(c.id) && c.approvalStatus === "pending" && !approvedIds.has(c.id)
  )
  const rejectedCreators = CREATORS.filter(
    (c) => allCreatorIds.has(c.id) && c.approvalStatus === "rejected" && !approvedIds.has(c.id)
  )

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll(ids: string[]) {
    if (ids.every((id) => selected.has(id))) {
      setSelected((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next })
    } else {
      setSelected((prev) => { const next = new Set(prev); ids.forEach((id) => next.add(id)); return next })
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title={t("pages.creatorLists")}
        subtitle={t("pages.listsCount", {
          lists: lists.length,
          creators: lists.reduce((s, l) => s + l.creatorIds.length, 0),
        })}
        actions={
          <Button size="sm" className="gap-2" onClick={() => setCreating(true)}>
            <Plus size={14} /> {t("pages.newList")}
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setTab}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
          <TabsList>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="approval">
              Fila de aprovação
              {pendingCreators.length > 0 && (
                <span className="ml-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-full px-1.5 py-0.5">
                  {pendingCreators.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="excluded">
              Excluídos
              {rejectedCreators.length > 0 && (
                <span className="ml-1.5 text-xs bg-red-50 text-red-700 rounded-full px-1.5 py-0.5">
                  {rejectedCreators.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <TabsContent value="active">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-3">
                    <Select value={activeListId} onValueChange={(value) => setListId(value ?? ALL_LISTS)}>
                      <SelectTrigger className="min-w-64">
                        <SelectValue>
                          {(value) => {
                            if (!value || value === ALL_LISTS) return "Todos os influenciadores"
                            return lists.find((list) => list.id === value)?.name ?? "Todos os influenciadores"
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent align="start">
                        <SelectItem value={ALL_LISTS}>
                          Todos os influenciadores
                          <span className="text-xs text-zinc-400">{approvedCount(allCreatorIds)}</span>
                        </SelectItem>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name}
                            <span className="text-xs text-zinc-400">{approvedCount(list.creatorIds)}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {listDescription && (
                      <p className="text-sm text-zinc-500">{listDescription}</p>
                    )}
                  </div>
                  {listSelected.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{listSelected.length} selecionado{listSelected.length !== 1 ? "s" : ""}</span>
                      <ActionsMenu
                        items={[
                          { label: "Convidar para campanha", icon: ListPlus },
                          { label: "Aprovar todos", icon: Check, onSelect: () => setApproveIds(listSelected) },
                          { label: "Exportar selecionados", icon: Download },
                          ...(activeListId === ALL_LISTS
                            ? []
                            : [{ label: "Remover da lista", icon: X, destructive: true as const }]),
                        ]}
                      />
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-zinc-200 overflow-x-auto bg-white">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50">
                        <th className="py-2.5 px-3">
                          <button onClick={() => toggleAll(shownCreators.map((c) => c.id))}>
                            {shownCreators.length > 0 && shownCreators.every((c) => selected.has(c.id)) ? (
                              <CheckSquare size={14} className="text-zinc-700" />
                            ) : (
                              <Square size={14} className="text-zinc-400" />
                            )}
                          </button>
                        </th>
                        {["Creator", "Status", "Nicho", "Seguidores", "Eng.%", "Tier", "Campanhas", "Tipo", "Últ. interação", "Contato"].map((h) => (
                          <th key={h} className="py-2.5 px-3 text-xs font-medium text-zinc-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shownCreators.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-10 text-center text-sm text-zinc-400">
                            {period.preset === "all"
                              ? "Nenhum influenciador ativo nesta lista."
                              : "Nenhum influenciador neste período."}
                          </td>
                        </tr>
                      ) : shownCreators.map((c) => {
                        const memberRole = roles[c.id] ?? c.membershipRole
                        const events = RELATIONSHIP_HISTORY.filter((e) => {
                          if (e.creatorId !== c.id || e.organizationId !== user?.organizationId) return false
                          if (memberRole === "affiliate" && CONTENT_TRACKED_EVENTS.has(e.type)) return false
                          return true
                        })
                        const lastEvent = events.reduce<RelationshipEvent | undefined>((latest, event) => {
                          if (!latest || event.date > latest.date) return event
                          return latest
                        }, undefined)
                        const approval = approvalOf(c, approvedIds)
                        return (
                          <tr
                            key={c.id}
                            className={cn("border-t border-zinc-100 hover:bg-zinc-50 cursor-pointer", selected.has(c.id) && "bg-zinc-50")}
                            onClick={() => setSelectedCreatorId(c.id)}
                          >
                            <td className="py-2.5 px-3" onClick={(e) => { e.stopPropagation(); toggleSelect(c.id) }}>
                              {selected.has(c.id) ? (
                                <CheckSquare size={14} className="text-zinc-700" />
                              ) : (
                                <Square size={14} className="text-zinc-300" />
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                {c.photo ? (
                                  <img src={c.photo} alt={c.name} className="h-8 w-8 rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700 shrink-0">{c.avatar}</div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-zinc-900 whitespace-nowrap">{c.name}</p>
                                  <p className="text-xs text-zinc-400">{c.handle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge className={approval.className}>
                                {approval.label}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap gap-1">
                                {c.niche.slice(0, 2).map((n) => <Badge key={n} variant="outline" className="text-xs capitalize">{n}</Badge>)}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-sm text-zinc-700 font-medium">{fmt(c.totalFollowers)}</td>
                            <td className="py-2.5 px-3 text-sm text-zinc-700">{c.avgEngagement.toFixed(1)}%</td>
                            <td className="py-2.5 px-3">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                                {TIER_LABELS[c.tier]}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-sm text-zinc-700">{c.pastCampaigns}</td>
                            <td className="py-2.5 px-3">
                              <MembershipBadge role={memberRole} />
                            </td>
                            <td className="py-2.5 px-3 text-xs text-zinc-500">
                              {lastEvent ? formatDateBR(lastEvent.date) : "—"}
                            </td>
                            <td className="py-2.5 px-3">
                              <CreatorContact email={c.email} phone={c.phone} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
          </TabsContent>

          {/* Approval Queue */}
          <TabsContent value="approval" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-800">Aguardando aprovação ({pendingCreators.length})</h3>
                {pendingCreators.length > 0 && (
                  <ActionsMenu
                    items={[
                      { label: "Aprovar todos", icon: Check, onSelect: () => setApproveIds(pendingCreators.map((creator) => creator.id)) },
                      { label: "Recusar todos", icon: X, destructive: true },
                    ]}
                  />
                )}
              </div>
              <div className="rounded-xl border border-zinc-200 overflow-x-auto bg-white">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50">
                      {["Creator", "Contato", "Nicho", "Seguidores", "Engaj.%", "Score", "Origem", "Ações"].map((h) => (
                        <th key={h} className="py-2.5 px-4 text-xs font-medium text-zinc-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCreators.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-sm text-zinc-400">
                          Nenhum creator aguardando aprovação.
                        </td>
                      </tr>
                    ) : (
                      pendingCreators.map((c) => (
                        <tr key={c.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              {c.photo ? (
                                <img src={c.photo} alt={c.name} className="h-8 w-8 rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700 shrink-0">{c.avatar}</div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-zinc-900">{c.name}</p>
                                <p className="text-xs text-zinc-400">{c.handle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <CreatorContact email={c.email} phone={c.phone} />
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex gap-1">
                              {c.niche.slice(0, 2).map((n) => <Badge key={n} variant="outline" className="text-xs capitalize">{n}</Badge>)}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-sm text-zinc-700">{fmt(c.totalFollowers)}</td>
                          <td className="py-2.5 px-4 text-sm text-zinc-700">{c.avgEngagement.toFixed(1)}%</td>
                          <td className="py-2.5 px-4 text-sm text-zinc-700">{c.score}/100</td>
                          <td className="py-2.5 px-4">
                            <span className="text-xs text-zinc-600 capitalize">
                              {c.origin === "invite" ? "Convite" : c.origin === "brand_page" ? "Pág. marca" : "Orgânico"}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <ActionsMenu
                              items={[
                                { label: "Aprovar", icon: Check, onSelect: () => setApproveIds([c.id]) },
                                { label: "Recusar", icon: X, destructive: true },
                              ]}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </TabsContent>

          <TabsContent value="excluded">
            <div className="rounded-xl border border-zinc-200 overflow-x-auto bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50">
                    {["Creator", "Contato", "Nicho", "Seguidores", "Score", "Motivo"].map((h) => (
                      <th key={h} className="py-2.5 px-4 text-xs font-medium text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rejectedCreators.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-zinc-400">
                        Nenhum influenciador excluído.
                      </td>
                    </tr>
                  ) : (
                    rejectedCreators.map((c) => (
                      <tr key={c.id} className="border-t border-zinc-100">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              {c.photo ? (
                                <img src={c.photo} alt={c.name} className="h-8 w-8 rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700 shrink-0">{c.avatar}</div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-zinc-900">{c.name}</p>
                                <p className="text-xs text-zinc-400">{c.handle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <CreatorContact email={c.email} phone={c.phone} />
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex gap-1">
                              {c.niche.slice(0, 2).map((n) => <Badge key={n} variant="outline" className="text-xs capitalize">{n}</Badge>)}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-sm text-zinc-700">{fmt(c.totalFollowers)}</td>
                          <td className="py-2.5 px-4 text-sm text-zinc-700">{c.score}/100</td>
                          <td className="py-2.5 px-4 text-xs text-red-600">
                            {c.fraudScore > 4 ? "Score de fraude elevado" : "Não atende requisitos"}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Performance dense table */}
          <TabsContent value="performance">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Creators entram com conteúdo e vendas. Afiliados entram só com as vendas do cupom.</p>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Download size={13} /> Exportar CSV
              </Button>
            </div>
            <div className="rounded-xl border border-zinc-200 overflow-x-auto bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50">
                    {["Creator", "Contato", "Seguidores (eng%)", "Vendas", "Comissão%", "ROI", "Posts", "Último post", "Nível", "Tipo"].map((h) => (
                      <th key={h} className="py-2.5 px-3 text-xs font-medium text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {performanceCreators.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-sm text-zinc-400">
                        Nenhum creator neste período.
                      </td>
                    </tr>
                  ) : performanceCreators.map((c) => {
                    const role = roles[c.id] ?? c.membershipRole
                    const affiliate = role === "affiliate"
                    const organizationId = user?.organizationId
                    const totalRoi = creatorRoi({
                      sales: c.totalSales,
                      commission: c.totalCommission,
                      fee: organizationId ? creatorFeeCost(campaigns, c.id, organizationId) : 0,
                      seeding: organizationId ? creatorSeedingCost(seedingCampaigns, c.id, organizationId) : 0,
                    })
                    return (
                      <tr key={c.id} className="border-t border-zinc-100 hover:bg-zinc-50 cursor-pointer" onClick={() => setSelectedCreatorId(c.id)}>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            {c.photo ? (
                              <img src={c.photo} alt={c.name} className="h-7 w-7 rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                            ) : (
                              <div className="h-7 w-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700 shrink-0">{c.avatar}</div>
                            )}
                            <div>
                              <p className="text-xs font-medium text-zinc-900 whitespace-nowrap">{c.name}</p>
                              <p className="text-[10px] text-zinc-400">{c.handle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <CreatorContact email={c.email} phone={c.phone} />
                        </td>
                        <td className="py-2.5 px-3 text-xs text-zinc-700">
                          <span className="font-medium">{fmt(c.totalFollowers)}</span>
                          <span className="text-zinc-400 ml-1">({c.avgEngagement.toFixed(1)}%)</span>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-zinc-700">
                          {c.totalSales ? `R$ ${fmt(c.totalSales)}` : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-zinc-700">
                          {c.totalSales && c.totalCommission
                            ? `${Math.round((c.totalCommission / c.totalSales) * 100)}%`
                            : "—"}
                        </td>
                        <td className="py-2.5 px-3"><RoiCell roi={totalRoi} /></td>
                        <td className="py-2.5 px-3 text-xs text-zinc-700">{affiliate ? <NotTracked /> : (c.totalPosts ?? "—")}</td>
                        <td className="py-2.5 px-3 text-xs text-zinc-500">{affiliate ? <NotTracked /> : c.lastPost ? formatDateBR(c.lastPost) : "—"}</td>
                        <td className="py-2.5 px-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                            c.level === "platinum" ? "bg-purple-50 text-purple-700" :
                            c.level === "gold" ? "bg-yellow-50 text-yellow-700" :
                            c.level === "silver" ? "bg-zinc-100 text-zinc-600" :
                            "bg-orange-50 text-orange-700"
                          )}>
                            {c.level === "platinum" ? "Platina" : c.level === "gold" ? "Ouro" : c.level === "silver" ? "Prata" : "Bronze"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <MembershipBadge role={role} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewListSheet
        open={creating}
        candidates={listCandidates(communityIds)}
        onOpenChange={setCreating}
        onCreate={createList}
      />

      {/* Relationship drawer */}
      <Sheet open={!!selectedCreatorId} onOpenChange={(o) => !o && setSelectedCreatorId(null)}>
        <SheetContent className="overflow-y-auto p-0">
          {selectedCreator && (
            <RelationshipDrawer
              key={selectedCreator.id}
              creator={{
                ...selectedCreator,
                approvalStatus: approvedIds.has(selectedCreator.id) ? "approved" : selectedCreator.approvalStatus,
              }}
              history={history}
            />
          )}
        </SheetContent>
      </Sheet>

      <ApproveCreatorDialog
        open={approveIds !== null}
        creators={CREATORS.filter((creator) => approveIds?.includes(creator.id))}
        organizationId={user?.organizationId}
        onOpenChange={(open) => {
          if (!open) setApproveIds(null)
        }}
        onApprove={(ids, role) => {
          assignRole(ids, role)
          setApprovedIds((current) => new Set([...current, ...ids]))
          setSelected((current) => {
            const next = new Set(current)
            for (const id of ids) next.delete(id)
            return next
          })
          setApproveIds(null)
          const names = CREATORS.filter((creator) => ids.includes(creator.id)).map((creator) => creator.name)
          toast.add({
            type: "success",
            title: ids.length === 1 ? `${MEMBERSHIP_ROLE_LABEL[role]} aceito` : `${MEMBERSHIP_ROLE_LABEL[role]}s aceitos`,
            description: names.join(", "),
          })
        }}
      />
    </div>
  )
}

