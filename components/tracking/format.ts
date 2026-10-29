import type { BrandSnapshot, ChartMetric } from "@/lib/mock-data/tracking"

export function formatCount(value: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export function formatMoney(value: number) {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  if (abs >= 1_000_000_000) return `${sign}R$ ${(abs / 1_000_000_000).toFixed(1).replace(".", ",")} bi`
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(1).replace(".", ",")} mi`
  if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(1).replace(".", ",")} mil`
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)
}

export function formatFrequency(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function formatDelta(value: number) {
  if (Math.abs(value) < 1) return "<1%"
  const rounded = Math.round(value)
  return `${rounded > 0 ? "+" : ""}${rounded}%`
}

export function deltaClass(value: number) {
  if (Math.abs(value) < 1) return "text-zinc-500"
  return value > 0 ? "text-emerald-600" : "text-rose-600"
}

export function formatChartValue(metric: ChartMetric, value: number) {
  if (metric === "emv" || metric === "sponsoredEmv") return formatMoney(value)
  return formatCount(value)
}

export function formatSnapshotMetric(metric: ChartMetric, snapshot: BrandSnapshot) {
  return formatChartValue(metric, snapshot[metric])
}

export function csvCell(value: string | number) {
  const text = String(value)
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}
