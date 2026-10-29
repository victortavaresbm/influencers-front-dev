"use client"
import { useState, useMemo } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { MONITOR_POSTS, type MonitorPost } from "@/lib/mock-data/metrics"
import { CAMPAIGNS } from "@/lib/mock-data/campaigns"
import { useAuthStore } from "@/lib/stores/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AiBadge, AI_CONFIG, PostCard, POST_TYPE_LABELS, StarRating } from "@/components/posts/post-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDateBR } from "@/lib/dates"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import {
  LayoutGrid, List, X,
  ChevronUp, ChevronDown, ChevronsUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

const NetworkIcon = ({ network, size = 13 }: { network: string; size?: number }) => {
  if (network === "instagram") return <SiInstagram size={size} />
  if (network === "tiktok") return <SiTiktok size={size} />
  if (network === "youtube") return <SiYoutube size={size} />
  return null
}

type SortKey = "publishedAt" | "reach" | "likes" | "comments" | "engagement" | "aiScore"
type SortDir = "asc" | "desc"

function FilterMenu({
  value,
  onValueChange,
  options,
}: {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  const current = options.find((option) => option.value === value)?.label ?? options[0]?.label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="px-3 font-normal" />}
      >
        {current}
        <ChevronDown data-icon="inline-end" className="text-zinc-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto min-w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-zinc-900 text-white px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:opacity-70">
        <X size={11} />
      </button>
    </span>
  )
}

