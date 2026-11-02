"use client"

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { Check, GripHorizontal, Trash2 } from "lucide-react"
import { WidgetView } from "@/components/dashboard/widget-view"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n"
import {
  canvasHeight,
  cardBox,
  columnWidth,
  GRID_COLS,
  GRID_GAP,
  moveCard,
  resizeCard,
  ROW_HEIGHT,
  sameLayout,
  stackLayout,
  widgetById,
  type DashboardCard,
} from "@/lib/dashboard/layout"
import { useDashboardStore } from "@/lib/stores/dashboard"
import { cn } from "cn"

type DragSession = {
  kind: "drag"
  id: string
  grabX: number
  grabY: number
  width: number
  height: number
}

type ResizeSession = {
  kind: "resize"
  id: string
  startX: number
  startY: number
  originW: number
  originH: number
}

type Session = DragSession | ResizeSession

function ResizeGlyph() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
      <path d="M10 2.5v7.5H2.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 6.5v3.5H6.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function DashboardCanvas({ onAdd, editable = true }: { onAdd: () => void; editable?: boolean }) {
  const { t } = useI18n()
  const cards = useDashboardStore((state) => state.cards)
  const setCards = useDashboardStore((state) => state.setCards)
  const removeWidget = useDashboardStore((state) => state.removeWidget)
  const setCardSize = useDashboardStore((state) => state.setCardSize)
  const highlightedId = useDashboardStore((state) => state.highlightedId)
  const clearHighlight = useDashboardStore((state) => state.clearHighlight)
  const gridRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef(cards)
  const previewRef = useRef<DashboardCard[] | null>(null)
  const sessionRef = useRef<Session | null>(null)
  const colRef = useRef(0)
  const [colWidth, setColWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [preview, setPreview] = useState<DashboardCard[] | null>(null)
  const [mode, setMode] = useState<"idle" | "drag" | "resize">("idle")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [ghost, setGhost] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

  useLayoutEffect(() => {
    cardsRef.current = cards
    previewRef.current = preview
    colRef.current = colWidth
  })

  const stacked = containerWidth > 0 && containerWidth < 900
  const layout = stacked ? stackLayout(cards) : (preview ?? cards)

  useEffect(() => {
    const node = gridRef.current
    if (!node) return
    const measure = () => {
      const width = node.clientWidth
      setContainerWidth(width)
      setColWidth(columnWidth(width))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [cards.length])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const session = sessionRef.current
      const grid = gridRef.current
      const col = colRef.current
      if (!session || !grid || col <= 0) return
      if (event.clientY > window.innerHeight - 72) window.scrollBy(0, 16)
      else if (event.clientY < 96) window.scrollBy(0, -16)
      const rect = grid.getBoundingClientRect()

      if (session.kind === "drag") {
        setGhost({
          x: event.clientX - session.grabX,
          y: event.clientY - session.grabY,
          width: session.width,
          height: session.height,
        })
        const left = event.clientX - session.grabX - rect.left
        const top = event.clientY - session.grabY - rect.top
        const x = Math.round(left / (col + GRID_GAP))
        const y = Math.round(top / (ROW_HEIGHT + GRID_GAP))
        const next = moveCard(cardsRef.current, session.id, x, y)
        setPreview((current) => (current && sameLayout(current, next) ? current : next))
        previewRef.current = next
        return
      }

      const w = session.originW + Math.round((event.clientX - session.startX) / (col + GRID_GAP))
      const h = session.originH + Math.round((event.clientY - session.startY) / (ROW_HEIGHT + GRID_GAP))
      const next = resizeCard(cardsRef.current, session.id, w, h)
      setPreview((current) => (current && sameLayout(current, next) ? current : next))
      previewRef.current = next
    }

    const onUp = () => {
      if (!sessionRef.current) return
      sessionRef.current = null
      const next = previewRef.current
      if (next && !sameLayout(next, cardsRef.current)) setCards(next)
      previewRef.current = null
      setPreview(null)
      setGhost(null)
      setMode("idle")
      setActiveId(null)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [setCards])

  useEffect(() => {
    if (mode === "idle") return
    const previousUserSelect = document.body.style.userSelect
    const previousCursor = document.body.style.cursor
    document.body.style.userSelect = "none"
    document.body.style.cursor = mode === "drag" ? "grabbing" : "nwse-resize"
    return () => {
      document.body.style.userSelect = previousUserSelect
      document.body.style.cursor = previousCursor
    }
  }, [mode])

  useEffect(() => {
    if (!highlightedId) return
    document.getElementById(`dashboard-card-${highlightedId}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    const timeout = window.setTimeout(() => clearHighlight(), 1600)
    return () => window.clearTimeout(timeout)
  }, [clearHighlight, highlightedId])

  function beginDrag(event: ReactPointerEvent, card: DashboardCard) {
    if (stacked || event.button !== 0) return
    const frame = (event.currentTarget as HTMLElement).closest("[data-dashboard-card]")
    if (!(frame instanceof HTMLElement)) return
    const rect = frame.getBoundingClientRect()
    const session: DragSession = {
      kind: "drag",
      id: card.id,
      grabX: event.clientX - rect.left,
      grabY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    }
    sessionRef.current = session
    previewRef.current = cardsRef.current
    setPreview(cardsRef.current)
    setGhost({ x: rect.left, y: rect.top, width: rect.width, height: rect.height })
    setActiveId(card.id)
    setMode("drag")
  }

  function beginResize(event: ReactPointerEvent, card: DashboardCard) {
    if (stacked || event.button !== 0) return
    const session: ResizeSession = {
      kind: "resize",
      id: card.id,
      startX: event.clientX,
      startY: event.clientY,
      originW: card.w,
      originH: card.h,
    }
    sessionRef.current = session
    previewRef.current = cardsRef.current
    setPreview(cardsRef.current)
    setActiveId(card.id)
    setMode("resize")
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-zinc-900">{t("dashboard.emptyTitle")}</p>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">{t("dashboard.emptyBody")}</p>
        {editable ? (
          <Button type="button" variant="outline" className="mt-4" onClick={onAdd}>
            {t("dashboard.addCard")}
          </Button>
        ) : null}
      </div>
    )
  }

  const active = layout.find((card) => card.id === activeId)
  const placeholder = mode === "drag" && active && colWidth > 0 ? cardBox(active, colWidth) : null
  const rowCount = Math.max(1, layout.reduce((max, card) => Math.max(max, card.y + card.h), 0))

  return (
    <div
      ref={gridRef}
      className="relative isolate"
      style={{ height: colWidth > 0 ? canvasHeight(layout) : 640 }}
    >
      <span className="hidden fill-rose-500 fill-emerald-500 fill-sky-500 fill-violet-500 fill-amber-500 text-rose-500 text-emerald-500 text-sky-500 text-violet-500 text-amber-500 stroke-rose-500 stroke-emerald-500 stroke-sky-500 stroke-violet-500 stroke-amber-500" />
      {mode !== "idle" && !stacked ? (
        <div
          className="pointer-events-none absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)`,
            gap: GRID_GAP,
          }}
          aria-hidden
        >
          {Array.from({ length: GRID_COLS * rowCount }, (_, index) => (
            <div key={index} className="rounded-md bg-zinc-200/50" />
          ))}
        </div>
      ) : null}
      {colWidth === 0
        ? Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="mb-3 h-28 w-full rounded-xl" />)
        : null}
      {placeholder ? (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border-2 border-dashed border-zinc-400 bg-white/70"
          style={placeholder}
        />
      ) : null}
      {colWidth > 0
        ? layout.map((card) => {
            const dragging = mode === "drag" && card.id === activeId && ghost
            const box = cardBox(card, stacked ? columnWidth(containerWidth) : colWidth)
            const def = widgetById(card.widget)
            return (
              <Card
                key={card.id}
                id={`dashboard-card-${card.id}`}
                data-dashboard-card
                className={cn(
                  "group absolute gap-0 overflow-visible py-0 shadow-sm",
                  dragging && "z-50 shadow-2xl ring-2 ring-zinc-900/10",
                  mode !== "drag" && "hover:z-30",
                  mode === "resize" && card.id === activeId && "z-30 ring-2 ring-zinc-900/20",
                  highlightedId === card.id && mode === "idle" && "ring-2 ring-zinc-900",
                )}
                style={
                  dragging
                    ? {
                        position: "fixed",
                        zIndex: 60,
                        left: ghost.x,
                        top: ghost.y,
                        width: ghost.width,
                        height: ghost.height,
                        transition: "none",
                      }
                    : {
                        left: box.left,
                        top: box.top,
                        width: box.width,
                        height: box.height,
                        transition:
                          mode === "resize" && card.id === activeId
                            ? "none"
                            : "left 180ms ease, top 180ms ease, width 180ms ease, height 180ms ease",
                      }
                }
              >
                <div
                  className={cn(
                    "h-full min-h-0",
                    def.category === "lists" ? "overflow-auto" : "overflow-visible",
                  )}
                >
                  <WidgetView widget={card.widget} />
                </div>
                {editable ? (
                <div
                  className={cn(
                    "absolute top-2 right-2 z-20",
                    stacked ? "opacity-100" : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100",
                  )}
                >
                  <ActionsMenu
                    trigger="ellipsis"
                    items={[
                      ...def.sizes.map((size) => ({
                        label: t(size.labelKey),
                        icon: card.w === size.w && card.h === size.h ? Check : undefined,
                        disabled: card.w === size.w && card.h === size.h,
                        onSelect: () => setCardSize(card.id, size),
                      })),
                      {
                        label: t("dashboard.removeCard"),
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => removeWidget(card.id),
                      },
                    ]}
                  />
                </div>
                ) : null}
                {editable && !stacked ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={t("dashboard.drag")}
                      className="pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 cursor-grab opacity-0 shadow-sm group-hover:pointer-events-auto group-hover:opacity-100 active:cursor-grabbing"
                      onPointerDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        beginDrag(event, card)
                      }}
                    >
                      <GripHorizontal />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("dashboard.resize")}
                      className="pointer-events-none absolute right-1 bottom-1 z-20 cursor-nwse-resize text-zinc-400 opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
                      onPointerDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        beginResize(event, card)
                      }}
                    >
                      <ResizeGlyph />
                    </Button>
                    {mode === "resize" && card.id === activeId ? (
                      <span className="pointer-events-none absolute right-3 bottom-9 z-20 rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white">
                        {t("dashboard.size.cells", { w: card.w, h: card.h })}
                      </span>
                    ) : null}
                  </>
                ) : null}
              </Card>
            )
          })
        : null}
    </div>
  )
}
