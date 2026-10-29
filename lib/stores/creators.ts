"use client"
import { create } from "zustand"
import {
  brandCreatorIds,
  containsQuery,
  isBrandCustomer,
  isSimilarCreator,
  matchesAnyLocation,
  predominantCities,
} from "@/lib/discovery/scope"
import { CREATORS, type Creator } from "@/lib/mock-data/creators"

export interface FilterState {
  search: string
  bio: string
  creatorLocation: string
  audienceLocation: string
  similarTo: string
  brandCustomers: boolean
  ownBase: boolean
  availableForPartnership: boolean
  niches: string[]
  networks: string[]
  minFollowers: number
  maxFollowers: number
  minEngagement: number
  tiers: string[]
  locations: string[]
}

export function emptyCreatorFilters(): FilterState {
  return {
    search: "",
    bio: "",
    creatorLocation: "",
    audienceLocation: "",
    similarTo: "",
    brandCustomers: false,
    ownBase: false,
    availableForPartnership: false,
    niches: [],
    networks: [],
    minFollowers: 0,
    maxFollowers: 10000000,
    minEngagement: 0,
    tiers: [],
    locations: [],
  }
}

interface CreatorState {
  creators: Creator[]
  filters: FilterState
  selected: Creator | null
  drawerOpen: boolean
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  applyFilters: (filters: FilterState) => void
  resetFilters: () => void
  selectCreator: (id: string) => void
  setDrawerOpen: (open: boolean) => void
  filteredCreators: (organizationId?: string) => Creator[]
}

const DEFAULT_FILTERS: FilterState = emptyCreatorFilters()

export const useCreatorStore = create<CreatorState>((set, get) => ({
  creators: CREATORS,
  filters: DEFAULT_FILTERS,
  selected: null,
  drawerOpen: false,
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  applyFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: emptyCreatorFilters() }),
  selectCreator: (id) => {
    const creator = get().creators.find((c) => c.id === id) ?? null
    set({ selected: creator, drawerOpen: !!creator })
  },
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  filteredCreators: (organizationId) => {
    const { creators, filters } = get()
    const reference = filters.similarTo
      ? creators.find((creator) => creator.id === filters.similarTo)
      : undefined
    const ownBase = organizationId ? brandCreatorIds(organizationId) : new Set<string>()
    return creators.filter((c) => {
      const terms = filters.search.trim().split(/\s+/).filter(Boolean)
      if (terms.length) {
        const matchesTerm = (term: string) => {
          const query = term.toLowerCase()
          const normalized = query.replace(/^@+/, "")
          const includes = (value: string) => {
            const text = value.toLowerCase()
            return text.includes(query) || text.replace(/^@+/, "").includes(normalized)
          }
          return (
            includes(c.name) ||
            includes(c.handle) ||
            c.networks.some((network) => includes(network.handle))
          )
        }
        if (!terms.every(matchesTerm)) return false
      }
      if (filters.bio?.trim() && !containsQuery(c.bio, filters.bio)) return false
      if (filters.creatorLocation?.trim() && !matchesAnyLocation(c.location, filters.creatorLocation)) return false
      if (filters.audienceLocation?.trim()) {
        const cities = predominantCities(c)
        if (!cities.some((city) => matchesAnyLocation(city, filters.audienceLocation))) return false
      }
      if (filters.similarTo) {
        if (!reference || !isSimilarCreator(reference, c)) return false
      }
      if (filters.brandCustomers) {
        if (!organizationId || !isBrandCustomer(c.id, organizationId)) return false
      }
      if (filters.ownBase) {
        if (!organizationId || !ownBase.has(c.id)) return false
      }
      if (filters.availableForPartnership && c.status !== "available") return false
      if (filters.niches.length && !filters.niches.some((n) => c.niche.includes(n as never)))
        return false
      if (
        filters.networks.length &&
        !filters.networks.some((n) => c.networks.some((net) => net.network === n))
      )
        return false
      if (c.totalFollowers < filters.minFollowers) return false
      if (c.totalFollowers > filters.maxFollowers) return false
      if (c.avgEngagement < filters.minEngagement) return false
      if (filters.tiers.length && !filters.tiers.includes(c.tier)) return false
      return true
    })
  },
}))
