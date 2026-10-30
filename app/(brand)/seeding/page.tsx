"use client"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"
import { useSeedingStore } from "@/lib/stores/seeding"
import { useAuthStore } from "@/lib/stores/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Package, Users, TrendingUp, Gift } from "lucide-react"
import type { SeedingCampaign, SeedingStatus } from "@/lib/mock-data/seeding"

const STATUS_COLORS: Record<SeedingStatus, string> = {
  ativa: "bg-zinc-900 text-white",
  rascunho: "bg-zinc-200 text-zinc-700",
  encerrada: "bg-zinc-100 text-zinc-500",
  pausada: "bg-yellow-100 text-yellow-700",
}

const STATUS_LABEL: Record<SeedingStatus, string> = {
  ativa: "Ativa",
  rascunho: "Rascunho",
  encerrada: "Encerrada",
  pausada: "Pausada",
}

function giftToPostRate(campaign: SeedingCampaign) {
  const sent = campaign.creators.filter((c) =>
    ["enviado", "entregue", "postou", "nao_postou"].includes(c.status)
  ).length
  const posted = campaign.creators.filter((c) => c.status === "postou").length
  if (sent === 0) return null
  return Math.round((posted / sent) * 100)
}

function totalReach(campaign: SeedingCampaign) {
  return campaign.creators.reduce((sum, c) => sum + (c.postViews ?? 0), 0)
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

function CampaignRow({ c }: { c: SeedingCampaign }) {
  const router = useRouter()
  const posted = c.creators.filter((cr) => cr.status === "postou").length
  const rate = giftToPostRate(c)
  const reach = totalReach(c)
  const totalCost = c.creators
    .filter((cr) => cr.selectedProductId)
    .reduce((sum, cr) => {
      const prod = c.products.find((p) => p.id === cr.selectedProductId)
      return sum + (prod?.unitCost ?? 0)
    }, 0)

  function openCampaign() {
    router.push(`/seeding/${c.id}`)
  }

  return (
    <tr
      className="cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50"
      tabIndex={0}
      onClick={openCampaign}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          openCampaign()
        }
      }}
    >
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
            <Gift size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">{c.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {c.products.length} {c.products.length === 1 ? "produto" : "produtos"} · {c.creators.length} creators
            </p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
          {STATUS_LABEL[c.status]}
        </span>
      </td>
      <td className="py-3.5 px-4 text-sm text-zinc-700">
        {posted}/{c.creators.length}
      </td>
      <td className="py-3.5 px-4 text-sm">
        {rate !== null ? (
          <span className={`font-medium ${rate >= 40 ? "text-zinc-900" : rate >= 20 ? "text-yellow-600" : "text-red-500"}`}>
            {rate}%
          </span>
        ) : (
          <span className="text-zinc-300">—</span>
        )}
      </td>
      <td className="py-3.5 px-4 text-sm text-zinc-700">
        {reach > 0 ? fmt(reach) : <span className="text-zinc-300">—</span>}
      </td>
      <td className="py-3.5 px-4 text-sm text-zinc-700">
        {totalCost > 0 ? `R$ ${fmt(totalCost)}` : <span className="text-zinc-300">—</span>}
      </td>
      <td className="py-3.5 px-4">
        <span className="flex h-7 w-7 items-center justify-center text-zinc-400">
          <ArrowUpRight size={14} />
        </span>
      </td>
    </tr>
  )
}

export default function SeedingPage() {
  const campaigns = useSeedingStore((s) => s.campaigns)
  const user = useAuthStore((s) => s.user)
  const orgCampaigns = campaigns.filter((c) => c.organizationId === user?.organizationId)

  const totalCreators = orgCampaigns.reduce((sum, c) => sum + c.creators.length, 0)
  const totalPosted = orgCampaigns.reduce((s, c) => s + c.creators.filter((cr) => cr.status === "postou").length, 0)
  const totalReachAll = orgCampaigns.reduce((s, c) => s + totalReach(c), 0)

  const tabs = [
    { key: "all", label: "Todas", items: orgCampaigns },
    { key: "ativa", label: "Ativas", items: orgCampaigns.filter((c) => c.status === "ativa") },
    { key: "rascunho", label: "Rascunhos", items: orgCampaigns.filter((c) => c.status === "rascunho") },
    { key: "encerrada", label: "Encerradas", items: orgCampaigns.filter((c) => c.status === "encerrada") },
  ]

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Seeding"
        subtitle={`${orgCampaigns.length} ${orgCampaigns.length === 1 ? "campanha" : "campanhas"}`}
      />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Creators atingidos</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                <Users size={15} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">{totalCreators}</p>
            <p className="text-xs text-zinc-400 mt-1">{totalPosted} postaram</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Alcance orgânico</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                <TrendingUp size={15} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">{fmt(totalReachAll)}</p>
            <p className="text-xs text-zinc-400 mt-1">views acumulados</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Gift-to-post rate</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                <Package size={15} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {totalCreators > 0 ? `${Math.round((totalPosted / totalCreators) * 100)}%` : "—"}
            </p>
            <p className="text-xs text-zinc-400 mt-1">meta: 30–60%</p>
          </div>
        </div>

        {/* Campaigns table */}
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
                      {["Campanha", "Status", "Posts", "Gift-to-post", "Alcance", "Custo produto", ""].map((h) => (
                        <th key={h} className="py-2.5 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wide bg-zinc-50">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tab.items.map((c) => <CampaignRow key={c.id} c={c} />)}
                    {tab.items.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm text-zinc-400">
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
