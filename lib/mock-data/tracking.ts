export type Network = "instagram" | "tiktok" | "youtube"
export type Period = "30d" | "90d" | "12m"
export type ContentScope = "all" | "organic" | "sponsored"
export type Signal = "mention" | "hashtag" | "keyword" | "sponsored" | "official"
export type ChartMetric = "emv" | "engagement" | "impressions" | "reach" | "sponsoredEmv"
export type Sector = "beauty" | "retail" | "food"

export const NETWORKS: Network[] = ["instagram", "tiktok", "youtube"]
export const SIGNALS: Signal[] = ["mention", "hashtag", "keyword", "sponsored", "official"]
export const UPDATED_AT = "2026-10-28"
export const AS_OF = "2026-10-29"

export const PERIOD_FACTOR: Record<Period, number> = {
  "30d": 30 / 365,
  "90d": 90 / 365,
  "12m": 1,
}

export const PERIOD_DAYS: Record<Period, number> = {
  "30d": 30,
  "90d": 90,
  "12m": 365,
}

export interface TrackingConfig {
  competitorIds: string[]
  period: Period
  networks: Network[]
  scope: ContentScope
  signals: Signal[]
}

export interface TrackedBrand {
  id: string
  name: string
  initials: string
  color: string
  ink: "light" | "dark"
  icon?: string
  chartColor: string
  handles: Record<Network, string>
  hashtags: string[]
  keywords: string[]
  creators: number
  posts: number
  emv: number
  engagement: number
  impressions: number
  reach: number
  sponsoredShare: number
  mom: number
  yoy: number
  networks: Record<Network, number>
  trend: number[]
}

export interface BrandSnapshot {
  brand: TrackedBrand
  creators: number
  posts: number
  emv: number
  engagement: number
  impressions: number
  reach: number
  sponsoredEmv: number
  potency: number
  frequency: number
  mom: number
  yoy: number
}

export type PostFormat = "reels" | "post_feed" | "tiktok" | "video_youtube"

export interface TrackedPost {
  id: string
  brandId: string
  creatorName: string
  creatorHandle: string
  network: Network
  signal: Signal
  sponsored: boolean
  format: PostFormat
  image: string
  caption: string
  publishedAt: string
  emv: number
  engagement: number
  reach: number
  likes: number
  comments: number
  shares: number
}

export interface BrandCatalog {
  sector: Sector
  own: TrackedBrand
  competitors: TrackedBrand[]
  defaults: TrackingConfig
}

const MONTHS = ["Mai", "Jun", "Jul", "Ago", "Set", "Out"]
const WEEKS = ["05 out", "12 out", "19 out", "26 out"]

function brand(input: Omit<TrackedBrand, "ink"> & { ink?: "light" | "dark" }): TrackedBrand {
  return { ink: "light", ...input }
}

