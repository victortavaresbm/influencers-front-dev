"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserRole } from "@/lib/mock-data/users"

export interface Suggestion {
  id: string
  body: string
  authorId: string
  authorName: string
  role: UserRole
  createdAt: string
}

interface SuggestionsState {
  items: Suggestion[]
  add: (input: Omit<Suggestion, "id" | "createdAt">) => void
}

export const useSuggestionsStore = create<SuggestionsState>()(
  persist(
    (set) => ({
      items: [],
      add: (input) =>
        set((state) => ({
          items: [
            {
              ...input,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.items,
          ],
        })),
    }),
    { name: "wesell-suggestions" }
  )
)
