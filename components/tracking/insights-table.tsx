"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown, Search } from "lucide-react"
import { BrandIdentity } from "@/components/tracking/brand-mark"
import { formatCount, formatFrequency, formatMoney } from "@/components/tracking/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { BrandSnapshot } from "@/lib/mock-data/tracking"

type SortKey =
  | "name"
  | "creators"
  | "posts"
  | "emv"
  | "engagement"
  | "impressions"
  | "reach"
  | "potency"
  | "frequency"
  | "sponsoredEmv"

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "creators", label: "Creators", align: "right" },
  { key: "posts", label: "Publicações", align: "right" },
  { key: "emv", label: "EMV", align: "right" },
  { key: "engagement", label: "Engajamento", align: "right" },
  { key: "impressions", label: "Impressões", align: "right" },
  { key: "reach", label: "Alcance", align: "right" },
  { key: "potency", label: "Potência", align: "right" },
  { key: "frequency", label: "Frequência", align: "right" },
  { key: "sponsoredEmv", label: "EMV patrocinado", align: "right" },
]

function cell(snapshot: BrandSnapshot, key: SortKey) {
  if (key === "name") return snapshot.brand.name
  if (key === "frequency") return formatFrequency(snapshot.frequency)
  if (key === "emv" || key === "potency" || key === "sponsoredEmv") return formatMoney(snapshot[key])
  return formatCount(snapshot[key])
}

function compare(a: BrandSnapshot, b: BrandSnapshot, key: SortKey) {
  if (key === "name") return a.brand.name.localeCompare(b.brand.name, "pt-BR")
  return a[key] - b[key]
}

export function InsightsTable({ snapshots, ownId }: { snapshots: BrandSnapshot[]; ownId: string }) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("emv")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [pageSize, setPageSize] = useState(6)
  const [page, setPage] = useState(0)
  const filterKey = `${query}\0${sortKey}\0${sortDir}\0${pageSize}\0${snapshots.map((item) => item.brand.id).join()}`
  const [seenKey, setSeenKey] = useState(filterKey)
  if (seenKey !== filterKey) {
    setSeenKey(filterKey)
    setPage(0)
  }

  const ranked = useMemo(() => {
    return [...snapshots].sort((a, b) => b.emv - a.emv).map((snapshot, index) => ({ snapshot, rank: index + 1 }))
  }, [snapshots])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const rows = needle
      ? ranked.filter((row) => row.snapshot.brand.name.toLowerCase().includes(needle))
      : ranked
    return [...rows].sort((a, b) => {
      const result = compare(a.snapshot, b.snapshot, sortKey)
      return sortDir === "asc" ? result : -result
    })
  }, [query, ranked, sortDir, sortKey])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize)
  const from = filtered.length === 0 ? 0 : safePage * pageSize + 1
  const to = Math.min(filtered.length, (safePage + 1) * pageSize)

  const average = useMemo(() => {
    if (snapshots.length === 0) return null
    const totals = snapshots.reduce(
      (acc, snapshot) => ({
        creators: acc.creators + snapshot.creators,
        posts: acc.posts + snapshot.posts,
        emv: acc.emv + snapshot.emv,
        engagement: acc.engagement + snapshot.engagement,
        impressions: acc.impressions + snapshot.impressions,
        reach: acc.reach + snapshot.reach,
        sponsoredEmv: acc.sponsoredEmv + snapshot.sponsoredEmv,
        mom: acc.mom + snapshot.mom,
        yoy: acc.yoy + snapshot.yoy,
      }),
      { creators: 0, posts: 0, emv: 0, engagement: 0, impressions: 0, reach: 0, sponsoredEmv: 0, mom: 0, yoy: 0 },
    )
    const count = snapshots.length
    return {
      creators: totals.creators / count,
      posts: totals.posts / count,
      emv: totals.emv / count,
      engagement: totals.engagement / count,
      impressions: totals.impressions / count,
      reach: totals.reach / count,
      sponsoredEmv: totals.sponsoredEmv / count,
      potency: totals.posts > 0 ? totals.emv / totals.posts : 0,
      frequency: totals.creators > 0 ? totals.posts / totals.creators : 0,
      mom: totals.mom / count,
      yoy: totals.yoy / count,
    }
  }, [snapshots])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((dir) => (dir === "desc" ? "asc" : "desc"))
    else {
      setSortKey(key)
      setSortDir(key === "name" ? "asc" : "desc")
    }
  }

  function sortIcon(column: SortKey) {
    if (sortKey !== column) return <ChevronsUpDown className="text-zinc-300" />
    return sortDir === "desc" ? <ChevronDown className="text-zinc-600" /> : <ChevronUp className="text-zinc-600" />
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Insights competitivos</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Potência é o EMV médio por publicação. Frequência é a média de publicações por creator. Clique numa concorrente para comparar com a sua marca.
          </p>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar marca"
            aria-label="Buscar marca"
            className="pl-8"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 pl-4">#</TableHead>
            <TableHead>
              <Button variant="ghost" size="xs" className="-ml-2 font-medium text-zinc-500" onClick={() => toggleSort("name")}>
                Marca
                {sortIcon("name")}
              </Button>
            </TableHead>
            {COLUMNS.map((column) => (
              <TableHead key={column.key}>
                <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="xs"
                  className="-mr-2 font-medium text-zinc-500"
                  onClick={() => toggleSort(column.key)}
                >
                  {column.label}
                  {sortIcon(column.key)}
                </Button>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="px-4 py-10 text-center text-sm text-zinc-500">
                Nenhuma marca encontrada.
              </TableCell>
            </TableRow>
          ) : (
            visible.map(({ snapshot, rank }) => {
              const href = snapshot.brand.id === ownId ? undefined : `/tracking/${snapshot.brand.id}`
              return (
              <TableRow key={snapshot.brand.id}>
                <TableCell className="pl-4 text-zinc-400 tabular-nums">{rank}</TableCell>
                <TableCell>
                  <BrandIdentity brand={snapshot.brand} href={href} />
                </TableCell>
                {COLUMNS.map((column) => (
                  <TableCell key={column.key} className="text-right tabular-nums text-zinc-700">
                    {cell(snapshot, column.key)}
                  </TableCell>
                ))}
              </TableRow>
              )
            })
          )}
        </TableBody>
        {average ? (
          <TableFooter>
            <TableRow className="bg-zinc-50 hover:bg-zinc-50">
              <TableCell className="pl-4" />
              <TableCell className="font-medium text-zinc-900">Média das marcas</TableCell>
              <TableCell className="text-right tabular-nums">{formatCount(average.creators)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCount(average.posts)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatMoney(average.emv)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCount(average.engagement)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCount(average.impressions)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCount(average.reach)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatMoney(average.potency)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatFrequency(average.frequency)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatMoney(average.sponsoredEmv)}</TableCell>
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t px-4 py-3 text-xs text-zinc-500">
        <span>Linhas por página</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => setPageSize(Number(value ?? 6))}
        >
          <SelectTrigger size="sm" className="w-16" aria-label="Linhas por página">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
        <span className="tabular-nums">
          {from}–{to} de {filtered.length}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={safePage === 0}
          onClick={() => setPage(safePage - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={safePage >= pageCount - 1}
          onClick={() => setPage(safePage + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight />
        </Button>
      </div>
    </Card>
  )
}