const BEAUTY: TrackedBrand[] = [
  brand({
    id: "natura",
    name: "Natura",
    initials: "N",
    color: "#F47920",
    icon: "/logos/natura-icon.svg",
    chartColor: "orange",
    handles: { instagram: "@natura", tiktok: "@natura", youtube: "@natura" },
    hashtags: ["#natura", "#bemestarbem"],
    keywords: ["natura", "ekos"],
    creators: 8200,
    posts: 25400,
    emv: 48_200_000,
    engagement: 22_400_000,
    impressions: 890_000_000,
    reach: 1_400_000_000,
    sponsoredShare: 0.22,
    mom: 8,
    yoy: 14,
    networks: { instagram: 0.58, tiktok: 0.27, youtube: 0.15 },
    trend: [0.86, 0.9, 0.94, 1.02, 0.98, 1.12],
  }),
  brand({
    id: "boticario",
    name: "O Boticário",
    initials: "OB",
    color: "#00857D",
    chartColor: "teal",
    handles: { instagram: "@oboticario", tiktok: "@oboticario", youtube: "@oboticario" },
    hashtags: ["#oboticario", "#boticario"],
    keywords: ["boticário", "o boticario"],
    creators: 11100,
    posts: 36600,
    emv: 61_500_000,
    engagement: 31_000_000,
    impressions: 1_100_000_000,
    reach: 1_800_000_000,
    sponsoredShare: 0.28,
    mom: 4,
    yoy: 6,
    networks: { instagram: 0.52, tiktok: 0.34, youtube: 0.14 },
    trend: [0.92, 0.95, 1.04, 0.98, 1.08, 1.1],
  }),
  brand({
    id: "avon",
    name: "Avon",
    initials: "AV",
    color: "#E11D48",
    chartColor: "rose",
    handles: { instagram: "@avonbrasil", tiktok: "@avonbrasil", youtube: "@avonbrasil" },
    hashtags: ["#avon", "#avonbrasil"],
    keywords: ["avon"],
    creators: 8400,
    posts: 21800,
    emv: 27_800_000,
    engagement: 14_200_000,
    impressions: 620_000_000,
    reach: 980_000_000,
    sponsoredShare: 0.31,
    mom: -6,
    yoy: -9,
    networks: { instagram: 0.64, tiktok: 0.22, youtube: 0.14 },
    trend: [1.12, 1.05, 0.98, 0.94, 0.9, 0.84],
  }),
  brand({
    id: "eudora",
    name: "Eudora",
    initials: "EU",
    color: "#7C3AED",
    chartColor: "violet",
    handles: { instagram: "@eudora", tiktok: "@eudora", youtube: "@eudora" },
    hashtags: ["#eudora", "#eudoralovers"],
    keywords: ["eudora"],
    creators: 6100,
    posts: 18300,
    emv: 18_400_000,
    engagement: 9_100_000,
    impressions: 410_000_000,
    reach: 640_000_000,
    sponsoredShare: 0.35,
    mom: 11,
    yoy: 18,
    networks: { instagram: 0.48, tiktok: 0.4, youtube: 0.12 },
    trend: [0.74, 0.82, 0.9, 1.05, 1.16, 1.28],
  }),
  brand({
    id: "qdb",
    name: "Quem Disse Berenice",
    initials: "QB",
    color: "#DB2777",
    chartColor: "pink",
    handles: { instagram: "@quemdisseberenice", tiktok: "@quemdisseberenice", youtube: "@quemdisseberenice" },
    hashtags: ["#quemdisseberenice", "#qdb"],
    keywords: ["quem disse berenice", "qdb"],
    creators: 5400,
    posts: 18900,
    emv: 22_100_000,
    engagement: 16_800_000,
    impressions: 530_000_000,
    reach: 720_000_000,
    sponsoredShare: 0.19,
    mom: 15,
    yoy: 9,
    networks: { instagram: 0.44, tiktok: 0.46, youtube: 0.1 },
    trend: [0.8, 0.88, 0.96, 1.1, 1.18, 1.22],
  }),
  brand({
    id: "loreal",
    name: "L'Oréal Paris",
    initials: "LP",
    color: "#18181B",
    chartColor: "slate",
    handles: { instagram: "@lorealparis", tiktok: "@lorealparis", youtube: "@lorealparis" },
    hashtags: ["#lorealparis", "#loreal"],
    keywords: ["loreal", "l'oréal"],
    creators: 13200,
    posts: 39600,
    emv: 74_000_000,
    engagement: 28_500_000,
    impressions: 1_450_000_000,
    reach: 2_200_000_000,
    sponsoredShare: 0.26,
    mom: -2,
    yoy: 5,
    networks: { instagram: 0.5, tiktok: 0.28, youtube: 0.22 },
    trend: [1.02, 0.98, 1.06, 0.95, 1.01, 0.99],
  }),
  brand({
    id: "nivea",
    name: "Nivea",
    initials: "NV",
    color: "#1D4ED8",
    chartColor: "blue",
    handles: { instagram: "@nivea", tiktok: "@nivea", youtube: "@nivea" },
    hashtags: ["#nivea", "#niveabrasil"],
    keywords: ["nivea"],
    creators: 4800,
    posts: 12500,
    emv: 15_600_000,
    engagement: 6_400_000,
    impressions: 380_000_000,
    reach: 510_000_000,
    sponsoredShare: 0.24,
    mom: 3,
    yoy: -8,
    networks: { instagram: 0.6, tiktok: 0.18, youtube: 0.22 },
    trend: [1.08, 1.02, 0.96, 0.94, 0.9, 0.88],
  }),
  brand({
    id: "granado",
    name: "Granado",
    initials: "GR",
    color: "#166534",
    chartColor: "green",
    handles: { instagram: "@granado", tiktok: "@granado", youtube: "@granado" },
    hashtags: ["#granado", "#granadoph"],
    keywords: ["granado"],
    creators: 2900,
    posts: 6400,
    emv: 8_200_000,
    engagement: 3_100_000,
    impressions: 140_000_000,
    reach: 210_000_000,
    sponsoredShare: 0.18,
    mom: 7,
    yoy: 16,
    networks: { instagram: 0.7, tiktok: 0.16, youtube: 0.14 },
    trend: [0.7, 0.78, 0.9, 1.05, 1.2, 1.32],
  }),
]

