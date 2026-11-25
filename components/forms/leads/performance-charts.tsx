"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { formatDateBR } from "@/lib/dates"
import { localeToLang, type Locale } from "@/lib/stores/preferences"
import { cn } from "@/lib/utils"

type FunnelStep = { label: string; count: number; pageId?: string }

const SERIES = [
  { key: "visitors", swatch: "bg-foreground", bar: "fill-foreground" },
  { key: "responses", swatch: "bg-zinc-400", bar: "fill-zinc-400" },
  { key: "leads", swatch: "bg-emerald-600", bar: "fill-emerald-600" },
] as const

type SeriesKey = (typeof SERIES)[number]["key"]

type TimelinePoint = { date: string; visitors: number; responses: number; leads: number }

export function FunnelChart({
  title,
  steps,
  rateLabel,
}: {
  title: string
  steps: FunnelStep[]
  rateLabel: (pct: number) => string
}) {
  const scale = Math.max(1, ...steps.map((step) => step.count))
  const base = steps[0]?.count ?? 0

  return (
    <Card className="gap-4 p-4">
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const width = step.count <= 0 ? 0 : Math.max(1.5, (step.count / scale) * 100)
          const pct = index === 0 || base <= 0 ? null : Math.round((step.count / base) * 100)
          return (
            <div key={step.pageId ?? step.label} className="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-3">
              <span className="truncate text-sm text-zinc-600">{step.label}</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100" aria-hidden>
                <div className="h-full rounded-full bg-zinc-900" style={{ width: `${width}%` }} />
              </div>
              <span className="flex items-baseline justify-end gap-2 text-sm tabular-nums">
                <span className="text-zinc-900">{step.count}</span>
                {pct != null ? (
                  <span className="text-zinc-400" title={rateLabel(pct)}>
                    {pct}%
                  </span>
                ) : null}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export function ScoreRing({ label, value }: { label: string; value: number }) {
  const size = 132
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(100, value))

  return (
    <Card className="h-full items-center justify-center gap-3 p-4">
      <p className="text-sm font-medium text-zinc-900">{label}</p>
      <div className="relative size-[132px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90" aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-zinc-100" />
          {pct > 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              className="stroke-zinc-900"
              strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
            />
          ) : null}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-semibold tracking-tight text-zinc-900 tabular-nums">{value}</span>
        </div>
      </div>
    </Card>
  )
}

export function ShareCard({
  title,
  rows,
  empty,
}: {
  title: string
  rows: { label: string; count: number }[]
  empty: string
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0)
  const ranked = rows
    .map((row, index) => ({ ...row, index }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.index - b.index)

  return (
    <Card className="h-full gap-3 p-4">
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">{empty}</p>
      ) : (
        <div className="space-y-3">
          {ranked.map((row) => {
            const pct = Math.round((row.count / total) * 100)
            return (
              <div key={`${row.label}-${row.index}`} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-zinc-700">{row.label}</span>
                  <span className="shrink-0 tabular-nums text-zinc-500">
                    {row.count}
                    <span className="text-zinc-400"> · {pct}%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100" aria-hidden>
                  <div className="h-full rounded-full bg-zinc-900" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function axisMax(max: number) {
  const peak = Math.max(1, Math.ceil(max))
  if (peak <= 4) return { top: peak, ticks: Array.from({ length: peak + 1 }, (_, index) => index) }
  const rough = peak / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const error = rough / magnitude
  const step = Math.max(1, Math.round((error <= 1 ? 1 : error <= 2 ? 2 : error <= 5 ? 5 : 10) * magnitude))
  const top = Math.ceil(peak / step) * step
  const ticks: number[] = []
  for (let value = 0; value <= top; value += step) ticks.push(value)
  return { top, ticks }
}

function labelIndexes(count: number) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index)
  const last = count - 1
  const seen = new Set<number>()
  for (let index = 0; index < 6; index += 1) seen.add(Math.round((index * last) / 5))
  return [...seen]
}

function shortDate(iso: string, locale: Locale) {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(localeToLang(locale), { day: "2-digit", month: "2-digit" }).format(date)
}

export function SeriesChart({
  title,
  points,
  labels,
  locale,
  empty,
}: {
  title: string
  points: TimelinePoint[]
  labels: Record<SeriesKey, string>
  locale: Locale
  empty: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const width = 720
  const height = 220
  const pad = { l: 44, r: 12, t: 16, b: 28 }
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const peak = Math.max(1, ...points.flatMap((point) => SERIES.map((series) => point[series.key])))
  const { top, ticks } = axisMax(peak)
  const y = (value: number) => pad.t + innerH - (value / top) * innerH
  const groupW = points.length === 0 ? innerW : innerW / points.length
  const barW = Math.min(12, Math.max(4, (groupW - 20) / SERIES.length))
  const gap = 3
  const groupSpan = barW * SERIES.length + gap * (SERIES.length - 1)
  const marks = new Set(labelIndexes(points.length))
  const active = hover == null ? null : points[hover]

  return (
    <Card className="gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          {SERIES.map((series) => (
            <span key={series.key} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2 rounded-sm", series.swatch)} />
              {labels[series.key]}
            </span>
          ))}
        </div>
      </div>
      {points.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">{empty}</p>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-56 w-full"
            role="img"
            aria-label={title}
          >
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={pad.l}
                  x2={width - pad.r}
                  y1={y(tick)}
                  y2={y(tick)}
                  className={tick === 0 ? "stroke-zinc-200" : "stroke-zinc-100"}
                />
                <text
                  x={pad.l - 8}
                  y={y(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-zinc-400 text-[11px]"
                >
                  {tick}
                </text>
              </g>
            ))}
            {points.map((point, index) => {
              const center = pad.l + (index + 0.5) * groupW
              const start = center - groupSpan / 2
              return (
                <g key={point.date}>
                  {hover === index ? (
                    <rect x={pad.l + index * groupW} y={pad.t} width={groupW} height={innerH} className="fill-zinc-50" />
                  ) : null}
                  {SERIES.map((series, seriesIndex) => {
                    const value = point[series.key]
                    if (value <= 0) return null
                    const barH = Math.max(0, y(0) - y(value))
                    return (
                      <rect
                        key={series.key}
                        x={start + seriesIndex * (barW + gap)}
                        y={y(value)}
                        width={barW}
                        height={barH}
                        rx={Math.min(3, barH / 2)}
                        className={series.bar}
                      />
                    )
                  })}
                  {marks.has(index) ? (
                    <text
                      x={center}
                      y={height - 8}
                      textAnchor="middle"
                      className="fill-zinc-400 text-[11px]"
                    >
                      {shortDate(point.date, locale)}
                    </text>
                  ) : null}
                </g>
              )
            })}
            {points.map((point, index) => (
              <rect
                key={`${point.date}-hit`}
                x={pad.l + index * groupW}
                y={0}
                width={groupW}
                height={height}
                fill="transparent"
                tabIndex={0}
                aria-label={`${formatDateBR(point.date)}: ${SERIES.map((series) => `${labels[series.key]} ${point[series.key]}`).join(", ")}`}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(index)}
                onBlur={() => setHover(null)}
              />
            ))}
          </svg>
          {active && hover != null ? (
            <div
              className={cn(
                "pointer-events-none absolute top-2 z-10 min-w-40 rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md",
              )}
              style={{
                left: `${((pad.l + (hover + 0.5) * groupW) / width) * 100}%`,
                transform:
                  hover === 0 ? "translateX(0)" : hover === points.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              <p className="font-medium text-zinc-800">{formatDateBR(active.date)}</p>
              <div className="mt-1.5 space-y-1">
                {SERIES.map((series) => (
                  <div key={series.key} className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1.5 text-zinc-600">
                      <span className={cn("size-1.5 rounded-sm", series.swatch)} />
                      {labels[series.key]}
                    </span>
                    <span className="font-medium tabular-nums text-zinc-900">{active[series.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  )
}
