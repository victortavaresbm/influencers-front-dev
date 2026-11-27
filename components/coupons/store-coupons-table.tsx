"use client"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { listStoreCoupons, type StoreCouponView } from "@/lib/api/coupons"
import { useApi } from "@/lib/api/use-api"
import { formatStoreDiscount } from "@/lib/coupons/coupons"
import { useI18n } from "@/lib/i18n"
import { couponErrorText, DATE_LOCALE, TONE_CLASS, type Connections } from "./coupon-ui"

interface Loaded {
  key: string
  connectionId: string
  supported: boolean
  items: StoreCouponView[]
  nextCursor: string | null
  error: unknown
}

// The coupons already in one store, read live from it by the sales service.
// The platform's own coupons carry managedCouponId.
export function StoreCouponsTable({ connections }: { connections: Connections }) {
  const { t, locale } = useI18n()
  const { marcaId, request } = useApi()
  const [chosen, setChosen] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const stores = useMemo(() => connections.items.filter((c) => c.state === "active"), [connections.items])
  const connectionId = stores.find((c) => c.id === chosen)?.id ?? stores[0]?.id ?? null
  const key = `${marcaId}|${connectionId}`

  useEffect(() => {
    if (!connectionId) return
    let cancelled = false
    listStoreCoupons(request, connectionId).then(
      (page) => {
        if (!cancelled) setLoaded({ key, connectionId, ...page, error: null })
      },
      (err: unknown) => {
        if (!cancelled) setLoaded({ key, connectionId, supported: true, items: [], nextCursor: null, error: err })
      }
    )
    return () => {
      cancelled = true
    }
  }, [connectionId, request, key])

  const current = loaded?.key === key ? loaded : null

  const loadMore = async () => {
    if (!current?.nextCursor) return
    const from = current
    setLoadingMore(true)
    try {
      const page = await listStoreCoupons(request, from.connectionId, from.nextCursor)
      setLoaded((prev) => (prev === from ? { ...prev, items: [...prev.items, ...page.items], nextCursor: page.nextCursor, error: null } : prev))
    } catch (err) {
      setLoaded((prev) => (prev === from ? { ...prev, error: err } : prev))
    } finally {
      setLoadingMore(false)
    }
  }

  const dateFormat = useMemo(() => new Intl.DateTimeFormat(DATE_LOCALE[locale], { dateStyle: "short" }), [locale])
  const day = (iso: string | null) => (iso ? dateFormat.format(new Date(iso)) : null)

  if (!connections.loaded) return <p className="text-sm text-zinc-500">{t("coupons.loading")}</p>
  if (connections.error !== null) return <p className="text-sm text-zinc-500">{couponErrorText(t, connections.error)}</p>
  if (!connectionId) {
    return (
      <Card className="p-6">
        <p className="text-sm text-zinc-500">{t("coupons.store.noStores")}</p>
      </Card>
    )
  }

  const validity = (coupon: StoreCouponView) => {
    const from = day(coupon.startsAt)
    const to = day(coupon.endsAt) ?? t("coupons.store.noEnd")
    return from ? `${from} – ${to}` : coupon.endsAt ? `– ${to}` : "—"
  }

  return (
    <div className="space-y-4">
      <Select value={connectionId} onValueChange={(value) => setChosen(value)}>
        <SelectTrigger size="sm" className="max-w-64" aria-label={t("coupons.store.select")}>
          <SelectValue>
            {(value) => {
              const c = stores.find((s) => s.id === value)
              return c ? (c.storeIdentifier ?? c.platform) : t("coupons.store.select")
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {stores.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.storeIdentifier ?? c.platform}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card className="p-0">
        {!current ? (
          <p className="p-6 text-sm text-zinc-500">{t("coupons.loading")}</p>
        ) : current.error !== null && current.items.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">{couponErrorText(t, current.error)}</p>
        ) : !current.supported ? (
          <p className="p-6 text-sm text-zinc-500">{t("coupons.store.unsupported")}</p>
        ) : current.items.length === 0 ? (
          <p className="p-6 text-sm font-medium text-zinc-900">{t("coupons.store.emptyTitle")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">{t("coupons.codeLabel")}</TableHead>
                <TableHead className="text-right">{t("coupons.store.type")}</TableHead>
                <TableHead>{t("coupons.store.validity")}</TableHead>
                <TableHead>{t("coupons.store.active")}</TableHead>
                <TableHead className="pr-4 text-right">{t("coupons.store.usage")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.items.map((coupon) => {
                const discount = formatStoreDiscount(coupon.discount)
                return (
                  <TableRow key={coupon.externalId}>
                    <TableCell className="pl-4">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs">{coupon.code}</span>
                        {coupon.managedCouponId && (
                          <Badge variant="outline" className={TONE_CLASS.success}>
                            {t("coupons.store.managed")}
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{"text" in discount ? discount.text : t(discount.labelKey)}</TableCell>
                    <TableCell className="whitespace-nowrap">{validity(coupon)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={coupon.active ? TONE_CLASS.success : TONE_CLASS.muted}>
                        {t(coupon.active ? "coupons.store.yes" : "coupons.store.no")}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4 text-right tabular-nums">{coupon.usageCount ?? "—"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {current && current.error !== null && current.items.length > 0 && (
        <p className="text-sm text-red-600">{couponErrorText(t, current.error)}</p>
      )}
      {current?.nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" disabled={loadingMore} onClick={() => void loadMore()}>
            {loadingMore ? t("coupons.loading") : t("coupons.loadMore")}
          </Button>
        </div>
      )}
    </div>
  )
}
