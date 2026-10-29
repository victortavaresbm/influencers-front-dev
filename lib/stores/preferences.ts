"use client"

import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export type Locale = "pt" | "en" | "es"
export type Theme = "light" | "dark"

interface PreferencesState {
  locale: Locale
  theme: Theme
  setLocale: (locale: Locale) => void
  setTheme: (theme: Theme) => void
}

export function localeToLang(locale: Locale) {
  if (locale === "en") return "en"
  if (locale === "es") return "es"
  return "pt-BR"
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: "pt",
      theme: "light",
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "wesell-preferences",
      skipHydration: typeof window === "undefined",
      storage: createJSONStorage(() => (typeof window === "undefined" ? serverStorage : window.localStorage)),
    }
  )
)
