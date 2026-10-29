"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MOCK_USERS, type MockUser } from "@/lib/mock-data/users"

interface AuthState {
  user: MockUser | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, password) => {
        const found = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!found) return { success: false, error: "E-mail ou senha incorretos." }
        set({ user: found })
        return { success: true }
      },
      logout: () => set({ user: null }),
    }),
    { name: "wesell-auth" }
  )
)
