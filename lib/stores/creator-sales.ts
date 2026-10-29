"use client"

import { create } from "zustand"

export interface LiveSale {
  id: string
  creatorId: string
  campaignId: string
  campaign: string
  brand: string
  product: string
  coupon: string
  revenue: number
  commission: number
  at: string
}

interface CreatorSalesState {
  sales: LiveSale[]
  push: (sale: LiveSale) => void
}

export const useCreatorSalesStore = create<CreatorSalesState>()((set) => ({
  sales: [],
  push: (sale) => set((state) => ({ sales: [sale, ...state.sales].slice(0, 40) })),
}))
