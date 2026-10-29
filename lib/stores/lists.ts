"use client"
import { create } from "zustand"
import { CRM_LISTS, type CRMList } from "@/lib/mock-data/crm"

interface CreateListInput {
  organizationId: string
  name: string
  description: string
  creatorIds: string[]
}

interface ListState {
  lists: CRMList[]
  createList: (input: CreateListInput) => CRMList
}

export const useListStore = create<ListState>()((set) => ({
  lists: CRM_LISTS,
  createList: (input) => {
    const list: CRMList = {
      id: `list-${crypto.randomUUID()}`,
      organizationId: input.organizationId,
      name: input.name,
      description: input.description,
      creatorIds: input.creatorIds,
      createdAt: new Date().toISOString().slice(0, 10),
      color: "gray",
    }
    set((state) => ({ lists: [...state.lists, list] }))
    return list
  },
}))
