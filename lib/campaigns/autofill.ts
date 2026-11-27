import { TIERS, type AudienceTierId } from "@/lib/audience-tiers"
import { guidelinesPrompt, strategicDoctrinePrompt } from "@/lib/campaigns/wizard-guidelines"
import {
  AGE_RANGES,
  LANGUAGES,
  NICHES,
  NICHE_CATALOG,
  normalizeNicheId,
  normalizeNicheList,
  nicheLabel,
  snapMinEngagement,
  type NicheId,
} from "@/lib/campaigns/shape"
import type {
  CampaignStrategy,
  CampaignTactic,
  CampaignVisibility,
  CommercialTerm,
  CommissionMode,
  ContentFormat,
  SocialNetwork,
} from "@/lib/mock-data/campaigns"

const STRATEGIES = new Set<CampaignStrategy>(["alcance", "engajamento", "vendas"])
const TACTICS = new Set<CampaignTactic>(["publipost", "live", "link", "cupom"])
const TERMS = new Set<CommercialTerm>(["fixo", "permuta", "comissao"])
const VISIBILITY = new Set<CampaignVisibility>(["publica", "privada", "secreta"])
const FORMATS = new Set<ContentFormat>(["reels", "stories", "feed", "tiktok", "youtube", "shorts", "live"])
const NETWORKS = new Set<SocialNetwork>(["instagram", "tiktok", "youtube"])
const COMMISSION = new Set<CommissionMode>(["percent", "fixed", "contract"])
const METRICS = new Set([
  "views",
  "reach",
  "engaged_views",
  "crossposted_views",
  "watch_time",
  "avg_watch",
  "completion",
  "skip_rate",
  "likes",
  "comments",
  "saves",
  "shares",
  "reposts",
  "replies",
  "interactions",
  "playlist_adds",
  "card_clicks",
  "follows",
  "profile_visits",
  "bio_link_clicks",
  "story_link_clicks",
  "call_clicks",
  "direction_clicks",
  "email_clicks",
  "text_clicks",
  "app_download_clicks",
  "leads",
  "tracked_link_clicks",
  "coupon_uses",
  "orders",
  "revenue",
])
const TIERS_IDS = new Set<AudienceTierId>(["nano", "micro", "mid", "macro", "mega"])
const PORTES = new Set(["pequena", "media", "grande"] as const)
const MODELOS = new Set(["ecommerce_d2c", "marketplace", "app_saas", "servico_b2b", "negocio_local", "institucional"] as const)
const ABRANGENCIAS = new Set(["local", "regional", "nacional", "global_br"] as const)
const TICKETS = new Set(["baixo", "medio", "alto"] as const)
const RECORRENCIAS = new Set(["alta", "media", "baixa"] as const)

export type BrandPorte = "pequena" | "media" | "grande"
export type BrandModelo =
  | "ecommerce_d2c"
  | "marketplace"
  | "app_saas"
  | "servico_b2b"
  | "negocio_local"
  | "institucional"
export type BrandAbrangencia = "local" | "regional" | "nacional" | "global_br"
export type BrandTicket = "baixo" | "medio" | "alto"
export type BrandRecorrencia = "alta" | "media" | "baixa"

export interface CompanyProfile {
  name: string
  summary: string
  products: string[]
  source: string
  porte?: BrandPorte
  modeloNegocio?: BrandModelo
  abrangencia?: BrandAbrangencia
  ticketMedio?: BrandTicket
  recorrencia?: BrandRecorrencia
  tomDeVoz?: string
  diferenciais?: string[]
  /** Só consultoria — nunca copiar para suggestion.strategy. */
  recommendedStrategy?: CampaignStrategy
}

export interface CompanyResearch {
  website: string
  company: CompanyProfile
  suggestion: AutofillSuggestion
}

export interface AutofillSuggestion {
  brandWebsite?: string
  name?: string
  niche?: string
  niches?: NicheId[]
  startDate?: string
  endDate?: string
  applicationStart?: string
  applicationEnd?: string
  strategy?: CampaignStrategy
  objective?: string
  tactics?: CampaignTactic[]
  audienceCountry?: string
  audienceAges?: string[]
  targetNiches?: string[]
  targetNetworks?: SocialNetwork[]
  creatorLocation?: string
  creatorLanguage?: string
  audienceNotes?: string
  minEngagement?: number
  minFollowers?: number
  maxFollowers?: number
  audienceTiers?: AudienceTierId[]
  visibility?: CampaignVisibility
  recommendToMatching?: boolean
  applicationCap?: number
  commercialTerms?: CommercialTerm[]
  fixedFeePerPost?: number
  commission?: { mode: CommissionMode; value?: number; notes?: string }
  budget?: number
  maxInfluencers?: number
  perInfluencerFee?: number | "contact"
  description?: string
  doList?: string[]
  dontList?: string[]
  productCategories?: string[]
  formatQuantities?: { format: ContentFormat; quantity: number }[]
  contentFormats?: ContentFormat[]
  successTargets?: { metric: string; target: number }[]
  mandatoryHashtags?: string[]
  mandatoryMentions?: { network: SocialNetwork; handle: string }[]
  notes?: Partial<Record<string, string>>
}

/** Campos que a IA nunca deve aplicar no formulário (Human-in-the-Loop). */
const BLOCKED_SUGGESTION_KEYS = [
  "strategy",
  "objective",
  "startDate",
  "endDate",
  "applicationStart",
  "applicationEnd",
  "fixedFeePerPost",
  "commission",
  "budget",
  "maxInfluencers",
  "perInfluencerFee",
] as const satisfies readonly (keyof AutofillSuggestion)[]

function text(value: unknown, max = 280) {
  if (typeof value !== "string") return undefined
  const clean = value.trim()
  if (!clean) return undefined
  return clean.slice(0, max)
}

function date(value: unknown) {
  const clean = text(value, 10)
  if (!clean || !/^\d{4}-\d{2}-\d{2}$/.test(clean)) return undefined
  return clean
}

function number(value: unknown, max = 100_000_000) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) return undefined
  return parsed
}

function strings(value: unknown, allowed?: Set<string>, max = 8) {
  if (!Array.isArray(value)) return undefined
  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item && (!allowed || allowed.has(item)))
    .slice(0, max)
  return items.length ? items : undefined
}

function enumOf<T extends string>(value: unknown, allowed: Set<T>): T | undefined {
  if (typeof value !== "string") return undefined
  const clean = value.trim() as T
  return allowed.has(clean) ? clean : undefined
}