const RETAIL: TrackedBrand[] = [
  brand({
    id: "magalu",
    name: "Magazine Luiza",
    initials: "ML",
    color: "#0086FF",
    icon: "/logos/magalu-icon.svg",
    chartColor: "sky",
    handles: { instagram: "@magazineluiza", tiktok: "@magazineluiza", youtube: "@magazineluiza" },
    hashtags: ["#magalu", "#magazineluiza"],
    keywords: ["magalu", "magazine luiza"],
    creators: 15400,
    posts: 46200,
    emv: 82_000_000,
    engagement: 41_000_000,
    impressions: 2_100_000_000,
    reach: 3_400_000_000,
    sponsoredShare: 0.33,
    mom: 6,
    yoy: 4,
    networks: { instagram: 0.46, tiktok: 0.36, youtube: 0.18 },
    trend: [0.9, 0.94, 1.02, 0.98, 1.06, 1.14],
  }),
  brand({
    id: "mercadolivre",
    name: "Mercado Livre",
    initials: "ML",
    color: "#FFE600",
    ink: "dark",
    chartColor: "yellow",
    handles: { instagram: "@mercadolivre", tiktok: "@mercadolivre", youtube: "@mercadolivre" },
    hashtags: ["#mercadolivre", "#meli"],
    keywords: ["mercado livre", "meli"],
    creators: 18600,
    posts: 61400,
    emv: 121_000_000,
    engagement: 52_000_000,
    impressions: 2_800_000_000,
    reach: 4_600_000_000,
    sponsoredShare: 0.29,
    mom: 9,
    yoy: 16,
    networks: { instagram: 0.4, tiktok: 0.38, youtube: 0.22 },
    trend: [0.82, 0.9, 0.96, 1.08, 1.14, 1.2],
  }),
  brand({
    id: "amazon",
    name: "Amazon",
    initials: "AZ",
    color: "#232F3E",
    chartColor: "slate",
    handles: { instagram: "@amazon.com.br", tiktok: "@amazon.com.br", youtube: "@amazon.com.br" },
    hashtags: ["#amazon", "#amazonbrasil"],
    keywords: ["amazon", "prime"],
    creators: 14200,
    posts: 39800,
    emv: 96_000_000,
    engagement: 33_000_000,
    impressions: 2_200_000_000,
    reach: 3_900_000_000,
    sponsoredShare: 0.21,
    mom: 3,
    yoy: 11,
    networks: { instagram: 0.42, tiktok: 0.3, youtube: 0.28 },
    trend: [0.88, 0.92, 0.98, 1.04, 1.08, 1.1],
  }),
  brand({
    id: "americanas",
    name: "Americanas",
    initials: "AM",
    color: "#E10600",
    chartColor: "red",
    handles: { instagram: "@americanas", tiktok: "@americanas", youtube: "@americanas" },
    hashtags: ["#americanas"],
    keywords: ["americanas"],
    creators: 6700,
    posts: 16100,
    emv: 19_500_000,
    engagement: 8_800_000,
    impressions: 540_000_000,
    reach: 890_000_000,
    sponsoredShare: 0.27,
    mom: -12,
    yoy: -24,
    networks: { instagram: 0.55, tiktok: 0.28, youtube: 0.17 },
    trend: [1.3, 1.18, 1.05, 0.92, 0.84, 0.72],
  }),
  brand({
    id: "shopee",
    name: "Shopee",
    initials: "SH",
    color: "#EE4D2D",
    chartColor: "orange",
    handles: { instagram: "@shopee_br", tiktok: "@shopee_br", youtube: "@shopee_br" },
    hashtags: ["#shopee", "#shopeebr"],
    keywords: ["shopee"],
    creators: 12100,
    posts: 44700,
    emv: 54_000_000,
    engagement: 48_000_000,
    impressions: 1_900_000_000,
    reach: 2_700_000_000,
    sponsoredShare: 0.18,
    mom: 14,
    yoy: 22,
    networks: { instagram: 0.32, tiktok: 0.52, youtube: 0.16 },
    trend: [0.7, 0.82, 0.94, 1.1, 1.22, 1.28],
  }),
  brand({
    id: "casasbahia",
    name: "Casas Bahia",
    initials: "CB",
    color: "#0033A0",
    chartColor: "indigo",
    handles: { instagram: "@casasbahia", tiktok: "@casasbahia", youtube: "@casasbahia" },
    hashtags: ["#casasbahia"],
    keywords: ["casas bahia"],
    creators: 4300,
    posts: 10300,
    emv: 12_800_000,
    engagement: 4_200_000,
    impressions: 310_000_000,
    reach: 480_000_000,
    sponsoredShare: 0.36,
    mom: -4,
    yoy: -11,
    networks: { instagram: 0.5, tiktok: 0.22, youtube: 0.28 },
    trend: [1.14, 1.08, 1.02, 0.96, 0.9, 0.86],
  }),
  brand({
    id: "shein",
    name: "Shein",
    initials: "SN",
    color: "#111111",
    chartColor: "zinc",
    handles: { instagram: "@sheinbrasil", tiktok: "@sheinbrasil", youtube: "@sheinbrasil" },
    hashtags: ["#shein", "#sheinbrasil"],
    keywords: ["shein"],
    creators: 9800,
    posts: 37200,
    emv: 44_000_000,
    engagement: 39_000_000,
    impressions: 1_600_000_000,
    reach: 2_100_000_000,
    sponsoredShare: 0.16,
    mom: 5,
    yoy: 19,
    networks: { instagram: 0.34, tiktok: 0.56, youtube: 0.1 },
    trend: [0.78, 0.86, 0.96, 1.08, 1.16, 1.2],
  }),
  brand({
    id: "netshoes",
    name: "Netshoes",
    initials: "NS",
    color: "#6B2D5B",
    chartColor: "purple",
    handles: { instagram: "@netshoes", tiktok: "@netshoes", youtube: "@netshoes" },
    hashtags: ["#netshoes"],
    keywords: ["netshoes"],
    creators: 3100,
    posts: 7400,
    emv: 7_400_000,
    engagement: 2_600_000,
    impressions: 160_000_000,
    reach: 240_000_000,
    sponsoredShare: 0.3,
    mom: 2,
    yoy: -5,
    networks: { instagram: 0.48, tiktok: 0.3, youtube: 0.22 },
    trend: [0.96, 1.02, 0.98, 1.04, 0.94, 1.0],
  }),
]

