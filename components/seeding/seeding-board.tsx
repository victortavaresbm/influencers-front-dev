"use client"
import { useState, type MouseEvent, type ReactNode } from "react"
import { useSeedingStore } from "@/lib/stores/seeding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FilterMenu } from "@/components/ui/filter-menu"
import { ActionsMenu, type ActionMenuItem } from "@/components/ui/actions-menu"
import { toast } from "@/components/ui/toast"
import {
  CheckCircle2,
  Circle,
  MapPin,
  Package,
  Truck,
  ExternalLink,
  Camera,
  XCircle,
  Send,
  Trash2,
  List,
  Kanban,
  Copy,
} from "lucide-react"
import type { SeedingCampaign, SeedingCreatorEntry, SeedingProduct, CreatorSeedingStatus } from "@/lib/mock-data/seeding"

const STAGE_ORDER: CreatorSeedingStatus[] = [
  "convidado",
  "endereco_coletado",
  "enviado",
  "entregue",
  "postou",
  "nao_postou",
]

const STAGE_CONFIG: Record<CreatorSeedingStatus, { label: string; color: string; bg: string; icon: ReactNode }> = {
  convidado: {
    label: "Convidado",
    color: "text-zinc-500",
    bg: "bg-zinc-100",
    icon: <Circle size={13} />,
  },
  endereco_coletado: {
    label: "Endereço coletado",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: <MapPin size={13} />,
  },
  enviado: {
    label: "Enviado",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: <Truck size={13} />,
  },
  entregue: {
    label: "Entregue",
    color: "text-purple-600",
    bg: "bg-purple-50",
    icon: <Package size={13} />,
  },
  postou: {
    label: "Postou",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: <CheckCircle2 size={13} />,
  },
  nao_postou: {
    label: "Não postou",
    color: "text-red-500",
    bg: "bg-red-50",
    icon: <XCircle size={13} />,
  },
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return n.toString()
}

function ProductThumb({ product }: { product: SeedingProduct }) {
  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 object-cover"
      />
    )
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
      <Package size={16} className="text-zinc-400" />
    </div>
  )
}

function SentProduct({ product, variant }: { product?: SeedingProduct; variant?: string }) {
  if (!product) return <span className="text-xs text-zinc-300">—</span>
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <ProductThumb product={product} />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-zinc-700">{product.name}</p>
        {variant ? <p className="truncate text-xs text-zinc-400">{variant}</p> : null}
      </div>
    </div>
  )
}

