import { FUNNEL_ANALYTICS } from "@/lib/mock-data/funnel-analytics"
import { answerFilled, answerText, type ApplicationForm, type FormQuestion, type FormResponse, type FunnelAnalytics, type LeadDecision, type StepEvent } from "@/lib/mock-data/forms"
import type { SitePage } from "@/lib/mock-data/form-site"
import { CREATORS, type Creator } from "@/lib/mock-data/creators"

export type LeadRange = "all" | "24h" | "7d" | "30d"

export type LeadColumn =
  | { id: "channel" | "destination" | "campaign"; kind: "tracking" }
  | { id: string; kind: "page"; page: SitePage }

const RANGE_MS: Record<Exclude<LeadRange, "all">, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
}

export function leadDecision(response: FormResponse): LeadDecision {
  return response.decision ?? "pendente"
}

function handleKey(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase()
}

export function leadCreator(response: FormResponse): Creator | undefined {
  if (response.creatorId) {
    const byId = CREATORS.find((creator) => creator.id === response.creatorId)
    if (byId) return byId
  }
  const handle = handleKey(response.creatorHandle)
  if (!handle) return undefined
  return CREATORS.find(
    (creator) =>
      handleKey(creator.handle) === handle ||
      creator.networks.some((network) => handleKey(network.handle) === handle),
  )
}

export function leadPages(form: ApplicationForm): SitePage[] {
  return form.site?.pages ?? []
}

export function questionsOn(form: ApplicationForm, page: SitePage): FormQuestion[] {
  return page.blocks.flatMap((block) => {
    if (block.type !== "field") return []
    const question = form.questions.find((item) => item.id === block.questionId)
    return question ? [question] : []
  })
}

export function reachedPage(form: ApplicationForm, response: FormResponse, page: SitePage) {
  const events = response.stepEvents ?? []
  if (events.some((event) => event.pageId === page.id && event.kind !== "back")) return true
  if (response.stage === page.id) return true
  return questionsOn(form, page).some((question) => {
    const value = response.answers.find((answer) => answer.questionId === question.id)?.value
    return answerFilled(question, value)
  })
}

export function stageAnswer(
  form: ApplicationForm,
  response: FormResponse,
  page: SitePage,
  labels: { yes: string; no: string; empty: string },
) {
  const parts = questionsOn(form, page)
    .map((question) => {
      const value = response.answers.find((answer) => answer.questionId === question.id)?.value
      const text = answerText(question, value, labels)
      return text === labels.empty ? "" : text
    })
    .filter(Boolean)
  return parts.join(" · ")
}

