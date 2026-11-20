"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Check, Loader2, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { CampaignVisibilityPicker } from "@/components/campaigns/campaign-visibility-picker"
import { GuidelineLists, cleanGuidelines } from "@/components/campaigns/guideline-list"
import { campaignTypeLabel } from "@/lib/campaign-types"
import { fieldsFromLegacyType } from "@/lib/campaigns/shape"
import {
  buildPlan,
  rankCreators,
  revisePlan,
  setPlanAmount,
  type AgentDraft,
  type AgentPlan,
  type AgentStep,
  type AmountId,
  type FitReason,
  type RankedCreator,
} from "@/lib/campaign-agent/plan"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { CREATORS } from "@/lib/mock-data/creators"
import {
  SOCIAL_NETWORK_LABEL,
  type Campaign,
  type ContentFormat,
  type Deliverable,
  type Participant,
} from "@/lib/mock-data/campaigns"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import type { Locale } from "@/lib/stores/preferences"
import { cn } from "@/lib/utils"

const EXAMPLES: Record<Locale, string[]> = {
  pt: [
    "Criar uma campanha da BYD para lançar um carro elétrico e identificar 10 creators ideais com base na performance do conteúdo.",
    "Campanha de seeding de skincare para a Natura com 8 microinfluenciadores de beleza e orçamento de 40 mil.",
    "Quero uma campanha de afiliados no Instagram e no YouTube para o Magazine Luiza, com 15 creators de lifestyle.",
  ],
  en: [
    "Create a new campaign for BYD to launch an electric car and identify a roster of 10 ideal creators based on their content performance.",
    "A seeding campaign of skincare for Natura with 8 micro beauty creators and a budget of 40 mil.",
    "I want an affiliate campaign on Instagram and YouTube for Magazine Luiza, with 15 lifestyle creators.",
  ],
  es: [
    "Crear una campaña de BYD para lanzar un auto eléctrico e identificar 10 creators ideales.",
    "Campaña de seeding de skincare para Natura con 8 microinfluencers de belleza y presupuesto de 40 mil.",
    "Quiero una campaña de afiliados en Instagram y YouTube para Magazine Luiza, con 15 creators de lifestyle.",
  ],
}

type RunState = { active: boolean; cursor: number; waiting: boolean }

const IDLE_RUN: RunState = { active: false, cursor: 0, waiting: false }

function deliverableType(format: ContentFormat): Deliverable["type"] {
  if (format === "reels") return "reels"
  if (format === "stories") return "stories"
  if (format === "tiktok") return "tiktok"
  return format === "feed" ? "post_feed" : "video_youtube"
}

function networkLabel(value: string) {
  if (value === "instagram" || value === "tiktok" || value === "youtube") return SOCIAL_NETWORK_LABEL[value]
  return value
}

function reasonText(
  reason: FitReason,
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
) {
  if (reason.code === "niche") return t("agent.reasonNiche", { names: reason.names })
  if (reason.code === "content") return t("agent.reasonContent", { words: reason.words })
  if (reason.code === "network") {
    const names = reason.names.split(", ").map((name) => networkLabel(name)).join(", ")
    return t("agent.reasonNetwork", { names })
  }
  if (reason.code === "engagement") return t("agent.reasonEngagement", { value: reason.value })
  if (reason.code === "busy") return t("agent.reasonBusy")
  return t("agent.reasonAudience")
}

function stepStatus(index: number, run: RunState, total: number) {
  if (!run.active) return "pending" as const
  if (index < run.cursor) return "done" as const
  if (index === run.cursor && run.cursor >= total) return "done" as const
  if (index === run.cursor && run.waiting) return "awaiting" as const
  if (index === run.cursor) return "running" as const
  return "pending" as const
}

