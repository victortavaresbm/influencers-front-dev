import { type Creator, type Network, type Niche } from "@/lib/mock-data/creators"
import { MONITOR_POSTS, type MonitorPost } from "@/lib/mock-data/metrics"
import { fold, isBrandCustomer, isSimilarCreator, locationTokenLabel, locationTokens, matchesAnyLocation, predominantCities, brandCreatorIds } from "@/lib/discovery/scope"
import { type FilterState } from "@/lib/stores/creators"

export type Platform = Network
export type AccountType = "creator" | "creator_group" | "brand" | "anonymous"
export type GenderFilter = "male" | "female" | "female_or_male" | "neutral"
export type PostingFrequency = "monthly" | "weekly" | "every_other_day" | "daily"
export type SearchMode = "ai" | "legacy"

export const PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube"]
export const PROFILE_OPEN_LIMIT = 20
export const SEARCH_LIMIT = 100
export const RESULT_PAGE_SIZE = 6
export const TODAY = "2026-11-16"

export const FOLLOWER_STEPS = [
  1000, 3000, 5000, 10000, 15000, 20000, 25000, 35000, 50000, 75000, 100000, 125000, 150000, 250000,
  500000, 1000000,
]
export const VIEW_STEPS = FOLLOWER_STEPS
export const ENGAGEMENT_STEPS = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
export const GROWTH_STEPS = [10, 20, 30, 40, 50, 100, 150, 300, 400]
export const AGE_STEPS = [18, 25, 35, 45, 65]
export const FAKE_STEPS = [10, 15, 20, 25, 30, 35, 40]
export const POSTED_WITHIN = [3, 6, 9, 12]
export const LANGUAGES = [
  "Português",
  "English",
  "French",
  "German",
  "Spanish",
  "Polish",
  "Italian",
  "Arabic",
  "Turkish",
  "Russian",
  "Afrikaans",
  "Albanian",
]

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  creator: "Creator",
  creator_group: "Grupo de creators",
  brand: "Marca",
  anonymous: "Anônimo",
}

export const GENDER_LABEL: Record<GenderFilter, string> = {
  male: "Masculino",
  female: "Feminino",
  female_or_male: "Feminino ou masculino",
  neutral: "Neutro",
}

export const FREQUENCY_LABEL: Record<PostingFrequency, string> = {
  monthly: "Mensal",
  weekly: "Semanal",
  every_other_day: "Dia sim, dia não",
  daily: "Diário",
}

const FREQUENCY_RANK: Record<PostingFrequency, number> = {
  monthly: 1,
  weekly: 2,
  every_other_day: 3,
  daily: 4,
}

export const NICHES: Niche[] = [
  "beleza", "moda", "fitness", "gastronomia", "tecnologia", "lifestyle", "humor", "games",
  "finanças", "viagem", "maternidade", "sustentabilidade", "pets", "decoração", "esportes",
]

const NICHE_WORDS: Record<string, Niche> = {
  beleza: "beleza",
  beauty: "beleza",
  skincare: "beleza",
  maquiagem: "beleza",
  moda: "moda",
  fashion: "moda",
  estilo: "moda",
  fitness: "fitness",
  treino: "fitness",
  saude: "fitness",
  gastronomia: "gastronomia",
  comida: "gastronomia",
  receitas: "gastronomia",
  food: "gastronomia",
  tecnologia: "tecnologia",
  tech: "tecnologia",
  gadgets: "tecnologia",
  lifestyle: "lifestyle",
  humor: "humor",
  games: "games",
  gamer: "games",
  jogos: "games",
  financas: "finanças",
  finanças: "finanças",
  viagem: "viagem",
  viagens: "viagem",
  travel: "viagem",
  maternidade: "maternidade",
  sustentabilidade: "sustentabilidade",
  pets: "pets",
  decoracao: "decoração",
  decoração: "decoração",
  esportes: "esportes",
  sports: "esportes",
}

