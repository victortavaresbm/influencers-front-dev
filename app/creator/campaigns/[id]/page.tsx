"use client"
import { use, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"
import { CREATORS } from "@/lib/mock-data/creators"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useBriefingStore } from "@/lib/stores/briefings"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Check, X, Calendar, DollarSign, Users, Target, CheckCircle2, AlertTriangle, Clock, Link2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { CampaignTypeBadge } from "@/components/campaigns/campaign-type-badge"
import { campaignIsVisibleTo, creatorCanApply } from "@/lib/campaign-access"
import { formatSuccessTarget, readSuccessTargets, successMetricById } from "@/lib/success-metrics"
import { formatDateBR, formatDateRangeBR } from "@/lib/dates"
import { ContentCalendar } from "@/components/calendar/content-calendar"
import { buildSchedule } from "@/lib/schedule"

export default function CreatorCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const creator = CREATORS.find((c) => c.email === user?.email) ?? CREATORS[0]
  const campaigns = useCampaignStore((s) => s.campaigns)
  const campaign = campaigns.find((c) => c.id === id)
  const briefing = useBriefingStore((s) => s.briefings.find((b) => b.id === campaign?.briefingId) ?? s.briefings.find((b) => b.campaignId === id))
  const form = useFormStore((s) => s.forms.find((item) => item.id === campaign?.formId && item.status === "publicado"))
  const [applied, setApplied] = useState(false)
  const [briefingAccepted, setBriefingAccepted] = useState(false)
  const schedule = useMemo(
    () => buildSchedule(campaigns).filter((slot) => slot.campaignId === id && slot.creatorId === creator.id),
    [campaigns, id, creator.id],
  )

  if (!campaign || !campaignIsVisibleTo(campaign, creator.id, campaigns)) return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <p className="text-zinc-500">Campanha não encontrada.</p>
      <Button variant="outline" className="mt-4" onClick={() => router.push("/creator/campaigns")}>Voltar</Button>
    </div>
  )

  const participant = campaign.participants.find((p) => p.creatorId === creator.id)
  const isParticipant = !!participant
  const canApply = creatorCanApply(campaign, creator.id, campaigns) && !applied
  const myAcceptance = briefing?.acceptances?.find((a) => a.creatorId === creator.id)
  const needsAcceptance = isParticipant && briefing?.status === "publicado" && myAcceptance && myAcceptance.status !== "accepted" && !briefingAccepted
  const successTargets = readSuccessTargets(campaign.successTargets).filter((item) => item.target > 0)

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title={campaign.name}
        subtitle={campaign.organizationName}
        leading={
          <Link href="/creator/campaigns">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft size={14} /> Voltar
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-4 max-w-3xl mx-auto w-full">
        {/* Header card */}
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold shrink-0">
                {campaign.organizationName.slice(0, 2)}
              </div>
              <div>
                <p className="text-xs text-zinc-400">{campaign.organizationName}</p>
                <CampaignTypeBadge type={campaign.type} className="mt-1" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400">Período</p>
              <p className="text-sm font-medium text-zinc-800">{formatDateRangeBR(campaign.startDate, campaign.endDate)}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: "Orçamento", value: `R$ ${(campaign.budget / 1000).toFixed(0)}k`, icon: DollarSign },
              { label: "Creators", value: campaign.participants.length, icon: Users },
              { label: "Min. seguidores", value: `${(campaign.minFollowers / 1000).toFixed(0)}k`, icon: Target },
              { label: "Min. engajamento", value: `${campaign.minEngagement}%`, icon: Target },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-lg font-semibold text-zinc-900">{value}</p>
                <p className="text-xs text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
          {successTargets.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-zinc-500">Metas de sucesso</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {successTargets.map((item) => {
                  const metric = successMetricById(item.metric)
                  if (!metric) return null
                  return (
                    <div key={item.metric} className="rounded-xl border border-zinc-200 px-3 py-2 text-left">
                      <p className="text-xs text-zinc-400">{metric.label}</p>
                      <p className="text-sm font-semibold text-zinc-900">{formatSuccessTarget(metric, item.target)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Apply button */}
        {!isParticipant && (
          <Card className="p-4 border-zinc-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {applied ? "Candidatura enviada!" : canApply ? "Interessado nesta campanha?" : "Campanha não disponível para candidatura"}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {applied ? "A marca receberá seu perfil em breve." : canApply ? "Envie sua candidatura e aguarde o contato da marca." : "Esta campanha não está aceitando candidaturas no momento."}
                </p>
              </div>
              {canApply && !applied && form && (
                <Link href={`/creator/apply/${form.id}?return=/creator/campaigns/${campaign.id}`}>
                  <Button>{t("forms.apply")}</Button>
                </Link>
              )}
              {canApply && !applied && !form && (
                <Button onClick={() => setApplied(true)}>
                  {t("forms.apply")}
                </Button>
              )}
              {applied && (
                <span className="flex items-center gap-1.5 text-sm text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-full">
                  <Check size={14} /> Enviado
                </span>
              )}
            </div>
          </Card>
        )}

        {isParticipant && (
          <Card className="p-4 bg-zinc-900 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Você está nesta campanha</p>
                <p className="text-xs text-zinc-300 mt-0.5">Fee: R$ {participant?.fee.toLocaleString("pt-BR")}</p>
              </div>
              <span className="text-xs bg-white text-zinc-900 px-3 py-1 rounded-full font-semibold capitalize">
                {participant?.status}
              </span>
            </div>
          </Card>
        )}

        <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="briefing">Briefing</TabsTrigger>
            <TabsTrigger value="deliverables">Entregáveis</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4 space-y-4">
            <Card className="p-4 space-y-3">
              <div>
                <p className="text-xs text-zinc-400 mb-1">Descrição</p>
                <p className="text-sm text-zinc-700">{campaign.description}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-zinc-400 mb-1">Objetivo</p>
                <p className="text-sm text-zinc-700">{campaign.objective}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-zinc-400 mb-2">Nichos-alvo</p>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.targetNiches.map((n) => <Badge key={n} variant="outline" className="text-xs capitalize">{n}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-2">Hashtags obrigatórias</p>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.mandatoryHashtags.map((h) => <Badge key={h} variant="outline" className="text-xs">{h}</Badge>)}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="briefing" className="mt-4 space-y-3">
            {briefing ? (
              <>
                {/* Acceptance banner */}
                {needsAcceptance && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    {myAcceptance?.status === "re_acceptance_required"
                      ? <RefreshCw size={15} className="text-amber-600 shrink-0 mt-0.5" />
                      : <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900">
                        {myAcceptance?.status === "re_acceptance_required"
                          ? "Briefing atualizado — novo aceite necessário"
                          : "Leia o briefing e confirme seu aceite"}
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Você precisa aceitar antes de publicar qualquer conteúdo desta campanha.
                      </p>
                    </div>
                    <Button size="sm" className="shrink-0 h-8 text-xs" onClick={() => setBriefingAccepted(true)}>
                      <CheckCircle2 size={12} className="mr-1" /> Aceitar
                    </Button>
                  </div>
                )}
                {(briefingAccepted || myAcceptance?.status === "accepted") && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <CheckCircle2 size={13} />
                    {briefingAccepted ? "Briefing aceito agora" : `Aceito em ${myAcceptance?.acceptedAt} · v${myAcceptance?.version}`}
                  </div>
                )}

                {/* Brand briefing reference */}
                {briefing.brandBriefingTitle && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-600">
                    <Link2 size={13} className="text-zinc-400 shrink-0" />
                    Complementa: <span className="font-medium text-zinc-800">{briefing.brandBriefingTitle}</span>
                  </div>
                )}

                <Card className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1.5">Objetivo</h3>
                    <p className="text-sm text-zinc-700 leading-relaxed">{briefing.objective}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1.5">Público-alvo</h3>
                    <p className="text-sm text-zinc-700 leading-relaxed">{briefing.targetAudience}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1.5">Tom de voz</h3>
                    <p className="text-sm text-zinc-700 leading-relaxed">{briefing.toneOfVoice}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1.5">Mensagens-chave</h3>
                    <ul className="space-y-1">
                      {briefing.keyMessages.map((m) => (
                        <li key={m} className="flex items-start gap-1.5 text-sm text-zinc-700">
                          <span className="text-zinc-400 mt-0.5 shrink-0">›</span> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <h3 className="text-xs font-semibold text-emerald-700 mb-2">✅ Pode fazer</h3>
                      <ul className="space-y-1.5">
                        {briefing.doList.map((item) => (
                          <li key={item} className="text-xs text-emerald-800 leading-snug">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                      <h3 className="text-xs font-semibold text-red-700 mb-2">❌ Não pode fazer</h3>
                      <ul className="space-y-1.5">
                        {briefing.dontList.map((item) => (
                          <li key={item} className="text-xs text-red-800 leading-snug">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1.5">Elementos obrigatórios</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {briefing.mandatoryElements.map((e) => (
                        <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-sm text-zinc-400">Briefing disponível após seleção.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="deliverables" className="mt-4">
            {briefing?.deliverables ? (
              <div className="space-y-3">
                {briefing.deliverables.map((d, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-zinc-900">{d.type} × {d.quantity}</p>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Calendar size={11} />
                        Prazo: {formatDateBR(d.deadline)}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">{d.notes}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-sm text-zinc-400">Entregáveis disponíveis após seleção.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <ContentCalendar slots={schedule} audience="creator" campaignId={campaign.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
