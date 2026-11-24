"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { RefreshCw, Search } from "lucide-react"
import { StoreProductCard } from "@/components/campaigns/wizard/store-product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { apiErrorMessage } from "@/lib/api/errors"
import { useApi } from "@/lib/api/use-api"
import { useI18n } from "@/lib/i18n"
import { filterItems, productKey, toggleStoreProduct, toPickerItems, type PickerItem, type ProductSelectionView, type StoreProduct } from "@/lib/campaigns/store-products"
import type { ConnectionView } from "@/lib/integrations/stores"

const CONNECTIONS = "/v1/sales/marca/connections"
const PAGE = 24

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
  const { t, locale } = useI18n()
  const { signedIn, marcaId, request } = useApi()
  const [query, setQuery] = useState("")
  const [shown, setShown] = useState(PAGE)
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
          items: toPickerItems(c.id, await request<ProductSelectionView>("GET", `${CONNECTIONS}/${c.id}/products-selection`), locale),
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
  }, [signedIn, marcaId, request, reloads, locale])

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
  else {
    const matching = groups.map((group) => ({ ...group, matches: filterItems(group.items, query) }))
    // Show the first `shown` matches across stores, in store order.
    const starts = matching.map((_, index) => matching.slice(0, index).reduce((sum, g) => sum + g.matches.length, 0))
    const visible = matching.map((group, index) => ({
      ...group,
      items: group.matches.slice(0, Math.max(shown - starts[index], 0)),
      total: group.matches.length,
    }))
    const hidden = matching.reduce((sum, group) => sum + group.matches.length, 0) - shown
    body = (
      <>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <Input
            aria-label="Buscar produto"
            placeholder="Buscar produto"
            className="pl-8"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setShown(PAGE)
            }}
          />
        </div>
        {visible.map((group) => (
          <div key={group.connectionId} className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{group.label}</p>
            {group.total === 0 ? (
              <p className="text-sm text-zinc-500">
                {query.trim() ? "Nenhum produto com esse nome." : <>Nenhum produto ainda. Use &ldquo;Atualizar da loja&rdquo;.</>}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.items.map((item) => (
                  <StoreProductCard
                    key={item.key}
                    item={item}
                    selected={selected.has(item.key)}
                    onToggle={() =>
                      onChange(
                        toggleStoreProduct(value, {
                          connectionId: item.connectionId,
                          externalProductId: item.externalProductId,
                          name: item.name,
                          imageUrl: item.imageUrl,
                          priceLabel: item.priceLabel,
                        })
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        {hidden > 0 && (
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setShown((n) => n + PAGE)}>
            Mostrar mais ({hidden})
          </Button>
        )}
      </>
    )
  }

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
