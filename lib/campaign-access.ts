import { campaignAudience } from "@/lib/mock-data/community"
import type { Campaign, CampaignVisibility } from "@/lib/mock-data/campaigns"

export const CAMPAIGN_VISIBILITY_META: {
  value: CampaignVisibility
  label: string
  description: string
}[] = [
  {
    value: "publica",
    label: "Pública",
    description: "Aparece para os creators na aba de oportunidades.",
  },
  {
    value: "privada",
    label: "Privada",
    description: "Só quem já está na sua comunidade pode ver e se candidatar.",
  },
  {
    value: "secreta",
    label: "Secreta",
    description: "Só aparece para quem você convidar.",
  },
]

export function visibilityLabel(value?: CampaignVisibility) {
  return CAMPAIGN_VISIBILITY_META.find((item) => item.value === value)?.label ?? "A definir"
}

export function isCommunityMember(campaigns: Campaign[], organizationId: string, creatorId: string) {
  return campaigns.some(
    (campaign) =>
      campaign.organizationId === organizationId &&
      campaignAudience(campaign).some((participant) => participant.creatorId === creatorId),
  )
}

/** A creator who is not in the campaign only sees it when it is open to them. */
export function campaignIsVisibleTo(campaign: Campaign, creatorId: string, campaigns: Campaign[]) {
  if (campaign.participants.some((participant) => participant.creatorId === creatorId)) return true
  if (campaign.status !== "aberta") return false
  if (campaign.visibility === "publica") return true
  if (campaign.visibility === "privada") return isCommunityMember(campaigns, campaign.organizationId, creatorId)
  return false
}

export function creatorCanApply(campaign: Campaign, creatorId: string, campaigns: Campaign[]) {
  if (campaign.participants.some((participant) => participant.creatorId === creatorId)) return false
  return campaignIsVisibleTo(campaign, creatorId, campaigns)
}

/** Whether this creator may send an application, even if they are already in the campaign. */
export function campaignAcceptsApplication(campaign: Campaign, creatorId: string, campaigns: Campaign[]) {
  if (campaign.status !== "aberta") return false
  if (campaign.visibility === "publica") return true
  if (campaign.visibility === "privada") return isCommunityMember(campaigns, campaign.organizationId, creatorId)
  return false
}
