import type { Network } from "@/lib/mock-data/creators"

export const SOCIAL_NETWORKS: Network[] = ["instagram", "tiktok", "youtube"]

export const SOCIAL_LABEL: Record<Network, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
}

export const SOCIAL_PLACEHOLDER: Record<Network, string> = {
  instagram: "https://instagram.com/seu.perfil",
  tiktok: "https://tiktok.com/@seu.perfil",
  youtube: "https://youtube.com/@seucanal",
}

type AnswerValue = string | string[]

export interface ParsedSocial {
  network: Network
  handle: string
  url: string
}

const HOST: Record<Network, RegExp> = {
  instagram: /(^|\.)instagram\.com$/i,
  tiktok: /(^|\.)tiktok\.com$/i,
  youtube: /(^|\.)(youtube\.com|youtu\.be)$/i,
}

export function isSocialNetwork(value: string): value is Network {
  return value === "instagram" || value === "tiktok" || value === "youtube"
}

function emptyDraft(): Record<Network, string> {
  return { instagram: "", tiktok: "", youtube: "" }
}

function asUrl(raw: string) {
  try {
    return new URL(raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`)
  } catch {
    return null
  }
}

export function detectNetwork(raw: string): Network | null {
  const url = asUrl(raw.trim())
  if (!url) return null
  return SOCIAL_NETWORKS.find((network) => HOST[network].test(url.hostname)) ?? null
}

function handleFromUrl(network: Network, url: URL) {
  const parts = url.pathname.split("/").filter(Boolean)
  if (network === "youtube") {
    const at = parts.find((part) => part.startsWith("@"))
    if (at) return at
    if ((parts[0] === "channel" || parts[0] === "c" || parts[0] === "user") && parts[1]) return `@${parts[1]}`
    return parts[0] ? `@${parts[0].replace(/^@/, "")}` : url.hostname
  }
  const named = parts.find((part) => part.startsWith("@"))
  if (named) return named.startsWith("@") ? named : `@${named}`
  const skip = new Set(["p", "reel", "reels", "stories", "explore", "watch", "shorts"])
  const name = parts.find((part) => !skip.has(part.toLowerCase()))
  return name ? `@${name.replace(/^@/, "")}` : url.hostname
}

function profileUrl(network: Network, handle: string) {
  const name = handle.replace(/^@/, "")
  if (network === "instagram") return `https://instagram.com/${name}`
  if (network === "tiktok") return `https://www.tiktok.com/@${name}`
  return `https://www.youtube.com/@${name}`
}

export function parseSocialEntry(network: Network, raw: string): ParsedSocial | null {
  const value = raw.trim()
  if (!value) return null
  const looksLikeUrl = /[/:]/.test(value) || /(instagram|tiktok|youtube|youtu\.be)/i.test(value)
  if (!looksLikeUrl && /^@?[A-Za-z0-9._-]{2,40}$/.test(value)) {
    const handle = `@${value.replace(/^@/, "")}`
    return { network, handle, url: profileUrl(network, handle) }
  }
  const url = asUrl(value)
  if (!url || !HOST[network].test(url.hostname)) return null
  const handle = handleFromUrl(network, url)
  return { network, handle, url: url.toString() }
}

export function readSocialDraft(value: AnswerValue | undefined): Record<Network, string> {
  const draft = emptyDraft()
  const items = Array.isArray(value) ? value : typeof value === "string" && value.trim() ? [value] : []
  for (const item of items) {
    const bar = item.indexOf("|")
    if (bar > 0) {
      const network = item.slice(0, bar)
      if (isSocialNetwork(network)) draft[network] = item.slice(bar + 1)
      continue
    }
    const detected = detectNetwork(item)
    if (detected && !draft[detected]) draft[detected] = item.trim()
  }
  return draft
}

export function writeSocialDraft(draft: Record<Network, string>): string[] {
  return SOCIAL_NETWORKS.flatMap((network) => {
    const raw = draft[network]
    return raw.trim() ? [`${network}|${raw}`] : []
  })
}

export function parsedSocialLinks(value: AnswerValue | undefined): ParsedSocial[] {
  const draft = readSocialDraft(value)
  return SOCIAL_NETWORKS.flatMap((network) => {
    const parsed = parseSocialEntry(network, draft[network])
    return parsed ? [parsed] : []
  })
}

export function invalidSocialFields(value: AnswerValue | undefined): Network[] {
  const draft = readSocialDraft(value)
  return SOCIAL_NETWORKS.filter((network) => draft[network].trim().length > 0 && !parseSocialEntry(network, draft[network]))
}

export function socialLinksFilled(value: AnswerValue | undefined) {
  return parsedSocialLinks(value).length > 0
}

export function socialLinksText(value: AnswerValue | undefined) {
  return parsedSocialLinks(value)
    .map((item) => `${SOCIAL_LABEL[item.network]} ${item.handle}`)
    .join(", ")
}
