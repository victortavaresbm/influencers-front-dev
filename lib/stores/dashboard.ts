"use client"

import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import {
  appendWidget,
  applySize,
  buildDefaultLayout,
  removeCard,
  sanitizeCards,
  type CardSize,
  type DashboardCard,
  type WidgetId,
} from "@/lib/dashboard/layout"

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

type DashboardState = {
  cards: DashboardCard[]
  highlightedId: string | null
  setCards: (cards: DashboardCard[]) => void
  addWidget: (widget: WidgetId) => void
  removeWidget: (id: string) => void
  setCardSize: (id: string, size: CardSize) => void
  reset: () => void
  clearHighlight: () => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      cards: buildDefaultLayout(),
      highlightedId: null,
      setCards: (cards) => set({ cards }),
      addWidget: (widget) =>
        set((state) => {
          if (state.cards.some((card) => card.widget === widget)) return state
          return { cards: appendWidget(state.cards, widget), highlightedId: widget }
        }),
      removeWidget: (id) =>
        set((state) => ({
          cards: removeCard(state.cards, id),
          highlightedId: state.highlightedId === id ? null : state.highlightedId,
        })),
      setCardSize: (id, size) => set((state) => ({ cards: applySize(state.cards, id, size) })),
      reset: () => set({ cards: buildDefaultLayout(), highlightedId: null }),
      clearHighlight: () => set({ highlightedId: null }),
    }),
    {
      name: "wesell-dashboard-layout",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? serverStorage : window.localStorage)),
      partialize: (state) => ({ cards: state.cards }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<Pick<DashboardState, "cards">> | undefined
        return { ...current, cards: sanitizeCards(stored?.cards), highlightedId: null }
      },
    },
  ),
)