export function CampaignAgent() {
  const { t, locale } = useI18n()
  const user = useAuthStore((state) => state.user)
  const createCampaign = useCampaignStore((state) => state.createCampaign)
  const [prompt, setPrompt] = useState("")
  const [plan, setPlan] = useState<AgentPlan | null>(null)
  const [thinking, setThinking] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const [run, setRun] = useState<RunState>(IDLE_RUN)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const saving = useRef(false)
  const pendingCampaignId = useRef<string | null>(null)

  const options = useMemo(
    () => ({ locale, brandFallback: user?.organizationName || "Marca" }),
    [locale, user?.organizationName],
  )

  useEffect(() => {
    if (!run.active || run.waiting || !plan) return
    if (run.cursor >= plan.steps.length) return
    const step = plan.steps[run.cursor]
    if (step.pausesForApproval) {
      setRun((current) => (current.waiting ? current : { ...current, waiting: true }))
      return
    }
    const timer = window.setTimeout(() => {
      setRun((current) => ({ ...current, cursor: current.cursor + 1 }))
    }, 700)
    return () => window.clearTimeout(timer)
  }, [plan, run.active, run.cursor, run.waiting])

  useEffect(() => {
    if (!pendingCampaignId.current || campaignId) return
    if (!plan || !run.active || run.waiting) return
    if (run.cursor < plan.steps.length) return
    setCampaignId(pendingCampaignId.current)
  }, [campaignId, plan, run.active, run.cursor, run.waiting])

  const ranked = useMemo(() => (plan ? rankCreators(plan.draft, CREATORS) : []), [plan])
  const locked = run.active || Boolean(campaignId)
  const currentStep = plan && run.cursor < plan.steps.length ? plan.steps[run.cursor] : null
  const showCreators = Boolean(plan && run.active && plan.steps.findIndex((step) => step.id === "find") < run.cursor && plan.draft.includeRoster)
  const showAssessment = Boolean(plan && run.active && plan.steps.findIndex((step) => step.id === "assess") < run.cursor && plan.draft.includeRoster)

  function build(text: string) {
    const value = text.trim()
    if (!value) return
    setCampaignId(null)
    pendingCampaignId.current = null
    saving.current = false
    setRun(IDLE_RUN)
    setFeedback("")
    setFeedbackError(null)
    setPlan(null)
    setThinking(true)
    window.setTimeout(() => {
      setPlan(buildPlan(value, options))
      setThinking(false)
    }, 600)
  }

  function revise() {
    if (!plan || locked) return
    const text = feedback.trim()
    if (!text) {
      setFeedbackError(t("agent.emptyFeedback"))
      return
    }
    setFeedbackError(null)
    setThinking(true)
    const current = plan
    window.setTimeout(() => {
      setPlan(revisePlan(current, text, options))
      setFeedback("")
      setThinking(false)
    }, 500)
  }

  function proceed() {
    if (!plan || locked) return
    if (feedback.trim()) {
      revise()
      return
    }
    setFeedbackError(null)
    setRun({ active: true, cursor: 0, waiting: false })
  }

  function updateDraft(partial: Partial<AgentDraft>) {
    setPlan((current) => (current ? { ...current, draft: { ...current.draft, ...partial } } : current))
  }

  function approve() {
    if (!plan || !currentStep) return
    if (currentStep.id === "create") {
      if (!plan.draft.name.trim()) return
      if (plan.draft.endDate < plan.draft.startDate) return
      if (!campaignId && !saving.current) {
        saving.current = true
        pendingCampaignId.current = persist(plan)
      }
    }
    setRun((current) => ({ ...current, waiting: false, cursor: current.cursor + 1 }))
  }

  function persist(current: AgentPlan) {
    const today = new Date().toISOString().slice(0, 10)
    const id = `camp_${Date.now()}`
    const organizationId = user?.organizationId ?? "org1"
    const doList = cleanGuidelines(current.draft.brief.doList)
    const dontList = cleanGuidelines(current.draft.brief.dontList)
    const roster = current.draft.includeRoster ? rankCreators(current.draft, CREATORS) : []
    const participants: Participant[] = roster.map((item) => ({
      creatorId: item.creator.id,
      creatorName: item.creator.name,
      creatorHandle: item.creator.handle,
      avatar: item.creator.avatar,
      tier: item.creator.tier,
      status: "candidato",
      fee: 0,
      deliverables: current.draft.contentFormats.map((format) => ({
        type: deliverableType(format),
        quantity: 1,
      })),
      level: item.creator.level,
      memberType: item.creator.memberType,
    }))
    const legacy = fieldsFromLegacyType(current.draft.type)
    const campaign: Campaign = {
      id,
      organizationId,
      organizationName: user?.organizationName ?? current.draft.brand,
      name: current.draft.name.trim(),
      description: current.draft.description.trim(),
      objective: current.draft.objective.trim(),
      type: current.draft.type,
      strategy: legacy.strategy,
      tactics: legacy.tactics,
      commercialTerms: legacy.commercialTerms,
      formatQuantities: current.draft.contentFormats.map((format) => ({ format, quantity: 1 })),
      status: "rascunho",
      startDate: current.draft.startDate,
      endDate: current.draft.endDate,
      budget: Number(current.draft.budget) || 0,
      budgetSpent: 0,
      targetNiches: current.draft.targetNiches,
      targetNetworks: current.draft.targetNetworks,
      minFollowers: current.draft.minFollowers,
      maxFollowers: current.draft.maxFollowers,
      minEngagement: current.draft.minEngagement,
      mandatoryHashtags: current.draft.mandatoryHashtags,
      mandatoryMentions: current.draft.mandatoryMentions,
      contentFormats: current.draft.contentFormats,
      doList: doList.length ? doList : undefined,
      dontList: dontList.length ? dontList : undefined,
      participants,
      createdAt: today,
      updatedAt: today,
      visibility: current.draft.visibility,
    }
    createCampaign(campaign)
    return id
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
      {!plan && !thinking && (
        <Card className="gap-0 py-0">
          <form
            className="space-y-4 p-5 sm:p-6"
            onSubmit={(event) => {
              event.preventDefault()
              build(prompt)
            }}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">{t("agent.composeTitle")}</h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">{t("agent.composeHelp")}</p>
              </div>
            </div>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={t("agent.promptPlaceholder")}
              rows={4}
            />
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">{t("agent.examples")}</p>
              <div className="grid gap-2">
                {EXAMPLES[locale].map((example) => (
                  <Button
                    key={example}
                    type="button"
                    variant="outline"
                    className="h-auto justify-start whitespace-normal px-3 py-2 text-left"
                    onClick={() => setPrompt(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
            <Button type="submit" size="lg" disabled={!prompt.trim()}>
              <Sparkles />
              {t("agent.build")}
            </Button>
          </form>
        </Card>
      )}

      {thinking && !plan && <PlanSkeleton />}

      {plan && (
        <ActionPlan
          plan={plan}
          run={run}
          locked={locked}
          done={Boolean(campaignId)}
          feedback={feedback}
          feedbackError={feedbackError}
          revising={thinking}
          onFeedback={(value) => {
            setFeedback(value)
            if (feedbackError) setFeedbackError(null)
          }}
          onAmount={(id, value) => setPlan((current) => (current ? setPlanAmount(current, id, value) : current))}
          onProceed={proceed}
          onRevise={revise}
        />
      )}

      {plan && currentStep?.id === "create" && run.waiting && (
        <CampaignPreview
          draft={plan.draft}
          invalidDates={plan.draft.endDate < plan.draft.startDate}
          missingName={!plan.draft.name.trim()}
          onChange={updateDraft}
          onBack={() => setRun(IDLE_RUN)}
          onApprove={approve}
        />
      )}

      {showCreators && plan && (
        <CreatorList
          title={t("agent.creatorsFound")}
          help={t("agent.findHelp")}
          items={ranked}
          showFit={false}
        />
      )}

      {showAssessment && plan && (
        <CreatorList
          title={t("agent.assessment")}
          help={t("agent.assessHelp")}
          items={ranked}
          showFit
        />
      )}

      {campaignId && plan && <DoneCard campaignId={campaignId} count={plan.draft.includeRoster ? ranked.length : 0} onReset={() => {
        pendingCampaignId.current = null
        saving.current = false
        setPlan(null)
        setCampaignId(null)
        setRun(IDLE_RUN)
        setPrompt("")
        setFeedback("")
      }} />}
    </div>
  )
}

function PlanSkeleton() {
  return (
    <Card className="gap-0 py-0">
      <div className="space-y-3 p-5 sm:p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </Card>
  )
}

function ActionPlan({
  plan,
  run,
  locked,
  done,
  feedback,
  feedbackError,
  revising,
  onFeedback,
  onAmount,
  onProceed,
  onRevise,
}: {
  plan: AgentPlan
  run: RunState
  locked: boolean
  done: boolean
  feedback: string
  feedbackError: string | null
  revising: boolean
  onFeedback: (value: string) => void
  onAmount: (id: AmountId, value: number) => void
  onProceed: () => void
  onRevise: () => void
}) {
  const { t } = useI18n()
  const total = plan.steps.length
  const current = Math.min(run.cursor + 1, total)

  return (
    <Card className="gap-0 py-0 shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 ring-1 ring-sky-100">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-indigo-600">{t("agent.planLabel")}</p>
              <p className="text-sm text-zinc-500">{t("agent.planHint")}</p>
            </div>
            <p className="mt-4 text-[15px] font-medium leading-relaxed text-zinc-900">{plan.summary}</p>
            {plan.revisionNote && (
              <p role="status" className="mt-2 text-sm text-zinc-600">
                {plan.revisionNote}
              </p>
            )}
            <ol className="mt-4 space-y-2.5" aria-label={t("agent.planLabel")}>
              {plan.steps.map((step, index) => (
                <StepRow
                  key={step.id}
                  step={step}
                  index={index}
                  status={stepStatus(index, run, total)}
                  draft={plan.draft}
                  locked={locked}
                  onAmount={onAmount}
                />
              ))}
            </ol>

            {!locked && (
              <div className="mt-4 space-y-3">
                <Textarea
                  value={feedback}
                  onChange={(event) => onFeedback(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault()
                      onRevise()
                    }
                  }}
                  placeholder={t("agent.feedbackPlaceholder")}
                  rows={2}
                  aria-invalid={feedbackError ? true : undefined}
                  aria-label={t("agent.feedbackPlaceholder")}
                />
                {feedbackError && <p className="text-xs text-red-600">{feedbackError}</p>}
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" size="lg" onClick={onProceed} disabled={revising}>
                    {t("agent.proceed")}
                  </Button>
                  <Button type="button" size="lg" variant="outline" onClick={onRevise} disabled={revising}>
                    {revising ? t("agent.working") : t("agent.revise")}
                  </Button>
                  <span className="text-sm text-zinc-500">{t("agent.replyHint")}</span>
                </div>
              </div>
            )}

            {locked && !done && (
              <p className="mt-4 text-sm text-zinc-500">
                {run.waiting ? t("agent.waiting") : t("agent.stepProgress", { current, total })}
              </p>
            )}
            {done && <p className="mt-4 text-sm text-zinc-500">{t("agent.finished")}</p>}
          </div>
        </div>
      </div>
    </Card>
  )
}

function StepRow({
  step,
  index,
  status,
  draft,
  locked,
  onAmount,
}: {
  step: AgentStep
  index: number
  status: "pending" | "running" | "awaiting" | "done"
  draft: AgentDraft
  locked: boolean
  onAmount: (id: AmountId, value: number) => void
}) {
  const { t } = useI18n()
  return (
    <li
      className={cn(
        "rounded-xl border bg-white px-3.5 py-3",
        status === "awaiting" ? "border-amber-300 ring-1 ring-amber-100" : "border-zinc-200",
        status === "done" && "bg-zinc-50",
      )}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
            status === "done" && "bg-emerald-100 text-emerald-800",
            status === "awaiting" && "bg-amber-100 text-amber-800",
            status !== "done" && status !== "awaiting" && "bg-zinc-100 text-zinc-600",
          )}
        >
          {status === "done" ? <Check className="size-3.5" /> : status === "running" ? <Loader2 className="size-3.5 animate-spin" /> : index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-sm leading-6 text-zinc-800">
            {step.segments.map((segment, segmentIndex) =>
              segment.type === "text" ? (
                <span key={segmentIndex}>{segment.text}</span>
              ) : (
                <AmountChip
                  key={segmentIndex}
                  id={segment.id}
                  value={segment.id === "roster" ? draft.rosterSize : draft.budget}
                  disabled={locked}
                  onChange={onAmount}
                />
              ),
            )}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-zinc-400">{step.tool}</span>
            <span className={cn("text-xs", step.mode === "write" ? "font-medium text-amber-600" : "text-zinc-400")}>
              {step.mode}
            </span>
            {step.pausesForApproval && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-100">
                {t("agent.pause")}
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

function AmountChip({
  id,
  value,
  disabled,
  onChange,
}: {
  id: AmountId
  value: number
  disabled: boolean
  onChange: (id: AmountId, value: number) => void
}) {
  const { t } = useI18n()
  const [raw, setRaw] = useState<string | null>(null)
  const shown = raw ?? (id === "budget" ? value.toLocaleString("pt-BR") : String(value))
  return (
    <Input
      aria-label={id === "budget" ? t("agent.budget") : t("agent.rosterAmount")}
      inputMode="numeric"
      disabled={disabled}
      value={shown}
      onFocus={(event) => {
        setRaw(String(value))
        event.currentTarget.select()
      }}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "").slice(0, id === "budget" ? 9 : 2)
        setRaw(digits)
        if (digits) onChange(id, Number(digits))
      }}
      onBlur={() => {
        if (!raw) onChange(id, id === "roster" ? Math.max(value, 1) : value)
        setRaw(null)
      }}
      className={cn(
        "mx-1 inline-block h-6 translate-y-px rounded-md border-transparent bg-amber-100 px-1.5 text-center text-sm font-semibold text-amber-950 shadow-none focus-visible:border-amber-300 focus-visible:ring-amber-200 disabled:opacity-80",
        id === "budget" ? "w-24" : "w-12",
      )}
    />
  )
}

function CampaignPreview({
  draft,
  invalidDates,
  missingName,
  onChange,
  onBack,
  onApprove,
}: {
  draft: AgentDraft
  invalidDates: boolean
  missingName: boolean
  onChange: (partial: Partial<AgentDraft>) => void
  onBack: () => void
  onApprove: () => void
}) {
  const { t } = useI18n()
  return (
    <Card className="gap-0 py-0">
      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">{t("agent.campaignPreview")}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t("agent.campaignPreviewHelp")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{campaignTypeLabel(draft.type)}</Badge>
          {draft.targetNiches.map((niche) => (
            <Badge key={niche} variant="outline">{niche}</Badge>
          ))}
          {draft.targetNetworks.map((network) => (
            <Badge key={network} variant="outline">{networkLabel(network)}</Badge>
          ))}
          {draft.mandatoryHashtags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="agent-name">{t("agent.name")}</Label>
            <Input id="agent-name" value={draft.name} onChange={(event) => onChange({ name: event.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="agent-objective">{t("agent.objective")}</Label>
            <Textarea
              id="agent-objective"
              value={draft.objective}
              rows={3}
              onChange={(event) => onChange({ objective: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="agent-budget">{t("agent.budget")}</Label>
            <Input
              id="agent-budget"
              inputMode="numeric"
              value={draft.budget ? draft.budget.toLocaleString("pt-BR") : ""}
              onChange={(event) => onChange({ budget: Number(event.target.value.replace(/\D/g, "")) || 0 })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="agent-start">{t("agent.start")}</Label>
              <Input id="agent-start" type="date" value={draft.startDate} onChange={(event) => onChange({ startDate: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agent-end">{t("agent.end")}</Label>
              <Input id="agent-end" type="date" value={draft.endDate} onChange={(event) => onChange({ endDate: event.target.value })} />
            </div>
          </div>
        </div>
        <GuidelineLists
          doList={draft.brief.doList}
          dontList={draft.brief.dontList}
          onChange={(next) => onChange({ brief: { ...draft.brief, ...next } })}
        />
        <CampaignVisibilityPicker value={draft.visibility} onChange={(visibility) => onChange({ visibility })} />
        {missingName && <p className="text-xs text-red-600">{t("agent.nameRequired")}</p>}
        {invalidDates && <p className="text-xs text-red-600">{t("agent.datesInvalid")}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            {t("agent.backToPlan")}
          </Button>
          <Button type="button" size="lg" onClick={onApprove} disabled={missingName || invalidDates}>
            {t("agent.approveCampaign")}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function CreatorList({
  title,
  help,
  items,
  showFit,
}: {
  title: string
  help: string
  items: RankedCreator[]
  showFit: boolean
}) {
  const { t } = useI18n()
  const fitLabel = { high: t("agent.fitHigh"), mid: t("agent.fitMid"), low: t("agent.fitLow") }
  return (
    <Card className="gap-0 py-0">
      <div className="p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{help}</p>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">{t("agent.noCreators")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100">
            {items.map((item) => (
              <li key={item.creator.id} className="flex items-center gap-3 py-3">
                <Avatar>
                  <AvatarImage src={item.creator.photo} alt="" />
                  <AvatarFallback>{item.creator.avatar}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{item.creator.name}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {item.creator.handle}
                    {item.reasons[0] ? ` · ${reasonText(item.reasons[0], t)}` : ""}
                  </p>
                </div>
                {showFit && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      item.fit === "high" && "bg-emerald-50 text-emerald-800",
                      item.fit === "mid" && "bg-amber-50 text-amber-800",
                      item.fit === "low" && "bg-zinc-100 text-zinc-600",
                    )}
                  >
                    {fitLabel[item.fit]} · {item.score}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}

function DoneCard({
  campaignId,
  count,
  onReset,
}: {
  campaignId: string
  count: number
  onReset: () => void
}) {
  const { t } = useI18n()
  return (
    <Card className="gap-0 border-emerald-200 bg-emerald-50 py-0">
      <div className="space-y-3 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-emerald-950">{t("agent.doneTitle")}</h2>
        <p className="text-sm text-emerald-900">{t("agent.doneBody", { count })}</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" render={<Link href={`/campaigns/${campaignId}`} />}>
            {t("agent.openCampaign")}
          </Button>
          <Button type="button" variant="link" onClick={onReset}>
            {t("agent.another")}
          </Button>
        </div>
      </div>
    </Card>
  )
}
