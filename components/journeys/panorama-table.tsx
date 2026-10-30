"use client"

import { useMemo, useState } from "react"
import { CircleHelp, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n, type MessageKey } from "@/lib/i18n"
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

  const COLS: { key: SortKey; label: string; hint?: MessageKey }[] = [
    { key: "visitorsBrought", label: t("journeys.colVisitors") },
    { key: "checkouts", label: t("journeys.colCheckouts") },
    { key: "abandonments", label: t("journeys.colAbandon") },
    { key: "purchases", label: t("journeys.colPurchases") },
    { key: "revenueDiscovery", label: t("journeys.colRevDisc"), hint: "journeys.hintRevDisc" },
    { key: "revenueAssist", label: t("journeys.colRevAssist"), hint: "journeys.hintRevAssist" },
    { key: "revenueConversion", label: t("journeys.colRevConv"), hint: "journeys.hintRevConv" },
  ]

  return (
    <div>
      <p className="border-b px-4 py-3 text-xs text-muted-foreground">
        {place ? `${t("journeys.showingPlace", { place })}. ` : ""}
        {t("journeys.panoramaHint")}
      </p>
      <TooltipProvider delay={200}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">{t("journeys.colCreator")}</TableHead>
            {COLS.map((col) => (
              <TableHead key={col.key}>
                <div className="flex items-center justify-end">
                  {col.hint ? (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={t("journeys.hintAbout", { label: col.label })}
                            className="text-zinc-400"
                          />
                        }
                      >
                        <CircleHelp />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-64 text-left leading-relaxed whitespace-normal">
                        {t(col.hint)}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
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
      </TooltipProvider>
    </div>
  )
}
