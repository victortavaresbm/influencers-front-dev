"use client"

import { create } from "zustand"
import { CREATORS } from "@/lib/mock-data/creators"
import { tracksContent, type MembershipRole } from "@/lib/membership"

export type CouponMode = "automatico" | "personalizado" | "vincular" | "nao_criar"
export type CommissionMode = "padrao" | "personalizada" | "nenhuma"
export type NoticeMode = "nao" | "padrao" | "personalizado"

export interface MembershipTerms {
  role: MembershipRole
  managerId: string
  couponMode: CouponMode
  couponCode: string
  commissionMode: CommissionMode
  commission: string
  voucher: "nao" | "sim"
  voucherPrice: string
  notice: NoticeMode
  noticeMessage: string
  agencyChoice: Record<string, string>
}

interface MembershipState {
  roles: Record<string, MembershipRole>
  terms: Record<string, MembershipTerms>
  assign: (ids: string[], role: MembershipRole) => void
  saveTerms: (ids: string[], terms: MembershipTerms) => void
}

export const useMembershipStore = create<MembershipState>((set) => ({
  roles: {},
  terms: {},
  assign: (ids, role) =>
    set((state) => {
      const roles = { ...state.roles }
      for (const id of ids) roles[id] = role
      return { roles }
    }),
  saveTerms: (ids, terms) =>
    set((state) => {
      const roles = { ...state.roles }
      const next = { ...state.terms }
      for (const id of ids) {
        roles[id] = terms.role
        next[id] = terms
      }
      return { roles, terms: next }
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