export function sanitizeSuggestion(raw: unknown): AutofillSuggestion {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const suggestion: AutofillSuggestion = {}
  suggestion.brandWebsite = text(source.brandWebsite, 200)
  suggestion.name = text(source.name, 90)
  const nichesFromArray = normalizeNicheList(
    Array.isArray(source.niches)
      ? source.niches.filter((item): item is string => typeof item === "string")
      : undefined,
    3,
  )
  const nicheSingle = typeof source.niche === "string" ? normalizeNicheId(source.niche) : undefined
  const niches = nichesFromArray.length ? nichesFromArray : nicheSingle ? [nicheSingle] : []
  if (niches.length) {
    suggestion.niches = niches
    suggestion.niche = niches.join(" · ")
  }
  suggestion.startDate = date(source.startDate)
  suggestion.endDate = date(source.endDate)
  suggestion.applicationStart = date(source.applicationStart)
  suggestion.applicationEnd = date(source.applicationEnd)
  if (typeof source.strategy === "string" && STRATEGIES.has(source.strategy as CampaignStrategy)) {
    suggestion.strategy = source.strategy as CampaignStrategy
  }
  suggestion.objective = text(source.objective, 180)
  suggestion.tactics = strings(source.tactics, TACTICS) as CampaignTactic[] | undefined
  suggestion.audienceCountry = text(source.audienceCountry, 80)
  suggestion.audienceAges = strings(
    Array.isArray(source.audienceAges)
      ? source.audienceAges.map((item) => (typeof item === "string" ? item.replace(/[–—]/g, "-").replace(/\s/g, "") : item))
      : source.audienceAges,
    new Set(AGE_RANGES),
  )
  suggestion.targetNiches = normalizeNicheList(
    Array.isArray(source.targetNiches)
      ? source.targetNiches.filter((item): item is string => typeof item === "string")
      : undefined,
    4,
  )
  suggestion.targetNetworks = strings(source.targetNetworks, NETWORKS) as SocialNetwork[] | undefined
  suggestion.creatorLocation = text(source.creatorLocation, 80)
  const language = text(source.creatorLanguage, 40)
  if (language && LANGUAGES.includes(language)) suggestion.creatorLanguage = language
  suggestion.audienceNotes = text(source.audienceNotes, 240)
  const rawEngagement = number(source.minEngagement, 100)
  suggestion.minEngagement = rawEngagement === undefined ? undefined : snapMinEngagement(rawEngagement)
  suggestion.minFollowers = number(source.minFollowers)
  suggestion.maxFollowers = number(source.maxFollowers)
  suggestion.audienceTiers = strings(source.audienceTiers, TIERS_IDS) as AudienceTierId[] | undefined
  if (typeof source.visibility === "string" && VISIBILITY.has(source.visibility as CampaignVisibility)) {
    suggestion.visibility = source.visibility as CampaignVisibility
  }
  if (typeof source.recommendToMatching === "boolean") suggestion.recommendToMatching = source.recommendToMatching
  suggestion.applicationCap = number(source.applicationCap, 100000)
  suggestion.commercialTerms = strings(source.commercialTerms, TERMS) as CommercialTerm[] | undefined
  suggestion.fixedFeePerPost = number(source.fixedFeePerPost)
  if (source.commission && typeof source.commission === "object") {
    const commission = source.commission as Record<string, unknown>
    if (typeof commission.mode === "string" && COMMISSION.has(commission.mode as CommissionMode)) {
      suggestion.commission = {
        mode: commission.mode as CommissionMode,
        value: number(commission.value, 1_000_000),
        notes: text(commission.notes, 400),
      }
    }
  }
  suggestion.budget = number(source.budget)
  suggestion.maxInfluencers = number(source.maxInfluencers, 100000)
  if (source.perInfluencerFee === "contact") suggestion.perInfluencerFee = "contact"
  else suggestion.perInfluencerFee = number(source.perInfluencerFee)
  suggestion.description = text(source.description, 2000)
  suggestion.doList = strings(source.doList, undefined, 6)
  suggestion.dontList = strings(source.dontList, undefined, 6)
  suggestion.productCategories = strings(source.productCategories, undefined, 8)
  if (Array.isArray(source.formatQuantities)) {
    const quantities = source.formatQuantities
      .map((item) => {
        if (!item || typeof item !== "object") return null
        const row = item as Record<string, unknown>
        if (typeof row.format !== "string" || !FORMATS.has(row.format as ContentFormat)) return null
        const quantity = number(row.quantity, 50)
        if (!quantity) return null
        return { format: row.format as ContentFormat, quantity }
      })
      .filter((item): item is { format: ContentFormat; quantity: number } => Boolean(item))
      .slice(0, 7)
    if (quantities.length) suggestion.formatQuantities = quantities
  }
  suggestion.contentFormats = strings(source.contentFormats, FORMATS) as ContentFormat[] | undefined
  if (Array.isArray(source.successTargets)) {
    const targets = source.successTargets
      .map((item) => {
        if (!item || typeof item !== "object") return null
        const row = item as Record<string, unknown>
        if (typeof row.metric !== "string" || !METRICS.has(row.metric)) return null
        const target = number(row.target)
        if (target === undefined) return null
        // target 0 = só marcar o KPI, sem meta numérica inventada
        return { metric: row.metric, target }
      })
      .filter((item): item is { metric: string; target: number } => Boolean(item))
      .slice(0, 8)
    if (targets.length) suggestion.successTargets = targets
  }
  const hashtags = strings(source.mandatoryHashtags)?.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
  if (hashtags?.length) suggestion.mandatoryHashtags = hashtags.slice(0, 6)
  if (Array.isArray(source.mandatoryMentions)) {
    const mentions = source.mandatoryMentions
      .map((item) => {
        if (!item || typeof item !== "object") return null
        const row = item as Record<string, unknown>
        if (typeof row.network !== "string" || !NETWORKS.has(row.network as SocialNetwork)) return null
        const handle = text(row.handle, 40)
        if (!handle) return null
        return { network: row.network as SocialNetwork, handle: handle.startsWith("@") ? handle : `@${handle}` }
      })
      .filter((item): item is { network: SocialNetwork; handle: string } => Boolean(item))
      .slice(0, 4)
    if (mentions.length) suggestion.mandatoryMentions = mentions
  }
  if (source.notes && typeof source.notes === "object") {
    const notes: Record<string, string> = {}
    for (const [key, value] of Object.entries(source.notes as Record<string, unknown>)) {
      const clean = text(value, 320)
      if (clean) notes[key] = clean
    }
    if (Object.keys(notes).length) suggestion.notes = notes
  }
  if (!suggestion.formatQuantities?.length && suggestion.contentFormats?.length) {
    suggestion.formatQuantities = suggestion.contentFormats.map((format) => ({ format, quantity: 1 }))
  }
  // Trava: comissão sem link/cupom
  if (
    suggestion.commercialTerms?.includes("comissao") &&
    !(suggestion.tactics?.includes("link") || suggestion.tactics?.includes("cupom"))
  ) {
    suggestion.commercialTerms = suggestion.commercialTerms.filter((term) => term !== "comissao")
  }
  if (suggestion.commercialTerms && suggestion.commercialTerms.length === 0) delete suggestion.commercialTerms
  return stripBlockedFields(suggestion)
}

/** Remove do plano campos que a IA não pode preencher no formulário. */
export function stripBlockedFields(suggestion: AutofillSuggestion): AutofillSuggestion {
  const next = { ...suggestion }
  for (const key of BLOCKED_SUGGESTION_KEYS) {
    delete next[key]
  }
  return next
}

export function sanitizeCompany(raw: unknown, source: string, fallbackName: string): CompanyProfile | null {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const name = text(record.name, 80) || fallbackName
  const summary = text(record.summary, 900)
  if (!summary) return null
  const products = strings(record.products, undefined, 6) ?? []
  const company: CompanyProfile = { name, summary, products, source }
  company.porte = enumOf(record.porte, PORTES)
  company.modeloNegocio = enumOf(record.modeloNegocio, MODELOS)
  company.abrangencia = enumOf(record.abrangencia, ABRANGENCIAS)
  company.ticketMedio = enumOf(record.ticketMedio, TICKETS)
  company.recorrencia = enumOf(record.recorrencia, RECORRENCIAS)
  company.tomDeVoz = text(record.tomDeVoz, 160)
  company.diferenciais = strings(record.diferenciais, undefined, 6)
  if (typeof record.recommendedStrategy === "string" && STRATEGIES.has(record.recommendedStrategy as CampaignStrategy)) {
    company.recommendedStrategy = record.recommendedStrategy as CampaignStrategy
  }
  return company
}

