"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { CAMPAIGNS, type Campaign } from "@/lib/mock-data/campaigns"
import { CREATORS } from "@/lib/mock-data/creators"
import { CAMPAIGN_METRICS, MONTHLY_OVERVIEW } from "@/lib/mock-data/metrics"
import { useI18n } from "@/lib/i18n"
import { type MembershipRole } from "@/lib/membership"
import { membershipRoleOf, memberTracksContent, trackedSale, useMembershipStore } from "@/lib/stores/membership"
import { useAuthStore } from "@/lib/stores/auth"
import { portfolioRoi } from "@/lib/roi"

export type RankedInfluencer = {
  id: string
  name: string
  photo: string
  avatar: string
  coupon: string | null
  revenue: number
  audience: number
  contentTracked: boolean
  instagramVerified: boolean
}

export type SalesMember = {
  id: string
  name: string
  handle: string
  sales: number
}

type DashboardData = {
  orgCampaigns: Campaign[]
  activeCampaigns: Campaign[]
  activeCampaign: Campaign | undefined
  creatorsCount: number
  totalSpend: number
  totalRevenue: number
  totalReach: number
  totalEngagement: number
  totalClicks: number
  roi: number | undefined
  roles: Record<string, MembershipRole>
  ranking: RankedInfluencer[]
  salesRanking: SalesMember[]
  creatorPerformance: { creator: string; reach: number }[]
  monthly: typeof MONTHLY_OVERVIEW
  activeSeries: { date: string; reach: number; engagement: number; clicks: number }[]
  series: {
    revenue: string
    spend: string
    reach: string
    engagement: string
    clicks: string
  }
}

const DashboardDataContext = createContext<DashboardData | null>(null)

function buildRanking(campaigns: Campaign[], roles: Record<string, MembershipRole>): RankedInfluencer[] {
  const byId = new Map<
    string,
    { revenue: number; coupon: string | null; couponRevenue: number; name: string; avatar: string }
  >()

  for (const campaign of campaigns) {
    for (const participant of campaign.participants) {
      const current = byId.get(participant.creatorId) ?? {
        revenue: 0,
        coupon: participant.couponCode ?? null,
        couponRevenue: participant.couponCode ? (participant.revenue ?? 0) : -1,
        name: participant.creatorName,
        avatar: participant.avatar,
      }
      const revenue = trackedSale(participant.creatorId, participant.revenue, participant.couponCode, roles)
      current.revenue += revenue
      if (participant.couponCode && revenue >= current.couponRevenue) {
        current.coupon = participant.couponCode
        current.couponRevenue = revenue
      }
      byId.set(participant.creatorId, current)
    }
  }

  return [...byId.entries()].map(([id, aggregate]) => {
    const creator = CREATORS.find((item) => item.id === id)
    return {
      id,
      name: creator?.name ?? aggregate.name,
      photo: creator?.photo ?? "",
      avatar: creator?.avatar ?? aggregate.avatar,
      coupon: aggregate.coupon,
      revenue: aggregate.revenue,
      audience: creator?.totalFollowers ?? 0,
      contentTracked: membershipRoleOf(id, roles) !== "affiliate",
      instagramVerified:
        creator?.networks.some((network) => network.network === "instagram" && network.verified) ?? false,
    }
  })
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const roles = useMembershipStore((state) => state.roles)
  const { t } = useI18n()

  const value = useMemo<DashboardData>(() => {
    const orgCampaigns = CAMPAIGNS.filter((campaign) => campaign.organizationId === user?.organizationId)
    const activeCampaigns = orgCampaigns.filter((campaign) => campaign.status === "em_execucao")
    const activeCampaign = activeCampaigns[0]
    const metrics = activeCampaign ? CAMPAIGN_METRICS.find((item) => item.campaignId === activeCampaign.id) : undefined
    const salesByMember = new Map<string, SalesMember>()
    for (const campaign of orgCampaigns) {
      for (const participant of campaign.participants) {
        const sales = trackedSale(participant.creatorId, participant.revenue, participant.couponCode, roles)
        if (!sales) continue
        const current = salesByMember.get(participant.creatorId) ?? {
          id: participant.creatorId,
          name: participant.creatorName,
          handle: participant.creatorHandle,
          sales: 0,
        }
        current.sales += sales
        salesByMember.set(participant.creatorId, current)
      }
    }

    return {
      orgCampaigns,
      activeCampaigns,
      activeCampaign,
      creatorsCount: CREATORS.length,
      totalSpend: orgCampaigns.reduce((sum, campaign) => sum + campaign.budgetSpent, 0),
      totalRevenue: orgCampaigns.reduce((sum, campaign) => sum + (campaign.totalRevenue ?? 0), 0),
      totalReach: orgCampaigns.reduce((sum, campaign) => sum + (campaign.totalReach ?? 0), 0),
      totalEngagement: orgCampaigns.reduce((sum, campaign) => sum + (campaign.totalEngagement ?? 0), 0),
      totalClicks: orgCampaigns.reduce((sum, campaign) => sum + (campaign.totalClicks ?? 0), 0),
      roi: portfolioRoi(orgCampaigns),
      roles,
      ranking: buildRanking(orgCampaigns, roles),
      salesRanking: [...salesByMember.values()].sort((a, b) => b.sales - a.sales).slice(0, 5),
      creatorPerformance: orgCampaigns
        .flatMap((campaign) =>
          campaign.participants.filter(
            (participant) => memberTracksContent(participant.creatorId, roles) && participant.totalReach,
          ),
        )
        .sort((a, b) => (b.totalReach ?? 0) - (a.totalReach ?? 0))
        .slice(0, 5)
        .map((participant) => ({ creator: participant.creatorHandle, reach: participant.totalReach ?? 0 })),
      monthly: MONTHLY_OVERVIEW,
      activeSeries: metrics?.series ?? [],
      series: {
        revenue: t("dashboard.revenueSeries"),
        spend: t("dashboard.spendSeries"),
        reach: t("dashboard.col.reach"),
        engagement: t("dashboard.col.engagement"),
        clicks: t("dashboard.col.clicks"),
      },
    }
  }, [roles, t, user?.organizationId])

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}

export function useDashboardData() {
  const value = useContext(DashboardDataContext)
  if (!value) throw new Error("useDashboardData must be used within DashboardDataProvider")
  return value
}
