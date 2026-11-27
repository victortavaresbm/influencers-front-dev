"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CouponTicket } from "@/components/ui/coupon-ticket"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { listCoupons, type BrandCouponRow, type CouponCodeView } from "@/lib/api/coupons"
import { useApi } from "@/lib/api/use-api"
import { canEditCode, couponStateBadge, shortId } from "@/lib/coupons/coupons"
import { useI18n } from "@/lib/i18n"
import type { ConnectionView } from "@/lib/integrations/stores"
import { cn } from "@/lib/utils"
import { CouponCodeDialog } from "./coupon-code-dialog"
import { couponErrorText, DATE_LOCALE, TONE_CLASS } from "./coupon-ui"

interface Loaded {
  marcaId: string
  version: number
  items: BrandCouponRow[]
  nextCursor: string | null
  error: unknown
}

// The Creators' coupons of the Marca, newest first, ended ones included.
export function CreatorCouponsTable({ connections }: { connections: ConnectionView[] }) {
  const { t, locale } = useI18n()
  const { marcaId, request } = useApi()
  const [version, setVersion] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [editing, setEditing] = useState<BrandCouponRow | null>(null)

  useEffect(() => {
    if (!marcaId) return
    let cancelled = false
    listCoupons(request).then(
      (page) => {
        if (!cancelled) setLoaded({ marcaId, version, items: page.items, nextCursor: page.nextCursor, error: null })
      },
      (err: unknown) => {
        if (!cancelled) setLoaded({ marcaId, version, items: [], nextCursor: null, error: err })
      }
    )
    return () => {
      cancelled = true
    }
  }, [marcaId, request, version])

  const current = loaded?.marcaId === marcaId && loaded.version === version ? loaded : null

  const loadMore = async () => {
    if (!current?.nextCursor) return
    const from = current
    setLoadingMore(true)
    try {
      const page = await listCoupons(request, from.nextCursor)
      setLoaded((prev) => (prev === from ? { ...prev, items: [...prev.items, ...page.items], nextCursor: page.nextCursor, error: null } : prev))
    } catch (err) {
      setLoaded((prev) => (prev === from ? { ...prev, error: err } : prev))
    } finally {
      setLoadingMore(false)
    }
  }

  const onSaved = useCallback((view: CouponCodeView) => {
    setLoaded((prev) =>
      prev ? { ...prev, items: prev.items.map((c) => (c.id === view.couponId ? { ...c, code: view.code, state: view.state } : c)) } : prev
    )
  }, [])
  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const byId = useMemo(() => new Map(connections.map((c) => [c.id, c])), [connections])
  const dateFormat = useMemo(() => new Intl.DateTimeFormat(DATE_LOCALE[locale], { dateStyle: "short" }), [locale])

  return (
    <div className="space-y-4">
      <Card className="p-0">
        {!current ? (
          <p className="p-6 text-sm text-zinc-500">{t("coupons.loading")}</p>
        ) : current.error !== null && current.items.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">{couponErrorText(t, current.error)}</p>
        ) : current.items.length === 0 ? (
          <div className="p-6">
            <p className="text-sm font-medium text-zinc-900">{t("coupons.emptyTitle")}</p>
            <p className="mt-1 text-sm text-zinc-500">{t("coupons.emptyHelp")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">{t("coupons.codeLabel")}</TableHead>
                <TableHead>{t("coupons.creator")}</TableHead>
                <TableHead>{t("coupons.store")}</TableHead>
                <TableHead className="text-right">{t("coupons.discount")}</TableHead>
                <TableHead>{t("coupons.statusLabel")}</TableHead>
                <TableHead>{t("coupons.createdAt")}</TableHead>
                <TableHead className="pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.items.map((coupon) => {
                const badge = couponStateBadge(coupon.state)
                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="pl-4">
                      <CouponTicket code={coupon.code} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs" title={coupon.creatorId}>
                        {shortId(coupon.creatorId)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="block max-w-48 truncate">{byId.get(coupon.connectionId)?.storeIdentifier ?? coupon.platform}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{coupon.discountPercent}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(TONE_CLASS[badge.tone])}>
                        {t(badge.labelKey)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{dateFormat.format(new Date(coupon.createdAt))}</TableCell>
                    <TableCell className="pr-4 text-right">
                      {canEditCode(coupon.state) && (
                        <Button variant="ghost" size="sm" onClick={() => setEditing(coupon)}>
                          {t("coupons.changeCode")}
                        </Button>
                      )}
                    </TableCell>
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

      <CouponCodeDialog coupon={editing} onClose={() => setEditing(null)} onSaved={onSaved} onStale={reload} />
    </div>
  )
}