export function websiteKey(value?: string) {
  const trimmed = value?.trim() ?? ""
  if (!trimmed) return ""
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
    return `${url.hostname.replace(/^www\./, "").toLowerCase()}${url.pathname.replace(/\/$/, "")}`
  } catch {
    return trimmed.toLowerCase()
  }
}

const NICHE_HINTS: { niche: NicheId; pattern: RegExp }[] = [
  { niche: "beleza", pattern: /beleza|maquiagem|perfume|cosm[eé]tic|skincare|cabelo|hidrat|batom|dermocosm|pele|s[eé]rum|cleanser|protetor solar|makeup/i },
  { niche: "saude-bem-estar", pattern: /farm[aá]cia|drogaria|suplement|vitamina|sa[uú]de|cl[ií]nica|autocuidado|bem[- ]?estar|mental/i },
  { niche: "fitness", pattern: /fitness|academia|treino|esporte|corrida|performance|whey|nutri[cç][aã]o esportiva/i },
  { niche: "moda", pattern: /moda|roupa|vestu[aá]rio|cal[cç]ado|acess[oó]rio|streetwear|[oó]tica|j[oó]ia/i },
  { niche: "gastronomia", pattern: /gastronom|comida|restaurante|receita|alimento|bebida|cafeteria|delivery|mercado/i },
  { niche: "lifestyle", pattern: /lifestyle|rotina|dia a dia|papelaria|presente|conveni[eê]ncia|consumo di[aá]rio/i },
  { niche: "casa-decoracao", pattern: /m[oó]ve|decora|casa|reforma|eletro|cama.?mesa|organiza[cç]|arquitetura|diy/i },
  { niche: "maternidade-familia", pattern: /maternidade|gestante|beb[eê]|infantil|brinquedo|puericultura|fam[ií]lia|crian[cç]/i },
  // Pets: só evidência de oferta PARA animais — nunca vegan/cruelty-free humano
  { niche: "pets", pattern: /pet[- ]?shop|\bpets?\b(?!\s*friendly)|ra[cç][aã]o(?:\s+para)?\s*(c[aã]es|gatos|pets?)|veterin[aá]ri|cachorro|c[aã]es\b|gato(?:s)?\b|animal(?:ais)? de estima|coleira|arranhador|pet\s*food|banho\s*e\s*tosa/i },
  { niche: "tecnologia", pattern: /tecnologia|software|eletr[oô]nic|celular|gadget|saas|app\b|intelig[eê]ncia artificial|\bia\b/i },
  { niche: "games", pattern: /game|jogo|gamer|console|e-?sports|perif[eé]rico gamer/i },
  { niche: "financas-negocios", pattern: /finan[cç]|banco|fintech|invest|contabil|b2b|empreendedor|carreira|cr[eé]dito/i },
  { niche: "educacao", pattern: /educa[cç]|curso|idioma|edtech|faculdade|infoproduto|editora|escola/i },
  { niche: "viagem", pattern: /viagem|turismo|hotel|destino|a[eé]rea|mala|parque/i },
  { niche: "automotivo", pattern: /automot|carro|moto|concession[aá]ria|autope[cç]|mobilidade|est[eé]tica automotiva/i },
  { niche: "cultura-entretenimento", pattern: /humor|com[eé]dia|festival|streaming|teatro|cinema|m[uú]sica|evento|entretenimento/i },
]

/** Combinações típicas: não forçar a marca em um único nicho. */
const NICHE_COMBOS: { pattern: RegExp; niches: NicheId[] }[] = [
  { pattern: /farm[aá]cia|drogaria|dermocosm/i, niches: ["saude-bem-estar", "beleza"] },
  { pattern: /suplement|whey|nutri[cç][aã]o esportiva/i, niches: ["fitness", "saude-bem-estar"] },
  // Skincare/cosmética vegana ou cruelty-free = beleza humana, NÃO pets
  { pattern: /(vegan|vegano|cruelty|n[aã]o testad|clean beauty).{0,80}(skin|pele|cosm|beleza|skincare|maquiagem)|(skin|pele|cosm|skincare).{0,80}(vegan|vegano|cruelty)/i, niches: ["beleza"] },
  { pattern: /eletrodom[eé]stico|casa inteligente|smart home/i, niches: ["casa-decoracao", "tecnologia"] },
  { pattern: /brinquedo|moda infantil|puericultura|gestante/i, niches: ["maternidade-familia", "moda"] },
  { pattern: /festival|show\b|bar\b|teatro/i, niches: ["cultura-entretenimento", "gastronomia"] },
  { pattern: /pet[- ]?shop|ra[cç][aã]o\s+(para\s+)?(c[aã]es|gatos|pets?)|veterin[aá]ri|banho\s*e\s*tosa/i, niches: ["pets"] },
  { pattern: /fintech|banco digital|contabil/i, niches: ["financas-negocios", "tecnologia"] },
  { pattern: /edtech|curso online|infoproduto/i, niches: ["educacao", "tecnologia"] },
  { pattern: /academia|roupa fitness/i, niches: ["fitness", "moda"] },
  { pattern: /hotel|turismo|companhia a[eé]rea/i, niches: ["viagem", "lifestyle"] },
]

/** Evidência real de oferta pet (produto/serviço para animais). */
const PET_PRODUCT_EVIDENCE =
  /pet[- ]?shop|\bpets?\b(?!\s*friendly)|ra[cç][aã]o(?:\s+para)?\s*(c[aã]es|gatos|pets?)|veterin[aá]ri|cachorro|c[aã]es\b|gatos?\b|animal(?:ais)? de estima|coleira|arranhador|pet\s*food|banho\s*e\s*tosa|pet\s*care|para\s+(o\s+)?seu\s+pet/i

/** Discurso ético humano que NÃO autoriza nicho pets. */
const HUMAN_ETHICS_NOISE =
  /cruelty[- ]?free|n[aã]o testad[oa]s?\s+em\s+animais|livre de crueldade|vegano|vegan|sem crueldade|amig[aá]vel\s+(aos|com)\s+animais|animal[- ]?friendly|clean beauty|n[aã]o\s+testamos\s+em\s+animais/i

function companyNicheBlob(company: CompanyProfile, siteText = "") {
  return `${company.name} ${company.summary} ${company.products.join(" ")} ${(company.diferenciais ?? []).join(" ")} ${siteText.slice(0, 5000)}`
}

/** Remove nichos sem evidência de catálogo — ex.: pets por vegan/cruelty-free. */
function sanitizeInferredNiches(niches: NicheId[], company: CompanyProfile, siteText = ""): NicheId[] {
  const blob = companyNicheBlob(company, siteText)
  const cleaned = niches.filter((niche) => {
    if (niche !== "pets") return true
    // Se só há discurso ético humano e não há oferta pet, descarta pets
    if (!PET_PRODUCT_EVIDENCE.test(blob)) return false
    // Ainda assim: se o "match" pet veio só de ruído ético, rejeita
    const withoutEthics = blob.replace(HUMAN_ETHICS_NOISE, " ")
    return PET_PRODUCT_EVIDENCE.test(withoutEthics)
  })
  if (cleaned.length) return normalizeNicheList(cleaned, 3)
  // Fallback: skincare/cosmética → beleza
  if (/skin|pele|cosm|beleza|maquiagem|s[eé]rum|dermocosm/i.test(blob)) return ["beleza"]
  return ["lifestyle"]
}

