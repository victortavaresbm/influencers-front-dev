"use client"

import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import {
  applyAccountTypeDefault,
  emptyDiscoverQuery,
  isQueryActive,
  type DiscoverQuery,
  type Platform,
  type SearchMode,
} from "@/lib/discovery/discover-query"

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export interface SavedDiscoverFilter {
  id: string
  name: string
  platform: Platform
  query: DiscoverQuery
  createdAt: string
}

interface DiscoverState {
  query: DiscoverQuery
  mode: SearchMode
  hiddenIds: string[]
  savedFilters: SavedDiscoverFilter[]
  searchesUsed: number
  openedIds: string[]
  trialEndsAt: number | null
  page: number
  campaignId: string | null
  accountTypesTouched: boolean
  setMode: (mode: SearchMode) => void
  setPage: (page: number) => void
  patchQuery: (patch: Partial<DiscoverQuery>) => void
  replaceQuery: (query: DiscoverQuery) => void
  resetQuery: () => void
  toggleHidden: (id: string) => void
  saveFilter: (name: string, platform: Platform) => SavedDiscoverFilter | null
  removeFilter: (id: string) => void
  markOpened: (id: string) => void
  setCampaign: (id: string | null) => void
  ensureTrial: () => void
}

function signature(query: DiscoverQuery) {
  return JSON.stringify(query)
}

export const useDiscoverStore = create<DiscoverState>()(
  persist(
    (set, get) => ({
      query: emptyDiscoverQuery(),
      mode: "ai",
      hiddenIds: [],
      savedFilters: [],
      searchesUsed: 0,
      openedIds: [],
      trialEndsAt: null,
      page: 1,
      campaignId: null,
      accountTypesTouched: false,
      setMode: (mode) => set({ mode, page: 1 }),
      setPage: (page) => set({ page }),
      patchQuery: (patch) => {
        const state = get()
        const touched = "accountTypes" in patch ? true : state.accountTypesTouched
        const merged = applyAccountTypeDefault({ ...state.query, ...patch }, touched)
        const changed = signature(merged) !== signature(state.query)
        set({
          query: merged,
          accountTypesTouched: touched,
          page: changed ? 1 : state.page,
          searchesUsed: state.searchesUsed + (changed ? 1 : 0),
        })
      },
      replaceQuery: (query) => {
        const state = get()
        const next = applyAccountTypeDefault(query, query.accountTypes.length > 0)
        const changed = signature(next) !== signature(state.query)
        set({
          query: next,
          accountTypesTouched: query.accountTypes.length > 0,
          page: 1,
          searchesUsed: state.searchesUsed + (changed ? 1 : 0),
        })
      },
      resetQuery: () =>
        set((state) => ({
          query: emptyDiscoverQuery(),
          accountTypesTouched: false,
          page: 1,
          campaignId: null,
          searchesUsed: state.searchesUsed + (isQueryActive(state.query) || state.campaignId ? 1 : 0),
        })),
      toggleHidden: (id) =>
        set((state) => ({
          hiddenIds: state.hiddenIds.includes(id)
            ? state.hiddenIds.filter((item) => item !== id)
            : [...state.hiddenIds, id],
        })),
      saveFilter: (name, platform) => {
        const trimmed = name.trim()
        if (!trimmed) return null
        const taken = get().savedFilters.some((filter) => filter.name.toLowerCase() === trimmed.toLowerCase())
        if (taken) return null
        const saved: SavedDiscoverFilter = {
          id: crypto.randomUUID(),
          name: trimmed,
          platform,
          query: structuredClone(get().query),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ savedFilters: [saved, ...state.savedFilters] }))
        return saved
      },
      removeFilter: (id) => set((state) => ({ savedFilters: state.savedFilters.filter((filter) => filter.id !== id) })),
      markOpened: (id) =>
        set((state) => ({
          openedIds: state.openedIds.includes(id) ? state.openedIds : [...state.openedIds, id],
        })),
      setCampaign: (id) => set({ campaignId: id }),
      ensureTrial: () => {
        if (get().trialEndsAt == null) set({ trialEndsAt: Date.now() + 14 * 86400000 })
      },
    }),
    {
      name: "wesell-discover",
      skipHydration: typeof window === "undefined",
      storage: createJSONStorage(() => (typeof window === "undefined" ? serverStorage : window.localStorage)),
      partialize: (state) => ({
        query: state.query,
        mode: state.mode,
        hiddenIds: state.hiddenIds,
        savedFilters: state.savedFilters,
        searchesUsed: state.searchesUsed,
        openedIds: state.openedIds,
        trialEndsAt: state.trialEndsAt,
        page: state.page,
        campaignId: state.campaignId,
        accountTypesTouched: state.accountTypesTouched,
      }),
    }
  )
)
