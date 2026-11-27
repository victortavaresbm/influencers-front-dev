"use client"

import { useEffect, useState } from "react"
import { CreatorCouponsTable } from "@/components/coupons/creator-coupons-table"
import { StoreCouponsTable } from "@/components/coupons/store-coupons-table"
import { TopBar } from "@/components/layout/top-bar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useActiveBrand } from "@/lib/api/marca"
import { useApi } from "@/lib/api/use-api"
import { useI18n } from "@/lib/i18n"
import type { ConnectionView } from "@/lib/integrations/stores"
import type { Connections } from "@/components/coupons/coupon-ui"

const CONNECTIONS = "/v1/sales/marca/connections"

export default function CouponsPage() {
  const { t } = useI18n()
  const { signedIn, marcaId, request } = useApi()
  const brand = useActiveBrand()
  const [connections, setConnections] = useState<Connections>({ items: [], loaded: false, error: null })

  const moduleOff = brand !== null && !brand.modules.includes("sales")
  const ready = signedIn && !!marcaId && !moduleOff

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    request<ConnectionView[]>("GET", CONNECTIONS).then(
      (data) => {
        if (!cancelled) setConnections({ items: data ?? [], loaded: true, error: null })
      },
      // Without the list the Creators' coupons still show the platform.
      (err: unknown) => {
        console.error("[coupons] could not load the store connections", err)
        if (!cancelled) setConnections({ items: [], loaded: true, error: err })
      }
    )
    return () => {
      cancelled = true
    }
  }, [ready, request])

  let body
  if (!ready) {
    const text = !signedIn ? t("coupons.realAccountRequired") : moduleOff ? t("api.error.moduleDisabled") : t("api.error.brandRequired")
    body = (
      <Card className="p-6">
        <p className="text-sm text-zinc-500">{text}</p>
      </Card>
    )
  } else {
    body = (
      <Tabs defaultValue="creators">
        <TabsList>
          <TabsTrigger value="creators">{t("coupons.tab.creators")}</TabsTrigger>
          <TabsTrigger value="store">{t("coupons.tab.store")}</TabsTrigger>
        </TabsList>
        <TabsContent value="creators" className="mt-4">
          <CreatorCouponsTable connections={connections.items} />
        </TabsContent>
        <TabsContent value="store" className="mt-4">
          <StoreCouponsTable connections={connections} />
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("nav.coupons")} subtitle={t("coupons.subtitle")} />
      <div className="w-full p-6">{body}</div>
    </div>
  )
}
