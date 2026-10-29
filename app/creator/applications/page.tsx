"use client"
import { TopBar } from "@/components/layout/top-bar"
import { CAMPAIGNS } from "@/lib/mock-data/campaigns"
import { CREATORS } from "@/lib/mock-data/creators"
import { useAuthStore } from "@/lib/stores/auth"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowUpRight, Calendar, DollarSign } from "lucide-react"
import { CouponTicket } from "@/components/ui/coupon-ticket"
import { useI18n } from "@/lib/i18n"
import { formatDateRangeBR } from "@/lib/dates"

const PARTICIPANT_STATUS_LABELS: Record<string, string> = {
  convidado: "Convidado",
  candidato: "Em análise",
  selecionado: "Selecionado ✓",
  recusado: "Recusado",
  entregue: "Concluído",
}

const PARTICIPANT_STATUS_COLORS: Record<string, string> = {
  convidado: "bg-zinc-100 text-zinc-600",
  candidato: "bg-yellow-50 text-yellow-700",
  selecionado: "bg-zinc-900 text-white",
  recusado: "bg-red-50 text-red-700",
  entregue: "bg-green-50 text-green-700",
}

export default function ApplicationsPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const creator = CREATORS.find((c) => c.email === user?.email) ?? CREATORS[0]

  const applications = CAMPAIGNS.flatMap((c) =>
    c.participants
      .filter((p) => p.creatorId === creator.id)
      .map((p) => ({ campaign: c, participant: p }))
  )

  const tabs = [
    { key: "all", label: "Todas", items: applications },
    { key: "candidato", label: "Em análise", items: applications.filter((a) => a.participant.status === "candidato") },
    { key: "selecionado", label: "Selecionado", items: applications.filter((a) => a.participant.status === "selecionado") },
    { key: "convidado", label: "Convidados", items: applications.filter((a) => a.participant.status === "convidado") },
    { key: "entregue", label: "Concluídos", items: applications.filter((a) => a.participant.status === "entregue") },
  ]

  return (
    <div className="flex flex-col flex-1">
      <TopBar title={t("pages.applications")} subtitle={t("pages.applicationsCount", { count: applications.length })} />

      <div className="p-6">
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            {tabs.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
                {t.items.length > 0 && (
                  <span className="ml-1.5 text-xs bg-zinc-200 text-zinc-700 rounded-full px-1.5 py-0.5">
                    {t.items.length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              {tab.items.length === 0 ? (
                <div className="py-16 text-center text-sm text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                  Nenhuma candidatura nesta categoria.
                </div>
              ) : (
                <div className="space-y-3">
                  {tab.items.map(({ campaign, participant }) => (
                    <Card key={campaign.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {campaign.organizationName.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <p className="text-sm font-semibold text-zinc-900">{campaign.name}</p>
                              <p className="text-xs text-zinc-400 mt-0.5">{campaign.organizationName}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${PARTICIPANT_STATUS_COLORS[participant.status]}`}>
                              {PARTICIPANT_STATUS_LABELS[participant.status]}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                              <Calendar size={11} />
                              <span>{formatDateRangeBR(campaign.startDate, campaign.endDate)}</span>
                            </div>
                            {participant.fee > 0 && (
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <DollarSign size={11} />
                                <span>R$ {participant.fee.toLocaleString("pt-BR")}</span>
                              </div>
                            )}
                          </div>

                          {participant.status === "selecionado" && participant.couponCode && (
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="mb-1 text-xs text-zinc-400">Seu cupom</p>
                                <CouponTicket code={participant.couponCode} size="md" />
                              </div>
                              {participant.trackingLink && (
                                <div>
                                  <p className="text-xs text-zinc-400">Link de rastreio</p>
                                  <code className="text-xs font-mono text-zinc-700">{participant.trackingLink}</code>
                                </div>
                              )}
                            </div>
                          )}

                          {participant.status === "recusado" && (
                            <p className="mt-2 text-xs text-red-600">
                              Infelizmente sua candidatura não foi selecionada desta vez.
                            </p>
                          )}
                        </div>
                        <Link href={`/creator/campaigns/${campaign.id}`} className="shrink-0">
                          <div className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
                            <ArrowUpRight size={14} />
                          </div>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
