import { TIERS, type AudienceTierId } from "@/lib/audience-tiers"
import { guidelinesPrompt } from "@/lib/campaigns/wizard-guidelines"
import {
  AGE_RANGES,
  COUNTRIES,
  LANGUAGES,
  NICHES,
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
const METRICS = new Set(["views", "reach", "likes", "comments", "saves", "shares", "interactions"])
const TIERS_IDS = new Set<AudienceTierId>(["nano", "micro", "mid", "macro", "mega"])

export interface CompanyProfile {
  name: string
  summary: string
  products: string[]
  source: string
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

export function sanitizeSuggestion(raw: unknown): AutofillSuggestion {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const suggestion: AutofillSuggestion = {}
  suggestion.brandWebsite = text(source.brandWebsite, 200)
  suggestion.name = text(source.name, 90)
  const niche = text(source.niche, 40)?.toLowerCase()
  if (niche && NICHES.includes(niche)) suggestion.niche = niche
  suggestion.startDate = date(source.startDate)
  suggestion.endDate = date(source.endDate)
  suggestion.applicationStart = date(source.applicationStart)
  suggestion.applicationEnd = date(source.applicationEnd)
  if (typeof source.strategy === "string" && STRATEGIES.has(source.strategy as CampaignStrategy)) {
    suggestion.strategy = source.strategy as CampaignStrategy
  }
  suggestion.objective = text(source.objective, 180)
  suggestion.tactics = strings(source.tactics, TACTICS) as CampaignTactic[] | undefined
  const country = text(source.audienceCountry, 40)
  if (country && COUNTRIES.includes(country)) suggestion.audienceCountry = country
  suggestion.audienceAges = strings(
    Array.isArray(source.audienceAges)
      ? source.audienceAges.map((item) => (typeof item === "string" ? item.replace(/[–—]/g, "-").replace(/\s/g, "") : item))
      : source.audienceAges,
    new Set(AGE_RANGES),
  )
  suggestion.targetNiches = strings(source.targetNiches, new Set(NICHES))
  suggestion.targetNetworks = strings(source.targetNetworks, NETWORKS) as SocialNetwork[] | undefined
  suggestion.creatorLocation = text(source.creatorLocation, 80)
  const language = text(source.creatorLanguage, 40)
  if (language && LANGUAGES.includes(language)) suggestion.creatorLanguage = language
  suggestion.audienceNotes = text(source.audienceNotes, 240)
  suggestion.minEngagement = number(source.minEngagement, 100)
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
  suggestion.description = text(source.description, 500)
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
        if (!target) return null
        return { metric: row.metric, target }
      })
      .filter((item): item is { metric: string; target: number } => Boolean(item))
      .slice(0, 6)
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
      const clean = text(value, 180)
      if (clean) notes[key] = clean
    }
    if (Object.keys(notes).length) suggestion.notes = notes
  }
  if (!suggestion.formatQuantities?.length && suggestion.contentFormats?.length) {
    suggestion.formatQuantities = suggestion.contentFormats.map((format) => ({ format, quantity: 1 }))
  }
  if (suggestion.commercialTerms?.includes("permuta")) {
    suggestion.commercialTerms = suggestion.commercialTerms.filter((term) => term !== "permuta")
  }
  if (suggestion.commercialTerms?.includes("comissao") && !suggestion.commission?.mode) {
    suggestion.commercialTerms = suggestion.commercialTerms.filter((term) => term !== "comissao")
  }
  if (suggestion.commercialTerms?.includes("fixo") && !(suggestion.fixedFeePerPost && suggestion.fixedFeePerPost > 0)) {
    suggestion.commercialTerms = suggestion.commercialTerms.filter((term) => term !== "fixo")
  }
  if (suggestion.commercialTerms && suggestion.commercialTerms.length === 0) delete suggestion.commercialTerms
  return suggestion
}

