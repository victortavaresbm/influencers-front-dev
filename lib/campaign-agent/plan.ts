import type { Locale } from "@/lib/stores/preferences"
import type {
  CampaignMention,
  CampaignType,
  CampaignVisibility,
  ContentFormat,
  SocialNetwork,
} from "@/lib/mock-data/campaigns"
import type { Creator } from "@/lib/mock-data/creators"

export type AmountId = "roster" | "budget"

export type PlanSegment = { type: "text"; text: string } | { type: "amount"; id: AmountId }

export type AgentTool =
  | "create_campaign"
  | "find_creators_by_content"
  | "assess_creators"

export interface AgentStep {
  id: "create" | "find" | "assess"
  tool: AgentTool
  mode: "read" | "write"
  pausesForApproval: boolean
  segments: PlanSegment[]
}

export interface AgentBrief {
  title: string
  objective: string
  targetAudience: string
  toneOfVoice: string
  keyMessages: string[]
  doList: string[]
  dontList: string[]
  mandatoryElements: string[]
}

export interface AgentDraft {
  name: string
  description: string
  objective: string
  type: CampaignType
  budget: number
  startDate: string
  endDate: string
  targetNiches: string[]
  targetNetworks: string[]
  minFollowers: number
  maxFollowers: number
  minEngagement: number
  mandatoryHashtags: string[]
  mandatoryMentions: CampaignMention[]
  contentFormats: ContentFormat[]
  visibility: CampaignVisibility
  rosterSize: number
  includeRoster: boolean
  brand: string
  themeNoun: string
  launch: boolean
  brief: AgentBrief
}

export interface AgentPlan {
  prompt: string
  summary: string
  draft: AgentDraft
  steps: AgentStep[]
  revisionNote: string | null
}

export type FitLevel = "high" | "mid" | "low"

export type FitReason =
  | { code: "niche"; names: string }
  | { code: "content"; words: string }
  | { code: "network"; names: string }
  | { code: "engagement"; value: string }
  | { code: "busy" }
  | { code: "audience" }

export interface RankedCreator {
  creator: Creator
  score: number
  fit: FitLevel
  reasons: FitReason[]
}

export interface PlanOptions {
  locale: Locale
  brandFallback: string
}

const TYPE_ORDER: CampaignType[] = [
  "ugc",
  "seeding",
  "embaixador",
  "live",
  "afiliado",
  "conversao",
  "engajamento",
  "awareness",
]

const TYPE_PATTERN: Record<CampaignType, RegExp> = {
  ugc: /\bugc\b|user generated|conte[uú]do para an[uú]ncio/i,
  seeding: /\bseeding\b|envio de produto|enviar o produto|gifted/i,
  embaixador: /embaixador|ambassador|embajador/i,
  live: /live commerce|ao vivo|\blive\b/i,
  afiliado: /afiliad|affiliate|comisi[oó]n por venta|comiss[aã]o por venda/i,
  conversao: /convers[aã]o|conversion|conversi[oó]n|\bcupom\b|\bcup[oó]n\b/i,
  engajamento: /engajamento|engagement|comunidade|comunidad/i,
  awareness: /awareness|lan[cç]amento|lanzamiento|\blaunch\b|alcance|divulga/i,
}

const TYPE_BUDGET: Record<CampaignType, number> = {
  awareness: 80000,
  engajamento: 40000,
  ugc: 25000,
  seeding: 20000,
  embaixador: 120000,
  live: 30000,
  conversao: 60000,
  afiliado: 35000,
}

const TYPE_FORMATS: Record<CampaignType, ContentFormat[]> = {
  awareness: ["reels", "stories"],
  engajamento: ["reels", "feed"],
  ugc: ["reels", "tiktok"],
  seeding: ["reels", "stories"],
  embaixador: ["reels", "stories", "feed"],
  live: ["live"],
  conversao: ["reels", "stories"],
  afiliado: ["reels", "stories", "shorts"],
}

const TYPE_NETWORKS: Record<CampaignType, SocialNetwork[]> = {
  awareness: ["instagram", "tiktok"],
  engajamento: ["instagram", "tiktok"],
  ugc: ["instagram", "tiktok"],
  seeding: ["instagram", "tiktok"],
  embaixador: ["instagram"],
  live: ["instagram", "tiktok"],
  conversao: ["instagram", "tiktok"],
  afiliado: ["instagram", "youtube"],
}

const NICHE_KEYWORDS: { niche: string; pattern: RegExp }[] = [
  { niche: "beleza", pattern: /beleza|skincare|maquiagem|beauty|cabelo|cosm[eé]t/i },
  { niche: "moda", pattern: /moda|fashion|roupa|\blook\b/i },
  { niche: "fitness", pattern: /fitness|treino|academia|\bgym\b/i },
  { niche: "gastronomia", pattern: /gastronomia|comida|\bfood\b|restaurante|receita/i },
  { niche: "tecnologia", pattern: /tecnologia|\btech\b|gadget|carro|automot|el[eé]tric|electric|ve[ií]culo|mobilidade|\bcar\b/i },
  { niche: "lifestyle", pattern: /lifestyle|estilo de vida/i },
  { niche: "humor", pattern: /humor|com[eé]dia/i },
  { niche: "games", pattern: /\bgames?\b|gamer|\bjogo/i },
  { niche: "finanças", pattern: /finan[cç]|investimento|dinheiro/i },
  { niche: "viagem", pattern: /viagem|travel|turismo/i },
  { niche: "maternidade", pattern: /maternidade|maternidad|\bm[aã]e\b|beb[eê]/i },
  { niche: "sustentabilidade", pattern: /sustent|ecol[oó]g/i },
  { niche: "pets", pattern: /\bpets?\b|cachorro|gato/i },
  { niche: "decoração", pattern: /decora|interiores/i },
  { niche: "esportes", pattern: /esporte|futebol|\bsport/i },
]

