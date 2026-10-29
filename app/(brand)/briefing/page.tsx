"use client"
import { useState } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { useAuthStore } from "@/lib/stores/auth"
import { type Briefing, type BriefingAcceptance } from "@/lib/mock-data/briefings"
import { useBriefingStore } from "@/lib/stores/briefings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Plus, Clock, Check, X, FileText, BookOpen, ChevronRight,
  Link2, AlertTriangle, CheckCircle2, RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CreatorContact } from "@/components/creators/creator-contact"
import { CREATORS } from "@/lib/mock-data/creators"

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

const STATUS_CONFIG = {
  rascunho: { label: "Rascunho", classes: "bg-zinc-100 text-zinc-600" },
  publicado: { label: "Publicado", classes: "bg-emerald-50 text-emerald-700" },
  arquivado: { label: "Arquivado", classes: "bg-zinc-100 text-zinc-400" },
} as const

const ACCEPTANCE_CONFIG = {
  accepted: { label: "Aceito", icon: CheckCircle2, classes: "text-emerald-600" },
  pending: { label: "Pendente", icon: Clock, classes: "text-amber-600" },
  re_acceptance_required: { label: "Novo aceite necessário", icon: RefreshCw, classes: "text-red-500" },
} as const

function AcceptancePill({ status }: { status: BriefingAcceptance["status"] }) {
  const cfg = ACCEPTANCE_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", cfg.classes)}>
      <Icon size={11} /> {cfg.label}
    </span>
  )
}

function BriefingCard({ briefing, onSelect }: { briefing: Briefing; onSelect: () => void }) {
  const accepted = briefing.acceptances?.filter((a) => a.status === "accepted").length ?? 0
  const total = briefing.acceptances?.length ?? 0
  const pendingCount = briefing.acceptances?.filter((a) => a.status !== "accepted").length ?? 0

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-sm hover:border-zinc-300 transition-all"
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{briefing.title}</p>
          {briefing.type === "campaign" ? (
            <p className="text-xs text-zinc-400 mt-0.5 truncate">{briefing.campaignName}</p>
          ) : (
            <p className="text-xs text-zinc-400 mt-0.5">{briefing.scope}</p>
          )}
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", STATUS_CONFIG[briefing.status].classes)}>
          {STATUS_CONFIG[briefing.status].label}
        </span>
      </div>

      <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{briefing.objective}</p>

      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-1">
          <Clock size={10} />
          v{briefing.versions.length} · {briefing.updatedAt}
        </div>
        {briefing.type === "campaign" && total > 0 && (
          <span className={cn("font-medium", pendingCount > 0 ? "text-amber-600" : "text-emerald-600")}>
            {accepted}/{total} aceites
          </span>
        )}
        {briefing.type === "campaign" && briefing.deliverables && (
          <span>{briefing.deliverables.length} entregáveis</span>
        )}
      </div>

      {briefing.type === "campaign" && briefing.brandBriefingTitle && (
        <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400 border-t border-zinc-100 pt-2">
          <Link2 size={10} />
          Base: {briefing.brandBriefingTitle}
        </div>
      )}
    </button>
  )
}

