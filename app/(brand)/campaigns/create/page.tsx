"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore, type WizardDraft } from "@/lib/stores/campaigns"
import { useSeedingStore } from "@/lib/stores/seeding"
import {
  CAMPAIGN_GOALS,
  CAMPAIGN_TEMPLATES,
  CAMPAIGN_TYPE_META,
  CONTENT_FORMATS,
  campaignGoalById,
  campaignTypeByValue,
  contentFormatByValue,
  type CampaignGoalId,
} from "@/lib/campaign-types"
import { CampaignVisibilityPicker } from "@/components/campaigns/campaign-visibility-picker"
import { CampaignSuccessTargets } from "@/components/campaigns/campaign-success-targets"
import { formatSuccessTargetList, metricsForNetworks, readSuccessTargets } from "@/lib/success-metrics"
import { visibilityLabel } from "@/lib/campaign-access"
import { SocialPreviewCarousel } from "@/components/campaigns/social-preview-carousel"
import { WizardFormStep } from "@/components/forms/wizard-form-step"
import { GuidelineLists, cleanGuidelines } from "@/components/campaigns/guideline-list"
import { useFormStore } from "@/lib/stores/forms"
import { formatDateBR } from "@/lib/dates"
import {
  SOCIAL_NETWORK_LABEL,
  isSocialNetwork,
  normalizeMentions,
  type Campaign,
  type CampaignMention,
  type CampaignType,
  type SocialNetwork,
} from "@/lib/mock-data/campaigns"
import type { SeedingProduct } from "@/lib/mock-data/seeding"
import { cn } from "@/lib/utils"
import {
  Check,
  CircleHelp,
  Cpu,
  Drama,
  Dumbbell,
  Gamepad2,
  PackagePlus,
  Plane,
  Plus,
  Shirt,
  Sparkles,
  Sun,
  Trash2,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { TIERS as AUDIENCE_TIERS } from "@/lib/audience-tiers"

const STEP_DEFS = [
  { id: "type", key: "wizard.type", hintKey: "wizard.typeHint" },
  { id: "campaign", key: "wizard.campaign", hintKey: "wizard.campaignHint" },
  { id: "format", key: "wizard.format", hintKey: "wizard.formatHint" },
  { id: "audience", key: "wizard.audience", hintKey: "wizard.audienceHint" },
  { id: "goals", key: "wizard.goals", hintKey: "wizard.goalsHint" },
  { id: "form", key: "wizard.form", hintKey: "wizard.formHint" },
  { id: "review", key: "wizard.review", hintKey: "wizard.reviewHint" },
] as const

type WizardStepId = (typeof STEP_DEFS)[number]["id"] | "seeding"

function campaignSteps(type?: string) {
  const steps: { id: WizardStepId; key: MessageKey; hintKey: MessageKey }[] = STEP_DEFS.map((item) => ({ ...item }))
  if (type === "seeding") {
    const review = steps.findIndex((item) => item.id === "review")
    steps.splice(review, 0, { id: "seeding", key: "wizard.seeding", hintKey: "wizard.seedingHint" })
  }
  return steps
}

const NICHES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "beleza", label: "Beleza", icon: Sparkles },
  { id: "moda", label: "Moda", icon: Shirt },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "gastronomia", label: "Gastronomia", icon: UtensilsCrossed },
  { id: "tecnologia", label: "Tecnologia", icon: Cpu },
  { id: "lifestyle", label: "Lifestyle", icon: Sun },
  { id: "humor", label: "Humor", icon: Drama },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "finanças", label: "Finanças", icon: Wallet },
  { id: "viagem", label: "Viagem", icon: Plane },
]

const NETWORKS: {
  id: string
  label: string
  hint: string
  wellClass: string
  icon: typeof SiInstagram
}[] = [
  { id: "instagram", label: "Instagram", hint: "Feed, Reels e Stories", wellClass: "bg-pink-50 text-pink-600", icon: SiInstagram },
  { id: "tiktok", label: "TikTok", hint: "Vídeos curtos", wellClass: "bg-zinc-100 text-zinc-900", icon: SiTiktok },
  { id: "youtube", label: "YouTube", hint: "Vídeos e Shorts", wellClass: "bg-red-50 text-red-600", icon: SiYoutube },
]

function FormatNetwork({ network, selected }: { network: string; selected: boolean }) {
  const className = cn("shrink-0", selected ? "text-current" : "text-zinc-400")
  if (network === "instagram") return <SiInstagram size={13} className={className} />
  if (network === "tiktok") return <SiTiktok size={13} className={className} />
  if (network === "youtube") return <SiYoutube size={13} className={className} />
  return null
}

const TIERS = AUDIENCE_TIERS

const ENGAGEMENT_PRESETS = [1, 2, 3.5, 5]

const STOCK_OBJECTIVES = new Set([
  ...CAMPAIGN_TYPE_META.map((type) => type.suggestedObjective),
  ...CAMPAIGN_TEMPLATES.map((template) => template.objective),
])

const HASHTAG_SUGGESTIONS: Partial<Record<CampaignType, string[]>> = {
  awareness: ["#Lancamento", "#Novidade"],
  engajamento: ["#Participe", "#Comunidade"],
  ugc: ["#UGC", "#Publi"],
  seeding: ["#Recebidos", "#Favoritos"],
  embaixador: ["#Embaixador", "#TimeDaMarca"],
  live: ["#Live", "#AoVivo"],
  conversao: ["#Oferta", "#Cupom"],
  afiliado: ["#Cupom", "#LinkNaBio"],
}

function sameSet(a: string[] = [], b: string[] = []) {
  if (a.length !== b.length) return false
  const right = new Set(b)
  return a.every((item) => right.has(item))
}

function datesAreValid(start?: string, end?: string) {
  if (!start || !end) return true
  return end >= start
}

function formatFollowers(n: number) {
  if (n >= 1_000_000) {
    const value = n / 1_000_000
    return `${Number.isInteger(value) ? value : value.toFixed(1)} mi`
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)} mil`
  return n.toLocaleString("pt-BR")
}

function formatMoney(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

function blankSeedingProduct(): SeedingProduct {
  return {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    variants: ["Único"],
    unitCost: 0,
    stockForSeeding: 0,
    stockUsed: 0,
  }
}

function seedingStepReady(products?: SeedingProduct[], days?: number) {
  if (!products?.length) return false
  if (!products.every((product) => product.name.trim())) return false
  return (days ?? 0) >= 1
}

function hashtagFromName(name: string) {
  const clean = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
  const skip = new Set(["para", "com", "das", "dos", "uma", "uns", "the"])
  const parts = clean
    .split(/\s+/)
    .filter((word) => word.length > 2 && !skip.has(word.toLowerCase()))
    .slice(0, 2)
  if (!parts.length) return null
  return `#${parts.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("")}`
}

