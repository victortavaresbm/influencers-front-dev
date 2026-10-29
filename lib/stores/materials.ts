"use client"

import { create } from "zustand"

export interface GraphicMaterial {
  id: string
  organizationId: string
  campaignId: string
  title: string
  imageUrl: string
}

interface MaterialsState {
  added: GraphicMaterial[]
  addMaterial: (material: Omit<GraphicMaterial, "id">) => void
}

export const useMaterialsStore = create<MaterialsState>()((set) => ({
  added: [],
  addMaterial: (material) =>
    set((state) => ({
      added: [...state.added, { ...material, id: `mat-${Date.now()}` }],
    })),
}))
