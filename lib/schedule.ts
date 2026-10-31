import { type Campaign, type SocialNetwork } from "@/lib/mock-data/campaigns"
import { MONITOR_POSTS, type PostAiStatus } from "@/lib/mock-data/metrics"
import { memberTracksContent } from "@/lib/stores/membership"

export type SlotStatus = "publicado" | "agendado" | "pendente" | "atrasado"
export type DayHealth = "ok" | "atencao" | "atraso"
export type BriefingFit = "ok" | "ressalva" | "fora"

export interface ContentSlot {
  id: string
  campaignId: string
  campaignName: string
  organizationId: string
  creatorId: string
  creatorName: string
  creatorHandle: string
  avatar: string
  network: SocialNetwork
  format: string
  date: string
  posted: boolean
  programmed: boolean
  fit: BriefingFit
  note?: string
}

export const DAY_HEALTH_LABEL: Record<DayHealth, string> = {
  ok: "Em dia",
  atencao: "Atenção",
  atraso: "Atraso",
}

export const SLOT_STATUS_LABEL: Record<SlotStatus, string> = {
  publicado: "Publicado",
  agendado: "Agendado",
  pendente: "Aguardando",
  atrasado: "Não publicado",
}

type PlannedSlot = Omit<ContentSlot, "campaignName" | "organizationId">

const PLANNED: PlannedSlot[] = [
  {
    id: "plan-camp1-1027",
    campaignId: "camp1",
    creatorId: "c5",
    creatorName: "Fernanda Costa",
    creatorHandle: "@fercostamoda",
    avatar: "FC",
    network: "instagram",
    format: "reels",
    date: "2026-10-27",
    posted: true,
    programmed: true,
    fit: "ok",
  },
  {
    id: "plan-camp1-1028",
    campaignId: "camp1",
    creatorId: "c13",
    creatorName: "Henrique Campos",
    creatorHandle: "@henriquehair",
    avatar: "HC",
    network: "instagram",
    format: "stories",
    date: "2026-10-28",
    posted: false,
    programmed: true,
    fit: "ok",
    note: "Stories do unboxing não saíram no dia.",
  },
  {
    id: "plan-camp1-1029-carol",
    campaignId: "camp1",
    creatorId: "c3",
    creatorName: "Carolina Souza",
    creatorHandle: "@carolsouza",
    avatar: "CS",
    network: "instagram",
    format: "stories",
    date: "2026-10-29",
    posted: true,
    programmed: true,
    fit: "ok",
  },
  {
    id: "plan-camp1-1029-bianca",
    campaignId: "camp1",
    creatorId: "c1",
    creatorName: "Bianca Torres",
    creatorHandle: "@biancatorres",
    avatar: "BT",
    network: "instagram",
    format: "reels",
    date: "2026-10-29",
    posted: false,
    programmed: true,
    fit: "ok",
    note: "Reels programado para hoje e ainda não publicado.",
  },
  {
    id: "plan-camp1-1029-fer",
    campaignId: "camp1",
    creatorId: "c5",
    creatorName: "Fernanda Costa",
    creatorHandle: "@fercostamoda",
    avatar: "FC",
    network: "instagram",
    format: "stories",
    date: "2026-10-29",
    posted: false,
    programmed: true,
    fit: "ok",
    note: "Sequência de stories programada para o fim do dia.",
  },
  {
    id: "plan-camp1-1030",
    campaignId: "camp1",
    creatorId: "c3",
    creatorName: "Carolina Souza",
    creatorHandle: "@carolsouza",
    avatar: "CS",
    network: "instagram",
    format: "post_feed",
    date: "2026-10-30",
    posted: false,
    programmed: true,
    fit: "ok",
  },
  {
    id: "plan-camp1-1102",
    campaignId: "camp1",
    creatorId: "c5",
    creatorName: "Fernanda Costa",
    creatorHandle: "@fercostamoda",
    avatar: "FC",
    network: "tiktok",
    format: "tiktok",
    date: "2026-11-02",
    posted: false,
    programmed: false,
    fit: "ok",
    note: "Programação incompleta: falta legenda e menção obrigatória.",
  },
  {
    id: "plan-camp3-1028",
    campaignId: "camp3",
    creatorId: "c2",
    creatorName: "Pedro Alves",
    creatorHandle: "@pedroalves",
    avatar: "PA",
    network: "tiktok",
    format: "tiktok",
    date: "2026-10-28",
    posted: false,
    programmed: true,
    fit: "ok",
    note: "Vídeo programado e não publicado.",
  },
  {
    id: "plan-camp3-1029",
    campaignId: "camp3",
    creatorId: "c9",
    creatorName: "Amanda Oliveira",
    creatorHandle: "@amandamae",
    avatar: "AO",
    network: "instagram",
    format: "reels",
    date: "2026-10-29",
    posted: false,
    programmed: true,
    fit: "ok",
    note: "Reels programado para hoje e ainda não publicado.",
  },
  {
    id: "plan-camp3-1031",
    campaignId: "camp3",
    creatorId: "c2",
    creatorName: "Pedro Alves",
    creatorHandle: "@pedroalves",
    avatar: "PA",
    network: "instagram",
    format: "stories",
    date: "2026-10-31",
    posted: false,
    programmed: true,
    fit: "ok",
  },
  {
    id: "plan-camp7-1028",
    campaignId: "camp7",
    creatorId: "c14",
    creatorName: "Juliana Freitas",
    creatorHandle: "@judecordecasa",
    avatar: "JF",
    network: "instagram",
    format: "stories",
    date: "2026-10-28",
    posted: false,
    programmed: true,
    fit: "ok",
    note: "Stories do app não foram ao ar.",
  },
  {
    id: "plan-camp7-1029",
    campaignId: "camp7",
    creatorId: "c11",
    creatorName: "Isabela Mendes",
    creatorHandle: "@isabelasustenta",
    avatar: "IM",
    network: "instagram",
    format: "post_feed",
    date: "2026-10-29",
    posted: false,
    programmed: true,
    fit: "ok",
    note: "Post programado para hoje e ainda não publicado.",
  },
  {
    id: "plan-camp7-1103",
    campaignId: "camp7",
    creatorId: "c14",
    creatorName: "Juliana Freitas",
    creatorHandle: "@judecordecasa",
    avatar: "JF",
    network: "instagram",
    format: "reels",
    date: "2026-11-03",
    posted: false,
    programmed: true,
    fit: "ok",
  },
]

