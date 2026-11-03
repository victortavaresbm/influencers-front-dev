"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MOCK_USERS, nameInitials, type MockUser } from "@/lib/mock-data/users"

export interface AccountProfileInput {
  name: string
  email: string
  photo?: string
  currentPassword?: string
  newPassword?: string
}

export type AccountProfileError = "profile.emailTaken" | "profile.passwordCurrent"

interface StoredAccount {
  email: string
  password: string
  name: string
  avatar: string
  photo?: string
}

interface AuthState {
  user: MockUser | null
  accounts: Record<string, StoredAccount>
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  updateProfile: (input: AccountProfileInput) => { success: true } | { success: false; error: AccountProfileError }
}

function withAccount(user: MockUser, account?: StoredAccount): MockUser {
  if (!account) return user
  return {
    ...user,
    email: account.email,
    password: account.password,
    name: account.name,
    avatar: account.avatar,
    photo: account.photo,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: {},
      login: (email, password) => {
        const accounts = get().accounts ?? {}
        const found = MOCK_USERS.find((user) => {
          const account = accounts[user.id]
          const currentEmail = (account?.email ?? user.email).toLowerCase()
          const currentPassword = account?.password ?? user.password
          return currentEmail === email.toLowerCase() && currentPassword === password
        })
        if (!found) return { success: false, error: "E-mail ou senha incorretos." }
        set({ user: withAccount(found, accounts[found.id]) })
        return { success: true }
      },
      logout: () => set({ user: null }),
      updateProfile: (input) => {
        const current = get().user
        if (!current) return { success: false, error: "profile.emailTaken" }
        const accounts = get().accounts ?? {}
        const email = input.email.trim().toLowerCase()
        const taken = MOCK_USERS.some((user) => {
          if (user.id === current.id) return false
          const other = (accounts[user.id]?.email ?? user.email).toLowerCase()
          return other === email
        })
        if (taken) return { success: false, error: "profile.emailTaken" }

        const stored = accounts[current.id]
        const password = stored?.password ?? current.password
        if (input.newPassword && input.currentPassword !== password) {
          return { success: false, error: "profile.passwordCurrent" }
        }

        const name = input.name.trim()
        const next: StoredAccount = {
          email: input.email.trim(),
          password: input.newPassword || password,
          name,
          avatar: nameInitials(name),
          photo: input.photo,
        }
        set({
          accounts: { ...accounts, [current.id]: next },
          user: { ...current, ...next },
        })
        return { success: true }
      },
    }),
    { name: "wesell-auth" }
  )
)
