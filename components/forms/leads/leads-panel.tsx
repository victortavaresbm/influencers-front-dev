"use client"

import { useMemo, useState } from "react"
import { Check, Download, RotateCcw, X } from "lucide-react"
import { CreatorProfile } from "@/components/discovery/creator-profile"
import { ApproveCreatorDialog } from "@/components/crm/approve-creator-dialog"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CreatorHeatCard, HeatMark } from "@/components/forms/creator-heat-card"
import { FunnelChart, ScoreRing, SeriesChart, ShareCard } from "@/components/forms/leads/performance-charts"
import { creatorHeat, type CreatorHeat } from "@/lib/forms/creator-heat"
import { answerText, type ApplicationForm, type FormResponse, type LeadDecision } from "@/lib/mock-data/forms"
import {
  columnPercent,
  filterLeads,
  formatDuration,
  leadCreator,
  leadDecision,
  leadPages,
  pageColumns,
  pageResults,
  presentAnalytics,
  reachedPage,
  stageAnswer,
  trackingColumns,
  type LeadColumn,
  type LeadRange,
} from "@/lib/forms/leads"
import { MEMBERSHIP_ROLE_LABEL } from "@/lib/membership"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useCreatorStore } from "@/lib/stores/creators"
import { useFormStore } from "@/lib/stores/forms"
import { useMembershipStore } from "@/lib/stores/membership"
import { toast } from "@/components/ui/toast"
import { formatDateBR } from "@/lib/dates"
import { useI18n, type MessageKey } from "@/lib/i18n"

const DECISION_KEY: Record<LeadDecision, MessageKey> = {
  pendente: "forms.leads.pending",
  aceito: "forms.leads.accepted",
  rejeitado: "forms.leads.rejected",
}

const RANGES: { id: LeadRange; key: MessageKey }[] = [
  { id: "all", key: "forms.leads.rangeAll" },
  { id: "24h", key: "forms.leads.range24h" },
  { id: "7d", key: "forms.leads.range7d" },
  { id: "30d", key: "forms.leads.range30d" },
]

function columnLabel(column: LeadColumn, t: (key: MessageKey) => string, percent?: number) {
  if (column.kind === "page") {
    return percent == null ? column.page.name : `${column.page.name} · ${percent}%`
  }
  if (column.id === "channel") return t("forms.leads.channel")
  if (column.id === "destination") return t("forms.leads.destination")
  return t("forms.leads.campaign")
}