const CONTENT_SYNONYMS: Record<string, string[]> = {
  beleza: ["beleza", "skincare", "maquiagem", "beauty"],
  moda: ["moda", "fashion", "estilo"],
  fitness: ["fitness", "treino", "academia"],
  gastronomia: ["gastronomia", "comida", "receita", "food"],
  tecnologia: ["tech", "gadget", "tecnologia", "carro", "eletrico", "electric"],
  lifestyle: ["lifestyle", "rotina"],
  humor: ["humor", "comedia"],
  games: ["game", "gamer", "jogo"],
  finanças: ["financa", "investimento", "dinheiro"],
  viagem: ["viagem", "travel", "turismo"],
  maternidade: ["maternidade", "mae", "bebe"],
  sustentabilidade: ["sustent", "eco"],
  pets: ["pet", "cachorro", "gato"],
  decoração: ["decor", "casa", "design"],
  esportes: ["corrida", "trilha", "esporte", "futebol"],
}

const BRAND_STOP = new Set([
  "the",
  "their",
  "this",
  "that",
  "your",
  "uma",
  "uns",
  "com",
  "para",
  "and",
  "new",
  "nova",
  "novo",
  "campanha",
  "campaign",
  "campana",
  "criar",
  "create",
  "lancar",
  "lançar",
  "launch",
  "lanzar",
  "identificar",
  "encontrar",
  "instagram",
  "tiktok",
  "youtube",
])

const MONTHS: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  marco: 2,
  março: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
  enero: 0,
  febrero: 1,
  marzo: 2,
  mayo: 4,
  junio: 5,
  julio: 6,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
}

interface Signals {
  brand?: string
  themeNoun?: string
  launch?: boolean
  roster?: number
  rosterDelta?: number
  budget?: number
  type?: CampaignType
  niches?: string[]
  networks?: SocialNetwork[]
  followers?: { min: number; max: number }
  minEngagement?: number
  includeRoster?: boolean
  hashtags?: string[]
  startDate?: string
  endDate?: string
}

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function todayISO() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function formatISO(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function addDays(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return formatISO(date)
}

function parseNumber(raw: string, unit?: string) {
  const cleaned = raw.trim()
  const normalized = /^\d{1,3}(\.\d{3})+$/.test(cleaned) ? cleaned.replace(/\./g, "") : cleaned.replace(",", ".")
  let value = Number(normalized)
  if (!Number.isFinite(value)) return null
  const suffix = fold(unit ?? "")
  if (suffix === "mil" || suffix === "k") value *= 1000
  if (suffix === "mi" || suffix === "milhao" || suffix === "milhão" || suffix === "million") value *= 1_000_000
  return Math.round(value)
}

function cleanBrand(raw: string) {
  const parts = raw.trim().split(/\s+/)
  const kept: string[] = []
  for (const part of parts) {
    const token = part.replace(/[.,;:]+$/g, "")
    if (!token) break
    if (BRAND_STOP.has(fold(token))) break
    if (kept.length > 0 && token[0] === token[0].toLowerCase()) break
    kept.push(token)
    if (kept.length === 3) break
  }
  const brand = kept.join(" ").trim()
  if (brand.length < 2) return null
  if (!/\p{L}/u.test(brand)) return null
  if (BRAND_STOP.has(fold(brand))) return null
  return brand
}

function detectBrand(text: string, fallback: string) {
  const patterns = [
    /(?:para(?:\s+(?:a|o|el|la))?|for|brand|marca)\s+([\p{L}][\p{L}0-9&.'-]*(?:\s+\p{Lu}[\p{L}0-9&.'-]*){0,2})/giu,
    /\bda\s+(\p{Lu}[\p{L}0-9&.'-]*)/gu,
  ]
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const brand = cleanBrand(match[1] ?? "")
      if (brand) return brand
    }
  }
  if (fallback && fold(text).includes(fold(fallback))) return fallback
  return undefined
}

function detectTheme(text: string) {
  const launch = text.match(
    /\b(?:lan[cç]ar|launch|lanzar)\b\s+(?:uma|the|an|um|el|la|un|una|o|a)?\s*(.+?)(?=\s+e\s+(?:identificar|encontrar|buscar|mont|selecion|list)|\s+and\s+(?:identify|find|select)|\s+y\s+(?:identificar|encontrar)|[,.]|$)/i,
  )
  if (launch?.[1]) {
    const noun = launch[1].replace(/\s+/g, " ").trim()
    if (noun.length > 1) return { themeNoun: noun, launch: true }
  }
  const typed = text.match(/\b(?:seeding|ugc)\b\s+(?:de|of|para|for)?\s*([^,.\n]+?)(?=\s+(?:para|for|com|with|e|and|y)\s+|$)/i)
  if (typed?.[1]) {
    const noun = acceptableNoun(typed[1])
    if (noun) return { themeNoun: noun, launch: false }
  }
  const focus = text.match(/(?:foco em|focus on|enfoc\w* en)\s+([^,.\n]+)/i)
  if (focus?.[1]) {
    const noun = focus[1].replace(/\s+/g, " ").trim()
    if (noun.length > 1) return { themeNoun: noun, launch: false }
  }
  const about = /\b(?:sobre|about|de)\s+([a-zà-ú][\wà-ú]{2,})/gi
  for (const match of text.matchAll(about)) {
    const noun = acceptableNoun(match[1] ?? "")
    if (noun) return { themeNoun: noun, launch: false }
  }
  return {}
}

