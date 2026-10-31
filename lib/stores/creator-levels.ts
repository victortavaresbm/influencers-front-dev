"use client"

import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import {
  INITIAL_CREATOR_LEVEL_GROUPS,
  type CreatorLevel,
  type CreatorLevelGroup,
  type MemberProfile,
} from "@/lib/creator-levels"

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

interface CreatorLevelsState {
  groupsByOrg: Record<string, CreatorLevelGroup[]>
  saveGroup: (organizationId: string, input: { id: string | null; name: string; profiles: MemberProfile[] }) => string
  deleteGroup: (organizationId: string, id: string) => void
  saveLevel: (
    organizationId: string,
    groupId: string,
    level: Omit<CreatorLevel, "id"> & { id: string | null }
  ) => string | null
  deleteLevel: (organizationId: string, groupId: string, levelId: string) => void
  moveLevel: (organizationId: string, groupId: string, levelId: string, direction: -1 | 1) => void
}

function updateOrg(
  groupsByOrg: Record<string, CreatorLevelGroup[]>,
  organizationId: string,
  update: (groups: CreatorLevelGroup[]) => CreatorLevelGroup[]
) {
  const current = groupsByOrg[organizationId] ?? INITIAL_CREATOR_LEVEL_GROUPS
  return { ...groupsByOrg, [organizationId]: update(current) }
}

export const useCreatorLevelsStore = create<CreatorLevelsState>()(
  persist(
    (set) => ({
      groupsByOrg: {},
      saveGroup: (organizationId, { id, name, profiles }) => {
        const nextId = id ?? `group-${crypto.randomUUID()}`
        set((state) => ({
          groupsByOrg: updateOrg(state.groupsByOrg, organizationId, (groups) => {
            if (id && groups.some((group) => group.id === id)) {
              return groups.map((group) => (group.id === id ? { ...group, name, profiles } : group))
            }
            return [...groups, { id: nextId, name, profiles, levels: [] }]
          }),
        }))
        return nextId
      },
      deleteGroup: (organizationId, id) =>
        set((state) => ({
          groupsByOrg: updateOrg(state.groupsByOrg, organizationId, (groups) => groups.filter((group) => group.id !== id)),
        })),
      saveLevel: (organizationId, groupId, level) => {
        const nextId = level.id ?? `level-${crypto.randomUUID()}`
        let saved = false
        set((state) => ({
          groupsByOrg: updateOrg(state.groupsByOrg, organizationId, (groups) =>
            groups.map((group) => {
              if (group.id !== groupId) return group
              saved = true
              const next: CreatorLevel = {
                id: nextId,
                name: level.name,
                requirements: level.requirements,
                rewards: level.rewards,
              }
              const exists = group.levels.some((item) => item.id === level.id)
              return {
                ...group,
                levels: exists
                  ? group.levels.map((item) => (item.id === level.id ? next : item))
                  : [...group.levels, next],
              }
            })
          ),
        }))
        return saved ? nextId : null
      },
      deleteLevel: (organizationId, groupId, levelId) =>
        set((state) => ({
          groupsByOrg: updateOrg(state.groupsByOrg, organizationId, (groups) =>
            groups.map((group) =>
              group.id === groupId
                ? { ...group, levels: group.levels.filter((level) => level.id !== levelId) }
                : group
            )
          ),
        })),
      moveLevel: (organizationId, groupId, levelId, direction) =>
        set((state) => ({
          groupsByOrg: updateOrg(state.groupsByOrg, organizationId, (groups) =>
            groups.map((group) => {
              if (group.id !== groupId) return group
              const index = group.levels.findIndex((level) => level.id === levelId)
              const target = index + direction
              if (index < 0 || target < 0 || target >= group.levels.length) return group
              const levels = group.levels.slice()
              const [item] = levels.splice(index, 1)
              levels.splice(target, 0, item)
              return { ...group, levels }
            })
          ),
        })),
    }),
    {
      name: "wesell-creator-levels",
      skipHydration: typeof window === "undefined",
      storage: createJSONStorage(() => (typeof window === "undefined" ? serverStorage : window.localStorage)),
    }
  )
)