function fitFromAi(status: PostAiStatus): BriefingFit {
  if (status === "reprovado") return "fora"
  if (status === "alerta") return "ressalva"
  return "ok"
}

export function todayIso(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function toIso(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function utcDay(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number)
  return Date.UTC(year, month - 1, day)
}

export function closestSlotDate(slots: ContentSlot[], today: string): string {
  if (slots.length === 0) return today
  return slots.reduce((best, slot) => {
    const bestDistance = Math.abs(utcDay(best) - utcDay(today))
    const distance = Math.abs(utcDay(slot.date) - utcDay(today))
    return distance < bestDistance ? slot.date : best
  }, slots[0].date)
}

export function buildSchedule(campaigns: Campaign[], today = todayIso()): ContentSlot[] {
  const byId = new Map(campaigns.map((campaign) => [campaign.id, campaign]))

  const published = MONITOR_POSTS.flatMap((post) => {
    const campaign = byId.get(post.campaignId)
    if (!campaign || !memberTracksContent(post.creatorId)) return []
    const inFuture = post.publishedAt > today
    const slot: ContentSlot = {
      id: `post-${post.id}`,
      campaignId: campaign.id,
      campaignName: campaign.name,
      organizationId: campaign.organizationId,
      creatorId: post.creatorId,
      creatorName: post.creatorName,
      creatorHandle: post.creatorHandle,
      avatar: post.avatar,
      network: post.network,
      format: post.type,
      date: post.publishedAt,
      posted: !inFuture,
      programmed: true,
      fit: inFuture ? "ok" : fitFromAi(post.aiStatus),
      note: inFuture ? undefined : post.aiIssues?.[0],
    }
    return [slot]
  })

  const planned = PLANNED.flatMap((slot) => {
    const campaign = byId.get(slot.campaignId)
    if (!campaign || !memberTracksContent(slot.creatorId)) return []
    return [{
      ...slot,
      campaignName: campaign.name,
      organizationId: campaign.organizationId,
    }]
  })

  return [...published, ...planned].sort((a, b) => (
    a.date.localeCompare(b.date) || a.creatorName.localeCompare(b.creatorName)
  ))
}

export function resolveStatus(slot: ContentSlot, today: string): SlotStatus {
  if (slot.posted && slot.date <= today) return "publicado"
  if (slot.date < today) return "atrasado"
  if (slot.date === today) return "pendente"
  return "agendado"
}

export function dayHealth(slots: ContentSlot[], date: string, today: string): DayHealth | null {
  if (slots.length === 0) return null
  const statuses = slots.map((slot) => resolveStatus(slot, today))
  if (statuses.some((status) => status === "atrasado")) return "atraso"
  const incomplete = slots.some((slot) => !slot.programmed)
  const offBrief = slots.some((slot) => resolveStatus(slot, today) === "publicado" && slot.fit !== "ok")
  const waiting = statuses.some((status) => status === "pendente")
  if (incomplete || offBrief || waiting) return "atencao"
  return "ok"
}

export function scheduleAttention(slots: ContentSlot[], today: string): DayHealth | null {
  const overdue = slots.some((slot) => resolveStatus(slot, today) === "atrasado")
  if (overdue) return "atraso"
  return dayHealth(slots.filter((slot) => slot.date === today), today, today)
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function describeDay(slots: ContentSlot[], date: string, today: string): string {
  const health = dayHealth(slots, date, today)
  if (!health) return "Nenhum post programado neste dia."

  const statuses = slots.map((slot) => resolveStatus(slot, today))
  const late = statuses.filter((status) => status === "atrasado").length
  const waiting = statuses.filter((status) => status === "pendente").length
  const scheduled = statuses.filter((status) => status === "agendado").length
  const published = statuses.filter((status) => status === "publicado").length
  const incomplete = slots.filter((slot) => !slot.programmed).length
  const offBrief = slots.filter((slot) => resolveStatus(slot, today) === "publicado" && slot.fit !== "ok").length

  if (health === "atraso") {
    return `${countLabel(late, "post programado não foi publicado", "posts programados não foram publicados")}.`
  }
  if (date > today && incomplete > 0) {
    return "A programação está incompleta. Falta legenda ou menção obrigatória."
  }
  if (date > today) {
    return `${countLabel(scheduled, "post programado", "posts programados")}. A publicação ainda vai ao ar.`
  }
  if (waiting > 0 && published > 0) {
    return `${countLabel(published, "post já saiu", "posts já saíram")} e ${countLabel(waiting, "ainda aguarda publicação", "ainda aguardam publicação")}.`
  }
  if (waiting > 0) {
    return "Os posts estão programados, mas ainda não foram publicados."
  }
  if (offBrief > 0) {
    return "Os posts saíram, mas algum não está alinhado ao briefing."
  }
  if (date === today) return "Os posts de hoje saíram conforme o programado."
  return "Os posts deste dia foram programados corretamente e publicados."
}
