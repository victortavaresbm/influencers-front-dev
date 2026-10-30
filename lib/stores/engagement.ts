import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ENGAGEMENT_EVENTS } from "@/lib/mock-data/engagement"
import type { EngagementEvent, EngagementEventType } from "@/lib/community-engagement"

interface EngagementState {
  events: EngagementEvent[]
  record: (event: Omit<EngagementEvent, "id" | "at">) => void
}

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set, get) => ({
      events: ENGAGEMENT_EVENTS,
      record(partial) {
        const ev: EngagementEvent = {
          ...partial,
          id: `${partial.creatorId}-${partial.type}-${Date.now()}`,
          at: new Date().toISOString(),
        }
        // guard: already exists same type+item today (dedup in engine, but keep store lean)
        set({ events: [...get().events, ev] })
      },
    }),
    {
      name: "wesell-engagement",
      merge(persisted, current) {
        const p = persisted as Partial<EngagementState>
        const userEvents = (p.events ?? []).filter(
          (e: EngagementEvent) => !ENGAGEMENT_EVENTS.some((s) => s.id === e.id)
        )
        return { ...current, events: [...ENGAGEMENT_EVENTS, ...userEvents] }
      },
    }
  )
)
