export type EngagementEventType = "post" | "comment" | "like" | "open" | "watch"

export interface EngagementEvent {
  id: string
  creatorId: string
  organizationId: string
  type: EngagementEventType
  itemId: string
  at: string
}

export interface EngagementScore {
  creatorId: string
  total: number
  posts: number
  comments: number
  likes: number
  opens: number
  watches: number
}

export const POINTS: Record<EngagementEventType, number> = {
  post:    20,
  watch:   15,
  comment:  8,
  open:     5,
  like:     1,
}

const DAILY_CAP: Record<EngagementEventType, number> = {
  post:    3,
  comment: 5,
  like:    10,
  open:    Infinity,
  watch:   Infinity,
}

export type Period = 7 | 30 | 90

export function periodStart(period: Period): string {
  const d = new Date()
  d.setDate(d.getDate() - period)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function scoreEvents(events: EngagementEvent[], period: Period): Map<string, EngagementScore> {
  const since = periodStart(period)
  const relevant = events.filter((e) => e.at >= since)

  const map = new Map<string, EngagementScore>()

  function ensure(id: string): EngagementScore {
    if (!map.has(id)) map.set(id, { creatorId: id, total: 0, posts: 0, comments: 0, likes: 0, opens: 0, watches: 0 })
    return map.get(id)!
  }

  // group by creator → day → type → items (for caps and dedup)
  type DayKey = string
  const caps = new Map<string, Map<DayKey, Map<EngagementEventType, Set<string>>>>()

  for (const ev of relevant) {
    const score = ensure(ev.creatorId)
    const day = ev.at.slice(0, 10)

    if (!caps.has(ev.creatorId)) caps.set(ev.creatorId, new Map())
    const byDay = caps.get(ev.creatorId)!
    if (!byDay.has(day)) byDay.set(day, new Map())
    const byType = byDay.get(day)!
    if (!byType.has(ev.type)) byType.set(ev.type, new Set())
    const items = byType.get(ev.type)!

    // dedup same item same type same day
    if (items.has(ev.itemId)) continue
    items.add(ev.itemId)

    // daily cap
    if (items.size > DAILY_CAP[ev.type]) continue

    score.total += POINTS[ev.type]
    if (ev.type === "post")    score.posts++
    if (ev.type === "comment") score.comments++
    if (ev.type === "like")    score.likes++
    if (ev.type === "open")    score.opens++
    if (ev.type === "watch")   score.watches++
  }

  return map
}