export function sanitizeCompany(raw: unknown, source: string, fallbackName: string): CompanyProfile | null {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const name = text(record.name, 80) || fallbackName
  const summary = text(record.summary, 700)
  if (!summary) return null
  const products = strings(record.products, undefined, 6) ?? []
  return { name, summary, products, source }
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

const NICHE_HINTS: { niche: string; pattern: RegExp }[] = [
  { niche: "beleza", pattern: /beleza|maquiagem|perfume|cosm[eé]tic|skincare|cabelo|hidrat|batom/i },
  { niche: "moda", pattern: /moda|roupa|vestu[aá]rio|cal[cç]ado|acess[oó]rio/i },
  { niche: "fitness", pattern: /fitness|academia|treino|suplement|esporte/i },
  { niche: "gastronomia", pattern: /gastronom|comida|restaurante|receita|alimento|bebida/i },
  { niche: "tecnologia", pattern: /tecnologia|software|eletr[oô]nic|celular|gadget/i },
  { niche: "games", pattern: /game|jogo|gamer/i },
  { niche: "finanças", pattern: /finan[cç]|banco|invest|seguro|cr[eé]dito/i },
  { niche: "viagem", pattern: /viagem|turismo|hotel|destino/i },
  { niche: "humor", pattern: /humor|com[eé]dia/i },
  { niche: "lifestyle", pattern: /lifestyle|casa|bem-estar|decora/i },
]

function inferNiche(company: CompanyProfile) {
  const blob = `${company.name} ${company.summary} ${company.products.join(" ")}`
  return NICHE_HINTS.find((item) => item.pattern.test(blob))?.niche
}

function inferCountry(website: string, summary: string) {
  const host = websiteKey(website)
  if (host.endsWith(".br") || /brasil|brazil/i.test(summary)) return "Brasil"
  if (host.endsWith(".pt")) return "Portugal"
  if (host.endsWith(".mx")) return "México"
  if (host.endsWith(".fr")) return "França"
  if (host.endsWith(".es")) return "Espanha"
  if (host.endsWith(".com") && /united states|usa/i.test(summary)) return "Estados Unidos"
  return "Brasil"
}

function handlesFromText(text: string): { network: SocialNetwork; handle: string }[] {
  const found: { network: SocialNetwork; handle: string }[] = []
  const patterns: { network: SocialNetwork; pattern: RegExp }[] = [
    { network: "instagram", pattern: /instagram\.com\/(?!p\/|reel\/|stories\/|explore\/)([A-Za-z0-9._]{2,30})/i },
    { network: "tiktok", pattern: /tiktok\.com\/@([A-Za-z0-9._]{2,30})/i },
    { network: "youtube", pattern: /youtube\.com\/@([A-Za-z0-9._-]{2,40})/i },
  ]
  for (const item of patterns) {
    const handle = text.match(item.pattern)?.[1]
    if (handle) found.push({ network: item.network, handle: `@${handle.replace(/^@/, "")}` })
  }
  return found
}

function tiersBetween(min?: number, max?: number) {
  const low = min ?? 10_000
  const high = max ?? 500_000
  const tiers = TIERS.filter((tier) => tier.max >= low && tier.min <= high).map((tier) => tier.id)
  return tiers.length ? tiers : (["micro", "mid"] as AudienceTierId[])
}

function slugTag(name: string) {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)
  return slug ? `#${slug}` : undefined
}

