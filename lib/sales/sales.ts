// Pure rules of the Marca's Sales screen: money, status badges, the query of
// a period and the totals of what was loaded.
import type { BrandSaleView, SalesQuery } from "../api/sales"
import { periodRange, type PeriodValue } from "../period"

export const SALE_STATUSES = [
  "unattributed",
  "pending",
  "consolidated",
  "not_consolidated",
  "partially_refunded",
  "refunded",
] as const
export type SaleStatus = (typeof SALE_STATUSES)[number]

export type BadgeTone = "neutral" | "muted" | "warning" | "success" | "danger"

export interface SaleStatusBadge {
  labelKey: `sales.status.${SaleStatus}` | "sales.status.unknown"
  tone: BadgeTone
}

const TONE: Record<SaleStatus, BadgeTone> = {
  unattributed: "neutral",
  pending: "warning",
  consolidated: "success",
  not_consolidated: "muted",
  partially_refunded: "warning",
  refunded: "danger",
}

function isSaleStatus(value: unknown): value is SaleStatus {
  return typeof value === "string" && (SALE_STATUSES as readonly string[]).includes(value)
}

// A status the screen does not know yet shows as a neutral "other".
export function saleStatusBadge(status: string | null | undefined): SaleStatusBadge {
  if (!isSaleStatus(status)) return { labelKey: "sales.status.unknown", tone: "neutral" }
  return { labelKey: `sales.status.${status}`, tone: TONE[status] }
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export function formatCents(cents: number): string {
  return BRL.format(cents / 100)
}

function parseDay(day: string) {
  const [year, month, date] = day.split("-").map(Number)
  return new Date(year, month - 1, date)
}

// The period is in local days; the API takes UTC instants, from inclusive and
// to exclusive, so "to" is the local midnight after the last day. An open end
// of a custom period is left out. `today` is fixed by the caller so the next
// pages repeat exactly the same window.
export function buildSalesQuery(period: PeriodValue, options: { today: Date; cursor?: string | null }): SalesQuery {
  const query: SalesQuery = {}
  const range = periodRange(period, options.today)
  if (range) {
    if (range.from !== "0000-01-01") query.from = parseDay(range.from).toISOString()
    if (range.to !== "9999-12-31") {
      const end = parseDay(range.to)
      end.setDate(end.getDate() + 1)
      query.to = end.toISOString()
    }
  }
  if (options.cursor) query.cursor = options.cursor
  return query
}

export function summarize(items: readonly Pick<BrandSaleView, "grossAmountCents">[]) {
  return {
    orders: items.length,
    grossCents: items.reduce((sum, item) => sum + item.grossAmountCents, 0),
  }
}

// The API returns only the Creator's id; the short form stays readable.
export function shortId(id: string) {
  return id.length > 8 ? id.slice(0, 8) : id
}
