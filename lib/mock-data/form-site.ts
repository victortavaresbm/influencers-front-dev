import type { QuestionType } from "@/lib/mock-data/forms"

export type BlockType =
  | "banner"
  | "announcement"
  | "heading"
  | "text"
  | "image"
  | "gallery"
  | "video"
  | "audio"
  | "button"
  | "field"
  | "features"
  | "bento"
  | "steps"
  | "stats"
  | "marquee"
  | "faq"
  | "testimonial"
  | "html"
  | "divider"
  | "spacer"

export type Align = "left" | "center"

// Navigation is explicit: a CTA either advances to a page, opens an external
// URL, or does nothing (only valid on a final page). There is no implicit
// "next page" fallback — see SitePage.final and canPublish validation.
export type SiteAction =
  | { kind: "none" }
  | { kind: "page"; pageId: string }
  | { kind: "url"; url: string }

export interface ListItem {
  id: string
  title: string
  text: string
}

export interface GalleryImage {
  id: string
  src: string
  caption: string
}

export interface ListAppearance {
  background: string
  color: string
  border: string
}

export function defaultListAppearance(pageBackground: string): ListAppearance {
  if (pageBackground !== "#ffffff") {
    return { background: "#18181b", color: "#fafafa", border: "#27272a" }
  }
  return { background: "#ffffff", color: "#18181b", border: "#e4e4e7" }
}

export type SiteBlock =
  | {
      id: string
      type: "banner"
      title: string
      subtitle: string
      image: string
      background: string
      tone: "light" | "dark"
      align: Align
      ctaLabel: string
      action: SiteAction
    }
  | {
      id: string
      type: "announcement"
      text: string
      ctaLabel: string
      action: SiteAction
      background: string
      tone: "light" | "dark"
    }
  | { id: string; type: "heading"; text: string; size: "md" | "lg"; align: Align }
  | { id: string; type: "text"; text: string; align: Align }
  | { id: string; type: "image"; src: string; alt: string; caption: string }
  | { id: string; type: "gallery"; items: GalleryImage[] }
  | { id: string; type: "video"; url: string }
  | { id: string; type: "audio"; url: string; title: string }
  | { id: string; type: "button"; label: string; emoji?: string; style: "solid" | "outline"; align: Align; action: SiteAction }
  // A field block is a lightweight pointer to a FormQuestion (source of truth
  // = form.questions). The canvas renders the question by id; order of field
  // blocks across pages defines the order the questions are asked.
  | { id: string; type: "field"; questionId: string }
  | { id: string; type: "features"; title: string; items: ListItem[]; appearance?: ListAppearance }
  | { id: string; type: "bento"; title: string; items: ListItem[]; appearance?: ListAppearance }
  | { id: string; type: "steps"; title: string; items: ListItem[] }
  | { id: string; type: "stats"; items: ListItem[] }
  | { id: string; type: "marquee"; items: ListItem[] }
  | { id: string; type: "faq"; title: string; items: ListItem[] }
  | { id: string; type: "testimonial"; quote: string; author: string; role: string }
  | { id: string; type: "html"; code: string; height: number }
  | { id: string; type: "divider" }
  | { id: string; type: "spacer"; size: "sm" | "md" | "lg" }

export type PageKind = "landing" | "form" | "thanks" | "custom"

export interface SitePage {
  id: string
  name: string
  kind: PageKind
  // A final page is terminal (a "thank you"/result page): it needs no onward
  // navigation and marks a lead as complete when reached. Non-final pages must
  // have at least one CTA that advances to a page (enforced by canPublish).
  final?: boolean
  blocks: SiteBlock[]
}

export type FlowCondition =
  | { kind: "always" }
  | { kind: "score"; min: number }
  | { kind: "answer"; questionId: string; value: string }

export interface FlowRule {
  id: string
  condition: FlowCondition
  pageId: string
}

export type ContentWidth = "narrow" | "regular" | "wide"
export type ContentSpacing = "tight" | "regular" | "relaxed"
export type BackgroundMode = "color" | "image" | "gradient" | "video"
export type BackgroundEffect = "none" | "dark" | "gradient" | "grain" | "blur"

