"use client"

import { useMemo, useState } from "react"
import { BrandMark } from "@/components/tracking/brand-mark"
import { formatChartValue, formatDelta } from "@/components/tracking/format"
import type { BrandSnapshot, ChartMetric } from "@/lib/mock-data/tracking"

const WIDTH = 640
const HEIGHT = 320
const PAD = { top: 20, right: 20, bottom: 28, left: 44 }

function axisRange(values: number[]) {
  let min = Math.min(0, ...values)
  let max = Math.max(0, ...values)
  if (min === max) {
    min -= 5
    max += 5
  }
  const pad = (max - min) * 0.28
  return { min: min - pad, max: max + pad }
}

function ticks(min: number, max: number) {
  return Array.from({ length: 5 }, (_, index) => min + ((max - min) * index) / 4)
}

function axisPercent(value: number) {
  const rounded = Math.round(value)
  return `${rounded > 0 ? "+" : ""}${rounded}%`
}

export function BubbleChart({
  snapshots,
  metric,
}: {
  snapshots: BrandSnapshot[]
  metric: ChartMetric
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const xAxis = useMemo(() => axisRange(snapshots.map((item) => item.yoy)), [snapshots])
  const yAxis = useMemo(() => axisRange(snapshots.map((item) => item.mom)), [snapshots])
  const maxValue = Math.max(...snapshots.map((item) => item[metric]), 1)

  function xOf(value: number) {
    return PAD.left + ((value - xAxis.min) / (xAxis.max - xAxis.min)) * (WIDTH - PAD.left - PAD.right)
  }

  function yOf(value: number) {
    return PAD.top + ((yAxis.max - value) / (yAxis.max - yAxis.min)) * (HEIGHT - PAD.top - PAD.bottom)
  }

  const active = snapshots.find((item) => item.brand.id === activeId)
  const activePoint = active
    ? { x: xOf(active.yoy), y: yOf(active.mom), r: 16 + (active[metric] / maxValue) * 22 }
    : null

  return (
    <div className="relative w-full" style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        role="img"
        aria-label="Posição das marcas pela variação mensal e anual"
      >
        {ticks(yAxis.min, yAxis.max).map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yOf(tick)}
              y2={yOf(tick)}
              stroke="currentColor"
              className="text-zinc-100"
            />
            <text x={PAD.left - 8} y={yOf(tick)} textAnchor="end" dominantBaseline="middle" className="fill-zinc-400 text-[11px]">
              {axisPercent(tick)}
            </text>
          </g>
        ))}
        {ticks(xAxis.min, xAxis.max).map((tick) => (
          <text
            key={`x-${tick}`}
            x={xOf(tick)}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-zinc-400 text-[11px]"
          >
            {axisPercent(tick)}
          </text>
        ))}
        <line x1={xOf(0)} x2={xOf(0)} y1={PAD.top} y2={HEIGHT - PAD.bottom} stroke="currentColor" className="text-zinc-300" />
        <line y1={yOf(0)} y2={yOf(0)} x1={PAD.left} x2={WIDTH - PAD.right} stroke="currentColor" className="text-zinc-300" />
        {snapshots.map((snapshot) => {
          const radius = 16 + (snapshot[metric] / maxValue) * 22
          const cx = xOf(snapshot.yoy)
          const cy = yOf(snapshot.mom)
          const clipId = `bubble-${snapshot.brand.id}`
          return (
            <g
              key={snapshot.brand.id}
              onMouseEnter={() => setActiveId(snapshot.brand.id)}
              onMouseLeave={() => setActiveId((current) => (current === snapshot.brand.id ? null : current))}
              className="cursor-pointer"
            >
              {snapshot.brand.icon ? (
                <>
                  <defs>
                    <clipPath id={clipId}>
                      <circle cx={cx} cy={cy} r={radius} />
                    </clipPath>
                  </defs>
                  <image
                    href={snapshot.brand.icon}
                    x={cx - radius}
                    y={cy - radius}
                    width={radius * 2}
                    height={radius * 2}
                    clipPath={`url(#${clipId})`}
                  />
                  <circle cx={cx} cy={cy} r={radius} fill="none" stroke="white" strokeWidth={2} />
                </>
              ) : (
                <>
                  <circle cx={cx} cy={cy} r={radius} fill={snapshot.brand.color} />
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={snapshot.brand.ink === "dark" ? "#18181b" : "#ffffff"}
                    className="text-[11px] font-semibold"
                  >
                    {snapshot.brand.initials}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>
      {active && activePoint ? (
        <div
          className="pointer-events-none absolute z-10 w-44 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md"
          style={{ left: `${(activePoint.x / WIDTH) * 100}%`, top: `${(activePoint.y / HEIGHT) * 100}%` }}
        >
          <div className="flex items-center gap-2">
            <BrandMark brand={active.brand} className="size-5 text-[9px]" />
            <p className="truncate text-xs font-medium text-zinc-900">{active.brand.name}</p>
          </div>
          <p className="mt-1 text-sm font-semibold tabular-nums text-zinc-900">{formatChartValue(metric, active[metric])}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            MoM {formatDelta(active.mom)} · YoY {formatDelta(active.yoy)}
          </p>
        </div>
      ) : null}
    </div>
  )
}
