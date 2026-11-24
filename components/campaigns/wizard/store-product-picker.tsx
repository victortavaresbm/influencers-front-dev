"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Token } from "@/components/campaigns/wizard/wizard-chrome"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { apiErrorMessage } from "@/lib/api/errors"
import { useApi } from "@/lib/api/use-api"
import { useI18n } from "@/lib/i18n"
import { productKey, toggleStoreProduct, toPickerItems, type PickerItem, type ProductSelectionView, type StoreProduct } from "@/lib/campaigns/store-products"
import type { ConnectionView } from "@/lib/integrations/stores"

const CONNECTIONS = "/v1/sales/marca/connections"

interface StoreGroup {
  connectionId: string
  label: string
  items: PickerItem[]
}

// Products of every active store connection of the Marca. Picking them only
// fills the campaign draft.
export function StoreProductPicker({
  value,
  onChange,
}: {
  value: StoreProduct[]
  onChange: (next: StoreProduct[]) => void
}) {
  const { t } = useI18n()
  const { signedIn, marcaId, request } = useApi()
  const [groups, setGroups] = useState<StoreGroup[] | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [reloads, setReloads] = useState(0)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (!signedIn || !marcaId) return
    let cancelled = false
    const load = async () => {
      const connections = await request<ConnectionView[]>("GET", CONNECTIONS)
      const active = connections.filter((c) => c.state === "active")
      return Promise.all(
        active.map(async (c) => ({
          connectionId: c.id,
          label: c.storeIdentifier ?? c.platform,
          items: toPickerItems(c.id, await request<ProductSelectionView>("GET", `${CONNECTIONS}/${c.id}/products-selection`)),
        }))
      )
    }
    load().then(
      (next) => {
        if (cancelled) return
        setGroups(next)
        setError(null)
      },
      (err: unknown) => {
        if (!cancelled) setError(err)
      }
    )
    return () => {
      cancelled = true
    }
  }, [signedIn, marcaId, request, reloads])

  const sync = async () => {
    setSyncing(true)
    try {
      await Promise.all((groups ?? []).map((g) => request("POST", `${CONNECTIONS}/${g.connectionId}/products/sync`)))
      toast.add({ type: "info", title: "Atualização pedida", description: "Os produtos chegam em instantes. Recarregue a lista daqui a pouco." })
    } catch (err) {
      toast.add({ type: "error", title: "Não foi possível atualizar", description: apiErrorMessage(t, err) })
    } finally {
      setSyncing(false)
    }
  }

  const selected = new Set(value.map(productKey))
  const settingsLink = (
    <Link href="/settings" className="font-medium text-zinc-900 underline underline-offset-2">
      Configurações → Integrações
    </Link>
  )

  let body: React.ReactNode
  if (!signedIn) body = <p className="text-sm text-zinc-500">Entre com conta real para usar os produtos da sua loja.</p>
  else if (!marcaId) body = <p className="text-sm text-zinc-500">Defina a Marca ativa em {settingsLink}.</p>
  else if (error !== null) body = <p className="text-sm text-red-600">{apiErrorMessage(t, error)}</p>
  else if (groups === null) body = <p className="text-sm text-zinc-500">Carregando produtos…</p>
  else if (groups.length === 0) body = <p className="text-sm text-zinc-500">Nenhuma loja conectada. Conecte em {settingsLink}.</p>
  else
    body = groups.map((group) => (
      <div key={group.connectionId} className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{group.label}</p>
        {group.items.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum produto ainda. Use &ldquo;Atualizar da loja&rdquo;.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <Token
                key={item.key}
                selected={selected.has(item.key)}
                onClick={() =>
                  onChange(toggleStoreProduct(value, { connectionId: item.connectionId, externalProductId: item.externalProductId, name: item.name }))
                }
              >
                {item.name}
              </Token>
            ))}
          </div>
        )}
      </div>
    ))

  const loaded = signedIn && marcaId && groups !== null && error === null

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-900">Produtos da loja</p>
        {loaded && (
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setReloads((n) => n + 1)}>
              Recarregar
            </Button>
            {groups.length > 0 && (
              <Button type="button" variant="outline" size="sm" disabled={syncing} onClick={sync}>
                <RefreshCw data-icon="inline-start" />
                Atualizar da loja
              </Button>
            )}
          </div>
        )}
      </div>
      {body}
    </div>
  )
}
