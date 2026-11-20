export const WIZARD_STEPS = [
  { id: "website", group: "campanha", title: "Site da marca", optional: true },
  { id: "identity", group: "campanha", title: "Identificação", optional: false },
  { id: "strategy", group: "campanha", title: "Estratégia", optional: false },
  { id: "tactics", group: "campanha", title: "Tática", optional: false },
  { id: "audience", group: "campanha", title: "Público", optional: true },
  { id: "creator", group: "campanha", title: "Creator ideal", optional: true },
  { id: "privacy", group: "marketplace", title: "Privacidade", optional: false },
  { id: "recommend", group: "marketplace", title: "Recomendação", optional: true },
  { id: "cap", group: "marketplace", title: "Teto de candidaturas", optional: true },
  { id: "community", group: "marketplace", title: "Vínculo da comunidade", optional: true },
  { id: "terms", group: "condicoes", title: "Condições comerciais", optional: true },
  { id: "budget", group: "condicoes", title: "Orçamento", optional: false },
  { id: "brief", group: "briefing", title: "Briefing", optional: true },
  { id: "scope", group: "briefing", title: "Escopo", optional: true },
  { id: "metrics", group: "briefing", title: "Métricas", optional: true },
  { id: "invites", group: "convites", title: "Convites", optional: true },
  { id: "preview", group: "convites", title: "Revisão", optional: false },
] as const

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"]

export const WIZARD_GROUPS = [
  { id: "campanha", label: "Campanha" },
  { id: "marketplace", label: "Marketplace" },
  { id: "condicoes", label: "Condições" },
  { id: "briefing", label: "Briefing" },
  { id: "convites", label: "Convites" },
] as const

export type WizardGroupId = (typeof WIZARD_GROUPS)[number]["id"]