const PLACES: { phrase: string; token: string }[] = [
  { phrase: "sao paulo", token: "São Paulo" },
  { phrase: "sampa", token: "São Paulo" },
  { phrase: "rio de janeiro", token: "Rio de Janeiro" },
  { phrase: "curitiba", token: "Curitiba" },
  { phrase: "florianopolis", token: "Florianópolis" },
  { phrase: "belo horizonte", token: "Belo Horizonte" },
  { phrase: "campinas", token: "Campinas" },
  { phrase: "porto alegre", token: "Porto Alegre" },
  { phrase: "brasilia", token: "Brasília" },
  { phrase: "ribeirao preto", token: "Ribeirão Preto" },
  { phrase: "manaus", token: "Manaus" },
]

const STOPWORDS = new Set([
  "ex", "de", "da", "do", "das", "dos", "e", "ou", "em", "com", "para", "por", "um", "uma", "o", "a",
  "os", "as", "que", "no", "na", "creator", "creators", "criador", "criadora", "influencer",
  "influencers", "posting", "content", "conteudo", "conteúdo", "the", "and", "of", "perfil", "perfis",
])

const TRAITS: Record<string, { gender: "male" | "female"; age: number; accountType: AccountType }> = {
  c1: { gender: "female", age: 28, accountType: "creator" },
  c2: { gender: "male", age: 32, accountType: "creator" },
  c3: { gender: "female", age: 30, accountType: "creator" },
  c4: { gender: "male", age: 27, accountType: "creator" },
  c5: { gender: "female", age: 26, accountType: "creator_group" },
  c6: { gender: "male", age: 24, accountType: "creator" },
  c7: { gender: "female", age: 29, accountType: "creator" },
  c8: { gender: "male", age: 35, accountType: "creator" },
  c9: { gender: "female", age: 33, accountType: "creator" },
  c10: { gender: "male", age: 22, accountType: "creator" },
  c11: { gender: "female", age: 31, accountType: "creator" },
  c12: { gender: "female", age: 27, accountType: "creator" },
  c13: { gender: "male", age: 29, accountType: "creator" },
  c14: { gender: "female", age: 36, accountType: "anonymous" },
  c15: { gender: "male", age: 25, accountType: "creator" },
}

export interface DiscoverQuery {
  prompt: string
  creatorId: string
  lookalikeId: string
  imageLabel: string
  imageTerms: string[]
  minFollowers: number | null
  maxFollowers: number | null
  minEngagement: number | null
  hiddenLikes: boolean
  minViews: number | null
  maxViews: number | null
  minGrowth: number | null
  growthMonths: number | null
  locations: string
  audienceLocations: string
  brands: string[]
  bioInclude: string
  bioExclude: string
  gender: GenderFilter | ""
  minAge: number | null
  maxAge: number | null
  language: string
  emailAvailable: boolean
  activeOnly: boolean
  availableOnly: boolean
  brandCustomers: boolean
  ownBase: boolean
  minPosting: PostingFrequency | ""
  maxPosting: PostingFrequency | ""
  postedWithinMonths: number | null
  captionsInclude: string
  captionsExclude: string
  hashtagsInclude: string[]
  hashtagsExclude: string[]
  mentionsInclude: string[]
  mentionsExclude: string[]
  audios: string[]
  maxFakeFollowers: number | null
  accountTypes: AccountType[]
  niches: string[]
  lastPostedDays: number | null
  verifiedOnly: boolean
  hideSaved: boolean
  networks: Platform[]
}

export interface FilterChip {
  key: string
  label: string
  patch: Partial<DiscoverQuery>
}

export interface MatchContext {
  platform: Platform
  savedIds: Set<string>
  organizationId?: string
  creators: Creator[]
}

export function isPlatform(value: string): value is Platform {
  return value === "instagram" || value === "tiktok" || value === "youtube"
}

export function selectedNetworks(query: DiscoverQuery): Platform[] {
  const list = (query.networks ?? []).filter((item) => isPlatform(item))
  return list.length > 0 ? list : [...PLATFORMS]
}

export function matchingProfile(creator: Creator, query: DiscoverQuery) {
  const profiles = selectedNetworks(query)
    .map((platform) => platformProfile(creator, platform))
    .filter((profile) => profile != null)
  return profiles.sort((left, right) => right.followers - left.followers)[0] ?? null
}