function inferNiche(company: CompanyProfile, siteText = ""): NicheId | undefined {
  const blob = companyNicheBlob(company, siteText)
  return NICHE_HINTS.find((item) => item.pattern.test(blob))?.niche
}

function inferNiches(company: CompanyProfile, primary: NicheId, siteText = ""): NicheId[] {
  const blob = companyNicheBlob(company, siteText)
  const combo = NICHE_COMBOS.find((item) => item.pattern.test(blob))
  if (combo) return sanitizeInferredNiches(normalizeNicheList(combo.niches, 3), company, siteText)

  const found = NICHE_HINTS.filter((item) => item.pattern.test(blob)).map((item) => item.niche)
  const niches = [primary, ...found.filter((item) => item !== primary)]
  if (
    niches.length < 3 &&
    !niches.includes("lifestyle") &&
    /rotina|dia a dia|consumo|presente|papelaria|conveni/i.test(blob)
  ) {
    niches.push("lifestyle")
  }
  return sanitizeInferredNiches(normalizeNicheList(niches, 3), company, siteText)
}

export function enrichCompany(company: CompanyProfile, website: string, siteText: string): CompanyProfile {
  const blob = `${company.summary} ${company.products.join(" ")} ${siteText.slice(0, 6000)}`
  const next = { ...company }
  if (!next.modeloNegocio) {
    if (/carrinho|checkout|comprar|add to cart|loja online|e-?commerce/i.test(blob)) next.modeloNegocio = "ecommerce_d2c"
    else if (/baixar o app|download.*app|assinatura|saas|software/i.test(blob)) next.modeloNegocio = "app_saas"
    else if (/whatsapp|agende|unidade|endere[cç]o|restaurante|cl[ií]nica|loja f[ií]sica/i.test(blob)) next.modeloNegocio = "negocio_local"
    else if (/or[cç]amento|b2b|para empresas|solu[cç][aã]o corporativa/i.test(blob)) next.modeloNegocio = "servico_b2b"
    else if (/marketplace|multimarca|vitrine de marcas/i.test(blob)) next.modeloNegocio = "marketplace"
    else next.modeloNegocio = "institucional"
  }
  if (!next.abrangencia) {
    if (next.modeloNegocio === "negocio_local") next.abrangencia = "local"
    else if (/\.com\.br|brasil|entrega (para )?todo|frete nacional/i.test(`${website} ${blob}`)) next.abrangencia = "nacional"
    else if (/global|worldwide|international/i.test(blob)) next.abrangencia = "global_br"
    else next.abrangencia = "nacional"
  }
  if (!next.porte) {
    if (/investidor|imprensa|franchise|franquia|app pr[oó]prio|enterprise|líder/i.test(blob)) next.porte = "grande"
    else if (/cole[cç][oã]es|linha completa|expans/i.test(blob)) next.porte = "media"
    else next.porte = "pequena"
  }
  if (!next.ticketMedio) {
    if (/consultiv|premium|luxo|alto valor|especialista/i.test(blob)) next.ticketMedio = "alto"
    else if (/impuls|acess[ií]vel|promo/i.test(blob)) next.ticketMedio = "baixo"
    else next.ticketMedio = "medio"
  }
  if (!next.recorrencia) {
    if (/assinatura|refil|mensal|skincare|suplement/i.test(blob)) next.recorrencia = "alta"
    else if (/sazonal|cole[cç][aã]o|edi[cç][aã]o limitada/i.test(blob)) next.recorrencia = "media"
    else next.recorrencia = "baixa"
  }
  if (!next.recommendedStrategy) {
    if (next.modeloNegocio === "ecommerce_d2c" || next.modeloNegocio === "app_saas" || next.modeloNegocio === "marketplace") {
      next.recommendedStrategy = "vendas"
    } else if (next.recorrencia === "alta") {
      next.recommendedStrategy = "engajamento"
    } else {
      next.recommendedStrategy = "alcance"
    }
  }
  return next
}

function inferCountry(website: string, summary: string, abrangencia?: BrandAbrangencia) {
  if (abrangencia === "nacional" || abrangencia === "global_br") return "Brasil"
  const host = websiteKey(website)
  if (host.endsWith(".br") || /brasil|brazil/i.test(summary)) return "Brasil"
  if (host.endsWith(".pt")) return "Portugal"
  if (host.endsWith(".mx")) return "México"
  if (host.endsWith(".fr")) return "França"
  if (host.endsWith(".es")) return "Espanha"
  if (host.endsWith(".com") && /united states|usa/i.test(summary)) return "Estados Unidos"
  return "Brasil"
}

function handlesFromText(textValue: string): { network: SocialNetwork; handle: string }[] {
  const found: { network: SocialNetwork; handle: string }[] = []
  const patterns: { network: SocialNetwork; pattern: RegExp }[] = [
    { network: "instagram", pattern: /instagram\.com\/(?!p\/|reel\/|stories\/|explore\/)([A-Za-z0-9._]{2,30})/i },
    { network: "tiktok", pattern: /tiktok\.com\/@([A-Za-z0-9._]{2,30})/i },
    { network: "youtube", pattern: /youtube\.com\/@([A-Za-z0-9._-]{2,40})/i },
  ]
  for (const item of patterns) {
    const handle = textValue.match(item.pattern)?.[1]
    if (handle) found.push({ network: item.network, handle: `@${handle.replace(/^@/, "")}` })
  }
  return found
}

function slugTag(name: string) {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)
  return slug ? `#${slug}` : undefined
}

function pickTactics(strategy: CampaignStrategy, company: CompanyProfile): CampaignTactic[] {
  const model = company.modeloNegocio
  const luxury = company.ticketMedio === "alto" && company.porte === "grande"
  const hasDiscount = /desconto|cupom|trial|teste gr[aá]tis|promo/i.test(company.summary)
  if (strategy === "alcance") {
    if (model === "app_saas") return ["publipost", "link"]
    return ["publipost"]
  }
  if (strategy === "engajamento") {
    if (
      (company.porte === "media" || company.porte === "grande") &&
      /moda|beleza|varejo|visual/i.test(`${company.summary} ${company.products.join(" ")}`)
    ) {
      return ["publipost", "live"]
    }
    return ["publipost"]
  }
  // vendas
  if (model === "negocio_local") return ["publipost", "cupom"]
  if (model === "app_saas" || model === "servico_b2b") {
    return hasDiscount ? ["publipost", "link", "cupom"] : ["publipost", "link"]
  }
  if (luxury) return ["publipost", "link"]
  if (/liquida|drop|lan[cç]amento|outlet/i.test(company.summary)) return ["publipost", "link", "cupom", "live"]
  return ["publipost", "link", "cupom"]
}

/**
 * Porte do creator = leitura cruzada de marca × estratégia × papel da campanha.
 * PROIBIDO default preguiçoso em micro+mid independente do contexto.
 */
