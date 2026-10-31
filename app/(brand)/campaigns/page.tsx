"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, CircleDot, LayoutGrid, List, Plus, Search, X } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { CampaignTypeBadge } from "@/components/campaigns/campaign-type-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PeriodFilter } from "@/components/ui/period-filter"
import { visibilityLabel } from "@/lib/campaign-access"
import { campaignRoi, ROI_TOOLTIP } from "@/lib/roi"
import { formatDateRangeBR } from "@/lib/dates"
import { ALL_PERIOD, rangeOverlapsPeriod, type PeriodValue } from "@/lib/period"
import { campaignStatusKey, useI18n } from "@/lib/i18n"
import type { Campaign, CampaignStatus } from "@/lib/mock-data/campaigns"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { cn } from "@/lib/utils"

type CampaignView = "grid" | "list"
type StatusFilter = "all" | "em_execucao" | "aberta" | "rascunho" | "concluida"

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "em_execucao", label: "Em execução" },
  { key: "aberta", label: "Abertas" },
  { key: "rascunho", label: "Rascunhos" },
  { key: "concluida", label: "Concluídas" },
]

const STATUS_VARIANT: Record<CampaignStatus, "default" | "secondary" | "destructive"> = {
  em_execucao: "default",
  aberta: "default",
  rascunho: "secondary",
  concluida: "secondary",
  cancelada: "destructive",
  arquivada: "secondary",
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

function spentPercent(campaign: Campaign) {
  if (campaign.budget <= 0) return 0
  return Math.min((campaign.budgetSpent / campaign.budget) * 100, 100)
}

function matchesQuery(campaign: Campaign, query: string) {
  const term = query.trim().toLowerCase()
  if (!term) return true
  return campaign.name.toLowerCase().includes(term)
}

export default function CampaignsPage() {
  const { t } = useI18n()
  const campaigns = useCampaignStore((s) => s.campaigns)
  const user = useAuthStore((s) => s.user)
  const orgCampaigns = campaigns.filter((c) => c.organizationId === user?.organizationId)
  const [view, setView] = useState<CampaignView>("grid")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [period, setPeriod] = useState<PeriodValue>(ALL_PERIOD)
  const datedCampaigns = orgCampaigns.filter((campaign) =>
    rangeOverlapsPeriod(campaign.startDate, campaign.endDate, period),
  )
  const statusOptions = STATUS_OPTIONS.map((option) => ({
    ...option,
    count: option.key === "all" ? datedCampaigns.length : datedCampaigns.filter((campaign) => campaign.status === option.key).length,
  }))
  const statusLabel = statusOptions.find((option) => option.key === status)?.label ?? "Status"
  const items = datedCampaigns
    .filter((campaign) => status === "all" || campaign.status === status)
    .filter((campaign) => matchesQuery(campaign, query))

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("nav.campaigns")}
        subtitle={t("pages.campaignsCount", { count: orgCampaigns.length })}
        actions={
          <Link href="/campaigns/create">
            <Button size="sm">
              <Plus />
              {t("pages.newCampaign")}
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="px-3 font-normal"
                      aria-pressed={status !== "all"}
                      aria-label="Status da campanha"
                    />
                  }
                >
                  <CircleDot data-icon="inline-start" />
                  {status === "all" ? "Status" : statusLabel}
                  <ChevronDown data-icon="inline-end" className="text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-52">
                  <DropdownMenuRadioGroup value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
                    {statusOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.key} value={option.key}>
                        <span className="flex w-full items-center justify-between gap-6">
                          {option.label}
                          <span className="text-xs tabular-nums text-muted-foreground">{option.count}</span>
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <PeriodFilter value={period} onChange={setPeriod} />
            </div>
            <div className="flex items-center gap-2">
              <InputGroup className="w-full sm:w-60">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar campanha"
                  aria-label="Buscar campanha"
                />
                {query && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton size="icon-xs" aria-label="Limpar busca" onClick={() => setQuery("")}>
                      <X />
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>
              <div className="flex h-8 shrink-0 items-center overflow-hidden rounded-lg border border-border" role="group" aria-label="Visualização">
                <Button
                  type="button"
                  variant={view === "grid" ? "default" : "ghost"}
                  className="h-full rounded-none px-2.5"
                  aria-label="Ver em grade"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid />
                  Grade
                </Button>
                <Button
                  type="button"
                  variant={view === "list" ? "default" : "ghost"}
                  className="h-full rounded-none border-l border-border px-2.5"
                  aria-label="Ver em lista"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <List />
                  Lista
                </Button>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyCampaigns search={query.trim().length > 0} period={period.preset !== "all"} status={status !== "all"} />
          ) : view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <CampaignTable items={items} />
          )}
        </div>
      </div>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { t } = useI18n()
  const percent = spentPercent(campaign)

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-0 py-0 transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {campaign.coverImage ? (
            <img
              src={campaign.coverImage}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
              {campaign.organizationName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <CampaignTypeBadge
            type={campaign.type}
            className="absolute top-3 left-3 max-w-[calc(100%-8.5rem)] bg-background shadow-sm ring-1 ring-background/70"
          />
          <Badge variant={STATUS_VARIANT[campaign.status]} className="absolute top-3 right-3 shadow-sm ring-1 ring-background/70">
            {t(campaignStatusKey(campaign.status))}
          </Badge>
        </div>
        <CardHeader className="pt-4">
          <CardTitle className="line-clamp-2 min-h-12 leading-snug">{campaign.name}</CardTitle>
          <CardDescription className="line-clamp-1 text-xs">
            {formatDateRangeBR(campaign.startDate, campaign.endDate, "Datas a definir")}
            {" · "}
            {visibilityLabel(campaign.visibility)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pb-4">
          <div className="mt-auto space-y-3 border-t border-border pt-3">
            <div className="grid grid-cols-3 gap-2">
              <Metric label="Creators" value={String(campaign.participants.length)} />
              <Metric label="Orçamento" value={`R$ ${fmt(campaign.budget)}`} />
              <Metric label="ROI" value={<Roi value={campaignRoi(campaign)} />} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Gasto</span>
                <span className="tabular-nums">
                  R$ {fmt(campaign.budgetSpent)}
                  {campaign.budget > 0 && (
                    <span className="text-muted-foreground"> · {Math.round(percent)}%</span>
                  )}
                </span>
              </div>
              <Progress value={percent} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function CampaignTable({ items }: { items: Campaign[] }) {
  const { t } = useI18n()

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow>
            {["Campanha", "Tipo", "Creators", "Orçamento", "Gasto", "ROI", "Status"].map((label) => (
              <TableHead key={label}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((campaign) => (
            <TableRow key={campaign.id} className="relative">
              <TableCell className="py-3">
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="flex items-center gap-3 after:absolute after:inset-0 focus-visible:outline-none"
                >
                  <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {campaign.coverImage ? (
                      <img src={campaign.coverImage} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs font-semibold text-muted-foreground">
                        {campaign.organizationName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{campaign.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDateRangeBR(campaign.startDate, campaign.endDate, "Datas a definir")}
                      {" · "}
                      {visibilityLabel(campaign.visibility)}
                    </p>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <CampaignTypeBadge type={campaign.type} />
              </TableCell>
              <TableCell className="tabular-nums">{campaign.participants.length}</TableCell>
              <TableCell className="tabular-nums">R$ {fmt(campaign.budget)}</TableCell>
              <TableCell>
                <p className="tabular-nums">R$ {fmt(campaign.budgetSpent)}</p>
                {campaign.budget > 0 && (
                  <Progress value={spentPercent(campaign)} className="mt-1 w-16" />
                )}
              </TableCell>
              <TableCell>
                <Roi value={campaignRoi(campaign)} />
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[campaign.status]}>{t(campaignStatusKey(campaign.status))}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium tabular-nums">{value}</p>
    </div>
  )
}

function Roi({ value }: { value?: number }) {
  if (value === undefined) return <span className="font-medium text-muted-foreground" title={ROI_TOOLTIP}>—</span>
  return <span className={cn("font-medium tabular-nums", value < 0 && "text-destructive")} title={ROI_TOOLTIP}>{value}%</span>
}

function EmptyCampaigns({ search, period, status }: { search: boolean; period: boolean; status: boolean }) {
  const narrowed = search || period || status
  return (
    <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-foreground/10">
      <p className="text-sm font-medium">
        {narrowed ? "Nenhuma campanha encontrada" : "Nenhuma campanha nesta categoria"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {period && !search
          ? "Nenhuma campanha cobre este período."
          : search
            ? "Tente outro nome ou limpe a busca."
            : "As campanhas deste status aparecem aqui."}
      </p>
    </div>
  )
}
