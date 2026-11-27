import { CAMPAIGNS } from "@/lib/mock-data/campaigns"
import { CRM_LISTS, RELATIONSHIP_HISTORY } from "@/lib/mock-data/crm"
import { type Creator } from "@/lib/mock-data/creators"
import { MOCK_USERS } from "@/lib/mock-data/users"

/** Creators who are also customers of the brand, keyed by organization. */
export const BRAND_CUSTOMER_IDS: Record<string, string[]> = {
  org1: ["c1", "c7", "c11", "c13"],
  org2: ["c4", "c6", "c8", "c1"],
  org3: ["c2", "c9", "c12"],
}

const PLATFORM_EMAILS = new Set(
  MOCK_USERS.filter((user) => user.role === "creator").map((user) => user.email.toLowerCase())
)

const baseCache = new Map<string, Set<string>>()

export function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
}

export function containsQuery(value: string, query: string) {
  const text = fold(value)
  const tokens = fold(query).split(/\s+/).filter(Boolean)
  return tokens.length > 0 && tokens.every((token) => text.includes(token))
}

export function locationTokens(value: string) {
  return value.split("|").map((token) => token.trim()).filter(Boolean)
}

export function locationTokenLabel(token: string) {
  if (token.startsWith("state:")) {
    const [, , ...name] = token.split(":")
    return name.join(":") || token.split(":")[1] || token
  }
  if (token.startsWith("city:")) {
    const [, name, uf] = token.split(":")
    return uf ? `${name}, ${uf}` : name
  }
  if (token.startsWith("country:")) {
    return token.slice("country:".length) || token
  }
  return token
}

function matchesLocationToken(value: string, token: string) {
  if (token.startsWith("state:")) {
    const uf = token.split(":")[1]?.toLowerCase()
    if (!uf) return false
    return new RegExp(`(?:^|[^a-z])${uf}(?:[^a-z]|$)`).test(fold(value))
  }
  const name = token.startsWith("city:") ? token.split(":")[1] : token
  return Boolean(name) && containsQuery(value, name)
}

/** A creator matches when any selected place fits. Cities use the official name; states use the UF. */
export function matchesAnyLocation(value: string, stored: string) {
  const tokens = locationTokens(stored)
  if (tokens.length === 0) return true
  return tokens.some((token) => matchesLocationToken(value, token))
}

export function brandCreatorIds(organizationId: string) {
  const cached = baseCache.get(organizationId)
  if (cached) return cached

  const ids = new Set<string>()
  for (const list of CRM_LISTS) {
    if (list.organizationId !== organizationId) continue
    for (const creatorId of list.creatorIds) ids.add(creatorId)
  }
  for (const event of RELATIONSHIP_HISTORY) {
    if (event.organizationId === organizationId) ids.add(event.creatorId)
  }
  for (const campaign of CAMPAIGNS) {
    if (campaign.organizationId !== organizationId) continue
    for (const participant of campaign.participants) ids.add(participant.creatorId)
  }
  baseCache.set(organizationId, ids)
  return ids
}

export function isBrandCustomer(creatorId: string, organizationId: string) {
  return (BRAND_CUSTOMER_IDS[organizationId] ?? []).includes(creatorId)
}

export function hasPlatformAccount(creator: Creator) {
  return PLATFORM_EMAILS.has(creator.email.toLowerCase())
}

export function isLinkedPlatformMember(creator: Creator, organizationId: string) {
  return hasPlatformAccount(creator) && brandCreatorIds(organizationId).has(creator.id)
}

export function predominantCities(creator: Creator) {
  if (creator.audienceLocation.length === 0) return []
  const max = Math.max(...creator.audienceLocation.map((place) => place.pct))
  return creator.audienceLocation.filter((place) => place.pct === max).map((place) => place.city)
}

const TIER_ORDER = ["nano", "micro", "mid", "macro", "mega"]

function specificNiches(creator: Creator) {
  const specific = creator.niche.filter((niche) => niche !== "lifestyle")
  return specific.length > 0 ? specific : creator.niche
}

/** Shares a specific niche and sits at most one tier away. Lifestyle alone does not count as similarity. */
export function isSimilarCreator(reference: Creator, candidate: Creator) {
  if (reference.id === candidate.id) return false
  const shared = specificNiches(reference).some((niche) => specificNiches(candidate).includes(niche))
  if (!shared) return false
  const distance = Math.abs(TIER_ORDER.indexOf(reference.tier) - TIER_ORDER.indexOf(candidate.tier))
  return distance <= 1
}
