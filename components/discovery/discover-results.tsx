"use client"

import { useEffect, useId, useState } from "react"
import { Check, EyeOff, ListPlus, MapPin, Mars, ScanSearch, Venus, X } from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import {
  creatorPosts,
  fakeFollowersPct,
  formatCompact,
  formatResultCount,
  platformProfile,
  RESULT_PAGE_SIZE,
  type FilterChip,
  type Platform,
  type SearchMode,
} from "@/lib/discovery/discover-query"
import { campaignFitScore } from "@/lib/discovery/campaign-filters"
import { type Campaign } from "@/lib/mock-data/campaigns"
import { type Creator } from "@/lib/mock-data/creators"
import { type MonitorPost } from "@/lib/mock-data/metrics"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

function InstagramIcon() {
  const rawId = useId().replace(/:/g, "")
  const gradientId = `ig-brand-${rawId}`
  return (
    <span className="inline-flex size-4 shrink-0">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#fccc63" />
            <stop offset="25%" stopColor="#f77737" />
            <stop offset="50%" stopColor="#e1306c" />
            <stop offset="75%" stopColor="#c13584" />
            <stop offset="100%" stopColor="#833ab4" />
          </linearGradient>
        </defs>
      </svg>
      <SiInstagram className="size-4" fill={`url(#${gradientId})`} aria-hidden />
    </span>
  )
}

function TikTokIcon() {
  return (
    <span className="relative inline-flex size-4 shrink-0" aria-hidden>
      <SiTiktok className="absolute size-4 text-[#25F4EE]" style={{ transform: "translate(1px, 0)" }} />
      <SiTiktok className="absolute size-4 text-[#FE2C55]" style={{ transform: "translate(-1px, 0)" }} />
      <SiTiktok className="relative size-4 text-zinc-950" />
    </span>
  )
}

function NetworkIcon({ network }: { network: string }) {
  if (network === "instagram") return <InstagramIcon />
  if (network === "tiktok") return <TikTokIcon />
  if (network === "youtube") return <SiYoutube className="size-4 text-[#ff0033]" aria-hidden />
  return null
}

function openPost(post: MonitorPost) {
  if (post.url.startsWith("http")) {
    window.open(post.url, "_blank", "noopener,noreferrer")
    return
  }
  toast.add({ type: "info", title: "Este post de exemplo não tem link externo." })
}

function PostTile({ post }: { post: MonitorPost }) {
  const [failed, setFailed] = useState(false)
  const video = post.type === "reels" || post.type === "tiktok" || post.type === "video_youtube"
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={video ? "Assistir vídeo" : "Abrir imagem"}
      className="h-full w-full overflow-hidden rounded-md bg-zinc-100 p-0 hover:bg-zinc-100"
      onClick={(event) => {
        event.stopPropagation()
        openPost(post)
      }}
    >
      {post.image && !failed ? (
        <img src={post.image} alt="" className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className="text-xs font-medium text-zinc-400">{post.avatar}</span>
      )}
    </Button>
  )
}

const NICHE_LABEL: Record<string, string> = {
  beleza: "Beleza",
  moda: "Moda",
  fitness: "Fitness",
  gastronomia: "Gastronomia",
  tecnologia: "Tecnologia",
  lifestyle: "Lifestyle",
  humor: "Humor",
  games: "Games",
  finanças: "Finanças",
  viagem: "Viagem",
  maternidade: "Família",
  sustentabilidade: "Sustentabilidade",
  pets: "Pets",
  decoração: "Casa",
  esportes: "Esporte",
}

