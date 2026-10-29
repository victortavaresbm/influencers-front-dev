export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "yes_no"
  | "number"
  | "link"

export type FormStatus = "rascunho" | "publicado" | "arquivado"
export type FormScope = "brand" | "campaign"
export type FormTemplate = "blank" | "creator" | "affiliate"

export interface FormQuestion {
  id: string
  type: QuestionType
  title: string
  help?: string
  required: boolean
  options?: string[]
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
  createdAt: string
  updatedAt: string
}

export type AnswerValue = string | string[]

export interface FormAnswer {
  questionId: string
  value: AnswerValue
}

export interface FormResponse {
  id: string
  formId: string
  creatorId: string
  creatorName: string
  creatorHandle: string
  submittedAt: string
  answers: FormAnswer[]
}

export const QUESTION_TYPES: QuestionType[] = [
  "short_text",
  "long_text",
  "single_choice",
  "multiple_choice",
  "yes_no",
  "number",
  "link",
]

export function isChoiceType(type: QuestionType) {
  return type === "single_choice" || type === "multiple_choice"
}

export function createQuestion(type: QuestionType, partial?: Partial<FormQuestion>): FormQuestion {
  return {
    id: `q_${crypto.randomUUID()}`,
    type,
    title: "",
    required: true,
    options: isChoiceType(type) ? ["", ""] : undefined,
    ...partial,
    ...(isChoiceType(type) && !partial?.options ? { options: ["", ""] } : {}),
  }
}

const CREATOR_SEEDS: Omit<FormQuestion, "id">[] = [
  { type: "short_text", title: "Qual é o seu nome artístico?", required: true },
  { type: "link", title: "Link do perfil principal", help: "Instagram, TikTok ou YouTube.", required: true },
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
  { type: "link", title: "Link do perfil onde o cupom aparece", required: true },
]

export function questionsFromTemplate(template: FormTemplate): FormQuestion[] {
  const seeds = template === "creator" ? CREATOR_SEEDS : template === "affiliate" ? AFFILIATE_SEEDS : null
  if (!seeds) return [createQuestion("short_text")]
  return seeds.map((seed) => createQuestion(seed.type, seed))
}

export function canPublish(form: Pick<ApplicationForm, "title" | "scope" | "campaignId" | "questions">) {
  if (!form.title.trim()) return false
  if (form.scope === "campaign" && !form.campaignId) return false
  if (form.questions.length === 0) return false
  return form.questions.every((question) => {
    if (!question.title.trim()) return false
    if (!isChoiceType(question.type)) return true
    return (question.options ?? []).filter((option) => option.trim()).length >= 2
  })
}

export function answerFilled(question: FormQuestion, value: AnswerValue | undefined) {
  if (Array.isArray(value)) return value.some((item) => item.trim())
  return typeof value === "string" && value.trim().length > 0
}

export function answerText(
  question: FormQuestion | undefined,
  value: AnswerValue | undefined,
  labels: { yes: string; no: string; empty: string },
) {
  if (!answerFilled(question ?? { id: "", type: "short_text", title: "", required: false }, value)) return labels.empty
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
      { id: "q-nat-2", type: "link", title: "Link do perfil principal", help: "Instagram, TikTok ou YouTube.", required: true },
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
      { id: "q-tw-5", type: "link", title: "Link do perfil", required: true },
    ],
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
      },
      { id: "q-casa-3", type: "long_text", title: "Por que esta campanha combina com o seu conteúdo?", required: true },
      { id: "q-casa-4", type: "yes_no", title: "Você já mostrou o app Magalu?", required: false },
    ],
    createdAt: "2026-10-02",
    updatedAt: "2026-10-20",
  },
]

export const FORM_RESPONSES: FormResponse[] = [
  {
    id: "resp-nat-1",
    formId: "form-natura",
    creatorId: "c7",
    creatorName: "Mariana Pinto",
    creatorHandle: "@marianaviagemreal",
    submittedAt: "2026-10-18T15:10:00.000Z",
    answers: [
      { questionId: "q-nat-1", value: "Mariana Viagem Real" },
      { questionId: "q-nat-2", value: "https://instagram.com/marianaviagemreal" },
      { questionId: "q-nat-3", value: "Lifestyle" },
      { questionId: "q-nat-4", value: "Levo a rotina de cuidado para a estrada e falo de bem-estar sem pose." },
      { questionId: "q-nat-5", value: "yes" },
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
      { questionId: "q-nat-2", value: "https://instagram.com/amandamae" },
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
      { questionId: "q-tw-5", value: "https://tiktok.com/@rafaelgames" },
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
      { questionId: "q-tw-5", value: "https://youtube.com/@thiagoinvestidor" },
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
    ],
  },
]
