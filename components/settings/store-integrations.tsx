"use client"
import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { HotmartConnectDialog } from "@/components/settings/hotmart-connect-dialog"
import { PLATFORMS } from "@/components/integrations/store-platforms"
import { toast } from "@/components/ui/toast"
import { apiErrorMessage } from "@/lib/api/errors"
import { useApi } from "@/lib/api/use-api"
import { useI18n, type MessageKey } from "@/lib/i18n"
import {
  normalizeShopifyDomain,
  parseConnectReturn,
  safeAuthorizeUrl,
  storeCards,
  type ConnectionView,
  type StoreCard,
  type StorePlatform,
} from "@/lib/integrations/stores"


const STATE_LABEL: Record<StoreCard["state"], MessageKey> = {
  active: "settings.connected",
  pending: "settings.storePending",
  credential_error: "settings.storeCredentialError",
  not_connected: "settings.notConnected",
}

const CONNECTIONS = "/v1/sales/marca/connections"

// Nuvemshop and Shopify through the sales service: connect sends the browser
// to the store's authorization page; the store comes back to /settings.
// Hotmart has no OAuth: connect opens the guide where the Marca pastes the
// credentials and registers the webhook by hand.
export function StoreIntegrations() {
  const { t } = useI18n()
  const { signedIn, marcaId, request } = useApi()
  const [connections, setConnections] = useState<ConnectionView[] | null>(null)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [busy, setBusy] = useState<StorePlatform | null>(null)
  const [shop, setShop] = useState("")
  const [shopInvalid, setShopInvalid] = useState(false)
  const [hotmart, setHotmart] = useState<"closed" | "new" | "resume">("closed")

  const [reloads, setReloads] = useState(0)
  const reload = () => setReloads((n) => n + 1)

  useEffect(() => {
    if (!signedIn || !marcaId) return
    let cancelled = false
    request<ConnectionView[]>("GET", CONNECTIONS).then(
      (data) => {
        if (cancelled) return
        setConnections(data)
        setLoadError(null)
      },
      (err: unknown) => {
        if (!cancelled) setLoadError(err)
      }
    )
    return () => {
      cancelled = true
    }
  }, [signedIn, marcaId, request, reloads])

  useEffect(() => {
    const result = parseConnectReturn(window.location.search)
    if (!result) return
    if (result.ok) toast.add({ type: "success", title: t("settings.storeConnectedToast") })
    else toast.add({ type: "error", title: t("settings.storeConnectFailed"), description: result.code })
    window.history.replaceState(null, "", window.location.pathname)
    // Once, on the return from the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hotmartConnected = useCallback(() => {
    toast.add({ type: "success", title: t("hotmart.connected") })
    setHotmart("closed")
    reload()
  }, [t])

  const fail = (err: unknown) => toast.add({ type: "error", title: t("settings.storeConnectFailed"), description: apiErrorMessage(t, err) })

  const connect = async (platform: StorePlatform) => {
    if (platform === "hotmart") return setHotmart("new")
    let body: { shop: string } | undefined
    if (platform === "shopify") {
      const domain = normalizeShopifyDomain(shop)
      setShopInvalid(!domain)
      if (!domain) return
      body = { shop: domain }
    }
    setBusy(platform)
    try {
      const start = await request<{ authorizeUrl?: string }>("POST", `${CONNECTIONS}/${platform}`, body)
      const url = safeAuthorizeUrl(start?.authorizeUrl)
      if (!url) throw new Error("authorizeUrl")
      window.location.assign(url)
    } catch (err) {
      fail(err)
      setBusy(null)
    }
  }

  const disconnect = async (platform: StorePlatform, connectionId: string) => {
    setBusy(platform)
    try {
      await request("POST", `${CONNECTIONS}/${connectionId}/disconnect`)
      toast.add({
        type: "success",
        title: t("settings.storeDisconnected"),
        // Hotmart is not told: the deliveries keep coming until the URL is deleted there.
        description: platform === "hotmart" ? t("hotmart.disconnectedHelp") : undefined,
      })
      reload()
    } catch (err) {
      fail(err)
    } finally {
      setBusy(null)
    }
  }

  const blocked = !signedIn ? t("settings.realAccountRequired") : !marcaId ? t("settings.storeMarcaRequired") : null
  const cards = storeCards(connections ?? [])

  return (
    <div className="space-y-3">
      {(blocked || loadError !== null) && (
        <p className="text-sm text-zinc-500">{blocked ?? apiErrorMessage(t, loadError)}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {PLATFORMS.map(({ id, name, icon: Icon }) => {
          const card = cards[id]
          const ready = !blocked && connections !== null
          return (
            <Card key={id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                  <Icon size={18} />
                </span>
                <Badge variant="outline">
                  {t(card.canResume ? "settings.hotmartPending" : STATE_LABEL[card.state])}
                </Badge>
              </div>
              <h2 className="mt-3 text-sm font-semibold text-zinc-900">{name}</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {card.storeLabel ?? t("settings.integrationHelp", { name })}
              </p>
              {id === "shopify" && card.canConnect && (
                <div className="mt-3 space-y-1">
                  <Input
                    aria-label={t("settings.storeShopDomain")}
                    aria-invalid={shopInvalid}
                    placeholder={t("settings.storeShopDomain")}
                    value={shop}
                    disabled={!ready}
                    onChange={(event) => setShop(event.target.value)}
                  />
                  {shopInvalid && <p className="text-xs text-red-600">{t("settings.storeShopInvalid")}</p>}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                {card.canConnect && (
                  <Button size="sm" disabled={!ready || busy !== null} onClick={() => connect(id)}>
                    {t(card.state === "credential_error" ? "settings.storeReconnect" : "settings.connectName", { name })}
                  </Button>
                )}
                {card.canResume && (
                  <Button size="sm" disabled={!ready || busy !== null} onClick={() => setHotmart("resume")}>
                    {t("hotmart.resume")}
                  </Button>
                )}
                {card.connectionId && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => disconnect(id, card.connectionId as string)}
                  >
                    {t("settings.disconnect")}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
      <HotmartConnectDialog
        open={hotmart !== "closed"}
        resuming={hotmart === "resume"}
        onOpenChange={(open) => {
          if (open) return
          setHotmart("closed")
          // A connection created before closing shows up as pending, with "continue".
          reload()
        }}
        onConnected={hotmartConnected}
      />
    </div>
  )
}
