import type { MessageKey } from "@/lib/i18n"

export const GRID_COLS = 12
export const ROW_HEIGHT = 52
export const GRID_GAP = 12

export const WIDGET_IDS = [
  "active-campaigns",
  "creators",
  "investment",
  "roi",
  "reach",
  "engagement",
  "clicks",
  "revenue",
  "monthly-overview",
  "reach-revenue",
  "investment-vs-revenue",
  "reach-by-network",
  "engagement-by-network",
  "campaign-reach",
  "campaign-engagement",
  "campaigns-by-month",
  "top-creators",
  "recent-campaigns",
  "influencer-ranking",
  "campaigns-table",
  "tracked-sales",
] as const

export type WidgetId = (typeof WIDGET_IDS)[number]
export type WidgetCategory = "numbers" | "charts" | "lists"

export type CardSize = {
  w: number
  h: number
  labelKey: MessageKey
}

export type DashboardCard = {
  id: string
  widget: WidgetId
  x: number
  y: number
  w: number
  h: number
}

export type WidgetDef = {
  id: WidgetId
  category: WidgetCategory
  titleKey: MessageKey
  descriptionKey: MessageKey
  sizes: CardSize[]
  defaultSize: number
}

const KPI_SIZES: CardSize[] = [
  { w: 3, h: 2, labelKey: "dashboard.size.compact" },
  { w: 4, h: 2, labelKey: "dashboard.size.medium" },
  { w: 6, h: 2, labelKey: "dashboard.size.wide" },
]

const CHART_SIZES: CardSize[] = [
  { w: 4, h: 6, labelKey: "dashboard.size.third" },
  { w: 6, h: 6, labelKey: "dashboard.size.half" },
  { w: 8, h: 6, labelKey: "dashboard.size.twoThirds" },
  { w: 12, h: 6, labelKey: "dashboard.size.full" },
  { w: 6, h: 8, labelKey: "dashboard.size.halfTall" },
  { w: 12, h: 8, labelKey: "dashboard.size.fullTall" },
]

const LIST_SIZES: CardSize[] = [
  { w: 4, h: 6, labelKey: "dashboard.size.third" },
  { w: 6, h: 6, labelKey: "dashboard.size.half" },
  { w: 8, h: 6, labelKey: "dashboard.size.twoThirds" },
  { w: 12, h: 6, labelKey: "dashboard.size.full" },
  { w: 6, h: 8, labelKey: "dashboard.size.halfTall" },
]

export const WIDGETS: WidgetDef[] = [
  {
    id: "active-campaigns",
    category: "numbers",
    titleKey: "dashboard.activeCampaigns",
    descriptionKey: "dashboard.widget.activeCampaignsDesc",
    sizes: KPI_SIZES,
    defaultSize: 0,
  },
  {
    id: "creators",
    category: "numbers",
    titleKey: "dashboard.creatorsInBase",
    descriptionKey: "dashboard.widget.creatorsDesc",
    sizes: KPI_SIZES,
    defaultSize: 0,
  },
  {
    id: "investment",
    category: "numbers",
    titleKey: "dashboard.totalInvestment",
    descriptionKey: "dashboard.widget.investmentDesc",
    sizes: KPI_SIZES,
    defaultSize: 0,
  },
  {
    id: "roi",
    category: "numbers",
    titleKey: "dashboard.averageRoi",
    descriptionKey: "dashboard.widget.roiDesc",
    sizes: KPI_SIZES,
    defaultSize: 0,
  },
  {
    id: "reach",
    category: "numbers",
    titleKey: "dashboard.totalReach",
    descriptionKey: "dashboard.widget.reachDesc",
    sizes: KPI_SIZES,
    defaultSize: 0,
  },
  {
    id: "engagement",
    category: "numbers",
    titleKey: "dashboard.totalEngagement",
    descriptionKey: "dashboard.widget.engagementDesc",
    sizes: KPI_SIZES,
    defaultSize: 0,
  },
  {
    id: "clicks",
    category: "numbers",
    titleKey: "dashboard.clicks",
    descriptionKey: "dashboard.widget.clicksDesc",
    sizes: KPI_SIZES,
    defaultSize: 0,
  },
  {
    id: "revenue",
    category: "numbers",
    titleKey: "dashboard.revenueGenerated",
    descriptionKey: "dashboard.widget.revenueDesc",
    sizes: KPI_SIZES,
    defaultSize: 0,
  },
  {
    id: "monthly-overview",
    category: "charts",
    titleKey: "dashboard.monthlyView",
    descriptionKey: "dashboard.widget.monthlyDesc",
    sizes: CHART_SIZES,
    defaultSize: 2,
  },
  {
    id: "reach-revenue",
    category: "charts",
    titleKey: "dashboard.reachRevenue",
    descriptionKey: "dashboard.widget.reachRevenueDesc",
    sizes: CHART_SIZES,
    defaultSize: 1,
  },
  {
    id: "investment-vs-revenue",
    category: "charts",
    titleKey: "dashboard.investmentVsRevenue",
    descriptionKey: "dashboard.widget.investmentChartDesc",
    sizes: CHART_SIZES,
    defaultSize: 1,
  },
  {
    id: "reach-by-network",
    category: "charts",
    titleKey: "dashboard.reachByNetwork",
    descriptionKey: "dashboard.widget.networkDesc",
    sizes: CHART_SIZES,
    defaultSize: 0,
  },
  {
    id: "campaign-reach",
    category: "charts",
    titleKey: "dashboard.campaignReach",
    descriptionKey: "dashboard.widget.campaignReachDesc",
    sizes: CHART_SIZES,
    defaultSize: 1,
  },
  {
    id: "campaign-engagement",
    category: "charts",
    titleKey: "dashboard.campaignEngagement",
    descriptionKey: "dashboard.widget.campaignEngagementDesc",
    sizes: CHART_SIZES,
    defaultSize: 1,
  },
  {
    id: "campaigns-by-month",
    category: "charts",
    titleKey: "dashboard.campaignsByMonth",
    descriptionKey: "dashboard.widget.byMonthDesc",
    sizes: CHART_SIZES,
    defaultSize: 1,
  },
  {
    id: "top-creators",
    category: "charts",
    titleKey: "dashboard.topCreators",
    descriptionKey: "dashboard.widget.topCreatorsDesc",
    sizes: CHART_SIZES,
    defaultSize: 4,
  },
  {
    id: "engagement-by-network",
    category: "lists",
    titleKey: "dashboard.engagementByNetwork",
    descriptionKey: "dashboard.widget.engagementNetworkDesc",
    sizes: LIST_SIZES,
    defaultSize: 4,
  },
  {
    id: "recent-campaigns",
    category: "lists",
    titleKey: "dashboard.recentCampaigns",
    descriptionKey: "dashboard.widget.recentDesc",
    sizes: LIST_SIZES,
    defaultSize: 1,
  },
  {
    id: "influencer-ranking",
    category: "lists",
    titleKey: "dashboard.rankingTitle",
    descriptionKey: "dashboard.widget.rankingDesc",
    sizes: LIST_SIZES,
    defaultSize: 1,
  },
  {
    id: "tracked-sales",
    category: "lists",
    titleKey: "dashboard.trackedSales",
    descriptionKey: "dashboard.widget.salesDesc",
    sizes: LIST_SIZES,
    defaultSize: 1,
  },
  {
    id: "campaigns-table",
    category: "lists",
    titleKey: "dashboard.campaignsTable",
    descriptionKey: "dashboard.widget.tableDesc",
    sizes: LIST_SIZES,
    defaultSize: 3,
  },
]

