"use client"

import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import { type TrackingConfig } from "@/lib/mock-data/tracking"

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

interface TrackingState {
  byOrg: Record<string, TrackingConfig>
  save: (organizationId: string, config: TrackingConfig) => void
  reset: (organizationId: string) => void
}

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set) => ({
      byOrg: {},
      save: (organizationId, config) =>
        set((state) => ({
          byOrg: {
            ...state.byOrg,
            [organizationId]: {
              ...config,
              competitorIds: [...config.competitorIds],
              networks: [...config.networks],
              signals: [...config.signals],
            },
          },
        })),
      reset: (organizationId) =>
        set((state) => {
          const byOrg = { ...state.byOrg }
          delete byOrg[organizationId]
          return { byOrg }
        }),
    }),
    {
      name: "wesell-tracking",
      skipHydration: typeof window === "undefined",
      storage: createJSONStorage(() => (typeof window === "undefined" ? serverStorage : window.localStorage)),
    },
  ),
)
