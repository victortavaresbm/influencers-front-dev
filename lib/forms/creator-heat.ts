import { tokens } from "@/lib/forms/brief-check"
import { parsedSocialLinks, SOCIAL_LABEL, isSocialNetwork } from "@/lib/forms/social-links"
import type { Campaign } from "@/lib/mock-data/campaigns"
import type { Creator, Network } from "@/lib/mock-data/creators"
import type { ApplicationForm, FormResponse } from "@/lib/mock-data/forms"
import { formatCompact } from "@/lib/discovery/discover-query"

export type HeatLevel = "frio" | "morno" | "quente"
export type HeatTone = "ok" | "warn" | "bad"

export type HeatCheckKey =
  | "needNetwork"
  | "networkOff"
  | "nicheOk"
  | "nicheWeak"
  | "nicheOff"
  | "audienceOk"
  | "audienceOff"
  | "engagementOk"
  | "engagementOff"
  | "briefOk"
  | "briefWeak"
  | "doHit"
  | "dontHit"
  | "alsoOn"
  | "audienceAge"
  | "audienceCity"
  | "unknown"

export interface HeatCheck {
  tone: HeatTone
  key: HeatCheckKey
  vars?: Record<string, string | number>
}

export interface TrackedProfile {
  network: Network
  handle: string
  url: string
  followers?: number
  engagementRate?: number
  fromBase: boolean
}

export interface CreatorHeat {
  score: number
  level: HeatLevel
  flames: 1 | 2 | 3
  profiles: TrackedProfile[]
  checks: HeatCheck[]
}

const WEAK_NICHE = new Set(["lifestyle"])
const GENERIC_GUIDE = new Set(["app", "usar", "mostrar", "falar", "conteudo", "marca", "produto", "forma", "claro", "fazer"])

function guidelineHit(answer: string, rule: string) {
  const answerTokens = tokens(answer)
  const distinctive = tokens(rule).filter((token) => !GENERIC_GUIDE.has(token))
  if (distinctive.length === 0) return false
  const hits = distinctive.filter((token) => answerTokens.includes(token)).length
  return hits / distinctive.length >= 0.3
}

function overlap(source: string[], target: string[]) {
  if (source.length === 0 || target.length === 0) return 0
  const set = new Set(target)
  const hits = source.filter((token) => set.has(token)).length
  return Math.min(1, hits / Math.max(4, Math.min(source.length, target.length)))
}

function answerBlob(form: ApplicationForm, response: FormResponse) {
  return form.questions
    .filter((question) => question.type !== "social_links" && question.type !== "email" && question.type !== "phone")
    .map((question) => {
      const value = response.answers.find((answer) => answer.questionId === question.id)?.value
      if (Array.isArray(value)) return value.join(" ")
      return value ?? ""
    })
    .join(" ")
}

function sameHandle(left: string, right: string) {
  return left.trim().replace(/^@/, "").toLowerCase() === right.trim().replace(/^@/, "").toLowerCase()
}

function levelOf(score: number): { level: HeatLevel; flames: 1 | 2 | 3 } {
  if (score >= 70) return { level: "quente", flames: 3 }
  if (score >= 40) return { level: "morno", flames: 2 }
  return { level: "frio", flames: 1 }
}

function fold(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
}

function choiceNiche(form: ApplicationForm, response: FormResponse, targets: string[], summary: string) {
  const selected = form.questions.flatMap((question) => {
    if (question.type !== "single_choice" && question.type !== "multiple_choice") return []
    const value = response.answers.find((answer) => answer.questionId === question.id)?.value
    if (Array.isArray(value)) return value
    return value ? [value] : []
  })
  const wanted = (targets.length > 0 ? targets : tokens(summary)).map(fold)
  const hits = selected.filter((option) => {
    const token = fold(option)
    return wanted.some((item) => item === token || item.includes(token) || token.includes(item))
  })
  if (hits.some((option) => fold(option) !== "lifestyle")) return 22
  if (hits.length > 0) return 8
  return 0
}

