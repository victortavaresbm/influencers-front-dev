"use client"

import Link from "next/link"
import { useState } from "react"
import { Calendar, Users } from "lucide-react"
import { useBrandSearch } from "@/components/creator/brand-shell"
import { CampaignTypeBadge } from "@/components/campaigns/campaign-type-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateRangeBR } from "@/lib/dates"
import { campaignStatusKey, participantStatusKey, useI18n } from "@/lib/i18n"
import type { Campaign, CampaignStatus, Participant } from "@/lib/mock-data/campaigns"
import { CREATORS } from "@/lib/mock-data/creators"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { usePartnerCommunity } from "@/lib/stores/partner-community"

const STATUS_VARIANT: Record<CampaignStatus, "default" | "secondary" | "destructive"> = {
  em_execucao: "default",
  aberta: "default",
  rascunho: "secondary",
  concluida: "secondary",
  cancelada: "destructive",
  arquivada: "secondary",
}

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((campaign) => {
              const participant = campaign.participants.find((item) => item.creatorId === creator?.id)
              const href = manage ? `/campaigns/${campaign.id}` : `/creator/campaigns/${campaign.id}`
              return (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  href={href}
                  manage={manage}
                  participant={participant}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function CampaignCard({
  campaign,
  href,
  manage,
  participant,
}: {
  campaign: Campaign
  href: string
  manage: boolean
  participant?: Participant
}) {
  const { t } = useI18n()
  const status = manage
    ? t(campaignStatusKey(campaign.status))
    : participant
      ? t(participantStatusKey(participant.status))
      : null

  return (
    <Link
      href={href}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[2/1] overflow-hidden bg-muted">
          <CampaignBanner campaign={campaign} />
          {status && (
            <Badge
              variant={manage ? STATUS_VARIANT[campaign.status] : "secondary"}
              className="absolute top-3 right-3 shadow-sm ring-1 ring-background/70"
            >
              {status}
            </Badge>
          )}
        </div>
        <CardHeader className="pt-4">
          <CardTitle className="line-clamp-2 min-h-12 leading-snug">{campaign.name}</CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-xs">
            <Calendar className="size-3.5 shrink-0" />
            <span className="truncate">{formatDateRangeBR(campaign.startDate, campaign.endDate)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex items-center justify-between gap-3 pb-4">
          <CampaignTypeBadge type={campaign.type} strategy={campaign.strategy} tactics={campaign.tactics} />
          {manage ? (
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              {campaign.participants.length}
            </span>
          ) : participant?.fee ? (
            <span className="shrink-0 text-xs font-medium tabular-nums">
              R$ {participant.fee.toLocaleString("pt-BR")}
            </span>
          ) : !manage ? (
            <span className="truncate text-xs text-muted-foreground">{campaign.organizationName}</span>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}

function CampaignBanner({ campaign }: { campaign: Campaign }) {
  const [failed, setFailed] = useState(false)

  if (!campaign.coverImage || failed) {
    return (
      <div className="flex size-full items-end bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-400 p-4">
        <span className="text-sm font-semibold tracking-wide text-white">{campaign.organizationName}</span>
      </div>
    )
  }

  return (
    <img
      src={campaign.coverImage}
      alt=""
      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      onError={() => setFailed(true)}
    />
  )
}
