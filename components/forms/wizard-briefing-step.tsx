"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useBriefingStore } from "@/lib/stores/briefings"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function WizardBriefingStep({
  organizationId,
  mode,
  briefingId,
  title,
  objective,
  onChange,
}: {
  organizationId: string
  mode: "skip" | "existing" | "new"
  briefingId?: string
  title: string
  objective: string
  onChange: (patch: {
    briefingMode?: "skip" | "existing" | "new"
    briefingId?: string
    newBriefingTitle?: string
    newBriefingObjective?: string
  }) => void
}) {
  const { t } = useI18n()
  const briefings = useBriefingStore((state) => state.briefings)
  const published = briefings.filter(
    (briefing) =>
      briefing.organizationId === organizationId && briefing.type === "brand" && briefing.status === "publicado",
  )

  return (
    <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{t("forms.briefingStep")}</h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">{t("forms.briefingStepHelp")}</p>
      </div>
      <RadioGroup
        value={mode}
        onValueChange={(value) => {
          if (value === "skip" || value === "existing" || value === "new") {
            onChange({ briefingMode: value, briefingId: value === "existing" ? briefingId : undefined })
          }
        }}
        className="grid gap-2"
      >
        <ModeOption id="briefing-skip" value="skip" label={t("forms.skipBriefing")} />
        <ModeOption id="briefing-existing" value="existing" label={t("forms.useExisting")} disabled={published.length === 0} />
        <ModeOption id="briefing-new" value="new" label={t("forms.createDraft")} />
      </RadioGroup>

      {mode === "existing" && (
        <div className="space-y-1.5">
          <Label>{t("forms.useExisting")}</Label>
          <Select value={briefingId ?? ""} onValueChange={(value) => onChange({ briefingId: value || undefined, briefingMode: "existing" })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("forms.noBriefing")}>
                {(value) => published.find((briefing) => briefing.id === value)?.title ?? t("forms.noBriefing")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {published.map((briefing) => (
                <SelectItem key={briefing.id} value={briefing.id}>
                  {briefing.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === "new" && (
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-briefing-title">{t("forms.briefingTitle")}</Label>
            <Input
              id="new-briefing-title"
              value={title}
              onChange={(event) => onChange({ newBriefingTitle: event.target.value, briefingMode: "new" })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-briefing-objective">{t("forms.briefingObjective")}</Label>
            <Textarea
              id="new-briefing-objective"
              rows={4}
              value={objective}
              onChange={(event) => onChange({ newBriefingObjective: event.target.value, briefingMode: "new" })}
            />
          </div>
        </div>
      )}
    </section>
  )
}

function ModeOption({ id, value, label, disabled }: { id: string; value: string; label: string; disabled?: boolean }) {
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2", disabled && "cursor-not-allowed opacity-50")}>
      <RadioGroupItem id={id} value={value} disabled={disabled} />
      <span className="text-sm text-zinc-800">{label}</span>
    </label>
  )
}
