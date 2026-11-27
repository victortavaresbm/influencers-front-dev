"use client"
import { useEffect, useMemo, useState } from "react"
import { Flame, Store, type LucideIcon } from "lucide-react"
import { SiShopify } from "react-icons/si"
import type { IconType } from "react-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PeriodFilter } from "@/components/ui/period-filter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiErrorMessage } from "@/lib/api/errors"
import { useActiveBrand } from "@/lib/api/marca"
import { listSales, type BrandSaleView, type SalesQuery } from "@/lib/api/sales"
import { useApi } from "@/lib/api/use-api"
import { useI18n } from "@/lib/i18n"
import type { ConnectionView } from "@/lib/integrations/stores"
import type { PeriodValue } from "@/lib/period"
import { buildSalesQuery, formatCents, saleStatusBadge, shortId, summarize, type BadgeTone } from "@/lib/sales/sales"
import { cn } from "@/lib/utils"

const CONNECTIONS = "/v1/sales/marca/connections"

const PLATFORM_ICON: Record<string, LucideIcon | IconType> = { nuvemshop: Store, shopify: SiShopify, hotmart: Flame }

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "border-zinc-200 bg-white text-zinc-600",
  muted: "border-transparent bg-zinc-100 text-zinc-500",
  warning: "border-transparent bg-amber-100 text-amber-800",
  success: "border-transparent bg-emerald-100 text-emerald-800",
  danger: "border-transparent bg-red-100 text-red-700",
}

const DATE_LOCALE = { pt: "pt-BR", en: "en-US", es: "es" } as const

type Scope = "all" | "creator"

interface Loaded {
  key: string
  // The first page's filters, fixed so "load more" repeats the same window.
  base: SalesQuery
  items: BrandSaleView[]
  nextCursor: string | null
  error: unknown
}