function TrackingCode({ code }: { code: string }) {
  async function copy(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      toast.add({ type: "success", title: "Código copiado", description: code })
    } catch {
      toast.add({ type: "error", title: "Não foi possível copiar o código" })
    }
  }

  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="font-mono text-xs text-zinc-500">{code}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Copiar ${code}`}
        onClick={copy}
      >
        <Copy />
      </Button>
    </span>
  )
}

function PipelineBar({ campaign }: { campaign: SeedingCampaign }) {
  const counts = STAGE_ORDER.reduce<Record<CreatorSeedingStatus, number>>(
    (acc, stage) => ({ ...acc, [stage]: 0 }),
    {} as Record<CreatorSeedingStatus, number>
  )
  campaign.creators.forEach((creator) => {
    counts[creator.status] = (counts[creator.status] ?? 0) + 1
  })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STAGE_ORDER.map((stage) => {
        const cfg = STAGE_CONFIG[stage]
        return (
          <div key={stage} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
            {cfg.icon}
            <span>{cfg.label}</span>
            <span className="font-semibold">{counts[stage] ?? 0}</span>
          </div>
        )
      })}
    </div>
  )
}

interface TrackingDialogProps {
  campaignId: string
  entry: SeedingCreatorEntry
  open: boolean
  onClose: () => void
}

function TrackingDialog({ campaignId, entry, open, onClose }: TrackingDialogProps) {
  const setTrackingCode = useSeedingStore((s) => s.setTrackingCode)
  const [code, setCode] = useState(entry.trackingCode ?? "")

  function handleSave() {
    if (!code.trim()) return
    setTrackingCode(campaignId, entry.id, code.trim())
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Registrar envio</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Creator: <span className="font-medium text-zinc-800">{entry.creatorName}</span>
        </p>
        <div className="mb-5 space-y-1.5">
          <Label>Código de rastreamento</Label>
          <Input
            placeholder="BR000000000BR"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!code.trim()} className="flex-1">Salvar</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface PostDialogProps {
  campaignId: string
  entry: SeedingCreatorEntry
  open: boolean
  onClose: () => void
}

function PostDialog({ campaignId, entry, open, onClose }: PostDialogProps) {
  const setPostUrl = useSeedingStore((s) => s.setPostUrl)
  const [url, setUrl] = useState(entry.postUrl ?? "")
  const [views, setViews] = useState(entry.postViews?.toString() ?? "")
  const [likes, setLikes] = useState(entry.postLikes?.toString() ?? "")
  const [comments, setComments] = useState(entry.postComments?.toString() ?? "")

  function handleSave() {
    if (!url.trim()) return
    setPostUrl(campaignId, entry.id, url.trim(), parseInt(views) || 0, parseInt(likes) || 0, parseInt(comments) || 0)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Registrar post</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Creator: <span className="font-medium text-zinc-800">{entry.creatorName}</span>
        </p>
        <div className="mb-5 space-y-3">
          <div className="space-y-1.5">
            <Label>Link do post</Label>
            <Input
              placeholder="https://instagram.com/p/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Views</Label>
              <Input type="number" min={0} placeholder="0" value={views} onChange={(e) => setViews(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Likes</Label>
              <Input type="number" min={0} placeholder="0" value={likes} onChange={(e) => setLikes(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Comentários</Label>
              <Input type="number" min={0} placeholder="0" value={comments} onChange={(e) => setComments(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!url.trim()} className="flex-1">Salvar</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreatorActions({
  campaign,
  entry,
  children,
}: {
  campaign: SeedingCampaign
  entry: SeedingCreatorEntry
  children: (items: ActionMenuItem[]) => ReactNode
}) {
  const updateCreatorStatus = useSeedingStore((s) => s.updateCreatorStatus)
  const removeCreator = useSeedingStore((s) => s.removeCreator)
  const [trackingOpen, setTrackingOpen] = useState(false)
  const [postOpen, setPostOpen] = useState(false)

  const items: ActionMenuItem[] = []
  if (entry.status === "endereco_coletado" || entry.status === "convidado") {
    items.push({ label: "Registrar envio", icon: Send, onSelect: () => setTrackingOpen(true) })
  }
  if (entry.status === "enviado") {
    items.push({
      label: "Marcar como entregue",
      icon: Package,
      onSelect: () => updateCreatorStatus(campaign.id, entry.id, "entregue"),
    })
  }
  if (entry.status === "entregue") {
    items.push({ label: "Registrar post", icon: Camera, onSelect: () => setPostOpen(true) })
    items.push({
      label: "Não postou",
      icon: XCircle,
      onSelect: () => updateCreatorStatus(campaign.id, entry.id, "nao_postou"),
    })
  }
  if (entry.status === "nao_postou") {
    items.push({ label: "Registrar post mesmo assim", icon: Camera, onSelect: () => setPostOpen(true) })
  }
  items.push({
    label: "Remover creator",
    icon: Trash2,
    destructive: true,
    onSelect: () => removeCreator(campaign.id, entry.id),
  })

  return (
    <>
      {children(items)}
      <TrackingDialog
        campaignId={campaign.id}
        entry={entry}
        open={trackingOpen}
        onClose={() => setTrackingOpen(false)}
      />
      <PostDialog
        campaignId={campaign.id}
        entry={entry}
        open={postOpen}
        onClose={() => setPostOpen(false)}
      />
    </>
  )
}

function CreatorIdentity({ entry }: { entry: SeedingCreatorEntry }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar>
        {entry.creatorPhoto ? <AvatarImage src={entry.creatorPhoto} alt={entry.creatorName} /> : null}
        <AvatarFallback>{entry.creatorAvatar}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-none text-zinc-900">{entry.creatorName}</p>
        <p className="mt-0.5 truncate text-xs text-zinc-400">{entry.creatorHandle}</p>
      </div>
    </div>
  )
}

function CreatorRow({ campaign, entry }: { campaign: SeedingCampaign; entry: SeedingCreatorEntry }) {
  const cfg = STAGE_CONFIG[entry.status]
  const product = campaign.products.find((item) => item.id === entry.selectedProductId)

  return (
    <CreatorActions campaign={campaign} entry={entry}>
      {(items) => (
        <tr className="border-b border-zinc-100 transition-colors hover:bg-zinc-50">
          <td className="px-4 py-3">
            <CreatorIdentity entry={entry} />
          </td>
          <td className="px-4 py-3">
            <SentProduct product={product} variant={entry.selectedVariant} />
          </td>
          <td className="px-4 py-3">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
              {cfg.icon}
              {cfg.label}
            </span>
          </td>
          <td className="px-4 py-3">
            {entry.trackingCode ? (
              <TrackingCode code={entry.trackingCode} />
            ) : (
              <span className="text-xs text-zinc-300">—</span>
            )}
          </td>
          <td className="px-4 py-3 text-sm">
            {entry.postUrl ? (
              <a
                href={entry.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink size={11} /> Ver post
              </a>
            ) : (
              <span className="text-xs text-zinc-300">—</span>
            )}
          </td>
          <td className="px-4 py-3 text-sm">
            {entry.postViews ? (
              <div>
                <p className="text-xs font-medium text-zinc-900">{fmt(entry.postViews)} views</p>
                <p className="text-xs text-zinc-400">
                  {entry.postLikes ? `${fmt(entry.postLikes)} likes` : ""}
                  {entry.postLikes && entry.postComments ? " · " : ""}
                  {entry.postComments ? `${fmt(entry.postComments)} coments.` : ""}
                </p>
              </div>
            ) : (
              <span className="text-xs text-zinc-300">—</span>
            )}
          </td>
          <td className="px-4 py-3">
            <ActionsMenu items={items} />
          </td>
        </tr>
      )}
    </CreatorActions>
  )
}

function CreatorCard({ campaign, entry }: { campaign: SeedingCampaign; entry: SeedingCreatorEntry }) {
  const product = campaign.products.find((item) => item.id === entry.selectedProductId)

  return (
    <CreatorActions campaign={campaign} entry={entry}>
      {(items) => (
        <Card size="sm" className="bg-white">
          <CardHeader className="items-center">
            <CreatorIdentity entry={entry} />
            <CardAction className="self-center">
              <ActionsMenu items={items} trigger="ellipsis" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            <SentProduct product={product} variant={entry.selectedVariant} />
            {entry.trackingCode ? <TrackingCode code={entry.trackingCode} /> : null}
            {entry.postUrl ? (
              <a
                href={entry.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink size={11} /> Ver post
                {entry.postViews ? <span className="text-zinc-400">· {fmt(entry.postViews)} views</span> : null}
              </a>
            ) : null}
          </CardContent>
        </Card>
      )}
    </CreatorActions>
  )
}

function KanbanView({
  campaign,
  creators,
  stages,
}: {
  campaign: SeedingCampaign
  creators: SeedingCreatorEntry[]
  stages: CreatorSeedingStatus[]
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {stages.map((stage) => {
        const cfg = STAGE_CONFIG[stage]
        const column = creators.filter((entry) => entry.status === stage)
        return (
          <div key={stage} className="flex w-72 shrink-0 flex-col rounded-xl border border-zinc-200 bg-zinc-50">
            <div className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium ${cfg.color}`}>
              {cfg.icon}
              <span>{cfg.label}</span>
              <span className="ml-auto font-semibold">{column.length}</span>
            </div>
            <div className="flex flex-col gap-2 p-2">
              {column.map((entry) => (
                <CreatorCard key={entry.id} campaign={campaign} entry={entry} />
              ))}
              {column.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-zinc-400">Nenhum creator</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface SeedingBoardProps {
  campaign: SeedingCampaign
}

