"use client"

import { useMemo, useState } from "react"
import { BarChart, LineChart, type CustomTooltipProps } from "@tremor/react"
import { BubbleChart } from "@/components/tracking/bubble-chart"
import { BrandIdentity } from "@/components/tracking/brand-mark"
import { deltaClass, formatChartValue, formatDelta } from "@/components/tracking/format"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  distribute,
  metricValue,
  seriesLabels,
  seriesWeights,
  type BrandSnapshot,
  type ChartMetric,
  type ContentScope,
  type Period,
} from "@/lib/mock-data/tracking"

const METRICS: { value: ChartMetric; label: string }[] = [
  { value: "emv", label: "EMV" },
  { value: "engagement", label: "Engajamento" },
  { value: "impressions", label: "Impressões" },
  { value: "reach", label: "Alcance" },
  { value: "sponsoredEmv", label: "EMV patrocinado" },
]

function ChartTooltip({
  active,
  payload,
  label,
  metric,
}: CustomTooltipProps & { metric: ChartMetric }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((item) => {
          const value = typeof item.value === "number" ? item.value : Number(item.value)
          if (!Number.isFinite(value)) return null
          const name = String(item.name ?? item.dataKey ?? "")
          return (
            <div key={name} className="flex items-center justify-between gap-4">
              <span className="text-xs text-zinc-600">{name}</span>
              <span className="text-xs font-semibold tabular-nums text-zinc-900">{formatChartValue(metric, value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function PerformancePanel({
  snapshots,
  period,
  scope,
  ownId,
  linkCompetitors = true,
}: {
  snapshots: BrandSnapshot[]
  period: Period
  scope: ContentScope
  ownId: string
  linkCompetitors?: boolean
}) {
  const [metric, setMetric] = useState<ChartMetric>("emv")
  const [chart, setChart] = useState("bubble")
  const metricLabel = METRICS.find((item) => item.value === metric)?.label ?? "EMV"

  const ranked = useMemo(
    () => [...snapshots].sort((a, b) => metricValue(b, metric) - metricValue(a, metric)),
    [metric, snapshots],
  )

  const lineData = useMemo(() => {
    const labels = seriesLabels(period)
    return labels.map((label, index) => {
      const row: Record<string, string | number> = { label }
      for (const snapshot of snapshots) {
        const series = distribute(metricValue(snapshot, metric), seriesWeights(snapshot.brand, period), labels)
        row[snapshot.brand.name] = series[index]?.value ?? 0
      }
      return row
    })
  }, [metric, period, snapshots])

  const barData = ranked.map((snapshot) => ({
    marca: snapshot.brand.name,
    Valor: metricValue(snapshot, metric),
  }))

  const emptySponsored = metric === "sponsoredEmv" && scope === "organic"

  return (
    <Card className="gap-0 overflow-visible py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Performance</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            O tamanho da bolha é o valor de {metricLabel}. Na horizontal, a variação contra o mesmo mês do ano anterior. Na vertical, contra o mês passado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={metric} onValueChange={(value) => setMetric((value as ChartMetric) || "emv")}>
            <SelectTrigger size="sm" className="w-44" aria-label="Métrica do gráfico">
              <SelectValue>
                {(value) => METRICS.find((item) => item.value === value)?.label ?? "EMV"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              {METRICS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={chart} onValueChange={(value) => setChart(value || "bubble")}>
            <TabsList>
              <TabsTrigger value="bubble">Bolhas</TabsTrigger>
              <TabsTrigger value="bar">Barras</TabsTrigger>
              <TabsTrigger value="line">Linha</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-2 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0">
          {emptySponsored ? (
            <p className="flex h-72 items-center justify-center px-6 text-center text-sm text-zinc-500">
              O recorte orgânico não tem EMV patrocinado. Inclua conteúdo patrocinado em Configurar para ver esta métrica.
            </p>
          ) : null}
          {!emptySponsored && chart === "bubble" ? (
            <div>
              <div className="flex gap-2">
                <p className="flex w-4 items-center text-[11px] text-zinc-400 [writing-mode:vertical-rl] rotate-180">
                  {metricLabel} vs mês anterior
                </p>
                <div className="min-w-0 flex-1">
                  <BubbleChart snapshots={snapshots} metric={metric} />
                </div>
              </div>
              <p className="text-center text-[11px] text-zinc-400">{metricLabel} vs mesmo mês do ano anterior</p>
            </div>
          ) : null}
          {!emptySponsored && chart === "bar" ? (
            <BarChart
              data={barData}
              index="marca"
              categories={["Valor"]}
              colors={["zinc"]}
              valueFormatter={(value) => formatChartValue(metric, value)}
              showLegend={false}
              showGridLines={false}
              yAxisWidth={84}
              customTooltip={(props) => <ChartTooltip {...props} metric={metric} />}
              className="h-72"
            />
          ) : null}
          {!emptySponsored && chart === "line" ? (
            <LineChart
              data={lineData}
              index="label"
              categories={snapshots.map((snapshot) => snapshot.brand.name)}
              colors={snapshots.map((snapshot) => snapshot.brand.chartColor)}
              valueFormatter={(value) => formatChartValue(metric, value)}
              showLegend
              showGridLines={false}
              yAxisWidth={84}
              customTooltip={(props) => <ChartTooltip {...props} metric={metric} />}
              className="h-72"
            />
          ) : null}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead className="text-right">{metricLabel}</TableHead>
              <TableHead className="text-right">MoM</TableHead>
              <TableHead className="text-right">YoY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranked.map((snapshot, index) => {
              const href = linkCompetitors && snapshot.brand.id !== ownId && snapshot.brand.id !== "average"
                ? `/tracking/${snapshot.brand.id}`
                : undefined
              return (
              <TableRow key={snapshot.brand.id}>
                <TableCell className="text-zinc-400 tabular-nums">{index + 1}</TableCell>
                <TableCell>
                  <BrandIdentity
                    brand={snapshot.brand}
                    markClassName="size-6 text-[9px]"
                    href={href}
                  />
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatChartValue(metric, metricValue(snapshot, metric))}</TableCell>
                <TableCell className={`text-right tabular-nums ${deltaClass(snapshot.mom)}`}>{formatDelta(snapshot.mom)}</TableCell>
                <TableCell className={`text-right tabular-nums ${deltaClass(snapshot.yoy)}`}>{formatDelta(snapshot.yoy)}</TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
