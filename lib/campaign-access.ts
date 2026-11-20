import { applicationCount, creatorBlockedByRequirements } from "@/lib/campaigns/shape"
import { campaignAudience } from "@/lib/mock-data/community"
import type { Campaign, CampaignVisibility } from "@/lib/mock-data/campaigns"
import { CREATORS } from "@/lib/mock-data/creators"

export const CAMPAIGN_VISIBILITY_META: {
  value: CampaignVisibility
  label: string
  description: string
}[] = [
  {
    value: "publica",
    label: "Pública",
    description: "Recrutamento visível na vitrine do marketplace.",
  },
  {
    value: "privada",
    label: "Privada",
    description: "Somente os creators que já estão na comunidade podem ver.",
  },
  {
    value: "secreta",
    label: "Secreta",
    description: "Somente quem receber o convite tem acesso.",
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

function marketplaceOpen(campaign: Campaign) {
  if (!campaign.applicationCap || campaign.applicationCap < 1) return true
  return applicationCount(campaign) < campaign.applicationCap
}

/** A creator who is not in the campaign only sees it when it is open to them. */
export function campaignIsVisibleTo(campaign: Campaign, creatorId: string, campaigns: Campaign[]) {
  if (campaign.participants.some((participant) => participant.creatorId === creatorId)) return true
  if (campaign.status !== "aberta") return false
  if (campaign.visibility === "publica") return marketplaceOpen(campaign)
  if (campaign.visibility === "privada") return isCommunityMember(campaigns, campaign.organizationId, creatorId)
  return false
}

export function creatorRequirementBlock(campaign: Campaign, creatorId: string) {
  const creator = CREATORS.find((item) => item.id === creatorId)
  if (!creator) return null
  return creatorBlockedByRequirements(campaign, creator)
}

export function creatorCanApply(campaign: Campaign, creatorId: string, campaigns: Campaign[]) {
  if (campaign.participants.some((participant) => participant.creatorId === creatorId)) return false
  if (!campaignIsVisibleTo(campaign, creatorId, campaigns)) return false
  return !creatorRequirementBlock(campaign, creatorId)
}

/** Whether this creator may send an application, even if they are already in the campaign. */
export function campaignAcceptsApplication(campaign: Campaign, creatorId: string, campaigns: Campaign[]) {
  if (campaign.status !== "aberta") return false
  if (creatorRequirementBlock(campaign, creatorId)) return false
  if (campaign.visibility === "publica") return marketplaceOpen(campaign)
  if (campaign.visibility === "privada") return isCommunityMember(campaigns, campaign.organizationId, creatorId)
  return false
}