const FOOD: TrackedBrand[] = [
  brand({
    id: "ifood",
    name: "iFood",
    initials: "iF",
    color: "#EA1D2C",
    icon: "/logos/ifood-icon.svg",
    chartColor: "red",
    handles: { instagram: "@ifood", tiktok: "@ifood", youtube: "@ifood" },
    hashtags: ["#ifood", "#peçaifood"],
    keywords: ["ifood"],
    creators: 16800,
    posts: 53800,
    emv: 88_000_000,
    engagement: 46_000_000,
    impressions: 2_400_000_000,
    reach: 3_800_000_000,
    sponsoredShare: 0.34,
    mom: 7,
    yoy: 10,
    networks: { instagram: 0.45, tiktok: 0.4, youtube: 0.15 },
    trend: [0.88, 0.92, 0.98, 1.04, 1.08, 1.16],
  }),
  brand({
    id: "rappi",
    name: "Rappi",
    initials: "RP",
    color: "#FF441F",
    chartColor: "orange",
    handles: { instagram: "@rappibrasil", tiktok: "@rappibrasil", youtube: "@rappibrasil" },
    hashtags: ["#rappi", "#rappibrasil"],
    keywords: ["rappi"],
    creators: 7200,
    posts: 18700,
    emv: 31_000_000,
    engagement: 12_500_000,
    impressions: 780_000_000,
    reach: 1_100_000_000,
    sponsoredShare: 0.38,
    mom: -3,
    yoy: 2,
    networks: { instagram: 0.5, tiktok: 0.34, youtube: 0.16 },
    trend: [1.06, 1.02, 0.98, 1.0, 0.94, 0.92],
  }),
  brand({
    id: "99food",
    name: "99Food",
    initials: "99",
    color: "#FFCC00",
    ink: "dark",
    chartColor: "amber",
    handles: { instagram: "@99food", tiktok: "@99food", youtube: "@99food" },
    hashtags: ["#99food", "#99"],
    keywords: ["99food", "99 food"],
    creators: 4100,
    posts: 12300,
    emv: 14_200_000,
    engagement: 7_800_000,
    impressions: 420_000_000,
    reach: 610_000_000,
    sponsoredShare: 0.29,
    mom: 18,
    yoy: 27,
    networks: { instagram: 0.36, tiktok: 0.5, youtube: 0.14 },
    trend: [0.62, 0.74, 0.88, 1.08, 1.28, 1.4],
  }),
  brand({
    id: "zedelivery",
    name: "Zé Delivery",
    initials: "ZÉ",
    color: "#111827",
    chartColor: "zinc",
    handles: { instagram: "@zedelivery", tiktok: "@zedelivery", youtube: "@zedelivery" },
    hashtags: ["#zedelivery", "#zedeliveryoficial"],
    keywords: ["zé delivery", "ze delivery"],
    creators: 5600,
    posts: 15100,
    emv: 18_700_000,
    engagement: 9_400_000,
    impressions: 510_000_000,
    reach: 740_000_000,
    sponsoredShare: 0.25,
    mom: 4,
    yoy: -6,
    networks: { instagram: 0.48, tiktok: 0.4, youtube: 0.12 },
    trend: [1.04, 0.98, 1.08, 0.96, 1.02, 0.94],
  }),
  brand({
    id: "keeta",
    name: "Keeta",
    initials: "KE",
    color: "#0F766E",
    chartColor: "teal",
    handles: { instagram: "@keeta.brasil", tiktok: "@keeta.brasil", youtube: "@keeta.brasil" },
    hashtags: ["#keeta", "#keetabrasil"],
    keywords: ["keeta"],
    creators: 2400,
    posts: 7200,
    emv: 9_800_000,
    engagement: 6_200_000,
    impressions: 290_000_000,
    reach: 380_000_000,
    sponsoredShare: 0.22,
    mom: 21,
    yoy: 34,
    networks: { instagram: 0.3, tiktok: 0.58, youtube: 0.12 },
    trend: [0.5, 0.66, 0.84, 1.12, 1.36, 1.52],
  }),
  brand({
    id: "aiqfome",
    name: "Aiqfome",
    initials: "AQ",
    color: "#7B2CBF",
    chartColor: "violet",
    handles: { instagram: "@aiqfome", tiktok: "@aiqfome", youtube: "@aiqfome" },
    hashtags: ["#aiqfome"],
    keywords: ["aiqfome", "aiq fome"],
    creators: 1800,
    posts: 4300,
    emv: 4_100_000,
    engagement: 2_200_000,
    impressions: 95_000_000,
    reach: 140_000_000,
    sponsoredShare: 0.2,
    mom: 6,
    yoy: 8,
    networks: { instagram: 0.52, tiktok: 0.34, youtube: 0.14 },
    trend: [0.86, 0.92, 0.98, 1.04, 1.08, 1.12],
  }),
  brand({
    id: "ubereats",
    name: "Uber Eats",
    initials: "UE",
    color: "#06C167",
    chartColor: "emerald",
    handles: { instagram: "@ubereats", tiktok: "@ubereats", youtube: "@ubereats" },
    hashtags: ["#ubereats"],
    keywords: ["uber eats"],
    creators: 3900,
    posts: 9000,
    emv: 11_500_000,
    engagement: 4_100_000,
    impressions: 260_000_000,
    reach: 390_000_000,
    sponsoredShare: 0.41,
    mom: -8,
    yoy: -14,
    networks: { instagram: 0.46, tiktok: 0.28, youtube: 0.26 },
    trend: [1.22, 1.12, 1.04, 0.94, 0.86, 0.78],
  }),
  brand({
    id: "james",
    name: "James Delivery",
    initials: "JD",
    color: "#C2410C",
    chartColor: "amber",
    handles: { instagram: "@jamesdelivery", tiktok: "@jamesdelivery", youtube: "@jamesdelivery" },
    hashtags: ["#jamesdelivery"],
    keywords: ["james delivery"],
    creators: 900,
    posts: 1800,
    emv: 1_800_000,
    engagement: 700_000,
    impressions: 32_000_000,
    reach: 48_000_000,
    sponsoredShare: 0.15,
    mom: 1,
    yoy: -2,
    networks: { instagram: 0.62, tiktok: 0.24, youtube: 0.14 },
    trend: [0.98, 1.0, 0.96, 1.02, 0.98, 1.04],
  }),
]

