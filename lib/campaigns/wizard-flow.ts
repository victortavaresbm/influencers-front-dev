import { applicationWindowValid, datesAreValid } from "@/lib/campaigns/shape"
import { WIZARD_GROUPS, WIZARD_STEPS, type WizardGroupId, type WizardStepId } from "@/lib/campaigns/wizard-steps"
import type { WizardDraft } from "@/lib/stores/campaigns"
import type { AutofillSuggestion } from "@/lib/campaigns/autofill"

export function stepIndex(id: WizardStepId) {
  return WIZARD_STEPS.findIndex((step) => step.id === id)
}

export function stepByIndex(index: number) {
  return WIZARD_STEPS[Math.min(Math.max(index, 0), WIZARD_STEPS.length - 1)]
}

/** Recomendação e teto só fazem sentido na vitrine — campanha secreta pula as duas. */
export function stepVisible(id: WizardStepId, draft: WizardDraft) {
  if ((id === "recommend" || id === "cap") && draft.visibility === "secreta") return false
  return true
}

export function nextStepIndex(from: number, draft: WizardDraft, direction: 1 | -1 = 1) {
  let index = from + direction
  while (index >= 0 && index < WIZARD_STEPS.length) {
    if (stepVisible(WIZARD_STEPS[index].id, draft)) return index
    index += direction
  }
  return Math.min(Math.max(from, 0), WIZARD_STEPS.length - 1)
}

function namedProducts(draft: WizardDraft) {
  return (draft.seedingProducts ?? []).filter((product) => product.name.trim())
}

export function budgetReady(draft: WizardDraft) {
  const terms = draft.commercialTerms ?? []
  if (terms.includes("fixo") && !(Number(draft.fixedFeePerPost) > 0)) return false
  if (terms.includes("permuta") && namedProducts(draft).length === 0) return false
  if (terms.includes("comissao")) {
    const modes = draft.commissionModes?.length
      ? draft.commissionModes
      : draft.commission?.mode
        ? [draft.commission.mode]
        : []
    if (!modes.length) return false
    if (modes.includes("contract")) return modes.length === 1
    if (modes.includes("percent") && !(Number(draft.commissionPercent ?? (draft.commission?.mode === "percent" ? draft.commission.value : undefined)) > 0)) {
      return false
    }
    if (modes.includes("fixed") && !(Number(draft.commissionFixed ?? (draft.commission?.mode === "fixed" ? draft.commission.value : undefined)) > 0)) {
      return false
    }
  }
  return true
}

/** Sem valor fixo, o teto começa como Não se aplica; o usuário ainda pode desmarcar. */
export function isBudgetNotApplicable(draft: WizardDraft) {
  if (draft.budgetNotApplicable !== undefined) return draft.budgetNotApplicable
  if (draft.budget != null || draft.maxInfluencers != null) return false
  return !(draft.commercialTerms ?? []).includes("fixo")
}

export function stepCanContinue(id: WizardStepId, draft: WizardDraft) {
  if (id === "identity") {
    return Boolean(draft.name?.trim()) && datesAreValid(draft.startDate, draft.endDate) && applicationWindowValid(draft)
  }
  if (id === "strategy") return Boolean(draft.strategy)
  if (id === "tactics") return Boolean(draft.tactics?.length)
  if (id === "creator") return Boolean(draft.targetNetworks?.length)
  if (id === "privacy") return Boolean(draft.visibility)
  if (id === "budget") return budgetReady(draft)
  return true
}

export function continueHint(id: WizardStepId, draft: WizardDraft) {
  if (id === "identity" && !draft.name?.trim()) return "Dê um nome à campanha"
  if (id === "identity" && !datesAreValid(draft.startDate, draft.endDate)) return "Ajuste as datas da campanha"
  if (id === "identity" && !applicationWindowValid(draft)) return "O período de candidatura precisa caber até o fim da campanha"
  if (id === "strategy" && !draft.strategy) return "Escolha a estratégia"
  if (id === "tactics" && !draft.tactics?.length) return "Escolha ao menos uma tática"
  if (id === "creator" && !draft.targetNetworks?.length) return "Escolha ao menos uma rede"
  if (id === "privacy" && !draft.visibility) return "Escolha quem pode ver a campanha"
  if (id === "budget" && !budgetReady(draft)) return "Complete os valores da condição comercial escolhida"
  return null
}

