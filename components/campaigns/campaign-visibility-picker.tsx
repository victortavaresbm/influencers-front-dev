"use client"

import { Globe, Lock, Users, type LucideIcon } from "lucide-react"
import { CAMPAIGN_VISIBILITY_META } from "@/lib/campaign-access"
import type { CampaignVisibility } from "@/lib/mock-data/campaigns"
import { cn } from "@/lib/utils"

const ICONS: Record<CampaignVisibility, { icon: LucideIcon; wellClass: string }> = {
  publica: { icon: Globe, wellClass: "bg-emerald-100 text-emerald-700" },
  privada: { icon: Users, wellClass: "bg-sky-100 text-sky-800" },
  secreta: { icon: Lock, wellClass: "bg-zinc-200 text-zinc-700" },
}

export function CampaignVisibilityPicker({
  value,
  onChange,
}: {
  value?: CampaignVisibility
  onChange: (value: CampaignVisibility) => void
}) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {CAMPAIGN_VISIBILITY_META.map((option) => {
        const selected = value === option.value
        const Icon = ICONS[option.value].icon
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-start gap-2.5 rounded-2xl border p-3 text-left transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
              selected
                ? "border-zinc-900 bg-zinc-50 shadow-[0_0_0_1px_#18181b]"
                : "border-zinc-200 bg-white hover:border-zinc-400",
            )}
          >
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  ICONS[option.value].wellClass,
                )}
              >
                <Icon size={18} />
              </span>
              <span className="text-sm font-semibold text-zinc-900">{option.label}</span>
            </span>
            <span className="text-xs leading-relaxed text-zinc-500">{option.description}</span>
          </button>
        )
      })}
    </div>
  )
}