export function completeCampaignPlan(suggestion: AutofillSuggestion, company: CompanyProfile, website: string, siteText = ""): AutofillSuggestion {
  const plan = { ...suggestion }
  const inferred = inferNiche(company)
  const niche = plan.niche ?? (inferred && NICHES.includes(inferred) ? inferred : "lifestyle")
  const country = plan.audienceCountry ?? inferCountry(website, company.summary)
  const sells = plan.strategy === "vendas" || /comprar|loja|shop|pedido|carrinho|e-?commerce/i.test(`${company.summary} ${siteText.slice(0, 4000)}`)
  plan.niche = niche
  plan.name = plan.name ?? `${company.name} com creators`
  plan.strategy = plan.strategy ?? (sells ? "vendas" : "alcance")
  plan.objective = plan.objective ?? company.summary.slice(0, 180)
  plan.tactics = plan.tactics?.length ? plan.tactics : plan.strategy === "vendas" ? ["publipost", "link"] : ["publipost"]
  plan.audienceCountry = country
  plan.audienceAges = plan.audienceAges?.length ? plan.audienceAges : niche === "finanças" ? ["25-34", "35-44"] : ["18-24", "25-34"]
  plan.targetNiches = plan.targetNiches?.length ? plan.targetNiches : [niche]
  plan.targetNetworks = plan.targetNetworks?.length ? plan.targetNetworks : ["instagram"]
  plan.creatorLocation = plan.creatorLocation && COUNTRIES.includes(plan.creatorLocation) ? plan.creatorLocation : country
  plan.creatorLanguage = plan.creatorLanguage ?? (country === "Brasil" || country === "Portugal" ? "Português" : country === "Espanha" || country === "México" ? "Espanhol" : country === "França" ? "Francês" : "Inglês")
  plan.audienceNotes = plan.audienceNotes ?? `Audiência interessada em ${company.products[0] ?? niche}, no tom de ${company.name}.`
  plan.audienceTiers = plan.audienceTiers?.length ? plan.audienceTiers : tiersBetween(plan.minFollowers, plan.maxFollowers)
  const picked = TIERS.filter((tier) => plan.audienceTiers?.includes(tier.id))
  if (picked.length) {
    plan.minFollowers = plan.minFollowers ?? Math.min(...picked.map((tier) => tier.min))
    plan.maxFollowers = plan.maxFollowers ?? Math.max(...picked.map((tier) => tier.max))
  }
  plan.minEngagement = plan.minEngagement ?? 2
  plan.visibility = plan.visibility ?? "publica"
  plan.recommendToMatching = plan.recommendToMatching ?? true
  if (!plan.commercialTerms?.length) {
    plan.commercialTerms = plan.strategy === "vendas" ? ["fixo", "comissao"] : ["fixo"]
  }
  if (plan.commercialTerms.includes("fixo") && !(plan.fixedFeePerPost && plan.fixedFeePerPost > 0)) plan.fixedFeePerPost = 1200
  if (plan.commercialTerms.includes("comissao") && !plan.commission?.mode) plan.commission = { mode: "percent", value: 10 }
  if (plan.commission?.mode && plan.commission.mode !== "contract" && !(plan.commission.value && plan.commission.value > 0)) {
    plan.commission = { ...plan.commission, value: plan.commission.mode === "percent" ? 10 : 50 }
  }
  plan.maxInfluencers = plan.maxInfluencers && plan.maxInfluencers >= 1 ? plan.maxInfluencers : 8
  if (!(plan.budget && plan.budget > 0) && plan.fixedFeePerPost) plan.budget = plan.fixedFeePerPost * plan.maxInfluencers
  if (plan.perInfluencerFee === undefined && plan.fixedFeePerPost) plan.perInfluencerFee = plan.fixedFeePerPost
  plan.description = plan.description ?? company.summary
  plan.doList = plan.doList?.length ? plan.doList : [`Mostrar ${company.products[0] ?? "o produto"} em uso real`, `Citar ${company.name} de forma natural`]
  plan.dontList = plan.dontList?.length ? plan.dontList : ["Não inventar preço, promoção ou benefício que a marca não publica"]
  plan.productCategories = plan.productCategories?.length ? plan.productCategories : company.products.slice(0, 6)
  if (!plan.formatQuantities?.length) {
    plan.formatQuantities = plan.targetNetworks.includes("tiktok")
      ? [{ format: "tiktok", quantity: 1 }, { format: "reels", quantity: 1 }]
      : [{ format: "reels", quantity: 1 }, { format: "stories", quantity: 3 }]
    plan.contentFormats = plan.formatQuantities.map((item) => item.format)
  }
  if (!plan.successTargets?.length) {
    plan.successTargets = plan.strategy === "engajamento"
      ? [{ metric: "interactions", target: 5000 }]
      : plan.strategy === "vendas"
        ? [{ metric: "reach", target: 80000 }, { metric: "interactions", target: 3000 }]
        : [{ metric: "reach", target: 100000 }]
  }
  const tag = slugTag(company.name)
  if (!plan.mandatoryHashtags?.length && tag) plan.mandatoryHashtags = [tag]
  if (!plan.mandatoryMentions?.length) {
    const handles = handlesFromText(siteText)
    if (handles.length) plan.mandatoryMentions = handles.slice(0, 2)
  }
  const productHint = company.products[0] ?? plan.niche
  plan.notes = {
    website: `A pesquisa de ${company.name} alimenta todas as etapas seguintes sem nova consulta.`,
    identity: `${company.name} entra na campanha no nicho ${plan.niche}, alinhado ao que a marca publica.`,
    strategy:
      plan.strategy === "vendas"
        ? `${company.name} mostra caminho de compra no site, então a estratégia escolhida é vendas.`
        : plan.strategy === "engajamento"
          ? `${company.name} reforça comunidade e conversa, então a estratégia escolhida é engajamento.`
          : `${company.name} precisa ser vista e lembrada, então a estratégia escolhida é alcance.`,
    tactics: `As táticas ${(plan.tactics ?? []).join(", ")} seguem como ${company.name} já chega no público.`,
    audience: `O público em ${plan.audienceCountry ?? "Brasil"} reflete o mercado e o tom de ${company.name}.`,
    creator: `O creator ideal fala com quem já consome ${productHint}, nas redes e no porte sugeridos.`,
    privacy: "A campanha começa pública para recrutar na vitrine enquanto a marca valida o elenco.",
    recommend: "A recomendação automática amplia o alcance sem abrir mão do filtro de perfil.",
    terms:
      (plan.commercialTerms ?? []).includes("comissao")
        ? `${company.name} vende e pode rastrear resultado, então entra comissão junto do cachê.`
        : `A condição comercial cobre a entrega pedida a creators de ${company.name}.`,
    budget: "O teto e o valor por post repartem o investimento pelo porte e pela quantidade de creators.",
    brief: company.summary,
    scope: "Os formatos cobrem as redes do creator ideal e o ritmo de conteúdo da marca.",
    metrics: `As metas medem o resultado esperado da estratégia ${plan.strategy}.`,
    ...plan.notes,
  }
  return plan
}