const WIDGET_BY_ID = Object.fromEntries(WIDGETS.map((widget) => [widget.id, widget])) as Record<WidgetId, WidgetDef>

export function isWidgetId(value: string): value is WidgetId {
  return Object.prototype.hasOwnProperty.call(WIDGET_BY_ID, value)
}

export function widgetById(id: WidgetId) {
  return WIDGET_BY_ID[id]
}

export function nearestSize(sizes: CardSize[], w: number, h: number) {
  return sizes.reduce((best, size) => {
    const bestScore = Math.abs(best.w - w) * 2 + Math.abs(best.h - h)
    const score = Math.abs(size.w - w) * 2 + Math.abs(size.h - h)
    return score < bestScore ? size : best
  })
}

function overlaps(
  a: Pick<DashboardCard, "x" | "y" | "w" | "h">,
  b: Pick<DashboardCard, "x" | "y" | "w" | "h">,
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function compact(cards: DashboardCard[], priorityId?: string) {
  const sorted = [...cards].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y
    if (a.x !== b.x) return a.x - b.x
    if (a.id === priorityId) return -1
    if (b.id === priorityId) return 1
    return 0
  })
  const placed: DashboardCard[] = []
  for (const card of sorted) {
    let y = 0
    while (placed.some((other) => overlaps({ ...card, y }, other))) y += 1
    placed.push({ ...card, y })
  }
  return placed
}

export function sameLayout(a: DashboardCard[], b: DashboardCard[]) {
  if (a.length !== b.length) return false
  const byId = new Map(b.map((card) => [card.id, card]))
  return a.every((card) => {
    const other = byId.get(card.id)
    return !!other && other.x === card.x && other.y === card.y && other.w === card.w && other.h === card.h
  })
}

export function moveCard(cards: DashboardCard[], id: string, x: number, y: number) {
  const current = cards.find((card) => card.id === id)
  if (!current) return cards
  const nextX = Math.max(0, Math.min(x, GRID_COLS - current.w))
  const nextY = Math.max(0, y)
  const moved = cards.map((card) => (card.id === id ? { ...card, x: nextX, y: nextY } : card))
  return compact(moved, id)
}

export function resizeCard(cards: DashboardCard[], id: string, w: number, h: number) {
  const current = cards.find((card) => card.id === id)
  if (!current) return cards
  const size = nearestSize(widgetById(current.widget).sizes, w, h)
  const nextX = Math.max(0, Math.min(current.x, GRID_COLS - size.w))
  const moved = cards.map((card) =>
    card.id === id ? { ...card, x: nextX, w: size.w, h: size.h } : card,
  )
  return compact(moved, id)
}