function catalog(sector: Sector, ownId: string, competitorIds: string[], brands: TrackedBrand[]): BrandCatalog {
  const own = brands.find((item) => item.id === ownId)
  if (!own) throw new Error(`Marca própria ausente: ${ownId}`)
  const competitors = brands.filter((item) => item.id !== ownId)
  return {
    sector,
    own,
    competitors,
    defaults: {
      competitorIds,
      period: "90d",
      networks: [...NETWORKS],
      scope: "all",
      signals: [...SIGNALS],
    },
  }
}

const CATALOGS: Record<string, BrandCatalog> = {
  org1: catalog("beauty", "natura", ["boticario", "avon", "eudora", "qdb", "loreal"], BEAUTY),
  org2: catalog("retail", "magalu", ["mercadolivre", "amazon", "americanas", "shopee", "casasbahia"], RETAIL),
  org3: catalog("food", "ifood", ["rappi", "99food", "zedelivery", "keeta", "aiqfome"], FOOD),
}

export function catalogFor(organizationId: string): BrandCatalog {
  return CATALOGS[organizationId] ?? CATALOGS.org1
}

export function defaultConfig(organizationId: string): TrackingConfig {
  const config = catalogFor(organizationId).defaults
  return {
    ...config,
    competitorIds: [...config.competitorIds],
    networks: [...config.networks],
    signals: [...config.signals],
  }
}

