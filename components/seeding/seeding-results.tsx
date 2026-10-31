"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotTracked } from "@/components/members/membership-badge"
import { memberTracksContent, useMembershipStore } from "@/lib/stores/membership"
import {
  BarChart3,
  DollarSign,
  Eye,
  Heart,
  MessageCircle,
  Target,
  TrendingUp,
} from "lucide-react"
import type { Campaign } from "@/lib/mock-data/campaigns"
import type { SeedingCampaign } from "@/lib/mock-data/seeding"
import { ROI_TOOLTIP, seedingRoi } from "@/lib/roi"

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return n.toString()
}

function currency(n: number) {
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function SeedingResults({ campaign }: { campaign: SeedingCampaign }) {
  const roles = useMembershipStore((state) => state.roles)
  const posted = campaign.creators.filter((creator) => creator.status === "postou" && memberTracksContent(creator.creatorId, roles))
  const sent = campaign.creators.filter((creator) =>
    ["enviado", "entregue", "postou", "nao_postou"].includes(creator.status)
  )

  const totalViews = posted.reduce((sum, creator) => sum + (creator.postViews ?? 0), 0)
  const totalLikes = posted.reduce((sum, creator) => sum + (creator.postLikes ?? 0), 0)
  const totalComments = posted.reduce((sum, creator) => sum + (creator.postComments ?? 0), 0)
  const totalSales = campaign.creators.reduce((sum, creator) => sum + (creator.couponSales ?? 0), 0)

  const totalProductCost = campaign.creators
    .filter((creator) => creator.selectedProductId)
    .reduce((sum, creator) => {
      const product = campaign.products.find((item) => item.id === creator.selectedProductId)
      return sum + (product?.unitCost ?? 0)
    }, 0)

  const roi = seedingRoi(campaign)
  const giftToPostRate = sent.length > 0 ? Math.round((posted.length / sent.length) * 100) : 0
  const cpp = posted.length > 0 ? Math.round(totalProductCost / posted.length) : 0
  const emv = Math.round(totalViews * 0.015 + totalLikes * 0.3 + totalComments * 1.2)

  const metrics = [
    { label: "Gift-to-post rate", value: `${giftToPostRate}%`, sub: "meta: 30–60%", icon: <Target size={16} />, highlight: giftToPostRate >= 30 },
    { label: "Alcance total", value: fmt(totalViews), sub: "views acumulados", icon: <Eye size={16} /> },
    { label: "Engajamento", value: fmt(totalLikes + totalComments), sub: `${fmt(totalLikes)} likes · ${fmt(totalComments)} coments.`, icon: <Heart size={16} /> },
    { label: "CPP (custo/post)", value: currency(cpp), sub: "meta: < R$ 250", icon: <DollarSign size={16} />, highlight: cpp > 0 && cpp < 250 },
    { label: "EMV estimado", value: currency(emv), sub: "valor de mídia gerado", icon: <TrendingUp size={16} /> },
    { label: "Vendas atribuídas", value: currency(totalSales), sub: "via cupom dos creators", icon: <BarChart3 size={16} /> },
    {
      label: "ROI",
      value: roi !== undefined ? `${roi > 0 ? "+" : ""}${roi}%` : "—",
      sub: "cupom sobre o produto enviado",
      icon: <TrendingUp size={16} />,
      title: ROI_TOOLTIP,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} title={"title" in metric ? metric.title : undefined} className={`rounded-xl border bg-white p-4 ${metric.highlight ? "border-zinc-900" : "border-zinc-200"}`}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{metric.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${metric.highlight ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                {metric.icon}
              </div>
            </div>
            <p className="text-xl font-semibold text-zinc-900">{metric.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{metric.sub}</p>
          </div>
        ))}
      </div>

      {posted.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <h3 className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Posts gerados</h3>
          </div>
          <table className="w-full text-left">
            <thead className="border-b border-zinc-100">
              <tr>
                {["Creator", "Post", "Views", "Likes", "Comentários", "Engaj.%", "Cupom", "Vendas"].map((header) => (
                  <th key={header} className="bg-zinc-50 px-4 py-2.5 text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posted
                .sort((a, b) => (b.postViews ?? 0) - (a.postViews ?? 0))
                .map((entry) => {
                  const content = memberTracksContent(entry.creatorId, roles)
                  const engagement =
                    content && entry.postViews && entry.postViews > 0
                      ? (((entry.postLikes ?? 0) + (entry.postComments ?? 0)) / entry.postViews * 100).toFixed(1)
                      : null

                  return (
                    <tr key={entry.id} className="border-b border-zinc-100 transition-colors hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            {entry.creatorPhoto ? <AvatarImage src={entry.creatorPhoto} alt={entry.creatorName} /> : null}
                            <AvatarFallback>{entry.creatorAvatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium text-zinc-900">{entry.creatorName}</p>
                            <p className="text-xs text-zinc-400">{entry.creatorHandle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {!content ? <NotTracked /> : entry.postUrl ? (
                          <a href={entry.postUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            Ver post
                          </a>
                        ) : <span className="text-xs text-zinc-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-zinc-900">{!content ? <NotTracked /> : entry.postViews ? fmt(entry.postViews) : "—"}</td>
                      <td className="flex items-center gap-1 px-4 py-3 text-sm text-zinc-700">
                        {!content ? <NotTracked /> : (
                          <>
                            <Heart size={11} className="text-zinc-400" />
                            {entry.postLikes ? fmt(entry.postLikes) : "—"}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-700">
                        {!content ? <NotTracked /> : (
                          <span className="flex items-center gap-1">
                            <MessageCircle size={11} className="text-zinc-400" />
                            {entry.postComments ? fmt(entry.postComments) : "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {engagement ? <span className="font-medium text-zinc-900">{engagement}%</span> : <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                        {entry.couponCode ?? <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-700">
                        {entry.couponSales ? currency(entry.couponSales) : <span className="text-zinc-300">—</span>}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center">
          <BarChart3 size={24} className="mx-auto mb-3 text-zinc-300" />
          <p className="text-sm text-zinc-400">Nenhum post registrado ainda.</p>
          <p className="mt-1 text-xs text-zinc-300">Os resultados aparecem quando creators registrarem posts.</p>
        </div>
      )}
    </div>
  )
}

export function seedingCampaignFor(campaign: Campaign, records: SeedingCampaign[]): SeedingCampaign {
  const linked = records.find((item) => item.campaignId === campaign.id)
  if (linked) return linked
  return {
    id: `seed-${campaign.id}`,
    campaignId: campaign.id,
    organizationId: campaign.organizationId,
    name: campaign.name,
    status: "rascunho",
    mode: "fechado",
    objective: campaign.objective,
    expectedHashtag: campaign.mandatoryHashtags[0],
    expectedMention: campaign.mandatoryMentions[0]?.handle,
    expectedFormats: campaign.contentFormats ?? [],
    daysToPost: 7,
    products: [],
    creators: [],
    createdAt: campaign.createdAt,
  }
}