export function autofillSystemPrompt() {
  return [
    "Você pesquisa uma empresa a partir do texto real do site e, nesta única resposta, devolve o contexto completo para preencher uma campanha de influencers.",
    "Não haverá outra consulta. Tudo o que a campanha precisa decidir a partir da empresa tem de vir agora.",
    "Responda apenas com JSON, sem markdown.",
    "company traz os fatos: name, summary (3 a 5 frases sobre o que a empresa faz, para quem e o que vende) e products (até 6 linhas citadas no texto).",
    "Os demais campos são o plano da campanha derivado desses fatos. Preencha todos: name, niche, strategy, objective, tactics, audienceCountry, audienceAges, targetNiches, targetNetworks, creatorLocation, creatorLanguage, audienceNotes, audienceTiers, minEngagement, minFollowers, maxFollowers, visibility, recommendToMatching, commercialTerms, fixedFeePerPost, commission, budget, maxInfluencers, perInfluencerFee, description, doList, dontList, productCategories, formatQuantities, contentFormats, successTargets, mandatoryHashtags e mandatoryMentions quando o site mostrar um @.",
    "niche, targetNiches, país, idioma, redes, formatos, estratégia, tática, condição comercial e métricas só podem usar os valores descritos nas etapas.",
    "audienceTiers usa nano, micro, mid, macro ou mega. Para marca de consumo, prefira micro e mid.",
    "Se a marca vende online, strategy vendas, tactics publipost e link, commercialTerms fixo e comissao com commission.mode percent.",
    "Se a marca só quer presença, strategy alcance ou engajamento, tactics publipost e commercialTerms fixo, com fixedFeePerPost em reais.",
    "Não use permuta. Não invente produto com estoque. Não preencha datas, applicationCap, termsAccepted, inviteIds, requiredCreatorFields, formId, coverImage nem communityLink.",
    "Em notes, escreva para cada etapa uma justificativa clara em português (1 a 2 frases), citando um fato concreto do site e explicando por que aquela escolha foi feita.",
    guidelinesPrompt(),
  ].join("\n")
}
