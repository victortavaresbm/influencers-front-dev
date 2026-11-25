"use client"

import { FontPicker } from "@/components/forms/font-picker"
import { ColorField } from "@/components/forms/site-inspector"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type {
  BackgroundEffect,
  BackgroundMode,
  ContentSpacing,
  ContentWidth,
  SiteTheme,
  Typography,
} from "@/lib/mock-data/form-site"
import { useI18n, type MessageKey } from "@/lib/i18n"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <Row label={label}>
      <Select value={value} onValueChange={(next) => next && onChange(next as T)}>
        <SelectTrigger className="w-full">
          <SelectValue>{(current) => options.find((option) => option.value === current)?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  )
}

function NumberRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <Row label={label}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1 flex-1 accent-zinc-900"
        />
        <span className="w-10 text-right text-xs tabular-nums text-zinc-500">{value}</span>
      </div>
    </Row>
  )
}

function TypographyFields({
  value,
  onChange,
}: {
  value: Typography
  onChange: (next: Typography) => void
}) {
  const { t } = useI18n()
  return (
    <div className="space-y-3">
      <Row label={t("forms.themeFont")}>
        <FontPicker value={value.font} onChange={(font) => onChange({ ...value, font })} />
      </Row>
      <ColorField label={t("forms.themeColor")} value={value.color} onChange={(color) => onChange({ ...value, color })} />
      <NumberRow label={t("forms.themeSize")} value={value.size} min={10} max={72} onChange={(size) => onChange({ ...value, size })} />
      <Choice
        label={t("forms.themeWeight")}
        value={String(value.weight)}
        options={[
          { value: "400", label: t("forms.weightRegular") },
          { value: "500", label: t("forms.weightMedium") },
          { value: "600", label: t("forms.weightSemibold") },
          { value: "700", label: t("forms.weightBold") },
          { value: "800", label: t("forms.weightExtrabold") },
        ]}
        onChange={(weight) => onChange({ ...value, weight: Number(weight) })}
      />
      <NumberRow
        label={t("forms.themeLineHeight")}
        value={value.lineHeight}
        min={1}
        max={2}
        step={0.05}
        onChange={(lineHeight) => onChange({ ...value, lineHeight })}
      />
    </div>
  )
}

const WIDTHS: { value: ContentWidth; key: MessageKey }[] = [
  { value: "narrow", key: "forms.widthNarrow" },
  { value: "regular", key: "forms.widthRegular" },
  { value: "wide", key: "forms.widthWide" },
]
const SPACINGS: { value: ContentSpacing; key: MessageKey }[] = [
  { value: "tight", key: "forms.spacingTight" },
  { value: "regular", key: "forms.spacingRegular" },
  { value: "relaxed", key: "forms.spacingRelaxed" },
]
const MODES: { value: BackgroundMode; key: MessageKey }[] = [
  { value: "color", key: "forms.bgColor" },
  { value: "image", key: "forms.bgImage" },
  { value: "gradient", key: "forms.bgGradient" },
  { value: "video", key: "forms.bgVideo" },
]
const EFFECTS: { value: BackgroundEffect; key: MessageKey }[] = [
  { value: "none", key: "forms.effectNone" },
  { value: "dark", key: "forms.effectDark" },
  { value: "gradient", key: "forms.effectGradient" },
  { value: "grain", key: "forms.effectGrain" },
  { value: "blur", key: "forms.effectBlur" },
]

export function SiteDesignPanel({
  theme,
  onChange,
}: {
  theme: SiteTheme
  onChange: (theme: SiteTheme) => void
}) {
  const { t } = useI18n()
  const patch = (next: Partial<SiteTheme>) => onChange({ ...theme, ...next })

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section title={t("forms.designGeneral")}>
        <Choice
          label={t("forms.themeAlign")}
          value={theme.align}
          options={[
            { value: "left", label: t("forms.alignLeft") },
            { value: "center", label: t("forms.alignCenter") },
          ]}
          onChange={(align) => patch({ align })}
        />
        <Choice label={t("forms.themeWidth")} value={theme.width} options={WIDTHS.map((w) => ({ value: w.value, label: t(w.key) }))} onChange={(width) => patch({ width })} />
        <Choice label={t("forms.themeSpacing")} value={theme.spacing} options={SPACINGS.map((s) => ({ value: s.value, label: t(s.key) }))} onChange={(spacing) => patch({ spacing })} />
        <NumberRow label={t("forms.themeRadius")} value={theme.radius} min={0} max={32} onChange={(radius) => patch({ radius })} />
        <ColorField label={t("forms.themePrimary")} value={theme.primary} onChange={(primary) => patch({ primary })} />
      </Section>

      <Section title={t("forms.designHeader")}>
        <label className="flex items-center justify-between gap-2 text-sm text-zinc-700">
          {t("forms.themeProgress")}
          <input type="checkbox" checked={theme.showProgress} onChange={(event) => patch({ showProgress: event.target.checked })} className="size-4 accent-zinc-900" />
        </label>
        <Row label={t("forms.themeLogo")}>
          <Input value={theme.logo} placeholder="https://" onChange={(event) => patch({ logo: event.target.value })} />
        </Row>
      </Section>

      <Section title={t("forms.designBackground")}>
        <Choice label={t("forms.bgMode")} value={theme.backgroundMode} options={MODES.map((m) => ({ value: m.value, label: t(m.key) }))} onChange={(backgroundMode) => patch({ backgroundMode })} />
        {theme.backgroundMode === "color" ? (
          <ColorField label={t("forms.themeBackground")} value={theme.background} onChange={(background) => patch({ background })} />
        ) : null}
        {theme.backgroundMode === "image" ? (
          <Row label={t("forms.bgImageUrl")}>
            <Input value={theme.backgroundImage} placeholder="https://" onChange={(event) => patch({ backgroundImage: event.target.value })} />
          </Row>
        ) : null}
        {theme.backgroundMode === "gradient" ? (
          <Row label={t("forms.bgGradientCss")}>
            <Input value={theme.backgroundGradient} onChange={(event) => patch({ backgroundGradient: event.target.value })} />
          </Row>
        ) : null}
        {theme.backgroundMode === "video" ? (
          <Row label={t("forms.bgVideoUrl")}>
            <Input value={theme.backgroundVideo} placeholder="https://" onChange={(event) => patch({ backgroundVideo: event.target.value })} />
          </Row>
        ) : null}
        <Choice label={t("forms.bgEffect")} value={theme.backgroundEffect} options={EFFECTS.map((e) => ({ value: e.value, label: t(e.key) }))} onChange={(backgroundEffect) => patch({ backgroundEffect })} />
      </Section>

      <Section title={t("forms.designTypographyTitle")}>
        <TypographyFields value={theme.heading} onChange={(heading) => patch({ heading })} />
      </Section>

      <Section title={t("forms.designTypographyBody")}>
        <TypographyFields value={theme.body} onChange={(body) => patch({ body })} />
      </Section>
    </div>
  )
}
