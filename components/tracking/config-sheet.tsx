"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { BrandMark } from "@/components/tracking/brand-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  NETWORKS,
  SIGNALS,
  type BrandCatalog,
  type ContentScope,
  type Network,
  type Period,
  type Signal,
  type TrackingConfig,
} from "@/lib/mock-data/tracking"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"

const PERIODS: { value: Period; label: string; help: string }[] = [
  { value: "30d", label: "Últimos 30 dias", help: "Janela recente, ao lado da variação do mês." },
  { value: "90d", label: "Últimos 90 dias", help: "Trimestre, para comparar campanhas vizinhas." },
  { value: "12m", label: "Últimos 12 meses", help: "Ano fechado, ao lado da variação anual." },
]

const SCOPES: { value: ContentScope; label: string; help: string }[] = [
  { value: "all", label: "Tudo", help: "Orgânico e parceria paga no mesmo recorte." },
  { value: "organic", label: "Orgânico", help: "Só o que não está marcado como anúncio." },
  { value: "sponsored", label: "Patrocinado", help: "Só parceria paga, #publi e anúncio." },
]

const SIGNAL_COPY: Record<Signal, { label: string; help: string }> = {
  mention: { label: "Menções", help: "Publicações que citam o @ da marca." },
  hashtag: { label: "Hashtags", help: "Hashtags oficiais e de campanha." },
  keyword: { label: "Palavras-chave", help: "Nome da marca no texto da publicação." },
  sponsored: { label: "Conteúdo patrocinado", help: "Parceria paga, #publi e conteúdo marcado como anúncio." },
  official: { label: "Contas oficiais", help: "O que as contas da marca publicam." },
}

const NETWORK_COPY: Record<Network, { label: string; icon: typeof SiInstagram }> = {
  instagram: { label: "Instagram", icon: SiInstagram },
  tiktok: { label: "TikTok", icon: SiTiktok },
  youtube: { label: "YouTube", icon: SiYoutube },
}

function toggleValue<T extends string>(list: T[], value: T, on: boolean) {
  if (on) return list.includes(value) ? list : [...list, value]
  return list.filter((item) => item !== value)
}

function preview(values: string[]) {
  const unique = [...new Set(values)]
  const shown = unique.slice(0, 6)
  const extra = unique.length - shown.length
  return extra > 0 ? `${shown.join(", ")} e mais ${extra}` : shown.join(", ")
}

