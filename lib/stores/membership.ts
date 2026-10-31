"use client"

import { create } from "zustand"
import { CREATORS } from "@/lib/mock-data/creators"
import { tracksContent, type MembershipRole } from "@/lib/membership"

interface MembershipState {
  roles: Record<string, MembershipRole>
  assign: (ids: string[], role: MembershipRole) => void
}

export const useMembershipStore = create<MembershipState>((set) => ({
  roles: {},
  assign: (ids, role) =>
    set((state) => {
      const roles = { ...state.roles }
      for (const id of ids) roles[id] = role
      return { roles }
    }),
}))

export function membershipRoleOf(
  creatorId: string,
  overrides?: Record<string, MembershipRole>,
): MembershipRole | undefined {
  const assigned = (overrides ?? useMembershipStore.getState().roles)[creatorId]
  if (assigned) return assigned
  return CREATORS.find((creator) => creator.id === creatorId)?.membershipRole
}

export function memberTracksContent(
  creatorId: string,
  overrides?: Record<string, MembershipRole>,
): boolean {
  return tracksContent(membershipRoleOf(creatorId, overrides))
}

export function trackedSale(
  creatorId: string,
  revenue: number | undefined,
  couponCode: string | undefined,
  overrides?: Record<string, MembershipRole>,
): number {
  const amount = revenue ?? 0
  const role = membershipRoleOf(creatorId, overrides)
  if (role === "affiliate") return couponCode ? amount : 0
  if (role === "creator") return amount
  return amount
}
