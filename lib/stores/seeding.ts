"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  SEEDING_CAMPAIGNS,
  type SeedingCampaign,
  type SeedingCreatorEntry,
  type SeedingProduct,
  type SeedingStatus,
  type CreatorSeedingStatus,
} from "@/lib/mock-data/seeding"

interface SeedingState {
  campaigns: SeedingCampaign[]
  createCampaign: (campaign: SeedingCampaign) => void
  setStatus: (id: string, status: SeedingStatus) => void
  addCreator: (campaignId: string, entry: SeedingCreatorEntry) => void
  updateCreatorStatus: (campaignId: string, entryId: string, status: CreatorSeedingStatus) => void
  setTrackingCode: (campaignId: string, entryId: string, code: string) => void
  setPostUrl: (campaignId: string, entryId: string, url: string, views: number, likes: number, comments: number) => void
  addProduct: (campaignId: string, product: SeedingProduct) => void
  removeCreator: (campaignId: string, entryId: string) => void
}

export const useSeedingStore = create<SeedingState>()(
  persist(
    (set) => ({
      campaigns: SEEDING_CAMPAIGNS,

      createCampaign: (campaign) =>
        set((s) => ({ campaigns: [campaign, ...s.campaigns] })),

      setStatus: (id, status) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status } : c)),
        })),

      addCreator: (campaignId, entry) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId ? { ...c, creators: [...c.creators, entry] } : c
          ),
        })),

      updateCreatorStatus: (campaignId, entryId, status) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : {
                  ...c,
                  creators: c.creators.map((cr) =>
                    cr.id === entryId ? { ...cr, status } : cr
                  ),
                }
          ),
        })),

      setTrackingCode: (campaignId, entryId, code) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : {
                  ...c,
                  creators: c.creators.map((cr) =>
                    cr.id === entryId
                      ? { ...cr, trackingCode: code, status: "enviado", shippedAt: new Date().toISOString().split("T")[0] }
                      : cr
                  ),
                }
          ),
        })),

      setPostUrl: (campaignId, entryId, url, views, likes, comments) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : {
                  ...c,
                  creators: c.creators.map((cr) =>
                    cr.id === entryId
                      ? { ...cr, postUrl: url, postViews: views, postLikes: likes, postComments: comments, status: "postou" }
                      : cr
                  ),
                }
          ),
        })),

      addProduct: (campaignId, product) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId ? { ...c, products: [...c.products, product] } : c
          ),
        })),

      removeCreator: (campaignId, entryId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== campaignId
              ? c
              : { ...c, creators: c.creators.filter((cr) => cr.id !== entryId) }
          ),
        })),
    }),
    {
      name: "wesell-seeding",
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<SeedingState>
        const campaigns = (persisted.campaigns ?? currentState.campaigns).map((campaign) => {
          const seed = SEEDING_CAMPAIGNS.find((item) => item.id === campaign.id)
          if (!seed) return campaign
          return {
            ...campaign,
            products: campaign.products.map((product) => {
              if (product.imageUrl) return product
              const seeded = seed.products.find((item) => item.id === product.id)
              return seeded?.imageUrl ? { ...product, imageUrl: seeded.imageUrl } : product
            }),
            creators: campaign.creators.map((creator) => {
              if (creator.creatorPhoto) return creator
              const seeded = seed.creators.find((item) => item.id === creator.id)
              return seeded?.creatorPhoto ? { ...creator, creatorPhoto: seeded.creatorPhoto } : creator
            }),
          }
        })
        return { ...currentState, ...persisted, campaigns }
      },
    }
  )
)