function acceptableNoun(noun: string) {
  const clean = noun.replace(/[.,;:]+$/g, "").replace(/\s+/g, " ").trim()
  if (clean.length < 3) return null
  if (BRAND_STOP.has(fold(clean))) return null
  if (/^(afiliados?|affiliates?|seeding|ugc|awareness|engajamento|engagement|campanha|campaign|creators?|influencers?|influenciadores|microinfluenciadores)$/i.test(clean)) {
    return null
  }
  return clean
}

function detectRoster(text: string) {
  const explicit = text.match(
    /(\d{1,2})\s+(?:[\p{L}]+\s+){0,3}?(?:nano|micro|macro|mega|m[eé]dios?\s+)?(?:influenciadores|influencers|creators|criadores|perfis|personas)/iu,
  )
  const rosterOf = text.match(/(?:roster of|lista de|lista com)\s*(\d{1,2})/i)
  const raw = explicit?.[1] ?? rosterOf?.[1]
  if (raw) return { roster: Math.min(30, Math.max(1, Number(raw))) }
  if (/mais creators|more creators|m[aá]s creators|aument\w* a lista|aument\w* os creators/i.test(text)) {
    return { rosterDelta: 5 }
  }
  if (/menos creators|fewer creators|menos influenci/i.test(text)) return { rosterDelta: -5 }
  return {}
}

function detectBudget(text: string) {
  const labeled = text.match(
    /(?:or[cç]amento|budget|investimento|presupuesto)\s*(?:de|of|:)?\s*(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+(?:[.,]\d+)?)\s*(mil|k|milh[aã]o|mi|million)?/i,
  )
  const money = text.match(/r\$\s*(\d{1,3}(?:\.\d{3})+|\d+(?:[.,]\d+)?)\s*(mil|k|milh[aã]o|mi)?/i)
  const match = labeled ?? money
  if (!match) return undefined
  return parseNumber(match[1], match[2]) ?? undefined
}

function detectType(text: string) {
  for (const type of TYPE_ORDER) {
    if (TYPE_PATTERN[type].test(text)) return type
  }
  return undefined
}

function detectNiches(text: string) {
  const niches = NICHE_KEYWORDS.filter((item) => item.pattern.test(text)).map((item) => item.niche)
  return niches.length ? niches.slice(0, 3) : undefined
}

function detectNetworks(text: string): SocialNetwork[] | undefined {
  const networks: SocialNetwork[] = []
  if (/instagram/i.test(text)) networks.push("instagram")
  if (/tik\s?tok/i.test(text)) networks.push("tiktok")
  if (/youtube/i.test(text)) networks.push("youtube")
  return networks.length ? networks : undefined
}

function detectFollowers(text: string) {
  const tiers = [
    { pattern: /\bnano/i, min: 1_000, max: 10_000 },
    { pattern: /\bmicro/i, min: 10_000, max: 50_000 },
    { pattern: /\bm[eé]dio|\bmid\b/i, min: 50_000, max: 500_000 },
    { pattern: /\bmacro/i, min: 500_000, max: 1_000_000 },
    { pattern: /\bmega/i, min: 1_000_000, max: 10_000_000 },
  ]
  const tier = tiers.find((item) => item.pattern.test(text))
  return tier ? { min: tier.min, max: tier.max } : undefined
}

function detectEngagement(text: string) {
  const match = text.match(
    /(?:engajamento|engagement|engagement rate)\s*(?:de|of|acima de|above|m[ií]nimo|minimum)?\s*(\d+(?:[.,]\d+)?)\s*%/i,
  )
  if (!match) return undefined
  const value = Number(match[1].replace(",", "."))
  return Number.isFinite(value) ? value : undefined
}

function detectRosterFlag(text: string) {
  const off = /sem creators|sem influenci|n[aã]o (?:quero|buscar|busque|inclua).{0,40}(?:creators|influenci)|skip (?:the )?(?:roster|creators)|without creators|solo la campa[nñ]a|s[oó] a campanha|apenas a campanha|only the campaign/i
  const on = /com creators|inclua creators|adicione creators|add creators|buscar creators|encontrar creators|identify .{0,20}creators/i
  const offAt = text.search(off)
  const onAt = text.search(on)
  if (offAt === -1 && onAt === -1) return undefined
  if (offAt === -1) return true
  if (onAt === -1) return false
  return onAt > offAt
}

