import type { AnswerValue, ApplicationForm, FormAnswer, FormQuestion } from "@/lib/mock-data/forms"

const STOP = new Set([
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "a",
  "o",
  "as",
  "os",
  "para",
  "com",
  "em",
  "um",
  "uma",
  "que",
  "no",
  "na",
  "por",
  "ao",
  "à",
  "the",
  "and",
  "for",
  "with",
])

export interface MatchPart {
  questionId: string
  weight: number
  ratio: number
}

export interface BriefCheckResult {
  score: number
  summaryFit: number
  parts: MatchPart[]
  label: "alto" | "medio" | "baixo"
}

export function tokens(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 2 && !STOP.has(token))
}

function overlap(source: string[], target: string[]) {
  if (source.length === 0 || target.length === 0) return 0
  const set = new Set(target)
  const hits = source.filter((token) => set.has(token)).length
  return Math.min(1, hits / Math.max(4, Math.min(source.length, target.length)))
}

function read(answers: FormAnswer[], questionId: string): AnswerValue | undefined {
  return answers.find((answer) => answer.questionId === questionId)?.value
}

function asList(value: AnswerValue | undefined) {
  if (Array.isArray(value)) return value.filter((item) => item.trim())
  if (typeof value === "string" && value.trim()) return [value]
  return []
}

function questionRatio(question: FormQuestion, value: AnswerValue | undefined, brandTokens: string[]) {
  const selected = asList(value)
  const ideal = (question.match?.ideal ?? []).map((item) => item.trim()).filter(Boolean)
  if (question.type === "single_choice" || question.type === "yes_no") {
    if (ideal.length === 0) return 0
    return selected.some((item) => ideal.includes(item)) ? 1 : 0
  }
  if (question.type === "multiple_choice") {
    if (ideal.length === 0) return 0
    const hits = selected.filter((item) => ideal.includes(item)).length
    return hits / ideal.length
  }
  const answerTokens = tokens(selected.join(" "))
  const expected = tokens(ideal.join(" "))
  const against = expected.length > 0 ? expected : brandTokens
  return overlap(answerTokens, against)
}

export function scoreApplication(form: ApplicationForm, answers: FormAnswer[]): BriefCheckResult {
  const brandTokens = tokens(form.brandSummary ?? "")
  const parts: MatchPart[] = form.questions
    .filter((question) => (question.match?.weight ?? 0) > 0)
    .map((question) => ({
      questionId: question.id,
      weight: question.match?.weight ?? 0,
      ratio: questionRatio(question, read(answers, question.id), brandTokens),
    }))
  const weightTotal = parts.reduce((sum, part) => sum + part.weight, 0)
  const weighted = weightTotal === 0 ? 0 : parts.reduce((sum, part) => sum + part.ratio * part.weight, 0) / weightTotal
  const text = form.questions
    .filter((question) => question.type === "short_text" || question.type === "long_text")
    .map((question) => asList(read(answers, question.id)).join(" "))
    .join(" ")
  const summaryFit = brandTokens.length === 0 ? 0 : overlap(tokens(text), brandTokens)
  const hasStructured = weightTotal > 0
  const hasSummary = brandTokens.length > 0 && text.trim().length > 0
  let score = 0
  if (hasStructured && hasSummary) score = weighted * 0.7 + summaryFit * 0.3
  else if (hasStructured) score = weighted
  else if (hasSummary) score = summaryFit
  const rounded = Math.round(score * 100)
  return {
    score: rounded,
    summaryFit: Math.round(summaryFit * 100),
    parts,
    label: rounded >= 70 ? "alto" : rounded >= 40 ? "medio" : "baixo",
  }
}

export function formPublicPath(formId: string) {
  return `/lp/${formId}`
}
