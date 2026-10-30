"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, MapPin, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"
import { formatBrl, latestTouch, visitorDisplayName, type Visitor, type VisitorStatus } from "@/lib/mock-data/journeys"

const STATUS_CLASS: Record<VisitorStatus, string> = {
  visitor: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  cart: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  checkout: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  customer: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  abandoned: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
}

type StatusFilter = "all" | VisitorStatus

export function VisitorTable({ visitors, place }: { visitors: Visitor[]; place?: string | null }) {
  const { locale, t } = useI18n()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const dateLocale = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR"

  const filtered = visitors.filter((visitor) => {
    if (status !== "all" && visitor.status !== status) return false
    if (!query.trim()) return true
    const q = query.toLowerCase()
    if (visitorDisplayName(visitor).toLowerCase().includes(q)) return true
    if (visitor.location && `${visitor.location.city} ${visitor.location.state}`.toLowerCase().includes(q)) return true
    return visitor.touches.some(
      (touch) => touch.creatorName.toLowerCase().includes(q) || touch.creatorHandle.toLowerCase().includes(q)
    )
  })

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
    router.push(`/journeys/${id}`)
  }

  const filters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: t("journeys.filterAll") },
    { value: "customer", label: t("journeys.statusCustomer") },
    { value: "checkout", label: t("journeys.statusCheckout") },
    { value: "cart", label: t("journeys.statusCart") },
    { value: "abandoned", label: t("journeys.statusAbandoned") },
    { value: "visitor", label: t("journeys.statusVisitor") },
  ]

  const countLabel = filtered.length === 1
    ? t("journeys.visitorOne", { count: filtered.length })
    : t("journeys.visitorMany", { count: filtered.length })

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{t("journeys.visitorList")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {place ? `${place} · ${countLabel}` : countLabel}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Tabs value={status} onValueChange={(value) => setStatus((value as StatusFilter) || "all")}>
            <TabsList>
              {filters.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
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
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">{t("journeys.visitorList")}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>{t("journeys.colLocation")}</TableHead>
            <TableHead>{t("journeys.touches")}</TableHead>
            <TableHead>{t("journeys.colCreator")}</TableHead>
            <TableHead className="text-right">{t("journeys.kpiRevenue")}</TableHead>
            <TableHead>{t("journeys.firstSeen")}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                {t("journeys.empty")}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((visitor) => {
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
    </Card>
  )
}
