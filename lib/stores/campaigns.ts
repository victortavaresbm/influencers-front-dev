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

export type WizardDraft = Partial<Campaign> & {
  audienceTiers?: string[]
  briefingMode?: "skip" | "existing" | "new"
  newBriefingTitle?: string
  newBriefingObjective?: string
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
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as { wizardStep?: number; wizardDraft?: WizardDraft }
        if (state.wizardDraft) {
          state.wizardDraft.mandatoryMentions = normalizeMentions(state.wizardDraft.mandatoryMentions)
        }
        if (version < 2 && (state.wizardStep ?? 0) >= 3) state.wizardStep = 5
        return state
      },
      partialize: (state) => ({
        wizardStep: state.wizardStep,
        wizardDraft: state.wizardDraft,
      }),
    }
  )
)
