"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useI18n } from "@/lib/i18n"
import { aggregateByCreator, formatBrl, type CreatorJourneyStats, type Visitor } from "@/lib/mock-data/journeys"

type SortKey = keyof Omit<CreatorJourneyStats, "creatorId" | "creatorName" | "creatorHandle" | "creatorAvatar">

const MONEY_KEYS: SortKey[] = ["revenueDiscovery", "revenueAssist", "revenueConversion"]

function fmt(key: SortKey, value: number) {
  if (MONEY_KEYS.includes(key)) return value === 0 ? "—" : formatBrl(value)
  return value === 0 ? "—" : value.toLocaleString("pt-BR")
}

export function PanoramaTable({ visitors, place }: { visitors: Visitor[]; place?: string | null }) {
  const { t } = useI18n()
  const [sortKey, setSortKey] = useState<SortKey>("revenueConversion")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const rows = useMemo(() => {
    const stats = aggregateByCreator(visitors)
    return [...stats].sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number)
      return sortDir === "desc" ? -diff : diff
    })
  }, [visitors, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    else { setSortKey(key); setSortDir("desc") }
  }

  function icon(key: SortKey) {
    if (sortKey !== key) return <ChevronsUpDown className="text-zinc-300" />
    return sortDir === "desc" ? <ChevronDown className="text-zinc-600" /> : <ChevronUp className="text-zinc-600" />
  }

  const COLS: { key: SortKey; label: string }[] = [
    { key: "visitorsBrought", label: t("journeys.colVisitors") },
    { key: "checkouts", label: t("journeys.colCheckouts") },
    { key: "abandonments", label: t("journeys.colAbandon") },
    { key: "purchases", label: t("journeys.colPurchases") },
    { key: "revenueDiscovery", label: t("journeys.colRevDisc") },
    { key: "revenueAssist", label: t("journeys.colRevAssist") },
    { key: "revenueConversion", label: t("journeys.colRevConv") },
  ]

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{t("journeys.panorama")}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("journeys.panoramaHint")}</p>
        {place ? (
          <p className="mt-1 text-xs font-medium text-foreground">{t("journeys.showingPlace", { place })}</p>
        ) : null}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">{t("journeys.colCreator")}</TableHead>
            {COLS.map((col) => (
              <TableHead key={col.key}>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="-mr-2 font-medium text-zinc-500"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {icon(col.key)}
                  </Button>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-sm text-zinc-500">
                {t("journeys.empty")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.creatorId}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{row.creatorAvatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.creatorName}</p>
                      <p className="text-xs text-muted-foreground">{row.creatorHandle}</p>
                    </div>
                  </div>
                </TableCell>
                {COLS.map((col) => (
                  <TableCell key={col.key} className="text-right tabular-nums text-zinc-700">
                    {fmt(col.key, row[col.key] as number)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