// Every paid order of the Marca's stores, newest payment first, from the
// sales service. The store and coupon filters run on the loaded rows: the API
// filters only by period (and Creator).
export function SalesTable() {
  const { t, locale } = useI18n()
  const { signedIn, marcaId, request } = useApi()
  const brand = useActiveBrand()
  const [period, setPeriod] = useState<PeriodValue>({ preset: "30", from: "", to: "" })
  const [store, setStore] = useState("all")
  const [scope, setScope] = useState<Scope>("all")
  const [connections, setConnections] = useState<ConnectionView[]>([])
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const moduleOff = brand !== null && !brand.modules.includes("sales")
  const ready = signedIn && !!marcaId && !moduleOff
  const key = `${marcaId}|${period.preset}|${period.from}|${period.to}`
  const loading = ready && loaded?.key !== key

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    request<ConnectionView[]>("GET", CONNECTIONS).then(
      (data) => {
        if (!cancelled) setConnections(data ?? [])
      },
      // Without the list the rows still show the platform.
      (err: unknown) => console.error("[sales] could not load the store connections", err)
    )
    return () => {
      cancelled = true
    }
  }, [ready, request])

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    const base = buildSalesQuery(period, { today: new Date() })
    listSales(request, base).then(
      (page) => {
        if (!cancelled) setLoaded({ key, base, items: page.items, nextCursor: page.nextCursor, error: null })
      },
      (err: unknown) => {
        if (!cancelled) setLoaded({ key, base, items: [], nextCursor: null, error: err })
      }
    )
    return () => {
      cancelled = true
    }
  }, [ready, request, key, period])

  const loadMore = async () => {
    if (!loaded?.nextCursor) return
    const current = loaded
    setLoadingMore(true)
    try {
      const page = await listSales(request, { ...current.base, cursor: current.nextCursor ?? undefined })
      setLoaded((prev) =>
        prev?.key === current.key ? { ...prev, items: [...prev.items, ...page.items], nextCursor: page.nextCursor, error: null } : prev
      )
    } catch (err) {
      setLoaded((prev) => (prev?.key === current.key ? { ...prev, error: err } : prev))
    } finally {
      setLoadingMore(false)
    }
  }

  const byId = useMemo(() => new Map(connections.map((c) => [c.id, c])), [connections])
  const current = loaded?.key === key ? loaded : null
  const rows = useMemo(
    () =>
      (current?.items ?? []).filter(
        (sale) => (store === "all" || sale.connectionId === store) && (scope === "all" || sale.attributed)
      ),
    [current, store, scope]
  )
  const totals = summarize(rows)
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(DATE_LOCALE[locale], { dateStyle: "short", timeStyle: "short" }),
    [locale]
  )

  if (!signedIn || !marcaId || moduleOff) {
    const text = !signedIn ? t("sales.realAccountRequired") : moduleOff ? t("api.error.moduleDisabled") : t("api.error.brandRequired")
    return (
      <Card className="p-6">
        <p className="text-sm text-zinc-500">{text}</p>
      </Card>
    )
  }

  const storeName = (connectionId: string, platform: string) => byId.get(connectionId)?.storeIdentifier ?? platform

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <PeriodFilter value={period} onChange={setPeriod} />
        <Select value={store} onValueChange={(value) => setStore(value ?? "all")}>
          <SelectTrigger size="sm" className="max-w-64" aria-label={t("sales.store")}>
            <SelectValue>
              {(value) => {
                if (!value || value === "all") return t("sales.allStores")
                const c = byId.get(value as string)
                return c ? (c.storeIdentifier ?? c.platform) : t("sales.store")
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("sales.allStores")}</SelectItem>
            {connections.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.storeIdentifier ?? c.platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={scope} onValueChange={(value) => setScope(value === "creator" ? "creator" : "all")}>
          <SelectTrigger size="sm" aria-label={t("sales.coupon")}>
            <SelectValue>{(value) => t(value === "creator" ? "sales.onlyCreator" : "sales.allOrders")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("sales.allOrders")}</SelectItem>
            <SelectItem value="creator">{t("sales.onlyCreator")}</SelectItem>
          </SelectContent>
        </Select>
        {current && !current.error && (
          <p className="ml-auto text-sm text-zinc-500">
            {t("sales.totals", { orders: totals.orders, gross: formatCents(totals.grossCents) })}
          </p>
        )}
      </div>

      <Card className="p-0">
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">{t("sales.loading")}</p>
        ) : current?.error && current.items.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">{apiErrorMessage(t, current.error)}</p>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <p className="text-sm font-medium text-zinc-900">{t("sales.emptyTitle")}</p>
            <p className="mt-1 text-sm text-zinc-500">{t("sales.emptyHelp")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">{t("sales.paidAt")}</TableHead>
                <TableHead>{t("sales.store")}</TableHead>
                <TableHead>{t("sales.coupon")}</TableHead>
                <TableHead>{t("sales.creator")}</TableHead>
                <TableHead className="text-right">{t("sales.gross")}</TableHead>
                <TableHead className="text-right">{t("sales.discount")}</TableHead>
                <TableHead>{t("sales.statusLabel")}</TableHead>
                <TableHead className="pr-4 text-right">{t("sales.consolidated")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((sale) => {
                const Icon = PLATFORM_ICON[sale.platform] ?? Store
                const badge = saleStatusBadge(sale.status)
                return (
                  <TableRow key={sale.orderId}>
                    <TableCell className="pl-4 whitespace-nowrap">{dateFormat.format(new Date(sale.paidAt))}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <Icon size={14} className="shrink-0 text-zinc-500" aria-label={sale.platform} />
                        <span className="max-w-48 truncate">{storeName(sale.connectionId, sale.platform)}</span>
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{sale.coupon ?? "—"}</TableCell>
                    <TableCell>
                      {sale.creatorId ? (
                        <span className="font-mono text-xs" title={sale.creatorId}>
                          {shortId(sale.creatorId)}
                        </span>
                      ) : (
                        <span className="text-zinc-500">{t("sales.noCreator")}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCents(sale.grossAmountCents)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCents(sale.discountAmountCents)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(TONE_CLASS[badge.tone])}>
                        {t(badge.labelKey)}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4 text-right tabular-nums">
                      {sale.consolidatedAmountCents === null ? "—" : formatCents(sale.consolidatedAmountCents)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {current && current.error !== null && current.items.length > 0 && (
        <p className="text-sm text-red-600">{apiErrorMessage(t, current.error)}</p>
      )}
      {current?.nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" disabled={loadingMore} onClick={() => void loadMore()}>
            {loadingMore ? t("sales.loading") : t("sales.loadMore")}
          </Button>
        </div>
      )}
    </div>
  )
}