function pickTiers(
  strategy: CampaignStrategy,
  company: CompanyProfile,
  tactics: CampaignTactic[] = [],
): AudienceTierId[] {
  const porte = company.porte ?? "pequena"
  const ticket = company.ticketMedio
  const model = company.modeloNegocio
  const abrangencia = company.abrangencia
  const blob = `${company.summary} ${company.products.join(" ")} ${company.diferenciais?.join(" ") ?? ""}`
  const local = model === "negocio_local" || abrangencia === "local"
  const national = abrangencia === "nacional" || abrangencia === "global_br"
  const luxury =
    (ticket === "alto" && (porte === "grande" || porte === "media")) ||
    model === "institucional" ||
    /luxo|premium|high[- ]?end|enterprise/i.test(blob)
  const b2bTrust = model === "app_saas" || model === "servico_b2b" || /b2b|saas|enterprise|corporativ/i.test(blob)
  const launchPulse = /lan[cç]amento|drop|campanha nacional|branding|awareness|top of funnel/i.test(blob)
  const performanceHeavy = tactics.includes("cupom") || tactics.includes("link") || strategy === "vendas"
  const communityHeavy = strategy === "engajamento" || tactics.includes("live")

  if (local && porte !== "grande") {
    if (strategy === "alcance") return ["nano", "micro", "mid"]
    return ["nano", "micro"]
  }

  if (porte === "pequena") {
    if (strategy === "alcance" && (national || launchPulse)) return ["nano", "micro", "mid"]
    if (performanceHeavy) return ["nano", "micro"]
    if (communityHeavy) return ["nano", "micro"]
    return ["nano", "micro"]
  }

  if (porte === "media") {
    if (luxury) {
      if (strategy === "alcance") return ["mid", "macro"]
      if (performanceHeavy) return ["micro", "mid"]
      return ["micro", "mid", "macro"]
    }
    if (strategy === "alcance") return launchPulse || national ? ["micro", "mid", "macro"] : ["micro", "mid"]
    if (communityHeavy) return ["nano", "micro", "mid"]
    if (performanceHeavy) return b2bTrust ? ["micro", "mid", "macro"] : ["micro", "mid"]
    return ["micro", "mid"]
  }

  // marca grande
  if (luxury) {
    if (strategy === "alcance") return ["macro", "mega"]
    if (performanceHeavy) return ["mid", "macro"]
    return ["mid", "macro"]
  }
  if (strategy === "alcance") return national || launchPulse ? ["mid", "macro", "mega"] : ["mid", "macro"]
  if (communityHeavy) return ["micro", "mid", "macro"]
  if (performanceHeavy) return b2bTrust ? ["mid", "macro"] : ["micro", "mid", "macro"]
  return ["mid", "macro"]
}

function pickNetworks(niches: NicheId[], ages: string[], model?: BrandModelo): SocialNetwork[] {
  if (model === "negocio_local") {
    return niches.includes("gastronomia") || niches.includes("cultura-entretenimento") ? ["instagram", "tiktok"] : ["instagram"]
  }
  const techish =
    niches.some((item) => ["tecnologia", "financas-negocios", "games", "educacao", "automotivo"].includes(item)) ||
    model === "app_saas"
  if (niches.includes("games")) return ["youtube", "tiktok"]
  if (techish || ages.includes("45+") || ages.includes("35-44")) return ["youtube", "instagram"]
  if (
    ages.includes("18-24") ||
    niches.some((item) =>
      ["moda", "beleza", "fitness", "gastronomia", "lifestyle", "cultura-entretenimento", "pets", "maternidade-familia"].includes(item),
    )
  ) {
    return ["instagram", "tiktok"]
  }
  return ["instagram", "tiktok"]
}

function pickAges(niche: NicheId, ticket?: BrandTicket, model?: BrandModelo): string[] {
  if (niche === "games" || niche === "cultura-entretenimento") return ["18-24", "25-34"]
  if (niche === "maternidade-familia") return ["25-34", "35-44"]
  if (niche === "financas-negocios" || niche === "educacao" || model === "app_saas" || model === "servico_b2b" || ticket === "alto") {
    return ["25-34", "35-44", "45+"]
  }
  if (niche === "viagem" || niche === "casa-decoracao" || niche === "automotivo") return ["25-34", "35-44"]
  if (niche === "saude-bem-estar") return ["25-34", "35-44", "45+"]
  return ["18-24", "25-34", "35-44"]
}

function pickVisibility(strategy: CampaignStrategy, porte: BrandPorte = "pequena", terms: CommercialTerm[]): CampaignVisibility {
  if (porte === "grande" && strategy === "alcance") return "secreta"
  if (strategy === "engajamento" && (porte === "media" || porte === "grande")) return "privada"
  if (strategy === "vendas" && terms.includes("comissao")) return "publica"
  if (porte === "pequena" || porte === "media") return "publica"
  return "publica"
}

function pickTerms(strategy: CampaignStrategy, porte: BrandPorte = "pequena", tactics: CampaignTactic[], model?: BrandModelo): CommercialTerm[] {
  const trackable = tactics.includes("link") || tactics.includes("cupom")
  const physical = model !== "app_saas" && model !== "servico_b2b" && model !== "institucional"
  if (strategy === "alcance") {
    if (porte === "pequena") return physical ? ["permuta"] : ["fixo"]
    return ["fixo"]
  }
  if (strategy === "engajamento") {
    if (porte === "pequena") return physical ? ["permuta", "fixo"] : ["fixo"]
    return ["fixo"]
  }
  if (!trackable) return ["fixo"]
  if (porte === "pequena") return physical ? ["comissao", "permuta"] : ["comissao"]
  return ["fixo", "comissao"]
}

function pickFormats(strategy: CampaignStrategy, networks: SocialNetwork[], tactics: CampaignTactic[]): { format: ContentFormat; quantity: number }[] {
  const formats: { format: ContentFormat; quantity: number }[] = []
  if (networks.includes("instagram")) {
    if (strategy === "alcance") formats.push({ format: "reels", quantity: 1 })
    else if (strategy === "engajamento") formats.push({ format: "reels", quantity: 1 }, { format: "stories", quantity: 1 })
    else formats.push({ format: "reels", quantity: 1 }, { format: "stories", quantity: 1 })
  }
  if (networks.includes("tiktok")) formats.push({ format: "tiktok", quantity: 1 })
  if (networks.includes("youtube")) {
    if (strategy === "alcance") formats.push({ format: "shorts", quantity: 1 })
    else formats.push({ format: "youtube", quantity: 1 })
  }
  if (tactics.includes("live") && networks.includes("instagram")) formats.push({ format: "live", quantity: 1 })
  return formats.length ? formats : [{ format: "reels", quantity: 1 }]
}

function pickMetrics(strategy: CampaignStrategy, tactics: CampaignTactic[], networks: SocialNetwork[], formats: ContentFormat[], model?: BrandModelo): { metric: string; target: number }[] {
  const hasStories = formats.includes("stories")
  const metrics: string[] = []
  if (strategy === "alcance") {
    if (networks.includes("youtube") && !networks.includes("instagram") && !networks.includes("tiktok")) {
      metrics.push("views", "engaged_views")
    } else {
      metrics.push("reach", "views")
      if (formats.includes("reels")) metrics.push("skip_rate")
      else if (networks.includes("tiktok") || networks.includes("youtube")) metrics.push("completion")
    }
  } else if (strategy === "engajamento") {
    if (networks.includes("instagram")) metrics.push("interactions", "saves", "comments")
    if (networks.includes("tiktok") || networks.includes("youtube")) metrics.push("comments", "shares", "saves")
    metrics.push("follows")
  } else {
    if (tactics.includes("link") && tactics.includes("cupom")) {
      metrics.push("tracked_link_clicks", "coupon_uses", "orders", "revenue")
    } else if (tactics.includes("link")) {
      metrics.push("tracked_link_clicks", model === "servico_b2b" || model === "app_saas" ? "leads" : "orders")
    } else if (tactics.includes("cupom")) {
      metrics.push("coupon_uses")
    }
    if (model === "app_saas" && networks.includes("tiktok")) metrics.push("app_download_clicks")
    if (model === "negocio_local") {
      if (tactics.includes("cupom")) metrics.push("coupon_uses")
      metrics.push("text_clicks", "direction_clicks")
    }
    if (hasStories) metrics.push("story_link_clicks")
    else if (networks.includes("instagram") || networks.includes("tiktok")) metrics.push("bio_link_clicks")
  }
  return [...new Set(metrics)].slice(0, 6).map((metric) => ({ metric, target: 0 }))
}