export function emptyDiscoverQuery(): DiscoverQuery {
  return {
    prompt: "",
    creatorId: "",
    lookalikeId: "",
    imageLabel: "",
    imageTerms: [],
    minFollowers: null,
    maxFollowers: null,
    minEngagement: null,
    hiddenLikes: false,
    minViews: null,
    maxViews: null,
    minGrowth: null,
    growthMonths: null,
    locations: "",
    audienceLocations: "",
    brands: [],
    bioInclude: "",
    bioExclude: "",
    gender: "",
    minAge: null,
    maxAge: null,
    language: "",
    emailAvailable: false,
    activeOnly: false,
    availableOnly: false,
    brandCustomers: false,
    ownBase: false,
    minPosting: "",
    maxPosting: "",
    postedWithinMonths: null,
    captionsInclude: "",
    captionsExclude: "",
    hashtagsInclude: [],
    hashtagsExclude: [],
    mentionsInclude: [],
    mentionsExclude: [],
    audios: [],
    maxFakeFollowers: null,
    accountTypes: [],
    niches: [],
    lastPostedDays: null,
    verifiedOnly: false,
    hideSaved: false,
    networks: [...PLATFORMS],
  }
}

export function formatCompact(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}K`
  }
  return value.toLocaleString("pt-BR")
}

export function formatResultCount(count: number) {
  if (count > 1000) return "1000+ perfis"
  const noun = count === 1 ? "perfil" : "perfis"
  return `${count.toLocaleString("pt-BR")} ${noun}`
}

export function platformProfile(creator: Creator, platform: Platform) {
  return creator.networks.find((network) => network.network === platform) ?? null
}

export function creatorPosts(creatorId: string, platform?: Platform) {
  return MONITOR_POSTS.filter((post) => post.creatorId === creatorId && (!platform || post.network === platform))
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function collaborations(creatorId: string) {
  const names = new Map<string, number>()
  for (const post of MONITOR_POSTS.filter((post) => post.creatorId === creatorId)) {
    names.set(post.campaignName, (names.get(post.campaignName) ?? 0) + 1)
  }
  return [...names.entries()].map(([name, posts]) => ({ name, posts }))
}

export function accountTypeOf(creator: Creator): AccountType {
  return TRAITS[creator.id]?.accountType ?? "creator"
}

export function creatorGender(creator: Creator): "male" | "female" | "neutral" {
  return TRAITS[creator.id]?.gender ?? "neutral"
}

export function creatorAge(creator: Creator) {
  return TRAITS[creator.id]?.age ?? null
}

export function creatorLanguage() {
  return "Português"
}

export function postingFrequency(creator: Creator): PostingFrequency {
  const posts = creator.totalPosts ?? 0
  if (posts >= 180) return "daily"
  if (posts >= 90) return "every_other_day"
  if (posts >= 40) return "weekly"
  return "monthly"
}

/** Estimated growth from engagement and past campaigns, scaled to the selected period. */
export function growthPercent(creator: Creator, months: number) {
  const sixMonths = Math.min(400, Math.round(creator.avgEngagement * 4 + creator.pastCampaigns * 1.5))
  return Math.round((sixMonths / 6) * Math.max(1, months))
}

export function fakeFollowersPct(creator: Creator) {
  return Math.min(40, creator.fraudScore * 4)
}

export function hashtagIndex() {
  const counts = new Map<string, number>()
  for (const post of MONITOR_POSTS) {
    for (const tag of post.caption.match(/#[\p{L}\p{N}_]+/gu) ?? []) {
      const key = tag.toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

export function mentionIndex() {
  const counts = new Map<string, number>()
  for (const post of MONITOR_POSTS) {
    for (const mention of post.caption.match(/@[\p{L}\p{N}_.]+/gu) ?? []) {
      const key = mention.toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

export function brandIndex() {
  const counts = new Map<string, number>()
  for (const post of MONITOR_POSTS) {
    counts.set(post.campaignName, (counts.get(post.campaignName) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

export function termsFromPost(post: MonitorPost) {
  const tags = (post.caption.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((tag) => tag.slice(1))
  const words = fold(post.caption)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 4 && !STOPWORDS.has(word))
    .slice(0, 4)
  return [...new Set([...tags, ...words])].slice(0, 6)
}

export function postedWithinEnabled(query: DiscoverQuery) {
  return Boolean(
    query.prompt.trim() ||
      query.hashtagsInclude.length ||
      query.hashtagsExclude.length ||
      query.mentionsInclude.length ||
      query.mentionsExclude.length ||
      query.captionsInclude.trim() ||
      query.captionsExclude.trim() ||
      query.audios.length ||
      query.imageTerms.length
  )
}

export function isQueryActive(query: DiscoverQuery) {
  return Boolean(
    query.prompt.trim() ||
      query.creatorId ||
      query.lookalikeId ||
      query.imageLabel ||
      query.imageTerms.length ||
      query.minFollowers != null ||
      query.maxFollowers != null ||
      query.minEngagement != null ||
      query.hiddenLikes ||
      query.minViews != null ||
      query.maxViews != null ||
      query.minGrowth != null ||
      query.growthMonths != null ||
      query.locations.trim() ||
      query.audienceLocations.trim() ||
      query.brands.length ||
      query.bioInclude.trim() ||
      query.bioExclude.trim() ||
      query.gender ||
      query.minAge != null ||
      query.maxAge != null ||
      query.language ||
      query.emailAvailable ||
      query.activeOnly ||
      query.availableOnly ||
      query.brandCustomers ||
      query.ownBase ||
      query.minPosting ||
      query.maxPosting ||
      query.postedWithinMonths != null ||
      query.captionsInclude.trim() ||
      query.captionsExclude.trim() ||
      query.hashtagsInclude.length ||
      query.hashtagsExclude.length ||
      query.mentionsInclude.length ||
      query.mentionsExclude.length ||
      query.audios.length ||
      query.maxFakeFollowers != null ||
      query.accountTypes.length ||
      query.niches.length ||
      query.lastPostedDays != null ||
      query.verifiedOnly ||
      query.hideSaved
  )
}

function hasPhrase(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(text)
}

function daysBetween(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`).getTime()
  const end = new Date(`${to}T00:00:00`).getTime()
  return Math.round((end - start) / 86400000)
}