function detectHashtags(text: string) {
  const tags = text.match(/#[\p{L}\d_]+/gu) ?? []
  return tags.length ? [...new Set(tags)] : undefined
}

function detectDates(text: string) {
  const folded = fold(text)
  const monthName = Object.keys(MONTHS).find((name) => folded.includes(fold(name)))
  const today = todayISO()
  const [year] = today.split("-").map(Number)
  if (monthName) {
    const monthIndex = MONTHS[monthName]
    let useYear = year
    const endThisYear = new Date(year, monthIndex + 1, 0)
    if (formatISO(endThisYear) < today) useYear += 1
    const start = new Date(useYear, monthIndex, 1)
    const end = new Date(useYear, monthIndex + 1, 0)
    const startISO = formatISO(start) < today && useYear === year ? today : formatISO(start)
    return { startDate: startISO, endDate: formatISO(end) }
  }
  const days = text.match(/(\d{1,3})\s*d[ií]as|(\d{1,3})\s*days/i)
  const dayCount = Number(days?.[1] ?? days?.[2])
  if (dayCount > 0) return { startDate: today, endDate: addDays(today, dayCount) }
  const months = text.match(/(\d{1,2})\s*meses|(\d{1,2})\s*months/i)
  const monthCount = Number(months?.[1] ?? months?.[2])
  if (monthCount > 0) return { startDate: today, endDate: addDays(today, monthCount * 30) }
  return {}
}

function detect(text: string, fallback: string): Signals {
  const theme = detectTheme(text)
  const roster = detectRoster(text)
  const dates = detectDates(text)
  return {
    brand: detectBrand(text, fallback),
    themeNoun: theme.themeNoun,
    launch: theme.launch,
    roster: roster.roster,
    rosterDelta: roster.rosterDelta,
    budget: detectBudget(text),
    type: detectType(text),
    niches: detectNiches(text),
    networks: detectNetworks(text),
    followers: detectFollowers(text),
    minEngagement: detectEngagement(text),
    includeRoster: detectRosterFlag(text),
    hashtags: detectHashtags(text),
    startDate: dates.startDate,
    endDate: dates.endDate,
  }
}

function tagFrom(value: string) {
  const clean = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "")
  if (clean.length < 2) return null
  if (value === value.toUpperCase() && value.length <= 6) return `#${value.replace(/[^a-zA-Z0-9]/g, "")}`
  return `#${clean.charAt(0).toUpperCase()}${clean.slice(1)}`
}

function hashtagsFor(brand: string, themeNoun: string, existing: string[]) {
  const skip = new Set(["nova", "novo", "new", "campanha", "campaign", "the", "para", "sobre", "lanzamiento", "lancamento"])
  const theme = FALLBACK_THEME.has(themeNoun)
    ? ""
    : themeNoun
        .split(/\s+/)
        .map((word) => fold(word))
        .filter((word) => word.length > 2 && !skip.has(word))
        .slice(0, 3)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
  const tags = [tagFrom(brand), theme ? `#${theme}` : null, ...existing].filter((tag): tag is string => Boolean(tag))
  return [...new Set(tags)].slice(0, 4)
}

function mentionsFor(brand: string, networks: string[]): CampaignMention[] {
  const slug = fold(brand).replace(/[^a-z0-9]/g, "")
  if (!slug) return []
  return networks
    .filter((network): network is SocialNetwork => network === "instagram" || network === "tiktok" || network === "youtube")
    .map((network) => {
      const handle = network === "tiktok" ? `@${slug}tt` : network === "youtube" ? `@${slug}yt` : `@${slug}`
      return { network, handle }
    })
}

function defaultNiches(type: CampaignType) {
  if (type === "ugc" || type === "seeding") return ["beleza", "lifestyle"]
  if (type === "afiliado" || type === "conversao") return ["lifestyle"]
  return ["lifestyle"]
}