function buildBrief(company: CompanyProfile, strategy: CampaignStrategy, niche: string, ages: string[]) {
  const product = company.products[0] ?? niche
  const gen =
    ages.includes("18-24") && !ages.includes("45+")
      ? "linguagem espontânea e ritmo ágil, sem roteiro engessado"
      : ages.includes("45+")
        ? "tom direto, informativo e confiável, sem gírias forçadas"
        : "prova de benefício real na rotina, com autenticidade"
  const cta =
    strategy === "vendas"
      ? "Feche com CTA natural para o link rastreável ou cupom, sem pressão artificial."
      : strategy === "engajamento"
        ? "Feche abrindo conversa ou convidando a salvar a dica."
        : "Feche despertando curiosidade e lembrança de marca."
  const description = [
    `Objetivo e contexto: destacar ${product} de ${company.name} — ${company.diferenciais?.[0] ?? "o diferencial real visto no site"} — para o público da campanha.`,
    `Pontos-chave: mostre 2–3 benefícios essenciais em uso real na sua rotina, com ${gen}. Traduza com a sua linguagem; não leia script.`,
    cta,
  ].join("\n\n")
  const doList =
    strategy === "vendas"
      ? [
          "Demonstrar o diferencial que quebra a principal objeção de compra",
          "Integrar link ou cupom de forma fluida no fechamento",
          "Sinalizar a parceria com #publi / tag oficial de forma natural",
          "Mostrar o produto em uso real no dia a dia",
        ]
      : strategy === "engajamento"
        ? [
            "Fazer pergunta aberta à audiência",
            "Usar formato tutorial, rotina ou antes-e-depois que incentive salvamento",
            "Sinalizar a parceria com #publi de forma natural",
            "Mostrar o produto integrado à rotina",
          ]
        : [
            "Abrir com gancho visual nos 3 primeiros segundos",
            "Contar storytelling pessoal com inserção orgânica na rotina",
            "Sinalizar a parceria com #publi de forma natural",
            "Manter o foco no diferencial real do produto",
          ]
  const dontList = [
    "Não deixar de sinalizar o conteúdo como publicidade (#publi / tag oficial)",
    "Não exibir nem citar marcas concorrentes",
    "Não prometer resultados irreais, clínicos ou financeiros sem respaldo",
    "Não divulgar preços ou promoções sem validar disponibilidade no site",
  ]
  return { description, doList, dontList }
}

