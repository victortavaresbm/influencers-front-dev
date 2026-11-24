"use client"

import { useState, useSyncExternalStore } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useI18n } from "@/lib/i18n"
import { startCircleThemeTransition } from "@/components/lightswind/toggle-theme"
import { usePreferencesStore, type Locale, type Theme } from "@/lib/stores/preferences"
import { CreatorLevelsPanel } from "@/components/settings/creator-levels-panel"
import { ActiveMarca } from "@/components/settings/active-marca"
import { StoreIntegrations } from "@/components/settings/store-integrations"
import { useAuthStore } from "@/lib/stores/auth"
import { Check, Medal, Moon, Plug, SlidersHorizontal, Sun, type LucideIcon } from "lucide-react"
import { SiFacebook, SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { cn } from "@/lib/utils"

const LANGUAGES: { id: Locale; native: string }[] = [
  { id: "pt", native: "Português" },
  { id: "en", native: "English" },
  { id: "es", native: "Español" },
]

const INTEGRATIONS = [
  { id: "instagram", name: "Instagram", icon: SiInstagram },
  { id: "facebook", name: "Facebook", icon: SiFacebook },
  { id: "tiktok", name: "TikTok", icon: SiTiktok },
  { id: "youtube", name: "YouTube", icon: SiYoutube },
] as const

type IntegrationId = (typeof INTEGRATIONS)[number]["id"]
type Section = "integrations" | "preferences" | "levels"

const noSubscription = () => () => {}

export default function SettingsPage() {
  const { t } = useI18n()
  const locale = usePreferencesStore((state) => state.locale)
  const theme = usePreferencesStore((state) => state.theme)
  const setLocale = usePreferencesStore((state) => state.setLocale)
  const role = useAuthStore((state) => state.user?.role)
  // Coming back from a store's authorization page lands on Integrations.
  const returningFromStore = useSyncExternalStore(
    noSubscription,
    () => new URLSearchParams(window.location.search).has("status"),
    () => false
  )
  const [picked, setSection] = useState<Section | null>(null)
  const section: Section = picked ?? (returningFromStore ? "integrations" : "preferences")
  const [connected, setConnected] = useState<IntegrationId[]>([])
  const sections: { id: Section; label: string; icon: LucideIcon }[] = [
    { id: "integrations", label: t("settings.integrations"), icon: Plug },
    { id: "preferences", label: t("settings.preferences"), icon: SlidersHorizontal },
  ]
  if (role === "brand") sections.push({ id: "levels", label: t("settings.levels"), icon: Medal })

  const themes: { id: Theme; label: string; help: string; icon: typeof Sun }[] = [
    { id: "light", label: t("settings.light"), help: t("settings.lightHelp"), icon: Sun },
    { id: "dark", label: t("settings.dark"), help: t("settings.darkHelp"), icon: Moon },
  ]

  const toggleIntegration = (id: IntegrationId, name: string, next: boolean) => {
    setConnected((current) =>
      next ? (current.includes(id) ? current : [...current, id]) : current.filter((item) => item !== id)
    )
    toast.add({
      type: "success",
      title: next ? t("settings.connected") : t("settings.disconnect"),
      description: name,
    })
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <div className="grid w-full gap-6 p-6 xl:px-[200px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label={t("settings.title")} className="space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              type="button"
              variant={section === id ? "secondary" : "ghost"}
              className="w-full justify-start font-normal"
              aria-current={section === id ? "page" : undefined}
              onClick={() => setSection(id)}
            >
              <Icon data-icon="inline-start" />
              {label}
            </Button>
          ))}
        </nav>

        <div className="min-w-0 space-y-4">
          {section === "levels" && role === "brand" ? (
            <CreatorLevelsPanel />
          ) : section === "preferences" ? (
            <>
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-zinc-900">{t("settings.language")}</h2>
                <p className="mt-1 text-sm text-zinc-500">{t("settings.languageHelp")}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t("settings.language")}>
                  {LANGUAGES.map((language) => {
                    const selected = locale === language.id
                    return (
                      <button
                        key={language.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setLocale(language.id)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-3 py-3 text-left transition-colors",
                          selected ? "border-zinc-900 bg-zinc-100" : "border-zinc-200 hover:bg-zinc-50"
                        )}
                      >
                        <span className="text-sm font-medium text-zinc-900">{language.native}</span>
                        {selected && <Check size={16} className="text-zinc-900" />}
                      </button>
                    )
                  })}
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-sm font-semibold text-zinc-900">{t("settings.appearance")}</h2>
                <p className="mt-1 text-sm text-zinc-500">{t("settings.appearanceHelp")}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t("settings.appearance")}>
                  {themes.map((option) => {
                    const selected = theme === option.id
                    const Icon = option.icon
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={(event) => {
                          if (selected) return
                          startCircleThemeTransition(option.id, event.currentTarget)
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                          selected ? "border-zinc-900 bg-zinc-100" : "border-zinc-200 hover:bg-zinc-50"
                        )}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-200 text-zinc-800">
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-zinc-900">{option.label}</span>
                          <span className="block text-xs text-zinc-500">{option.help}</span>
                        </span>
                        {selected && <Check size={16} className="text-zinc-900" />}
                      </button>
                    )
                  })}
                </div>
              </Card>
            </>
          ) : (
            <>
            {role === "brand" && <ActiveMarca />}
            {role === "brand" && <StoreIntegrations />}
            <div className="grid gap-3 sm:grid-cols-2">
              {INTEGRATIONS.map((item) => {
                const Icon = item.icon
                const isConnected = connected.includes(item.id)
                return (
                  <Card key={item.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                        <Icon size={18} />
                      </span>
                      <Badge variant="outline">
                        {isConnected ? t("settings.connected") : t("settings.notConnected")}
                      </Badge>
                    </div>
                    <h2 className="mt-3 text-sm font-semibold text-zinc-900">{item.name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {t("settings.integrationHelp", { name: item.name })}
                    </p>
                    <div className="mt-4">
                      {isConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleIntegration(item.id, item.name, false)}
                        >
                          {t("settings.disconnect")}
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => toggleIntegration(item.id, item.name, true)}>
                          {t("settings.connectName", { name: item.name })}
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