export function filterLeads(
  form: ApplicationForm,
  responses: FormResponse[],
  filters: { query: string; stage: string; range: LeadRange; now?: number },
) {
  const now = filters.now ?? Date.now()
  const query = filters.query.trim().toLowerCase()
  const labels = { yes: "yes", no: "no", empty: "" }
  return responses.filter((response) => {
    if (filters.stage !== "all" && response.stage !== filters.stage) return false
    if (filters.range !== "all") {
      const at = new Date(response.submittedAt).getTime()
      if (!Number.isFinite(at) || now - at > RANGE_MS[filters.range]) return false
    }
    if (!query) return true
    const haystack = [
      response.id,
      response.creatorName,
      response.creatorHandle,
      response.leadEmail,
      response.tracking?.channel,
      response.tracking?.utmCampaign,
      response.tracking?.fbclid,
      ...leadPages(form).map((page) => stageAnswer(form, response, page, labels)),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(query)
  })
}

export function trackingColumns(): LeadColumn[] {
  return [
    { id: "channel", kind: "tracking" },
    { id: "destination", kind: "tracking" },
    { id: "campaign", kind: "tracking" },
  ]
}

export function pageColumns(form: ApplicationForm): LeadColumn[] {
  return leadPages(form).map((page) => ({ id: `page:${page.id}`, kind: "page", page }))
}

export function columnPercent(form: ApplicationForm, responses: FormResponse[], page: SitePage) {
  if (responses.length === 0) return 0
  const hits = responses.filter((response) => reachedPage(form, response, page)).length
  return Math.round((hits / responses.length) * 100)
}

function eventsOn(response: FormResponse, pageId: string, kind: StepEvent["kind"]) {
  return (response.stepEvents ?? []).filter((event) => event.pageId === pageId && event.kind === kind)
}

export function formatDuration(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "—"
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`
}

export function pageResults(form: ApplicationForm, page: SitePage, responses: FormResponse[]) {
  const entries = responses.filter((response) => reachedPage(form, response, page)).length
  const advances = responses.filter((response) => eventsOn(response, page.id, "advance").length > 0).length
  const interacted = responses.filter((response) => stageAnswer(form, response, page, { yes: "yes", no: "no", empty: "" })).length
  const durations: number[] = []
  for (const response of responses) {
    const enter = eventsOn(response, page.id, "enter")[0]
    const advance = eventsOn(response, page.id, "advance")[0]
    if (!enter || !advance) continue
    const delta = new Date(advance.at).getTime() - new Date(enter.at).getTime()
    if (delta > 0) durations.push(delta)
  }
  const avgMs = durations.length ? durations.reduce((sum, item) => sum + item, 0) / durations.length : 0
  const distributions = questionsOn(form, page)
    .filter((question) => question.type === "single_choice" || question.type === "multiple_choice" || question.type === "yes_no")
    .map((question) => {
      const options = question.type === "yes_no" ? ["yes", "no"] : (question.options ?? []).filter((option) => option.trim())
      const counts = options.map((option) => ({
        option,
        count: responses.filter((response) => {
          const value = response.answers.find((answer) => answer.questionId === question.id)?.value
          return Array.isArray(value) ? value.includes(option) : value === option
        }).length,
      }))
      const total = counts.reduce((sum, item) => sum + item.count, 0)
      return { question, total, counts }
    })
  return {
    entries,
    advances,
    interaction: entries === 0 ? 0 : Math.round((interacted / entries) * 100),
    avgMs,
    distributions,
  }
}

function tally<T extends string>(rows: { key: T; count: number }[], key: T, count = 1) {
  const found = rows.find((row) => row.key === key)
  if (found) found.count += count
  else rows.push({ key, count })
  return rows
}

function isLiveLead(response: FormResponse) {
  return response.id.startsWith("resp_")
}

export function presentAnalytics(form: ApplicationForm, responses: FormResponse[]): FunnelAnalytics {
  const seed = FUNNEL_ANALYTICS.find((item) => item.formId === form.id)
  const live = responses.filter(isLiveLead)
  if (!seed) return analyticsFrom(form, responses)
  if (live.length === 0) return seed
  const extra = analyticsFrom(form, live)
  return {
    ...seed,
    visitors: seed.visitors + extra.visitors,
    responses: seed.responses + extra.responses,
    leads: seed.leads + extra.leads,
    completions: seed.completions + extra.completions,
    score: extra.completions > 0 ? Math.round((seed.score + extra.score) / 2) : seed.score,
    byDevice: seed.byDevice.map((row) => ({
      ...row,
      count: row.count + (extra.byDevice.find((item) => item.device === row.device)?.count ?? 0),
    })),
    bySource: mergeNamed(seed.bySource, extra.bySource, "source"),
    byUtm: mergeNamed(seed.byUtm, extra.byUtm, "campaign"),
    timeline: mergeTimeline(seed.timeline, extra.timeline),
    funnel: seed.funnel.map((step) => {
      const hit = extra.funnel.find((item) => item.label === step.label || (step.pageId && item.pageId === step.pageId))
      return hit ? { ...step, count: step.count + hit.count } : step
    }),
  }
}

function mergeNamed<T extends { count: number }>(base: T[], extra: T[], key: keyof T): T[] {
  const rows = base.map((row) => ({ ...row }))
  for (const item of extra) {
    const found = rows.find((row) => row[key] === item[key])
    if (found) found.count += item.count
    else rows.push({ ...item })
  }
  return rows
}

function mergeTimeline(base: FunnelAnalytics["timeline"], extra: FunnelAnalytics["timeline"]) {
  const rows = base.map((row) => ({ ...row }))
  for (const item of extra) {
    const found = rows.find((row) => row.date === item.date)
    if (found) {
      found.visitors += item.visitors
      found.responses += item.responses
      found.leads += item.leads
    } else rows.push({ ...item })
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date))
}

function analyticsFrom(form: ApplicationForm, responses: FormResponse[]): FunnelAnalytics {
  const withAnswers = responses.filter((response) => response.answers.length > 0)
  const leads = responses.filter((response) => response.creatorId || response.leadEmail || response.answers.length > 0)
  const completions = responses.filter((response) => response.complete)
  const scores = completions.map((response) => response.matchScore).filter((score): score is number => typeof score === "number")
  const devices: { key: "desktop" | "mobile" | "tablet"; count: number }[] = []
  const sources: { key: string; count: number }[] = []
  const campaigns: { key: string; count: number }[] = []
  const days = new Map<string, { visitors: number; responses: number; leads: number }>()
  for (const response of responses) {
    const device = response.tracking?.device
    if (device) tally(devices, device)
    tally(sources, response.tracking?.channel || response.tracking?.utmSource || "direct")
    if (response.tracking?.utmCampaign) tally(campaigns, response.tracking.utmCampaign)
    const date = response.submittedAt.slice(0, 10)
    const day = days.get(date) ?? { visitors: 0, responses: 0, leads: 0 }
    day.visitors += 1
    if (response.answers.length > 0) day.responses += 1
    if (response.creatorId || response.leadEmail || response.answers.length > 0) day.leads += 1
    days.set(date, day)
  }
  const pages = leadPages(form)
  return {
    formId: form.id,
    visitors: responses.length,
    responses: withAnswers.length,
    leads: leads.length,
    completions: completions.length,
    score: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
    byDevice: (["mobile", "desktop", "tablet"] as const).map((device) => ({
      device,
      count: devices.find((row) => row.key === device)?.count ?? 0,
    })),
    bySource: sources.map((row) => ({ source: row.key, count: row.count })),
    byUtm: campaigns.map((row) => ({ campaign: row.key, count: row.count })),
    timeline: [...days.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, row]) => ({ date, ...row })),
    funnel: [
      { label: "Visitantes", count: responses.length },
      ...pages.map((page) => ({
        pageId: page.id,
        label: page.name,
        count: responses.filter((response) => reachedPage(form, response, page)).length,
      })),
    ],
  }
}