function orgHandle(name?: string) {
  if (!name) return null
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
  return slug ? `@${slug}` : null
}

const MENTION_PLACEHOLDER: Record<SocialNetwork, string> = {
  instagram: "@suamarca",
  tiktok: "@suamarcaTT",
  youtube: "@suamarcaYT",
}

function suggestedMention(name: string | undefined, network: SocialNetwork) {
  const base = orgHandle(name)
  if (!base) return null
  if (network === "tiktok") return `${base}TT`
  if (network === "youtube") return `${base}YT`
  return base
}

export default function CreateCampaignPage() {
  const { t } = useI18n()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { wizardStep, setWizardStep, wizardDraft, updateWizardDraft, resetWizard, createCampaign } =
    useCampaignStore()
  const forms = useFormStore((state) => state.forms)
  const draft = wizardDraft
  const step = wizardStep
  const steps = campaignSteps(draft.type)
  const safeStep = Math.min(step, Math.max(steps.length - 1, 0))
  const currentId = steps[safeStep]?.id
  const mainRef = useRef<HTMLDivElement>(null)
  const [goalFilter, setGoalFilter] = useState<CampaignGoalId | "all" | null>(null)
  const [lastGoal, setLastGoal] = useState<CampaignGoalId | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [hashtagInput, setHashtagInput] = useState("")
  const [mentionInput, setMentionInput] = useState("")
  const [mentionNetwork, setMentionNetwork] = useState<SocialNetwork>("instagram")
  const [creating, setCreating] = useState(false)

  const skipScroll = useRef(true)
  useEffect(() => {
    if (step > steps.length - 1) setWizardStep(steps.length - 1)
  }, [step, steps.length, setWizardStep])
  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false
      return
    }
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [step])

  const selectedType = campaignTypeByValue(draft.type)
  const showAllGoals = goalFilter === "all"
  const activeGoal: CampaignGoalId | null = showAllGoals ? null : goalFilter ?? selectedType?.goal ?? null
  const visibleGoals = showAllGoals
    ? CAMPAIGN_GOALS
    : CAMPAIGN_GOALS.filter((goal) => goal.id === activeGoal)

  const datesOk = datesAreValid(draft.startDate, draft.endDate)
  const stepId = (index: number) => steps[index]?.id
  const stepIsValid = (index: number) => {
    const id = stepId(index)
    if (id === "type") return Boolean(draft.type)
    if (id === "campaign") return Boolean(draft.name?.trim()) && datesOk
    if (id === "audience") return Boolean(draft.visibility)
    if (id === "seeding") return seedingStepReady(draft.seedingProducts, draft.daysToPost)
    return true
  }
  const canOpen = (index: number) => {
    if (index <= step) return true
    for (let cursor = 0; cursor < index; cursor += 1) {
      if (!stepIsValid(cursor)) return false
    }
    return true
  }
  const continueHint =
    currentId === "type" && !draft.type
      ? "Escolha um tipo para continuar"
      : currentId === "campaign" && !draft.name?.trim()
        ? "Dê um nome à campanha"
        : currentId === "campaign" && !datesOk
          ? "Ajuste as datas para continuar"
          : !draft.visibility && (currentId === "audience" || currentId === "review")
            ? "Escolha quem pode ver a campanha"
            : currentId === "seeding" && !seedingStepReady(draft.seedingProducts, draft.daysToPost)
              ? "Dê um nome a cada produto do envio"
              : null

  const goTo = (index: number) => {
    if (canOpen(index)) setWizardStep(index)
  }

  const selectType = (value: CampaignType) => {
    const meta = campaignTypeByValue(value)
    if (!meta) return
    const previous = campaignTypeByValue(draft.type)
    const patch: WizardDraft = { type: value }
    if (value === "seeding" && !draft.seedingProducts?.length) {
      patch.seedingMode = draft.seedingMode ?? "fechado"
      patch.daysToPost = draft.daysToPost ?? 7
      patch.seedingProducts = [blankSeedingProduct()]
    }
    if (!draft.objective || STOCK_OBJECTIVES.has(draft.objective)) {
      patch.objective = meta.suggestedObjective
    }
    const networksUntouched =
      !draft.targetNetworks?.length ||
      (previous ? sameSet(draft.targetNetworks, previous.suggestedNetworks) : false)
    const formatsUntouched =
      !draft.contentFormats?.length ||
      (previous ? sameSet(draft.contentFormats, previous.suggestedFormats) : false)
    if (networksUntouched) patch.targetNetworks = [...meta.suggestedNetworks]
    if (formatsUntouched) patch.contentFormats = [...meta.suggestedFormats]
    updateWizardDraft(patch)
    setNotice(null)
  }

  const applyTemplate = (templateId: string) => {
    const template = CAMPAIGN_TEMPLATES.find((item) => item.id === templateId)
    if (!template) return
    updateWizardDraft({
      type: template.type,
      objective: template.objective,
      targetNetworks: [...template.networks],
      targetNiches: [...template.niches],
      contentFormats: [...template.formats],
    })
    const goal = campaignTypeByValue(template.type)?.goal ?? null
    setGoalFilter(goal)
    setLastGoal(goal)
    setNotice(template.label)
  }

  const toggleIn = <K extends "targetNiches" | "targetNetworks" | "contentFormats">(
    key: K,
    value: string
  ) => {
    const current = (draft[key] ?? []) as string[]
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    updateWizardDraft({ [key]: next } as WizardDraft)
  }

  const toggleFormat = (value: (typeof CONTENT_FORMATS)[number]["value"]) => {
    const format = contentFormatByValue(value)
    const current = draft.contentFormats ?? []
    const selected = current.includes(value)
    const nextFormats = selected ? current.filter((item) => item !== value) : [...current, value]
    const networks = new Set(draft.targetNetworks ?? [])
    if (format) {
      const stillUsed = nextFormats.some((item) => contentFormatByValue(item)?.network === format.network)
      if (!selected) networks.add(format.network)
      else if (!stillUsed) networks.delete(format.network)
    }
    updateWizardDraft({ contentFormats: nextFormats, targetNetworks: [...networks] })
  }

  const toggleNetwork = (id: string) => {
    const current = draft.targetNetworks ?? []
    const selected = current.includes(id)
    updateWizardDraft({
      targetNetworks: selected ? current.filter((item) => item !== id) : [...current, id],
      contentFormats: selected
        ? (draft.contentFormats ?? []).filter((item) => contentFormatByValue(item)?.network !== id)
        : draft.contentFormats,
    })
  }

  const toggleTier = (id: string) => {
    const current = draft.audienceTiers ?? []
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    const picked = TIERS.filter((tier) => next.includes(tier.id))
    updateWizardDraft({
      audienceTiers: next,
      minFollowers: picked.length ? Math.min(...picked.map((tier) => tier.min)) : 0,
      maxFollowers: picked.length ? Math.max(...picked.map((tier) => tier.max)) : 0,
    })
  }

  const addHashtag = (raw: string) => {
    const value = raw.trim().replace(/^#/, "")
    if (!value) return
    const tag = `#${value.replace(/\s+/g, "")}`
    const current = draft.mandatoryHashtags ?? []
    if (!current.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      updateWizardDraft({ mandatoryHashtags: [...current, tag] })
    }
    setHashtagInput("")
  }

  const addMention = (raw: string, network: SocialNetwork = mentionNetwork) => {
    const value = raw.trim().replace(/^@/, "")
    if (!value) return
    const handle = `@${value.replace(/\s+/g, "")}`
    const current = normalizeMentions(draft.mandatoryMentions)
    if (current.some((item) => item.network === network && item.handle.toLowerCase() === handle.toLowerCase())) return
    updateWizardDraft({ mandatoryMentions: [...current, { network, handle }] })
    setMentionInput("")
  }

  const clearDraft = () => {
    resetWizard()
    setGoalFilter(null)
    setLastGoal(null)
    setNotice(null)
    setHashtagInput("")
    setMentionInput("")
    setMentionNetwork("instagram")
  }

  const handleCreate = () => {
    if (creating || !draft.type || !draft.name?.trim() || !datesOk || !draft.visibility) return
    if (draft.type === "seeding" && !seedingStepReady(draft.seedingProducts, draft.daysToPost)) return
    setCreating(true)
    const today = new Date().toISOString().split("T")[0]
    const campaignId = `camp_${Date.now()}`
    const doList = cleanGuidelines(draft.doList)
    const dontList = cleanGuidelines(draft.dontList)
    const linkedForm = draft.formId
      ? useFormStore.getState().forms.find((form) => form.id === draft.formId)
      : undefined
    if (linkedForm) {
      useFormStore.getState().updateForm(linkedForm.id, { scope: "campaign", campaignId })
    }
    const campaign: Campaign = {
      id: campaignId,
      formId: linkedForm?.id,
      organizationId: user?.organizationId ?? "org1",
      organizationName: user?.organizationName ?? "",
      name: draft.name.trim(),
      description: draft.description?.trim() ?? "",
      objective: draft.objective?.trim() ?? "",
      type: draft.type,
      status: "rascunho",
      startDate: draft.startDate ?? "",
      endDate: draft.endDate ?? "",
      budget: Number(draft.budget) || 0,
      budgetSpent: 0,
      targetNiches: draft.targetNiches ?? [],
      targetNetworks: draft.targetNetworks ?? [],
      minFollowers: Number(draft.minFollowers) || 0,
      maxFollowers: Number(draft.maxFollowers) || 10_000_000,
      minEngagement: Number(draft.minEngagement) || 0,
      mandatoryHashtags: draft.mandatoryHashtags ?? [],
      mandatoryMentions: normalizeMentions(draft.mandatoryMentions),
      contentFormats: draft.contentFormats ?? [],
      successTargets: readSuccessTargets(draft.successTargets).filter(
        (item) => item.target > 0 && metricsForNetworks((draft.targetNetworks ?? []).filter(isSocialNetwork)).some((metric) => metric.id === item.metric),
      ),
      doList: doList.length ? doList : undefined,
      dontList: dontList.length ? dontList : undefined,
      participants: [],
      createdAt: today,
      updatedAt: today,
      visibility: draft.visibility,
    }
    createCampaign(campaign)
    if (draft.type === "seeding") {
      const products = (draft.seedingProducts ?? []).map((product) => ({
        ...product,
        name: product.name.trim(),
        variants: product.variants.length ? product.variants : ["Único"],
        stockUsed: 0,
      }))
      useSeedingStore.getState().createCampaign({
        id: `s-${campaignId}`,
        campaignId,
        organizationId: campaign.organizationId,
        name: campaign.name,
        status: "rascunho",
        mode: draft.seedingMode ?? "fechado",
        objective: campaign.objective,
        expectedHashtag: campaign.mandatoryHashtags[0],
        expectedMention: campaign.mandatoryMentions[0]?.handle,
        expectedFormats: campaign.contentFormats ?? [],
        daysToPost: draft.daysToPost ?? 7,
        products,
        creators: [],
        createdAt: today,
        startDate: campaign.startDate || undefined,
        endDate: campaign.endDate || undefined,
      })
    }
    router.push(`/campaigns/${campaign.id}`)
  }

  const dirty = Object.values(draft).some((value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== "" && value !== 0
  })

  const nameTag = hashtagFromName(draft.name ?? "")
  const mentions = normalizeMentions(draft.mandatoryMentions)
  const mentionSuggestion = suggestedMention(user?.organizationName, mentionNetwork)
  const mentionSuggestions =
    mentionSuggestion &&
    !mentions.some(
      (item) => item.network === mentionNetwork && item.handle.toLowerCase() === mentionSuggestion.toLowerCase()
    )
      ? [mentionSuggestion]
      : []
  const hashtagSuggestions = [
    nameTag,
    ...(HASHTAG_SUGGESTIONS[draft.type as CampaignType] ?? []),
  ].filter((tag): tag is string => {
    if (!tag) return false
    return !(draft.mandatoryHashtags ?? []).some((item) => item.toLowerCase() === tag.toLowerCase())
  })

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("pages.newCampaign")}
        subtitle={t("pages.step", { current: safeStep + 1, total: steps.length, name: t(steps[safeStep].key) })}
        actions={
          <Link href="/campaigns">
            <Button variant="outline" size="sm" type="button">
              {t("pages.cancel")}
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-4 sm:p-6">
        <div
          className={cn(
            "mx-auto grid max-w-6xl gap-6 lg:grid-cols-[208px_minmax(0,1fr)]",
            step !== 1 && currentId !== "format" && currentId !== "goals" && currentId !== "form" && currentId !== "seeding" && "xl:grid-cols-[208px_minmax(0,1fr)_280px]"
          )}
        >
          <nav className="lg:sticky lg:top-24 lg:self-start xl:row-span-2" aria-label={t("pages.campaignSteps")}>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {steps.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  disabled={!canOpen(index)}
                  onClick={() => goTo(index)}
                  aria-current={index === safeStep ? "step" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    index === safeStep
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : index < safeStep
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-zinc-200 bg-white text-zinc-500",
                    !canOpen(index) && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {index < safeStep ? <Check size={12} /> : index + 1}
                  </span>
                  {t(item.key)}
                </button>
              ))}
            </div>
            <ol className="hidden space-y-1 lg:block">
              {steps.map((item, index) => {
                const done = index < safeStep
                const current = index === safeStep
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      disabled={!canOpen(index)}
                      onClick={() => goTo(index)}
                      aria-current={current ? "step" : undefined}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors",
                        current ? "bg-white shadow-sm ring-1 ring-zinc-200" : "hover:bg-white/70",
                        !canOpen(index) && "cursor-not-allowed opacity-45 hover:bg-transparent"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          done && "bg-emerald-600 text-white",
                          current && "bg-zinc-900 text-white",
                          !done && !current && "bg-zinc-200 text-zinc-500"
                        )}
                      >
                        {done ? <Check size={14} /> : index + 1}
                      </span>
                      <span>
                        <span className={cn("block text-sm", current ? "font-semibold text-zinc-900" : "font-medium text-zinc-700")}>
                          {t(item.key)}
                        </span>
                        <span className="mt-0.5 block text-xs text-zinc-500">{t(item.hintKey)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div ref={mainRef} className="scroll-mt-24 min-w-0">
            <div key={step} className="animate-in fade-in duration-300">
              {step > 0 && step < 4 && selectedType && (
                <button
                  type="button"
                  onClick={() => goTo(0)}
                  className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-zinc-400"
                >
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", selectedType.wellClass)}>
                    <selectedType.icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-zinc-400">Tipo escolhido</span>
                    <span className="block truncate text-sm font-semibold text-zinc-900">{selectedType.label}</span>
                  </span>
                  <span className="ml-auto text-xs font-medium text-zinc-500">Trocar</span>
                </button>
              )}

              {currentId === "type" && (
                <StepShell
                  title="Qual é o tipo da campanha?"
                  subtitle="Comece pelo objetivo. Os tipos aparecem em seguida, já com ícone e com o que a campanha vai medir."
                >
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Começar por um modelo</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {CAMPAIGN_TEMPLATES.map((template) => {
                        const Icon = template.icon
                        const active = draft.type === template.type && draft.objective === template.objective
                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => applyTemplate(template.id)}
                            aria-pressed={active}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                              active
                                ? "border-zinc-900 bg-zinc-50"
                                : "border-dashed border-zinc-300 bg-white hover:border-zinc-900 hover:bg-zinc-50"
                            )}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                              <Icon size={16} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-zinc-900">{template.label}</span>
                              <span className="block text-xs text-zinc-500">{template.blurb}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    {notice && (
                      <p className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                        Modelo {notice} aplicado. Redes, nicho e formatos já vieram preenchidos — dá para mudar tudo.
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Ou escolha o objetivo</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {CAMPAIGN_GOALS.map((goal) => {
                        const Icon = goal.icon
                        const pressed = !showAllGoals && activeGoal === goal.id
                        const count = CAMPAIGN_TYPE_META.filter((type) => type.goal === goal.id).length
                        return (
                          <button
                            key={goal.id}
                            type="button"
                            aria-pressed={pressed}
                            onClick={() => {
                              setGoalFilter(goal.id)
                              setLastGoal(goal.id)
                            }}
                            className={cn(
                              "rounded-2xl border bg-white p-4 text-left transition-all",
                              pressed
                                ? "border-zinc-900 shadow-[0_0_0_1px_#18181b]"
                                : "border-zinc-200 hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-sm"
                            )}
                          >
                            <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", goal.wellClass)}>
                              <Icon size={20} />
                            </span>
                            <span className="mt-3 block text-sm font-semibold text-zinc-900">{goal.label}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-zinc-500">{goal.description}</span>
                            <span className="mt-3 block text-[11px] font-medium text-zinc-400">
                              {count} tipos · {goal.measures}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {visibleGoals.length === 0 ? (
                    <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                      Escolha Alcance, Conteúdo ou Vendas para ver os tipos.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Tipos</p>
                        {!showAllGoals ? (
                          <button
                            type="button"
                            onClick={() => setGoalFilter("all")}
                            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
                          >
                            Ver todos
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setGoalFilter(selectedType?.goal ?? lastGoal)}
                            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
                          >
                            Agrupar de novo
                          </button>
                        )}
                      </div>
                      {selectedType && !showAllGoals && activeGoal && selectedType.goal !== activeGoal && (
                        <p className="text-sm text-zinc-600">
                          <span className="font-medium text-zinc-900">{selectedType.label}</span> continua selecionado.{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setGoalFilter(selectedType.goal)
                              setLastGoal(selectedType.goal)
                            }}
                            className="font-medium text-zinc-900 underline-offset-2 hover:underline"
                          >
                            Mostrar esse tipo
                          </button>
                        </p>
                      )}
                      {visibleGoals.map((goal) => {
                        const types = CAMPAIGN_TYPE_META.filter((type) => type.goal === goal.id)
                        const GoalIcon = goal.icon
                        return (
                          <div key={goal.id}>
                            {showAllGoals && (
                              <div className="mb-2 flex items-center gap-2">
                                <GoalIcon size={14} className={goal.iconClass} />
                                <h3 className="text-sm font-semibold text-zinc-800">{goal.label}</h3>
                              </div>
                            )}
                            <div className="grid gap-3 sm:grid-cols-2">
                              {types.map((type) => (
                                <TypeCard
                                  key={type.value}
                                  meta={type}
                                  selected={draft.type === type.value}
                                  onSelect={() => selectType(type.value)}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{t("agent.manualEntryTitle")}</p>
                      <p className="text-xs text-zinc-500">{t("agent.manualEntryHelp")}</p>
                    </div>
                    <Button variant="outline" size="sm" render={<Link href="/campaigns/agent" />}>
                      <Sparkles />
                      {t("agent.title")}
                    </Button>
                  </div>
                </StepShell>
              )}

              {currentId === "campaign" && (
                <StepShell
                  title="Dados da campanha"
                  subtitle="Nome, período e orçamento. Os formatos da publicação vêm na etapa seguinte."
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="campaign-name">Nome da campanha *</Label>
                    <Input
                      id="campaign-name"
                      placeholder="Ex: Natura Ekos — Lançamento Primavera"
                      maxLength={90}
                      value={draft.name ?? ""}
                      onChange={(event) => updateWizardDraft({ name: event.target.value })}
                    />
                    <p className="text-right text-[11px] text-zinc-400">{(draft.name ?? "").length}/90</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="campaign-objective">Objetivo</Label>
                    <Input
                      id="campaign-objective"
                      placeholder="O que essa campanha precisa provocar"
                      value={draft.objective ?? ""}
                      onChange={(event) => updateWizardDraft({ objective: event.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="campaign-description">Contexto</Label>
                    <Textarea
                      id="campaign-description"
                      className="min-h-20"
                      maxLength={500}
                      placeholder="Produto, momento e o que não pode faltar na história."
                      value={draft.description ?? ""}
                      onChange={(event) => updateWizardDraft({ description: event.target.value })}
                    />
                    <p className="text-right text-[11px] text-zinc-400">{(draft.description ?? "").length}/500</p>
                  </div>

                  <GuidelineLists
                    doList={draft.doList ?? []}
                    dontList={draft.dontList ?? []}
                    onChange={updateWizardDraft}
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="start-date">Início</Label>
                      <Input
                        id="start-date"
                        type="date"
                        lang="pt-BR"
                        value={draft.startDate ?? ""}
                        onChange={(event) => updateWizardDraft({ startDate: event.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="end-date">Encerramento</Label>
                      <Input
                        id="end-date"
                        type="date"
                        lang="pt-BR"
                        value={draft.endDate ?? ""}
                        onChange={(event) => updateWizardDraft({ endDate: event.target.value })}
                      />
                    </div>
                  </div>
                  {!datesOk && (
                    <p className="text-xs text-red-600">A data de encerramento precisa ser no mesmo dia ou depois do início.</p>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="budget">Orçamento total</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-zinc-400">R$</span>
                      <Input
                        id="budget"
                        className="pl-8"
                        type="number"
                        min={0}
                        placeholder="50000"
                        value={draft.budget ?? ""}
                        onChange={(event) =>
                          updateWizardDraft({
                            budget: event.target.value === "" ? undefined : Number(event.target.value),
                          })
                        }
                      />
                    </div>
                    {draft.budget ? (
                      <p className="text-xs text-zinc-500">{formatMoney(Number(draft.budget))} para dividir entre os creators.</p>
                    ) : null}
                  </div>
                </StepShell>
              )}

              {currentId === "format" && (
                <StepShell
                  title="Formatos"
                  subtitle="Redes, o que o creator entrega e como a publicação aparece."
                >
                  <div>
                    <Label className="mb-2 block">Redes</Label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {NETWORKS.map((network) => {
                        const selected = (draft.targetNetworks ?? []).includes(network.id)
                        const Icon = network.icon
                        return (
                          <button
                            key={network.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleNetwork(network.id)}
                            className={cn(
                              "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                              selected
                                ? "border-zinc-900 bg-zinc-50 shadow-[0_0_0_1px_#18181b]"
                                : "border-zinc-200 bg-white hover:border-zinc-400"
                            )}
                          >
                            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", network.wellClass)}>
                              <Icon size={18} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-zinc-900">{network.label}</span>
                              <span className="block text-xs text-zinc-500">{network.hint}</span>
                            </span>
                            {selected && <Check size={16} className="ml-auto shrink-0 text-zinc-900" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="min-w-0 space-y-5">
                      <div>
                        <Label className="mb-2 block">Formatos esperados</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {CONTENT_FORMATS.map((format) => {
                            const selected = (draft.contentFormats ?? []).includes(format.value)
                            const Icon = format.icon
                            return (
                              <button
                                key={format.value}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleFormat(format.value)}
                                className={cn(
                                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                                  selected ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-400"
                                )}
                              >
                                <span className="flex shrink-0 items-center gap-1.5">
                                  <FormatNetwork network={format.network} selected={selected} />
                                  <Icon size={16} className={cn(selected ? "text-current" : "text-zinc-500")} />
                                </span>
                                <span>
                                  <span className="block text-sm font-medium">{format.label}</span>
                                  <span className={cn("block text-[11px]", selected ? "text-zinc-300" : "text-zinc-400")}>{format.hint}</span>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <TagField
                        label="Hashtags obrigatórias"
                        placeholder="#NomeDaCampanha"
                        value={hashtagInput}
                        onChange={setHashtagInput}
                        onAdd={() => addHashtag(hashtagInput)}
                        items={draft.mandatoryHashtags ?? []}
                        onRemove={(item) =>
                          updateWizardDraft({
                            mandatoryHashtags: (draft.mandatoryHashtags ?? []).filter((tag) => tag !== item),
                          })
                        }
                        suggestions={hashtagSuggestions.slice(0, 4)}
                        onSuggest={addHashtag}
                      />

                      <MentionField
                        network={mentionNetwork}
                        onNetwork={setMentionNetwork}
                        placeholder={MENTION_PLACEHOLDER[mentionNetwork]}
                        value={mentionInput}
                        onChange={setMentionInput}
                        onAdd={() => addMention(mentionInput)}
                        items={mentions}
                        onRemove={(item) =>
                          updateWizardDraft({
                            mandatoryMentions: mentions.filter(
                              (current) => !(current.network === item.network && current.handle === item.handle)
                            ),
                          })
                        }
                        suggestions={mentionSuggestions}
                        onSuggest={(value) => addMention(value, mentionNetwork)}
                      />
                    </div>

                    <SocialPreviewCarousel
                      campaignName={draft.name}
                      hashtags={draft.mandatoryHashtags ?? []}
                      mentions={mentions}
                      formats={draft.contentFormats ?? []}
                    />
                  </div>
                </StepShell>
              )}

              {currentId === "audience" && (
                <StepShell
                  title="Público"
                  subtitle="Escolha quem encontra a campanha. O restante ajuda a achar o perfil certo e não impede de criar."
                >
                  <div>
                    <Label className="mb-2 block">Quem pode ver</Label>
                    <CampaignVisibilityPicker
                      value={draft.visibility}
                      onChange={(visibility) => updateWizardDraft({ visibility })}
                    />
                  </div>
                  {selectedType && (
                    <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-600">
                      {selectedType.audienceTip}
                    </p>
                  )}

                  <div>
                    <Label className="mb-2 block">Nicho</Label>
                    <div className="flex flex-wrap gap-2">
                      {NICHES.map((niche) => {
                        const selected = (draft.targetNiches ?? []).includes(niche.id)
                        const Icon = niche.icon
                        return (
                          <button
                            key={niche.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleIn("targetNiches", niche.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                              selected
                                ? "border-zinc-900 bg-zinc-900 text-white"
                                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                            )}
                          >
                            <Icon size={14} />
                            {niche.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Porte dos creators</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {TIERS.map((tier) => {
                        const selected = (draft.audienceTiers ?? []).includes(tier.id)
                        return (
                          <button
                            key={tier.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleTier(tier.id)}
                            className={cn(
                              "rounded-xl border px-2 py-3 text-center transition-colors",
                              selected
                                ? "border-zinc-900 bg-zinc-900 text-white"
                                : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
                            )}
                          >
                            <span className="block text-sm font-semibold">{tier.label}</span>
                            <span className={cn("mt-0.5 block text-[11px]", selected ? "text-zinc-300" : "text-zinc-400")}>
                              {tier.range}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    {(draft.audienceTiers ?? []).length > 0 && (draft.minFollowers ?? 0) > 0 && (
                      <p className="mt-2 text-xs text-zinc-500">
                        Faixa de {formatFollowers(draft.minFollowers ?? 0)} a {formatFollowers(draft.maxFollowers ?? 0)} seguidores.
                      </p>
                    )}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-medium text-zinc-500">Definir números exatos</summary>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="min-followers">Mínimo de seguidores</Label>
                          <Input
                            id="min-followers"
                            type="number"
                            min={0}
                            value={draft.minFollowers || ""}
                            onChange={(event) =>
                              updateWizardDraft({
                                audienceTiers: [],
                                minFollowers: event.target.value === "" ? 0 : Number(event.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="max-followers">Máximo de seguidores</Label>
                          <Input
                            id="max-followers"
                            type="number"
                            min={0}
                            value={draft.maxFollowers || ""}
                            onChange={(event) =>
                              updateWizardDraft({
                                audienceTiers: [],
                                maxFollowers: event.target.value === "" ? 0 : Number(event.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </details>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-1">
                      <Label>Engajamento mínimo</Label>
                      <TooltipProvider delay={200}>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label="O que é engajamento"
                              />
                            }
                          >
                            <CircleHelp />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-64 whitespace-normal text-left leading-relaxed">
                            Percentual de interações do creator — curtidas, comentários, salvamentos e encaminhamentos — sobre o alcance. Quem fica abaixo desse mínimo não entra na campanha.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        aria-pressed={!draft.minEngagement}
                        onClick={() => updateWizardDraft({ minEngagement: 0 })}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm",
                          !draft.minEngagement
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                        )}
                      >
                        Sem mínimo
                      </button>
                      {ENGAGEMENT_PRESETS.map((preset) => {
                        const selected = draft.minEngagement === preset
                        return (
                          <button
                            key={preset}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => updateWizardDraft({ minEngagement: preset })}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm",
                              selected
                                ? "border-zinc-900 bg-zinc-900 text-white"
                                : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                            )}
                          >
                            {preset}%
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </StepShell>
              )}

              {currentId === "goals" && (
                <StepShell
                  title="Metas de sucesso"
                  subtitle="Marque o que a campanha precisa alcançar. A sugestão segue o tipo escolhido e as redes desta etapa."
                >
                  <CampaignSuccessTargets
                    networks={(draft.targetNetworks ?? []).filter(isSocialNetwork)}
                    type={draft.type}
                    value={draft.successTargets}
                    onChange={(successTargets) => updateWizardDraft({ successTargets })}
                    showHeading={false}
                  />
                </StepShell>
              )}

              {currentId === "form" && (
                <WizardFormStep
                  organizationId={user?.organizationId ?? "org1"}
                  organizationName={user?.organizationName ?? ""}
                  formId={draft.formId}
                  onFormId={(formId) => updateWizardDraft({ formId })}
                />
              )}

              {currentId === "seeding" && (
                <SeedingStep
                  products={draft.seedingProducts ?? []}
                  mode={draft.seedingMode ?? "fechado"}
                  daysToPost={draft.daysToPost ?? 7}
                  onChange={updateWizardDraft}
                />
              )}

              {currentId === "review" && (
                <div className="space-y-4">
                  <ReviewHero draft={draft} onChangeType={() => goTo(0)} />
                  <ReviewBlock title="Campanha" onEdit={() => goTo(1)}>
                    <Fact label="Período" value={periodLabel(draft)} />
                    <Fact label="Orçamento" value={draft.budget ? formatMoney(Number(draft.budget)) : "A definir"} />
                    {(cleanGuidelines(draft.doList).length > 0 || cleanGuidelines(draft.dontList).length > 0) && (
                      <div className="pt-2 sm:col-span-2">
                        <GuidelineLists doList={cleanGuidelines(draft.doList)} dontList={cleanGuidelines(draft.dontList)} />
                      </div>
                    )}
                  </ReviewBlock>
                  <ReviewBlock title="Formato" onEdit={() => goTo(2)}>
                    <Fact
                      label="Redes"
                      value={
                        (draft.targetNetworks ?? []).length
                          ? (draft.targetNetworks ?? [])
                              .map((id) => NETWORKS.find((network) => network.id === id)?.label ?? id)
                              .join(", ")
                          : "A definir"
                      }
                    />
                    <Fact
                      label="Formatos"
                      value={
                        (draft.contentFormats ?? []).length
                          ? (draft.contentFormats ?? []).map((format) => contentFormatByValue(format)?.label ?? format).join(", ")
                          : "A definir"
                      }
                    />
                    <Fact label="Hashtags" value={(draft.mandatoryHashtags ?? []).join(" ") || "A definir"} />
                    <Fact
                      label="Menções"
                      value={
                        mentions.length
                          ? mentions.map((item) => `${SOCIAL_NETWORK_LABEL[item.network]} ${item.handle}`).join(" · ")
                          : "A definir"
                      }
                    />
                  </ReviewBlock>
                  <ReviewBlock title="Público" onEdit={() => goTo(3)}>
                    <Fact label="Quem pode ver" value={visibilityLabel(draft.visibility)} />
                    <Fact
                      label="Nichos"
                      value={
                        (draft.targetNiches ?? []).length
                          ? (draft.targetNiches ?? [])
                              .map((id) => NICHES.find((niche) => niche.id === id)?.label ?? id)
                              .join(", ")
                          : "A definir"
                      }
                    />
                    <Fact label="Seguidores" value={followersLabel(draft)} />
                    <Fact
                      label="Engajamento"
                      value={draft.minEngagement ? `Mínimo de ${draft.minEngagement}%` : "Sem mínimo"}
                    />
                  </ReviewBlock>
                  <ReviewBlock title="Metas" onEdit={() => goTo(steps.findIndex((item) => item.id === "goals"))}>
                    <Fact label="Sucesso" value={formatSuccessTargetList(draft.successTargets)} />
                  </ReviewBlock>
                  <ReviewBlock title="Formulário" onEdit={() => goTo(steps.findIndex((item) => item.id === "form"))}>
                    <Fact
                      label="Candidatura"
                      value={forms.find((form) => form.id === draft.formId)?.title ?? "Sem formulário"}
                    />
                  </ReviewBlock>
                  {draft.type === "seeding" && (
                    <ReviewBlock
                      title="Seeding"
                      onEdit={() => goTo(steps.findIndex((item) => item.id === "seeding"))}
                    >
                      <Fact label="Modo" value={draft.seedingMode === "aberto" ? "Aberto — creators se candidatam" : "Fechado — a marca convida"} />
                      <Fact label="Prazo para postar" value={`${draft.daysToPost ?? 7} dias após a entrega`} />
                      <Fact
                        label="Produtos"
                        value={
                          (draft.seedingProducts ?? []).map((product) => product.name.trim()).filter(Boolean).join(", ") || "A definir"
                        }
                      />
                    </ReviewBlock>
                  )}
                  <p className="text-sm text-zinc-500">
                    A campanha entra como <span className="font-medium text-zinc-800">rascunho</span>. As candidaturas só abrem quando você quiser.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <Button type="button" variant="outline" size="lg" onClick={() => goTo(safeStep - 1)} disabled={safeStep === 0}>
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                {continueHint && <p className="hidden text-xs text-zinc-500 sm:block">{continueHint}</p>}
                {safeStep < steps.length - 1 ? (
                  <Button type="button" size="lg" onClick={() => goTo(safeStep + 1)} disabled={!stepIsValid(safeStep)}>
                    Continuar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleCreate}
                    disabled={
                      creating
                      || !draft.type
                      || !draft.name?.trim()
                      || !datesOk
                      || !draft.visibility
                      || (draft.type === "seeding" && !seedingStepReady(draft.seedingProducts, draft.daysToPost))
                    }
                  >
                    {creating ? "Criando..." : "Criar campanha"}
                  </Button>
                )}
              </div>
            </div>
            {continueHint && <p className="mt-2 text-right text-xs text-zinc-500 sm:hidden">{continueHint}</p>}
          </div>

          {currentId !== "campaign" && currentId !== "format" && currentId !== "goals" && currentId !== "form" && currentId !== "seeding" && (
            <aside className="lg:col-span-2 xl:col-span-1 xl:col-start-3 xl:row-span-2 xl:row-start-1 xl:sticky xl:top-24 xl:self-start">
              <Preview draft={draft} dirty={dirty} onClear={clearDraft} />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

function SeedingStep({
  products,
  mode,
  daysToPost,
  onChange,
}: {
  products: SeedingProduct[]
  mode: "fechado" | "aberto"
  daysToPost: number
  onChange: (data: WizardDraft) => void
}) {
  const [variantText, setVariantText] = useState<Record<string, string>>({})

  function updateProduct(index: number, patch: Partial<SeedingProduct>) {
    onChange({
      seedingProducts: products.map((product, productIndex) =>
        productIndex === index ? { ...product, ...patch } : product
      ),
    })
  }

  return (
    <StepShell
      title="Envio de produto"
      subtitle="O que sai para os creators, como eles entram na campanha e em quantos dias devem publicar depois de receber."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Modo de participação</Label>
          <Select value={mode} onValueChange={(value) => onChange({ seedingMode: value === "aberto" ? "aberto" : "fechado" })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fechado">Fechado — a marca convida</SelectItem>
              <SelectItem value="aberto">Aberto — creators se candidatam</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="daysToPost">Prazo para postar após a entrega</Label>
          <Input
            id="daysToPost"
            type="number"
            min={1}
            max={60}
            value={daysToPost}
            onChange={(event) => onChange({ daysToPost: Number(event.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Produtos para envio</h3>
          <p className="mt-0.5 text-xs text-zinc-500">Nome, variantes, custo e quanto pode ser enviado.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ seedingProducts: [...products, blankSeedingProduct()] })}
        >
          <PackagePlus data-icon="inline-start" />
          Adicionar produto
        </Button>
      </div>

      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={product.id} className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">Produto {index + 1}</p>
              {products.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover ${product.name || `produto ${index + 1}`}`}
                  onClick={() => onChange({ seedingProducts: products.filter((item) => item.id !== product.id) })}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor={`product-name-${product.id}`}>Nome do produto</Label>
                <Input
                  id={`product-name-${product.id}`}
                  placeholder="Ex: Kit Hidratação Facial"
                  value={product.name}
                  onChange={(event) => updateProduct(index, { name: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`product-variants-${product.id}`}>Variantes</Label>
                <Input
                  id={`product-variants-${product.id}`}
                  placeholder="Pele Seca, Pele Oleosa"
                  value={variantText[product.id] ?? product.variants.join(", ")}
                  onChange={(event) => {
                    const raw = event.target.value
                    setVariantText((current) => ({ ...current, [product.id]: raw }))
                    const variants = raw.split(",").map((item) => item.trim()).filter(Boolean)
                    updateProduct(index, { variants: variants.length ? variants : ["Único"] })
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`product-cost-${product.id}`}>Custo unitário (R$)</Label>
                <Input
                  id={`product-cost-${product.id}`}
                  type="number"
                  min={0}
                  placeholder="120"
                  value={product.unitCost || ""}
                  onChange={(event) => updateProduct(index, { unitCost: Number(event.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`product-stock-${product.id}`}>Estoque para seeding</Label>
                <Input
                  id={`product-stock-${product.id}`}
                  type="number"
                  min={0}
                  placeholder="25"
                  value={product.stockForSeeding || ""}
                  onChange={(event) => updateProduct(index, { stockForSeeding: Number(event.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </StepShell>
  )
}

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function TypeCard({
  meta,
  selected,
  onSelect,
}: {
  meta: (typeof CAMPAIGN_TYPE_META)[number]
  selected: boolean
  onSelect: () => void
}) {
  const Icon = meta.icon
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border bg-white p-4 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
        selected
          ? "border-zinc-900 shadow-[0_0_0_1px_#18181b]"
          : "border-zinc-200 hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-sm"
      )}
    >
      <span className="flex gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
            meta.wellClass
          )}
        >
          <Icon size={20} />
        </span>
        <span className="min-w-0 pr-5">
          <span className="block text-sm font-semibold text-zinc-900">{meta.label}</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">{meta.description}</span>
        </span>
      </span>
      <span className="flex w-full rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
        Mede {meta.measures}
      </span>
      {selected && (
        <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white">
          <Check size={12} />
        </span>
      )}
    </button>
  )
}

function TagField({
  label,
  placeholder,
  value,
  onChange,
  onAdd,
  items,
  onRemove,
  suggestions,
  onSuggest,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onAdd: () => void
  items: string[]
  onRemove: (item: string) => void
  suggestions: string[]
  onSuggest: (value: string) => void
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              onAdd()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={onAdd}>
          Adicionar
        </Button>
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggest(suggestion)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
            >
              <Plus size={10} />
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Badge key={item} variant="outline" className="gap-1 pr-1">
              {item}
              <button type="button" aria-label={`Remover ${item}`} onClick={() => onRemove(item)} className="rounded-full p-0.5 hover:bg-zinc-100">
                <X size={10} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function MentionField({
  network,
  onNetwork,
  placeholder,
  value,
  onChange,
  onAdd,
  items,
  onRemove,
  suggestions,
  onSuggest,
}: {
  network: SocialNetwork
  onNetwork: (network: SocialNetwork) => void
  placeholder: string
  value: string
  onChange: (value: string) => void
  onAdd: () => void
  items: CampaignMention[]
  onRemove: (item: CampaignMention) => void
  suggestions: string[]
  onSuggest: (value: string) => void
}) {
  return (
    <div>
      <Label className="mb-1 block">Menções obrigatórias</Label>
      <p className="mb-2 text-xs leading-relaxed text-zinc-500">
        Cada @ fica ligado a uma rede. No Instagram pode ser @mycompany e no TikTok @mycompanyTT.
      </p>
      <div className="mb-2 grid grid-cols-3 gap-1.5">
        {NETWORKS.map((item) => {
          const selected = network === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onNetwork(item.id as SocialNetwork)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium",
                selected ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
              )}
            >
              <Icon size={12} />
              {item.label}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              onAdd()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={onAdd}>
          Adicionar
        </Button>
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggest(suggestion)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
            >
              <Plus size={10} />
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item) => {
            const meta = NETWORKS.find((entry) => entry.id === item.network)
            const Icon = meta?.icon
            return (
              <Badge key={`${item.network}:${item.handle}`} variant="outline" className="h-auto gap-1 py-1 pr-1">
                {Icon ? <Icon size={11} /> : null}
                <span className="text-zinc-500">{meta?.label}</span>
                {item.handle}
                <button
                  type="button"
                  aria-label={`Remover ${item.handle} do ${meta?.label ?? "rede"}`}
                  onClick={() => onRemove(item)}
                  className="rounded-full p-0.5 hover:bg-zinc-100"
                >
                  <X size={10} />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}

function periodLabel(draft: WizardDraft) {
  const start = formatDateBR(draft.startDate)
  const end = formatDateBR(draft.endDate)
  if (start && end) return `${start} → ${end}`
  if (start) return `A partir de ${start}`
  if (end) return `Até ${end}`
  return "A definir"
}

function followersLabel(draft: WizardDraft) {
  const min = draft.minFollowers ?? 0
  const max = draft.maxFollowers ?? 0
  if (!min && !max) return "Qualquer porte"
  if (min && max) return `${formatFollowers(min)} a ${formatFollowers(max)}`
  if (min) return `A partir de ${formatFollowers(min)}`
  return `Até ${formatFollowers(max)}`
}

function ReviewHero({ draft, onChangeType }: { draft: WizardDraft; onChangeType: () => void }) {
  const meta = campaignTypeByValue(draft.type)
  const goal = campaignGoalById(meta?.goal)
  const Icon = meta?.icon
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", meta?.wellClass ?? "bg-zinc-100 text-zinc-500")}>
          {Icon ? <Icon size={26} /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-zinc-400">{goal ? `${goal.label} · ${meta?.label}` : "Tipo"}</p>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-zinc-900">{draft.name?.trim() || "Sem nome"}</h2>
          {draft.objective && <p className="mt-1 text-sm text-zinc-600">{draft.objective}</p>}
          {draft.description && <p className="mt-2 text-sm leading-relaxed text-zinc-500">{draft.description}</p>}
        </div>
        <button type="button" onClick={onChangeType} className="shrink-0 text-xs font-medium text-zinc-500 hover:text-zinc-900">
          Trocar tipo
        </button>
      </div>
    </section>
  )
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        <button type="button" onClick={onEdit} className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
          Editar
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  const empty = value === "A definir" || value === "Qualquer porte" || value === "Sem mínimo"
  return (
    <div>
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={cn("mt-0.5 text-sm", empty ? "text-zinc-400" : "font-medium text-zinc-800")}>{value}</p>
    </div>
  )
}

function Preview({ draft, dirty, onClear }: { draft: WizardDraft; dirty: boolean; onClear: () => void }) {
  const meta = campaignTypeByValue(draft.type)
  const goal = campaignGoalById(meta?.goal)
  const Icon = meta?.icon
  const checks = [
    { label: "Tipo escolhido", done: Boolean(draft.type) },
    { label: "Nome definido", done: Boolean(draft.name?.trim()) },
    { label: "Período", done: Boolean(draft.startDate && draft.endDate) },
    { label: "Quem pode ver", done: Boolean(draft.visibility) },
    { label: "Redes escolhidas", done: Boolean((draft.targetNetworks ?? []).length) },
    { label: "Público marcado", done: Boolean((draft.targetNiches ?? []).length) },
  ]
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Prévia ao vivo</p>
      {meta && Icon ? (
        <div className="mt-3 flex items-center gap-3">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", meta.wellClass)}>
            <Icon size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">{meta.label}</p>
            <p className="text-xs text-zinc-500">{goal?.label}</p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-400">O tipo escolhido aparece aqui.</p>
      )}
      <p className="mt-3 line-clamp-2 text-sm font-medium text-zinc-900">{draft.name?.trim() || "Sem nome ainda"}</p>
      {draft.objective && <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-zinc-500">{draft.objective}</p>}
      <ul className="mt-4 space-y-2">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full",
                check.done ? "bg-emerald-600 text-white" : "border border-zinc-300"
              )}
            >
              {check.done && <Check size={10} />}
            </span>
            <span className={check.done ? "text-zinc-800" : "text-zinc-400"}>{check.label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] leading-relaxed text-zinc-400">
        O rascunho fica salvo neste navegador se você sair no meio.
      </p>
      {dirty && (
        <button type="button" onClick={onClear} className="mt-2 text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">
          Limpar rascunho
        </button>
      )}
    </div>
  )
}
