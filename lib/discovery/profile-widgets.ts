import { CREATORS, type Creator, type CreatorNetwork } from "@/lib/mock-data/creators"
import { type MonitorPost } from "@/lib/mock-data/metrics"
import { ORG_LOGOS } from "@/lib/mock-data/users"
import {
  TODAY,
  collaborations,
  creatorPosts,
  fakeFollowersPct,
  growthPercent,
  type Platform,
} from "@/lib/discovery/discover-query"

export type RiskLevel = "safe" | "low" | "medium"

export interface SafetyAxis {
  key: string
  label: string
  level: RiskLevel
}

export interface GradeMetric {
  key: string
  label: string
  top: number
  grade: string
}

export interface WidgetPost {
  id: string
  engagement: number
  unitCost: number
  image?: string
  title: string
  views: number
  likes: number
  impressions: number
  reach: number
  caption: string
  ago: string
  url: string
}

export interface ChartPoint {
  label: string
  engagements: number
  community: number
  followers: number
}

export interface BrandMention {
  name: string
  count: number
  effectiveness: number
  logo: string | null
}

export interface CollabRow {
  brand: string
  count: number
  slots: number[]
  color: string
  logo: string | null
}

export interface ProfileWidgets {
  priceMin: number
  priceMax: number
  cpv: number
  cpe: number
  avgLikes: number
  avgComments: number
  credibility: number
  culture: string
  cities: { label: string; pct: number }[]
  countries: { label: string; pct: number }[]
  ages: { label: string; pct: number }[]
  female: number
  male: number
  safety: SafetyAxis[]
  grades: GradeMetric[]
  series: ChartPoint[]
  dayHeat: number[][]
  timeHeat: (number | null)[][]
  posts: WidgetPost[]
  mentions: BrandMention[]
  mentionEr: number
  mentionEffectiveness: number
  mentionSaturation: number
  collabs: CollabRow[]
}

const SAFETY: { key: string; label: string }[] = [
  { key: "substance", label: "Substâncias" },
  { key: "violence", label: "Violência" },
  { key: "body", label: "Corpo e nudez" },
  { key: "offensive", label: "Comportamento ofensivo" },
  { key: "gambling", label: "Jogos de azar" },
  { key: "political", label: "Conteúdo político" },
]

const CULTURE: Record<string, string> = {
  beleza: "Beleza",
  moda: "Moda",
  fitness: "Esporte",
  gastronomia: "Gastronomia",
  tecnologia: "Tecnologia",
  humor: "Humor",
  games: "Games",
  finanças: "Finanças",
  viagem: "Viagem",
  maternidade: "Família",
  sustentabilidade: "Sustentabilidade",
  pets: "Pets",
  decoração: "Casa",
  esportes: "Esporte",
  lifestyle: "Lifestyle",
}

const COLLAB_COLORS = ["#e11d48", "#f9a8d4", "#db2777", "#fb7185", "#111827", "#64748b", "#2563eb", "#f97316", "#7c3aed"]
const MONTHS = ["Jun", "Jul", "Ago", "Set", "Out", "Nov"]
const HEAT_MONTHS = 5
const HEAT_DAYS = 5

