"use client"

import { useLayoutEffect, useRef, useState } from "react"
import {
  Activity,
  BarChart3,
  DollarSign,
  Eye,
  Heart,
  LineChart,
  Medal,
  Megaphone,
  MousePointerClick,
  PieChart,
  Radio,
  Search,
  ShoppingBag,
  Table2,
  Trophy,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"
import { WidgetView } from "@/components/dashboard/widget-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { WIDGETS, type WidgetCategory, type WidgetId } from "@/lib/dashboard/layout"
import { useDashboardStore } from "@/lib/stores/dashboard"

const ICONS: Record<WidgetId, LucideIcon> = {
  "active-campaigns": Megaphone,
  creators: Users,
  investment: DollarSign,
  roi: TrendingUp,
  reach: Eye,
  engagement: Heart,
  clicks: MousePointerClick,
  revenue: DollarSign,
  "monthly-overview": Activity,
  "reach-revenue": LineChart,
  "investment-vs-revenue": BarChart3,
  "reach-by-network": PieChart,
  "engagement-by-network": Heart,
  "campaign-reach": Radio,
  "campaign-engagement": Activity,
  "campaigns-by-month": BarChart3,
  "top-creators": Trophy,
  "recent-campaigns": Megaphone,
  "influencer-ranking": Medal,
  "campaigns-table": Table2,
  "tracked-sales": ShoppingBag,
}

const FILTERS: { id: "all" | WidgetCategory; labelKey: MessageKey }[] = [
  { id: "all", labelKey: "dashboard.category.all" },
  { id: "numbers", labelKey: "dashboard.category.numbers" },
  { id: "charts", labelKey: "dashboard.category.charts" },
  { id: "lists", labelKey: "dashboard.category.lists" },
]

const STAGE_WIDTH = 720

function CardPreview({ widget, category }: { widget: WidgetId; category: WidgetCategory }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const stageHeight = category === "numbers" ? 148 : 340

  useLayoutEffect(() => {
    const node = frameRef.current
    if (!node) return
    const measure = () => setWidth(node.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const scale = width > 0 ? width / STAGE_WIDTH : 0

  return (
    <div
      ref={frameRef}
      className="relative mt-3 overflow-hidden rounded-lg bg-zinc-50 ring-1 ring-zinc-200"
      style={{ height: scale > 0 ? Math.round(stageHeight * scale) : 112 }}
      aria-hidden
    >
      {scale > 0 ? (
        <div
          className="pointer-events-none absolute top-0 left-0 origin-top-left"
          style={{ width: STAGE_WIDTH, height: stageHeight, transform: `scale(${scale})` }}
        >
          <Card className="h-full gap-0 overflow-hidden py-0 shadow-sm">
            <WidgetView widget={widget} />
          </Card>
        </div>
      ) : null}
    </div>
  )
}

export function AddCardSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useI18n()
  const cards = useDashboardStore((state) => state.cards)
  const addWidget = useDashboardStore((state) => state.addWidget)
  const removeWidget = useDashboardStore((state) => state.removeWidget)
  const reset = useDashboardStore((state) => state.reset)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | WidgetCategory>("all")
  const present = new Set(cards.map((card) => card.id))
  const normalized = query.trim().toLocaleLowerCase()

  function handleOpenChange(next: boolean) {
    if (!next) {
      setQuery("")
      setFilter("all")
    }
    onOpenChange(next)
  }

  const groups = (["numbers", "charts", "lists"] as const)
    .filter((category) => filter === "all" || filter === category)
    .map((category) => ({
      category,
      widgets: WIDGETS.filter((widget) => {
        if (widget.category !== category) return false
        if (!normalized) return true
        const title = t(widget.titleKey).toLocaleLowerCase()
        const description = t(widget.descriptionKey).toLocaleLowerCase()
        return title.includes(normalized) || description.includes(normalized)
      }),
    }))
    .filter((group) => group.widgets.length > 0)

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="gap-0 p-0"
        style={{ width: "min(960px, 100vw)", maxWidth: "min(960px, 100vw)" }}
      >
        <SheetHeader className="border-b border-zinc-200 pr-12">
          <SheetTitle>{t("dashboard.addCardTitle")}</SheetTitle>
          <SheetDescription>{t("dashboard.addCardHelp")}</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("dashboard.searchCards")}
              className="pl-8"
            />
          </div>
          <Tabs value={filter} onValueChange={(value) => setFilter(value === "numbers" || value === "charts" || value === "lists" ? value : "all")}>
            <TabsList className="grid w-full grid-cols-4">
              {FILTERS.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="px-1 text-xs">
                  {t(item.labelKey)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-5 px-4 pb-4">
            {groups.length === 0 ? (
              <p className="px-1 py-8 text-center text-sm text-zinc-400">{t("dashboard.noCardsFound")}</p>
            ) : (
              groups.map((group) => (
                <section key={group.category}>
                  <h3 className="mb-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">
                    {t(
                      group.category === "numbers"
                        ? "dashboard.category.numbers"
                        : group.category === "charts"
                          ? "dashboard.category.charts"
                          : "dashboard.category.lists",
                    )}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 min-[760px]:grid-cols-2">
                    {group.widgets.map((widget) => {
                      const added = present.has(widget.id)
                      const Icon = ICONS[widget.id]
                      return (
                        <div
                          key={widget.id}
                          className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                          onClick={() => (added ? removeWidget(widget.id) : addWidget(widget.id))}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-zinc-900">{t(widget.titleKey)}</p>
                                {added ? (
                                  <Badge variant="secondary">{t("dashboard.onDashboard")}</Badge>
                                ) : null}
                              </div>
                              <p className="mt-0.5 text-xs text-zinc-500">{t(widget.descriptionKey)}</p>
                            </div>
                          </div>
                          {open ? <CardPreview widget={widget.id} category={widget.category} /> : null}
                          <div className="mt-3 flex justify-end">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={(event) => {
                                event.stopPropagation()
                                if (added) removeWidget(widget.id)
                                else addWidget(widget.id)
                              }}
                            >
                              {added ? t("dashboard.removeCard") : t("dashboard.add")}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="border-t border-zinc-200">
          <Button type="button" variant="outline" onClick={() => reset()}>
            {t("dashboard.restore")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
