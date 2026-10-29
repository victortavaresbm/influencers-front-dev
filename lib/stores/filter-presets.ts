"use client"

import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import { type FilterState } from "@/lib/stores/creators"

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export interface FilterPreset {
  id: string
  organizationId: string
  name: string
  filters: FilterState
  campaignId?: string
  createdAt: string
}

interface FilterPresetState {
  presets: FilterPreset[]
  savePreset: (organizationId: string, name: string, filters: FilterState, campaignId?: string) => FilterPreset | null
  removePreset: (id: string) => void
}

function cloneFilters(filters: FilterState): FilterState {
  return {
    ...filters,
    niches: [...filters.niches],
    networks: [...filters.networks],
    tiers: [...filters.tiers],
    locations: [...filters.locations],
  }
}

export const useFilterPresetStore = create<FilterPresetState>()(
  persist(
    (set, get) => ({
      presets: [],
      savePreset: (organizationId, name, filters, campaignId) => {
        const trimmed = name.trim()
        if (!trimmed) return null
        const taken = get().presets.some(
          (preset) => preset.organizationId === organizationId && preset.name.toLowerCase() === trimmed.toLowerCase()
        )
        if (taken) return null
        const preset: FilterPreset = {
          id: crypto.randomUUID(),
          organizationId,
          name: trimmed,
          filters: cloneFilters(filters),
          campaignId,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ presets: [preset, ...state.presets] }))
        return preset
      },
      removePreset: (id) => set((state) => ({ presets: state.presets.filter((preset) => preset.id !== id) })),
    }),
    {
      name: "wesell-filter-presets",
      skipHydration: typeof window === "undefined",
      storage: createJSONStorage(() => (typeof window === "undefined" ? serverStorage : window.localStorage)),
    }
  )
)
