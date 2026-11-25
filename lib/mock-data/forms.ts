export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "yes_no"
  | "number"
  | "link"
  | "social_links"
  | "email"
  | "phone"
  | "date"
  | "video_response"

import { invalidSocialFields, socialLinksFilled, socialLinksText } from "@/lib/forms/social-links"
import { defaultTheme, landingOnlySite, type FormSite } from "@/lib/mock-data/form-site"

export type FormStatus = "rascunho" | "publicado" | "inativo" | "arquivado"
export type FormScope = "brand" | "campaign"
export type FormTemplate = "blank" | "creator" | "affiliate"

export type MatchWeight = 0 | 1 | 2 | 3

export interface QuestionMatch {
  weight: MatchWeight
  ideal?: string[]
}

export interface FormQuestion {
  id: string
  type: QuestionType
  title: string
  help?: string
  required: boolean
  options?: string[]
  match?: QuestionMatch
}

export interface ApplicationForm {
  id: string
  organizationId: string
  organizationName: string
  scope: FormScope
  campaignId?: string
  title: string
  description: string
  status: FormStatus
  questions: FormQuestion[]
  brandSummary?: string
  site?: FormSite
  createdAt: string
  updatedAt: string
}

export type AnswerValue = string | string[]

export interface FormAnswer {
  questionId: string
  value: AnswerValue
}

export type Device = "desktop" | "mobile" | "tablet"

export type StepEventKind = "enter" | "advance" | "back" | "click" | "submit"

export interface StepEvent {
  pageId: string
  kind: StepEventKind
  at: string
  blockId?: string
}

// Marketing attribution captured from the public link's URL (UTMs, fbclid) and
// inferred channel/device. Present on leads that came through a shared funnel.
export interface ResponseTracking {
  channel?: string
  destination?: string
  fbclid?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  device?: Device
}

export type LeadDecision = "pendente" | "aceito" | "rejeitado"

export interface FormResponse {
  id: string
  formId: string
  // Session that ties incremental (per-page) saves to the same lead. Anonymous
  // visitors get a client-generated id; logged-in creators reuse their id.
  sessionId: string
  creatorId?: string
  creatorName: string
  creatorHandle: string
  leadEmail?: string
  submittedAt: string
  updatedAt?: string
  // A lead is complete once it reaches a final page; partial leads show in the
  // Respostas table with an "incompleto" badge and feed drop-off analytics.
  complete: boolean
  stage: string
  answers: FormAnswer[]
  matchScore?: number
  // Brand decision on the application. Missing means still pending.
  decision?: LeadDecision
  tracking?: ResponseTracking
  stepEvents?: StepEvent[]
}

// Seeded per-funnel performance numbers (there is no real traffic): the funnel
// counts, device/source/UTM splits, a timeline and a 0–100 health score.
export interface FunnelStageCount {
  pageId?: string
  label: string
  count: number
}

export interface FunnelAnalytics {
  formId: string
  visitors: number
  responses: number
  leads: number
  completions: number
  score: number
  byDevice: { device: Device; count: number }[]
  bySource: { source: string; count: number }[]
  byUtm: { campaign: string; count: number }[]
  timeline: { date: string; visitors: number; responses: number; leads: number }[]
  funnel: FunnelStageCount[]
}

export const QUESTION_TYPES: QuestionType[] = [
  "short_text",
  "long_text",
  "single_choice",
  "multiple_choice",
  "yes_no",
  "number",
  "link",
  "social_links",
  "email",
  "phone",
  "date",
  "video_response",
]

export function isChoiceType(type: QuestionType) {
  return type === "single_choice" || type === "multiple_choice"
}

export function createQuestion(type: QuestionType, partial?: Partial<FormQuestion>): FormQuestion {
  const social = type === "social_links"
  return {
    id: `q_${crypto.randomUUID()}`,
    type,
    title: social ? "Links das redes sociais" : "",
    help: social ? "Instagram, TikTok ou YouTube. Pelo menos um." : undefined,
    required: true,
    options: isChoiceType(type) ? ["", ""] : undefined,
    ...partial,
    ...(isChoiceType(type) && !partial?.options ? { options: ["", ""] } : {}),
  }
}