export function completeCampaignPlan(
  suggestion: AutofillSuggestion,
  company: CompanyProfile,
  website: string,
  siteText = "",
  confirmedStrategy?: CampaignStrategy,
): AutofillSuggestion {
  const dossier = enrichCompany(company, website, siteText)
  const incoming = stripBlockedFields({ ...suggestion })
  const plan: AutofillSuggestion = { ...incoming }
  const inferred = inferNiche(dossier, siteText)
  const nichesFromPlan = normalizeNicheList(plan.niches ?? (plan.niche ? plan.niche.split(/[·,|/]/).map((item) => item.trim()) : undefined), 3)
  // Sempre valida evidência de catálogo (bloqueia pets por vegan/cruelty-free etc.)
  const niches = sanitizeInferredNiches(
    nichesFromPlan.length ? nichesFromPlan : inferNiches(dossier, inferred ?? "lifestyle", siteText),
    dossier,
    siteText,
  )
  const niche = niches[0] ?? "lifestyle"
  const workingStrategy = confirmedStrategy ?? dossier.recommendedStrategy ?? "alcance"
  const strategyLocked = Boolean(confirmedStrategy)
  const country =
    dossier.abrangencia === "local" && plan.audienceCountry
      ? plan.audienceCountry
      : plan.audienceCountry ?? inferCountry(website, dossier.summary, dossier.abrangencia)

  plan.niches = niches
  plan.niche = niches.map((item) => nicheLabel(item)).join(" · ")
  plan.name =
    plan.name ??
    `${dossier.name} ${
      niche === "fitness"
        ? "Performance"
        : niche === "beleza"
          ? "Rotina"
          : niche === "casa-decoracao"
            ? "Casa"
            : niche === "saude-bem-estar"
              ? "Bem-estar"
              : "Essenciais"
    }`
  // Estratégia e orçamento nunca entram no plano aplicável
  delete plan.strategy
  delete plan.objective

  // Com Estratégia confirmada, recalcula dependências estruturais do funil
  if (strategyLocked) {
    delete plan.tactics
    delete plan.commercialTerms
    delete plan.audienceTiers
    delete plan.minEngagement
    delete plan.minFollowers
    delete plan.maxFollowers
    delete plan.visibility
    delete plan.formatQuantities
    delete plan.contentFormats
    delete plan.successTargets
    // Notas reativas não podem ficar presas à recommendedStrategy antiga (ex.: "Vendas/Comissão" com Alcance)
    if (plan.notes) {
      const stale = ["tactics", "terms", "creator", "scope", "metrics", "budget", "audience", "privacy"] as const
      for (const key of stale) delete plan.notes[key]
    }
    // Só reescreve o briefing se a marca escolheu caminho diferente do recomendado
    if (confirmedStrategy !== dossier.recommendedStrategy) {
      delete plan.description
      delete plan.doList
      delete plan.dontList
    }
  }

  const tactics = plan.tactics?.length ? plan.tactics : pickTactics(workingStrategy, dossier)
  plan.tactics = tactics
  plan.audienceCountry = country
  plan.audienceAges = plan.audienceAges?.length ? plan.audienceAges.filter((age) => age !== "0-17" || /teen|gamer|escolar|infantil/i.test(dossier.summary)) : pickAges(niche, dossier.ticketMedio, dossier.modeloNegocio)
  // Audiência/creator: o nicho principal da marca (site) é obrigatório; outros são extras
  const primaryBrandNiche = niches[0]
  const rawCreatorNiches = sanitizeInferredNiches(
    plan.targetNiches?.length ? normalizeNicheList(plan.targetNiches, 4) : niches,
    dossier,
    siteText,
  )
  plan.targetNiches = normalizeNicheList(
    primaryBrandNiche
      ? [primaryBrandNiche, ...rawCreatorNiches.filter((item) => item !== primaryBrandNiche)]
      : rawCreatorNiches,
    4,
  )
  plan.targetNetworks = plan.targetNetworks?.length
    ? plan.targetNetworks.slice(0, dossier.porte === "grande" ? 3 : 2)
    : pickNetworks(plan.targetNiches as NicheId[], plan.audienceAges ?? [], dossier.modeloNegocio)
  plan.creatorLocation = plan.creatorLocation?.trim() ? plan.creatorLocation : country
  const place = country.toLowerCase()
  plan.creatorLanguage =
    plan.creatorLanguage ??
    (/brasil|portugal|são paulo|sao paulo|rio de janeiro/.test(place)
      ? "Português"
      : /espanha|méxico|mexico|argentina|chile|colômbia|colombia/.test(place)
        ? "Espanhol"
        : /frança|france/.test(place)
          ? "Francês"
          : "Inglês")
  plan.audienceNotes =
    plan.audienceNotes ??
    `Público alinhado a ${dossier.products[0] ?? niche}, com tom ${dossier.tomDeVoz ?? `de ${dossier.name}`}.`
  // Sempre recalcula portes a partir do dossiê × estratégia × táticas (nunca herdar micro+mid preguiçoso do modelo)
  plan.audienceTiers = pickTiers(workingStrategy, dossier, tactics)
  const picked = TIERS.filter((tier) => plan.audienceTiers?.includes(tier.id))
  if (picked.length) {
    plan.minFollowers = Math.min(...picked.map((tier) => tier.min))
    plan.maxFollowers = Math.max(...picked.map((tier) => tier.max))
  }
  const wantsNanoMicro = plan.audienceTiers?.some((tier) => tier === "nano" || tier === "micro")
  // Só valores do dropdown: 0 | 1 | 2 | 3.5 | 5
  plan.minEngagement = snapMinEngagement(
    plan.minEngagement ??
      (wantsNanoMicro ? (workingStrategy === "engajamento" ? 3.5 : 2) : workingStrategy === "engajamento" ? 2 : 1),
  )

  // Sempre deriva condições da Estratégia atual (evita Fixo+Permuta/Comissão herdados da recomendação errada)
  let terms = pickTerms(workingStrategy, dossier.porte ?? "pequena", tactics, dossier.modeloNegocio)
  if (terms.includes("comissao") && !(tactics.includes("link") || tactics.includes("cupom"))) {
    terms = terms.filter((term) => term !== "comissao")
    if (!terms.length) terms = ["fixo"]
  }
  plan.commercialTerms = terms

  plan.visibility = plan.visibility ?? pickVisibility(workingStrategy, dossier.porte ?? "pequena", plan.commercialTerms ?? [])

  // Recomendação = Sim e teto = Não por padrão; campanha secreta não usa essas etapas
  if (plan.visibility === "secreta") {
    delete plan.recommendToMatching
    delete plan.applicationCap
  } else {
    plan.recommendToMatching = plan.recommendToMatching ?? true
    plan.applicationCap = plan.applicationCap ?? 0
  }

  // Limpa qualquer vazamento de orçamento / períodos
  delete plan.fixedFeePerPost
  delete plan.commission
  delete plan.budget
  delete plan.maxInfluencers
  delete plan.perInfluencerFee
  delete plan.startDate
  delete plan.endDate
  delete plan.applicationStart
  delete plan.applicationEnd

  const brief = buildBrief(dossier, workingStrategy, niche, plan.audienceAges ?? [])
  plan.description = plan.description ?? brief.description
  plan.doList = plan.doList?.length ? plan.doList : brief.doList
  plan.dontList = plan.dontList?.length ? plan.dontList : brief.dontList
  plan.productCategories = plan.productCategories?.length ? plan.productCategories : dossier.products.slice(0, 6)

  if (!plan.formatQuantities?.length) {
    plan.formatQuantities = pickFormats(workingStrategy, plan.targetNetworks ?? ["instagram"], tactics)
    plan.contentFormats = plan.formatQuantities.map((item) => item.format)
  } else {
    // Espelhamento rígido: remove formatos de redes não ativas
    const allowed = new Set<ContentFormat>()
    for (const network of plan.targetNetworks ?? []) {
      if (network === "instagram") ["reels", "stories", "feed", "live"].forEach((format) => allowed.add(format as ContentFormat))
      if (network === "tiktok") allowed.add("tiktok")
      if (network === "youtube") {
        allowed.add("youtube")
        allowed.add("shorts")
      }
    }
    plan.formatQuantities = plan.formatQuantities.filter((item) => allowed.has(item.format))
    if (!plan.formatQuantities.length) plan.formatQuantities = pickFormats(workingStrategy, plan.targetNetworks ?? ["instagram"], tactics)
    plan.contentFormats = plan.formatQuantities.map((item) => item.format)
  }

  if (!plan.successTargets?.length) {
    plan.successTargets = pickMetrics(workingStrategy, tactics, plan.targetNetworks ?? [], plan.contentFormats ?? [], dossier.modeloNegocio)
  } else {
    // Zera metas numéricas inventadas (> 0 vindas do modelo) — só marca KPIs
    plan.successTargets = plan.successTargets.map((item) => ({ metric: item.metric, target: 0 }))
  }

  const tag = slugTag(dossier.name)
  if (!plan.mandatoryHashtags?.length) {
    plan.mandatoryHashtags = [tag, "#publi"].filter(Boolean).slice(0, 4) as string[]
  }
  if (!plan.mandatoryMentions?.length) {
    const handles = handlesFromText(siteText)
    if (handles.length) plan.mandatoryMentions = handles.slice(0, 2)
  }

  const productHint = dossier.products[0] ?? plan.niche
  const porteTxt =
    dossier.porte === "grande" ? "marca grande" : dossier.porte === "media" ? "marca média" : "marca emergente"
  const modeloTxt =
    dossier.modeloNegocio === "ecommerce_d2c"
      ? "e-commerce próprio"
      : dossier.modeloNegocio === "app_saas"
        ? "app ou software"
        : dossier.modeloNegocio === "negocio_local"
          ? "negócio local"
          : dossier.modeloNegocio === "servico_b2b"
            ? "serviço B2B"
            : dossier.modeloNegocio === "marketplace"
              ? "marketplace"
              : "presença institucional"
  const strategyName = workingStrategy === "vendas" ? "Vendas" : workingStrategy === "engajamento" ? "Engajamento" : "Alcance"
  const tacticNames = (plan.tactics ?? []).map((item) => (item === "publipost" ? "Publi Post" : item === "cupom" ? "Cupom" : item === "link" ? "Link" : "Live")).join(", ")
  const termNames = (plan.commercialTerms ?? []).map((item) => (item === "fixo" ? "Fixo" : item === "comissao" ? "Comissão" : "Permuta")).join(" + ")
  const tierNames = (plan.audienceTiers ?? []).map((item) => item.charAt(0).toUpperCase() + item.slice(1)).join(", ")
  const networkNames = (plan.targetNetworks ?? []).map((item) => (item === "instagram" ? "Instagram" : item === "tiktok" ? "TikTok" : "YouTube")).join(", ")
  const formatNames = (plan.contentFormats ?? []).map((item) => (item === "youtube" ? "YouTube" : item === "tiktok" ? "TikTok" : item.charAt(0).toUpperCase() + item.slice(1))).join(", ")
  const visibilityName = plan.visibility === "secreta" ? "Secreta" : plan.visibility === "privada" ? "Privada" : "Pública"

  const strategyAdvice =
    dossier.recommendedStrategy === "vendas"
      ? `${dossier.name} opera como ${modeloTxt} com caminho de compra ou lead. Vendas deixa medir o resultado; Alcance serve a lançamento e Engajamento a comunidade. A escolha continua sua.`
      : dossier.recommendedStrategy === "engajamento"
        ? `${dossier.name} ganha com relacionamento contínuo. Engajamento constrói consideração; Vendas só entra com funil rastreável. A escolha continua sua.`
        : `Para ${dossier.name}, Alcance fortalece lembrança. Engajamento aprofunda conversa; Vendas só faz sentido com checkout ou lead claro. A escolha continua sua.`

  const fallbackNotes: NonNullable<AutofillSuggestion["notes"]> = {
    website: `Lemos o site de ${dossier.name} (${porteTxt}, ${modeloTxt}) e usamos isso como base — sem inventar linhas de produto.`,
    identity: `Nome e nicho acompanham o catálogo real (${productHint}), para a campanha parecer ${dossier.name} na vitrine — não um título genérico.`,
    strategy: strategyAdvice,
    tactics: `Em ${strategyName} para ${modeloTxt}, ${tacticNames || "estas táticas"} fecham o funil de ${dossier.name}. O que ficou de fora não encaixa no objetivo ou faltou evidência no site.`,
    audience: `${dossier.name} tem atuação ${dossier.abrangencia === "local" ? "local" : "ampla"}: sugerimos ${plan.audienceCountry}. As faixas ${(plan.audienceAges ?? []).join(", ")} batem com quem consome ${productHint}.`,
    creator: `Cruzamos ${porteTxt} + objetivo ${strategyName} + papel desta campanha: ${tierNames || "estes portes"} fazem sentido para ${productHint} agora (não um padrão fixo de Micro e Mid). Redes: ${networkNames || "as principais do catálogo"}.`,
    privacy: `${visibilityName} para ${dossier.name}: ${plan.visibility === "secreta" ? "elenco fechado e confidencialidade; recomendação e teto somem." : plan.visibility === "privada" ? "prioriza quem já conhece a marca." : "abre a vitrine para descobrir talentos compatíveis."}`,
    recommend:
      plan.visibility === "secreta"
        ? "Em campanha secreta a recomendação não se aplica."
        : `Sim por padrão: a plataforma pode indicar a campanha de ${dossier.name} a creators já alinhados ao filtro.`,
    cap:
      plan.visibility === "secreta"
        ? "Em campanha secreta o teto da vitrine não se aplica."
        : `Não por padrão: ${dossier.name} continua recebendo candidaturas. Dá para limitar depois se a triagem apertar.`,
    terms:
      workingStrategy === "alcance"
        ? `${termNames || "Estas condições"} sustentam cobertura e lembrança em Alcance para ${dossier.name}, sem amarrar a campanha a comissão de venda. Os valores ficam na etapa seguinte.`
        : workingStrategy === "engajamento"
          ? `${termNames || "Estas condições"} sustentam conteúdo recorrente em Engajamento para ${dossier.name}. Os valores ficam na etapa seguinte.`
          : `${termNames || "Estas condições"} equilibram adesão e retorno em Vendas para ${dossier.name}. Os valores ficam na etapa seguinte.`,
    budget: `Não preenchemos cifras. Calibre cachê e comissão ao ticket de ${productHint} e some envio, frete, mídia e direitos ao ROI real.`,
    brief: `Briefing em pontos-chave sobre ${productHint}, sem falas prontas — para o creator soar natural e ${dossier.name} não parecer anúncio frio.`,
    scope: `${formatNames || "Estes formatos"} espelham ${networkNames || "as redes escolhidas"} e o papel de cada um em ${strategyName}.`,
    metrics: `Indicadores de ${strategyName} para provar resultado em ${dossier.name} — sem meta numérica inventada.`,
    invites: `Curadoria sua: valide audiência real em ${niches.map((item) => nicheLabel(item)).join(", ")}, porte ${tierNames || "definido"} e redes ${networkNames || "escolhidas"} antes de convidar.`,
  }
  // Notas do modelo só prevalecem se não forem das chaves reativas já recalculadas
  const incomingNotes = Object.fromEntries(
    Object.entries(plan.notes ?? {}).filter(([key, value]) => {
      if (!value) return false
      if (strategyLocked && ["tactics", "terms", "creator", "scope", "metrics", "budget", "audience", "privacy"].includes(key)) {
        return false
      }
      return true
    }),
  )
  plan.notes = { ...fallbackNotes, ...incomingNotes }

  return stripBlockedFields(plan)
}

