// Spike: real calls to social-listening through the gateway (Meta Creator
// Marketplace). Types mirror social-listening's api/openapi.yaml.
import { ApiError } from "@/lib/api/client"

export const SL = "/v1/social-listening/marca"

export type DiscoveryStatusValue = "available" | "missing_permission" | "brand_not_onboarded" | "unavailable_disconnected"

export interface InstagramConnection {
  network: "instagram"
  status: "connected" | "awaiting_messaging_permission" | "disconnected"
  username?: string
  accountId?: string
  updatedAt?: string
  instruction?: string
  discovery: { status: DiscoveryStatusValue; instruction?: string }
}

export interface PendingConnection {
  id: string
  accounts: { id: string; username: string }[]
  expiresAt: string
}

export interface ConnectResult {
  outcome: "connected" | "pending_choice"
  socialAccount?: { id: string; username: string; status: string }
  pendingConnection?: PendingConnection
}

export type AgeBucket = "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+"
export const AGE_BUCKETS: AgeBucket[] = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]

export interface CreatorFilters {
  text?: string
  countries?: string[]
  states?: string[]
  minFollowers?: number
  maxFollowers?: number
  interests?: string[]
  gender?: string
  ageBucket?: AgeBucket
  audienceCountries?: string[]
  audienceAgeBucket?: AgeBucket
  audienceGender?: string
  minEngagedAccounts?: number
  maxEngagedAccounts?: number
  verifiedOnly?: boolean
}

export interface CreatorSummary {
  id: string
  username: string
  pictureUrl: string
  verified: boolean
  country: string
  category: string
  followers: number
  badges: string[]
  onboarded: boolean
}

export interface SearchResponse {
  creators: CreatorSummary[]
  nextCursor?: string
  fetchedAt: string
  coinBalance: number
}

export type InsightsPeriod = "this_week" | "last_14_days" | "this_month"
export const PERIODS: { id: InsightsPeriod; label: string }[] = [
  { id: "this_week", label: "Esta semana" },
  { id: "last_14_days", label: "Últimos 14 dias" },
  { id: "this_month", label: "Este mês" },
]

export interface Share {
  key: string
  accounts: number
}

export interface CreatorInsights {
  period: InsightsPeriod
  engagedAccounts: number
  reach: number
  views: number
  interactions: number
  engagedByAge: Share[]
  engagedByGender: Share[]
  engagedByCountry: Share[]
  engagedByCity: Share[]
}

export interface CreatorMedia {
  id: string
  permalink: string
  thumbnailUrl?: string
}

export interface CreatorProfile {
  id: string
  username: string
  bio?: string
  gender?: string
  ageBucket?: AgeBucket
  email?: string
  portfolioUrl?: string
  engagementRate: number
  reelsHookRate: number
  recentMedia: CreatorMedia[]
  brandedContent: CreatorMedia[]
  hasPartnerships: boolean
  partnerBrands: string[]
}

export interface ProfileResponse {
  creator: CreatorProfile
  insights: CreatorInsights
  fetchedAt: string
  coinBalance: number
}

export interface InsightsResponse {
  insights: CreatorInsights
  fetchedAt: string
  coinBalance: number
}

// Where Meta sends the browser back. social-listening's META_REDIRECT_URI
// must be <front origin> + this path, and the same URL must be listed in the
// Meta app's Valid OAuth Redirect URIs.
export const INSTAGRAM_CALLBACK_PATH = "/settings/instagram/callback"

// Readable message for a failed call: the code, plus the problem's detail
// (social-listening writes it as "what to do next").
export function describeError(err: unknown): { code: string; detail: string } {
  if (err instanceof ApiError) {
    const p = err.problem ?? {}
    const parts: string[] = []
    if (typeof p.detail === "string") parts.push(p.detail)
    if (err.code === "insufficient_coins") parts.push(`Preço: ${String(p.price)} coins · saldo: ${String(p.balance)} coins.`)
    if (!parts.length) parts.push(KNOWN[err.code] ?? (err.message !== err.code ? err.message : "Falha na chamada."))
    return { code: err.code, detail: parts.join(" ") }
  }
  return { code: "unknown", detail: err instanceof Error ? err.message : String(err) }
}

const KNOWN: Record<string, string> = {
  api_not_configured: "NEXT_PUBLIC_API_URL não configurada.",
  not_signed_in: "Entre com conta real (Clerk) para chamar o backend.",
  brand_required: "Defina a Marca ativa em Configurações → Integrações.",
  network_error: "Não foi possível falar com o gateway (rede ou CORS).",
  module_disabled: "O módulo social_listening não está habilitado para esta Marca.",
  brand_access_denied: "Seu usuário não tem acesso a esta Marca.",
  forbidden: "Só owner ou manager da Marca podem fazer isso.",
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR", { notation: n >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n)
}

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("pt-BR")
}
