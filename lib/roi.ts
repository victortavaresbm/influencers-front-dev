import type { SeedingCampaign } from "@/lib/mock-data/seeding"

export const ROI_TOOLTIP =
  "ROI = (receita − custo) / custo × 100. Custo = cachê + comissão + recorrente + seeding."

const SENT_SEEDING = new Set(["enviado", "entregue", "postou", "nao_postou"])

export type RoiCost = {
  fee?: number
  commission?: number
  recurring?: number
  seeding?: number
}

/** Cachê + comissão + recorrente + custo de seeding. Recorrente fica 0 até existir um retainer próprio. */
export function investmentCost({ fee = 0, commission = 0, recurring = 0, seeding = 0 }: RoiCost = {}): number {
  return fee + commission + recurring + seeding
}

/** Undefined when there is no cost, so a zero denominator never becomes an infinite ROI. */
export function roiPercent(revenue: number, cost: number): number | undefined {
  if (cost <= 0) return undefined
  return Math.round(((revenue - cost) / cost) * 100)
}

type PricedParticipant = { revenue?: number; fee?: number }

export function participantRoi(participant: PricedParticipant): number | undefined {
  return roiPercent(participant.revenue ?? 0, investmentCost({ fee: participant.fee }))
}

export function campaignRevenue(campaign: { participants: PricedParticipant[] }): number {
  return campaign.participants.reduce((sum, participant) => sum + (participant.revenue ?? 0), 0)
}

export function campaignCost(campaign: { participants: PricedParticipant[] }): number {
  return campaign.participants.reduce((sum, participant) => sum + investmentCost({ fee: participant.fee }), 0)
}

export function campaignRoi(campaign: { participants: PricedParticipant[] }): number | undefined {
  return roiPercent(campaignRevenue(campaign), campaignCost(campaign))
}

export function portfolioRoi(campaigns: { participants: PricedParticipant[] }[]): number | undefined {
  const revenue = campaigns.reduce((sum, campaign) => sum + campaignRevenue(campaign), 0)
  const cost = campaigns.reduce((sum, campaign) => sum + campaignCost(campaign), 0)
  return roiPercent(revenue, cost)
}

export function seedingProductCost(campaign: SeedingCampaign, creatorId?: string): number {
  return campaign.creators.reduce((sum, creator) => {
    if (creatorId && creator.creatorId !== creatorId) return sum
    if (!SENT_SEEDING.has(creator.status) || !creator.selectedProductId) return sum
    const product = campaign.products.find((item) => item.id === creator.selectedProductId)
    return sum + (product?.unitCost ?? 0)
  }, 0)
}

export function seedingRevenue(campaign: SeedingCampaign): number {
  return campaign.creators.reduce((sum, creator) => sum + (creator.couponSales ?? 0), 0)
}

export function seedingRoi(campaign: SeedingCampaign): number | undefined {
  return roiPercent(seedingRevenue(campaign), investmentCost({ seeding: seedingProductCost(campaign) }))
}

type FeeCampaign = {
  organizationId: string
  participants: { creatorId: string; fee?: number }[]
}

export function creatorFeeCost(campaigns: FeeCampaign[], creatorId: string, organizationId: string): number {
  return campaigns.reduce((sum, campaign) => {
    if (campaign.organizationId !== organizationId) return sum
    return sum + campaign.participants
      .filter((participant) => participant.creatorId === creatorId)
      .reduce((fees, participant) => fees + (participant.fee ?? 0), 0)
  }, 0)
}

export function creatorSeedingCost(campaigns: SeedingCampaign[], creatorId: string, organizationId: string): number {
  return campaigns.reduce((sum, campaign) => {
    if (campaign.organizationId !== organizationId) return sum
    return sum + seedingProductCost(campaign, creatorId)
  }, 0)
}

export function creatorRoi(input: {
  sales?: number
  commission?: number
  fee?: number
  seeding?: number
}): number | undefined {
  return roiPercent(
    input.sales ?? 0,
    investmentCost({
      fee: input.fee,
      commission: input.commission,
      seeding: input.seeding,
    }),
  )
}
