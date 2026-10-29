"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DEFAULT_BRAND_CREDITS } from "@/lib/credits"

interface CreditsState {
  balances: Record<string, number>
  spend: (organizationId: string, amount: number) => boolean
  add: (organizationId: string, amount: number) => void
}

export function organizationBalance(balances: Record<string, number>, organizationId: string) {
  return balances[organizationId] ?? DEFAULT_BRAND_CREDITS
}

export const useCreditsStore = create<CreditsState>()(
  persist(
    (set) => ({
      balances: {},
      spend: (organizationId, amount) => {
        let accepted = false
        set((state) => {
          const current = organizationBalance(state.balances, organizationId)
          if (current < amount) return state
          accepted = true
          return { balances: { ...state.balances, [organizationId]: current - amount } }
        })
        return accepted
      },
      add: (organizationId, amount) => {
        set((state) => {
          const current = organizationBalance(state.balances, organizationId)
          return { balances: { ...state.balances, [organizationId]: current + amount } }
        })
      },
    }),
    { name: "wesell-credits" }
  )
)
