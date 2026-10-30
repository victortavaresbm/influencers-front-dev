"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Crown, FileText, FolderOpen, Heart, MessageCircle, Sparkles, TrendingDown, TrendingUp, Trophy, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useBrandSearch } from "@/components/creator/brand-shell"
import { CREATORS } from "@/lib/mock-data/creators"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { usePartnerCommunity } from "@/lib/stores/partner-community"
import { useEngagementStore } from "@/lib/stores/engagement"
import { scoreEvents, type EngagementScore, type Period } from "@/lib/community-engagement"
import { TIERS, tierById, type AudienceTierId } from "@/lib/audience-tiers"
import { cn } from "@/lib/utils"

// ── Count-up hook ─────────────────────────────────────────────
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  const start = useRef<number | null>(null)
  const from = useRef(0)

  useEffect(() => {
    from.current = 0
    start.current = null
    if (target === 0) { setValue(0); return }

    let raf: number
    function step(ts: number) {
      if (start.current === null) start.current = ts
      const progress = Math.min((ts - start.current) / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from.current + (target - from.current) * eased))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

function RankMark({ pos }: { pos: number }) {
  if (pos === 1) return <Crown className="size-4 text-foreground" />
  return <span className="inline-block w-4 text-center text-sm tabular-nums text-muted-foreground">{pos}</span>
}

const BREAKDOWN = [
  { key: "posts" as const, icon: FileText, label: "ranking.colPosts" as const, pts: 20 },
  { key: "watches" as const, icon: Video, label: "ranking.colWatches" as const, pts: 15 },
  { key: "comments" as const, icon: MessageCircle, label: "ranking.colComments" as const, pts: 8 },
  { key: "opens" as const, icon: FolderOpen, label: "ranking.colOpens" as const, pts: 5 },
  { key: "likes" as const, icon: Heart, label: "ranking.colLikes" as const, pts: 1 },
]

function ScoreCell({ score, maxScore }: { score: EngagementScore; maxScore: number }) {
  const { t } = useI18n()
  const displayed = useCountUp(score.total, 900)
  const pct = maxScore > 0 ? (score.total / maxScore) * 100 : 0

  return (
    <div className="flex items-center justify-end gap-3">
      <Progress value={pct} className="hidden w-16 sm:flex" />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-16 justify-end px-2 font-medium tabular-nums"
              aria-label={t("ranking.breakdownTitle")}
            />
          }
        >
          {displayed.toLocaleString("pt-BR")}
        </TooltipTrigger>
        <TooltipContent side="left" className="w-56 max-w-none flex-col items-stretch gap-1 px-3 py-2.5 text-left whitespace-normal">
          <p className="font-medium">{t("ranking.breakdownTitle")}</p>
          {BREAKDOWN.map((item) => {
            const count = score[item.key]
            const Icon = item.icon
            return (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  {t(item.label)}
                </span>
                <span className="tabular-nums opacity-80">
                  {count} × {item.pts} = {count * item.pts}
                </span>
              </div>
            )
          })}
          <div className="mt-1 flex items-center justify-between border-t border-background/25 pt-1.5 font-medium">
            <span>{t("ranking.colScore")}</span>
            <span className="tabular-nums">{score.total.toLocaleString("pt-BR")}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────
interface RowData {
  id: string
  name: string
  handle: string
  avatar: string
  photo?: string
  tier: AudienceTierId
  score: EngagementScore
  pos: number
  isSelf: boolean
  prevScore: number
}

function RankRow({ row, maxScore }: { row: RowData; maxScore: number }) {
  const delta = row.score.total - row.prevScore

  return (
    <TableRow className={cn(row.isSelf && "bg-muted/60")}>
      <TableCell className="w-12 pl-4">
        <RankMark pos={row.pos} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {row.photo && <AvatarImage src={row.photo} alt="" />}
            <AvatarFallback>{row.avatar}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-medium">{row.name}</p>
              {row.isSelf && <Badge>você</Badge>}
            </div>
            <p className="truncate text-xs text-muted-foreground">{row.handle}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="outline">{tierById(row.tier).label}</Badge>
      </TableCell>
      <TableCell className="hidden text-right sm:table-cell">
        {delta !== 0 ? (
          <span className={cn("inline-flex items-center justify-end gap-0.5 text-xs font-medium tabular-nums", delta < 0 && "text-destructive")}>
            {delta > 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {Math.abs(delta)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="pr-4">
        <ScoreCell score={row.score} maxScore={maxScore} />
      </TableCell>
    </TableRow>
  )
}

// ── Podium top-3 header (brand manage view) ───────────────────
function PodiumHeader({ top3 }: { top3: RowData[] }) {
  const order = [top3[1], top3[0], top3[2]].filter(Boolean)
  const heights = [top3[1] ? "h-16" : "h-0", "h-24", top3[2] ? "h-12" : "h-0"]

  return (
    <div className="flex items-end justify-center gap-2 px-4 pb-4 pt-6">
      {order.map((row, i) => {
        const isCenter = i === 1
        const podiumH = heights[i]
        return (
          <div
            key={row.id}
            className="podium-card flex flex-col items-center gap-2"
            style={{ "--podium-delay": `${i * 120}ms` } as React.CSSProperties}
          >
            {isCenter && <Trophy className="medal-1 size-6" />}
            <Avatar size={isCenter ? "lg" : "default"} className={cn(isCenter && "ring-2 ring-amber-400 ring-offset-2")}>
              {row.photo && <AvatarImage src={row.photo} alt="" />}
              <AvatarFallback>{row.avatar}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="max-w-[72px] truncate text-xs font-semibold">{row.name.split(" ")[0]}</p>
              <p className="text-[11px] font-bold tabular-nums text-muted-foreground">
                {row.score.total.toLocaleString("pt-BR")} pts
              </p>
            </div>
            <div
              className={cn(
                "flex w-14 items-center justify-center rounded-t-lg font-bold text-white",
                podiumH,
                isCenter ? "bg-amber-400 text-amber-900" : i === 0 ? "bg-zinc-300 text-zinc-700" : "bg-amber-700/70 text-amber-100",
              )}
            >
              {row.pos}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export function RankingBoard({ manage = false }: { manage?: boolean }) {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const { selectedId } = usePartnerCommunity()
  const query = useBrandSearch().trim().toLowerCase()
  const allEvents = useEngagementStore((s) => s.events)

  const [period, setPeriod] = useState<Period>(30)
  const [tierFilter, setTierFilter] = useState<AudienceTierId | "all">("all")
  const [prevPeriod, setPrevPeriod] = useState<Period>(7)

  const scopeId = manage ? user?.organizationId : selectedId
  const selfCreator = CREATORS.find((c) => c.email === user?.email)

  // members from campaigns
  const memberIds = useMemo(() => {
    const ids = new Set<string>()
    for (const campaign of campaigns) {
      if (campaign.organizationId !== scopeId) continue
      for (const p of campaign.participants) {
        if (p.status === "selecionado" || p.status === "entregue" || p.status === "candidato") {
          ids.add(p.creatorId)
        }
      }
    }
    return ids
  }, [campaigns, scopeId])

  // org-scoped events
  const orgEvents = useMemo(
    () => allEvents.filter((e) => e.organizationId === scopeId),
    [allEvents, scopeId],
  )

  const scores = useMemo(() => scoreEvents(orgEvents, period), [orgEvents, period])
  const prevScores = useMemo(() => scoreEvents(orgEvents, prevPeriod), [orgEvents, prevPeriod])

  // build rows
  const rows: RowData[] = useMemo(() => {
    const result: RowData[] = []
    for (const id of memberIds) {
      const creator = CREATORS.find((c) => c.id === id)
      if (!creator) continue
      const score = scores.get(id) ?? { creatorId: id, total: 0, posts: 0, comments: 0, likes: 0, opens: 0, watches: 0 }
      const prev = prevScores.get(id)?.total ?? 0
      result.push({
        id,
        name: creator.name,
        handle: creator.handle,
        avatar: creator.avatar,
        photo: creator.photo,
        tier: creator.tier as AudienceTierId,
        score,
        pos: 0,
        isSelf: selfCreator?.id === id,
        prevScore: prev,
      })
    }
    return result
  }, [memberIds, scores, prevScores, selfCreator])

  // group by tier, assign position per tier
  const grouped = useMemo(() => {
    const groups = new Map<AudienceTierId, RowData[]>()
    for (const tier of TIERS) groups.set(tier.id, [])
    for (const row of rows) {
      const g = groups.get(row.tier)
      if (g) g.push(row)
    }
    for (const group of groups.values()) {
      group.sort((a, b) => b.score.total - a.score.total)
      group.forEach((row, i) => { row.pos = i + 1 })
    }
    return groups
  }, [rows])

  // filter
  const visibleGroups = useMemo(() => {
    const result: { tier: AudienceTierId; rows: RowData[] }[] = []
    for (const tier of TIERS) {
      if (tierFilter !== "all" && tier.id !== tierFilter) continue
      const group = grouped.get(tier.id) ?? []
      const filtered = query
        ? group.filter((r) => r.name.toLowerCase().includes(query) || r.handle.toLowerCase().includes(query))
        : group
      if (filtered.length > 0) result.push({ tier: tier.id, rows: filtered })
    }
    return result
  }, [grouped, tierFilter, query])

  const maxScore = useMemo(() => Math.max(...rows.map((r) => r.score.total), 1), [rows])

  // self position banner
  const selfRow = rows.find((r) => r.isSelf)

  // top3 for podium (manage view, all tiers combined)
  const allTop3 = useMemo(() => {
    return [...rows].sort((a, b) => b.score.total - a.score.total).slice(0, 3)
  }, [rows])

  // live dot pulse key — changes on period change to retrigger animations
  const [animKey, setAnimKey] = useState(0)
  function changePeriod(p: Period) {
    setPrevPeriod(period)
    setPeriod(p)
    setAnimKey((k) => k + 1)
  }

  if (!user) return null

  return (
    <div className="flex flex-1 flex-col">
      {/* self banner — creator view */}
      {!manage && selfRow && (
        <div className="mx-6 mt-6 flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3">
          <Sparkles className="size-4 text-foreground" />
          <p className="text-sm font-medium">
            {t("ranking.yourPosition", {
              pos: String(selfRow.pos),
              tier: tierById(selfRow.tier).label,
              pts: selfRow.score.total.toLocaleString("pt-BR"),
            })}
          </p>
        </div>
      )}

      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-4">
        <div className="flex items-center gap-2">
          <span className="live-dot size-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">{t("ranking.liveLabel")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={String(period)}
            onValueChange={(v) => changePeriod(Number(v) as Period)}
          >
            <TabsList>
              <TabsTrigger value="7">{t("ranking.period7")}</TabsTrigger>
              <TabsTrigger value="30">{t("ranking.period30")}</TabsTrigger>
              <TabsTrigger value="90">{t("ranking.period90")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select
            value={tierFilter}
            onValueChange={(v) => setTierFilter((v as AudienceTierId | "all") || "all")}
          >
            <SelectTrigger className="w-52">
              <SelectValue>
                {(v) =>
                  v === "all"
                    ? t("ranking.filterAll")
                    : `${tierById(v as AudienceTierId).label} · ${tierById(v as AudienceTierId).range}`
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end" className="w-52">
              <SelectItem value="all">{t("ranking.filterAll")}</SelectItem>
              {TIERS.map((tier) => (
                <SelectItem key={tier.id} value={tier.id}>
                  {tier.label} · {tier.range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* podium — manage view only */}
      {manage && allTop3.length >= 2 && tierFilter === "all" && (
        <div key={`podium-${animKey}`}>
          <PodiumHeader top3={allTop3} />
        </div>
      )}

      {/* board */}
      <div className="p-6 pt-4" key={`board-${animKey}`}>
        {visibleGroups.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">{t("ranking.empty")}</div>
        ) : (
          <Card className="p-0">
            <TooltipProvider delay={200}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 pl-4">{t("ranking.colPosition")}</TableHead>
                    <TableHead>{t("ranking.colCreator")}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t("ranking.colTier")}</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Δ</TableHead>
                    <TableHead className="pr-4 text-right">{t("ranking.colScore")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleGroups.flatMap(({ tier, rows: tierRows }) => [
                    tierFilter === "all" ? (
                      <TableRow key={`${tier}-label`} className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={5} className="py-2 pl-4">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium">{tierById(tier).label}</span>
                            <span className="text-muted-foreground">{tierById(tier).range}</span>
                            <span className="ml-auto text-muted-foreground">
                              {tierRows.length} creator{tierRows.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null,
                    ...tierRows.map((row) => <RankRow key={row.id} row={row} maxScore={maxScore} />),
                  ])}
                </TableBody>
              </Table>
            </TooltipProvider>
          </Card>
        )}
      </div>
    </div>
  )
}