export function extractPrompt(text: string): Partial<DiscoverQuery> {
  const folded = fold(text)
  const niches = new Set<Niche>()
  for (const [word, niche] of Object.entries(NICHE_WORDS)) {
    if (hasPhrase(folded, fold(word))) niches.add(niche)
  }
  const locations: string[] = []
  for (const place of PLACES) {
    if (hasPhrase(folded, place.phrase) && !locations.includes(place.token)) locations.push(place.token)
  }
  const patch: Partial<DiscoverQuery> = { prompt: text.trim() }
  if (niches.size) patch.niches = [...niches]
  if (locations.length) patch.locations = locations.join("|")
  if (hasPhrase(folded, "nano")) {
    patch.minFollowers = null
    patch.maxFollowers = 10000
  } else if (hasPhrase(folded, "micro")) {
    patch.minFollowers = 10000
    patch.maxFollowers = 100000
  } else if (hasPhrase(folded, "mid")) {
    patch.minFollowers = 100000
    patch.maxFollowers = 500000
  } else if (hasPhrase(folded, "macro")) {
    patch.minFollowers = 500000
    patch.maxFollowers = 1000000
  } else if (hasPhrase(folded, "mega")) {
    patch.minFollowers = 1000000
    patch.maxFollowers = null
  }
  if (hasPhrase(folded, "alto engajamento")) patch.minEngagement = 3
  if (hasPhrase(folded, "feminino") || hasPhrase(folded, "mulher") || hasPhrase(folded, "mulheres")) {
    patch.gender = "female"
  } else if (hasPhrase(folded, "masculino") || hasPhrase(folded, "homem") || hasPhrase(folded, "homens")) {
    patch.gender = "male"
  }
  if (hasPhrase(folded, "portugues")) patch.language = "Português"
  if (hasPhrase(folded, "ingles") || hasPhrase(folded, "english")) patch.language = "English"
  if (hasPhrase(folded, "com e-mail") || hasPhrase(folded, "com email") || hasPhrase(folded, "email disponivel")) {
    patch.emailAvailable = true
  }
  return patch
}

function leftoverTerms(prompt: string) {
  return fold(prompt)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    .filter((word) => !NICHE_WORDS[word])
    .filter((word) => !PLACES.some((place) => place.phrase.split(" ").includes(word) || place.phrase === word))
    .filter((word) => !["nano", "micro", "mid", "macro", "mega", "feminino", "masculino", "mulher", "homem", "portugues", "ingles", "english"].includes(word))
}

