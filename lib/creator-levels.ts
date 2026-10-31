export const MEMBER_PROFILES = ["creator", "affiliate", "researcher", "ambassador"] as const
export type MemberProfile = (typeof MEMBER_PROFILES)[number]

export const REQUIREMENT_KINDS = ["publications", "score", "sales"] as const
export type RequirementKind = (typeof REQUIREMENT_KINDS)[number]

export const REWARD_KINDS = [
  "commission_percent",
  "fixed_commission",
  "fixed_value",
  "voucher",
  "commissioned_voucher",
  "first_sale_commission",
  "none",
] as const
export type RewardKind = (typeof REWARD_KINDS)[number]

export interface LevelRequirement {
  kind: RequirementKind
  enabled: boolean
  quantity: number
}

export interface LevelReward {
  kind: RewardKind
  enabled: boolean
  amount: number
}

export interface CreatorLevel {
  id: string
  name: string
  requirements: LevelRequirement[]
  rewards: LevelReward[]
}

export interface CreatorLevelGroup {
  id: string
  name: string
  profiles: MemberProfile[]
  levels: CreatorLevel[]
}

export function rewardUnit(kind: RewardKind): "percent" | "money" | "none" {
  if (kind === "none") return "none"
  if (kind === "commission_percent" || kind === "commissioned_voucher" || kind === "first_sale_commission") {
    return "percent"
  }
  return "money"
}

export function requirements(values: Partial<Record<RequirementKind, number>>): LevelRequirement[] {
  return REQUIREMENT_KINDS.map((kind) => ({
    kind,
    enabled: values[kind] != null,
    quantity: values[kind] ?? 0,
  }))
}

export function rewards(values: Partial<Record<RewardKind, number>>): LevelReward[] {
  const lost = values.none != null
  return REWARD_KINDS.map((kind) => ({
    kind,
    enabled: lost ? kind === "none" : values[kind] != null,
    amount: kind === "none" ? 0 : (values[kind] ?? 0),
  }))
}

export function normalizeLevel(level: CreatorLevel): CreatorLevel {
  return {
    ...level,
    requirements: REQUIREMENT_KINDS.map(
      (kind) => level.requirements.find((item) => item.kind === kind) ?? { kind, enabled: false, quantity: 0 }
    ),
    rewards: REWARD_KINDS.map(
      (kind) => level.rewards.find((item) => item.kind === kind) ?? { kind, enabled: false, amount: 0 }
    ),
  }
}

function level(id: string, name: string, requirementValues: Partial<Record<RequirementKind, number>>, rewardValues: Partial<Record<RewardKind, number>>): CreatorLevel {
  return {
    id,
    name,
    requirements: requirements(requirementValues),
    rewards: rewards(rewardValues),
  }
}

export const INITIAL_CREATOR_LEVEL_GROUPS: CreatorLevelGroup[] = [
  {
    id: "group-modelo",
    name: "Modelo 1",
    profiles: ["creator", "affiliate"],
    levels: [
      level("level-ouro", "Ouro", { score: 1000 }, { commission_percent: 20 }),
      level("level-prata", "Prata", { score: 1000 }, { commission_percent: 10 }),
      level("level-bronze", "Bronze", { score: 500 }, { voucher: 100 }),
    ],
  },
  {
    id: "group-creators",
    name: "Creators",
    profiles: ["researcher"],
    levels: [
      level("level-ativo", "Ativo", { publications: 5, sales: 2 }, { commission_percent: 5 }),
    ],
  },
  {
    id: "group-teste",
    name: "teste",
    profiles: ["ambassador"],
    levels: [],
  },
]
