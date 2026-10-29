"use client"

import { create } from "zustand"

export type PixType = "cpf" | "cnpj" | "email" | "phone" | "random"

export interface PayoutAccount {
  pixType: PixType
  pixKey: string
  holder: string
  document: string
}

export interface WithdrawalRequest {
  id: string
  creatorId: string
  paymentIds: string[]
  amount: number
  invoiceName: string
  requestedAt: string
}

interface CreatorPayoutState {
  accounts: Record<string, PayoutAccount>
  withdrawals: WithdrawalRequest[]
  saveAccount: (creatorId: string, account: PayoutAccount) => void
  requestWithdrawal: (request: WithdrawalRequest) => void
}

export const useCreatorPayoutStore = create<CreatorPayoutState>()((set) => ({
  accounts: {},
  withdrawals: [],
  saveAccount: (creatorId, account) =>
    set((state) => ({ accounts: { ...state.accounts, [creatorId]: account } })),
  requestWithdrawal: (request) =>
    set((state) => ({ withdrawals: [request, ...state.withdrawals] })),
}))
