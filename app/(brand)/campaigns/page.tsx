"use client"
import Link from "next/link"
import { TopBar } from "@/components/layout/top-bar"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useAuthStore } from "@/lib/stores/auth"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ArrowUpRight } from "lucide-react"
import { CampaignAgentEntry } from "@/components/campaigns/campaign-agent"
import { CampaignTypeBadge } from "@/components/campaigns/campaign-type-badge"
import type { CampaignStatus } from "@/lib/mock-data/campaigns"
import { campaignStatusKey, useI18n } from "@/lib/i18n"
import { visibilityLabel } from "@/lib/campaign-access"
import { formatDateRangeBR } from "@/lib/dates"

const STATUS_COLORS: Record<CampaignStatus, string> = {
  em_execucao: "bg-zinc-900 text-white",
  aberta: "bg-zinc-700 text-white",
  rascunho: "bg-zinc-200 text-zinc-700",
  concluida: "bg-zinc-100 text-zinc-600",
  cancelada: "bg-red-100 text-red-700",
  arquivada: "bg-zinc-50 text-zinc-400",
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

export default function CampaignsPage() {
  const { t } = useI18n()
  const campaigns = useCampaignStore((s) => s.campaigns)
  const user = useAuthStore((s) => s.user)
  const orgCampaigns = campaigns.filter((c) => c.organizationId === user?.organizationId)

  const tabs = [
    { key: "all", label: "Todas", items: orgCampaigns },
    { key: "em_execucao", label: "Em execução", items: orgCampaigns.filter((c) => c.status === "em_execucao") },
    { key: "aberta", label: "Abertas", items: orgCampaigns.filter((c) => c.status === "aberta") },
    { key: "rascunho", label: "Rascunhos", items: orgCampaigns.filter((c) => c.status === "rascunho") },
    { key: "concluida", label: "Concluídas", items: orgCampaigns.filter((c) => c.status === "concluida") },
  ]

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title={t("nav.campaigns")}
        subtitle={t("pages.campaignsCount", { count: orgCampaigns.length })}
        actions={
          <Link href="/campaigns/create">
            <Button size="sm" className="gap-2">
              <Plus size={14} /> {t("pages.newCampaign")}
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <CampaignAgentEntry />
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            {tabs.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
                <span className="ml-1.5 text-xs bg-zinc-200 text-zinc-700 rounded-full px-1.5 py-0.5">
                  {t.items.length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
                <table className="w-full text-left">
                  <thead className="border-b border-zinc-200">
                    <tr>
                      {["Campanha", "Tipo", "Creators", "Orçamento", "Gasto", "ROI", "Status", ""].map((h) => (
                        <th key={h} className="py-2.5 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wide bg-zinc-50">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tab.items.map((c) => (
                      <tr key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                              {c.coverImage ? (
                                <img
                                  src={c.coverImage}
                                  alt={c.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500">
                                  {c.organizationName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900">{c.name}</p>
                              <p className="text-xs text-zinc-400">
                                {formatDateRangeBR(c.startDate, c.endDate, "Datas a definir")}
                                {" · "}
                                {visibilityLabel(c.visibility)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <CampaignTypeBadge type={c.type} />
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-700">
                          {c.participants.length}
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-700">
                          R$ {fmt(c.budget)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-zinc-700">R$ {fmt(c.budgetSpent)}</p>
                            {c.budget > 0 && (
                              <div className="w-16 h-1 bg-zinc-200 rounded mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-zinc-900 rounded"
                                  style={{ width: `${Math.min((c.budgetSpent / c.budget) * 100, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {c.roi !== undefined ? (
                            <span className="font-medium text-zinc-900">{c.roi}%</span>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
                            {t(campaignStatusKey(c.status))}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/campaigns/${c.id}`}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                          >
                            <ArrowUpRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {tab.items.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-sm text-zinc-400">
                          Nenhuma campanha nesta categoria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