export interface Typography {
  font: string
  color: string
  size: number
  weight: number
  lineHeight: number
}

export interface SiteTheme {
  // Geral
  primary: string
  background: string
  align: Align
  width: ContentWidth
  spacing: ContentSpacing
  radius: number
  // Header
  showProgress: boolean
  logo: string
  // Fundo
  backgroundMode: BackgroundMode
  backgroundImage: string
  backgroundGradient: string
  backgroundVideo: string
  backgroundEffect: BackgroundEffect
  // Tipografia
  heading: Typography
  body: Typography
}

export function defaultTheme(primary: string): SiteTheme {
  return {
    primary,
    background: "#ffffff",
    align: "center",
    width: "regular",
    spacing: "regular",
    radius: 16,
    showProgress: true,
    logo: "",
    backgroundMode: "color",
    backgroundImage: "",
    backgroundGradient: "linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)",
    backgroundVideo: "",
    backgroundEffect: "none",
    heading: { font: "Inter", color: "#18181b", size: 32, weight: 700, lineHeight: 1.15 },
    body: { font: "Inter", color: "#3f3f46", size: 16, weight: 400, lineHeight: 1.6 },
  }
}

export interface FormSite {
  entryPageId: string
  fallbackPageId: string
  rules: FlowRule[]
  theme: SiteTheme
  pages: SitePage[]
}

// Palette groups shown in the Construtor. Form/Quiz groups create field blocks
// (which also create the backing FormQuestion); media/content are plain blocks.
export const FIELD_PALETTE: { type: QuestionType; icon?: string }[] = [
  { type: "social_links" },
  { type: "short_text" },
  { type: "email" },
  { type: "phone" },
  { type: "number" },
  { type: "date" },
  { type: "long_text" },
]
export const QUIZ_PALETTE: QuestionType[] = ["single_choice", "multiple_choice", "yes_no", "video_response"]

export const BLOCK_GROUPS: { id: "media" | "content" | "structure"; types: BlockType[] }[] = [
  { id: "media", types: ["text", "image", "video", "audio"] },
  { id: "content", types: ["heading", "banner", "features", "bento", "steps", "stats", "marquee", "faq", "testimonial", "gallery"] },
  { id: "structure", types: ["announcement", "button", "html", "divider", "spacer"] },
]

export function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

export function item(title: string, text: string): ListItem {
  return { id: uid("it"), title, text }
}