const CREATOR_SEEDS: Omit<FormQuestion, "id">[] = [
  { type: "short_text", title: "Qual é o seu nome artístico?", required: true },
  { type: "social_links", title: "Links das redes sociais", help: "Instagram, TikTok ou YouTube. Pelo menos um.", required: true },
  {
    type: "single_choice",
    title: "Qual nicho combina mais com você?",
    required: true,
    options: ["Beleza", "Moda", "Lifestyle", "Fitness", "Outro"],
  },
  { type: "long_text", title: "Por que você combina com esta marca?", required: true },
  { type: "yes_no", title: "Você já trabalhou com esta marca?", required: true },
]

const AFFILIATE_SEEDS: Omit<FormQuestion, "id">[] = [
  { type: "short_text", title: "Qual é o seu canal principal de divulgação?", required: true },
  {
    type: "single_choice",
    title: "Onde você mais vende?",
    required: true,
    options: ["Instagram", "TikTok", "YouTube", "Blog", "WhatsApp"],
  },
  { type: "number", title: "Qual o tamanho aproximado da sua audiência?", required: true },
  { type: "long_text", title: "Como você divulga ofertas e cupons?", required: true },
  { type: "social_links", title: "Links das redes sociais", help: "Instagram, TikTok ou YouTube. Pelo menos um.", required: true },
]

export function questionsFromTemplate(template: FormTemplate): FormQuestion[] {
  const seeds = template === "creator" ? CREATOR_SEEDS : template === "affiliate" ? AFFILIATE_SEEDS : null
  if (!seeds) return [createQuestion("short_text")]
  return seeds.map((seed) => createQuestion(seed.type, seed))
}

export type FunnelIssue = "title" | "campaign" | "question" | "options" | "final" | "deadend"

// All reasons a funnel can't be published yet. A landing-only funnel has no
// questions to validate; every non-final page must have a CTA that advances.
export function funnelIssues(
  form: Pick<ApplicationForm, "title" | "scope" | "campaignId" | "questions" | "site">,
): FunnelIssue[] {
  const issues: FunnelIssue[] = []
  if (!form.title.trim()) issues.push("title")
  if (form.scope === "campaign" && !form.campaignId) issues.push("campaign")
  for (const question of form.questions) {
    if (!question.title.trim()) {
      issues.push("question")
      break
    }
    if (isChoiceType(question.type) && (question.options ?? []).filter((o) => o.trim()).length < 2) {
      issues.push("options")
      break
    }
  }
  const site = form.site
  if (site) {
    if (!site.pages.some((page) => page.final)) issues.push("final")
    const advances = (page: FormSite["pages"][number]) =>
      page.blocks.some((block) =>
        block.type === "button"
          ? block.action.kind === "page"
          : (block.type === "banner" || block.type === "announcement") &&
            block.ctaLabel.trim() !== "" &&
            block.action.kind === "page",
      )
    if (site.pages.some((page) => !page.final && !advances(page))) issues.push("deadend")
  }
  return issues
}

export function canPublish(
  form: Pick<ApplicationForm, "title" | "scope" | "campaignId" | "questions" | "site">,
) {
  return funnelIssues(form).length === 0
}

export function answerFilled(question: FormQuestion, value: AnswerValue | undefined) {
  if (question.type === "social_links") return socialLinksFilled(value)
  if (Array.isArray(value)) return value.some((item) => item.trim())
  return typeof value === "string" && value.trim().length > 0
}

export function answerAccepted(question: FormQuestion, value: AnswerValue | undefined) {
  if (question.type === "social_links" && invalidSocialFields(value).length > 0) return false
  if (question.required && !answerFilled(question, value)) return false
  return true
}

