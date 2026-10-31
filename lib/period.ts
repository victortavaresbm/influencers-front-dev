export type PeriodPreset = "all" | "7" | "30" | "90" | "month" | "custom"

export type PeriodValue = {
  preset: PeriodPreset
  from: string
  to: string
}

export const ALL_PERIOD: PeriodValue = { preset: "all", from: "", to: "" }

function isoDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** Inclusive local-day window. `null` means the full history. */
export function periodRange(value: PeriodValue, today = new Date()): { from: string; to: string } | null {
  if (value.preset === "all") return null
  const end = isoDay(today)
  if (value.preset === "7") return { from: isoDay(addDays(today, -6)), to: end }
  if (value.preset === "30") return { from: isoDay(addDays(today, -29)), to: end }
  if (value.preset === "90") return { from: isoDay(addDays(today, -89)), to: end }
  if (value.preset === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { from: isoDay(start), to: isoDay(last) }
  }
  if (!value.from && !value.to) return null
  if (value.from && value.to && value.from > value.to) return { from: value.to, to: value.from }
  return { from: value.from || "0000-01-01", to: value.to || "9999-12-31" }
}

/** Calendar day of a date-only string or a datetime, in local time. */
export function dayOf(value?: string | null): string {
  if (!value) return ""
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) return isoDay(parsed)
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/)
  return match?.[1] ?? ""
}

export function dateInPeriod(value: string | null | undefined, period: PeriodValue, today?: Date): boolean {
  const range = periodRange(period, today)
  if (!range) return true
  const day = dayOf(value)
  if (!day) return false
  return day >= range.from && day <= range.to
}

/** A row stays when any of its date columns falls in the window. */
export function anyDateInPeriod(values: Array<string | null | undefined>, period: PeriodValue, today?: Date): boolean {
  const range = periodRange(period, today)
  if (!range) return true
  return values.some((value) => dateInPeriod(value, period, today))
}

/** A campaign stays when its start–end window overlaps the selected period. */
export function rangeOverlapsPeriod(
  start: string | null | undefined,
  end: string | null | undefined,
  period: PeriodValue,
  today?: Date,
): boolean {
  const range = periodRange(period, today)
  if (!range) return true
  const from = dayOf(start)
  const to = dayOf(end)
  const startDay = from || to
  const endDay = to || from
  if (!startDay || !endDay) return false
  return startDay <= range.to && endDay >= range.from
}
