"use client"

import { SignalHigh, SignalLow, SignalMedium, SignalZero, type LucideIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type MatchWeight } from "@/lib/mock-data/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"

const LEVELS: { value: MatchWeight; key: MessageKey; icon: LucideIcon; tone: string }[] = [
  { value: 0, key: "forms.matchNone", icon: SignalZero, tone: "text-zinc-400" },
  { value: 1, key: "forms.matchLow", icon: SignalLow, tone: "text-zinc-500" },
  { value: 2, key: "forms.matchMid", icon: SignalMedium, tone: "text-amber-600" },
  { value: 3, key: "forms.matchHigh", icon: SignalHigh, tone: "text-orange-600" },
]

function MatchLevel({ value }: { value: string | null }) {
  const { t } = useI18n()
  const level = LEVELS.find((item) => String(item.value) === value) ?? LEVELS[0]
  const Icon = level.icon
  return (
    <>
      <Icon className={level.tone} />
      {t(level.key)}
    </>
  )
}

export function MatchWeightSelect({
  value,
  onChange,
}: {
  value: MatchWeight
  onChange: (weight: MatchWeight) => void
}) {
  return (
    <Select
      value={String(value)}
      onValueChange={(next) => {
        if (next == null) return
        onChange(Number(next) as MatchWeight)
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue>{(current) => <MatchLevel value={current} />}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LEVELS.map((level) => (
          <SelectItem key={level.value} value={String(level.value)}>
            <MatchLevel value={String(level.value)} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