export function answerText(
  question: FormQuestion | undefined,
  value: AnswerValue | undefined,
  labels: { yes: string; no: string; empty: string },
) {
  if (!answerFilled(question ?? { id: "", type: "short_text", title: "", required: false }, value)) return labels.empty
  if (question?.type === "social_links") return socialLinksText(value) || labels.empty
  if (Array.isArray(value)) return value.filter((item) => item.trim()).join(", ")
  if (question?.type === "yes_no") {
    if (value === "yes") return labels.yes
    if (value === "no") return labels.no
  }
  return value ?? labels.empty
}

export const FORMS: ApplicationForm[] = [
  {
    id: "form-natura",
    organizationId: "org1",
    organizationName: "Natura",
    scope: "brand",
    title: "Candidatura Natura",
    description: "Conte como você se conecta com a marca para entrar na comunidade de creators e afiliados.",
    status: "publicado",
    questions: [
      { id: "q-nat-1", type: "short_text", title: "Qual é o seu nome artístico?", required: true },
      { id: "q-nat-2", type: "social_links", title: "Links das redes sociais", help: "Instagram, TikTok ou YouTube. Pelo menos um.", required: true },
      {
        id: "q-nat-3",
        type: "single_choice",
        title: "Qual nicho combina mais com você?",
        required: true,
        options: ["Beleza", "Moda", "Lifestyle", "Bem-estar", "Outro"],
      },
      { id: "q-nat-4", type: "long_text", title: "Por que você combina com a Natura?", required: true },
      { id: "q-nat-5", type: "yes_no", title: "Você já usou produtos Natura?", required: true },
    ],
    brandSummary:
      "A Natura procura creators de beleza, bem-estar e lifestyle. O conteúdo mostra cuidado real com a pele e o corpo, textura, cheiro e sensação, sem pose e sem promessa médica. A marca entra na rotina da pessoa.",
    createdAt: "2026-09-12",
    updatedAt: "2026-10-18",
  },
  {
    id: "form-tech-week",
    organizationId: "org2",
    organizationName: "Magazine Luiza",
    scope: "campaign",
    campaignId: "camp2",
    title: "Candidatura Tech Week",
    description: "Formulário para creators e afiliados que querem divulgar a Tech Week Magalu.",
    status: "publicado",
    questions: [
      { id: "q-tw-1", type: "short_text", title: "Qual é o seu canal principal?", required: true },
      {
        id: "q-tw-2",
        type: "single_choice",
        title: "Onde você mais divulga tecnologia?",
        required: true,
        options: ["YouTube", "Instagram", "TikTok"],
      },
      { id: "q-tw-3", type: "number", title: "Audiência aproximada nesse canal", required: true },
      { id: "q-tw-4", type: "long_text", title: "Como você apresentaria as ofertas da Tech Week?", required: true },
      { id: "q-tw-5", type: "social_links", title: "Links das redes sociais", help: "Instagram, TikTok ou YouTube. Pelo menos um.", required: true },
    ],
    brandSummary:
      "A Tech Week do Magalu procura creators de tecnologia, games e lifestyle para mostrar ofertas, preço e cupom, com um caminho claro até o app.",
    createdAt: "2026-10-10",
    updatedAt: "2026-10-22",
  },
  {
    id: "form-casa",
    organizationId: "org2",
    organizationName: "Magazine Luiza",
    scope: "campaign",
    campaignId: "camp7",
    title: "Candidatura Casa & Decor",
    description: "Para creators de decoração que querem mostrar o novo módulo do app Magalu.",
    status: "publicado",
    questions: [
      { id: "q-casa-1", type: "short_text", title: "Como você se apresenta?", required: true },
      {
        id: "q-casa-2",
        type: "single_choice",
        title: "Seu foco de conteúdo",
        required: true,
        options: ["Decoração", "Lifestyle", "Arquitetura", "DIY"],
        match: { weight: 3, ideal: ["Decoração", "Arquitetura"] },
      },
      { id: "q-casa-3", type: "long_text", title: "Por que esta campanha combina com o seu conteúdo?", required: true },
      { id: "q-casa-4", type: "yes_no", title: "Você já mostrou o app Magalu?", required: false, match: { weight: 1, ideal: ["yes"] } },
      { id: "q-casa-5", type: "social_links", title: "Links das redes sociais", help: "Instagram, TikTok ou YouTube. Pelo menos um.", required: true },
    ],
    brandSummary:
      "O Magalu é o maior varejo omnichannel do Brasil. O módulo Casa & Decor ajuda a planejar ambientes com realidade aumentada dentro do app: decoração, móveis, organização e reforma de apartamentos pequenos. Buscamos creators de decoração e arquitetura que mostrem a casa real, com dicas práticas e linguagem próxima.",
    site: {
      entryPageId: "pg-casa-home",
      fallbackPageId: "pg-casa-thanks",
      rules: [{ id: "rule-casa-1", condition: { kind: "score", min: 70 }, pageId: "pg-casa-match" }],
      theme: defaultTheme("#0086FF"),
      pages: [
        {
          id: "pg-casa-home",
          name: "Início",
          kind: "landing",
          blocks: [
            {
              id: "blk-casa-banner",
              type: "banner",
              title: "Mostre a sua casa com o novo Casa & Decor",
              subtitle: "Estamos escolhendo creators de decoração para lançar o planejador de ambientes em realidade aumentada do app Magalu.",
              image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=70",
              background: "#0b1f3a",
              tone: "light",
              align: "left",
              ctaLabel: "Quero me candidatar",
              action: { kind: "page", pageId: "pg-casa-form" },
            },
            {
              id: "blk-casa-stats",
              type: "stats",
              items: [
                { id: "it-casa-s1", title: "R$ 72 mil", text: "em cachês na campanha" },
                { id: "it-casa-s2", title: "15/10 a 15/11", text: "período de publicação" },
                { id: "it-casa-s3", title: "48h", text: "para a resposta da marca" },
              ],
            },
            {
              id: "blk-casa-features",
              type: "features",
              title: "O que você vai fazer",
              items: [
                { id: "it-casa-f1", title: "Planejar um ambiente", text: "Use o app para montar um cômodo da sua casa em realidade aumentada." },
                { id: "it-casa-f2", title: "Mostrar o antes e depois", text: "Um Reels ou TikTok com o processo e o resultado real." },
                { id: "it-casa-f3", title: "Indicar com cupom", text: "Ganhe comissão nas compras feitas com o seu link." },
              ],
            },
            {
              id: "blk-casa-faq",
              type: "faq",
              title: "Perguntas frequentes",
              items: [
                { id: "it-casa-q1", title: "Preciso ter muitos seguidores?", text: "Não. O Brief Check olha a afinidade do seu conteúdo com a campanha antes do tamanho da audiência." },
                { id: "it-casa-q2", title: "Recebo os móveis?", text: "As creators selecionadas recebem um voucher para montar o ambiente mostrado no vídeo." },
              ],
            },
          ],
        },
        {
          id: "pg-casa-form",
          name: "Formulário",
          kind: "form",
          blocks: [
            { id: "blk-casa-f1", type: "field", questionId: "q-casa-1" },
            { id: "blk-casa-f2", type: "field", questionId: "q-casa-2" },
            { id: "blk-casa-f3", type: "field", questionId: "q-casa-3" },
            { id: "blk-casa-f4", type: "field", questionId: "q-casa-4" },
            { id: "blk-casa-f5", type: "field", questionId: "q-casa-5" },
            {
              id: "blk-casa-fsubmit",
              type: "button",
              label: "Enviar candidatura",
              emoji: "🚀",
              style: "solid",
              align: "center",
              action: { kind: "page", pageId: "pg-casa-thanks" },
            },
          ],
        },
        {
          id: "pg-casa-match",
          name: "Match alto",
          kind: "thanks",
          final: true,
          blocks: [
            { id: "blk-casa-m1", type: "spacer", size: "lg" },
            { id: "blk-casa-m2", type: "heading", text: "Seu perfil tem a cara do Casa & Decor", size: "lg", align: "center" },
            { id: "blk-casa-m3", type: "text", text: "Suas respostas combinam muito com a campanha. Você entrou na fila prioritária e a equipe do Magalu fala com você em até 24 horas.", align: "center" },
            { id: "blk-casa-m4", type: "button", label: "Conhecer o app", style: "outline", align: "center", action: { kind: "url", url: "https://www.magazineluiza.com.br" } },
            { id: "blk-casa-m5", type: "spacer", size: "lg" },
          ],
        },
        {
          id: "pg-casa-thanks",
          name: "Obrigado",
          kind: "thanks",
          final: true,
          blocks: [
            { id: "blk-casa-t1", type: "spacer", size: "lg" },
            { id: "blk-casa-t2", type: "heading", text: "Candidatura enviada!", size: "lg", align: "center" },
            { id: "blk-casa-t3", type: "text", text: "Recebemos as suas respostas. A marca avalia o seu perfil e retorna pela plataforma.", align: "center" },
            { id: "blk-casa-t4", type: "spacer", size: "lg" },
          ],
        },
      ],
    },
    createdAt: "2026-10-02",
    updatedAt: "2026-10-20",
  },
  {
    id: "page-natura-club",
    organizationId: "org1",
    organizationName: "Natura",
    scope: "brand",
    title: "Clube de Creators Natura",
    description: "Página de apresentação do clube de creators para atrair novos talentos.",
    status: "publicado",
    questions: [],
    site: landingOnlySite("#F47920"),
    createdAt: "2026-10-05",
    updatedAt: "2026-10-16",
  },
  {
    id: "page-magalu-hub",
    organizationId: "org2",
    organizationName: "Magazine Luiza",
    scope: "brand",
    title: "Hub de Parcerias Magalu",
    description: "Landing institucional com os benefícios de ser parceiro Magalu.",
    status: "rascunho",
    questions: [],
    site: landingOnlySite("#0086FF"),
    createdAt: "2026-10-12",
    updatedAt: "2026-10-18",
  },
]

