"use client"

import { useBrandSearch } from "@/components/creator/brand-shell"
import { Card } from "@/components/ui/card"
import { CREATORS } from "@/lib/mock-data/creators"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { usePartnerCommunity } from "@/lib/stores/partner-community"
import { cn } from "@/lib/utils"

export function RankingBoard({ manage = false }: { manage?: boolean }) {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const { selectedId } = usePartnerCommunity()
  const query = useBrandSearch().trim().toLowerCase()
  const creator = CREATORS.find((item) => item.email === user?.email)
  const scopeId = manage ? user?.organizationId : selectedId

  const totals = new Map<string, { name: string; handle: string; avatar: string; amount: number }>()
  for (const campaign of campaigns) {
    if (campaign.organizationId !== scopeId) continue
    for (const participant of campaign.participants) {
      if (participant.status !== "selecionado" && participant.status !== "entregue") continue
      const current = totals.get(participant.creatorId) ?? {
        name: participant.creatorName,
        handle: participant.creatorHandle,
        avatar: participant.avatar,
        amount: 0,
      }
      current.amount += participant.revenue ?? participant.fee ?? 0
      totals.set(participant.creatorId, current)
    }
  }
  const ranked = [...totals.entries()]
    .filter(([, item]) => !query || item.name.toLowerCase().includes(query))
    .sort((a, b) => b[1].amount - a[1].amount)

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        {ranked.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">{t("space.rankingEmpty")}</div>
        ) : (
          <Card className="divide-y divide-border p-0">
            {ranked.map(([id, item], index) => (
              <div
                key={id}
                className={cn("flex items-center gap-4 px-4 py-3", !manage && id === creator?.id && "bg-muted")}
              >
                <span className="w-6 text-sm font-semibold text-muted-foreground tabular-nums">{index + 1}</span>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {item.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.handle}</p>
                </div>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  R$ {item.amount.toLocaleString("pt-BR")}
                </p>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
