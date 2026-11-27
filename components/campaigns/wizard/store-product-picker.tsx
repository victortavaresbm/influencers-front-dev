"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronDown, RefreshCw, Search } from "lucide-react"
import { StoreProductCard } from "@/components/campaigns/wizard/store-product-card"
import { platformMeta } from "@/components/integrations/store-platforms"
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
  platform: string
  store: string | null
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
  // Per store: how many cards show, and whether the section is collapsed.
  const [shown, setShown] = useState<Record<string, number>>({})
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
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
          platform: c.platform,
          store: c.storeIdentifier,
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
  else if (!marcaId) body = <p className="text-sm text-zinc-500">Escolha uma Marca para ver os produtos.</p>
  else if (error !== null) body = <p className="text-sm text-red-600">{apiErrorMessage(t, error)}</p>
  else if (groups === null) body = <p className="text-sm text-zinc-500">Carregando produtos…</p>
  else if (groups.length === 0) body = <p className="text-sm text-zinc-500">Nenhuma loja conectada. Conecte em {settingsLink}.</p>
  else {
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
              setShown({})
            }}
          />
        </div>
        {groups.map((group) => {
          const matches = filterItems(group.items, query)
          const limit = shown[group.connectionId] ?? PAGE
          const open = !collapsed[group.connectionId]
          const picked = group.items.filter((item) => selected.has(item.key)).length
          const { name, icon: Icon } = platformMeta(group.platform)
          return (
            <section key={group.connectionId} className="rounded-lg border border-zinc-200">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setCollapsed((c) => ({ ...c, [group.connectionId]: open }))}
                className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-zinc-900">{name}</span>
                  {group.store && <span className="block truncate text-xs text-zinc-500">{group.store}</span>}
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {picked > 0 ? `${picked} de ${group.items.length} escolhidos` : `${group.items.length} produtos`}
                </span>
                <ChevronDown size={16} className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {open && (
                <div className="space-y-3 border-t border-zinc-200 p-3">
                  {matches.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      {query.trim() ? "Nenhum produto com esse nome." : <>Nenhum produto ainda. Use &ldquo;Atualizar da loja&rdquo;.</>}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {matches.slice(0, limit).map((item) => (
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
                  {matches.length > limit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShown((s) => ({ ...s, [group.connectionId]: limit + PAGE }))}
                    >
                      Mostrar mais ({matches.length - limit})
                    </Button>
                  )}
                </div>
              )}
            </section>
          )
        })}
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