function isNetwork(value: string): value is Network {
  return NETWORKS.includes(value as Network)
}

function isSignal(value: string): value is Signal {
  return SIGNALS.includes(value as Signal)
}

export function resolveConfig(organizationId: string, saved?: TrackingConfig): TrackingConfig {
  const catalog = catalogFor(organizationId)
  const base = defaultConfig(organizationId)
  if (!saved) return base
  const allowed = new Set(catalog.competitors.map((item) => item.id))
  const competitorIds = saved.competitorIds.filter((id) => allowed.has(id))
  const networks = saved.networks.filter(isNetwork)
  const signals = saved.signals.filter(isSignal)
  const period: Period = saved.period === "30d" || saved.period === "12m" ? saved.period : "90d"
  const scope: ContentScope =
    saved.scope === "organic" || saved.scope === "sponsored" ? saved.scope : "all"
  return {
    competitorIds,
    period,
    networks: networks.length > 0 ? networks : base.networks,
    scope,
    signals: signals.length > 0 ? signals : base.signals,
  }
}

export function sameConfig(a: TrackingConfig, b: TrackingConfig) {
  return (
    a.period === b.period &&
    a.scope === b.scope &&
    a.competitorIds.join() === b.competitorIds.join() &&
    a.networks.join() === b.networks.join() &&
    a.signals.join() === b.signals.join()
  )
}

export function brandById(organizationId: string, brandId: string) {
  const catalog = catalogFor(organizationId)
  if (catalog.own.id === brandId) return catalog.own
  return catalog.competitors.find((item) => item.id === brandId)
}

export function monitoredBrands(organizationId: string, config: TrackingConfig): TrackedBrand[] {
  const catalog = catalogFor(organizationId)
  const picked = new Set(config.competitorIds)
  return [catalog.own, ...catalog.competitors.filter((item) => picked.has(item.id))]
}

function weight(brand: TrackedBrand, networks: Network[]) {
  return networks.reduce((sum, network) => sum + brand.networks[network], 0)
}

