export type BlockType =
  | "banner"
  | "heading"
  | "text"
  | "image"
  | "video"
  | "button"
  | "features"
  | "stats"
  | "faq"
  | "testimonial"
  | "form"
  | "html"
  | "divider"
  | "spacer"

export type Align = "left" | "center"

export type SiteAction =
  | { kind: "none" }
  | { kind: "form" }
  | { kind: "page"; pageId: string }
  | { kind: "url"; url: string }

export interface ListItem {
  id: string
  title: string
  text: string
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
  | { id: string; type: "heading"; text: string; size: "md" | "lg"; align: Align }
  | { id: string; type: "text"; text: string; align: Align }
  | { id: string; type: "image"; src: string; alt: string; caption: string }
  | { id: string; type: "video"; url: string }
  | { id: string; type: "button"; label: string; style: "solid" | "outline"; align: Align; action: SiteAction }
  | { id: string; type: "features"; title: string; items: ListItem[]; appearance?: ListAppearance }
  | { id: string; type: "stats"; items: ListItem[] }
  | { id: string; type: "faq"; title: string; items: ListItem[] }
  | { id: string; type: "testimonial"; quote: string; author: string; role: string }
  | { id: string; type: "form"; title: string }
  | { id: string; type: "html"; code: string; height: number }
  | { id: string; type: "divider" }
  | { id: string; type: "spacer"; size: "sm" | "md" | "lg" }

export type PageKind = "landing" | "thanks" | "custom"

export interface SitePage {
  id: string
  name: string
  kind: PageKind
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

export interface SiteTheme {
  primary: string
  background: string
  font: string
}

export interface FormSite {
  entryPageId: string
  fallbackPageId: string
  rules: FlowRule[]
  theme: SiteTheme
  pages: SitePage[]
}

export const BLOCK_GROUPS: { id: "structure" | "content" | "media" | "conversion"; types: BlockType[] }[] = [
  { id: "structure", types: ["banner", "divider", "spacer"] },
  { id: "content", types: ["heading", "text", "features", "stats", "faq", "testimonial"] },
  { id: "media", types: ["image", "video", "html"] },
  { id: "conversion", types: ["button", "form"] },
]

export function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

export function item(title: string, text: string): ListItem {
  return { id: uid("it"), title, text }
}

export function createBlock(type: BlockType): SiteBlock {
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
        action: { kind: "form" },
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
    case "button":
      return { id, type, label: "Quero participar", style: "solid", align: "center", action: { kind: "form" } }
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
    case "form":
      return { id, type, title: "Sua candidatura" }
    case "html":
      return {
        id,
        type,
        code: '<div style="padding:24px;text-align:center;font-family:sans-serif">\n  <strong>Seu HTML aqui</strong>\n</div>',
        height: 160,
      }
    case "divider":
      return { id, type }
    case "spacer":
      return { id, type, size: "md" }
  }
}

export function cloneBlock(block: SiteBlock): SiteBlock {
  const copy = structuredClone(block)
  copy.id = uid("blk")
  if ("items" in copy) copy.items = copy.items.map((entry) => ({ ...entry, id: uid("it") }))
  return copy
}

export function createPage(kind: PageKind, name: string): SitePage {
  const id = uid("pg")
  if (kind === "thanks") {
    return {
      id,
      name,
      kind,
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
  if (kind === "landing") {
    return { id, name, kind, blocks: [createBlock("banner"), createBlock("features"), createBlock("form")] }
  }
  return { id, name, kind, blocks: [createBlock("heading"), createBlock("text")] }
}

export function defaultSite(primary: string): FormSite {
  const landing = createPage("landing", "Início")
  const thanks = createPage("thanks", "Obrigado")
  return {
    entryPageId: landing.id,
    fallbackPageId: thanks.id,
    rules: [],
    theme: { primary, background: "#ffffff", font: "sans" },
    pages: [landing, thanks],
  }
}

export function pageHasForm(page: SitePage) {
  return page.blocks.some((block) => block.type === "form")
}

export function blockActions(block: SiteBlock): SiteAction | null {
  if (block.type === "banner") return block.ctaLabel.trim() ? block.action : null
  if (block.type === "button") return block.action
  return null
}

export function blockActionLabel(block: SiteBlock) {
  if (block.type === "banner") return block.ctaLabel
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
        if (copy.type === "banner" || copy.type === "button") copy.action = remapAction(copy.action)
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
        block.type === "banner" || block.type === "button" ? { ...block, action: clearAction(block.action) } : block,
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

export function resolveThanksPage(
  site: FormSite,
  score: number,
  answers: { questionId: string; value: string | string[] }[],
) {
  const read = (questionId: string) => {
    const value = answers.find((answer) => answer.questionId === questionId)?.value
    if (Array.isArray(value)) return value
    return value ?? ""
  }
  for (const rule of site.rules) {
    if (!site.pages.some((page) => page.id === rule.pageId)) continue
    if (rule.condition.kind === "always") return rule.pageId
    if (rule.condition.kind === "score" && score >= rule.condition.min) return rule.pageId
    if (rule.condition.kind === "answer") {
      const value = read(rule.condition.questionId)
      const expected = rule.condition.value
      const hit = Array.isArray(value) ? value.includes(expected) : value === expected
      if (hit) return rule.pageId
    }
  }
  return site.fallbackPageId
}

export type FlowNode = {
  id: string
  kind: "page" | "form" | "url"
  label: string
  pageKind?: PageKind
  entry?: boolean
  fallback?: boolean
}

export type FlowEdge = {
  id: string
  from: string
  to: string
  label: string
}

export function siteFlow(site: FormSite): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const formPageId = firstFormPageId(site)
  const nodes: FlowNode[] = site.pages.map((page) => ({
    id: page.id,
    kind: "page",
    label: page.name,
    pageKind: page.kind,
    entry: page.id === site.entryPageId,
    fallback: page.id === site.fallbackPageId,
  }))
  if (formPageId) {
    nodes.push({ id: "form", kind: "form", label: "Formulário" })
  }
  const edges: FlowEdge[] = []
  const pushEdge = (from: string, to: string, label: string) => {
    edges.push({ id: `${from}-${to}-${edges.length}`, from, to, label })
  }
  for (const page of site.pages) {
    for (const block of page.blocks) {
      const action = blockActions(block)
      if (!action || action.kind === "none") continue
      const label = blockActionLabel(block) || "Botão"
      if (action.kind === "form") {
        if (pageHasForm(page)) pushEdge(page.id, "form", label)
        else if (formPageId) {
          pushEdge(page.id, formPageId, label)
          pushEdge(formPageId, "form", "")
        }
      } else if (action.kind === "page") {
        pushEdge(page.id, action.pageId, label)
      } else if (action.kind === "url") {
        const urlId = `url-${block.id}`
        if (!nodes.some((node) => node.id === urlId)) {
          nodes.push({ id: urlId, kind: "url", label: action.url || "Link" })
        }
        pushEdge(page.id, urlId, label)
      }
    }
  }
  if (formPageId) {
    if (!edges.some((edge) => edge.to === "form")) pushEdge(formPageId, "form", "Candidatura")
    for (const rule of site.rules) {
      const label =
        rule.condition.kind === "score"
          ? `Match ≥ ${rule.condition.min}%`
          : rule.condition.kind === "answer"
            ? `Resposta: ${rule.condition.value}`
            : "Sempre"
      pushEdge("form", rule.pageId, label)
    }
    if (!edges.some((edge) => edge.from === "form" && edge.to === site.fallbackPageId)) {
      pushEdge("form", site.fallbackPageId, "Demais")
    }
  }
  return { nodes, edges }
}
