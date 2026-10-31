"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  CAMPAIGNS,
  normalizeMentions,
  type Campaign,
  type CampaignStatus,
  type CampaignVisibility,
  type Participant,
} from "@/lib/mock-data/campaigns"
import type { SeedingMode, SeedingProduct } from "@/lib/mock-data/seeding"

export type WizardDraft = Partial<Campaign> & {
  audienceTiers?: string[]
  seedingMode?: SeedingMode
  daysToPost?: number
  seedingProducts?: SeedingProduct[]
}

interface CampaignState {
  campaigns: Campaign[]
  selected: Campaign | null
  wizardStep: number
  wizardDraft: WizardDraft
  selectCampaign: (id: string) => void
  setWizardStep: (step: number) => void
  updateWizardDraft: (data: WizardDraft) => void
  resetWizard: () => void
  createCampaign: (campaign: Campaign) => void
  addParticipant: (campaignId: string, participant: Participant) => void
  setVisibility: (campaignId: string, visibility: CampaignVisibility) => void
  setSuccessTargets: (campaignId: string, successTargets: { metric: string; target: number }[]) => void
  setStatus: (campaignId: string, status: CampaignStatus) => void
  assignTracking: (campaignId: string, creatorId: string, offer: { couponCode?: string; trackingLink?: string }) => void
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaigns: CAMPAIGNS,
      selected: null,
      wizardStep: 0,
      wizardDraft: {},
      selectCampaign: (id) => {
        const camp = get().campaigns.find((c) => c.id === id) ?? null
        set({ selected: camp })
      },
      setWizardStep: (step) => set({ wizardStep: step }),
      updateWizardDraft: (data) =>
        set((s) => ({ wizardDraft: { ...s.wizardDraft, ...data } })),
      resetWizard: () => set({ wizardStep: 0, wizardDraft: {} }),
      createCampaign: (campaign) =>
        set((s) => ({
          campaigns: [...s.campaigns, campaign],
          wizardStep: 0,
          wizardDraft: {},
        })),
      addParticipant: (campaignId, participant) =>
        set((s) => ({
          campaigns: s.campaigns.map((campaign) => {
            if (campaign.id !== campaignId) return campaign
            if (campaign.participants.some((item) => item.creatorId === participant.creatorId)) return campaign
            return { ...campaign, participants: [...campaign.participants, participant] }
          }),
        })),
      setVisibility: (campaignId, visibility) =>
        set((s) => ({
          campaigns: s.campaigns.map((campaign) =>
            campaign.id === campaignId ? { ...campaign, visibility } : campaign,
          ),
        })),
      setSuccessTargets: (campaignId, successTargets) =>
        set((s) => ({
          campaigns: s.campaigns.map((campaign) =>
            campaign.id === campaignId ? { ...campaign, successTargets } : campaign,
          ),
        })),
      setStatus: (campaignId, status) =>
        set((s) => ({
          campaigns: s.campaigns.map((campaign) =>
            campaign.id === campaignId ? { ...campaign, status } : campaign,
          ),
        })),
      assignTracking: (campaignId, creatorId, offer) =>
        set((s) => ({
          campaigns: s.campaigns.map((campaign) =>
            campaign.id !== campaignId
              ? campaign
              : {
                  ...campaign,
                  participants: campaign.participants.map((participant) =>
                    participant.creatorId !== creatorId
                      ? participant
                      : {
                          ...participant,
                          couponCode: offer.couponCode?.trim() || participant.couponCode,
                          trackingLink: offer.trackingLink?.trim() || participant.trackingLink,
                        }
                  ),
                }
          ),
        })),
    }),
    {
      name: "wesell-campaign-wizard",
      version: 5,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as {
          wizardStep?: number
          wizardDraft?: WizardDraft & { recommended?: string; notRecommended?: string }
        }
        const draft = state.wizardDraft
        if (draft) {
          draft.mandatoryMentions = normalizeMentions(draft.mandatoryMentions)
          if (version < 5) {
            const lines = (value?: string) =>
              (value ?? "")
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean)
            if (!draft.doList?.length && draft.recommended) draft.doList = lines(draft.recommended)
            if (!draft.dontList?.length && draft.notRecommended) draft.dontList = lines(draft.notRecommended)
            delete draft.recommended
            delete draft.notRecommended
          }
        }
        if (version < 2 && (state.wizardStep ?? 0) >= 3) state.wizardStep = 5
        if (version < 3 && (state.wizardStep ?? 0) >= 2) state.wizardStep = (state.wizardStep ?? 0) + 1
        if (version < 4 && (state.wizardStep ?? 0) >= 4) state.wizardStep = (state.wizardStep ?? 0) + 1
        if (version < 5 && (state.wizardStep ?? 0) > 6) state.wizardStep = (state.wizardStep ?? 0) - 1
        return {
          wizardStep: state.wizardStep ?? 0,
          wizardDraft: draft ?? {},
        }
      },
      partialize: (state) => ({
        wizardStep: state.wizardStep,
        wizardDraft: state.wizardDraft,
      }),
    }
  )
)