function PublishDialog({
  briefing,
  onClose,
  onPublish,
}: {
  briefing: Briefing
  onClose: () => void
  onPublish: (requiresReAcceptance: boolean) => void
}) {
  const [requiresReAcceptance, setRequiresReAcceptance] = useState(false)
  const nextVersion = briefing.versions.length + 1

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-base font-semibold text-zinc-900 mb-1">Publicar versão {nextVersion}</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Creators vinculados poderão visualizar este briefing assim que publicado.
        </p>
        {briefing.type === "campaign" && (briefing.acceptances?.length ?? 0) > 0 && (
          <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 cursor-pointer hover:bg-zinc-50 mb-4">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded"
              checked={requiresReAcceptance}
              onChange={(e) => setRequiresReAcceptance(e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium text-zinc-900">Exigir novo aceite dos creators</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Marque se houve mudanças relevantes em entregáveis, prazos ou restrições.
              </p>
            </div>
          </label>
        )}
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={() => onPublish(requiresReAcceptance)}>
            Publicar v{nextVersion}
          </Button>
        </div>
      </div>
    </div>
  )
}

function BriefingEditor({ briefing, onClose }: { briefing: Briefing; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("editor")
  const [editedObjective, setEditedObjective] = useState(briefing.objective)
  const [showPublishDialog, setShowPublishDialog] = useState(false)

  const handlePublish = (requiresReAcceptance: boolean) => {
    setShowPublishDialog(false)
  }

  const pendingAcceptances = briefing.acceptances?.filter((a) => a.status !== "accepted") ?? []
  const acceptedCount = briefing.acceptances?.filter((a) => a.status === "accepted").length ?? 0

  return (
    <>
      <Sheet open onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="overflow-y-auto p-0 sm:max-w-xl w-full">
          <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 z-10">
            <SheetHeader className="p-0 mb-3">
              <div className="flex items-start justify-between gap-2 pr-8">
                <div className="min-w-0">
                  <SheetTitle className="text-base leading-tight">{briefing.title}</SheetTitle>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {briefing.type === "campaign" ? briefing.campaignName : briefing.scope}
                  </p>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5", STATUS_CONFIG[briefing.status].classes)}>
                  {STATUS_CONFIG[briefing.status].label}
                </span>
              </div>
            </SheetHeader>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">Salvar rascunho</Button>
              <Button size="sm" className="text-xs" onClick={() => setShowPublishDialog(true)}>
                Publicar v{briefing.versions.length + 1}
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 pt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              {briefing.type === "campaign" && (
                <TabsTrigger value="aceites">
                  Aceites
                  {pendingAcceptances.length > 0 && (
                    <span className="ml-1.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {pendingAcceptances.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
              <TabsTrigger value="versions">Versões ({briefing.versions.length})</TabsTrigger>
            </TabsList>

            {/* EDITOR TAB */}
            <TabsContent value="editor" className="space-y-4 pb-6">
              {briefing.type === "campaign" && briefing.brandBriefingTitle && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-600">
                  <Link2 size={14} className="text-zinc-400 shrink-0" />
                  <span>Complementa: <span className="font-medium text-zinc-800">{briefing.brandBriefingTitle}</span></span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Objetivo</Label>
                <textarea
                  className="w-full h-24 px-3 py-2 text-sm border border-zinc-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  value={editedObjective}
                  onChange={(e) => setEditedObjective(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Público-alvo</Label>
                <textarea
                  className="w-full h-20 px-3 py-2 text-sm border border-zinc-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  defaultValue={briefing.targetAudience}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tom de voz</Label>
                <textarea
                  className="w-full h-16 px-3 py-2 text-sm border border-zinc-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  defaultValue={briefing.toneOfVoice}
                />
              </div>

              <div>
                <Label className="mb-2 block">✅ Pode fazer</Label>
                <div className="space-y-2">
                  {briefing.doList.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                      <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-zinc-700 flex-1">{item}</p>
                      <button className="text-zinc-300 hover:text-zinc-500"><X size={12} /></button>
                    </div>
                  ))}
                  <button className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1">
                    <Plus size={12} /> Adicionar item
                  </button>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">❌ Não pode fazer</Label>
                <div className="space-y-2">
                  {briefing.dontList.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-100">
                      <X size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-zinc-700 flex-1">{item}</p>
                    </div>
                  ))}
                  <button className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1">
                    <Plus size={12} /> Adicionar restrição
                  </button>
                </div>
              </div>

              {briefing.type === "campaign" && briefing.deliverables && (
                <div>
                  <Label className="mb-2 block">Entregáveis</Label>
                  {briefing.deliverables.map((d, i) => (
                    <div key={i} className="p-3 rounded-lg border border-zinc-200 mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-zinc-900">{d.type} × {d.quantity}</p>
                        <span className="text-xs text-zinc-400">Prazo: {d.deadline}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{d.notes}</p>
                    </div>
                  ))}
                  <button className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1">
                    <Plus size={12} /> Adicionar entregável
                  </button>
                </div>
              )}

              <div>
                <Label className="mb-2 block">Elementos obrigatórios</Label>
                <div className="flex flex-wrap gap-1.5">
                  {briefing.mandatoryElements.map((e) => (
                    <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* PREVIEW TAB */}
            <TabsContent value="preview" className="pb-6">
              <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-zinc-900">{briefing.title}</h2>
                  {briefing.type === "campaign" && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {briefing.campaignName} · {briefing.publicationWindow}
                    </p>
                  )}
                  {briefing.type === "campaign" && briefing.brandBriefingTitle && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5">
                      <Link2 size={11} />
                      Complementa: <span className="font-medium">{briefing.brandBriefingTitle}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Objetivo</h3>
                  <p className="text-sm text-zinc-700">{editedObjective}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Público-alvo</h3>
                  <p className="text-sm text-zinc-700">{briefing.targetAudience}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Mensagens-chave</h3>
                  <ul className="space-y-1">
                    {briefing.keyMessages.map((m) => (
                      <li key={m} className="text-sm text-zinc-700 flex items-start gap-1.5">
                        <span className="text-zinc-400 mt-0.5">›</span> {m}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-emerald-700 mb-1.5">✅ Pode fazer</h3>
                    <ul className="space-y-1">
                      {briefing.doList.map((m) => <li key={m} className="text-xs text-emerald-800">{m}</li>)}
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-red-700 mb-1.5">❌ Não pode fazer</h3>
                    <ul className="space-y-1">
                      {briefing.dontList.map((m) => <li key={m} className="text-xs text-red-800">{m}</li>)}
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Elementos obrigatórios</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {briefing.mandatoryElements.map((e) => (
                      <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ACEITES TAB */}
            {briefing.type === "campaign" && (
              <TabsContent value="aceites" className="pb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-900">{acceptedCount}</span>
                    /{briefing.acceptances?.length ?? 0} creators aceitaram · v{briefing.currentPublishedVersion}
                  </p>
                  {pendingAcceptances.length > 0 && (
                    <Button size="sm" variant="outline" className="text-xs gap-1.5">
                      <AlertTriangle size={12} className="text-amber-500" />
                      Lembrar pendentes
                    </Button>
                  )}
                </div>
                <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50">
                        {["Creator", "Contato", "Status", "Data de aceite", "Versão"].map((h) => (
                          <th key={h} className="py-2.5 px-4 text-xs font-medium text-zinc-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {briefing.acceptances?.map((a) => {
                        const creator = CREATORS.find((item) => item.id === a.creatorId)
                        return (
                        <tr key={a.creatorId} className="border-t border-zinc-100">
                          <td className="py-2.5 px-4 text-sm font-medium text-zinc-900">{a.creatorName}</td>
                          <td className="py-2.5 px-4">
                            {creator ? <CreatorContact email={creator.email} phone={creator.phone} /> : <span className="text-xs text-zinc-300">—</span>}
                          </td>
                          <td className="py-2.5 px-4"><AcceptancePill status={a.status} /></td>
                          <td className="py-2.5 px-4 text-xs text-zinc-500">{a.acceptedAt ?? "—"}</td>
                          <td className="py-2.5 px-4 text-xs text-zinc-500">v{a.version}</td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            )}

            {/* VERSIONS TAB */}
            <TabsContent value="versions" className="pb-6">
              <div className="space-y-3">
                {[...briefing.versions].reverse().map((v) => (
                  <div key={v.version} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200">
                    <div className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      v{v.version}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-zinc-800">{v.summary}</p>
                        <span className="text-xs text-zinc-400 shrink-0">{v.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-zinc-400">Por {v.createdBy}</p>
                        {v.requiresReAcceptance && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                            Re-aceite exigido
                          </span>
                        )}
                      </div>
                    </div>
                    {v.version !== briefing.currentPublishedVersion && (
                      <button className="text-xs text-zinc-500 hover:text-zinc-800 shrink-0">Restaurar</button>
                    )}
                    {v.version === briefing.currentPublishedVersion && (
                      <span className="text-xs text-emerald-600 font-medium shrink-0">Atual</span>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {showPublishDialog && (
        <PublishDialog
          briefing={briefing}
          onClose={() => setShowPublishDialog(false)}
          onPublish={handlePublish}
        />
      )}
    </>
  )
}

export default function BriefingPage() {
  const user = useAuthStore((s) => s.user)
  const briefings = useBriefingStore((s) => s.briefings)
  const all = briefings.filter((b) => b.organizationId === user?.organizationId)
  const brandBriefings = all.filter((b) => b.type === "brand")
  const campaignBriefings = all.filter((b) => b.type === "campaign")
  const [selected, setSelected] = useState<Briefing | null>(null)

  const totalPending = campaignBriefings.reduce(
    (sum, b) => sum + (b.acceptances?.filter((a) => a.status !== "accepted").length ?? 0),
    0
  )

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Briefings"
        subtitle={`${all.length} briefings · ${brandBriefings.length} de marca · ${campaignBriefings.length} de campanha`}
        actions={
          <Button size="sm" className="gap-2">
            <Plus size={14} /> Novo briefing
          </Button>
        }
      />

      <div className="p-6">
        {totalPending > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              <span className="font-semibold">{totalPending} aceites pendentes</span> em briefings de campanha.
            </span>
          </div>
        )}

        <Tabs defaultValue="campanha">
          <TabsList className="mb-4">
            <TabsTrigger value="marca">
              <BookOpen size={13} className="mr-1.5" />
              Marca
              <span className="ml-1.5 text-xs bg-zinc-200 text-zinc-700 rounded-full px-1.5 py-0.5">{brandBriefings.length}</span>
            </TabsTrigger>
            <TabsTrigger value="campanha">
              <FileText size={13} className="mr-1.5" />
              Campanhas
              <span className="ml-1.5 text-xs bg-zinc-200 text-zinc-700 rounded-full px-1.5 py-0.5">{campaignBriefings.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marca">
            {brandBriefings.length === 0 ? (
              <div className="text-center py-16 text-zinc-400">
                <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum briefing de marca criado ainda.</p>
                <Button size="sm" variant="outline" className="mt-3 gap-1.5">
                  <Plus size={13} /> Criar guia de marca
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {brandBriefings.map((b) => (
                  <BriefingCard key={b.id} briefing={b} onSelect={() => setSelected(b)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="campanha">
            {campaignBriefings.length === 0 ? (
              <div className="text-center py-16 text-zinc-400">
                <FileText size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum briefing de campanha criado ainda.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {campaignBriefings.map((b) => (
                  <BriefingCard key={b.id} briefing={b} onSelect={() => setSelected(b)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selected && <BriefingEditor briefing={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
