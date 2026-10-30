export type AudienceTierId = "nano" | "micro" | "mid" | "macro" | "mega"

export interface AudienceTier {
  id: AudienceTierId
  label: string
  min: number
  max: number
  range: string
  color: string
}

export const TIERS: AudienceTier[] = [
  { id: "nano",  label: "Nano",  min: 1_000,     max: 10_000,    range: "1–10 mil",      color: "zinc" },
  { id: "micro", label: "Micro", min: 10_000,    max: 50_000,    range: "10–50 mil",     color: "sky" },
  { id: "mid",   label: "Mid",   min: 50_000,    max: 500_000,   range: "50–500 mil",    color: "violet" },
  { id: "macro", label: "Macro", min: 500_000,   max: 1_000_000, range: "500 mil–1 mi",  color: "amber" },
  { id: "mega",  label: "Mega",  min: 1_000_000, max: 10_000_000,range: "1 mi+",         color: "rose" },
]

export function tierById(id: string): AudienceTier {
  return TIERS.find((t) => t.id === id) ?? TIERS[0]
}

export function tierForFollowers(followers: number): AudienceTier {
  return TIERS.slice().reverse().find((t) => followers >= t.min) ?? TIERS[0]
}