export function applySize(cards: DashboardCard[], id: string, size: CardSize) {
  return resizeCard(cards, id, size.w, size.h)
}

function pack(specs: { widget: WidgetId; sizeIndex: number }[]): DashboardCard[] {
  let x = 0
  let y = 0
  let rowHeight = 0
  const cards: DashboardCard[] = []
  for (const spec of specs) {
    const widget = widgetById(spec.widget)
    const size = widget.sizes[spec.sizeIndex] ?? widget.sizes[0]
    if (x + size.w > GRID_COLS) {
      y += rowHeight
      x = 0
      rowHeight = 0
    }
    cards.push({ id: spec.widget, widget: spec.widget, x, y, w: size.w, h: size.h })
    x += size.w
    rowHeight = Math.max(rowHeight, size.h)
  }
  return cards
}

export function buildDefaultLayout() {
  return pack([
    { widget: "active-campaigns", sizeIndex: 0 },
    { widget: "creators", sizeIndex: 0 },
    { widget: "investment", sizeIndex: 0 },
    { widget: "roi", sizeIndex: 0 },
    { widget: "reach", sizeIndex: 0 },
    { widget: "engagement", sizeIndex: 0 },
    { widget: "clicks", sizeIndex: 0 },
    { widget: "revenue", sizeIndex: 0 },
    { widget: "monthly-overview", sizeIndex: 2 },
    { widget: "reach-by-network", sizeIndex: 0 },
    { widget: "reach-revenue", sizeIndex: 1 },
    { widget: "investment-vs-revenue", sizeIndex: 1 },
    { widget: "recent-campaigns", sizeIndex: 1 },
    { widget: "influencer-ranking", sizeIndex: 1 },
    { widget: "campaign-reach", sizeIndex: 1 },
    { widget: "campaign-engagement", sizeIndex: 1 },
    { widget: "campaigns-by-month", sizeIndex: 1 },
    { widget: "tracked-sales", sizeIndex: 1 },
    { widget: "top-creators", sizeIndex: 4 },
    { widget: "engagement-by-network", sizeIndex: 4 },
    { widget: "campaigns-table", sizeIndex: 3 },
  ])
}

export function appendWidget(cards: DashboardCard[], widget: WidgetId) {
  if (cards.some((card) => card.widget === widget)) return cards
  const def = widgetById(widget)
  const size = def.sizes[def.defaultSize] ?? def.sizes[0]
  const y = cards.reduce((max, card) => Math.max(max, card.y + card.h), 0)
  return compact([...cards, { id: widget, widget, x: 0, y, w: size.w, h: size.h }])
}

export function removeCard(cards: DashboardCard[], id: string) {
  return compact(cards.filter((card) => card.id !== id))
}

export function sanitizeCards(input: unknown): DashboardCard[] {
  if (!Array.isArray(input)) return buildDefaultLayout()
  const cards: DashboardCard[] = []
  const seen = new Set<string>()
  for (const item of input) {
    if (!item || typeof item !== "object") continue
    const card = item as Partial<DashboardCard>
    if (typeof card.widget !== "string" || !isWidgetId(card.widget) || seen.has(card.widget)) continue
    seen.add(card.widget)
    const def = widgetById(card.widget)
    const fallback = def.sizes[def.defaultSize] ?? def.sizes[0]
    const w = typeof card.w === "number" ? card.w : fallback.w
    const h = typeof card.h === "number" ? card.h : fallback.h
    const size = nearestSize(def.sizes, w, h)
    const x = typeof card.x === "number" ? card.x : 0
    const y = typeof card.y === "number" ? card.y : 0
    cards.push({
      id: card.widget,
      widget: card.widget,
      x: Math.max(0, Math.min(x, GRID_COLS - size.w)),
      y: Math.max(0, y),
      w: size.w,
      h: size.h,
    })
  }
  return compact(cards)
}

export function columnWidth(containerWidth: number) {
  return (containerWidth - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS
}

export function cardBox(card: Pick<DashboardCard, "x" | "y" | "w" | "h">, col: number) {
  return {
    left: card.x * (col + GRID_GAP),
    top: card.y * (ROW_HEIGHT + GRID_GAP),
    width: card.w * col + Math.max(0, card.w - 1) * GRID_GAP,
    height: card.h * ROW_HEIGHT + Math.max(0, card.h - 1) * GRID_GAP,
  }
}

export function canvasHeight(cards: DashboardCard[]) {
  const bottom = cards.reduce((max, card) => Math.max(max, card.y + card.h), 0)
  if (bottom === 0) return 0
  return bottom * ROW_HEIGHT + (bottom - 1) * GRID_GAP
}

export function stackLayout(cards: DashboardCard[]) {
  const sorted = [...cards].sort((a, b) => a.y - b.y || a.x - b.x)
  let y = 0
  return sorted.map((card) => {
    const next = { ...card, x: 0, y, w: GRID_COLS }
    y += card.h
    return next
  })
}
