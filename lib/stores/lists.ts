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
  addCreatorsToList: (listId: string, creatorIds: string[]) => void
  toggleCreatorInList: (listId: string, creatorId: string) => void
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
  addCreatorsToList: (listId, creatorIds) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? { ...list, creatorIds: [...new Set([...list.creatorIds, ...creatorIds])] }
          : list
      ),
    })),
  toggleCreatorInList: (listId, creatorId) =>
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id !== listId) return list
        const has = list.creatorIds.includes(creatorId)
        return {
          ...list,
          creatorIds: has
            ? list.creatorIds.filter((id) => id !== creatorId)
            : [...list.creatorIds, creatorId],
        }
      }),
    })),
}))