function CreatorCard({
  creator,
  platform,
  networks,
  hidden,
  onOpen,
  onSave,
  onToggleHidden,
}: {
  creator: Creator
  platform: Platform
  networks: Platform[]
  hidden: boolean
  onOpen: () => void
  onCollaborations: () => void
  onLookalike: () => void
  onSave: () => void
  onToggleHidden: () => void
  onSearchInside: (post: MonitorPost) => void
  onSearchImage: (post: MonitorPost) => void
}) {
  const visibleNetworks = networks.length > 0 ? networks : [platform]
  const profiles = creator.networks.filter((item) => visibleNetworks.includes(item.network))
  const posts = creatorPosts(creator.id)
    .filter((post) => visibleNetworks.includes(post.network))
    .slice(0, 4)
  const verified = profiles.some((item) => item.verified)
  const female = creator.audienceGender.find((item) => item.label.startsWith("Fem"))
  const male = creator.audienceGender.find((item) => item.label.startsWith("Mas"))
  const gender = (female?.pct ?? 0) >= (male?.pct ?? 0)
    ? { label: "Feminino", pct: female?.pct ?? 0, icon: Venus, tone: "text-rose-500" }
    : { label: "Masculino", pct: male?.pct ?? 0, icon: Mars, tone: "text-sky-600" }
  const real = Math.max(0, 100 - fakeFollowersPct(creator))
  const niches = creator.niche.slice(0, 3)

  if (hidden) {
    return (
      <div className="flex items-center justify-between gap-3 bg-white px-4 py-3">
        <p className="text-sm text-zinc-500">Perfil oculto · {creator.name}</p>
        <Button type="button" variant="outline" size="sm" onClick={onToggleHidden}>
          Mostrar perfil
        </Button>
      </div>
    )
  }

  return (
    <article
      className="grid cursor-pointer items-stretch gap-4 bg-white p-4 hover:bg-zinc-50 lg:grid-cols-[220px_minmax(0,1fr)_300px]"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen()
      }}
    >
      <div className="flex min-w-0 flex-col justify-center">
        <div className="flex items-start gap-3">
          <img src={creator.photo} alt="" className="size-12 shrink-0 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-sm font-semibold text-zinc-900">
              <span className="truncate">{creator.name}</span>
              {verified && <VerifiedBadge className="size-3.5 shrink-0" />}
            </p>
            <p className="flex items-center gap-1 truncate text-xs text-zinc-500">
              <MapPin className="size-3 shrink-0" />
              {creator.location}
            </p>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-4 text-zinc-700">{creator.bio}</p>
        <p className="mt-1 truncate text-xs text-zinc-400">{creator.handle}</p>
        <div className="mt-2 flex gap-2">
          <Button type="button" variant="outline" size="icon-sm" aria-label="Ocultar perfil" onClick={(event) => { event.stopPropagation(); onToggleHidden() }}>
            <X />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Salvar na lista" onClick={(event) => { event.stopPropagation(); onSave() }}>
            <Check />
          </Button>
        </div>
      </div>

      <div className="grid min-h-28 grid-cols-4 gap-2">
        {Array.from({ length: 4 }, (_, index) => {
          const post = posts[index]
          if (!post) return <span key={index} className="min-h-28 rounded-md bg-zinc-100" />
          return <PostTile key={post.id} post={post} />
        })}
      </div>

      <div className="flex min-w-0 items-center gap-4">
        <div className="min-w-0 flex-1 space-y-2 text-xs">
          <p className={cn("flex items-center gap-1.5 font-medium", gender.tone)}>
            <gender.icon className="size-3.5 shrink-0" />
            <span className="tabular-nums">{gender.pct}%</span>
            <span className="truncate font-normal text-zinc-500">{gender.label}</span>
          </p>
          <p className="font-medium text-emerald-600">
            <span className="tabular-nums">{real}%</span>
            <span className="font-normal text-zinc-500"> real</span>
          </p>
          <div className="space-y-1 border-t border-zinc-200 pt-2">
            {profiles.map((item) => (
              <p key={item.network} className="grid grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-2 text-zinc-700">
                <NetworkIcon network={item.network} />
                <span className="font-medium tabular-nums">{formatCompact(item.followers)}</span>
                <span className="tabular-nums text-zinc-500">{item.engagementRate.toLocaleString("pt-BR")}%</span>
              </p>
            ))}
          </div>
        </div>
        <div className="flex w-24 shrink-0 flex-col justify-center gap-1.5 self-stretch border-l border-zinc-200 pl-4">
          {niches.map((niche) => (
            <p key={niche} className="truncate text-xs text-zinc-600">{NICHE_LABEL[niche] ?? niche}</p>
          ))}
        </div>
      </div>
    </article>
  )
}

