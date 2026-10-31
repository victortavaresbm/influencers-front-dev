"use client"

import { useId } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDateBR, formatDateRangeBR } from "@/lib/dates"
import { useI18n } from "@/lib/i18n"
import { type PeriodPreset, type PeriodValue } from "@/lib/period"

const PRESETS: PeriodPreset[] = ["all", "7", "30", "90", "month", "custom"]

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodValue
  onChange: (value: PeriodValue) => void
}) {
  const { t } = useI18n()
  const fromId = useId()
  const toId = useId()
  const labels: Record<PeriodPreset, string> = {
    all: t("period.all"),
    "7": t("period.days7"),
    "30": t("period.days30"),
    "90": t("period.days90"),
    month: t("period.month"),
    custom: t("period.custom"),
  }

  const current = value.preset === "all"
    ? t("period.label")
    : value.preset === "custom"
      ? (value.from && value.to
        ? formatDateRangeBR(value.from, value.to)
        : formatDateBR(value.from || value.to) || labels.custom)
      : labels[value.preset]

  function selectPreset(preset: string) {
    if (!PRESETS.includes(preset as PeriodPreset)) return
    const next = preset as PeriodPreset
    if (next === "custom") {
      onChange({ ...value, preset: "custom" })
      return
    }
    onChange({ preset: next, from: "", to: "" })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="px-3 font-normal"
            aria-pressed={value.preset !== "all"}
            aria-label={t("period.label")}
          />
        }
      >
        <Calendar data-icon="inline-start" />
        {current}
        <ChevronDown data-icon="inline-end" className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto min-w-56">
        <DropdownMenuRadioGroup value={value.preset} onValueChange={selectPreset}>
          {PRESETS.map((preset) => (
            <DropdownMenuRadioItem key={preset} value={preset} closeOnClick={preset !== "custom"}>
              {labels[preset]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <div
          className="grid gap-2 p-2"
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <div className="grid gap-1">
            <Label htmlFor={fromId} className="text-xs text-muted-foreground">{t("period.from")}</Label>
            <Input
              id={fromId}
              type="date"
              value={value.from}
              onChange={(event) => onChange({ preset: "custom", from: event.target.value, to: value.to })}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={toId} className="text-xs text-muted-foreground">{t("period.to")}</Label>
            <Input
              id={toId}
              type="date"
              value={value.to}
              min={value.from || undefined}
              onChange={(event) => onChange({ preset: "custom", from: value.from, to: event.target.value })}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