// Field blocks are created via fieldBlock(questionId) (they need a backing
// question), so createBlock covers every other block type.
export function createBlock(type: Exclude<BlockType, "field">): SiteBlock {
  const id = uid("blk")
  switch (type) {
    case "banner":
      return {
        id,
        type,
        title: "Faça parte do nosso time de creators",
        subtitle: "Conte quem você é e mostre como o seu conteúdo conversa com a marca.",
        image: "",
        background: "#18181b",
        tone: "light",
        align: "center",
        ctaLabel: "Quero me candidatar",
        action: { kind: "none" },
      }
    case "heading":
      return { id, type, text: "Por que participar", size: "lg", align: "left" }
    case "text":
      return {
        id,
        type,
        text: "Escreva aqui o que a marca procura e o que a creator ganha ao entrar.",
        align: "left",
      }
    case "image":
      return { id, type, src: "", alt: "", caption: "" }
    case "video":
      return { id, type, url: "" }
    case "audio":
      return { id, type, url: "", title: "Áudio" }
    case "button":
      return { id, type, label: "Quero participar", style: "solid", align: "center", action: { kind: "none" } }
    case "features":
      return {
        id,
        type,
        title: "O que você ganha",
        items: [
          item("Comissão por venda", "Ganhe a cada pedido feito com o seu cupom."),
          item("Produtos para testar", "Receba lançamentos antes de todo mundo."),
          item("Campanhas pagas", "Entre na lista de convites para campanhas."),
        ],
      }
    case "stats":
      return {
        id,
        type,
        items: [item("15%", "de comissão"), item("+300", "creators na comunidade"), item("48h", "para a resposta")],
      }
    case "faq":
      return {
        id,
        type,
        title: "Perguntas frequentes",
        items: [
          item("Preciso ter muitos seguidores?", "Não. Olhamos a afinidade do conteúdo com a marca antes do tamanho da audiência."),
          item("Quando recebo a resposta?", "A marca avalia as candidaturas em até dois dias úteis."),
        ],
      }
    case "testimonial":
      return {
        id,
        type,
        quote: "Entrei pela candidatura e em um mês já estava na primeira campanha paga.",
        author: "Creator da comunidade",
        role: "Lifestyle · 80 mil seguidores",
      }
    case "html":
      return {
        id,
        type,
        code: '<div style="padding:24px;text-align:center;font-family:sans-serif">\n  <strong>Seu HTML aqui</strong>\n</div>',
        height: 160,
      }
    case "announcement":
      return {
        id,
        type,
        text: "Inscrições abertas por tempo limitado",
        ctaLabel: "Participar",
        action: { kind: "none" },
        background: "#18181b",
        tone: "light",
      }
    case "gallery":
      return {
        id,
        type,
        items: [galleryImage(), galleryImage(), galleryImage()],
      }
    case "bento":
      return {
        id,
        type,
        title: "Tudo o que você precisa",
        items: [
          item("Comissão por venda", "Ganhe a cada pedido feito com o seu cupom exclusivo."),
          item("Produtos para testar", "Receba os lançamentos antes de todo mundo."),
          item("Campanhas pagas", "Entre na lista de convites para campanhas."),
          item("Comunidade", "Troque ideias com outros creators e com a marca."),
        ],
      }
    case "steps":
      return {
        id,
        type,
        title: "Como funciona",
        items: [
          item("Candidatura", "Conte quem você é e mostre o seu melhor conteúdo."),
          item("Avaliação", "A marca olha a afinidade do seu perfil com a proposta."),
          item("Parceria", "Você entra na comunidade e recebe os próximos convites."),
        ],
      }
    case "marquee":
      return {
        id,
        type,
        items: [
          item("Creators", ""),
          item("Comunidade", ""),
          item("Campanhas pagas", ""),
          item("Afiliados", ""),
          item("Produtos", ""),
        ],
      }
    case "divider":
      return { id, type }
    case "spacer":
      return { id, type, size: "md" }
  }
}

function galleryImage(): GalleryImage {
  return { id: uid("it"), src: "", caption: "" }
}

// A field block points to a FormQuestion by id (see SiteBlock "field").
export function fieldBlock(questionId: string): SiteBlock {
  return { id: uid("blk"), type: "field", questionId }
}

export function cloneBlock(block: SiteBlock): SiteBlock {
  const copy = structuredClone(block)
  copy.id = uid("blk")
  if ("items" in copy) {
    copy.items = (copy.items as Array<{ id: string }>).map((entry) => ({ ...entry, id: uid("it") })) as typeof copy.items
  }
  return copy
}

export function createPage(kind: PageKind, name: string): SitePage {
  const id = uid("pg")
  if (kind === "thanks") {
    return {
      id,
      name,
      kind,
      final: true,
      blocks: [
        { id: uid("blk"), type: "spacer", size: "lg" },
        { id: uid("blk"), type: "heading", text: "Candidatura enviada!", size: "lg", align: "center" },
        {
          id: uid("blk"),
          type: "text",
          text: "Recebemos as suas respostas. A marca avalia o seu perfil e retorna pela plataforma.",
          align: "center",
        },
        { id: uid("blk"), type: "spacer", size: "lg" },
      ],
    }
  }
  if (kind === "form") {
    // Fields are added by dropping questions from the palette.
    return { id, name, kind, blocks: [] }
  }
  if (kind === "landing") {
    return { id, name, kind, blocks: [createBlock("banner"), createBlock("features")] }
  }
  return { id, name, kind, blocks: [createBlock("heading"), createBlock("text")] }
}

