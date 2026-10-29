"use client"
import { useState } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { useAuthStore } from "@/lib/stores/auth"
import { type Briefing } from "@/lib/mock-data/briefings"
import { useBriefingStore } from "@/lib/stores/briefings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen, FileText, Link2, Clock, CheckCircle2, AlertTriangle, RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Creator IDs mapped to user accounts (u4=c1/Bianca, u5=c5/Pedro, u6=c3/Carolina)
const USER_CREATOR_MAP: Record<string, string> = {
  u4: "c1",
  u5: "c5",
  u6: "c3",
}

function getMyAcceptance(briefing: Briefing, creatorId: string) {
  return briefing.acceptances?.find((a) => a.creatorId === creatorId)
}

function BriefingReadView({
  briefing,
  creatorId,
  onAccept,
  onClose,
}: {
  briefing: Briefing
  creatorId: string
  onAccept: () => void
  onClose: () => void
}) {
  const acceptance = getMyAcceptance(briefing, creatorId)
  const needsAcceptance =
    briefing.type === "campaign" &&
    briefing.status === "publicado" &&
    acceptance &&
    acceptance.status !== "accepted"

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto p-0 sm:max-w-xl w-full">
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 z-10">
          <SheetHeader className="p-0">
            <div className="flex items-start gap-3 pr-8">
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                briefing.type === "brand" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
              )}>
                {briefing.type === "brand"
                  ? <BookOpen size={16} />
                  : <FileText size={16} />
                }
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-base leading-tight">{briefing.title}</SheetTitle>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {briefing.type === "campaign" ? briefing.campaignName : briefing.scope}
                </p>
              </div>
            </div>
          </SheetHeader>

          {needsAcceptance && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 flex-1">
                {acceptance?.status === "re_acceptance_required"
                  ? "O briefing foi atualizado. Leia as mudanças e confirme o aceite."
                  : "Leia o briefing completo e confirme que entendeu os requisitos."}
              </p>
              <Button size="sm" className="text-xs shrink-0 h-7" onClick={onAccept}>
                <CheckCircle2 size={12} className="mr-1" /> Aceitar
              </Button>
            </div>
          )}

          {acceptance?.status === "accepted" && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <CheckCircle2 size={13} /> Aceito em {acceptance.acceptedAt} · v{acceptance.version}
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {briefing.type === "campaign" && briefing.brandBriefingTitle && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-600">
              <Link2 size={13} className="text-zinc-400 shrink-0" />
              <span>Complementa: <span className="font-medium text-zinc-800">{briefing.brandBriefingTitle}</span></span>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Objetivo</h3>
            <p className="text-sm text-zinc-700 leading-relaxed">{briefing.objective}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Público-alvo</h3>
            <p className="text-sm text-zinc-700 leading-relaxed">{briefing.targetAudience}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Tom de voz</h3>
            <p className="text-sm text-zinc-700 leading-relaxed">{briefing.toneOfVoice}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Mensagens-chave</h3>
            <ul className="space-y-1.5">
              {briefing.keyMessages.map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm text-zinc-700">
                  <span className="text-zinc-400 mt-0.5 shrink-0">›</span> {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3">
              <h3 className="text-xs font-semibold text-emerald-700 mb-2">✅ Pode fazer</h3>
              <ul className="space-y-1.5">
                {briefing.doList.map((m) => (
                  <li key={m} className="text-xs text-emerald-800 leading-snug">{m}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <h3 className="text-xs font-semibold text-red-700 mb-2">❌ Não pode fazer</h3>
              <ul className="space-y-1.5">
                {briefing.dontList.map((m) => (
                  <li key={m} className="text-xs text-red-800 leading-snug">{m}</li>
                ))}
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

          {briefing.type === "campaign" && briefing.deliverables && briefing.deliverables.length > 0 && (
            <div>
              <Separator className="mb-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Entregáveis</h3>
              <div className="space-y-2">
                {briefing.deliverables.map((d, i) => (
                  <div key={i} className="p-3 rounded-xl border border-zinc-200 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-zinc-900">{d.type} × {d.quantity}</p>
                      <span className="text-xs text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full">
                        Prazo: {d.deadline}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">{d.notes}</p>
                  </div>
                ))}
              </div>
              {briefing.publicationWindow && (
                <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
                  <Clock size={10} /> Janela de publicação: {briefing.publicationWindow}
                </p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function BriefingRow({
  briefing,
  acceptance,
  onSelect,
}: {
  briefing: Briefing
  acceptance?: ReturnType<typeof getMyAcceptance>
  onSelect: () => void
}) {
  const isPending = acceptance?.status === "pending"
  const isReAcceptance = acceptance?.status === "re_acceptance_required"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex h-full flex-col gap-3 rounded-xl border p-4 text-left transition-colors",
        isPending || isReAcceptance
          ? "border-amber-200 bg-amber-50 hover:border-amber-300"
          : "border-zinc-200 bg-white hover:border-zinc-400"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          briefing.type === "brand" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
        )}>
          {briefing.type === "brand"
            ? <BookOpen size={15} />
            : <FileText size={15} />
          }
        </div>
        {isPending && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            <Clock size={10} /> Pendente
          </span>
        )}
        {isReAcceptance && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            <RefreshCw size={10} /> Novo aceite
          </span>
        )}
        {acceptance?.status === "accepted" && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={11} /> Aceito
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-900">{briefing.title}</p>
        <p className="mt-1 text-xs font-medium text-zinc-600">
          {briefing.type === "campaign" ? briefing.campaignName : briefing.scope}
        </p>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-700">{briefing.objective}</p>
      </div>
    </button>
  )
}

export default function CreatorBriefingsPage() {
  const user = useAuthStore((s) => s.user)
  const creatorId = USER_CREATOR_MAP[user?.id ?? ""] ?? ""
  const [selected, setSelected] = useState<Briefing | null>(null)
  const [accepted, setAccepted] = useState<Set<string>>(new Set())

  const briefings = useBriefingStore((s) => s.briefings)
  const relevantBriefings = briefings.filter((b) => {
    if (b.status !== "publicado") return false
    if (b.type === "campaign") {
      return b.acceptances?.some((a) => a.creatorId === creatorId)
    }
    return true
  })

  const pendingBriefings = relevantBriefings.filter((b) => {
    if (b.type !== "campaign") return false
    const a = getMyAcceptance(b, creatorId)
    return a && a.status !== "accepted" && !accepted.has(b.id)
  })

  const acceptedBriefings = relevantBriefings.filter((b) => {
    if (b.type === "campaign") {
      const a = getMyAcceptance(b, creatorId)
      return a?.status === "accepted" || accepted.has(b.id)
    }
    return false
  })

  const brandBriefings = relevantBriefings.filter((b) => b.type === "brand")

  const handleAccept = () => {
    if (selected) {
      setAccepted((prev) => new Set([...prev, selected.id]))
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Briefings"
        subtitle={
          pendingBriefings.length > 0
            ? `${pendingBriefings.length} aguardando aceite`
            : "Todos os aceites em dia"
        }
      />

      <div className="p-6">
        {pendingBriefings.length > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              <span className="font-semibold">{pendingBriefings.length} briefing{pendingBriefings.length > 1 ? "s" : ""}</span>
              {" "}aguardando seu aceite.
            </span>
          </div>
        )}

        <Tabs defaultValue={pendingBriefings.length > 0 ? "pendentes" : "aceitos"}>
          <TabsList className="mb-4">
            <TabsTrigger value="pendentes">
              Pendentes
              {pendingBriefings.length > 0 && (
                <span className="ml-1.5 h-4 min-w-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold px-1">
                  {pendingBriefings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="aceitos">
              Aceitos
              <span className="ml-1.5 text-xs bg-zinc-200 text-zinc-700 rounded-full px-1.5 py-0.5">{acceptedBriefings.length}</span>
            </TabsTrigger>
            <TabsTrigger value="marca">
              Guias de marca
              <span className="ml-1.5 text-xs bg-zinc-200 text-zinc-700 rounded-full px-1.5 py-0.5">{brandBriefings.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes">
            {pendingBriefings.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-400" />
                <p className="text-sm text-zinc-600">Nenhum briefing pendente. Tudo certo!</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pendingBriefings.map((b) => (
                  <BriefingRow
                    key={b.id}
                    briefing={b}
                    acceptance={getMyAcceptance(b, creatorId)}
                    onSelect={() => setSelected(b)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="aceitos">
            {acceptedBriefings.length === 0 ? (
              <div className="py-16 text-center text-zinc-600">
                <FileText size={32} className="mx-auto mb-3 text-zinc-500" />
                <p className="text-sm">Nenhum briefing aceito ainda.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {acceptedBriefings.map((b) => (
                  <BriefingRow
                    key={b.id}
                    briefing={b}
                    acceptance={accepted.has(b.id)
                      ? { creatorId, creatorName: user?.name ?? "", status: "accepted", acceptedAt: "hoje", version: b.currentPublishedVersion ?? 1 }
                      : getMyAcceptance(b, creatorId)}
                    onSelect={() => setSelected(b)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="marca">
            {brandBriefings.length === 0 ? (
              <div className="py-16 text-center text-zinc-600">
                <BookOpen size={32} className="mx-auto mb-3 text-zinc-500" />
                <p className="text-sm">Nenhum guia de marca disponível.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {brandBriefings.map((b) => (
                  <BriefingRow key={b.id} briefing={b} onSelect={() => setSelected(b)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selected && (
        <BriefingReadView
          briefing={selected}
          creatorId={creatorId}
          onAccept={() => { handleAccept(); setSelected(null) }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
