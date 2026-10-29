"use client"

import { create } from "zustand"
import { BRIEFINGS, type Briefing } from "@/lib/mock-data/briefings"

function today() {
  return new Date().toISOString().slice(0, 10)
}

export type NewBriefingInput = {
  organizationId: string
  title: string
  objective: string
  campaignId?: string
  campaignName?: string
}

interface BriefingState {
  briefings: Briefing[]
  addBriefing: (input: NewBriefingInput) => Briefing
  updateBriefing: (id: string, patch: Partial<Briefing>) => void
}

export const useBriefingStore = create<BriefingState>()((set) => ({
  briefings: BRIEFINGS,
  addBriefing: (input) => {
    const stamp = today()
    const briefing: Briefing = {
      id: `b_${crypto.randomUUID()}`,
      type: "campaign",
      organizationId: input.organizationId,
      status: "rascunho",
      campaignId: input.campaignId,
      campaignName: input.campaignName,
      title: input.title,
      objective: input.objective,
      targetAudience: "",
      keyMessages: [],
      doList: [],
      dontList: [],
      toneOfVoice: "",
      mandatoryElements: [],
      inspirationLinks: [],
      versions: [
        {
          version: 1,
          createdAt: stamp,
          createdBy: "Você",
          summary: "Rascunho criado no assistente da campanha",
        },
      ],
      createdAt: stamp,
      updatedAt: stamp,
    }
    set((state) => ({ briefings: [briefing, ...state.briefings] }))
    return briefing
  },
  updateBriefing: (id, patch) =>
    set((state) => ({
      briefings: state.briefings.map((briefing) =>
        briefing.id === id ? { ...briefing, ...patch, id: briefing.id, updatedAt: today() } : briefing,
      ),
    })),
}))