// A ready-to-use funnel: landing → form (with the given questions as field
// blocks) → final thank-you page, with explicit navigation wired between them.
export function defaultSite(primary: string, questionIds: string[] = []): FormSite {
  const landing = createPage("landing", "Início")
  const formPage = createPage("form", "Formulário")
  const thanks = createPage("thanks", "Obrigado")
  // Landing CTA advances to the form page.
  landing.blocks = landing.blocks.map((block) =>
    block.type === "banner" ? { ...block, action: { kind: "page", pageId: formPage.id } } : block,
  )
  // Form page: the questions, then a submit button to the final page.
  formPage.blocks = [
    ...questionIds.map((qid) => fieldBlock(qid)),
    { id: uid("blk"), type: "button", label: "Enviar candidatura", emoji: "🚀", style: "solid", align: "center", action: { kind: "page", pageId: thanks.id } },
  ]
  return {
    entryPageId: landing.id,
    fallbackPageId: thanks.id,
    rules: [],
    theme: defaultTheme(primary),
    pages: [landing, formPage, thanks],
  }
}

// A landing-only funnel (no application form): landing → final page.
export function landingOnlySite(primary: string): FormSite {
  const landing = createPage("landing", "Início")
  const thanks = createPage("thanks", "Obrigado")
  landing.blocks = landing.blocks.map((block) =>
    block.type === "banner" ? { ...block, action: { kind: "page", pageId: thanks.id } } : block,
  )
  return {
    entryPageId: landing.id,
    fallbackPageId: thanks.id,
    rules: [],
    theme: defaultTheme(primary),
    pages: [landing, thanks],
  }
}

export function pageHasForm(page: SitePage) {
  return page.blocks.some((block) => block.type === "field")
}

// Question ids referenced by field blocks across the whole site, in page/block
// order — this is the order the questions are asked at runtime.
export function siteQuestionIds(site: FormSite | undefined): string[] {
  if (!site) return []
  const ids: string[] = []
  for (const page of site.pages) {
    for (const block of page.blocks) {
      if (block.type === "field") ids.push(block.questionId)
    }
  }
  return ids
}

export function blockActions(block: SiteBlock): SiteAction | null {
  if (block.type === "banner" || block.type === "announcement") return block.ctaLabel.trim() ? block.action : null
  if (block.type === "button") return block.action
  return null
}

export function blockActionLabel(block: SiteBlock) {
  if (block.type === "banner" || block.type === "announcement") return block.ctaLabel
  if (block.type === "button") return block.label
  return ""
}

