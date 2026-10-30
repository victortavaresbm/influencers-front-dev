"use client"
import { use, useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"
import { useSeedingStore } from "@/lib/stores/seeding"
import { useAuthStore } from "@/lib/stores/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SeedingBoard } from "@/components/seeding/seeding-board"
import { SeedingResults } from "@/components/seeding/seeding-results"
import {
  ArrowLeft,
  Users,
  Package,
  BarChart3,
  LayoutGrid,
  List,
} from "lucide-react"
import type { SeedingStatus, SeedingCampaign, SeedingProduct } from "@/lib/mock-data/seeding"

const STATUS_COLORS: Record<SeedingStatus, string> = {
  ativa: "bg-zinc-900 text-white",
  rascunho: "bg-zinc-200 text-zinc-700",
  encerrada: "bg-zinc-100 text-zinc-500",
  pausada: "bg-yellow-100 text-yellow-700",
}

const STATUS_LABEL: Record<SeedingStatus, string> = {
  ativa: "Ativa",
  rascunho: "Rascunho",
  encerrada: "Encerrada",
  pausada: "Pausada",
}


function currency(n: number) {
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function ProductFacts({ product }: { product: SeedingProduct }) {
  const available = product.stockForSeeding - product.stockUsed
  const pctUsed = product.stockForSeeding > 0 ? (product.stockUsed / product.stockForSeeding) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {product.variants.map((variant) => (
          <span key={variant} className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">{variant}</span>
        ))}
      </div>
      <p className="text-sm font-semibold text-zinc-900">{currency(product.unitCost)}</p>
      <div className="h-1 overflow-hidden rounded bg-zinc-200">
        <div
          className={`h-full rounded ${pctUsed > 80 ? "bg-red-400" : "bg-zinc-900"}`}
          style={{ width: `${Math.min(pctUsed, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{product.stockUsed} enviados</span>
        <span className={available === 0 ? "font-medium text-red-500" : available < 5 ? "font-medium text-yellow-600" : "text-zinc-700"}>
          {available} disponíveis
        </span>
      </div>
    </div>
  )
}

function ProductImage({
  product,
  className,
  iconSize = 16,
}: {
  product: SeedingProduct
  className?: string
  iconSize?: number
}) {
  if (product.imageUrl) {
    return <img src={product.imageUrl} alt={product.name} className={className} />
  }
  return (
    <div className={`flex items-center justify-center bg-zinc-100 ${className ?? ""}`}>
      <Package size={iconSize} className="text-zinc-400" />
    </div>
  )
}

function ProductsTab({ campaign }: { campaign: SeedingCampaign }) {
  const [view, setView] = useState<"grid" | "list">("grid")
  const totalCost = campaign.products.reduce((sum, product) => sum + product.unitCost * product.stockUsed, 0)
  const totalSent = campaign.products.reduce((sum, product) => sum + product.stockUsed, 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex items-center overflow-hidden rounded-lg border border-zinc-200">
          <Button
            type="button"
            size="icon-sm"
            variant={view === "grid" ? "default" : "ghost"}
            className="rounded-none"
            aria-label="Ver em grade"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={view === "list" ? "default" : "ghost"}
            className="rounded-none"
            aria-label="Ver em lista"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Custo total em produto</p>
          <p className="mt-0.5 text-xl font-semibold text-zinc-900">{currency(totalCost)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Unidades enviadas</p>
          <p className="mt-0.5 text-xl font-semibold text-zinc-900">{totalSent}</p>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {campaign.products.map((product) => (
            <Card key={product.id} size="sm" className="overflow-hidden bg-white pt-0">
              <ProductImage product={product} iconSize={28} className="aspect-square w-full object-cover" />
              <CardContent className="space-y-2">
                <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                <ProductFacts product={product} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-200">
              <tr>
                {["Produto", "Variantes", "Custo unit.", "Estoque seeding", "Enviados", "Disponíveis"].map((header) => (
                  <th key={header} className="bg-zinc-50 px-4 py-2.5 text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaign.products.map((product) => {
                const available = product.stockForSeeding - product.stockUsed
                const pctUsed = product.stockForSeeding > 0 ? (product.stockUsed / product.stockForSeeding) * 100 : 0
                return (
                  <tr key={product.id} className="border-b border-zinc-100 transition-colors hover:bg-zinc-50">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <ProductImage product={product} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                        <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {product.variants.map((variant) => (
                          <span key={variant} className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">{variant}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-700">{currency(product.unitCost)}</td>
                    <td className="px-4 py-3.5 text-sm text-zinc-700">{product.stockForSeeding}</td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm text-zinc-700">{product.stockUsed}</p>
                        <div className="mt-1 h-1 w-16 overflow-hidden rounded bg-zinc-200">
                          <div
                            className={`h-full rounded ${pctUsed > 80 ? "bg-red-400" : "bg-zinc-900"}`}
                            style={{ width: `${Math.min(pctUsed, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm font-medium ${available === 0 ? "text-red-500" : available < 5 ? "text-yellow-600" : "text-zinc-900"}`}>
                        {available}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function SeedingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const campaigns = useSeedingStore((s) => s.campaigns)
  const setStatus = useSeedingStore((s) => s.setStatus)
  const user = useAuthStore((s) => s.user)

  const campaign = campaigns.find((c) => c.id === id && c.organizationId === user?.organizationId)
  if (!campaign) return notFound()

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title={campaign.name}
        leading={
          <Link href="/seeding">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
              <ArrowLeft size={16} />
            </button>
          </Link>
        }
        titleAside={
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[campaign.status]}`}>
            {STATUS_LABEL[campaign.status]}
          </span>
        }
        actions={
          campaign.status === "rascunho" ? (
            <Button size="sm" onClick={() => setStatus(campaign.id, "ativa")}>
              Ativar campanha
            </Button>
          ) : campaign.status === "ativa" ? (
            <Button size="sm" variant="outline" onClick={() => setStatus(campaign.id, "encerrada")}>
              Encerrar campanha
            </Button>
          ) : null
        }
      />

      <div className="p-6 space-y-2">
        {/* Campaign info strip */}
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Objetivo</p>
            <p className="text-zinc-700 mt-0.5 max-w-sm">{campaign.objective}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Modo</p>
            <p className="text-zinc-700 mt-0.5 capitalize">{campaign.mode === "fechado" ? "Fechado" : "Aberto"}</p>
          </div>
          {campaign.expectedHashtag && (
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Hashtag</p>
              <p className="text-zinc-700 mt-0.5 font-mono text-xs">{campaign.expectedHashtag}</p>
            </div>
          )}
          {campaign.expectedMention && (
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Menção</p>
              <p className="text-zinc-700 mt-0.5 font-mono text-xs">{campaign.expectedMention}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Prazo pós-entrega</p>
            <p className="text-zinc-700 mt-0.5">{campaign.daysToPost} dias</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Formatos esperados</p>
            <div className="flex gap-1 flex-wrap mt-0.5">
              {campaign.expectedFormats.map((f) => (
                <span key={f} className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 capitalize">{f}</span>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="creators" className="pt-2">
          <TabsList>
            <TabsTrigger value="creators">
              <Users size={13} className="mr-1.5" />
              Creators
              <span className="ml-1.5 text-xs bg-zinc-200 text-zinc-700 rounded-full px-1.5 py-0.5">
                {campaign.creators.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package size={13} className="mr-1.5" />
              Produtos
              <span className="ml-1.5 text-xs bg-zinc-200 text-zinc-700 rounded-full px-1.5 py-0.5">
                {campaign.products.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="results">
              <BarChart3 size={13} className="mr-1.5" />
              Resultados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="creators" className="mt-4">
            <SeedingBoard campaign={campaign} />
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <ProductsTab campaign={campaign} />
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <SeedingResults campaign={campaign} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
