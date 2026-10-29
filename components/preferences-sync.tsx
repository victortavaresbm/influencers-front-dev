"use client"

import { useEffect } from "react"
import { localeToLang, usePreferencesStore, type Locale, type Theme } from "@/lib/stores/preferences"

function applyPreferences(theme: Theme, locale: Locale) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.lang = localeToLang(locale)
  root.style.colorScheme = theme
}

export function PreferencesSync() {
  const theme = usePreferencesStore((state) => state.theme)
  const locale = usePreferencesStore((state) => state.locale)

  useEffect(() => {
    const apply = () => {
      const state = usePreferencesStore.getState()
      applyPreferences(state.theme, state.locale)
    }
    const persistApi = usePreferencesStore.persist
    if (!persistApi || persistApi.hasHydrated()) {
      apply()
      return
    }
    const unsubscribe = persistApi.onFinishHydration(apply)
    if (persistApi.hasHydrated()) apply()
    return unsubscribe
  }, [theme, locale])

  return null
}
