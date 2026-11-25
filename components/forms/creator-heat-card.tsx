"use client"

import { Flame } from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { CreatorHeat, HeatCheck, HeatLevel } from "@/lib/forms/creator-heat"
import { SOCIAL_LABEL } from "@/lib/forms/social-links"
import { formatCompact } from "@/lib/discovery/discover-query"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const LEVEL_KEY: Record<HeatLevel, MessageKey> = {
  quente: "forms.heat.levelHot",
  morno: "forms.heat.levelWarm",
  frio: "forms.heat.levelCold",
}

const SUMMARY_KEY: Record<HeatLevel, MessageKey> = {
  quente: "forms.heat.summaryHot",
  morno: "forms.heat.summaryWarm",
  frio: "forms.heat.summaryCold",
}

const CHECK_KEY: Record<HeatCheck["key"], MessageKey> = {
  needNetwork: "forms.heat.needNetwork",
  networkOff: "forms.heat.networkOff",
  nicheOk: "forms.heat.nicheOk",
  nicheWeak: "forms.heat.nicheWeak",
  nicheOff: "forms.heat.nicheOff",
  audienceOk: "forms.heat.audienceOk",
  audienceOff: "forms.heat.audienceOff",
  engagementOk: "forms.heat.engagementOk",
  engagementOff: "forms.heat.engagementOff",
  briefOk: "forms.heat.briefOk",
  briefWeak: "forms.heat.briefWeak",
  doHit: "forms.heat.doHit",
  dontHit: "forms.heat.dontHit",
  alsoOn: "forms.heat.alsoOn",
  audienceAge: "forms.heat.audienceAge",
  audienceCity: "forms.heat.audienceCity",
  unknown: "forms.heat.unknown",
}

const NETWORK_ICON = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
} as const

const NETWORK_COLOR = {
  instagram: "text-[#E1306C]",
  tiktok: "text-zinc-900",
  youtube: "text-[#FF0033]",
} as const

function flameClass(level: HeatLevel, lit: boolean) {
  if (!lit) return "text-zinc-200"
  if (level === "quente") return "fill-orange-500 text-orange-500"
  if (level === "morno") return "fill-amber-400 text-amber-500"
  return "fill-zinc-300 text-zinc-400"
}

export function HeatMark({ heat }: { heat: CreatorHeat }) {
  const { t } = useI18n()
  const label = t(LEVEL_KEY[heat.level])
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`${t("forms.heat.title")}: ${label}`}>
      <span className="inline-flex items-center" aria-hidden>
        {[0, 1, 2].map((index) => (
          <Flame key={index} className={cn("size-3.5", flameClass(heat.level, index < heat.flames))} />
        ))}
      </span>
      <span className="text-xs text-zinc-600">{label}</span>
    </span>
  )
}

export function CreatorHeatCard({ heat }: { heat: CreatorHeat }) {
  const { t } = useI18n()
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-900">{t("forms.heat.title")}</p>
          <HeatMark heat={heat} />
        </div>
        <Badge variant="outline">{heat.score}</Badge>
      </div>
      <p className="text-sm text-zinc-600">{t(SUMMARY_KEY[heat.level])}</p>
      {heat.profiles.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-400">{t("forms.heat.tracked")}</p>
          {heat.profiles.map((profile) => {
            const Icon = NETWORK_ICON[profile.network]
            return (
            <div key={profile.network} className="flex items-center justify-between gap-3 text-sm">
              <a href={profile.url} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-2 text-zinc-800 underline-offset-2 hover:underline">
                <Icon className={cn("size-3.5 shrink-0", NETWORK_COLOR[profile.network])} aria-hidden />
                <span className="truncate">
                  {SOCIAL_LABEL[profile.network]} · {profile.handle}
                </span>
              </a>
              <span className="shrink-0 tabular-nums text-zinc-500">
                {profile.followers != null
                  ? `${formatCompact(profile.followers)} · ${profile.engagementRate?.toLocaleString("pt-BR")}%`
                  : t("forms.heat.notInBase")}
              </span>
            </div>
            )
          })}
        </div>
      ) : null}
      <ul className="space-y-1.5">
        {heat.checks.map((check, index) => (
          <li key={`${check.key}-${index}`} className="flex gap-2 text-sm text-zinc-700">
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                check.tone === "ok" && "bg-orange-500",
                check.tone === "warn" && "bg-amber-400",
                check.tone === "bad" && "bg-zinc-400",
              )}
            />
            <span>{t(CHECK_KEY[check.key], check.vars)}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
