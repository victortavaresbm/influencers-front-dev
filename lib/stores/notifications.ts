"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface NotificationsState {
  readIds: string[]
  markRead: (id: string) => void
  markAllRead: (ids: string[]) => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      readIds: [],
      markRead: (id) =>
        set((state) => (state.readIds.includes(id) ? state : { readIds: [...state.readIds, id] })),
      markAllRead: (ids) =>
        set((state) => ({ readIds: [...new Set([...state.readIds, ...ids])] })),
    }),
    { name: "wesell-notifications" },
  ),
)