const RAW_RESPONSES: (Omit<FormResponse, "sessionId" | "complete" | "stage"> & Partial<FormResponse>)[] = [
  {
    id: "resp-nat-1",
    formId: "form-natura",
    creatorId: "c7",
    creatorName: "Mariana Pinto",
    creatorHandle: "@marianaviagemreal",
    submittedAt: "2026-10-18T15:10:00.000Z",
    answers: [
      { questionId: "q-nat-1", value: "Mariana Viagem Real" },
      { questionId: "q-nat-2", value: ["instagram|https://instagram.com/marianaviagemreal", "youtube|https://youtube.com/@marianaviagemreal"] },
      { questionId: "q-nat-3", value: "Lifestyle" },
      { questionId: "q-nat-4", value: "Levo a rotina de cuidado para a estrada e falo de bem-estar sem pose." },
      { questionId: "q-nat-5", value: "yes" },
    ],
  },
  {
    id: "resp-nat-3",
    formId: "form-natura",
    creatorId: "c15",
    creatorName: "Diego Almeida",
    creatorHandle: "@diegorun",
    submittedAt: "2026-10-24T14:20:00.000Z",
    answers: [
      { questionId: "q-nat-1", value: "Diego Run" },
      { questionId: "q-nat-2", value: ["instagram|https://instagram.com/diegorun"] },
      { questionId: "q-nat-3", value: "Lifestyle" },
      { questionId: "q-nat-4", value: "Corro trilhas e mostro a rotina de cuidado antes e depois das provas. Quero falar da Natura no pós-treino e nas viagens." },
      { questionId: "q-nat-5", value: "no" },
    ],
  },
  {
    id: "resp-nat-2",
    formId: "form-natura",
    creatorId: "c9",
    creatorName: "Amanda Oliveira",
    creatorHandle: "@amandamae",
    submittedAt: "2026-10-21T11:40:00.000Z",
    answers: [
      { questionId: "q-nat-1", value: "Amanda Mãe" },
      { questionId: "q-nat-2", value: ["instagram|https://instagram.com/amandamae", "tiktok|https://tiktok.com/@amandamae"] },
      { questionId: "q-nat-3", value: "Bem-estar" },
      { questionId: "q-nat-4", value: "Mostro o cuidado real de quem tem filho pequeno e escolhe o que entra em casa." },
      { questionId: "q-nat-5", value: "yes" },
    ],
  },
  {
    id: "resp-tw-1",
    formId: "form-tech-week",
    creatorId: "c6",
    creatorName: "Rafael Nunes",
    creatorHandle: "@rafaelgames",
    submittedAt: "2026-10-22T18:05:00.000Z",
    answers: [
      { questionId: "q-tw-1", value: "TikTok" },
      { questionId: "q-tw-2", value: "TikTok" },
      { questionId: "q-tw-3", value: "445000" },
      { questionId: "q-tw-4", value: "Um vídeo curto comparando o preço do setup e o cupom no final." },
      { questionId: "q-tw-5", value: ["tiktok|https://tiktok.com/@rafaelgames", "youtube|https://youtube.com/@rafaelgames"] },
    ],
  },
  {
    id: "resp-tw-2",
    formId: "form-tech-week",
    creatorId: "c8",
    creatorName: "Thiago Ribeiro",
    creatorHandle: "@thiagoinvestidor",
    submittedAt: "2026-10-23T09:30:00.000Z",
    answers: [
      { questionId: "q-tw-1", value: "YouTube" },
      { questionId: "q-tw-2", value: "YouTube" },
      { questionId: "q-tw-3", value: "312000" },
      { questionId: "q-tw-4", value: "Um review de notebook com o link e o cupom na descrição e no card." },
      { questionId: "q-tw-5", value: ["youtube|https://youtube.com/@thiagoinvestidor", "instagram|https://instagram.com/thiagoinvestidor"] },
    ],
  },
  {
    id: "resp-casa-1",
    formId: "form-casa",
    creatorId: "c14",
    creatorName: "Juliana Freitas",
    creatorHandle: "@judecordecasa",
    submittedAt: "2026-10-16T13:20:00.000Z",
    answers: [
      { questionId: "q-casa-1", value: "Ju Decor" },
      { questionId: "q-casa-2", value: "Decoração" },
      { questionId: "q-casa-3", value: "Meu conteúdo é planejar ambientes pequenos. O app entra como ferramenta, não como anúncio solto." },
      { questionId: "q-casa-4", value: "no" },
      { questionId: "q-casa-5", value: ["instagram|https://instagram.com/judecordecasa", "youtube|https://youtube.com/@judecordecasa"] },
    ],
  },
  {
    id: "resp-casa-2",
    formId: "form-casa",
    creatorId: "c11",
    creatorName: "Isabela Mendes",
    creatorHandle: "@isabelasustenta",
    submittedAt: "2026-10-19T10:05:00.000Z",
    answers: [
      { questionId: "q-casa-1", value: "Isa Sustenta" },
      { questionId: "q-casa-2", value: "DIY" },
      { questionId: "q-casa-3", value: "Faço reforma barata com móveis reaproveitados. Planejar o ambiente antes de comprar evita desperdício." },
      { questionId: "q-casa-4", value: "yes" },
      { questionId: "q-casa-5", value: ["instagram|https://instagram.com/isabelasustenta", "youtube|https://youtube.com/@isabelasustenta"] },
    ],
  },
  {
    id: "resp-casa-3",
    formId: "form-casa",
    creatorId: "c3",
    creatorName: "Carolina Souza",
    creatorHandle: "@carolsouza",
    submittedAt: "2026-10-21T17:45:00.000Z",
    answers: [
      { questionId: "q-casa-1", value: "Carol Fit" },
      { questionId: "q-casa-2", value: "Lifestyle" },
      { questionId: "q-casa-3", value: "Mostro minha rotina de treino e posso falar do app nos stories." },
      { questionId: "q-casa-4", value: "no" },
      { questionId: "q-casa-5", value: ["instagram|https://instagram.com/carolsouza", "youtube|https://youtube.com/@carolsouza"] },
    ],
  },
  {
    id: "resp-casa-4",
    formId: "form-casa",
    creatorName: "Helena Prado",
    creatorHandle: "@helenapradocasa",
    submittedAt: "2026-11-23T14:10:00.000Z",
    answers: [
      { questionId: "q-casa-1", value: "Helena Prado" },
      { questionId: "q-casa-2", value: "Arquitetura" },
      { questionId: "q-casa-3", value: "Mostro plantas de apartamentos pequenos e o Casa & Decor entra no antes e depois." },
      { questionId: "q-casa-4", value: "yes" },
      { questionId: "q-casa-5", value: ["instagram|https://instagram.com/helenapradocasa"] },
    ],
  },
  {
    id: "resp-casa-5",
    formId: "form-casa",
    creatorName: "Rita Alves",
    creatorHandle: "@rita.casa",
    leadEmail: "rita.alves@email.com",
    submittedAt: "2026-11-24T18:40:00.000Z",
    answers: [
      { questionId: "q-casa-1", value: "Rita Alves" },
      { questionId: "q-casa-2", value: "Decoração" },
      { questionId: "q-casa-3", value: "Decoro salas reais com o planejador do app Magalu e mostro o resultado." },
      { questionId: "q-casa-4", value: "yes" },
      { questionId: "q-casa-5", value: ["instagram|https://instagram.com/rita.casa", "tiktok|https://tiktok.com/@rita.casa"] },
    ],
  },
  {
    id: "resp-casa-6",
    formId: "form-casa",
    creatorName: "Lívia Costa",
    creatorHandle: "@liviacosta",
    submittedAt: "2026-11-25T12:05:00.000Z",
    complete: false,
    answers: [
      { questionId: "q-casa-1", value: "Lívia Costa" },
      { questionId: "q-casa-2", value: "Decoração" },
    ],
  },
  {
    id: "resp-casa-7",
    formId: "form-casa",
    creatorName: "",
    creatorHandle: "",
    leadEmail: "ana.silva@email.com",
    submittedAt: "2026-11-25T15:20:00.000Z",
    complete: false,
    answers: [],
  },
  {
    id: "resp-casa-8",
    formId: "form-casa",
    creatorName: "Bruno Dias",
    creatorHandle: "@brunodecora",
    submittedAt: "2026-11-12T11:00:00.000Z",
    answers: [
      { questionId: "q-casa-1", value: "Bruno Dias" },
      { questionId: "q-casa-2", value: "Decoração" },
      { questionId: "q-casa-3", value: "Faço tours por apartamentos alugados e indico móveis com o link." },
      { questionId: "q-casa-4", value: "no" },
      { questionId: "q-casa-5", value: ["tiktok|https://tiktok.com/@brunodecora"] },
    ],
  },
]

