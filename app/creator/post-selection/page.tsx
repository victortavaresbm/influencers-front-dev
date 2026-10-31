"use client"
import { TopBar } from "@/components/layout/top-bar"
import { CAMPAIGNS } from "@/lib/mock-data/campaigns"
import { CREATORS } from "@/lib/mock-data/creators"
import { useAuthStore } from "@/lib/stores/auth"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check } from "lucide-react"
import { GuidelineLists, cleanGuidelines } from "@/components/campaigns/guideline-list"
import { CouponTicket } from "@/components/ui/coupon-ticket"
import { useI18n } from "@/lib/i18n"

const CHECKLIST_ITEMS = [
  { id: "read_guidelines", label: "Ler o que pode e o que não pode fazer", done: true },
  { id: "accept_terms", label: "Aceitar os termos da campanha", done: true },
  { id: "create_content", label: "Criar os conteúdos", done: false },
  { id: "submit_review", label: "Enviar para revisão (se aplicável)", done: false },
  { id: "publish_content", label: "Publicar os conteúdos nos prazos", done: false },
  { id: "add_hashtags", label: "Incluir hashtags e menções obrigatórias", done: false },
  { id: "track_performance", label: "Acompanhar performance e reportar", done: false },
]

export default function PostSelectionPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const creator = CREATORS.find((c) => c.email === user?.email) ?? CREATORS[0]

  const activeCampaigns = CAMPAIGNS.filter((c) =>
    c.participants.some((p) => p.creatorId === creator.id && (p.status === "selecionado" || p.status === "entregue"))
  )

  const doneTasks = CHECKLIST_ITEMS.filter((i) => i.done).length
  const totalTasks = CHECKLIST_ITEMS.length

  return (
    <div className="flex flex-col flex-1">
      <TopBar title={t("pages.postSelection")} subtitle={t("pages.postSelectionSub")} />

      <div className="p-6 space-y-4">
        {activeCampaigns.length === 0 ? (
          <div className="py-20 text-center text-sm text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
            Você ainda não foi selecionado para nenhuma campanha.
          </div>
        ) : (
          activeCampaigns.map((campaign) => {
            const participant = campaign.participants.find((p) => p.creatorId === creator.id)
            const delivered = participant?.postsDelivered ?? 0
            const total = participant?.deliverables.reduce((s, d) => s + d.quantity, 0) ?? 0

            return (
              <div key={campaign.id} className="space-y-4">
                {/* Campaign header */}
                <Card className="p-4 bg-zinc-900 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{campaign.name}</p>
                      <p className="text-xs text-zinc-300 mt-0.5">{campaign.organizationName}</p>
                    </div>
                    <Badge className="bg-white text-zinc-900 text-xs">
                      {participant?.status === "entregue" ? "Concluído" : "Em andamento"}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-base font-semibold">{delivered}/{total}</p>
                      <p className="text-xs text-zinc-400">entregáveis</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold">R$ {participant?.fee.toLocaleString("pt-BR")}</p>
                      <p className="text-xs text-zinc-400">fee total</p>
                    </div>
                    <div className="flex flex-col items-center">
                      {participant?.couponCode ? (
                        <CouponTicket code={participant.couponCode} size="md" />
                      ) : (
                        <p className="text-base font-semibold">—</p>
                      )}
                      <p className="mt-1 text-xs text-zinc-400">seu cupom</p>
                    </div>
                  </div>
                  <Progress value={total > 0 ? (delivered / total) * 100 : 0} className="h-1 mt-3 bg-zinc-700 [&>div]:bg-white" />
                </Card>

                <Tabs defaultValue="checklist">
                  <TabsList>
                    <TabsTrigger value="checklist">Checklist ({doneTasks}/{totalTasks})</TabsTrigger>
                    <TabsTrigger value="deliverables">Entregáveis</TabsTrigger>
                    <TabsTrigger value="guidelines">Orientações</TabsTrigger>
                    <TabsTrigger value="commission">Comissão</TabsTrigger>
                  </TabsList>

                  <TabsContent value="checklist" className="mt-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-zinc-900">Checklist da campanha</h3>
                        <span className="text-xs text-zinc-500">{doneTasks}/{totalTasks} concluídos</span>
                      </div>
                      <Progress value={(doneTasks / totalTasks) * 100} className="h-1.5 mb-4" />
                      <div className="space-y-2">
                        {CHECKLIST_ITEMS.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 p-2.5 rounded-lg ${item.done ? "bg-zinc-50" : "bg-white border border-zinc-100"}`}
                          >
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-zinc-900" : "border-2 border-zinc-300"}`}>
                              {item.done && <Check size={10} className="text-white" />}
                            </div>
                            <p className={`text-sm ${item.done ? "text-zinc-400 line-through" : "text-zinc-800"}`}>
                              {item.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="deliverables" className="mt-4 space-y-3">
                    {participant?.deliverables.map((item, index) => (
                      <Card key={`${item.type}-${index}`} className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-zinc-900">
                            {item.type.replace(/_/g, " ")} × {item.quantity}
                          </p>
                          {index < delivered ? (
                            <Badge className="text-xs bg-green-50 text-green-700 border-green-200">Entregue</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Pendente</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="guidelines" className="mt-4">
                    {cleanGuidelines(campaign.doList).length > 0 || cleanGuidelines(campaign.dontList).length > 0 ? (
                      <Card className="p-5">
                        <GuidelineLists doList={cleanGuidelines(campaign.doList)} dontList={cleanGuidelines(campaign.dontList)} />
                      </Card>
                    ) : (
                      <Card className="p-8 text-center">
                        <p className="text-sm text-zinc-400">Esta campanha ainda não tem orientações.</p>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="commission" className="mt-4">
                    <Card className="p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-900">Resumo de comissão</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Fee contratado", value: `R$ ${participant?.fee.toLocaleString("pt-BR")}` },
                          { label: "Seu cupom", value: participant?.couponCode ?? "—" },
                          { label: "Cliques rastreados", value: participant?.clicks ? String(participant.clicks) : "—" },
                          { label: "Pedidos", value: participant?.orders ? String(participant.orders) : "—" },
                          { label: "Receita gerada", value: participant?.revenue ? `R$ ${participant.revenue.toLocaleString("pt-BR")}` : "—" },
                          { label: "Link de rastreio", value: participant?.trackingLink ?? "—" },
                        ].map(({ label, value }) => (
                          <div key={label} className="p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                            <p className="text-xs text-zinc-400">{label}</p>
                            {label === "Seu cupom" && participant?.couponCode ? (
                              <CouponTicket code={participant.couponCode} className="mt-1.5" />
                            ) : (
                              <p className="text-sm font-semibold text-zinc-900 mt-0.5">{value}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-400">
                        * O pagamento do fee ocorre conforme as condições acordadas com a marca.
                      </p>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