export default function MonitoringPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const orgCampaigns = CAMPAIGNS.filter((c) => c.organizationId === user?.organizationId)

  const [view, setView] = useState<"grid" | "list">("grid")
  const [campaignFilter, setCampaignFilter] = useState<string | null>(null)
  const [networkFilter, setNetworkFilter] = useState<string | null>(null)
  const [formatFilter, setFormatFilter] = useState<string | null>(null)
  const [aiFilter, setAiFilter] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("publishedAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const orgCampaignIds = orgCampaigns.map((c) => c.id)

  const posts = useMemo(() => {
    let data = MONITOR_POSTS.filter((p) => orgCampaignIds.includes(p.campaignId))
    if (campaignFilter) data = data.filter((p) => p.campaignId === campaignFilter)
    if (networkFilter) data = data.filter((p) => p.network === networkFilter)
    if (formatFilter) data = data.filter((p) => p.type === formatFilter)
    if (aiFilter) data = data.filter((p) => p.aiStatus === aiFilter)
    data.sort((a, b) => {
      let av: number, bv: number
      if (sortKey === "publishedAt") { av = new Date(a.publishedAt).getTime(); bv = new Date(b.publishedAt).getTime() }
      else if (sortKey === "engagement") { av = a.engagement; bv = b.engagement }
      else if (sortKey === "aiScore") { av = a.aiScore; bv = b.aiScore }
      else { av = a[sortKey]; bv = b[sortKey] }
      return sortDir === "desc" ? bv - av : av - bv
    })
    return data
  }, [orgCampaignIds, campaignFilter, networkFilter, formatFilter, aiFilter, sortKey, sortDir])

  const totalReach = posts.reduce((s, p) => s + p.reach, 0)
  const totalEngagement = posts.reduce((s, p) => s + p.likes + p.comments, 0)
  const approved = posts.filter((p) => p.aiStatus === "aprovado").length

  const activeFilters = [
    campaignFilter && { label: `Campanha: ${orgCampaigns.find((c) => c.id === campaignFilter)?.name.split("—")[0].trim()}`, clear: () => setCampaignFilter(null) },
    networkFilter && { label: networkFilter.charAt(0).toUpperCase() + networkFilter.slice(1), clear: () => setNetworkFilter(null) },
    formatFilter && { label: POST_TYPE_LABELS[formatFilter] ?? formatFilter, clear: () => setFormatFilter(null) },
    aiFilter && { label: AI_CONFIG[aiFilter as MonitorPost["aiStatus"]]?.label ?? aiFilter, clear: () => setAiFilter(null) },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    else { setSortKey(key); setSortDir("desc") }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronsUpDown size={12} className="text-zinc-300" />
    return sortDir === "desc" ? <ChevronDown size={12} className="text-zinc-600" /> : <ChevronUp size={12} className="text-zinc-600" />
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar title={t("pages.monitoring")} subtitle={t("pages.publications", { count: posts.length })} />

      <div className="p-6 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Publicações", value: posts.length },
            { label: "Alcance total", value: fmt(totalReach) },
            { label: "Interações", value: fmt(totalEngagement) },
            { label: "Aprovadas IA", value: `${approved}/${posts.length}` },
          ].map(({ label, value }) => (
            <Card key={label} className="p-4">
              <p className="text-xs text-zinc-400">{label}</p>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">{value}</p>
            </Card>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterMenu
            value={campaignFilter ?? "all"}
            onValueChange={(value) => setCampaignFilter(value === "all" ? null : value)}
            options={[
              { value: "all", label: "Todas as campanhas" },
              ...orgCampaigns.map((c) => ({ value: c.id, label: c.name.split("—")[0].trim() })),
            ]}
          />
          <FilterMenu
            value={networkFilter ?? "all"}
            onValueChange={(value) => setNetworkFilter(value === "all" ? null : value)}
            options={[
              { value: "all", label: "Todas as redes" },
              { value: "instagram", label: "Instagram" },
              { value: "tiktok", label: "TikTok" },
              { value: "youtube", label: "YouTube" },
            ]}
          />
          <FilterMenu
            value={formatFilter ?? "all"}
            onValueChange={(value) => setFormatFilter(value === "all" ? null : value)}
            options={[
              { value: "all", label: "Todos os formatos" },
              ...Object.entries(POST_TYPE_LABELS).map(([value, label]) => ({ value, label })),
            ]}
          />
          <FilterMenu
            value={aiFilter ?? "all"}
            onValueChange={(value) => setAiFilter(value === "all" ? null : value)}
            options={[
              { value: "all", label: "Status IA: todos" },
              { value: "aprovado", label: "Aprovado" },
              { value: "alerta", label: "Alerta" },
              { value: "reprovado", label: "Reprovado" },
            ]}
          />

          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={cn("p-1.5 transition-colors", view === "grid" ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50")}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-1.5 transition-colors", view === "list" ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50")}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-zinc-400">Filtros:</span>
            {activeFilters.map((f) => (
              <FilterChip key={f.label} label={f.label} onRemove={f.clear} />
            ))}
            <button
              onClick={() => { setCampaignFilter(null); setNetworkFilter(null); setFormatFilter(null); setAiFilter(null) }}
              className="text-xs text-zinc-400 hover:text-zinc-700 underline"
            >
              Limpar todos
            </button>
          </div>
        )}

        {/* Results count */}
        <p className="text-xs text-zinc-400">{posts.length} publicações encontradas</p>

        {/* GRID VIEW */}
        {view === "grid" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {posts.length === 0 && (
              <div className="col-span-3 py-16 text-center text-sm text-zinc-400">
                Nenhuma publicação encontrada com os filtros selecionados.
              </div>
            )}
          </div>
        )}

        {/* LIST VIEW */}
        {view === "list" && (
          <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50">
                  {[
                    { key: null, label: "Creator" },
                    { key: null, label: "Campanha" },
                    { key: null, label: "Formato" },
                    { key: "publishedAt" as SortKey, label: "Data" },
                    { key: "reach" as SortKey, label: "Alcance" },
                    { key: "likes" as SortKey, label: "Curtidas" },
                    { key: "comments" as SortKey, label: "Coment." },
                    { key: "engagement" as SortKey, label: "Eng.%" },
                    { key: "aiScore" as SortKey, label: "IA" },
                    { key: null, label: "Avaliação" },
                  ].map(({ key, label }) => (
                    <th
                      key={label}
                      className={cn("py-2.5 px-3 text-xs font-medium text-zinc-500", key && "cursor-pointer select-none hover:text-zinc-700")}
                      onClick={key ? () => toggleSort(key) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key && <SortIcon k={key} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-7 items-center justify-center overflow-hidden rounded-md bg-zinc-200 text-[10px] font-semibold text-zinc-700 shrink-0">
                          {post.image ? (
                            <img src={post.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            post.avatar
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-900 whitespace-nowrap">{post.creatorName}</p>
                          <p className="text-[10px] text-zinc-400">{post.creatorHandle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-zinc-600 max-w-[140px] truncate">
                      {post.campaignName.split("—")[0].trim()}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 text-xs text-zinc-600">
                        <NetworkIcon network={post.network} size={11} />
                        {POST_TYPE_LABELS[post.type] ?? post.type}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-zinc-600 whitespace-nowrap">{formatDateBR(post.publishedAt)}</td>
                    <td className="py-2.5 px-3 text-xs font-medium text-zinc-800">{fmt(post.reach)}</td>
                    <td className="py-2.5 px-3 text-xs text-zinc-700">{fmt(post.likes)}</td>
                    <td className="py-2.5 px-3 text-xs text-zinc-700">{fmt(post.comments)}</td>
                    <td className="py-2.5 px-3 text-xs font-medium text-zinc-800">{post.engagement.toFixed(1)}%</td>
                    <td className="py-2.5 px-3">
                      <AiBadge status={post.aiStatus} score={post.aiScore} />
                    </td>
                    <td className="py-2.5 px-3">
                      <StarRating value={post.humanRating} />
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-sm text-zinc-400">
                      Nenhuma publicação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