const CASA_HOME = "pg-casa-home"
const CASA_FORM = "pg-casa-form"
const CASA_MATCH = "pg-casa-match"
const CASA_THANKS = "pg-casa-thanks"

function casaTrail(path: string[], submittedAt: string): StepEvent[] {
  const start = new Date(submittedAt).getTime()
  const events: StepEvent[] = []
  path.forEach((pageId, index) => {
    events.push({ pageId, kind: "enter", at: new Date(start + index * 45000).toISOString() })
    if (index < path.length - 1) {
      events.push({ pageId, kind: "advance", at: new Date(start + index * 45000 + 20000).toISOString() })
    }
  })
  return events
}

// Sample of the Casa & Decor funnel: recent dates, attribution and the pages
// each lead actually reached. Performance traffic lives in FUNNEL_ANALYTICS.
const CASA_LEADS: Record<string, { stage: string; path: string[]; tracking: ResponseTracking; complete?: boolean; submittedAt?: string }> = {
  "resp-casa-1": {
    stage: CASA_THANKS,
    path: [CASA_HOME, CASA_FORM, CASA_THANKS],
    submittedAt: "2026-11-18T13:20:00.000Z",
    tracking: { channel: "instagram", destination: "/lp/form-casa", utmSource: "instagram", utmMedium: "paid", utmCampaign: "casa-nov", device: "mobile" },
  },
  "resp-casa-2": {
    stage: CASA_THANKS,
    path: [CASA_HOME, CASA_FORM, CASA_THANKS],
    submittedAt: "2026-11-20T10:05:00.000Z",
    tracking: { channel: "tiktok", destination: "/lp/form-casa", utmSource: "tiktok", utmMedium: "paid", utmCampaign: "stories", device: "mobile", fbclid: "IwAR0casa2" },
  },
  "resp-casa-3": {
    stage: CASA_THANKS,
    path: [CASA_HOME, CASA_FORM, CASA_THANKS],
    submittedAt: "2026-11-22T17:45:00.000Z",
    tracking: { channel: "youtube", destination: "/lp/form-casa", utmSource: "youtube", utmMedium: "organic", utmCampaign: "bio", device: "desktop" },
  },
  "resp-casa-4": {
    stage: CASA_MATCH,
    path: [CASA_HOME, CASA_FORM, CASA_MATCH],
    tracking: { channel: "instagram", destination: "/lp/form-casa", utmSource: "instagram", utmMedium: "paid", utmCampaign: "casa-nov", device: "desktop", fbclid: "IwAR0casa4" },
  },
  "resp-casa-5": {
    stage: CASA_MATCH,
    path: [CASA_HOME, CASA_FORM, CASA_MATCH],
    tracking: { channel: "instagram", destination: "/lp/form-casa", utmSource: "instagram", utmMedium: "cpc", utmCampaign: "casa-nov", device: "mobile" },
  },
  "resp-casa-6": {
    stage: CASA_FORM,
    path: [CASA_HOME, CASA_FORM],
    complete: false,
    tracking: { channel: "direct", destination: "/lp/form-casa", device: "mobile" },
  },
  "resp-casa-7": {
    stage: CASA_HOME,
    path: [CASA_HOME],
    complete: false,
    tracking: { channel: "direct", destination: "/lp/form-casa", device: "desktop" },
  },
  "resp-casa-8": {
    stage: CASA_THANKS,
    path: [CASA_HOME, CASA_FORM, CASA_THANKS],
    tracking: { channel: "tiktok", destination: "/lp/form-casa", utmSource: "tiktok", utmMedium: "paid", utmCampaign: "stories", device: "tablet" },
  },
}

// Seed responses predate the incremental-lead model, so they are complete leads
// unless a Casa sample says otherwise. Session ids stay stable.
export const FORM_RESPONSES: FormResponse[] = RAW_RESPONSES.map((response) => {
  const base: FormResponse = {
    complete: true,
    stage: response.answers[response.answers.length - 1]?.questionId ?? "",
    sessionId: `sess_${response.id}`,
    ...response,
  }
  const decor = CASA_LEADS[response.id]
  if (!decor) return base
  const submittedAt = decor.submittedAt ?? base.submittedAt
  return {
    ...base,
    submittedAt,
    complete: decor.complete ?? true,
    stage: decor.stage,
    tracking: decor.tracking,
    stepEvents: casaTrail(decor.path, submittedAt),
    matchScore: decor.stage === CASA_MATCH ? 86 : decor.complete === false ? undefined : 54,
  }
})