export function videoEmbed(url: string): { kind: "iframe" | "file"; src: string } | null {
  const value = url.trim()
  if (!value) return null
  if (value.startsWith("blob:") || value.startsWith("data:video/")) return { kind: "file", src: value }
  const youtube = value.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/)
  if (youtube) return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}` }
  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(value)) return { kind: "file", src: value }
  return null
}

export function isVideoSource(url: string) {
  return videoEmbed(url)?.kind === "file"
}

export function cloneSite(site: FormSite, questionIds?: Map<string, string>): FormSite {
  const pageIds = new Map(site.pages.map((page) => [page.id, uid("pg")]))
  const remapAction = (action: SiteAction): SiteAction =>
    action.kind === "page" ? { kind: "page", pageId: pageIds.get(action.pageId) ?? action.pageId } : action
  return {
    ...site,
    theme: { ...site.theme },
    entryPageId: pageIds.get(site.entryPageId) ?? site.entryPageId,
    fallbackPageId: pageIds.get(site.fallbackPageId) ?? site.fallbackPageId,
    rules: site.rules.map((rule) => ({
      id: uid("rule"),
      pageId: pageIds.get(rule.pageId) ?? rule.pageId,
      condition:
        rule.condition.kind === "answer"
          ? { ...rule.condition, questionId: questionIds?.get(rule.condition.questionId) ?? rule.condition.questionId }
          : { ...rule.condition },
    })),
    pages: site.pages.map((page) => ({
      ...page,
      id: pageIds.get(page.id) ?? page.id,
      blocks: page.blocks.map((block) => {
        const copy = cloneBlock(block)
        if (copy.type === "banner" || copy.type === "button" || copy.type === "announcement") {
          copy.action = remapAction(copy.action)
        }
        if (copy.type === "field" && questionIds) {
          copy.questionId = questionIds.get(copy.questionId) ?? copy.questionId
        }
        return copy
      }),
    })),
  }
}

export function removePage(site: FormSite, pageId: string): FormSite {
  const pages = site.pages.filter((page) => page.id !== pageId)
  if (pages.length === 0) return site
  const first = pages[0].id
  const thanks = pages.find((page) => page.kind === "thanks")?.id ?? first
  const clearAction = (action: SiteAction): SiteAction =>
    action.kind === "page" && action.pageId === pageId ? { kind: "none" } : action
  return {
    ...site,
    entryPageId: site.entryPageId === pageId ? first : site.entryPageId,
    fallbackPageId: site.fallbackPageId === pageId ? thanks : site.fallbackPageId,
    rules: site.rules.filter((rule) => rule.pageId !== pageId),
    pages: pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) =>
        block.type === "banner" || block.type === "button" || block.type === "announcement"
          ? { ...block, action: clearAction(block.action) }
          : block,
      ),
    })),
  }
}

export function duplicatePage(site: FormSite, pageId: string): FormSite {
  const page = site.pages.find((item) => item.id === pageId)
  if (!page) return site
  const copy: SitePage = {
    ...page,
    id: uid("pg"),
    name: `${page.name} 2`,
    blocks: page.blocks.map((block) => cloneBlock(block)),
  }
  return { ...site, pages: [...site.pages, copy] }
}

export function mapPage(site: FormSite, pageId: string, fn: (page: SitePage) => SitePage): FormSite {
  return { ...site, pages: site.pages.map((page) => (page.id === pageId ? fn(page) : page)) }
}

export function mapBlock(
  site: FormSite,
  pageId: string,
  blockId: string,
  fn: (block: SiteBlock) => SiteBlock,
): FormSite {
  return mapPage(site, pageId, (page) => ({
    ...page,
    blocks: page.blocks.map((block) => (block.id === blockId ? fn(block) : block)),
  }))
}

export function insertBlock(site: FormSite, pageId: string, block: SiteBlock, afterId?: string): FormSite {
  return mapPage(site, pageId, (page) => {
    if (!afterId) return { ...page, blocks: [...page.blocks, block] }
    const index = page.blocks.findIndex((item) => item.id === afterId)
    if (index < 0) return { ...page, blocks: [...page.blocks, block] }
    const blocks = [...page.blocks]
    blocks.splice(index + 1, 0, block)
    return { ...page, blocks }
  })
}

export function reorderBlock(site: FormSite, pageId: string, from: number, to: number): FormSite {
  return mapPage(site, pageId, (page) => {
    if (from < 0 || to < 0 || from >= page.blocks.length || to >= page.blocks.length || from === to) return page
    const blocks = [...page.blocks]
    const [item] = blocks.splice(from, 1)
    blocks.splice(to, 0, item)
    return { ...page, blocks }
  })
}

export function moveBlock(site: FormSite, pageId: string, blockId: string, direction: -1 | 1): FormSite {
  return mapPage(site, pageId, (page) => {
    const index = page.blocks.findIndex((item) => item.id === blockId)
    const target = index + direction
    if (index < 0 || target < 0 || target >= page.blocks.length) return page
    const blocks = [...page.blocks]
    const [item] = blocks.splice(index, 1)
    blocks.splice(target, 0, item)
    return { ...page, blocks }
  })
}

export function removeBlock(site: FormSite, pageId: string, blockId: string): FormSite {
  return mapPage(site, pageId, (page) => ({
    ...page,
    blocks: page.blocks.filter((block) => block.id !== blockId),
  }))
}

export function firstFormPageId(site: FormSite) {
  return site.pages.find((page) => pageHasForm(page))?.id
}

function readRuleValue(
  answers: { questionId: string; value: string | string[] }[],
  questionId: string,
) {
  const value = answers.find((answer) => answer.questionId === questionId)?.value
  if (Array.isArray(value)) return value
  return value ?? ""
}

function ruleMatches(
  rule: FlowRule,
  score: number,
  answers: { questionId: string; value: string | string[] }[],
) {
  if (rule.condition.kind === "always") return true
  if (rule.condition.kind === "score") return score >= rule.condition.min
  const value = readRuleValue(answers, rule.condition.questionId)
  const expected = rule.condition.value
  return Array.isArray(value) ? value.includes(expected) : value === expected
}

// First flow rule that matches the current answers, or null when the visitor
// should stay on the explicit button destination.
export function matchingRulePage(
  site: FormSite,
  score: number,
  answers: { questionId: string; value: string | string[] }[],
) {
  for (const rule of site.rules) {
    if (!site.pages.some((page) => page.id === rule.pageId)) continue
    if (ruleMatches(rule, score, answers)) return rule.pageId
  }
  return null
}

export function resolveThanksPage(
  site: FormSite,
  score: number,
  answers: { questionId: string; value: string | string[] }[],
) {
  return matchingRulePage(site, score, answers) ?? site.fallbackPageId
}

// Where a "go to page" action lands. An answer rule on a question of this page
// branches immediately (quiz → page). Score and "always" rules take over only
// when the button itself points at a final page (post-submit).
export function branchTarget(
  site: FormSite,
  page: SitePage,
  explicitPageId: string,
  score: number,
  answers: { questionId: string; value: string | string[] }[],
) {
  const here = new Set(page.blocks.flatMap((block) => (block.type === "field" ? [block.questionId] : [])))
  if (here.size > 0) {
    for (const rule of site.rules) {
      if (rule.condition.kind !== "answer") continue
      if (!here.has(rule.condition.questionId)) continue
      if (!site.pages.some((item) => item.id === rule.pageId)) continue
      if (ruleMatches(rule, score, answers)) return rule.pageId
    }
  }
  const target = site.pages.find((item) => item.id === explicitPageId)
  if (target?.final) return matchingRulePage(site, score, answers) ?? explicitPageId
  return explicitPageId
}

export type FlowNode = {
  id: string
  kind: "page" | "url"
  label: string
  pageKind?: PageKind
  entry?: boolean
  final?: boolean
}

// An edge carries enough to edit its source back: a block action (blockId) or a
// post-submit rule (ruleId). Derived edges never live in their own array.
export type FlowEdge = {
  id: string
  from: string
  to: string
  label: string
  source: { kind: "action"; pageId: string; blockId: string } | { kind: "rule"; ruleId: string }
}

export function siteFlow(site: FormSite): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const formPageId = firstFormPageId(site)
  const nodes: FlowNode[] = site.pages.map((page) => ({
    id: page.id,
    kind: "page",
    label: page.name,
    pageKind: page.kind,
    entry: page.id === site.entryPageId,
    final: !!page.final,
  }))
  const edges: FlowEdge[] = []
  const pushEdge = (from: string, to: string, label: string, source: FlowEdge["source"]) => {
    edges.push({ id: `${from}-${to}-${edges.length}`, from, to, label, source })
  }
  // Edges from explicit CTA actions (Botão/Banner/Announcement → página / URL).
  for (const page of site.pages) {
    for (const block of page.blocks) {
      const action = blockActions(block)
      if (!action || action.kind === "none") continue
      const label = blockActionLabel(block) || "Botão"
      const source = { kind: "action" as const, pageId: page.id, blockId: block.id }
      if (action.kind === "page") {
        pushEdge(page.id, action.pageId, label, source)
      } else if (action.kind === "url") {
        const urlId = `url-${block.id}`
        if (!nodes.some((node) => node.id === urlId)) {
          nodes.push({ id: urlId, kind: "url", label: action.url || "Link" })
        }
        pushEdge(page.id, urlId, label, source)
      }
    }
  }
  // Post-submit routing rules branch from the form step (score/answer → página).
  if (formPageId) {
    for (const rule of site.rules) {
      const label =
        rule.condition.kind === "score"
          ? `Match ≥ ${rule.condition.min}%`
          : rule.condition.kind === "answer"
            ? `Resposta: ${rule.condition.value}`
            : "Sempre"
      pushEdge(formPageId, rule.pageId, label, { kind: "rule", ruleId: rule.id })
    }
  }
  return { nodes, edges }
}
