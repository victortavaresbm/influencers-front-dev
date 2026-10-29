import { isSocialNetwork, SOCIAL_NETWORK_LABEL, type Campaign } from "@/lib/mock-data/campaigns"
import { type Creator } from "@/lib/mock-data/creators"
import { emptyCreatorFilters, type FilterState } from "@/lib/stores/creators"

export interface CampaignFitItem {
  key: string
  label: string
  detail: string
  matches: boolean
}

/** Turns a campaign's targeting into discovery filters. The search still waits for Aplicar filtros. */
export function filtersFromCampaign(campaign: Campaign): FilterState {
  return {
    ...emptyCreatorFilters(),
    niches: [...campaign.targetNiches],
    networks: [...campaign.targetNetworks],
    minFollowers: campaign.minFollowers,
    maxFollowers: campaign.maxFollowers > 0 ? campaign.maxFollowers : 10000000,
    minEngagement: campaign.minEngagement,
  }
}

function followersLabel(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${Math.round(value / 1000)}k`
  return String(value)
}

function title(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Compares a creator with the criteria the campaign asks for. */
export function campaignFit(campaign: Campaign, creator: Creator): CampaignFitItem[] {
  const maxFollowers = campaign.maxFollowers > 0 ? campaign.maxFollowers : 10000000
  const items: CampaignFitItem[] = campaign.targetNiches.map((niche) => {
    const matches = creator.niche.some((item) => item === niche)
    return {
      key: `niche-${niche}`,
      label: title(niche),
      detail: matches ? "No perfil" : "Não tem este nicho",
      matches,
    }
  })

  for (const network of campaign.targetNetworks) {
    const profile = creator.networks.find((item) => item.network === network)
    items.push({
      key: `network-${network}`,
      label: isSocialNetwork(network) ? SOCIAL_NETWORK_LABEL[network] : title(network),
      detail: profile ? profile.handle : "Não tem esta rede",
      matches: Boolean(profile),
    })
  }

  items.push({
    key: "followers",
    label: `Seguidores ${followersLabel(campaign.minFollowers)} – ${followersLabel(maxFollowers)}`,
    detail: followersLabel(creator.totalFollowers),
    matches: creator.totalFollowers >= campaign.minFollowers && creator.totalFollowers <= maxFollowers,
  })
  items.push({
    key: "engagement",
    label: `Engajamento > ${campaign.minEngagement.toLocaleString("pt-BR")}%`,
    detail: `${creator.avgEngagement.toLocaleString("pt-BR")}%`,
    matches: creator.avgEngagement >= campaign.minEngagement,
  })
  return items
}

export function campaignFitScore(campaign: Campaign, creator: Creator) {
  const items = campaignFit(campaign, creator)
  return {
    matched: items.filter((item) => item.matches).length,
    total: items.length,
  }
}
