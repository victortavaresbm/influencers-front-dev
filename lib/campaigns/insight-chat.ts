import type { AutofillSuggestion, CompanyProfile } from "@/lib/campaigns/autofill"
import type { StepRationale } from "@/lib/campaigns/ai-rationale"
import { WIZARD_STEPS, type WizardStepId } from "@/lib/campaigns/wizard-steps"
import type { WizardDraft } from "@/lib/stores/campaigns"

export type InsightChatMessage = {
  role: "user" | "assistant"
  content: string
}

/** Remove payloads pesados (ex.: data-URL do banner) do contexto enviado à IA. */
export function compactWizardContext(draft: WizardDraft) {
  const {
    coverImage,
    research,
    storeProducts,
    seedingProducts,
    ...rest
  } = draft
  return {
    ...rest,
    coverImage: coverImage ? "[banner definido]" : undefined,
    storeProducts: storeProducts?.map((item) => ({
      name: item.name,
      priceLabel: item.priceLabel,
    })),
    seedingProducts: seedingProducts?.map((item) => ({
      name: item.name,
      variants: item.variants,
    })),
    research: research
      ? {
          website: research.website,
          company: research.company,
          suggestion: research.suggestion
            ? {
                ...research.suggestion,
                // notes já entram via insight da etapa; evita payload enorme
                notes: undefined,
              }
            : undefined,
        }
      : undefined,
  }
}

export function insightChatSystemPrompt() {
  return [
    "Você é o copiloto estratégico do Acompanhamento com IA na criação de campanhas.",
    "O usuário está no wizard e quer entender por que certas decisões foram (ou não) tomadas e qual a linha de criação da campanha.",
    "",
    "Regras:",
    "- Responda em português do Brasil, claro e direto (2–6 frases, salvo se pedirem detalhe).",
    "- Baseie-se só no contexto enviado (dossiê da marca, plano sugerido, draft atual, insight da etapa).",
    "- Explique o Elo → Evidência → Efeito: por que encaixa nesta marca/objetivo e por que alternativas ficaram de fora.",
    "- Não invente cifras de orçamento, metas numéricas, CPM, ROI ou produtos que não estejam no contexto.",
    "- Não use IDs técnicos nem underscores (ex.: publipost → Publi Post; ecommerce_d2c → e-commerce próprio).",
    "- Não altere a campanha: você só explica e aconselha. Se faltar dado, diga o que falta.",
    "- Se a pergunta for fora do tema da campanha, redirecione com educação para a criação da campanha.",
  ].join("\n")
}

export function buildInsightChatUserPayload(input: {
  stepId: WizardStepId
  message: string
  draft: WizardDraft
  company?: CompanyProfile | null
  suggestion?: AutofillSuggestion
  rationale?: StepRationale | null
  history?: InsightChatMessage[]
}) {
  const step = WIZARD_STEPS.find((item) => item.id === input.stepId)
  return {
    currentStep: {
      id: input.stepId,
      title: step?.title ?? input.stepId,
      group: step?.group,
    },
    question: input.message,
    company: input.company
      ? {
          name: input.company.name,
          summary: input.company.summary,
          products: input.company.products,
          porte: input.company.porte,
          modeloNegocio: input.company.modeloNegocio,
          abrangencia: input.company.abrangencia,
          ticketMedio: input.company.ticketMedio,
          recorrencia: input.company.recorrencia,
          tomDeVoz: input.company.tomDeVoz,
          diferenciais: input.company.diferenciais,
          recommendedStrategy: input.company.recommendedStrategy,
          source: input.company.source,
        }
      : null,
    draft: compactWizardContext(input.draft),
    suggestionNotes: input.suggestion?.notes?.[input.stepId] ?? null,
    insight: input.rationale
      ? {
          title: input.rationale.title,
          lead: input.rationale.lead,
          points: input.rationale.points,
        }
      : null,
    recentHistory: (input.history ?? []).slice(-8),
  }
}