function profileNiche(creator: Creator, targets: string[], summary: string) {
  const wanted = targets.length > 0 ? targets.map((item) => item.toLowerCase()) : tokens(summary)
  const hits = creator.niche.filter((niche) => wanted.includes(niche.toLowerCase()))
  if (hits.some((niche) => !WEAK_NICHE.has(niche))) return 40
  if (hits.length > 0) return 10
  if (targets.length === 0 && overlap(tokens(creator.niche.join(" ")), tokens(summary)) >= 0.34) return 18
  return 0
}

function mentionsRestriction(answer: string, rule: string) {
  const ruleTokens = tokens(rule).filter((token) => !["nao", "mostrar", "usar", "fazer", "tratar", "publicar"].includes(token))
  const answerTokens = tokens(answer)
  if (ruleTokens.length === 0) return false
  const hits = ruleTokens.filter((token) => answerTokens.includes(token))
  if (hits.length / ruleTokens.length < 0.5) return false
  const normalized = answer.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
  return !hits.some((token) => new RegExp(`nao.{0,40}${token}|${token}.{0,40}nao`).test(normalized))
}

function rateLabel(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })
}

export function creatorHeat(
  form: ApplicationForm,
  response: FormResponse,
  campaign?: Campaign | null,
  creator?: Creator,
): CreatorHeat {
  const question = form.questions.find((item) => item.type === "social_links")
  const value = question ? response.answers.find((answer) => answer.questionId === question.id)?.value : undefined
  const parsed = parsedSocialLinks(value)
  if (parsed.length === 0) {
    const cold = levelOf(12)
    return { score: 12, ...cold, profiles: [], checks: [{ tone: "bad", key: "needNetwork" }] }
  }

  const targets = (campaign?.targetNetworks ?? []).filter(isSocialNetwork)
  const profiles: TrackedProfile[] = parsed.map((item) => {
    const stats = creator?.networks.find((network) => network.network === item.network)
    const handleMatches = stats ? sameHandle(stats.handle, item.handle) || sameHandle(creator?.handle ?? "", item.handle) : false
    const known = Boolean(stats && (handleMatches || creator))
    return {
      network: item.network,
      handle: known && stats ? stats.handle : item.handle,
      url: item.url,
      followers: known ? stats?.followers : undefined,
      engagementRate: known ? stats?.engagementRate : undefined,
      fromBase: known,
    }
  })

  const summary = [form.brandSummary, campaign?.description, campaign?.objective].filter(Boolean).join(" ")
  const niches = campaign?.targetNiches ?? []
  const niche = Math.max(creator ? profileNiche(creator, niches, summary) : 0, choiceNiche(form, response, niches, summary))
  const onTarget = targets.length === 0 || profiles.some((profile) => targets.includes(profile.network))
  const networkPoints = onTarget ? 15 : 4

  const hasRange = Boolean(campaign && campaign.minFollowers > 0 && campaign.maxFollowers > 0)
  const followersOk = !creator || !hasRange || (creator.totalFollowers >= (campaign?.minFollowers ?? 0) && creator.totalFollowers <= (campaign?.maxFollowers ?? Infinity))
  const hasEngagementFloor = Boolean(campaign && campaign.minEngagement > 0)
  const engagementOk = !creator || !hasEngagementFloor || creator.avgEngagement >= (campaign?.minEngagement ?? 0)
  let audiencePoints = 4
  if (creator && niche >= 40 && followersOk && engagementOk) audiencePoints = 15
  else if (creator && niche >= 40) audiencePoints = 8
  else if (creator && followersOk && engagementOk) audiencePoints = 5
  else if (creator) audiencePoints = 2

  const text = answerBlob(form, response)
  const corpus = [summary, ...(campaign?.doList ?? [])].filter(Boolean).join(" ")
  const answerTokens = tokens(text)
  const corpusTokens = tokens(corpus)
  const ratio = overlap(answerTokens, corpusTokens)
  const shared = corpusTokens.filter((token) => token.length > 4 && answerTokens.includes(token))
  let guide = Math.round(ratio * 18)
  if (shared.length >= 2) guide = Math.max(guide, 14)
  if ((response.matchScore ?? 0) >= 70 && ratio >= 0.15) guide += 8

  const checks: HeatCheck[] = []
  if (!onTarget) {
    checks.push({
      tone: "bad",
      key: "networkOff",
      vars: { networks: targets.map((network) => SOCIAL_LABEL[network]).join(", ") },
    })
  }
  if (!creator) checks.push({ tone: "warn", key: "unknown" })

  if (creator && niches.length > 0) {
    const wanted = niches.map((item) => item.toLowerCase())
    const hits = creator.niche.filter((nicheName) => wanted.includes(nicheName))
    const specific = hits.filter((nicheName) => !WEAK_NICHE.has(nicheName))
    if (specific.length > 0) checks.push({ tone: "ok", key: "nicheOk", vars: { niches: specific.join(", ") } })
    else if (hits.length > 0) checks.push({ tone: "warn", key: "nicheWeak", vars: { niches: creator.niche.join(", ") } })
    else checks.push({ tone: "bad", key: "nicheOff", vars: { niches: creator.niche.join(", "), targets: niches.join(", ") } })
  } else if (creator && summary) {
    if (niche >= 30) checks.push({ tone: "ok", key: "nicheOk", vars: { niches: creator.niche.join(", ") } })
    else if (niche >= 10) checks.push({ tone: "warn", key: "nicheWeak", vars: { niches: creator.niche.join(", ") } })
    else checks.push({ tone: "bad", key: "nicheOff", vars: { niches: creator.niche.join(", "), targets: form.organizationName } })
  }

  if (creator && hasRange && campaign) {
    checks.push({
      tone: followersOk ? "ok" : "bad",
      key: followersOk ? "audienceOk" : "audienceOff",
      vars: {
        followers: formatCompact(creator.totalFollowers),
        min: formatCompact(campaign.minFollowers),
        max: formatCompact(campaign.maxFollowers),
      },
    })
  }
  if (creator && hasEngagementFloor && campaign) {
    checks.push({
      tone: engagementOk ? "ok" : "bad",
      key: engagementOk ? "engagementOk" : "engagementOff",
      vars: { rate: rateLabel(creator.avgEngagement), min: rateLabel(campaign.minEngagement) },
    })
  }

  if (creator) {
    const age = [...creator.audienceAge].sort((left, right) => right.pct - left.pct)[0]
    const city = [...creator.audienceLocation].sort((left, right) => right.pct - left.pct)[0]
    if (age) checks.push({ tone: "ok", key: "audienceAge", vars: { range: age.range, pct: age.pct } })
    if (city) checks.push({ tone: "ok", key: "audienceCity", vars: { city: city.city, pct: city.pct } })
    const extra = creator.networks.filter((network) => !profiles.some((profile) => profile.network === network.network)).slice(0, 2)
    for (const network of extra) {
      checks.push({
        tone: "ok",
        key: "alsoOn",
        vars: { network: SOCIAL_LABEL[network.network], handle: network.handle, followers: formatCompact(network.followers) },
      })
    }
  }

  const doHits = (campaign?.doList ?? []).filter((item) => guidelineHit(text, item)).slice(0, 2)
  for (const item of doHits) {
    guide += 4
    checks.push({ tone: "ok", key: "doHit", vars: { text: item } })
  }
  const dontHits = (campaign?.dontList ?? []).filter((item) => mentionsRestriction(text, item) && guidelineHit(text, item)).slice(0, 2)
  for (const item of dontHits) {
    guide = Math.max(0, guide - 12)
    checks.push({ tone: "bad", key: "dontHit", vars: { text: item } })
  }
  guide = Math.min(30, guide)
  if (doHits.length === 0 && text.trim() && corpus.trim()) {
    const aligned = ratio >= 0.28 || ((response.matchScore ?? 0) >= 70 && ratio >= 0.15)
    checks.push({ tone: aligned ? "ok" : "warn", key: aligned ? "briefOk" : "briefWeak" })
  }

  let score = Math.round(networkPoints + niche + audiencePoints + guide)
  if (!creator) score = Math.min(score, 69)
  score = Math.max(0, Math.min(100, score))
  return { score, ...levelOf(score), profiles, checks }
}