function hash(id: string) {
  return id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function daysBetween(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`).getTime()
  const end = new Date(`${to}T00:00:00`).getTime()
  return Math.max(0, Math.round((end - start) / 86400000))
}

export function timeAgo(date: string) {
  const days = daysBetween(date, TODAY)
  if (days < 30) return days <= 1 ? "1 dia atrás" : `${days} dias atrás`
  const months = Math.max(1, Math.round(days / 30))
  return months === 1 ? "1 mês atrás" : `${months} meses atrás`
}

function gradeFromTop(top: number) {
  if (top <= 5) return "A+"
  if (top <= 15) return "A"
  if (top <= 23) return "A-"
  if (top <= 35) return "B+"
  if (top <= 50) return "B"
  if (top <= 70) return "C+"
  if (top <= 85) return "D"
  return "D-"
}

function rankTop(value: number, values: number[]) {
  if (values.length <= 1) return 50
  const better = values.filter((item) => item > value).length
  return Math.min(99, Math.max(1, Math.round((better / (values.length - 1)) * 100) || 1))
}

function moneyRange(value: number) {
  return { min: Math.round(value * 0.82), max: Math.round(value * 1.18) }
}

function safetyOf(creator: Creator): SafetyAxis[] {
  return SAFETY.map((axis) => {
    let level: RiskLevel = "safe"
    if (axis.key === "substance" && creator.fraudScore >= 6) level = "medium"
    else if (axis.key === "substance" && creator.fraudScore >= 3) level = "low"
    else if (axis.key === "offensive" && creator.fraudScore >= 5) level = "low"
    return { ...axis, level }
  })
}

function unit(n: number) {
  const frac = n - Math.floor(n)
  return frac < 0 ? frac + 1 : frac
}

export function buildProfileWidgets(creator: Creator, platform: Platform): ProfileWidgets {
  const profile = creator.networks.find((network) => network.network === platform) ?? creator.networks[0]
  const peers = CREATORS.map((item) => item.networks.find((network) => network.network === platform)).filter((item): item is CreatorNetwork => Boolean(item))
  const price = moneyRange(creator.mediaValue || Math.round(profile.followers / 400))
  const avgLikes = Math.max(1, Math.round(profile.avgViews * (profile.engagementRate / 100) * 0.86))
  const avgComments = Math.max(1, Math.round(avgLikes * 0.045))
  const cpv = profile.avgViews > 0 ? price.min / profile.avgViews : 0
  const cpe = avgLikes + avgComments > 0 ? price.min / (avgLikes + avgComments) : 0
  const seed = hash(creator.id)

  const engagementValues = peers.map((item) => item.engagementRate)
  const viewValues = peers.map((item) => item.avgViews)
  const likeValues = peers.map((item) => item.avgViews * (item.engagementRate / 100))
  const commentValues = likeValues.map((item) => item * 0.045)

  const grades: GradeMetric[] = [
    { key: "engagement", label: "Engajamento", top: rankTop(profile.engagementRate, engagementValues), grade: "" },
    { key: "views", label: "Views", top: rankTop(profile.avgViews, viewValues), grade: "" },
    { key: "likes", label: "Curtidas", top: rankTop(avgLikes, likeValues), grade: "" },
    { key: "comments", label: "Comentários", top: rankTop(avgComments, commentValues), grade: "" },
  ].map((item) => ({ ...item, grade: gradeFromTop(item.top) }))

  const community = peers.reduce((sum, item) => sum + item.avgViews * (item.engagementRate / 100), 0) / Math.max(1, peers.length)
  const baseEngagement = profile.avgViews * (profile.engagementRate / 100)
  const wave = [0.32, 0.22, 1, 0.38, 0.18, 0.2]
  const series = MONTHS.map((label, index) => {
    const shifted = wave[(index + (seed % wave.length)) % wave.length]
    const monthsAgo = MONTHS.length - 1 - index
    const followers = Math.round(profile.followers / Math.pow(1 + growthPercent(creator, 1) / 100, monthsAgo))
    return {
      label,
      engagements: Math.round(baseEngagement * (0.55 + shifted)),
      community: Math.round(community * (0.85 + unit(seed * 0.17 + index) * 0.3)),
      followers,
    }
  })

  const dayNoise = Array.from({ length: HEAT_DAYS }, (_, row) =>
    Array.from({ length: HEAT_MONTHS }, (_, col) => unit(Math.sin(seed + row * 9.1 + col * 4.7) * 43758.5))
  )
  const dayWeight = dayNoise.flat().reduce((sum, value) => sum + value, 0) || 1
  const dayBudget = Math.max(HEAT_DAYS * HEAT_MONTHS, Math.round((creator.totalPosts ?? 40) * 0.45))
  const dayHeat = dayNoise.map((row) => row.map((value) => Math.max(0, Math.round((value / dayWeight) * dayBudget))))

  const timeHeat = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => {
      const noise = unit(Math.sin(seed * 1.3 + row * 3.2 + col * 8.4) * 21938.1)
      if (noise < 0.34) return null
      return Math.round(baseEngagement * noise * (row === 1 && col === 5 ? 1.8 : 0.55))
    })
  )

  const realPosts = creatorPosts(creator.id, platform)
  const posts = [...realPosts, ...syntheticPosts(creator, profile)].slice(0, 4).map((post) => toWidgetPost(post, cpv))

  const mentionMap = new Map<string, { count: number; engagement: number }>()
  for (const post of realPosts) {
    const tags = post.caption.match(/@[\p{L}\p{N}_.]+/gu) ?? []
    const names = tags.length > 0 ? tags : post.campaignName ? [post.campaignName] : []
    for (const name of names) {
      const current = mentionMap.get(name) ?? { count: 0, engagement: 0 }
      current.count += 1
      current.engagement += post.engagement
      mentionMap.set(name, current)
    }
  }
  const mentions = [...mentionMap.entries()]
    .map(([name, value]) => ({
      name,
      count: value.count,
      effectiveness: profile.engagementRate > 0 ? Math.round((value.engagement / value.count / profile.engagementRate) * 1000) / 10 : 0,
      logo: brandLogo(name),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  const sponsored = realPosts.filter((post) => post.campaignId)
  const mentionEr = sponsored.length
    ? sponsored.reduce((sum, post) => sum + post.engagement, 0) / sponsored.length
    : profile.engagementRate * 0.27
  const mentionEffectiveness = profile.engagementRate > 0 ? (mentionEr / profile.engagementRate) * 100 : 0
  const mentionSaturation = realPosts.length > 0 ? (sponsored.length / realPosts.length) * 100 : mentions.length > 0 ? 40 : 0

  const palette = COLLAB_COLORS
  const collabs = collaborations(creator.id).map((item, index) => {
    const dated = realPosts.filter((post) => post.campaignName === item.name)
    const slots = dated.map((post) => monthSlot(post.publishedAt))
    return {
      brand: item.name,
      count: item.posts,
      slots: slots.length > 0 ? slots : [8 + (index % 4)],
      color: palette[index % palette.length],
      logo: brandLogo(item.name),
    }
  })

  const country = creator.location.includes("Brasil") || /[A-Z]{2}$/.test(creator.location.trim()) ? "Brasil" : creator.location
  const cities = creator.audienceLocation.map((item) => ({ label: item.city, pct: item.pct }))
  const cityTotal = cities.reduce((sum, item) => sum + item.pct, 0)
  const countries = [
    { label: country === "Brasil" ? "BR" : country, pct: Math.min(92, Math.max(cityTotal, 60)) },
    { label: "Outros", pct: Math.max(8, 100 - Math.min(92, Math.max(cityTotal, 60))) },
  ]

  return {
    priceMin: price.min,
    priceMax: price.max,
    cpv,
    cpe,
    avgLikes,
    avgComments,
    credibility: Math.max(0, 100 - fakeFollowersPct(creator)),
    culture: CULTURE[creator.niche.find((niche) => niche !== "lifestyle") ?? creator.niche[0]] ?? "Lifestyle",
    cities,
    countries,
    ages: creator.audienceAge.map((item) => ({ label: item.range, pct: item.pct })),
    female: creator.audienceGender.find((item) => item.label.startsWith("Fem"))?.pct ?? 50,
    male: creator.audienceGender.find((item) => item.label.startsWith("Mas"))?.pct ?? 50,
    safety: safetyOf(creator),
    grades,
    series,
    dayHeat,
    timeHeat,
    posts,
    mentions,
    mentionEr,
    mentionEffectiveness,
    mentionSaturation,
    collabs,
  }
}

export function brandLogo(name: string) {
  const folded = name.toLowerCase()
  if (folded.includes("natura")) return ORG_LOGOS.org1.icon
  if (folded.includes("magalu") || folded.includes("magazine")) return ORG_LOGOS.org2.icon
  if (folded.includes("ifood")) return ORG_LOGOS.org3.icon
  return null
}

function monthSlot(date: string) {
  const current = new Date(`${TODAY}T00:00:00`)
  const published = new Date(`${date}T00:00:00`)
  const months = (current.getFullYear() - published.getFullYear()) * 12 + (current.getMonth() - published.getMonth())
  return Math.min(13, Math.max(0, 13 - months))
}

function syntheticPosts(creator: Creator, profile: CreatorNetwork): MonitorPost[] {
  const factors = [1.15, 0.86, 0.62, 0.48]
  return factors.map((factor, index) => ({
    id: `${creator.id}-est-${index}`,
    campaignId: "",
    campaignName: "",
    creatorId: creator.id,
    creatorName: creator.name,
    creatorHandle: creator.handle,
    avatar: creator.avatar,
    image: creator.photo,
    network: profile.network,
    type: profile.network === "youtube" ? "video_youtube" : profile.network === "tiktok" ? "tiktok" : "reels",
    publishedAt: shiftDays(TODAY, 12 + index * 18),
    reach: Math.round(profile.avgViews * factor * 0.9),
    likes: Math.round(profile.avgViews * factor * (profile.engagementRate / 100) * 0.86),
    comments: Math.round(profile.avgViews * factor * (profile.engagementRate / 100) * 0.04),
    shares: 0,
    saves: 0,
    views: Math.round(profile.avgViews * factor),
    engagement: Math.round(profile.engagementRate * (0.8 + factor * 0.25) * 10) / 10,
    url: "",
    caption: creator.bio,
    aiStatus: "aprovado",
    aiScore: 0,
    aiVerdict: "",
  }))
}

function shiftDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00`)
  value.setDate(value.getDate() - days)
  return value.toISOString().slice(0, 10)
}

function toWidgetPost(post: MonitorPost, cpv: number): WidgetPost {
  const views = post.views ?? post.reach
  const title = post.caption.split(/[.!?\n]/)[0]?.trim() || post.caption
  return {
    id: post.id,
    engagement: post.engagement,
    unitCost: views > 0 ? (cpv * views) / Math.max(views, 1) : cpv,
    image: post.image,
    title: title.length > 72 ? `${title.slice(0, 69)}…` : title,
    views,
    likes: post.likes,
    impressions: Math.round(views * 1.55),
    reach: post.reach,
    caption: post.caption,
    ago: timeAgo(post.publishedAt),
    url: post.url,
  }
}

export function riskLabel(level: RiskLevel) {
  if (level === "safe") return "Seguro"
  if (level === "low") return "Baixo"
  return "Médio"
}

export function formatBRL(value: number, digits = 0) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: digits, minimumFractionDigits: digits })
}