function titleCase(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const FALLBACK_THEME = new Set(["a nova campanha", "the new campaign", "la nueva campaña"])

function campaignName(brand: string, themeNoun: string, launch: boolean, locale: Locale) {
  if (FALLBACK_THEME.has(themeNoun)) {
    if (locale === "en") return `${brand} — New campaign`
    if (locale === "es") return `${brand} — Nueva campaña`
    return `${brand} — Nova campanha`
  }
  const noun = titleCase(themeNoun)
  if (launch) {
    if (locale === "en") return `${brand} — ${noun} launch`.slice(0, 100)
    if (locale === "es") return `${brand} — Lanzamiento de ${themeNoun}`.slice(0, 100)
    const article = feminineLaunch(themeNoun) ? "da" : "do"
    return `${brand} — Lançamento ${article} ${themeNoun}`.slice(0, 100)
  }
  return `${brand} — ${noun}`.slice(0, 100)
}

function objectiveFor(locale: Locale, type: CampaignType, brand: string, theme: string) {
  const lines: Record<Locale, Record<CampaignType, string>> = {
    pt: {
      awareness: `Gerar reconhecimento da ${brand} para ${theme}.`,
      engajamento: `Aumentar a conversa da audiência com a ${brand} sobre ${theme}.`,
      ugc: `Produzir peças autênticas da ${brand} sobre ${theme} para anúncios e redes da marca.`,
      seeding: `Colocar ${theme} na rotina de creators e gerar conteúdo orgânico da ${brand}.`,
      embaixador: `Montar um grupo que representa a ${brand} ao longo do tempo, falando de ${theme}.`,
      live: `Vender ${theme} ao vivo, com demonstração da ${brand} durante a transmissão.`,
      conversao: `Gerar cliques e pedidos de ${theme} com uma oferta direta da ${brand}.`,
      afiliado: `Ativar creators da ${brand} no modelo de comissão por venda de ${theme}.`,
    },
    en: {
      awareness: `Build awareness for ${brand} around ${theme}.`,
      engajamento: `Get people talking with ${brand} about ${theme}.`,
      ugc: `Produce authentic ${brand} assets about ${theme} for ads and owned channels.`,
      seeding: `Put ${theme} into creators' routines and earn organic ${brand} content.`,
      embaixador: `Build a group that represents ${brand} over time while talking about ${theme}.`,
      live: `Sell ${theme} live, with a ${brand} demo during the broadcast.`,
      conversao: `Drive clicks and orders for ${theme} with a direct ${brand} offer.`,
      afiliado: `Activate ${brand} creators on commission for ${theme}.`,
    },
    es: {
      awareness: `Generar reconocimiento de ${brand} para ${theme}.`,
      engajamento: `Aumentar la conversación de la audiencia con ${brand} sobre ${theme}.`,
      ugc: `Producir piezas auténticas de ${brand} sobre ${theme} para anuncios y redes de la marca.`,
      seeding: `Poner ${theme} en la rutina de creators y generar contenido orgánico de ${brand}.`,
      embaixador: `Armar un grupo que represente a ${brand} en el tiempo, hablando de ${theme}.`,
      live: `Vender ${theme} en vivo, con una demostración de ${brand} durante la transmisión.`,
      conversao: `Generar clics y pedidos de ${theme} con una oferta directa de ${brand}.`,
      afiliado: `Activar creators de ${brand} con comisión por venta de ${theme}.`,
    },
  }
  return lines[locale][type]
}

function toneFor(locale: Locale, type: CampaignType) {
  const tones: Record<Locale, Record<CampaignType, string>> = {
    pt: {
      awareness: "Próximo, inspirador e concreto.",
      engajamento: "Conversado, com uma pergunta para a audiência.",
      ugc: "Natural, como um relato de quem usa.",
      seeding: "Espontâneo, sem texto decorado.",
      embaixador: "Consistente com a voz da marca.",
      live: "Falado, demonstrando o produto ao vivo.",
      conversao: "Direto, com a oferta visível.",
      afiliado: "Direto, com a oferta e o caminho da compra.",
    },
    en: {
      awareness: "Close, inspiring, and concrete.",
      engajamento: "Conversational, with a question for the audience.",
      ugc: "Natural, like someone who actually uses it.",
      seeding: "Spontaneous, without a scripted read.",
      embaixador: "Consistent with the brand voice.",
      live: "Spoken, demonstrating the product live.",
      conversao: "Direct, with the offer visible.",
      afiliado: "Direct, with the offer and a clear way to buy.",
    },
    es: {
      awareness: "Cercano, inspirador y concreto.",
      engajamento: "Conversado, con una pregunta para la audiencia.",
      ugc: "Natural, como el relato de quien lo usa.",
      seeding: "Espontáneo, sin texto memorizado.",
      embaixador: "Consistente con la voz de la marca.",
      live: "Hablado, demostrando el producto en vivo.",
      conversao: "Directo, con la oferta visible.",
      afiliado: "Directo, con la oferta y el camino de compra.",
    },
  }
  return tones[locale][type]
}

function listCopy(locale: Locale, type: CampaignType) {
  const pt = {
    messages: ["Mostre o produto em uso real, com a sua voz.", "Feche com um próximo passo claro para quem assiste.", "Use as hashtags e o @ obrigatórios."],
    dos: ["Falar em primeira pessoa", "Mostrar o produto de perto", "Incluir as hashtags e menções obrigatórias", "Gravar com luz e áudio limpos"],
    donts: ["Não comparar com concorrentes", "Não prometer resultado que a marca não sustenta", "Não ocultar que é uma parceria"],
  }
  const en = {
    messages: ["Show the product in real use, in your own voice.", "Close with a clear next step for the viewer.", "Use the required hashtags and @."],
    dos: ["Speak in the first person", "Show the product up close", "Include the required hashtags and mentions", "Record with clean light and audio"],
    donts: ["Don't compare with competitors", "Don't promise a result the brand can't support", "Don't hide that this is a partnership"],
  }
  const es = {
    messages: ["Muestra el producto en uso real, con tu voz.", "Cierra con un siguiente paso claro para quien mira.", "Usa los hashtags y el @ obligatorios."],
    dos: ["Hablar en primera persona", "Mostrar el producto de cerca", "Incluir los hashtags y las menciones obligatorias", "Grabar con luz y audio limpios"],
    donts: ["No comparar con competidores", "No prometer un resultado que la marca no sostiene", "No ocultar que es una colaboración"],
  }
  const base = locale === "en" ? en : locale === "es" ? es : pt
  if (type === "afiliado" || type === "conversao") {
    base.messages = locale === "en"
      ? ["Lead with the offer.", "Show how to use the coupon or link.", "Say what the person gets by buying now."]
      : locale === "es"
        ? ["Empieza por la oferta.", "Muestra cómo usar el cupón o el enlace.", "Di qué gana la persona al comprar ahora."]
        : ["Comece pela oferta.", "Mostre como usar o cupom ou o link.", "Diga o que a pessoa ganha comprando agora."]
  }
  if (type === "ugc") {
    base.donts = locale === "en"
      ? ["Don't over-produce it so it stops looking real", "Don't mention competitors", "Don't hide that this is a partnership"]
      : locale === "es"
        ? ["No producirlo tanto que deje de parecer real", "No mencionar competidores", "No ocultar que es una colaboración"]
        : ["Não produzir demais a ponto de parecer anúncio de estúdio", "Não mencionar concorrentes", "Não ocultar que é uma parceria"]
  }
  return base
}

function followersLabel(value: number, locale: Locale) {
  return value.toLocaleString(locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR")
}

function buildBrief(
  locale: Locale,
  brand: string,
  themeNoun: string,
  launch: boolean,
  type: CampaignType,
  niches: string[],
  minFollowers: number,
  maxFollowers: number,
  minEngagement: number,
  hashtags: string[],
  mentions: CampaignMention[],
  name: string,
): AgentBrief {
  const theme = launch
    ? locale === "en"
      ? `the ${themeNoun} launch`
      : locale === "es"
        ? `el lanzamiento de ${themeNoun}`
        : `o lançamento de ${themeNoun}`
    : themeNoun
  const copy = listCopy(locale, type)
  const nicheText = niches.join(", ") || (locale === "en" ? "lifestyle" : "lifestyle")
  const audience = locale === "en"
    ? `${titleCase(nicheText)} creators, engagement from ${minEngagement}%, audience between ${followersLabel(minFollowers, locale)} and ${followersLabel(maxFollowers, locale)}.`
    : locale === "es"
      ? `Creators de ${nicheText}, engagement desde ${minEngagement}% y audiencia entre ${followersLabel(minFollowers, locale)} y ${followersLabel(maxFollowers, locale)}.`
      : `Creators de ${nicheText}, com engajamento a partir de ${minEngagement}% e audiência entre ${followersLabel(minFollowers, locale)} e ${followersLabel(maxFollowers, locale)}.`
  const elements = [...hashtags, ...mentions.map((mention) => mention.handle)]
  return {
    title: locale === "en" ? `Brief — ${name}` : `Briefing — ${name}`,
    objective: objectiveFor(locale, type, brand, theme),
    targetAudience: audience,
    toneOfVoice: toneFor(locale, type),
    keyMessages: copy.messages,
    doList: copy.dos,
    dontList: copy.donts,
    mandatoryElements: elements,
  }
}

function feminineLaunch(themeNoun: string) {
  return /^(linha|cole[cç][aã]o|marca|novidade|s[eé]rie)\b/i.test(themeNoun)
}

function themeForCopy(themeNoun: string, launch: boolean, locale: Locale) {
  if (!launch) return themeNoun
  if (locale === "en") return `the new ${themeNoun} launch`
  if (locale === "es") return `el lanzamiento de ${themeNoun}`
  return feminineLaunch(themeNoun) ? `o lançamento da ${themeNoun}` : `o lançamento do ${themeNoun}`
}

function buildSteps(draft: AgentDraft, locale: Locale): AgentStep[] {
  const named = !FALLBACK_THEME.has(draft.themeNoun)
  const theme = named ? themeForCopy(draft.themeNoun, draft.launch, locale) : draft.themeNoun
  const createText = !named
    ? locale === "en"
      ? "Create the campaign."
      : locale === "es"
        ? "Crear la campaña."
        : "Criar a campanha."
    : draft.launch
    ? locale === "en"
      ? `Create the campaign for ${theme}.`
      : locale === "es"
        ? `Crear la campaña para ${theme}.`
        : `Criar a campanha para ${theme}.`
    : locale === "en"
      ? `Create the ${draft.type} campaign for ${theme}.`
      : locale === "es"
        ? `Crear la campaña de ${draft.type} sobre ${theme}.`
        : `Criar a campanha de ${draft.type} sobre ${theme}.`
  const steps: AgentStep[] = [
    {
      id: "create",
      tool: "create_campaign",
      mode: "write",
      pausesForApproval: true,
      segments: draft.includeRoster
        ? [{ type: "text", text: createText }]
        : [
            {
              type: "text",
              text: locale === "en"
                ? `Create the campaign for ${theme}, with a budget of R$ `
                : locale === "es"
                  ? `Crear la campaña para ${theme}, con presupuesto de R$ `
                  : `Criar a campanha para ${theme}, com orçamento de R$ `,
            },
            { type: "amount", id: "budget" },
            { type: "text", text: "." },
          ],
    },
  ]
  if (draft.includeRoster) {
    const findTail = draft.launch
      ? locale === "en"
        ? ` creators whose content matches the ${draft.themeNoun} launch theme.`
        : locale === "es"
          ? ` creators cuyo contenido combina con ${theme}.`
          : ` creators cujo conteúdo combina com ${theme}.`
      : locale === "en"
        ? ` creators whose content matches ${theme}.`
        : locale === "es"
          ? ` creators cuyo contenido combina con ${theme}.`
          : ` creators cujo conteúdo combina com ${theme}.`
    steps.push(
      {
        id: "find",
        tool: "find_creators_by_content",
        mode: "read",
        pausesForApproval: false,
        segments: [
          { type: "text", text: locale === "en" ? "Find " : locale === "es" ? "Encontrar " : "Encontrar " },
          { type: "amount", id: "roster" },
          { type: "text", text: findTail },
        ],
      },
      {
        id: "assess",
        tool: "assess_creators",
        mode: "read",
        pausesForApproval: false,
        segments: [
          { type: "text", text: locale === "en" ? "Assess " : locale === "es" ? "Evaluar " : "Avaliar " },
          { type: "amount", id: "roster" },
          {
            type: "text",
            text: locale === "en"
              ? " creators to ensure they are the right fit for the brand."
              : locale === "es"
                ? " creators para confirmar que encajan con la marca."
                : " creators para garantir que combinam com a marca.",
          },
        ],
      },
    )
  }
  return steps
}

function draftFrom(prompt: string, signals: Signals, options: PlanOptions, base?: AgentDraft): AgentDraft {
  const locale = options.locale
  const type = signals.type ?? base?.type ?? "awareness"
  const brand = signals.brand ?? base?.brand ?? (options.brandFallback || "Marca")
  const launch = signals.launch ?? (signals.themeNoun ? false : base?.launch ?? false)
  const themeNoun = signals.themeNoun ?? base?.themeNoun ?? (locale === "en" ? "the new campaign" : locale === "es" ? "la nueva campaña" : "a nova campanha")
  const rosterBase = base?.rosterSize ?? 10
  const rosterSize = signals.roster
    ? signals.roster
    : signals.rosterDelta
      ? Math.min(30, Math.max(1, rosterBase + signals.rosterDelta))
      : rosterBase
  const includeRoster = signals.includeRoster ?? base?.includeRoster ?? true
  const niches = signals.niches ?? base?.targetNiches ?? (signals.type ? defaultNiches(type) : defaultNiches(type))
  const networks = signals.networks ?? (signals.type ? TYPE_NETWORKS[type] : base?.targetNetworks ?? TYPE_NETWORKS[type])
  const followers = signals.followers ?? {
    min: base?.minFollowers ?? 10_000,
    max: base?.maxFollowers ?? 1_000_000,
  }
  const minEngagement = signals.minEngagement ?? base?.minEngagement ?? (type === "embaixador" ? 3.5 : 2.5)
  const budget = signals.budget ?? base?.budget ?? TYPE_BUDGET[type]
  const today = todayISO()
  const startDate = signals.startDate ?? base?.startDate ?? today
  const rawEnd = signals.endDate ?? base?.endDate ?? addDays(startDate, 45)
  const endDate = rawEnd < startDate ? addDays(startDate, 45) : rawEnd
  const hashtags = signals.hashtags ?? (signals.brand || signals.themeNoun || !base
    ? hashtagsFor(brand, themeNoun, signals.hashtags ?? [])
    : base.mandatoryHashtags)
  const mentions = signals.brand || signals.networks || !base ? mentionsFor(brand, networks) : base.mandatoryMentions
  const formats = signals.type ? TYPE_FORMATS[type] : base?.contentFormats ?? TYPE_FORMATS[type]
  const name = signals.brand || signals.themeNoun || signals.type || !base
    ? campaignName(brand, themeNoun, launch, locale)
    : base.name
  const objective = signals.brand || signals.themeNoun || signals.type || !base
    ? objectiveFor(locale, type, brand, themeForCopy(themeNoun, launch, locale))
    : base.objective
  const description = base?.description && !signals.themeNoun && !signals.brand ? base.description : prompt.trim()
  const brief = signals.brand || signals.themeNoun || signals.type || signals.niches || !base
    ? buildBrief(locale, brand, themeNoun, launch, type, niches, followers.min, followers.max, minEngagement, hashtags, mentions, name)
    : {
        ...base.brief,
        mandatoryElements: [...hashtags, ...mentions.map((mention) => mention.handle)],
      }
  return {
    name,
    description,
    objective,
    type,
    budget,
    startDate,
    endDate,
    targetNiches: niches,
    targetNetworks: networks,
    minFollowers: followers.min,
    maxFollowers: followers.max,
    minEngagement,
    mandatoryHashtags: hashtags,
    mandatoryMentions: mentions,
    contentFormats: formats,
    visibility: base?.visibility ?? "secreta",
    rosterSize,
    includeRoster,
    brand,
    themeNoun,
    launch,
    brief,
  }
}

function money(locale: Locale, value: number) {
  return value.toLocaleString(locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

function revisionNote(before: AgentDraft, after: AgentDraft, locale: Locale) {
  const parts: string[] = []
  const say = {
    pt: {
      roster: `a lista para ${after.rosterSize} creators`,
      budget: `o orçamento para ${money(locale, after.budget)}`,
      type: `o tipo para ${after.type}`,
      brand: `a marca para ${after.brand}`,
      theme: `o tema para ${after.themeNoun}`,
      networks: `as redes para ${after.targetNetworks.join(", ")}`,
      niches: `os nichos para ${after.targetNiches.join(", ")}`,
      off: "sem a busca de creators",
      on: "com a busca de creators",
      dates: "as datas",
      lead: "Ajustei o plano",
      unchanged: "Não encontrei um ajuste claro. Diga o número de creators, o orçamento, o tipo ou o que deve sair do plano.",
    },
    en: {
      roster: `the roster to ${after.rosterSize} creators`,
      budget: `the budget to ${money(locale, after.budget)}`,
      type: `the type to ${after.type}`,
      brand: `the brand to ${after.brand}`,
      theme: `the theme to ${after.themeNoun}`,
      networks: `the networks to ${after.targetNetworks.join(", ")}`,
      niches: `the niches to ${after.targetNiches.join(", ")}`,
      off: "without creator search",
      on: "with creator search",
      dates: "the dates",
      lead: "I updated the plan",
      unchanged: "I couldn't tell what to change. Tell me the creator count, the budget, the type, or what to drop.",
    },
    es: {
      roster: `la lista a ${after.rosterSize} creators`,
      budget: `el presupuesto a ${money(locale, after.budget)}`,
      type: `el tipo a ${after.type}`,
      brand: `la marca a ${after.brand}`,
      theme: `el tema a ${after.themeNoun}`,
      networks: `las redes a ${after.targetNetworks.join(", ")}`,
      niches: `los nichos a ${after.targetNiches.join(", ")}`,
      off: "sin la búsqueda de creators",
      on: "con la búsqueda de creators",
      dates: "las fechas",
      lead: "Ajusté el plan",
      unchanged: "No encontré un cambio claro. Dime la cantidad de creators, el presupuesto, el tipo o qué sacar del plan.",
    },
  }[locale]
  if (before.rosterSize !== after.rosterSize) parts.push(say.roster)
  if (before.budget !== after.budget) parts.push(say.budget)
  if (before.type !== after.type) parts.push(say.type)
  if (before.brand !== after.brand) parts.push(say.brand)
  if (before.themeNoun !== after.themeNoun) parts.push(say.theme)
  if (before.targetNetworks.join() !== after.targetNetworks.join()) parts.push(say.networks)
  if (before.targetNiches.join() !== after.targetNiches.join()) parts.push(say.niches)
  if (before.includeRoster && !after.includeRoster) parts.push(say.off)
  if (!before.includeRoster && after.includeRoster) parts.push(say.on)
  if (before.startDate !== after.startDate || before.endDate !== after.endDate) parts.push(say.dates)
  if (!parts.length) return say.unchanged
  return `${say.lead}: ${parts.join(", ")}.`
}

export function buildPlan(prompt: string, options: PlanOptions): AgentPlan {
  const text = prompt.trim()
  const signals = detect(text, options.brandFallback)
  const draft = draftFrom(text, signals, options)
  return {
    prompt: text,
    summary: text,
    draft,
    steps: buildSteps(draft, options.locale),
    revisionNote: null,
  }
}

export function revisePlan(plan: AgentPlan, feedback: string, options: PlanOptions): AgentPlan {
  const text = feedback.trim()
  if (!text) return plan
  if (text.length > 60 && /campanha|campaign|campaña/i.test(text)) {
    const next = buildPlan(text, options)
    const rebuilt = options.locale === "en"
      ? "I rebuilt the plan from what you wrote."
      : options.locale === "es"
        ? "Rearmé el plan con lo que escribiste."
        : "Montei o plano de novo a partir do que você escreveu."
    return { ...next, revisionNote: rebuilt }
  }
  const signals = detect(text, "")
  const draft = draftFrom(plan.prompt, signals, options, plan.draft)
  return {
    prompt: plan.prompt,
    summary: plan.summary,
    draft,
    steps: buildSteps(draft, options.locale),
    revisionNote: revisionNote(plan.draft, draft, options.locale),
  }
}

export function setPlanAmount(plan: AgentPlan, id: AmountId, value: number): AgentPlan {
  const rosterSize = id === "roster" ? Math.min(30, Math.max(1, Math.round(value) || 1)) : plan.draft.rosterSize
  const budget = id === "budget" ? Math.max(0, Math.round(value) || 0) : plan.draft.budget
  return { ...plan, draft: { ...plan.draft, rosterSize, budget } }
}

export function rankCreators(draft: AgentDraft, creators: Creator[]): RankedCreator[] {
  const tokens = new Set<string>()
  for (const niche of draft.targetNiches) {
    for (const word of CONTENT_SYNONYMS[niche] ?? [fold(niche)]) tokens.add(fold(word))
  }
  for (const word of fold(draft.themeNoun).split(/\s+/)) {
    if (word.length > 3) tokens.add(word)
  }
  const ranked = creators
    .filter((creator) => creator.status !== "blocked" && creator.approvalStatus !== "rejected")
    .map((creator) => {
      let score = 38
      const reasons: FitReason[] = []
      const nicheHits = creator.niche.filter((niche) => draft.targetNiches.includes(niche) && niche !== "lifestyle")
      const lifestyle = creator.niche.includes("lifestyle") && draft.targetNiches.includes("lifestyle")
      if (nicheHits.length) {
        score += 26 + (nicheHits.length - 1) * 6
        reasons.push({ code: "niche", names: nicheHits.join(", ") })
      } else if (lifestyle) {
        score += 8
        reasons.push({ code: "niche", names: "lifestyle" })
      }
      const blob = fold(`${creator.bio} ${creator.tags.join(" ")} ${creator.niche.join(" ")}`)
      const words = [...tokens].filter((token) => blob.includes(token)).slice(0, 3)
      if (words.length) {
        score += 16
        reasons.push({ code: "content", words: words.join(", ") })
      }
      const networks = creator.networks.filter((network) => draft.targetNetworks.includes(network.network))
      if (networks.length) {
        score += 10
        reasons.push({ code: "network", names: networks.map((network) => network.network).join(", ") })
      }
      if (creator.avgEngagement >= draft.minEngagement) {
        score += 8
        reasons.push({ code: "engagement", value: creator.avgEngagement.toLocaleString("pt-BR") })
      }
      const inRange = creator.totalFollowers >= draft.minFollowers && creator.totalFollowers <= draft.maxFollowers
      if (inRange) {
        score += 6
        reasons.push({ code: "audience" })
      }
      if (creator.status === "in_campaign") {
        score -= 4
        reasons.push({ code: "busy" })
      }
      if (creator.fraudScore > 15) score -= 18
      score = Math.max(1, Math.min(99, score))
      const fit: FitLevel = score >= 75 ? "high" : score >= 55 ? "mid" : "low"
      return { creator, score, fit, reasons: reasons.slice(0, 3) }
    })
    .sort((a, b) => b.score - a.score || b.creator.avgEngagement - a.creator.avgEngagement)
  return ranked.slice(0, draft.rosterSize)
}