function creatorBlob(creator: Creator) {
  const captions = creatorPosts(creator.id).map((post) => post.caption).join(" ")
  return fold([
    creator.name,
    creator.handle,
    creator.email,
    creator.bio,
    creator.location,
    creator.tags.join(" "),
    creator.niche.join(" "),
    captions,
  ].join(" "))
}

function captionsOf(creator: Creator) {
  return creatorPosts(creator.id).map((post) => post.caption).join(" ")
}

function hashtagHit(creator: Creator, tag: string) {
  const needle = fold(tag.replace(/^#/, ""))
  if (creator.tags.some((item) => fold(item).includes(needle))) return true
  return fold(captionsOf(creator)).includes(needle)
}

function mentionHit(creator: Creator, mention: string) {
  const needle = fold(mention.replace(/^@/, ""))
  return fold(captionsOf(creator)).includes(needle)
}

export function creatorMatches(creator: Creator, query: DiscoverQuery, context: MatchContext) {
  if (query.lookalikeId && creator.id === query.lookalikeId) return false
  const profile = matchingProfile(creator, query)
  if (!profile) return false
  if (query.creatorId && creator.id !== query.creatorId) return false
  if (query.lookalikeId) {
    const reference = context.creators.find((item) => item.id === query.lookalikeId)
    if (!reference || !isSimilarCreator(reference, creator)) return false
  }
  if (query.minFollowers != null && profile.followers < query.minFollowers) return false
  if (query.maxFollowers != null && profile.followers > query.maxFollowers) return false
  if (query.minEngagement != null && profile.engagementRate < query.minEngagement) return false
  if (query.minViews != null && profile.avgViews < query.minViews) return false
  if (query.maxViews != null && profile.avgViews > query.maxViews) return false
  if (query.hiddenLikes) {
    const posts = creatorPosts(creator.id).filter((post) => selectedNetworks(query).includes(post.network))
    if (posts.length === 0 || posts.some((post) => post.likes > 0)) return false
  }
  if (query.minGrowth != null) {
    const growth = growthPercent(creator, query.growthMonths ?? 6)
    if (growth < query.minGrowth) return false
  }
  if (query.locations.trim() && !matchesAnyLocation(creator.location, query.locations)) return false
  if (query.audienceLocations.trim()) {
    const cities = predominantCities(creator)
    if (!cities.some((city) => matchesAnyLocation(city, query.audienceLocations))) return false
  }
  if (query.brands.length && !query.brands.some((brand) => collaborations(creator.id).some((item) => fold(item.name).includes(fold(brand))))) {
    return false
  }
  if (query.bioInclude.trim() && !fold(creator.bio).includes(fold(query.bioInclude))) return false
  if (query.bioExclude.trim() && fold(creator.bio).includes(fold(query.bioExclude))) return false
  if (query.gender === "male" && creatorGender(creator) !== "male") return false
  if (query.gender === "female" && creatorGender(creator) !== "female") return false
  if (query.gender === "female_or_male" && creatorGender(creator) === "neutral") return false
  if (query.gender === "neutral" && creatorGender(creator) !== "neutral") return false
  const age = creatorAge(creator)
  if (query.minAge != null && (age == null || age < query.minAge)) return false
  if (query.maxAge != null && (age == null || age > query.maxAge)) return false
  if (query.language && creatorLanguage() !== query.language) return false
  if (query.emailAvailable && !creator.email.trim()) return false
  if (query.activeOnly && daysBetween(creator.lastActivity, TODAY) > 30) return false
  if (query.availableOnly && creator.status !== "available") return false
  if (query.brandCustomers) {
    if (!context.organizationId || !isBrandCustomer(creator.id, context.organizationId)) return false
  }
  if (query.ownBase) {
    if (!context.organizationId || !brandCreatorIds(context.organizationId).has(creator.id)) return false
  }
  const frequency = FREQUENCY_RANK[postingFrequency(creator)]
  if (query.minPosting && frequency < FREQUENCY_RANK[query.minPosting]) return false
  if (query.maxPosting && frequency > FREQUENCY_RANK[query.maxPosting]) return false
  if (postedWithinEnabled(query) && query.postedWithinMonths != null) {
    if (daysBetween(creator.lastPost, TODAY) > query.postedWithinMonths * 30) return false
  }
  const captions = fold(captionsOf(creator))
  if (query.captionsInclude.trim() && !captions.includes(fold(query.captionsInclude))) return false
  if (query.captionsExclude.trim() && captions.includes(fold(query.captionsExclude))) return false
  if (query.hashtagsInclude.length && !query.hashtagsInclude.some((tag) => hashtagHit(creator, tag))) return false
  if (query.hashtagsExclude.some((tag) => hashtagHit(creator, tag))) return false
  if (query.mentionsInclude.length && !query.mentionsInclude.some((mention) => mentionHit(creator, mention))) return false
  if (query.mentionsExclude.some((mention) => mentionHit(creator, mention))) return false
  if (query.audios.length && !query.audios.some((audio) => captions.includes(fold(audio)))) return false
  if (query.maxFakeFollowers != null && fakeFollowersPct(creator) > query.maxFakeFollowers) return false
  if (query.accountTypes.length && !query.accountTypes.includes(accountTypeOf(creator))) return false
  const specificNiches = query.niches.filter((niche) => niche !== "lifestyle")
  const requiredNiches = specificNiches.length > 0 ? specificNiches : query.niches
  if (requiredNiches.length && !requiredNiches.some((niche) => creator.niche.includes(niche as Niche))) return false
  if (query.lastPostedDays != null && daysBetween(creator.lastPost, TODAY) > query.lastPostedDays) return false
  if (query.verifiedOnly && !profile.verified) return false
  if (query.hideSaved && context.savedIds.has(creator.id)) return false
  if (query.imageTerms.length && !query.imageTerms.some((term) => creatorBlob(creator).includes(fold(term)))) return false
  if (query.imageLabel && query.imageTerms.length === 0) {
    if (!creatorPosts(creator.id).some((post) => post.image && selectedNetworks(query).includes(post.network))) return false
  }
  const leftovers = leftoverTerms(query.prompt)
  if (leftovers.length && !leftovers.every((term) => creatorBlob(creator).includes(term))) return false
  return true
}

export function relevance(creator: Creator, query: DiscoverQuery, context: MatchContext) {
  const blob = creatorBlob(creator)
  let score = matchingProfile(creator, query)?.engagementRate ?? 0
  for (const term of leftoverTerms(query.prompt)) {
    if (blob.includes(term)) score += 3
  }
  for (const niche of query.niches) {
    if (creator.niche.includes(niche as Niche)) score += 2
  }
  if (query.imageTerms.some((term) => blob.includes(fold(term)))) score += 4
  return score
}

export function searchCreators(creators: Creator[], query: DiscoverQuery, context: MatchContext) {
  return creators
    .filter((creator) => creatorMatches(creator, query, context))
    .sort((a, b) => relevance(b, query, context) - relevance(a, query, context) || a.name.localeCompare(b.name, "pt-BR"))
}

export function platformTotal(creators: Creator[], platform: Platform) {
  return creators.filter((creator) => platformProfile(creator, platform)).length
}

function rangeLabel(min: number | null, max: number | null, unit: string) {
  if (min != null && max != null) return `${formatCompact(min)} – ${formatCompact(max)} ${unit}`
  if (min != null) return `≥ ${formatCompact(min)} ${unit}`
  if (max != null) return `≤ ${formatCompact(max)} ${unit}`
  return ""
}

export function filterChips(query: DiscoverQuery, creators: Creator[]): FilterChip[] {
  const chips: FilterChip[] = []
  if (query.prompt.trim()) chips.push({ key: "prompt", label: query.prompt.trim(), patch: { prompt: "" } })
  if (query.lookalikeId) {
    const creator = creators.find((item) => item.id === query.lookalikeId)
    chips.push({
      key: "lookalike",
      label: creator?.handle ?? "@creator",
      patch: { lookalikeId: "" },
    })
  }
  if (query.creatorId) {
    const creator = creators.find((item) => item.id === query.creatorId)
    chips.push({
      key: "creator",
      label: creator ? creator.handle : "Creator",
      patch: { creatorId: "" },
    })
  }
  if (query.imageLabel) chips.push({ key: "image", label: query.imageLabel, patch: { imageLabel: "", imageTerms: [] } })
  const followers = rangeLabel(query.minFollowers, query.maxFollowers, "seguidores")
  if (followers) chips.push({ key: "followers", label: followers, patch: { minFollowers: null, maxFollowers: null } })
  if (query.hiddenLikes) chips.push({ key: "hidden-likes", label: "Curtidas ocultas", patch: { hiddenLikes: false } })
  if (query.minEngagement != null) {
    chips.push({
      key: "engagement",
      label: `Engajamento ≥ ${query.minEngagement.toLocaleString("pt-BR")}%`,
      patch: { minEngagement: null },
    })
  }
  const views = rangeLabel(query.minViews, query.maxViews, "views")
  if (views) chips.push({ key: "views", label: views, patch: { minViews: null, maxViews: null } })
  if (query.minGrowth != null) {
    const period = query.growthMonths ? ` em ${query.growthMonths} meses` : ""
    chips.push({
      key: "growth",
      label: `Crescimento ≥ ${query.minGrowth}%${period}`,
      patch: { minGrowth: null, growthMonths: null },
    })
  } else if (query.growthMonths != null) {
    chips.push({ key: "growth-period", label: `Período de ${query.growthMonths} meses`, patch: { growthMonths: null } })
  }
  if (query.locations.trim()) {
    chips.push({
      key: "location",
      label: locationTokens(query.locations).map(locationTokenLabel).join(", "),
      patch: { locations: "" },
    })
  }
  if (query.audienceLocations.trim()) {
    chips.push({
      key: "audience-location",
      label: `Audiência: ${locationTokens(query.audienceLocations).map(locationTokenLabel).join(", ")}`,
      patch: { audienceLocations: "" },
    })
  }
  if (query.brands.length) chips.push({ key: "brands", label: `Marcas: ${query.brands.join(", ")}`, patch: { brands: [] } })
  if (query.bioInclude.trim()) chips.push({ key: "bio-in", label: `Bio: ${query.bioInclude}`, patch: { bioInclude: "" } })
  if (query.bioExclude.trim()) chips.push({ key: "bio-out", label: `Bio sem: ${query.bioExclude}`, patch: { bioExclude: "" } })
  if (query.gender) chips.push({ key: "gender", label: GENDER_LABEL[query.gender], patch: { gender: "" } })
  if (query.minAge != null || query.maxAge != null) {
    chips.push({
      key: "age",
      label: `Idade ${query.minAge ?? "—" }–${query.maxAge ?? "—"}`,
      patch: { minAge: null, maxAge: null },
    })
  }
  if (query.language) chips.push({ key: "language", label: query.language, patch: { language: "" } })
  if (query.emailAvailable) chips.push({ key: "email", label: "E-mail disponível", patch: { emailAvailable: false } })
  if (query.activeOnly) chips.push({ key: "active", label: "Só ativos", patch: { activeOnly: false } })
  if (query.availableOnly) chips.push({ key: "available", label: "Disponíveis para parceria", patch: { availableOnly: false } })
  if (query.brandCustomers) chips.push({ key: "customers", label: "Clientes da marca", patch: { brandCustomers: false } })
  if (query.ownBase) chips.push({ key: "base", label: "Base própria", patch: { ownBase: false } })
  if (query.minPosting || query.maxPosting) {
    const min = query.minPosting ? FREQUENCY_LABEL[query.minPosting] : "qualquer"
    const max = query.maxPosting ? FREQUENCY_LABEL[query.maxPosting] : "qualquer"
    chips.push({ key: "frequency", label: `Frequência ${min} – ${max}`, patch: { minPosting: "", maxPosting: "" } })
  }
  if (postedWithinEnabled(query) && query.postedWithinMonths != null) {
    chips.push({
      key: "posted-within",
      label: `Publicou em ${query.postedWithinMonths} meses`,
      patch: { postedWithinMonths: null },
    })
  }
  if (query.captionsInclude.trim()) chips.push({ key: "cap-in", label: `Legenda: ${query.captionsInclude}`, patch: { captionsInclude: "" } })
  if (query.captionsExclude.trim()) chips.push({ key: "cap-out", label: `Legenda sem: ${query.captionsExclude}`, patch: { captionsExclude: "" } })
  if (query.hashtagsInclude.length) chips.push({ key: "hash-in", label: query.hashtagsInclude.join(" "), patch: { hashtagsInclude: [] } })
  if (query.hashtagsExclude.length) chips.push({ key: "hash-out", label: `Sem ${query.hashtagsExclude.join(" ")}`, patch: { hashtagsExclude: [] } })
  if (query.mentionsInclude.length) chips.push({ key: "men-in", label: query.mentionsInclude.join(" "), patch: { mentionsInclude: [] } })
  if (query.mentionsExclude.length) chips.push({ key: "men-out", label: `Sem ${query.mentionsExclude.join(" ")}`, patch: { mentionsExclude: [] } })
  if (query.audios.length) chips.push({ key: "audio", label: query.audios.join(", "), patch: { audios: [] } })
  if (query.maxFakeFollowers != null) {
    chips.push({
      key: "fake",
      label: `Seguidores falsos ≤ ${query.maxFakeFollowers}%`,
      patch: { maxFakeFollowers: null },
    })
  }
  if (query.accountTypes.length) {
    chips.push({
      key: "account",
      label: `Tipo de conta: ${query.accountTypes.length}`,
      patch: { accountTypes: [] },
    })
  }
  if (query.niches.length) chips.push({ key: "niches", label: query.niches.join(", "), patch: { niches: [] } })
  if (query.lastPostedDays != null) {
    chips.push({ key: "last-posted", label: `Último post em ${query.lastPostedDays} dias`, patch: { lastPostedDays: null } })
  }
  if (query.verifiedOnly) chips.push({ key: "verified", label: "Só verificados", patch: { verifiedOnly: false } })
  if (query.hideSaved) chips.push({ key: "hide-saved", label: "Ocultar salvos", patch: { hideSaved: false } })
  const networks = selectedNetworks(query)
  if (networks.length < PLATFORMS.length) {
    const names = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" }
    chips.push({
      key: "networks",
      label: networks.map((network) => names[network]).join(", "),
      patch: { networks: [...PLATFORMS] },
    })
  }
  return chips
}

export function sectionCounts(query: DiscoverQuery) {
  return {
    creator: [
      query.bioInclude,
      query.bioExclude,
      query.gender,
      query.minAge,
      query.maxAge,
      query.language,
      query.emailAvailable,
      query.audienceLocations,
    ].filter(Boolean).length,
    activity: [query.activeOnly, query.minPosting, query.maxPosting, postedWithinEnabled(query) && query.postedWithinMonths].filter(Boolean).length,
    content: [
      query.captionsInclude,
      query.captionsExclude,
      query.hashtagsInclude.length,
      query.hashtagsExclude.length,
      query.mentionsInclude.length,
      query.mentionsExclude.length,
      query.audios.length,
      query.niches.length,
    ].filter(Boolean).length,
    other: [
      query.maxFakeFollowers,
      query.accountTypes.length,
      query.availableOnly,
      query.brandCustomers,
      query.ownBase,
      query.verifiedOnly,
      query.hideSaved,
      query.lastPostedDays,
    ].filter(Boolean).length,
  }
}

export function queryFromFilterState(filters: FilterState): Partial<DiscoverQuery> {
  const patch: Partial<DiscoverQuery> = {}
  if (filters.search.trim()) patch.prompt = filters.search
  if (filters.bio?.trim()) patch.bioInclude = filters.bio
  if (filters.creatorLocation?.trim()) patch.locations = filters.creatorLocation
  if (filters.audienceLocation?.trim()) patch.audienceLocations = filters.audienceLocation
  if (filters.niches.length) patch.niches = [...filters.niches]
  if (filters.minFollowers > 0) patch.minFollowers = filters.minFollowers
  if (filters.maxFollowers < 10000000) patch.maxFollowers = filters.maxFollowers
  if (filters.minEngagement > 0) patch.minEngagement = filters.minEngagement
  if (filters.similarTo) patch.lookalikeId = filters.similarTo
  if (filters.availableForPartnership) patch.availableOnly = true
  if (filters.brandCustomers) patch.brandCustomers = true
  if (filters.ownBase) patch.ownBase = true
  return patch
}

export function applyAccountTypeDefault(query: DiscoverQuery, touched: boolean) {
  if (touched || query.accountTypes.length > 0 || !isQueryActive({ ...query, accountTypes: [] })) return query
  return { ...query, accountTypes: ["creator", "creator_group"] as AccountType[] }
}
