"use client"

import Link from "next/link"
import { ArrowUpRight, Calendar, DollarSign } from "lucide-react"
import { useBrandSearch } from "@/components/creator/brand-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CREATORS } from "@/lib/mock-data/creators"
import { formatDateBR } from "@/lib/dates"
import { campaignStatusKey, participantStatusKey, useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { usePartnerCommunity } from "@/lib/stores/partner-community"

export function CampaignsBoard({ manage = false }: { manage?: boolean }) {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const { selectedId } = usePartnerCommunity()
  const query = useBrandSearch().trim().toLowerCase()
  const creator = CREATORS.find((item) => item.email === user?.email)
  const scopeId = manage ? user?.organizationId : selectedId
  const mine = campaigns.filter(
    (campaign) =>
      campaign.organizationId === scopeId &&
      (manage || campaign.participants.some((participant) => participant.creatorId === creator?.id)) &&
      (!query || campaign.name.toLowerCase().includes(query))
  )

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        {manage && (
          <div className="mb-4 flex justify-end">
            <Button render={<Link href="/campaigns/create" />}>{t("pages.newCampaign")}</Button>
          </div>
        )}
        {mine.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">{t("space.campaignsEmpty")}</div>
        ) : (
          <div className="space-y-3">
            {mine.map((campaign) => {
              const participant = campaign.participants.find((item) => item.creatorId === creator?.id)
              const href = manage ? `/campaigns/${campaign.id}` : `/creator/campaigns/${campaign.id}`
              return (
                <Link key={campaign.id} href={href}>
                  <div className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                      {campaign.organizationName.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:underline">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">{campaign.organizationName}</p>
                    </div>
                    <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDateBR(campaign.endDate)}
                      </span>
                      {!manage && participant?.fee ? (
                        <span className="flex items-center gap-1">
                          <DollarSign size={11} />
                          R$ {participant.fee.toLocaleString("pt-BR")}
                        </span>
                      ) : null}
                    </div>
                    <Badge variant="secondary">
                      {manage ? t(campaignStatusKey(campaign.status)) : participant ? t(participantStatusKey(participant.status)) : null}
                    </Badge>
                    <ArrowUpRight size={14} className="text-muted-foreground" />
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
