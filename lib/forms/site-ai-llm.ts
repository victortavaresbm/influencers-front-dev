import {
  createBlock,
  createPage,
  defaultTheme,
  firstFormPageId,
  uid,
  type BlockType,
  type FormSite,
  type GalleryImage,
  type ListItem,
  type PageKind,
  type SiteAction,
  type SiteBlock,
  type SitePage,
} from "@/lib/mock-data/form-site"

// Turns an untrusted LLM JSON response into a safe, valid FormSite. Every field
// falls back to the block defaults from createBlock, so a partial or malformed
// answer still produces a usable page.

const HEX = /^#[0-9a-fA-F]{6}$/

const BLOCK_TYPES = new Set<SiteBlock["type"]>([
  "banner",
  "announcement",
  "heading",
  "text",
  "image",
  "gallery",
  "video",
  "button",
  "features",
  "bento",
  "steps",
  "stats",
  "marquee",
  "faq",
  "testimonial",
  "audio",
  "html",
  "divider",
  "spacer",
])

type Rec = Record<string, unknown>

function asRecord(value: unknown): Rec {
  return value && typeof value === "object" ? (value as Rec) : {}
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function hex(value: unknown, fallback: string): string {
  return typeof value === "string" && HEX.test(value) ? value : fallback
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

function listItems(value: unknown): ListItem[] | null {
  if (!Array.isArray(value)) return null
  const list = value
    .slice(0, 8)
    .map((entry) => {
      const obj = asRecord(entry)
      return { id: uid("it"), title: str(obj.title).slice(0, 120), text: str(obj.text).slice(0, 400) }
    })
    .filter((entry) => entry.title || entry.text)
  return list.length ? list : null
}

function galleryItems(value: unknown): GalleryImage[] | null {
  if (!Array.isArray(value)) return null
  const list = value
    .slice(0, 9)
    .map((entry) => {
      const obj = asRecord(entry)
      return { id: uid("it"), src: str(obj.src ?? obj.image), caption: str(obj.caption ?? obj.alt).slice(0, 120) }
    })
    .filter((entry) => entry.src || entry.caption)
  return list.length ? list : null
}

function toAction(value: unknown, fallback: SiteAction = { kind: "none" }): SiteAction {
  if (value === "none" || value === "form") return { kind: "none" }
  const obj = asRecord(value)
  if (obj.kind === "none" || obj.kind === "form") return { kind: "none" }
  if (obj.kind === "page" && typeof obj.pageId === "string") return { kind: "page", pageId: obj.pageId }
  if (obj.kind === "url" && typeof obj.url === "string") return { kind: "url", url: obj.url }
  if (typeof value === "string" && /^https?:\/\//.test(value)) return { kind: "url", url: value }
  return fallback
}

function sanitizeBlock(raw: unknown): SiteBlock | null {
  const obj = asRecord(raw)
  const type = obj.type
  if (typeof type !== "string" || !BLOCK_TYPES.has(type as SiteBlock["type"])) return null
  // BLOCK_TYPES excludes "field" (fields are created from questions), so the
  // cast to a creatable block type is safe here.
  const base = createBlock(type as Exclude<BlockType, "field">)
  switch (base.type) {
    case "banner":
      return {
        ...base,
        title: str(obj.title, base.title),
        subtitle: str(obj.subtitle, base.subtitle),
        image: str(obj.image, base.image),
        background: hex(obj.background, base.background),
        tone: oneOf(obj.tone, ["light", "dark"] as const, base.tone),
        align: oneOf(obj.align, ["left", "center"] as const, base.align),
        ctaLabel: str(obj.ctaLabel, base.ctaLabel),
        action: toAction(obj.action),
      }
    case "heading":
      return {
        ...base,
        text: str(obj.text, base.text),
        size: oneOf(obj.size, ["md", "lg"] as const, base.size),
        align: oneOf(obj.align, ["left", "center"] as const, base.align),
      }
    case "text":
      return { ...base, text: str(obj.text, base.text), align: oneOf(obj.align, ["left", "center"] as const, base.align) }
    case "image":
      return { ...base, src: str(obj.src, base.src), alt: str(obj.caption ?? obj.alt, base.alt), caption: str(obj.caption, base.caption) }
    case "video":
      return { ...base, url: str(obj.url, base.url) }
    case "audio":
      return { ...base, url: str(obj.url, base.url), title: str(obj.title, base.title) }
    case "button":
      return {
        ...base,
        label: str(obj.label, base.label),
        style: oneOf(obj.style, ["solid", "outline"] as const, base.style),
        align: oneOf(obj.align, ["left", "center"] as const, base.align),
        action: toAction(obj.action),
      }
    case "features":
      return { ...base, title: str(obj.title, base.title), items: listItems(obj.items) ?? base.items }
    case "stats":
      return { ...base, items: listItems(obj.items) ?? base.items }
    case "faq":
      return { ...base, title: str(obj.title, base.title), items: listItems(obj.items) ?? base.items }
    case "testimonial":
      return { ...base, quote: str(obj.quote, base.quote), author: str(obj.author, base.author), role: str(obj.role, base.role) }
    case "html":
      return {
        ...base,
        code: str(obj.code, base.code),
        height: typeof obj.height === "number" ? Math.min(800, Math.max(60, obj.height)) : base.height,
      }
    case "announcement":
      return {
        ...base,
        text: str(obj.text, base.text),
        ctaLabel: str(obj.ctaLabel, base.ctaLabel),
        action: toAction(obj.action),
        background: hex(obj.background, base.background),
        tone: oneOf(obj.tone, ["light", "dark"] as const, base.tone),
      }
    case "bento":
      return { ...base, title: str(obj.title, base.title), items: listItems(obj.items) ?? base.items }
    case "steps":
      return { ...base, title: str(obj.title, base.title), items: listItems(obj.items) ?? base.items }
    case "marquee":
      return { ...base, items: listItems(obj.items) ?? base.items }
    case "gallery":
      return { ...base, items: galleryItems(obj.items) ?? base.items }
    case "divider":
      return base
    case "spacer":
      return { ...base, size: oneOf(obj.size, ["sm", "md", "lg"] as const, base.size) }
    default:
      return null
  }
}

function defaultName(kind: PageKind): string {
  return kind === "landing" ? "Início" : kind === "form" ? "Formulário" : kind === "thanks" ? "Obrigado" : "Página"
}

function sanitizePage(raw: unknown): SitePage | null {
  const obj = asRecord(raw)
  if (!obj.type && !obj.kind && !obj.blocks) return null
  const kind = oneOf(obj.kind, ["landing", "form", "thanks", "custom"] as const, "custom")
  const blocksRaw = Array.isArray(obj.blocks) ? obj.blocks.slice(0, 16) : []
  const blocks = blocksRaw.map(sanitizeBlock).filter((block): block is SiteBlock => Boolean(block))
  const name = str(obj.name).trim().slice(0, 60) || defaultName(kind)
  return { id: uid("pg"), name, kind, final: kind === "thanks" ? true : undefined, blocks }
}

export function sanitizeSite(raw: unknown, current: FormSite): FormSite {
  const obj = asRecord(raw)
  const themeObj = asRecord(obj.theme)
  const theme = defaultTheme(hex(themeObj.primary, current.theme.primary))
  theme.background = hex(themeObj.background, current.theme.background)
  const font = str(themeObj.font)
  if (font) {
    theme.heading.font = font
    theme.body.font = font
  }

  const pages = (Array.isArray(obj.pages) ? obj.pages.slice(0, 6) : [])
    .map(sanitizePage)
    .filter((page): page is SitePage => Boolean(page))
  if (pages.length === 0) throw new Error("A IA não devolveu páginas válidas.")

  if (!pages.some((page) => page.kind === "landing")) pages[0] = { ...pages[0], kind: "landing" }
  if (!pages.some((page) => page.kind === "thanks")) {
    const last = pages[pages.length - 1]
    pages[pages.length - 1] = {
      ...last,
      kind: "thanks",
      blocks: last.blocks.length ? last.blocks : createPage("thanks", "Obrigado").blocks,
    }
  }
  const hasForm = pages.some((page) => page.kind === "form")
  if (!hasForm) {
    const thanksIndex = pages.findIndex((page) => page.kind === "thanks")
    pages.splice(thanksIndex >= 0 ? thanksIndex : pages.length, 0, createPage("form", "Formulário"))
  }

  const entry = pages.find((page) => page.kind === "landing") ?? pages[0]
  const fallback = pages.find((page) => page.kind === "thanks") ?? pages[pages.length - 1]

  // Wire explicit navigation: the entry page must have a CTA that advances to
  // the form step (the runtime has no implicit "next page").
  const formTarget = firstFormPageId({ ...current, pages }) ?? pages.find((page) => page.kind === "form")?.id
  const entryReachesForm = entry.blocks.some(
    (block) =>
      (block.type === "banner" || block.type === "button" || block.type === "announcement") &&
      block.action.kind === "page",
  )
  if (formTarget && !entryReachesForm) {
    entry.blocks.push({
      id: uid("blk"),
      type: "button",
      label: "Quero me candidatar",
      style: "solid",
      align: "center",
      action: { kind: "page", pageId: formTarget },
    })
  }

  return { entryPageId: entry.id, fallbackPageId: fallback.id, rules: [], theme, pages }
}

export function siteAiSystemPrompt(): string {
  return `Você é um construtor de landing pages de candidatura para creators de uma plataforma de marketing de influência.
A pessoa descreve a página que quer e você devolve a estrutura pronta.

Responda APENAS com um objeto JSON válido, sem markdown, sem comentários, no formato:
{
  "theme": { "primary": "#RRGGBB", "background": "#ffffff", "font": "Inter" },
  "pages": [ { "name": "string", "kind": "landing" | "form" | "thanks" | "custom", "blocks": [ Bloco, ... ] } ]
}

Cada Bloco tem um "type" e campos próprios:
- { "type": "banner", "title", "subtitle", "background": "#RRGGBB", "tone": "light" | "dark", "align": "left" | "center", "image": "url ou vazio", "ctaLabel", "action": "none" }  (tone "light" = texto claro sobre fundo escuro)
- { "type": "heading", "text", "size": "md" | "lg", "align": "left" | "center" }
- { "type": "text", "text", "align": "left" | "center" }
- { "type": "features", "title", "items": [ { "title", "text" } ] }  (grade de 3 benefícios)
- { "type": "bento", "title", "items": [ { "title", "text" } ] }  (grade assimétrica de 4-6 cards; o 1º é maior)
- { "type": "steps", "title", "items": [ { "title", "text" } ] }  (passo a passo numerado automaticamente)
- { "type": "stats", "items": [ { "title", "text" } ] }  (title é o número, ex "15%")
- { "type": "marquee", "items": [ { "title" } ] }  (faixa rolante de nomes/marcas; use só title)
- { "type": "faq", "title", "items": [ { "title", "text" } ] }
- { "type": "testimonial", "quote", "author", "role" }
- { "type": "announcement", "text", "ctaLabel", "action": "none", "background": "#RRGGBB", "tone": "light" | "dark" }  (barra fina no topo)
- { "type": "button", "label", "style": "solid" | "outline", "align", "action": "none" }
- { "type": "image", "src": "url", "caption" }
- { "type": "gallery", "items": [ { "src": "url", "caption" } ] }  (grade de imagens)
- { "type": "video", "url" }
- { "type": "audio", "url", "title" }
- { "type": "divider" } , { "type": "spacer", "size": "sm" | "md" | "lg" }

Regras obrigatórias:
- Monte o fluxo: uma página "landing" (Início) com os blocos de venda; uma página "form" (Formulário) para as perguntas; e uma página "thanks" (Obrigado) curta.
- Use "action": "none" nos CTAs — a navegação entre páginas é cabeada automaticamente pelo sistema.
- Use a cor da marca enviada em primaryColor no theme.primary.
- Escreva todos os textos em português brasileiro, curtos, específicos e persuasivos, usando o contexto da marca.
- background "#ffffff" para tema claro; um tom bem escuro (ex. "#0b0b14") para tema escuro.
- No modo "edit" você recebe currentSite: mantenha o que faz sentido e aplique apenas o que foi pedido, devolvendo o site completo.
- Não use campos fora deste esquema.`
}
