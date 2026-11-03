"use client"
import { use, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"
import { CREATORS } from "@/lib/mock-data/creators"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Check, DollarSign, Users, Target } from "lucide-react"
import Link from "next/link"
import { CampaignTypeBadge } from "@/components/campaigns/campaign-type-badge"
import { campaignIsVisibleTo, creatorCanApply } from "@/lib/campaign-access"
import { formatSuccessTarget, readSuccessTargets, successMetricById } from "@/lib/success-metrics"
import { formatDateRangeBR } from "@/lib/dates"
import { ContentCalendar } from "@/components/calendar/content-calendar"
import { GuidelineLists, cleanGuidelines } from "@/components/campaigns/guideline-list"
import { CouponTicket } from "@/components/ui/coupon-ticket"
import { MembershipBadge } from "@/components/members/membership-badge"
import { MEMBERSHIP_ROLE_HELP } from "@/lib/membership"
import { membershipRoleOf, trackedSale, useMembershipStore } from "@/lib/stores/membership"
import { buildSchedule } from "@/lib/schedule"

export default function CreatorCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const creator = CREATORS.find((c) => c.email === user?.email) ?? CREATORS[0]
  const roles = useMembershipStore((state) => state.roles)
  const role = membershipRoleOf(creator.id, roles)
  const affiliate = role === "affiliate"
  const campaigns = useCampaignStore((s) => s.campaigns)
  const campaign = campaigns.find((c) => c.id === id)
  const form = useFormStore((s) => s.forms.find((item) => item.id === campaign?.formId && item.status === "publicado"))
  const [applied, setApplied] = useState(false)
  const schedule = useMemo(
    () => buildSchedule(campaigns).filter((slot) => slot.campaignId === id && slot.creatorId === creator.id),
    [campaigns, id, creator.id, roles],
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
  const guidelines = cleanGuidelines(campaign.doList)
  const restrictions = cleanGuidelines(campaign.dontList)
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
                <Link href={form.site ? `/lp/${form.id}` : `/creator/apply/${form.id}?return=/creator/campaigns/${campaign.id}`}>
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
                <p className="text-xs text-zinc-300 mt-0.5">
                  {affiliate
                    ? MEMBERSHIP_ROLE_HELP.affiliate
                    : `Fee: R$ ${participant?.fee.toLocaleString("pt-BR")}`}
                </p>
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
            <TabsTrigger value="guidelines">Orientações</TabsTrigger>
            {affiliate && <TabsTrigger value="sales">Vendas</TabsTrigger>}
            {!affiliate && <TabsTrigger value="deliverables">Entregáveis</TabsTrigger>}
            {!affiliate && <TabsTrigger value="calendar">Calendário</TabsTrigger>}
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

          <TabsContent value="guidelines" className="mt-4">
            {guidelines.length > 0 || restrictions.length > 0 ? (
              <Card className="p-5">
                <GuidelineLists doList={guidelines} dontList={restrictions} />
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-sm text-zinc-400">Esta campanha ainda não tem orientações.</p>
              </Card>
            )}
          </TabsContent>

          {affiliate && (
            <TabsContent value="sales" className="mt-4">
              <Card className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <MembershipBadge role={role} />
                  <p className="text-sm text-zinc-600">{MEMBERSHIP_ROLE_HELP.affiliate}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-zinc-400">Cupom</p>
                  {participant?.couponCode ? (
                    <CouponTicket code={participant.couponCode} className="mt-2" />
                  ) : (
                    <p className="mt-1 text-sm text-zinc-500">A marca ainda não vinculou um cupom.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-400">Vendas do cupom</p>
                    <p className="mt-1 text-base font-semibold text-zinc-900">
                      R$ {trackedSale(creator.id, participant?.revenue, participant?.couponCode, roles).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-400">Pedidos</p>
                    <p className="mt-1 text-base font-semibold text-zinc-900">{participant?.couponCode ? participant.orders ?? 0 : "—"}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}

          {!affiliate && <>
          <TabsContent value="deliverables" className="mt-4">
            {participant?.deliverables.length ? (
              <div className="space-y-3">
                {participant.deliverables.map((item, index) => (
                  <Card key={`${item.type}-${index}`} className="p-4">
                    <p className="text-sm font-semibold text-zinc-900">{item.type.replaceAll("_", " ")} × {item.quantity}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-sm text-zinc-400">Entregáveis disponíveis após a seleção.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <ContentCalendar slots={schedule} audience="creator" campaignId={campaign.id} />
          </TabsContent>
          </>}
        </Tabs>
      </div>
    </div>
  )
}
