export const PUSH_CREDIT_COST = 5
export const DEFAULT_BRAND_CREDITS = 20

export const CREDIT_PACKS = [
  { id: "50", credits: 50, priceCents: 4900 },
  { id: "200", credits: 200, priceCents: 14900 },
  { id: "500", credits: 500, priceCents: 29900 },
] as const

export type CreditPackId = (typeof CREDIT_PACKS)[number]["id"]
