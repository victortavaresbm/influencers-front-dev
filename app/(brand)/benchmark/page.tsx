"use client"

import { useState } from "react"
import { Download, RotateCcw, SlidersHorizontal } from "lucide-react"
import { TrackingConfigSheet } from "@/components/tracking/config-sheet"
import { csvCell } from "@/components/tracking/format"
import { InsightsTable } from "@/components/tracking/insights-table"
import { PerformancePanel } from "@/components/tracking/performance-panel"
import { PostsGrid } from "@/components/tracking/posts-grid"
import { useTrackingView } from "@/components/tracking/use-tracking"
import { TopBar } from "@/components/layout/top-bar"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateBR } from "@/lib/dates"
import { useI18n } from "@/lib/i18n"
import {
  UPDATED_AT,
  defaultConfig,
  monitoredBrands,
  projectBrand,
  sameConfig,
  type ContentScope,
  type Period,
  type Signal,
  type TrackingConfig,
} from "@/lib/mock-data/tracking"
import { useTrackingStore } from "@/lib/stores/tracking"

const PERIOD_LABEL: Record<Period, string> = {
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  "12m": "Últimos 12 meses",
}

const SCOPE_LABEL: Record<ContentScope, string> = {
  all: "Orgânico e patrocinado",
  organic: "Só orgânico",
  sponsored: "Só patrocinado",
}

const SIGNAL_LABEL: Record<Signal, string> = {
  mention: "Menções",
  hashtag: "Hashtags",
  keyword: "Palavras-chave",
  sponsored: "Patrocinado",
  official: "Contas oficiais",
}

const NETWORK_LABEL = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
} as const

function exportCsv(organizationId: string, config: TrackingConfig) {
  const rows = monitoredBrands(organizationId, config)
    .map((brand) => projectBrand(brand, config))
    .sort((a, b) => b.emv - a.emv)
  const header = [
    "Rank",
    "Marca",
    "Creators",
    "Publicações",
    "EMV",
    "Engajamento",
    "Impressões",
    "Alcance",
    "Potência",
    "Frequência",
    "EMV patrocinado",
    "MoM",
    "YoY",
  ]
  const lines = [
    header.join(","),
    ...rows.map((row, index) =>
      [
        index + 1,
        csvCell(row.brand.name),
        Math.round(row.creators),
        row.posts,
        Math.round(row.emv),
        Math.round(row.engagement),
        Math.round(row.impressions),
        Math.round(row.reach),
        Math.round(row.potency),
        row.frequency.toFixed(2),
        Math.round(row.sponsoredEmv),
        row.mom,
        row.yoy,
      ].join(","),
    ),
  ]
  const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "tracking-insights.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export default function TrackingPage() {
  const { t } = useI18n()
  const { user, ready, organizationId, catalog, config, brands, snapshots, posts } = useTrackingView()
  const save = useTrackingStore((state) => state.save)
  const reset = useTrackingStore((state) => state.reset)
  const [configOpen, setConfigOpen] = useState(false)
  const isDefault = sameConfig(config, defaultConfig(organizationId))

  if (!user || !ready) return null

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("pages.tracking")}
        subtitle={t("pages.trackingSub")}
        actions={
          <>
            <ActionsMenu
              items={[
                {
                  label: "Exportar CSV",
                  icon: Download,
                  onSelect: () => exportCsv(organizationId, config),
                },
                {
                  label: "Restaurar padrão",
                  icon: RotateCcw,
                  disabled: isDefault,
                  onSelect: () => reset(organizationId),
                },
              ]}
            />
            <Button size="sm" onClick={() => setConfigOpen(true)}>
              <SlidersHorizontal />
              Configurar
            </Button>
          </>
        }
      />

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{PERIOD_LABEL[config.period]}</Badge>
          <Badge variant="outline">{config.networks.map((network) => NETWORK_LABEL[network]).join(", ")}</Badge>
          <Badge variant="outline">{SCOPE_LABEL[config.scope]}</Badge>
          {config.signals.map((signal) => (
            <Badge key={signal} variant="secondary">
              {SIGNAL_LABEL[signal]}
            </Badge>
          ))}
          <span className="text-xs text-zinc-500">Atualizado em {formatDateBR(UPDATED_AT)}</span>
        </div>

        <Tabs defaultValue="insights">
          <TabsList>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="posts">
              Publicações
              <span className="ml-1.5 rounded-full bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-700">{posts.length}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="insights" className="mt-4 space-y-4">
            <InsightsTable snapshots={snapshots} ownId={catalog.own.id} />
            <PerformancePanel snapshots={snapshots} period={config.period} scope={config.scope} ownId={catalog.own.id} />
          </TabsContent>
          <TabsContent value="posts" className="mt-4">
            <PostsGrid posts={posts} brands={brands} />
          </TabsContent>
        </Tabs>
      </div>

      <TrackingConfigSheet
        open={configOpen}
        onOpenChange={setConfigOpen}
        catalog={catalog}
        config={config}
        onSave={(next) => save(organizationId, next)}
      />
    </div>
  )
}
