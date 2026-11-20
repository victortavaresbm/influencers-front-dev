"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Coins, FileText, Flag, Mail, Store } from "lucide-react"
import { CampaignPreview } from "@/components/campaigns/wizard/campaign-preview"
import { AiRationalePanel } from "@/components/campaigns/wizard/ai-rationale"
import { CompanyBrief } from "@/components/campaigns/wizard/company-brief"
import { ResearchProgress } from "@/components/campaigns/wizard/research-progress"
import { Insight, MagicCursor } from "@/components/campaigns/wizard/wizard-chrome"
import { stepRationale } from "@/lib/campaigns/ai-rationale"
import { WizardQuestion } from "@/components/campaigns/wizard/wizard-question"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/toast"
import { completeCampaignPlan, websiteKey, type AutofillSuggestion, type CompanyProfile } from "@/lib/campaigns/autofill"
import { buildPublishedCampaign, communityPath } from "@/lib/campaigns/shape"
import { stepSummary } from "@/lib/campaigns/step-summary"
import { guidelineById } from "@/lib/campaigns/wizard-guidelines"
import { WIZARD_GROUPS, WIZARD_STEPS, type WizardGroupId } from "@/lib/campaigns/wizard-steps"
import { budgetReady, canOpen, continueHint, groupPercent, patchEntries, stepByIndex, stepCanContinue, stepDone, stepIndex } from "@/lib/campaigns/wizard-flow"
import { AI_ACCOMPANIMENT_CREDIT_COST } from "@/lib/credits"
import { CREATORS } from "@/lib/mock-data/creators"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { organizationBalance, useCreditsStore } from "@/lib/stores/credits"
import { useFormStore } from "@/lib/stores/forms"
import { useSeedingStore } from "@/lib/stores/seeding"
import { cn } from "@/lib/utils"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { wizardStep, setWizardStep, wizardDraft, updateWizardDraft, resetWizard, createCampaign, campaigns } = useCampaignStore()
  const forms = useFormStore((state) => state.forms)
  const draft = wizardDraft
  const step = stepByIndex(wizardStep)
  const [note, setNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filling, setFilling] = useState(false)
  const [reading, setReading] = useState(false)
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [pulse, setPulse] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [clicking, setClicking] = useState(false)
  const [researchDone, setResearchDone] = useState(false)
  const organizationId = user?.organizationId ?? "org1"

  useEffect(() => {
    if (!draft.reservedId) updateWizardDraft({ reservedId: `camp_${Date.now()}` })
  }, [draft.reservedId, updateWizardDraft])

  useEffect(() => {
    const saved = draft.research
    if (!saved || saved.website !== websiteKey(draft.brandWebsite)) return
    setCompany((current) => current ?? saved.company)
  }, [draft.brandWebsite, draft.research])

  const hint = continueHint(step.id, draft)
  const guide = guidelineById(step.id)
  const summary = step.id === "preview" ? null : stepSummary(step.id, draft)
  const linkedForm = forms.find((form) => form.id === draft.formId)
  const rationale = stepRationale(step.id, draft, draft.research?.suggestion, company ?? draft.research?.company)
  const showRationale = Boolean(draft.aiAccompaniment)

  const goTo = (index: number) => {
    if (filling) return
    if (canOpen(index, wizardStep, draft)) setWizardStep(index)
  }

  const skip = () => {
    updateWizardDraft({ skippedSteps: [...new Set([...(draft.skippedSteps ?? []), step.id])] })
    goTo(wizardStep + 1)
  }

  const ensureResearch = async () => {
    const current = useCampaignStore.getState().wizardDraft
    if (!current.brandWebsite?.trim()) {
      setError("Informe o site da marca para a IA ler a empresa.")
      return false
    }
    setError(null)
    const key = websiteKey(current.brandWebsite)
    const saved = current.research?.website === key ? current.research : null
    if (saved) {
      setCompany(saved.company)
      setNote(saved.company.summary)
      return true
    }
    const spent = useCreditsStore.getState().spend(organizationId, AI_ACCOMPANIMENT_CREDIT_COST)
    if (!spent) {
      setError(`O acompanhamento com IA usa ${AI_ACCOMPANIMENT_CREDIT_COST} créditos. Compre créditos no saldo da marca.`)
      toast.add({
        type: "error",
        title: "Créditos insuficientes",
        description: `O acompanhamento com IA usa ${AI_ACCOMPANIMENT_CREDIT_COST} créditos.`,
      })
      return false
    }
    const refund = () => useCreditsStore.getState().add(organizationId, AI_ACCOMPANIMENT_CREDIT_COST)
    setReading(true)
    setResearchDone(false)
    setNote("Abrindo o site e lendo a empresa…")
    const started = Date.now()
    try {
      const response = await fetch("/api/campaigns/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: current.brandWebsite ?? "",
          organizationName: user?.organizationName ?? "",
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        refund()
        setError(typeof body.error === "string" ? body.error : "Não foi possível ler a empresa.")
        return false
      }
      const profile = body.company as CompanyProfile | null
      let suggestion = body.draft as AutofillSuggestion
      if (!profile || !suggestion) {
        refund()
        setError("A pesquisa da empresa veio incompleta.")
        return false
      }
      suggestion = completeCampaignPlan(suggestion, profile, current.brandWebsite ?? "")
      updateWizardDraft({ research: { website: key, company: profile, suggestion } })
      setCompany(profile)
      const left = organizationBalance(useCreditsStore.getState().balances, organizationId)
      setNote(profile.summary)
      toast.add({
        type: "success",
        title: "Acompanhamento com IA",
        description: `${AI_ACCOMPANIMENT_CREDIT_COST} créditos usados. Saldo: ${left}.`,
      })
      const elapsed = Date.now() - started
      if (elapsed < 7200) await wait(7200 - elapsed)
      setResearchDone(true)
      await wait(700)
      return true
    } catch {
      refund()
      setError("Não foi possível ler a empresa.")
      return false
    } finally {
      setReading(false)
      setResearchDone(false)
    }
  }

  const fieldElement = (field: string) => {
    const found = document.querySelector(`[data-ai-field="${field}"]`)
    if (found && found.getBoundingClientRect().width > 8) return found
    if (field === "mandatoryMentions") return document.querySelector(`[data-ai-field="mandatoryHashtags"]`)
    if (field === "minFollowers" || field === "maxFollowers") return document.querySelector(`[data-ai-field="audienceTiers"]`)
    if (field === "objective") return document.querySelector(`[data-ai-field="strategy"]`)
    if (field === "contentFormats") return document.querySelector(`[data-ai-field="formatQuantities"]`)
    return found
  }

  const optionElement = async (id: string) => {
    const selector = `[data-ai-option="${CSS.escape(String(id))}"]`
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const found = document.querySelector(selector)
      if (found && found.getBoundingClientRect().height > 4) return found
      await wait(40)
    }
    return null
  }

  const pointAtElement = async (element: Element) => {
    element.scrollIntoView({ block: "center", behavior: "smooth" })
    await wait(180)
    const rect = element.getBoundingClientRect()
    const next = { x: rect.left + rect.width / 2, y: rect.top + Math.min(rect.height / 2, 28) }
    setCursor((current) => current ?? { x: window.innerWidth - 72, y: 96 })
    await wait(30)
    setCursor(next)
    await wait(480)
    return next
  }

  const wandClick = async (element: Element) => {
    await pointAtElement(element)
    setClicking(true)
    await wait(90)
    if (element instanceof HTMLElement) element.click()
    await wait(160)
    setClicking(false)
    await wait(180)
  }

  const openMenu = async (field: string) => {
    const trigger = fieldElement(field)
    if (!trigger) return false
    window.dispatchEvent(new CustomEvent("ai-close-menu", { detail: {} }))
    await wait(120)
    await pointAtElement(trigger)
    setClicking(true)
    await wait(90)
    window.dispatchEvent(new CustomEvent("ai-open-menu", { detail: { field } }))
    await wait(160)
    setClicking(false)
    await wait(320)
    return true
  }

  const closeMenu = async (field?: string) => {
    window.dispatchEvent(new CustomEvent("ai-close-menu", { detail: field ? { field } : {} }))
    await wait(220)
  }

  const pickOptions = async (field: string, ids: string[], multi = false) => {
    const opened = await openMenu(field)
    if (!opened) return false
    for (const id of ids) {
      const option = await optionElement(id)
      if (!option) continue
      await wandClick(option)
      await wait(220)
    }
    await closeMenu(field)
    if (!multi) await wait(80)
    return true
  }

  const DROPDOWN_FIELDS = new Set([
    "niche",
    "strategy",
    "tactics",
    "audienceCountry",
    "creatorLocation",
    "creatorLanguage",
    "targetNetworks",
    "audienceTiers",
    "targetNiches",
    "minEngagement",
    "visibility",
    "commercialTerms",
    "commission",
    "formatQuantities",
    "formId",
  ])

  const INLINE_MULTI = new Set(["audienceAges"])
  const YES_NO = new Set(["recommendToMatching", "applicationCap"])
  const LIST_FIELDS = new Set(["doList", "dontList", "productCategories", "mandatoryHashtags"])

  const playField = async (key: string, value: unknown) => {
    setPulse(true)
    if (key === "contentFormats" || key === "objective" || key === "minFollowers" || key === "maxFollowers") {
      updateWizardDraft({ [key]: value })
      return
    }

    if (LIST_FIELDS.has(key) && Array.isArray(value)) {
      const host = fieldElement(key) || (key === "productCategories" ? fieldElement("productCategoriesInput") : null)
      if (host) await pointAtElement(host)
      const built: unknown[] = []
      for (const item of value) {
        built.push(item)
        setClicking(true)
        await wait(90)
        updateWizardDraft({ [key]: [...built] })
        await wait(140)
        setClicking(false)
        const latest = fieldElement(key)
        if (latest) {
          const rect = latest.getBoundingClientRect()
          setCursor({ x: rect.left + Math.min(48, rect.width / 2), y: rect.bottom - 18 })
        }
        await wait(480)
      }
      return
    }

    if (YES_NO.has(key) && typeof value === "boolean") {
      const host = fieldElement(key)
      if (host) await pointAtElement(host)
      const option = await optionElement(String(value))
      if (option) await wandClick(option)
      else updateWizardDraft({ [key]: value })
      return
    }

    if (INLINE_MULTI.has(key) && Array.isArray(value)) {
      const host = fieldElement(key)
      if (host) await pointAtElement(host)
      for (const item of value) {
        const option = await optionElement(String(item))
        if (option) await wandClick(option)
        await wait(180)
      }
      return
    }

    if (DROPDOWN_FIELDS.has(key)) {
      if (key === "commission" && value && typeof value === "object") {
        const mode = (value as { mode?: string }).mode
        if (mode) {
          const ok = await pickOptions(key, [mode], false)
          if (!ok) updateWizardDraft({ commission: value as never })
          else {
            const current = useCampaignStore.getState().wizardDraft.commission
            updateWizardDraft({ commission: { ...current, ...(value as object) } as never })
          }
          return
        }
      }
      if (Array.isArray(value)) {
        const ids = value.map((item) => (item && typeof item === "object" && "format" in item ? String((item as { format: string }).format) : String(item)))
        const ok = await pickOptions(key, ids, true)
        if (!ok) {
          const patch: Record<string, unknown> = { [key]: value }
          if (key === "formatQuantities") patch.contentFormats = ids
          updateWizardDraft(patch)
        }
        return
      }
      if (typeof value === "string" || typeof value === "number") {
        const ok = await pickOptions(key, [String(value)], false)
        if (!ok) updateWizardDraft({ [key]: value })
        return
      }
    }

    const target = fieldElement(key)
    if (target) await pointAtElement(target)

    if (typeof value === "string" && ["name", "description", "audienceNotes"].includes(key)) {
      const point = target ? target.getBoundingClientRect() : null
      const size = value.length > 90 ? 4 : 1
      const delay = value.length > 90 ? 14 : 26
      for (let index = size; index <= value.length; index += size) {
        const built = value.slice(0, index)
        updateWizardDraft({ [key]: built })
        if (point) setCursor({ x: point.left + Math.min(24 + built.length * 1.1, Math.max(point.width - 16, 24)), y: point.top + point.height / 2 })
        await wait(delay)
      }
      if (value.length % size) updateWizardDraft({ [key]: value })
      return
    }

    if (typeof value === "number" && value >= 20 && ["budget", "fixedFeePerPost", "perInfluencerFee", "maxInfluencers"].includes(key)) {
      if (target) await wandClick(target)
      const steps = 6
      for (let step = 1; step <= steps; step += 1) {
        updateWizardDraft({ [key]: Math.round((value * step) / steps) })
        await wait(45)
      }
      return
    }

    if (Array.isArray(value)) {
      const host = fieldElement(key)
      if (host) await pointAtElement(host)
      const built: unknown[] = []
      for (const item of value) {
        built.push(item)
        updateWizardDraft({ [key]: [...built] })
        await wait(420)
      }
      return
    }

    updateWizardDraft({ [key]: value })
    await wait(320)
  }

  const save = (status: "rascunho" | "aberta") => {
    if (saving || !draft.name?.trim() || !draft.strategy || !draft.visibility || !budgetReady(draft)) return
    if (status === "aberta" && !draft.termsAccepted) return
    setSaving(true)
    const { campaign, seeding } = buildPublishedCampaign(draft, user ?? {}, CREATORS, status)
    if (draft.formId) {
      useFormStore.getState().updateForm(draft.formId, { scope: "campaign", campaignId: campaign.id })
    }
    createCampaign(campaign)
    if (seeding) useSeedingStore.getState().createCampaign(seeding)
    resetWizard()
    router.push(`/campaigns/${campaign.id}`)
  }

  const advance = async () => {
    if (filling || reading) return
    const current = useCampaignStore.getState().wizardDraft
    if (step.id === "community" && current.reservedId) {
      updateWizardDraft({ communityLink: communityPath(organizationId, current.reservedId) })
    }
    let latest = useCampaignStore.getState().wizardDraft
    if (!canOpen(wizardStep + 1, wizardStep, latest)) return
    if (step.id === "website" && latest.aiAccompaniment) {
      const ready = await ensureResearch()
      if (!ready) return
      latest = useCampaignStore.getState().wizardDraft
    }
    const nextStep = stepByIndex(wizardStep + 1)
    const suggestion = latest.aiAccompaniment ? latest.research?.suggestion : undefined
    const entries = suggestion ? patchEntries(nextStep.id, suggestion, latest) : []
    if (entries.length) setFilling(true)
    setWizardStep(wizardStep + 1)
    if (!entries.length) return
    try {
      await wait(360)
      for (const [key, value] of entries) {
        await playField(String(key), value)
      }
    } finally {
      setCursor(null)
      setClicking(false)
      setFilling(false)
      setPulse(false)
      window.dispatchEvent(new CustomEvent("ai-close-menu", { detail: {} }))
    }
  }

  const resetForm = () => {
    if (filling || reading) return
    setCompany(null)
    setNote(null)
    setError(null)
    setCursor(null)
    setClicking(false)
    setPulse(false)
    setResearchDone(false)
    setSaving(false)
    window.dispatchEvent(new CustomEvent("ai-close-menu", { detail: {} }))
    resetWizard()
  }

  const hasDraft =
    wizardStep > 0 ||
    Boolean(
      draft.brandWebsite ||
        draft.name ||
        draft.strategy ||
        draft.aiAccompaniment ||
        draft.research ||
        draft.tactics?.length ||
        draft.visibility,
    )

  const icons: Record<WizardGroupId, typeof Flag> = {
    campanha: Flag,
    marketplace: Store,
    condicoes: Coins,
    briefing: FileText,
    convites: Mail,
  }

  return (
    <div className="relative min-h-full flex-1 bg-zinc-50">
      {cursor ? <MagicCursor x={cursor.x} y={cursor.y} clicking={clicking} /> : null}
      <div className={cn("mx-auto grid min-h-full content-center gap-8 px-4 py-8 lg:px-8", showRationale ? "max-w-7xl lg:grid-cols-[220px_minmax(0,1fr)_280px]" : "max-w-6xl lg:grid-cols-[240px_minmax(0,1fr)]")}>
        <aside className="space-y-3">
          {WIZARD_GROUPS.map((group) => {
            const percent = groupPercent(group.id, draft)
            const complete = percent >= 100
            const open = step.group === group.id
            const Icon = icons[group.id]
            return (
              <div key={group.id} className={cn("rounded-[22px] border bg-white p-3 shadow-sm", open ? "border-zinc-900" : "border-zinc-200")}>
                <button type="button" className="flex w-full items-center gap-3 text-left" onClick={() => goTo(stepIndex(WIZARD_STEPS.find((item) => item.group === group.id)?.id ?? "website"))}>
                  <span
                    key={complete ? "done" : "todo"}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full transition-colors",
                      complete ? "animate-in zoom-in-95 bg-emerald-500 text-white duration-300" : open ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500",
                    )}
                  >
                    {complete ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-zinc-900">{group.label}</span>
                    <span className={cn("block text-xs", complete ? "font-medium text-emerald-600" : "text-zinc-400")}>
                      {complete ? "Completo" : `${percent}% completo`}
                    </span>
                  </span>
                </button>
                <Progress
                  key={complete ? `${group.id}-done` : group.id}
                  value={percent}
                  aria-label={`${group.label}: ${percent}% completo`}
                  className={cn(
                    "mt-2.5 gap-0",
                    complete &&
                      "animate-in zoom-in-95 duration-500 [&_[data-slot=progress-indicator]]:bg-emerald-500 [&_[data-slot=progress-track]]:bg-emerald-100",
                  )}
                />
                {open ? (
                  <div className="mt-3 space-y-1 border-t border-zinc-100 pt-2">
                    {WIZARD_STEPS.filter((item) => item.group === group.id).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={cn("flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs", item.id === step.id ? "font-medium text-zinc-900" : "text-zinc-500")}
                        onClick={() => goTo(stepIndex(item.id))}
                      >
                        {item.title}
                        {stepDone(item.id, draft) ? <Check className="size-3.5 text-zinc-900" /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </aside>

        <div className="relative mx-auto w-full max-w-2xl">
          <div key={step.id} className="animate-in fade-in duration-300">
            {step.id === "preview" ? (
              <CampaignPreview draft={draft} form={linkedForm} />
            ) : (
              <WizardQuestion
                step={step.id}
                draft={draft}
                organizationId={organizationId}
                organizationName={user?.organizationName ?? ""}
                campaigns={campaigns}
                pulse={pulse}
                onChange={updateWizardDraft}
                onNext={advance}
                onClear={resetForm}
                canClear={hasDraft && !filling && !reading}
                filling={reading || filling}
              />
            )}
          </div>

          <div className="mt-6">
            {reading ? (
              <ResearchProgress active={reading} done={researchDone} website={draft.brandWebsite} />
            ) : step.id === "website" && (company || draft.research?.company) ? (
              <CompanyBrief
                company={company ?? draft.research!.company}
                suggestion={draft.research?.suggestion}
              />
            ) : (
              <Insight>
                {summary ? (
                  <>
                    <span className="font-semibold">Resumo. </span>
                    {summary}
                  </>
                ) : (
                  note ?? guide.card
                )}
              </Insight>
            )}
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          {hint ? <p className="mt-2 text-sm text-zinc-500">{hint}</p> : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => goTo(wizardStep - 1)} disabled={wizardStep === 0 || filling || reading}>
              Anterior
            </Button>
            <div className="flex flex-wrap items-center justify-end gap-3">
              {step.optional && step.id !== "website" ? (
                <Button type="button" variant="link" className="h-auto px-0" onClick={skip} disabled={filling}>Pular por agora</Button>
              ) : null}
              {step.id === "preview" ? (
                <>
                  <label className="flex items-center gap-2 text-sm text-zinc-700">
                    <Checkbox checked={Boolean(draft.termsAccepted)} onCheckedChange={(checked) => updateWizardDraft({ termsAccepted: checked === true })} />
                    Aceito os termos da campanha
                  </label>
                  <Button type="button" variant="outline" size="lg" onClick={() => save("rascunho")} disabled={saving || !draft.name?.trim() || !draft.strategy || !draft.visibility || !budgetReady(draft)}>
                    Salvar rascunho
                  </Button>
                  <Button type="button" size="lg" onClick={() => save("aberta")} disabled={saving || !draft.name?.trim() || !draft.strategy || !draft.visibility || !budgetReady(draft) || !draft.termsAccepted}>
                    Publicar
                  </Button>
                </>
              ) : (
                <Button type="button" size="lg" onClick={advance} disabled={!stepCanContinue(step.id, draft) || filling || reading}>
                  Próximo
                </Button>
              )}
            </div>
          </div>
        </div>

        {showRationale ? <AiRationalePanel rationale={rationale} /> : null}
      </div>
    </div>
  )
}
