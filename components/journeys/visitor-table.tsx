"use client"

import { useState } from "react"
import { ChevronRight, Kanban, List, MapPin, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PeriodFilter } from "@/components/ui/period-filter"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"
import { ALL_PERIOD, dateInPeriod, type PeriodValue } from "@/lib/period"
import { formatBrl, latestTouch, visitorDisplayName, type Visitor, type VisitorStatus } from "@/lib/mock-data/journeys"

const STATUS_CLASS: Record<VisitorStatus, string> = {
  visitor: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  cart: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  checkout: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  customer: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  abandoned: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
}

type StatusFilter = "all" | VisitorStatus
type VisitorView = "list" | "kanban"

const STAGES: VisitorStatus[] = ["visitor", "cart", "checkout", "customer", "abandoned"]

export function VisitorTable({
  visitors,
  place,
  onSelect,
}: {
  visitors: Visitor[]
  place?: string | null
  onSelect: (id: string) => void
}) {
  const { locale, t } = useI18n()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [view, setView] = useState<VisitorView>("list")
  const [period, setPeriod] = useState<PeriodValue>(ALL_PERIOD)
  const dateLocale = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR"

  const searched = visitors.filter((visitor) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    if (visitorDisplayName(visitor).toLowerCase().includes(q)) return true
    if (visitor.location && `${visitor.location.city} ${visitor.location.state}`.toLowerCase().includes(q)) return true
    return visitor.touches.some(
      (touch) => touch.creatorName.toLowerCase().includes(q) || touch.creatorHandle.toLowerCase().includes(q)
    )
  }).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))

  const filtered = status === "all" ? searched : searched.filter((visitor) => visitor.status === status)
  const inPeriod = filtered.filter((visitor) => dateInPeriod(visitor.firstSeenAt, period))
  const shown = view === "kanban" ? searched : inPeriod

  function statusLabel(value: VisitorStatus) {
    if (value === "visitor") return t("journeys.statusVisitor")
    if (value === "cart") return t("journeys.statusCart")
    if (value === "checkout") return t("journeys.statusCheckout")
    if (value === "customer") return t("journeys.statusCustomer")
    return t("journeys.statusAbandoned")
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(dateLocale, { day: "2-digit", month: "short", year: "numeric" })
  }

  function openVisitor(id: string) {
    onSelect(id)
  }

  const filters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: t("journeys.filterAll") },
    { value: "customer", label: t("journeys.statusCustomer") },
    { value: "checkout", label: t("journeys.statusCheckout") },
    { value: "cart", label: t("journeys.statusCart") },
    { value: "abandoned", label: t("journeys.statusAbandoned") },
    { value: "visitor", label: t("journeys.statusVisitor") },
  ]

  const countLabel = shown.length === 1
    ? t("journeys.visitorOne", { count: shown.length })
    : t("journeys.visitorMany", { count: shown.length })

  return (
    <div>
      <div className="flex flex-col gap-3 border-b px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {place ? `${place} · ${countLabel}` : countLabel}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("journeys.search")}
                aria-label={t("journeys.search")}
                className="pl-8"
              />
            </div>
            <div className="flex items-center overflow-hidden rounded-lg border border-border">
              <Button
                size="icon-sm"
                variant={view === "list" ? "default" : "ghost"}
                className="rounded-none"
                aria-label={t("journeys.viewList")}
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                <List />
              </Button>
              <Button
                size="icon-sm"
                variant={view === "kanban" ? "default" : "ghost"}
                className="rounded-none"
                aria-label={t("journeys.viewKanban")}
                aria-pressed={view === "kanban"}
                onClick={() => setView("kanban")}
              >
                <Kanban />
              </Button>
            </div>
          </div>
        </div>
        {view === "list" ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="overflow-x-auto overflow-y-hidden">
              <Tabs value={status} onValueChange={(value) => setStatus((value as StatusFilter) || "all")}>
                <TabsList>
                  {filters.map((filter) => (
                    <TabsTrigger key={filter.value} value={filter.value}>
                      {filter.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>
        ) : null}
      </div>

      {view === "kanban" ? (
        <VisitorKanban
          visitors={searched}
          statusLabel={statusLabel}
          onOpen={openVisitor}
          emptyLabel={t("journeys.columnEmpty")}
        />
      ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">{t("journeys.colVisitor")}</TableHead>
            <TableHead>{t("journeys.colStatus")}</TableHead>
            <TableHead>{t("journeys.colLocation")}</TableHead>
            <TableHead>{t("journeys.touches")}</TableHead>
            <TableHead>{t("journeys.colLastCreator")}</TableHead>
            <TableHead className="text-right">{t("journeys.kpiRevenue")}</TableHead>
            <TableHead>{t("journeys.firstSeen")}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {inPeriod.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                {t("journeys.empty")}
              </TableCell>
            </TableRow>
          ) : (
            inPeriod.map((visitor) => {
              const latest = latestTouch(visitor)
              const revenue = visitor.orders.reduce((sum, order) => sum + order.value, 0)
              return (
                <TableRow
                  key={visitor.id}
                  className="cursor-pointer"
                  tabIndex={0}
                  onClick={() => openVisitor(visitor.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      openVisitor(visitor.id)
                    }
                  }}
                >
                  <TableCell className="pl-4 font-medium text-foreground">
                    {visitorDisplayName(visitor)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={STATUS_CLASS[visitor.status]}>
                      {statusLabel(visitor.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {visitor.location ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        {visitor.location.city}
                        <span className="text-xs text-muted-foreground">{visitor.location.state}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {visitor.touches.length}
                  </TableCell>
                  <TableCell>
                    {latest ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar size="sm">
                          <AvatarFallback>{latest.creatorAvatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-foreground">{latest.creatorHandle}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-foreground tabular-nums">
                    {revenue > 0 ? formatBrl(revenue) : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fmtDate(visitor.firstSeenAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" aria-label={t("journeys.viewJourney")} tabIndex={-1}>
                      <ChevronRight />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      )}
    </div>
  )
}

function VisitorKanban({
  visitors,
  statusLabel,
  onOpen,
  emptyLabel,
}: {
  visitors: Visitor[]
  statusLabel: (status: VisitorStatus) => string
  onOpen: (id: string) => void
  emptyLabel: string
}) {
  return (
    <div className="flex gap-3 overflow-x-auto p-3">
      {STAGES.map((stage) => {
        const column = visitors.filter((visitor) => visitor.status === stage)
        return (
          <div key={stage} className="flex w-60 shrink-0 flex-col rounded-xl bg-muted/60">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <Badge variant="secondary" className={STATUS_CLASS[stage]}>
                {statusLabel(stage)}
              </Badge>
              <span className="ml-auto text-xs font-medium text-muted-foreground tabular-nums">{column.length}</span>
            </div>
            <div className="flex flex-col gap-2 px-2 pb-2">
              {column.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">{emptyLabel}</p>
              ) : (
                column.map((visitor) => {
                  const latest = latestTouch(visitor)
                  const revenue = visitor.orders.reduce((sum, order) => sum + order.value, 0)
                  return (
                    <Button
                      key={visitor.id}
                      variant="outline"
                      className="h-auto w-full flex-col items-stretch justify-start gap-1.5 bg-card px-3 py-2.5 text-left whitespace-normal"
                      onClick={() => onOpen(visitor.id)}
                    >
                      <span className="text-sm font-medium text-foreground">{visitorDisplayName(visitor)}</span>
                      <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">
                            {visitor.location ? `${visitor.location.city}, ${visitor.location.state}` : "—"}
                          </span>
                        </span>
                        <span className="shrink-0 tabular-nums text-foreground">
                          {revenue > 0 ? formatBrl(revenue) : "—"}
                        </span>
                      </span>
                      {latest ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Avatar size="sm">
                            <AvatarFallback>{latest.creatorAvatar}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{latest.creatorHandle}</span>
                        </span>
                      ) : null}
                    </Button>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