export function autofillSystemPrompt() {
  return [
    "Você é o copiloto estratégico (Human-in-the-Loop) do Acompanhamento com IA na criação de campanhas.",
    "A partir do texto real do site, monte o Dossiê da Marca e um plano de campanha coerente de funil.",
    "Responda apenas com JSON, sem markdown.",
    "",
    "Estrutura JSON:",
    '- company: name, summary (3–5 frases: o que faz, para quem, o que vende), products (até 6 linhas reais do site), porte, modeloNegocio, abrangencia, ticketMedio, recorrencia, tomDeVoz, diferenciais, recommendedStrategy (só consultoria).',
    "- Campos fillable do plano: name, niches (array 1–3 ids), niche (rótulos unidos), tactics, audienceCountry, audienceAges, targetNiches, targetNetworks, creatorLocation, creatorLanguage, audienceNotes, audienceTiers, minEngagement, minFollowers, maxFollowers, visibility, commercialTerms, description, doList, dontList, productCategories, formatQuantities, contentFormats, successTargets (metric + target 0), mandatoryHashtags, mandatoryMentions quando houver @ no site, notes.",
    "- OMITA sempre: strategy, objective, datas, fixedFeePerPost, commission, budget, maxInfluencers, perInfluencerFee, coverImage, inviteIds, requiredCreatorFields, formId, communityLink, produtos da loja.",
    "- recommendToMatching: sempre true (Sim), salvo se visibility for secreta (nesse caso omita — a etapa nem aparece).",
    "- applicationCap: sempre 0 (Não / sem teto), salvo se visibility for secreta (omita — a etapa nem aparece).",
    "",
    "audienceCountry/creatorLocation em texto livre (Cidade / Estado / País ou Brasil).",
    `Nichos oficiais (use os ids em niches/targetNiches, 1–3, múltipla escolha): ${NICHE_CATALOG.map((item) => `${item.id} = ${item.label} (${item.examples})`).join("; ")}.`,
    "Nicho = o que a marca vende/entrega no catálogo, NÃO adjetivos de propósito. Combinações: farmácia → saude-bem-estar+beleza; skincare/cosmética vegana ou cruelty-free → beleza (NUNCA pets); suplementos → fitness+saude-bem-estar; eletro/casa inteligente → casa-decoracao+tecnologia; brinquedos/moda infantil → maternidade-familia+moda; show/bar/festival → cultura-entretenimento+gastronomia. Pets só com ração, pet shop, veterinária, acessório pet etc.",
    "targetNiches (audiência/creator): OBRIGATÓRIO incluir o nicho principal da marca (primeiro item de niches). Pode haver outros nichos além dele — múltipla escolha é bem-vinda — mas o principal do site nunca pode faltar.",
    "audienceTiers: nano|micro|mid|macro|mega — OBRIGATÓRIO cruzar porte da marca (company.porte), Estratégia e papel da campanha (alcance vs comunidade vs vendas, local vs nacional, ticket, B2B/luxo). PROIBIDO default genérico micro+mid em toda campanha.",
    "successTargets: marque os KPIs certos com target 0 — nunca invente views, receita, CPM ou ROI.",
    "Se filled.strategy vier no pedido do usuário, use essa Estratégia confirmada para táticas/condições/brief/escopo/métricas; senão use company.recommendedStrategy só como referência interna e explique a escolha no notes.strategy sem preencher strategy.",
    "",
    "notes: fale com o usuário de marca em português claro. Explique por que a escolha encaixa nesta empresa e no objetivo, e por que as alternativas principais não. Sem underscores, sem IDs de campo, sem definir o botão.",
    "",
    strategicDoctrinePrompt(),
    "",
    "## Regras por etapa",
    guidelinesPrompt(),
  ].join("\n")
}
