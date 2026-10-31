export type MembershipRole = "affiliate" | "creator"

export const MEMBERSHIP_ROLE_LABEL: Record<MembershipRole, string> = {
  affiliate: "Afiliado",
  creator: "Creator",
}

export const MEMBERSHIP_ROLE_HELP: Record<MembershipRole, string> = {
  affiliate: "Só as vendas feitas com o cupom entram no rastreio.",
  creator: "Conteúdos publicados e vendas entram no rastreio.",
}

export const CONTENT_TRACKED_EVENTS = new Set([
  "post",
  "reel",
  "video",
  "short",
  "story",
  "live",
  "mencao",
])

export function tracksContent(role: MembershipRole | undefined): boolean {
  return role === "creator"
}

export function tracksCouponSales(role: MembershipRole | undefined): boolean {
  return role === "affiliate" || role === "creator"
}
