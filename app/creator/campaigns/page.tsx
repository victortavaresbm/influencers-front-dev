"use client"
import { TopBar } from "@/components/layout/top-bar"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useAuthStore } from "@/lib/stores/auth"
import { CREATORS } from "@/lib/mock-data/creators"
import Link from "next/link"
import { ArrowUpRight, Calendar, DollarSign } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { formatDateBR } from "@/lib/dates"

function statusLabel(status: string) {
  if (status === "entregue") return "Entregue"
  if (status === "selecionado") return "Selecionado"
  if (status === "candidato") return "Candidato"
  if (status === "convidado") return "Convidado"
  return status
}

function statusClass(status: string) {
  if (status === "entregue") return "bg-green-50 text-green-700"
  if (status === "selecionado") return "bg-zinc-900 text-white"
  if (status === "candidato") return "bg-yellow-50 text-yellow-700"
  return "bg-zinc-100 text-zinc-600"
}

export default function CreatorCampaignsPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const creator = CREATORS.find((c) => c.email === user?.email) ?? CREATORS[0]
  const myCampaigns = campaigns.filter((c) => c.participants.some((p) => p.creatorId === creator.id))

  return (
    <div className="flex flex-col flex-1">
      <TopBar title={t("nav.myCampaigns")} subtitle={t("pages.myCampaigns")} />

      <div className="p-6">
        {myCampaigns.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">Você ainda não está em nenhuma campanha.</div>
        ) : (
          <div className="space-y-3">
            {myCampaigns.map((c) => {
              const participant = c.participants.find((p) => p.creatorId === creator.id)
              return (
                <Link key={c.id} href={`/creator/campaigns/${c.id}`}>
                  <div className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold text-white">
                      {c.organizationName.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-zinc-900 group-hover:underline">{c.name}</p>
                      <p className="text-xs text-zinc-400">{c.organizationName}</p>
                    </div>
                    <div className="hidden items-center gap-4 text-xs text-zinc-500 sm:flex">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDateBR(c.endDate)}
                      </span>
                      {participant?.fee ? (
                        <span className="flex items-center gap-1">
                          <DollarSign size={11} />
                          R$ {participant.fee.toLocaleString("pt-BR")}
                        </span>
                      ) : null}
                    </div>
                    {participant && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(participant.status)}`}>
                        {statusLabel(participant.status)}
                      </span>
                    )}
                    <ArrowUpRight size={14} className="text-zinc-300" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