function trackingValue(response: FormResponse, id: LeadColumn["id"]) {
  const tracking = response.tracking
  if (id === "channel") return tracking?.channel || tracking?.utmSource || ""
  if (id === "destination") return tracking?.destination || ""
  if (id === "campaign") return tracking?.utmCampaign || ""
  return ""
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function decisionVariant(decision: LeadDecision): "secondary" | "default" | "destructive" {
  if (decision === "aceito") return "default"
  if (decision === "rejeitado") return "destructive"
  return "secondary"
}

export function LeadsPanel({ form, responses }: { form: ApplicationForm; responses: FormResponse[] }) {
  const { t, locale } = useI18n()
  const decideLead = useFormStore((state) => state.decideLead)
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const updateCreator = useCreatorStore((state) => state.updateCreator)
  const saveTerms = useMembershipStore((state) => state.saveTerms)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const campaign = form.campaignId ? campaigns.find((item) => item.id === form.campaignId) : undefined
  const heatFor = (response: FormResponse) => creatorHeat(form, response, campaign, leadCreator(response))
  const [section, setSection] = useState("responses")
  const [query, setQuery] = useState("")
  const [stage, setStage] = useState("all")
  const [range, setRange] = useState<LeadRange>("all")
  const [hidden, setHidden] = useState<string[]>([])
  const [open, setOpen] = useState<FormResponse | null>(null)
  const [pane, setPane] = useState("answers")
  const [profilePane, setProfilePane] = useState(false)
  const [approveId, setApproveId] = useState<string | null>(null)
  const [resultPageId, setResultPageId] = useState<string | null>(null)
  const labels = { yes: t("forms.yes"), no: t("forms.no"), empty: t("forms.emptyAnswer") }
  const pages = leadPages(form)
  const columns = useMemo(() => [...pageColumns(form), ...trackingColumns()], [form])
  const visible = columns.filter((column) => !hidden.includes(column.id))
  const rows = useMemo(
    () => filterLeads(form, responses, { query, stage, range }),
    [form, responses, query, stage, range],
  )
  const filteredDefault = query === "" && stage === "all" && range === "all" && hidden.length === 0
  const resultPage = pages.find((page) => page.id === (resultPageId ?? pages[0]?.id)) ?? pages[0]
  const results = resultPage ? pageResults(form, resultPage, responses) : null
  const analytics = useMemo(() => presentAnalytics(form, responses), [form, responses])
  const selected = open ? responses.find((response) => response.id === open.id) ?? open : null
  const selectedCreator = selected ? leadCreator(selected) : undefined
  const approveResponse = approveId ? responses.find((response) => response.id === approveId) : undefined
  const approveCreator = approveResponse ? leadCreator(approveResponse) : undefined

  const decide = (response: FormResponse, decision: LeadDecision) => decideLead(response.id, decision)

  const startAccept = (response: FormResponse) => {
    const creator = leadCreator(response)
    if (!creator) {
      toast.add({ type: "error", title: t("forms.leads.profileMissing") })
      return
    }
    setApproveId(response.id)
  }

  const openLead = (response: FormResponse) => {
    setOpen(response)
    setPane("answers")
    setProfilePane(false)
  }

  const exportCsv = () => {
    const header = [t("forms.leads.lead"), t("forms.leads.potential"), t("forms.leads.status"), t("forms.leads.date"), ...visible.map((column) => columnLabel(column, t))]
    const body = rows.map((response) => [
      response.creatorName || response.leadEmail || response.id,
      String(heatFor(response).score),
      t(DECISION_KEY[leadDecision(response)]),
      formatDateBR(response.submittedAt),
      ...visible.map((column) =>
        column.kind === "page" ? stageAnswer(form, response, column.page, labels) : trackingValue(response, column.id),
      ),
    ])
    const csv = [header, ...body].map((line) => line.map(csvCell).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${form.title || "funil"}-leads.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Tabs value={section} onValueChange={(value) => value && setSection(value)}>
      <TabsList>
        <TabsTrigger value="responses">{t("forms.leads.responses")}</TabsTrigger>
        <TabsTrigger value="results">{t("forms.leads.results")}</TabsTrigger>
        <TabsTrigger value="performance">{t("forms.leads.performance")}</TabsTrigger>
      </TabsList>

      <TabsContent value="responses" className="space-y-3 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("forms.leads.search")}
            className="w-full sm:w-64"
            aria-label={t("forms.leads.search")}
          />
          <Select value={stage} onValueChange={(value) => value && setStage(value)}>
            <SelectTrigger className="w-44" aria-label={t("forms.leads.stage")}>
              <SelectValue>
                {(value) => pages.find((page) => page.id === value)?.name ?? t("forms.leads.allStages")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("forms.leads.allStages")}</SelectItem>
              {pages.map((page) => (
                <SelectItem key={page.id} value={page.id}>
                  {page.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={(value) => value && setRange(value as LeadRange)}>
            <SelectTrigger className="w-40" aria-label={t("forms.leads.rangeAll")}>
              <SelectValue>{(value) => t(RANGES.find((item) => item.id === value)?.key ?? "forms.leads.rangeAll")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {t(item.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button type="button" variant="outline" size="sm" aria-label={t("forms.leads.columns")} />}
            >
              {t("forms.leads.columns")}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-72 w-56">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={!hidden.includes(column.id)}
                  onCheckedChange={(checked) =>
                    setHidden((current) =>
                      checked === true ? current.filter((id) => id !== column.id) : [...current, column.id],
                    )
                  }
                >
                  {columnLabel(column, t)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="ml-auto">
            <ActionsMenu
              items={[
                { label: t("forms.leads.export"), icon: Download, onSelect: exportCsv },
                {
                  label: t("forms.leads.reset"),
                  icon: RotateCcw,
                  disabled: filteredDefault,
                  onSelect: () => {
                    setQuery("")
                    setStage("all")
                    setRange("all")
                    setHidden([])
                  },
                },
              ]}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">{t("forms.leads.empty")}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("forms.leads.lead")}</TableHead>
                  <TableHead>{t("forms.leads.potential")}</TableHead>
                  <TableHead>{t("forms.leads.status")}</TableHead>
                  <TableHead>{t("forms.leads.date")}</TableHead>
                  {visible.map((column) => (
                    <TableHead key={column.id}>
                      {columnLabel(column, t, column.kind === "page" ? columnPercent(form, rows, column.page) : undefined)}
                    </TableHead>
                  ))}
                  <TableHead className="w-12">
                    <span className="sr-only">{t("actions.menu")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((response) => (
                  <TableRow
                    key={response.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    onClick={() => openLead(response)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") openLead(response)
                    }}
                  >
                    <TableCell>
                      <span className="block text-sm font-medium text-zinc-900">
                        {response.creatorName || response.leadEmail || t("forms.anonLead")}
                      </span>
                      <span className="block text-xs text-zinc-400">{response.creatorHandle || response.id}</span>
                      {!response.complete ? (
                        <Badge variant="outline" className="mt-1">
                          {t("forms.leadIncomplete")}
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <HeatMark heat={heatFor(response)} />
                    </TableCell>
                    <TableCell>
                      <DecisionBadge decision={leadDecision(response)} label={t(DECISION_KEY[leadDecision(response)])} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-zinc-500">{formatDateBR(response.submittedAt)}</TableCell>
                    {visible.map((column) => {
                      const text =
                        column.kind === "page" ? stageAnswer(form, response, column.page, labels) : trackingValue(response, column.id)
                      const reached = column.kind === "page" && !text && reachedPage(form, response, column.page)
                      return (
                        <TableCell key={column.id} className="max-w-56">
                          {text ? (
                            <span className="line-clamp-2">{text}</span>
                          ) : reached ? (
                            <Badge variant="outline">{t("forms.leads.reached")}</Badge>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <DecisionMenu response={response} onAccept={startAccept} onReject={(item) => decide(item, "rejeitado")} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="results" className="pt-3">
        {pages.length === 0 || !resultPage || !results ? (
          <p className="py-16 text-center text-sm text-zinc-500">{t("forms.responsesEmpty")}</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex flex-col gap-1">
              {pages.map((page) => (
                <Button
                  key={page.id}
                  type="button"
                  variant={page.id === resultPage.id ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setResultPageId(page.id)}
                >
                  {page.name}
                </Button>
              ))}
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label={t("forms.leads.interaction")} value={`${results.interaction}%`} />
                <Metric label={t("forms.leads.entries")} value={String(results.entries)} />
                <Metric label={t("forms.leads.advances")} value={String(results.advances)} />
                <Metric label={t("forms.leads.avgTime")} value={formatDuration(results.avgMs)} />
              </div>
              {results.distributions.length === 0 ? (
                <p className="text-sm text-zinc-500">{t("forms.leads.noOptions")}</p>
              ) : (
                results.distributions.map((distribution) => (
                  <Card key={distribution.question.id} className="gap-3 p-4">
                    <p className="px-0 text-sm font-medium text-zinc-900">{distribution.question.title}</p>
                    <div className="space-y-3">
                      {distribution.counts.map((count) => {
                        const pct = distribution.total === 0 ? 0 : Math.round((count.count / distribution.total) * 100)
                        const label = count.option === "yes" ? t("forms.yes") : count.option === "no" ? t("forms.no") : count.option
                        return (
                          <div key={count.option} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{label}</span>
                              <span className="text-zinc-500 tabular-nums">
                                {pct}% · {count.count}
                              </span>
                            </div>
                            <Progress value={pct} aria-label={label} />
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="performance" className="space-y-4 pt-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label={t("forms.leads.visitors")} value={String(analytics.visitors)} />
          <Metric label={t("forms.leads.answers")} value={String(analytics.responses)} />
          <Metric label={t("forms.leads.leadCount")} value={String(analytics.leads)} />
          <Metric label={t("forms.leads.completions")} value={String(analytics.completions)} />
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_280px]">
          <FunnelChart
            title={t("forms.leads.performance")}
            steps={analytics.funnel}
            rateLabel={(pct) => t("forms.leads.ofStart", { pct })}
          />
          <ScoreRing label={t("forms.leads.score")} value={analytics.score} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <ShareCard
            title={t("forms.leads.devices")}
            empty={t("forms.leads.noShare")}
            rows={analytics.byDevice.map((row) => ({
              label: t(row.device === "mobile" ? "forms.leads.mobile" : row.device === "tablet" ? "forms.leads.tablet" : "forms.leads.desktop"),
              count: row.count,
            }))}
          />
          <ShareCard
            title={t("forms.leads.sources")}
            empty={t("forms.leads.noShare")}
            rows={analytics.bySource.map((row) => ({ label: row.source, count: row.count }))}
          />
          <ShareCard
            title={t("forms.leads.utm")}
            empty={t("forms.leads.noShare")}
            rows={analytics.byUtm.map((row) => ({ label: row.campaign, count: row.count }))}
          />
        </div>
        <SeriesChart
          title={t("forms.leads.timeline")}
          points={analytics.timeline}
          locale={locale}
          empty={t("forms.leads.noShare")}
          labels={{
            visitors: t("forms.leads.visitors"),
            responses: t("forms.leads.answers"),
            leads: t("forms.leads.leadCount"),
          }}
        />
      </TabsContent>

      <Sheet
        open={!!selected}
        onOpenChange={(next) => {
          if (!next) {
            setOpen(null)
            setPane("answers")
            setProfilePane(false)
          }
        }}
      >
        <SheetContent
          className={cn(
            "w-full gap-0 p-0",
            pane === "profile" && "data-[side=right]:w-[min(960px,100vw)] data-[side=right]:max-w-[min(960px,100vw)]",
          )}
        >
          {selected ? (
            <>
              <SheetHeader className="border-b border-zinc-200 pr-12">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <SheetTitle>{selected.creatorName || selected.leadEmail || t("forms.anonLead")}</SheetTitle>
                    <SheetDescription>{selected.creatorHandle || selected.leadEmail || selected.id}</SheetDescription>
                  </div>
                  {selectedCreator ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setProfilePane(true)
                        setPane("profile")
                      }}
                    >
                      {t("forms.leads.enrich")}
                    </Button>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <DecisionBadge decision={leadDecision(selected)} label={t(DECISION_KEY[leadDecision(selected)])} />
                  {!selected.complete ? <Badge variant="outline">{t("forms.leadIncomplete")}</Badge> : null}
                  <span className="text-xs text-zinc-400">{formatDateBR(selected.submittedAt)}</span>
                </div>
              </SheetHeader>
              {profilePane ? (
                <Tabs
                  value={pane}
                  onValueChange={(value) => value && setPane(value)}
                  className="min-h-0 flex-1 gap-0"
                >
                  <div className="border-b border-zinc-200 px-4">
                    <TabsList variant="line">
                      <TabsTrigger value="answers">{t("forms.leads.application")}</TabsTrigger>
                      <TabsTrigger value="profile">{t("forms.leads.enrich")}</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="answers" className="min-h-0 overflow-y-auto">
                    <LeadAnswers form={form} response={selected} labels={labels} heat={heatFor(selected)} />
                  </TabsContent>
                  <TabsContent value="profile" className="min-h-0 overflow-y-auto bg-zinc-50">
                    {selectedCreator ? (
                      <CreatorProfile
                        key={selectedCreator.id}
                        creator={selectedCreator}
                        platform={selectedCreator.networks[0]?.network ?? "instagram"}
                        campaign={campaign ?? null}
                        initialTab="posts"
                        onLookalikes={() => undefined}
                      />
                    ) : (
                      <p className="p-4 text-sm text-zinc-500">{t("forms.leads.profileMissing")}</p>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <LeadAnswers form={form} response={selected} labels={labels} heat={heatFor(selected)} />
                </div>
              )}
              <SheetFooter className="flex-row justify-end gap-2 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={leadDecision(selected) === "rejeitado"}
                  onClick={() => decide(selected, "rejeitado")}
                >
                  <X />
                  {t("forms.leads.reject")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={leadDecision(selected) === "aceito"}
                  onClick={() => startAccept(selected)}
                >
                  <Check />
                  {t("forms.leads.accept")}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      <ApproveCreatorDialog
        open={!!approveCreator}
        creators={approveCreator ? [approveCreator] : []}
        organizationId={organizationId}
        onOpenChange={(next) => {
          if (!next) setApproveId(null)
        }}
        onApprove={(ids, terms) => {
          saveTerms(ids, terms)
          for (const id of ids) updateCreator(id, { approvalStatus: "approved" })
          if (approveId) decideLead(approveId, "aceito")
          const names = ids.map((id) => approveCreator?.id === id ? approveCreator.name : id)
          toast.add({
            type: "success",
            title: `${MEMBERSHIP_ROLE_LABEL[terms.role]} aceito`,
            description: names.join(", "),
          })
          setApproveId(null)
        }}
      />
    </Tabs>
  )
}

function LeadAnswers({
  form,
  response,
  labels,
  heat,
}: {
  form: ApplicationForm
  response: FormResponse
  labels: { yes: string; no: string; empty: string }
  heat: CreatorHeat
}) {
  return (
    <div className="space-y-4 px-4 py-4">
      <CreatorHeatCard heat={heat} />
      {form.questions.map((question) => {
        const answer = response.answers.find((item) => item.questionId === question.id)
        return (
          <div key={question.id}>
            <p className="text-xs text-zinc-400">{question.title}</p>
            <p className="mt-1 text-sm text-zinc-800">{answerText(question, answer?.value, labels)}</p>
          </div>
        )
      })}
    </div>
  )
}

function DecisionBadge({ decision, label }: { decision: LeadDecision; label: string }) {
  return <Badge variant={decisionVariant(decision)}>{label}</Badge>
}

function DecisionMenu({
  response,
  onAccept,
  onReject,
}: {
  response: FormResponse
  onAccept: (response: FormResponse) => void
  onReject: (response: FormResponse) => void
}) {
  const { t } = useI18n()
  const decision = leadDecision(response)
  return (
    <ActionsMenu
      items={[
        {
          label: t("forms.leads.accept"),
          icon: Check,
          disabled: decision === "aceito",
          onSelect: () => onAccept(response),
        },
        {
          label: t("forms.leads.reject"),
          icon: X,
          destructive: true,
          disabled: decision === "rejeitado",
          onSelect: () => onReject(response),
        },
      ]}
    />
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums">{value}</p>
    </Card>
  )
}

