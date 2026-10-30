import type { EngagementEvent, EngagementEventType } from "@/lib/community-engagement"

// Deterministic pseudo-random from a string seed
function seededRandom(seed: string): () => number {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h) ^ seed.charCodeAt(i)
  h = h >>> 0
  return function () {
    h ^= h << 13; h ^= h >> 17; h ^= h << 5
    return (h >>> 0) / 4294967296
  }
}

function isoDay(daysAgo: number): string {
  const d = new Date("2026-10-30T12:00:00Z")
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function genCreatorEvents(
  creatorId: string,
  organizationId: string,
  activityLevel: "high" | "medium" | "low" | "silent",
  days = 90,
): EngagementEvent[] {
  const rng = seededRandom(creatorId + organizationId)
  const events: EngagementEvent[] = []

  const probPost    = activityLevel === "high" ? 0.55 : activityLevel === "medium" ? 0.30 : activityLevel === "low" ? 0.10 : 0
  const probComment = activityLevel === "high" ? 0.70 : activityLevel === "medium" ? 0.45 : activityLevel === "low" ? 0.15 : 0
  const probLike    = activityLevel === "high" ? 0.90 : activityLevel === "medium" ? 0.65 : activityLevel === "low" ? 0.30 : 0
  const probOpen    = activityLevel === "high" ? 0.80 : activityLevel === "medium" ? 0.55 : activityLevel === "low" ? 0.25 : 0
  const probWatch   = activityLevel === "high" ? 0.60 : activityLevel === "medium" ? 0.35 : activityLevel === "low" ? 0.15 : 0

  let seq = 0
  function id(type: string) { return `${creatorId}-${type}-${seq++}` }

  for (let d = 0; d < days; d++) {
    const day = isoDay(d)
    const at = `${day}T${String(Math.floor(rng() * 12 + 8)).padStart(2, "0")}:${String(Math.floor(rng() * 60)).padStart(2, "0")}:00Z`

    if (rng() < probPost) {
      const numPosts = Math.min(3, Math.ceil(rng() * 2))
      for (let p = 0; p < numPosts; p++) {
        events.push({ id: id("post"), creatorId, organizationId, type: "post", itemId: `post-${d}-${p}`, at })
      }
    }
    if (rng() < probComment) {
      const numComments = Math.min(5, Math.ceil(rng() * 3))
      for (let c = 0; c < numComments; c++) {
        events.push({ id: id("comment"), creatorId, organizationId, type: "comment", itemId: `post-${Math.floor(rng() * 20)}-0`, at })
      }
    }
    if (rng() < probLike) {
      const numLikes = Math.min(10, Math.ceil(rng() * 7))
      for (let l = 0; l < numLikes; l++) {
        events.push({ id: id("like"), creatorId, organizationId, type: "like", itemId: `post-${Math.floor(rng() * 30)}-${l}`, at })
      }
    }
    if (rng() < probOpen) {
      const numOpens = Math.ceil(rng() * 3)
      for (let o = 0; o < numOpens; o++) {
        events.push({ id: id("open"), creatorId, organizationId, type: "open", itemId: `page-${Math.floor(rng() * 8)}`, at })
      }
    }
    if (rng() < probWatch) {
      events.push({ id: id("watch"), creatorId, organizationId, type: "watch", itemId: `video-${Math.floor(rng() * 5)}`, at })
    }
  }

  return events
}

// org1 = Natura demo — all creators are members
export const ENGAGEMENT_EVENTS: EngagementEvent[] = [
  ...genCreatorEvents("c1", "org1", "high"),      // Bianca Torres — super ativa
  ...genCreatorEvents("c2", "org1", "high"),       // Pedro Alves — ativo
  ...genCreatorEvents("c3", "org1", "medium"),     // Carolina Souza — média
  ...genCreatorEvents("c4", "org1", "medium"),     // Lucas Oliveira — média
  ...genCreatorEvents("c5", "org1", "high"),       // Fernanda Costa — alta
  ...genCreatorEvents("c6", "org1", "low"),        // Rafael Nunes — baixa
  ...genCreatorEvents("c7", "org1", "low"),        // Mariana Pinto — baixa
  ...genCreatorEvents("c8", "org1", "medium"),     // Thiago Ribeiro — média
  ...genCreatorEvents("c9", "org1", "high"),       // Amanda Oliveira — alta
  ...genCreatorEvents("c10", "org1", "silent"),    // Isabela Lima — inativa
]