export function TrackingConfigSheet({
  open,
  onOpenChange,
  catalog,
  config,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalog: BrandCatalog
  config: TrackingConfig
  onSave: (config: TrackingConfig) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
        {open ? (
          <TrackingConfigForm
            catalog={catalog}
            config={config}
            onCancel={() => onOpenChange(false)}
            onSave={(next) => {
              onSave(next)
              onOpenChange(false)
            }}
          />
        ) : (
          <SheetHeader className="sr-only">
            <SheetTitle>Configurar tracking</SheetTitle>
            <SheetDescription>
              Escolha as marcas competidoras e o que passa a ser monitorado: período, redes, conteúdo e sinais.
            </SheetDescription>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  )
}

function TrackingConfigForm({
  catalog,
  config,
  onSave,
  onCancel,
}: {
  catalog: BrandCatalog
  config: TrackingConfig
  onSave: (config: TrackingConfig) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(config)
  const [query, setQuery] = useState("")

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return catalog.competitors
    return catalog.competitors.filter((brand) => brand.name.toLowerCase().includes(needle))
  }, [catalog.competitors, query])

  const selectedBrands = useMemo(() => {
    const picked = new Set(draft.competitorIds)
    return [catalog.own, ...catalog.competitors.filter((brand) => picked.has(brand.id))]
  }, [catalog, draft.competitorIds])

  const canSave = draft.networks.length > 0 && draft.signals.length > 0

  function save() {
    if (!canSave) return
    onSave({
      competitorIds: catalog.competitors.filter((brand) => draft.competitorIds.includes(brand.id)).map((brand) => brand.id),
      period: draft.period,
      networks: NETWORKS.filter((network) => draft.networks.includes(network)),
      scope: draft.scope,
      signals: SIGNALS.filter((signal) => draft.signals.includes(signal)),
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
          <SheetHeader className="border-b px-5 py-5 pr-14">
            <SheetTitle>Configurar tracking</SheetTitle>
            <SheetDescription>
              Escolha as marcas competidoras e o que passa a ser monitorado: período, redes, conteúdo e sinais.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-4">
            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-zinc-900">Marcas</h3>
                <p className="mt-0.5 text-xs text-zinc-500">A sua marca entra sempre. As outras formam o conjunto competitivo.</p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar marca"
                  aria-label="Buscar marca competidora"
                  className="pl-8"
                />
              </div>
              <ul className="space-y-1">
                <li>
                  <Label className="flex items-center gap-3 rounded-lg px-2 py-2 font-normal">
                    <Checkbox checked disabled aria-label={`${catalog.own.name} é a sua marca`} />
                    <BrandMark brand={catalog.own} />
                    <span className="min-w-0 flex-1 truncate text-sm text-zinc-900">{catalog.own.name}</span>
                    <Badge variant="secondary">Sua marca</Badge>
                  </Label>
                </li>
                {visible.map((brand) => {
                  const checked = draft.competitorIds.includes(brand.id)
                  return (
                    <li key={brand.id}>
                      <Label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 font-normal hover:bg-zinc-50">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            setDraft((current) => ({
                              ...current,
                              competitorIds: toggleValue(current.competitorIds, brand.id, value === true),
                            }))
                          }
                          aria-label={`Monitorar ${brand.name}`}
                        />
                        <BrandMark brand={brand} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-zinc-900">{brand.name}</span>
                          <span className="block truncate text-xs text-zinc-500">{brand.handles.instagram}</span>
                        </span>
                      </Label>
                    </li>
                  )
                })}
              </ul>
              {visible.length === 0 ? <p className="px-2 text-sm text-zinc-500">Nenhuma marca encontrada.</p> : null}
              <p className="text-xs text-zinc-500">
                {draft.competitorIds.length} competidora{draft.competitorIds.length === 1 ? "" : "s"} além de {catalog.own.name}
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-900">Período</h3>
              <RadioGroup
                value={draft.period}
                onValueChange={(value) => setDraft((current) => ({ ...current, period: (value as Period) || "90d" }))}
                className="gap-2"
              >
                {PERIODS.map((period) => (
                  <Label key={period.value} className="flex items-start gap-3 rounded-lg px-2 py-2 font-normal hover:bg-zinc-50">
                    <RadioGroupItem value={period.value} className="mt-0.5" />
                    <span>
                      <span className="block text-sm text-zinc-900">{period.label}</span>
                      <span className="block text-xs text-zinc-500">{period.help}</span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-900">Redes</h3>
              <ul className="space-y-1">
                {NETWORKS.map((network) => {
                  const copy = NETWORK_COPY[network]
                  const Icon = copy.icon
                  return (
                    <li key={network}>
                      <Label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 font-normal hover:bg-zinc-50">
                        <Checkbox
                          checked={draft.networks.includes(network)}
                          onCheckedChange={(value) =>
                            setDraft((current) => ({
                              ...current,
                              networks: toggleValue(current.networks, network, value === true),
                            }))
                          }
                          aria-label={copy.label}
                        />
                        <Icon className="size-3.5 text-zinc-700" />
                        <span className="text-sm text-zinc-900">{copy.label}</span>
                      </Label>
                    </li>
                  )
                })}
              </ul>
              {draft.networks.length === 0 ? (
                <p className="text-xs text-rose-600">Escolha ao menos uma rede.</p>
              ) : null}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-900">Conteúdo</h3>
              <RadioGroup
                value={draft.scope}
                onValueChange={(value) =>
                  setDraft((current) => ({ ...current, scope: (value as ContentScope) || "all" }))
                }
                className="gap-2"
              >
                {SCOPES.map((scope) => (
                  <Label key={scope.value} className="flex items-start gap-3 rounded-lg px-2 py-2 font-normal hover:bg-zinc-50">
                    <RadioGroupItem value={scope.value} className="mt-0.5" />
                    <span>
                      <span className="block text-sm text-zinc-900">{scope.label}</span>
                      <span className="block text-xs text-zinc-500">{scope.help}</span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-zinc-900">Sinais de rastreamento</h3>
                <p className="mt-0.5 text-xs text-zinc-500">Cada sinal é uma forma de a publicação entrar no monitoramento.</p>
              </div>
              <ul className="space-y-1">
                {SIGNALS.map((signal) => (
                  <li key={signal}>
                    <Label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 font-normal hover:bg-zinc-50">
                      <Checkbox
                        className="mt-0.5"
                        checked={draft.signals.includes(signal)}
                        onCheckedChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            signals: toggleValue(current.signals, signal, value === true),
                          }))
                        }
                        aria-label={SIGNAL_COPY[signal].label}
                      />
                      <span>
                        <span className="block text-sm text-zinc-900">{SIGNAL_COPY[signal].label}</span>
                        <span className="block text-xs text-zinc-500">{SIGNAL_COPY[signal].help}</span>
                      </span>
                    </Label>
                  </li>
                ))}
              </ul>
              {draft.signals.length === 0 ? (
                <p className="text-xs text-rose-600">Escolha ao menos um sinal.</p>
              ) : null}
              <div className="space-y-1 rounded-lg bg-zinc-50 px-3 py-3 text-xs text-zinc-600">
                <p className="font-medium text-zinc-800">Regras deste conjunto</p>
                {draft.signals.includes("mention") ? <p>Menções: {preview(selectedBrands.map((brand) => brand.handles.instagram))}</p> : null}
                {draft.signals.includes("hashtag") ? <p>Hashtags: {preview(selectedBrands.flatMap((brand) => brand.hashtags))}</p> : null}
                {draft.signals.includes("keyword") ? <p>Palavras-chave: {preview(selectedBrands.flatMap((brand) => brand.keywords))}</p> : null}
                {draft.signals.includes("sponsored") ? <p>Patrocinado: parceria paga, #publi e anúncio marcado.</p> : null}
                {draft.signals.includes("official") ? (
                  <p>Contas oficiais: {preview(selectedBrands.flatMap((brand) => NETWORKS.map((network) => brand.handles[network])))}</p>
                ) : null}
              </div>
            </section>
          </div>

          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="button" disabled={!canSave} onClick={save}>
              Salvar
            </Button>
          </SheetFooter>
        </div>
  )
}