function scopeFactor(brand: TrackedBrand, scope: ContentScope) {
  if (scope === "sponsored") return brand.sponsoredShare
  if (scope === "organic") return 1 - brand.sponsoredShare
  return 1
}

export function projectBrand(
  brand: TrackedBrand,
  config: Pick<TrackingConfig, "period" | "networks" | "scope">,
): BrandSnapshot {
  const volume = PERIOD_FACTOR[config.period] * weight(brand, config.networks) * scopeFactor(brand, config.scope)
  const posts = volume <= 0 ? 0 : Math.max(1, Math.round(brand.posts * volume))
  const creators = volume <= 0 ? 0 : Math.max(1, Math.round(brand.creators * volume ** 0.85))
  const emv = brand.emv * volume
  const engagement = brand.engagement * volume
  const impressions = brand.impressions * volume
  const reach = brand.reach * volume
  const sponsoredBase = brand.emv * brand.sponsoredShare * PERIOD_FACTOR[config.period] * weight(brand, config.networks)
  const sponsoredEmv = config.scope === "organic" ? 0 : config.scope === "sponsored" ? emv : sponsoredBase
  return {
    brand,
    creators,
    posts,
    emv,
    engagement,
    impressions,
    reach,
    sponsoredEmv,
    potency: posts > 0 ? emv / posts : 0,
    frequency: creators > 0 ? posts / creators : 0,
    mom: brand.mom,
    yoy: brand.yoy,
  }
}

export function metricValue(snapshot: BrandSnapshot, metric: ChartMetric) {
  return snapshot[metric]
}

export function seriesLabels(period: Period) {
  if (period === "30d") return WEEKS
  if (period === "90d") return MONTHS.slice(-3)
  return MONTHS
}

export function seriesWeights(brand: TrackedBrand, period: Period) {
  if (period === "30d") {
    const last = brand.trend[brand.trend.length - 1] ?? 1
    return [last * 0.92, last * 0.98, last * 1.04, last * 1.1]
  }
  if (period === "90d") return brand.trend.slice(-3)
  return brand.trend
}

export function distribute(total: number, weights: number[], labels: string[]) {
  const sum = weights.reduce((acc, value) => acc + value, 0) || 1
  return labels.map((label, index) => ({ label, value: total * ((weights[index] ?? 0) / sum) }))
}

const CREATORS = [
  ["Marina Alves", "@marinaalves"],
  ["Lucas Prado", "@lucasprado"],
  ["Ana Clara", "@anaclara"],
  ["Diego Nunes", "@diegonunes"],
  ["Beatriz Melo", "@beatriz"],
  ["Rafael Costa", "@rafacosta"],
]

const COVERS = [
  "photo-1483985988355-763728e1935b",
  "photo-1515886657613-9f3515b0c78f",
  "photo-1522335789203-aabd1fc54bc9",
  "photo-1596462502278-27bfdc403348",
  "photo-1512496015851-a90fb38ba796",
  "photo-1524504388940-b1c1722653e1",
  "photo-1487412947147-5cebf100ffc2",
  "photo-1616683693504-3ea7e9ad6fec",
  "photo-1542291026-7eec264c27ff",
  "photo-1556228578-0d85b1a4d571",
  "photo-1505740420928-5e560c06d30e",
  "photo-1510557880182-3d4d3cba35a5",
  "photo-1556911220-e15b29be8c8f",
  "photo-1565299624946-b28f40a0ae38",
  "photo-1504674900247-0877df9cc836",
  "photo-1414235077428-338989a2e8c0",
  "photo-1540189549336-e6e99c3679fe",
  "photo-1567620905732-2d1ec7ab7445",
]

function coverFor(id: string) {
  let hash = 0
  for (const char of id) hash = (hash + char.charCodeAt(0) * 17) % COVERS.length
  return `https://images.unsplash.com/${COVERS[hash]}?auto=format&fit=crop&w=720&h=900&q=75`
}

function formatFor(network: Network, slot: number): PostFormat {
  if (network === "tiktok") return "tiktok"
  if (network === "youtube") return "video_youtube"
  return slot % 2 === 0 ? "reels" : "post_feed"
}