function pageList(page: number, pages: number) {
  if (pages <= 5) return Array.from({ length: pages }, (_, index) => index + 1)
  const items: Array<number | "…"> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pages - 1, page + 1)
  if (start > 2) items.push("…")
  for (let current = start; current <= end; current += 1) items.push(current)
  if (end < pages - 1) items.push("…")
  items.push(pages)
  return items
}

function cardPlatform(creator: Creator, networks: Platform[], fallback: Platform) {
  return networks.find((network) => platformProfile(creator, network)) ?? fallback
}

export function DiscoverResults({
  platform,
  networks,
  mode,
  creators,
  reference,
  hiddenIds,
  hiddenView,
  loading,
  page,
  chips,
  campaign,
  onPage,
  onOpen,
  onCollaborations,
  onLookalike,
  onSave,
  onToggleHidden,
  onSearchInside,
  onSearchImage,
  onBulk,
  onHiddenView,
  onClearChip,
  onClearAll,
}: {
  platform: Platform
  networks: Platform[]
  mode: SearchMode
  creators: Creator[]
  reference: Creator | null
  hiddenIds: string[]
  hiddenView: boolean
  loading: boolean
  page: number
  chips: FilterChip[]
  campaign: Campaign | null
  onPage: (page: number) => void
  onOpen: (creator: Creator) => void
  onCollaborations: (creator: Creator) => void
  onLookalike: (creator: Creator) => void
  onSave: (creator: Creator) => void
  onToggleHidden: (id: string) => void
  onSearchInside: (post: MonitorPost) => void
  onSearchImage: (post: MonitorPost) => void
  onBulk: (ids: string[]) => void
  onHiddenView: () => void
  onClearChip: (chip: FilterChip) => void
  onClearAll: () => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<{ key: "followers" | "er" | "engagement"; direction: "asc" | "desc" }>({
    key: "followers",
    direction: "desc",
  })
  const [columns, setColumns] = useState({ followers: true, er: true, engagement: true })
  const ordered = mode === "legacy"
    ? [...creators].sort((a, b) => {
        const left = metric(a, platform, sort.key)
        const right = metric(b, platform, sort.key)
        return sort.direction === "asc" ? left - right : right - left
      })
    : creators
  const pageSize = mode === "legacy" ? 8 : RESULT_PAGE_SIZE
  const pages = Math.max(1, Math.ceil(ordered.length / pageSize))
  const current = Math.min(page, pages)
  const slice = ordered.slice((current - 1) * pageSize, current * pageSize)
  const ids = ordered.map((creator) => creator.id).join(",")

  useEffect(() => {
    setSelected([])
  }, [ids, mode])

  const headerItems = hiddenView
    ? []
    : [
        {
          label: "Salvar em massa",
          icon: ListPlus,
          disabled: mode === "legacy" && selected.length === 0,
          onSelect: () => onBulk(mode === "legacy" ? selected : ordered.map((creator) => creator.id)),
        },
        { label: "Perfis ocultos", icon: EyeOff, onSelect: onHiddenView },
      ]

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {reference ? `${formatResultCount(ordered.length)} semelhantes` : formatResultCount(ordered.length)}
          </p>
          {reference && <p className="text-xs text-zinc-400">Parecidos com {reference.name}</p>}
        </div>
        {hiddenView ? (
          <Button type="button" variant="outline" size="sm" onClick={onHiddenView}>
            Voltar
          </Button>
        ) : (
          <ActionsMenu items={headerItems} />
        )}
      </div>

      {(chips.length > 0 || campaign) && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 bg-white px-4 py-2">
          {campaign && <Badge variant="secondary">Campanha: {campaign.name}</Badge>}
          {chips.map((chip) => (
            <Badge key={chip.key} variant="secondary" className="pr-0.5">
              {chip.label}
              <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remover ${chip.label}`} onClick={() => onClearChip(chip)}>
                ×
              </Button>
            </Badge>
          ))}
          <Button type="button" variant="ghost" size="xs" onClick={onClearAll}>
            Limpar filtros
          </Button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : mode === "ai" ? (
          <div className="space-y-3">
            {reference && !hiddenView && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500">1 perfil de referência</p>
                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  <CreatorCard
                    creator={reference}
                    platform={cardPlatform(reference, networks, platform)}
                    networks={networks}
                    hidden={false}
                    onOpen={() => onOpen(reference)}
                    onCollaborations={() => onCollaborations(reference)}
                    onLookalike={() => onLookalike(reference)}
                    onSave={() => onSave(reference)}
                    onToggleHidden={() => onToggleHidden(reference.id)}
                    onSearchInside={onSearchInside}
                    onSearchImage={onSearchImage}
                  />
                </div>
              </div>
            )}
            {slice.length === 0 && (
              <p className="py-16 text-center text-sm text-zinc-400">Nenhum creator com esses filtros.</p>
            )}
            {slice.length > 0 && (
              <div className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200">
                {slice.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    platform={cardPlatform(creator, networks, platform)}
                    networks={networks}
                    hidden={!hiddenView && hiddenIds.includes(creator.id)}
                    onOpen={() => onOpen(creator)}
                    onCollaborations={() => onCollaborations(creator)}
                    onLookalike={() => onLookalike(creator)}
                    onSave={() => onSave(creator)}
                    onToggleHidden={() => onToggleHidden(creator.id)}
                    onSearchInside={onSearchInside}
                    onSearchImage={onSearchImage}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <LegacyTable
            creators={slice}
            platform={platform}
            campaign={campaign}
            selected={selected}
            sort={sort}
            columns={columns}
            onSort={(key) =>
              setSort((current) => ({
                key,
                direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
              }))
            }
            onColumns={setColumns}
            onSelected={setSelected}
            onOpen={onOpen}
            onSave={onSave}
            onToggleHidden={onToggleHidden}
          />
        )}
      </div>

      {pages > 1 && !loading && (
        <div className="flex items-center justify-center gap-1 border-t border-zinc-200 bg-white px-4 py-3">
          {pageList(current, pages).map((item, index) =>
            item === "…" ? (
              <span key={`gap-${index}`} className="px-1 text-sm text-zinc-400">
                …
              </span>
            ) : (
              <Button key={item} type="button" size="sm" variant={item === current ? "default" : "outline"} onClick={() => onPage(item)}>
                {item}
              </Button>
            )
          )}
          <Button type="button" size="sm" variant="outline" disabled={current === pages} onClick={() => onPage(current + 1)}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}

function metric(creator: Creator, platform: Platform, key: "followers" | "er" | "engagement") {
  const profile = platformProfile(creator, platform)
  if (!profile) return 0
  if (key === "followers") return profile.followers
  if (key === "er") return profile.engagementRate
  return profile.avgViews * (profile.engagementRate / 100)
}

function LegacyTable({
  creators,
  platform,
  campaign,
  selected,
  sort,
  columns,
  onSort,
  onColumns,
  onSelected,
  onOpen,
  onSave,
  onToggleHidden,
}: {
  creators: Creator[]
  platform: Platform
  campaign: Campaign | null
  selected: string[]
  sort: { key: "followers" | "er" | "engagement"; direction: "asc" | "desc" }
  columns: { followers: boolean; er: boolean; engagement: boolean }
  onSort: (key: "followers" | "er" | "engagement") => void
  onColumns: (columns: { followers: boolean; er: boolean; engagement: boolean }) => void
  onSelected: (ids: string[]) => void
  onOpen: (creator: Creator) => void
  onSave: (creator: Creator) => void
  onToggleHidden: (id: string) => void
}) {
  const all = creators.length > 0 && creators.every((creator) => selected.includes(creator.id))
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <ActionsMenu
          label="Colunas"
          items={[
            {
              label: columns.followers ? "Ocultar seguidores" : "Mostrar seguidores",
              onSelect: () => onColumns({ ...columns, followers: !columns.followers }),
            },
            {
              label: columns.er ? "Ocultar ER%" : "Mostrar ER%",
              onSelect: () => onColumns({ ...columns, er: !columns.er }),
            },
            {
              label: columns.engagement ? "Ocultar engajamento" : "Mostrar engajamento",
              onSelect: () => onColumns({ ...columns, engagement: !columns.engagement }),
            },
          ]}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={all}
                onCheckedChange={(checked) => onSelected(checked === true ? creators.map((creator) => creator.id) : [])}
                aria-label="Selecionar página"
              />
            </TableHead>
            <TableHead>Creator</TableHead>
            {columns.followers && (
              <TableHead>
                <Button type="button" variant="ghost" size="xs" onClick={() => onSort("followers")}>
                  Seguidores {sort.key === "followers" ? (sort.direction === "desc" ? "↓" : "↑") : ""}
                </Button>
              </TableHead>
            )}
            {columns.er && (
              <TableHead>
                <Button type="button" variant="ghost" size="xs" onClick={() => onSort("er")}>
                  ER% {sort.key === "er" ? (sort.direction === "desc" ? "↓" : "↑") : ""}
                </Button>
              </TableHead>
            )}
            {columns.engagement && (
              <TableHead>
                <Button type="button" variant="ghost" size="xs" onClick={() => onSort("engagement")}>
                  Engajamento {sort.key === "engagement" ? (sort.direction === "desc" ? "↓" : "↑") : ""}
                </Button>
              </TableHead>
            )}
            {campaign && <TableHead>Critérios</TableHead>}
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {creators.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-16 text-center text-zinc-400">
                Nenhum creator com esses filtros.
              </TableCell>
            </TableRow>
          )}
          {creators.map((creator) => {
            const profile = platformProfile(creator, platform)
            const fit = campaign ? campaignFitScore(campaign, creator) : null
            return (
              <TableRow key={creator.id} className="cursor-pointer" onClick={() => onOpen(creator)}>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selected.includes(creator.id)}
                    onCheckedChange={(checked) =>
                      onSelected(
                        checked === true
                          ? [...selected, creator.id]
                          : selected.filter((id) => id !== creator.id)
                      )
                    }
                    aria-label={`Selecionar ${creator.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img src={creator.photo} alt="" className="size-8 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate text-sm font-medium">
                        {creator.name}
                        {profile?.verified && <VerifiedBadge className="size-3.5" />}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs text-zinc-400">
                        <NetworkIcon network={platform} />
                        {creator.handle}
                      </p>
                    </div>
                  </div>
                </TableCell>
                {columns.followers && <TableCell>{profile ? formatCompact(profile.followers) : "—"}</TableCell>}
                {columns.er && (
                  <TableCell>{profile ? `${profile.engagementRate.toLocaleString("pt-BR")}%` : "—"}</TableCell>
                )}
                {columns.engagement && (
                  <TableCell>{profile ? formatCompact(Math.round(profile.avgViews * (profile.engagementRate / 100))) : "—"}</TableCell>
                )}
                {campaign && fit && (
                  <TableCell>
                    {fit.matched}/{fit.total}
                  </TableCell>
                )}
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <ActionsMenu
                    items={[
                      { label: "Ocultar perfil", icon: EyeOff, onSelect: () => onToggleHidden(creator.id) },
                      { label: "Salvar na lista", icon: ListPlus, onSelect: () => onSave(creator) },
                      { label: "Ver", icon: ScanSearch, onSelect: () => onOpen(creator) },
                    ]}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
