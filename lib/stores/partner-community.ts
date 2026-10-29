"use client"

import { useEffect, useMemo } from "react"
import { create } from "zustand"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useAuthStore } from "@/lib/stores/auth"
import { partnerCommunities, type PartnerCommunity } from "@/lib/mock-data/community"

interface PartnerCommunityState {
  communityId: string | null
  setCommunityId: (id: string) => void
}

export const usePartnerCommunityStore = create<PartnerCommunityState>()((set) => ({
  communityId: null,
  setCommunityId: (communityId) => set({ communityId }),
}))

export function usePartnerCommunity() {
  const user = useAuthStore((state) => state.user)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const communityId = usePartnerCommunityStore((state) => state.communityId)
  const setCommunityId = usePartnerCommunityStore((state) => state.setCommunityId)
  const partners = useMemo(
    () => (user?.role === "creator" ? partnerCommunities(campaigns, user) : []),
    [campaigns, user]
  )
  const selectedId = partners.some((item) => item.id === communityId) ? communityId : (partners[0]?.id ?? null)

  useEffect(() => {
    if (selectedId && selectedId !== communityId) setCommunityId(selectedId)
  }, [selectedId, communityId, setCommunityId])

  const selected = partners.find((item) => item.id === selectedId) ?? null
  return { partners, selected, selectedId, setCommunityId }
}

export type { PartnerCommunity }