const POST_PLAN: { signal: Signal; sponsored: boolean; network: Network; daysAgo: number }[] = [
  { signal: "mention", sponsored: false, network: "instagram", daysAgo: 4 },
  { signal: "sponsored", sponsored: true, network: "instagram", daysAgo: 11 },
  { signal: "keyword", sponsored: false, network: "tiktok", daysAgo: 18 },
  { signal: "official", sponsored: false, network: "instagram", daysAgo: 26 },
  { signal: "hashtag", sponsored: false, network: "youtube", daysAgo: 48 },
  { signal: "sponsored", sponsored: true, network: "tiktok", daysAgo: 67 },
  { signal: "mention", sponsored: false, network: "youtube", daysAgo: 120 },
  { signal: "keyword", sponsored: false, network: "instagram", daysAgo: 190 },
  { signal: "official", sponsored: false, network: "youtube", daysAgo: 260 },
]

function daysAgoIso(days: number) {
  const date = new Date(`${AS_OF}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

function caption(brand: TrackedBrand, signal: Signal, network: Network, variant: number) {
  const handle = brand.handles[network]
  const tag = brand.hashtags[0]
  if (signal === "mention") {
    return variant % 2 === 0
      ? `Passei a semana com ${brand.name} e contei nos stories. ${handle}`
      : `Menção espontânea: o que mudou na rotina com ${brand.name}. ${handle}`
  }
  if (signal === "hashtag") {
    return variant % 2 === 0
      ? `Favorito da semana. ${tag} ${brand.hashtags[1] ?? ""}`.trim()
      : `O look de hoje fechou com ${tag}.`
  }
  if (signal === "keyword") {
    return variant % 2 === 0
      ? `Por que ${brand.keywords[0]} aparece tanto no meu feed este mês.`
      : `Comparei opções e ${brand.keywords[0]} ficou na lista final.`
  }
  if (signal === "sponsored") {
    return `Parceria paga com ${brand.name}. O que eu usaria de novo. ${tag} #publi`
  }
  return `Novidade no perfil oficial de ${brand.name}. ${handle}`
}

function buildPosts(brands: TrackedBrand[]): TrackedPost[] {
  return brands.flatMap((item, brandIndex) =>
    POST_PLAN.map((plan, slot) => {
      const creator = CREATORS[(brandIndex + slot) % CREATORS.length]
      const official = plan.signal === "official"
      const perPost = item.posts > 0 ? 1 / item.posts : 0
      const swing = 0.65 + ((brandIndex + slot) % 5) * 0.18
      const id = `${item.id}-${slot}`
      const engagement = Math.round(item.engagement * perPost * swing)
      return {
        id,
        brandId: item.id,
        creatorName: official ? item.name : creator[0],
        creatorHandle: official ? item.handles[plan.network] : creator[1],
        network: plan.network,
        signal: plan.signal,
        sponsored: plan.sponsored,
        format: formatFor(plan.network, slot),
        image: coverFor(id),
        caption: caption(item, plan.signal, plan.network, brandIndex + slot),
        publishedAt: daysAgoIso(plan.daysAgo),
        emv: Math.round(item.emv * perPost * swing),
        engagement,
        reach: Math.round(item.reach * perPost * swing),
        likes: Math.round(engagement * 0.82),
        comments: Math.round(engagement * 0.12),
        shares: Math.round(engagement * 0.06),
      }
    }),
  )
}

const POSTS = buildPosts([...BEAUTY, ...RETAIL, ...FOOD])

export function postsFor(brandIds: string[], config: TrackingConfig): TrackedPost[] {
  const allowed = new Set(brandIds)
  const networks = new Set(config.networks)
  const signals = new Set(config.signals)
  const cutoff = new Date(`${AS_OF}T12:00:00Z`)
  cutoff.setUTCDate(cutoff.getUTCDate() - PERIOD_DAYS[config.period])
  const cutoffIso = cutoff.toISOString().slice(0, 10)
  return POSTS.filter((post) => {
    if (!allowed.has(post.brandId) || !networks.has(post.network) || !signals.has(post.signal)) return false
    if (post.publishedAt < cutoffIso) return false
    if (config.scope === "sponsored" && !post.sponsored) return false
    if (config.scope === "organic" && post.sponsored) return false
    return true
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