export function SeedingBoard({ campaign }: SeedingBoardProps) {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<CreatorSeedingStatus | "all">("all")
  const [view, setView] = useState<"list" | "kanban">("list")

  const filtered = campaign.creators.filter((creator) => {
    const matchSearch =
      !search ||
      creator.creatorName.toLowerCase().includes(search.toLowerCase()) ||
      creator.creatorHandle.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || creator.status === filterStatus
    return matchSearch && matchStatus
  })

  const visibleStages = filterStatus === "all" ? STAGE_ORDER : [filterStatus]

  return (
    <div className="space-y-4">
      <PipelineBar campaign={campaign} />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar creator..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <FilterMenu
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as CreatorSeedingStatus | "all")}
          options={[
            { value: "all", label: "Todos os status" },
            ...STAGE_ORDER.map((stage) => ({ value: stage, label: STAGE_CONFIG[stage].label })),
          ]}
        />
        <div className="ml-auto flex items-center overflow-hidden rounded-lg border border-zinc-200">
          <Button
            type="button"
            size="icon-sm"
            variant={view === "list" ? "default" : "ghost"}
            className="rounded-none"
            aria-label="Ver em lista"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={view === "kanban" ? "default" : "ghost"}
            className="rounded-none"
            aria-label="Ver em kanban"
            aria-pressed={view === "kanban"}
            onClick={() => setView("kanban")}
          >
            <Kanban />
          </Button>
        </div>
      </div>

      {view === "kanban" ? (
        filtered.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center text-sm text-zinc-400">
            Nenhum creator encontrado.
          </div>
        ) : (
          <KanbanView campaign={campaign} creators={filtered} stages={visibleStages} />
        )
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-200">
              <tr>
                {["Creator", "Produto", "Status", "Rastreamento", "Post", "Métricas", ""].map((header) => (
                  <th key={header} className="bg-zinc-50 px-4 py-2.5 text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <CreatorRow key={entry.id} campaign={campaign} entry={entry} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-zinc-400">
                    Nenhum creator encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