export function canOpen(index: number, current: number, draft: WizardDraft) {
  if (index <= current) return true
  for (let cursor = 0; cursor < index; cursor += 1) {
    const step = WIZARD_STEPS[cursor]
    if (!stepVisible(step.id, draft)) continue
    if (!step.optional && !stepCanContinue(step.id, draft)) return false
  }
  return true
}

function skipped(draft: WizardDraft, id: WizardStepId) {
  return (draft.skippedSteps ?? []).includes(id)
}

export function stepDone(id: WizardStepId, draft: WizardDraft) {
  if (id === "preview") return false
  if (!stepVisible(id, draft)) return true
  if (skipped(draft, id)) return true
  if (id === "website") return Boolean(draft.brandWebsite?.trim())
  if (id === "identity") return Boolean(draft.name?.trim())
  if (id === "strategy") return Boolean(draft.strategy)
  if (id === "tactics") return Boolean(draft.tactics?.length)
  if (id === "audience") return Boolean(draft.audienceCountry || draft.audienceAges?.length)
  if (id === "creator") return Boolean(draft.targetNetworks?.length)
  if (id === "privacy") return Boolean(draft.visibility)
  if (id === "recommend") return draft.recommendToMatching !== undefined
  if (id === "cap") return draft.applicationCap !== undefined
  if (id === "community") return Boolean(draft.communityLink) || skipped(draft, id)
  if (id === "terms") return Boolean(draft.commercialTerms?.length)
  if (id === "budget") return Boolean(draft.budget || draft.fixedFeePerPost || draft.maxInfluencers || draft.commission)
  if (id === "brief") return Boolean(draft.description?.trim() || draft.productCategories?.length)
  if (id === "scope") return Boolean(draft.formatQuantities?.length || draft.contentFormats?.length || draft.targetNetworks?.length)
  if (id === "metrics") return Boolean(draft.successTargets?.length || draft.mandatoryHashtags?.length)
  if (id === "invites") return Boolean(draft.inviteIds?.length)
  return false
}

export function groupPercent(group: WizardGroupId, draft: WizardDraft) {
  const steps = WIZARD_STEPS.filter((step) => step.group === group && step.id !== "preview" && stepVisible(step.id, draft))
  if (!steps.length) return 0
  const done = steps.filter((step) => stepDone(step.id, draft)).length
  return Math.round((done / steps.length) * 100)
}

export function groupLabel(group: WizardGroupId) {
  return WIZARD_GROUPS.find((item) => item.id === group)?.label ?? group
}

const STEP_KEYS: Record<WizardStepId, (keyof AutofillSuggestion)[]> = {
  website: ["brandWebsite"],
  identity: ["name", "niches"],
  strategy: [],
  tactics: ["tactics"],
  audience: ["audienceCountry", "audienceAges"],
  creator: ["targetNiches", "targetNetworks", "creatorLocation", "creatorLanguage", "audienceNotes", "audienceTiers", "minEngagement", "minFollowers", "maxFollowers"],
  privacy: ["visibility"],
  recommend: ["recommendToMatching"],
  cap: ["applicationCap"],
  community: [],
  terms: ["commercialTerms"],
  budget: [],
  brief: ["description", "doList", "dontList", "productCategories"],
  scope: ["formatQuantities", "contentFormats"],
  metrics: ["successTargets", "mandatoryHashtags", "mandatoryMentions"],
  invites: [],
  preview: [],
}

function emptyValue(value: unknown) {
  if (value === undefined || value === null || value === "") return true
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function patchForStep(id: WizardStepId, suggestion: AutofillSuggestion, draft: WizardDraft) {
  const patch: Partial<WizardDraft> = {}
  for (const key of STEP_KEYS[id]) {
    const next = suggestion[key]
    if (next === undefined || !emptyValue(draft[key as keyof WizardDraft])) continue
    Object.assign(patch, { [key]: next })
  }
  return patch
}

export function suggestionTouches(id: WizardStepId, suggestion: AutofillSuggestion, draft: WizardDraft) {
  return Object.keys(patchForStep(id, suggestion, draft)).length > 0
}

export function patchEntries(id: WizardStepId, suggestion: AutofillSuggestion, draft: WizardDraft) {
  const patch = patchForStep(id, suggestion, draft) as Record<string, unknown>
  return STEP_KEYS[id]
    .filter((key) => patch[key] !== undefined)
    .map((key) => [key, patch[key]] as const)
}
