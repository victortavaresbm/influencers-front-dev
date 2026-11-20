import type { ApplicationForm } from "@/lib/mock-data/forms"
import {
  createBlock,
  createPage,
  defaultSite,
  item,
  uid,
  type FormSite,
  type SiteBlock,
  type SitePage,
} from "@/lib/mock-data/form-site"

const COLOR_WORDS: { test: RegExp; color: string }[] = [
  { test: /azul|blue|magalu/i, color: "#0086FF" },
  { test: /verde|green|natura/i, color: "#2F6B3A" },
  { test: /laranja|orange/i, color: "#F47920" },
  { test: /vermelho|red|ifood/i, color: "#EA1D2C" },
  { test: /preto|black|escuro/i, color: "#18181b" },
  { test: /rosa|pink/i, color: "#DB2777" },
  { test: /roxo|purple/i, color: "#6D28D9" },
]

const IMAGES = {
  home: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=70",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1600&q=70",
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=70",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=70",
  fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=70",
}

function pickImage(text: string) {
  if (/decor|casa|home|m[oó]vel/i.test(text)) return IMAGES.home
  if (/beleza|beauty|skin|make/i.test(text)) return IMAGES.beauty
  if (/tech|tecnolog|game|eletr/i.test(text)) return IMAGES.tech
  if (/comida|food|gastro|ifood/i.test(text)) return IMAGES.food
  if (/moda|fashion|look/i.test(text)) return IMAGES.fashion
  return IMAGES.home
}

function colorFrom(text: string, fallback: string) {
  return COLOR_WORDS.find((entry) => entry.test.test(text))?.color ?? fallback
}

function rewrite(block: SiteBlock, title: string, description: string, brand: string): SiteBlock {
  if (block.type === "banner") {
    return {
      ...block,
      title: title || block.title,
      subtitle: description || block.subtitle,
    }
  }
  if (block.type === "heading" && /obrigado|enviada|thanks/i.test(block.text)) return block
  if (block.type === "heading") return { ...block, text: `Por que entrar na ${brand}` }
  return block
}

function landingBlocks(form: ApplicationForm, prompt: string, color: string): SiteBlock[] {
  const source = `${form.title} ${form.description} ${form.brandSummary ?? ""} ${prompt}`
  const banner = createBlock("banner")
  if (banner.type !== "banner") return []
  const blocks: SiteBlock[] = [
    {
      ...banner,
      title: form.title || banner.title,
      subtitle: form.description || banner.subtitle,
      image: pickImage(source),
      background: color,
      tone: "light",
      align: "left",
      ctaLabel: "Quero me candidatar",
      action: { kind: "form" },
    },
  ]
  if (!/sem n[uú]meros|sem stats/i.test(prompt)) {
    const stats = createBlock("stats")
    if (stats.type === "stats") {
      blocks.push({
        ...stats,
        items: [
          item("48h", "para a resposta da marca"),
          item("Brief Check", "mede o match com o perfil"),
          item("Campanhas", "para quem entra na comunidade"),
        ],
      })
    }
  }
  const features = createBlock("features")
  if (features.type === "features") {
    blocks.push({
      ...features,
      title: "O que você encontra aqui",
      items: [
        item("Candidatura direta", "As respostas alimentam o Brief Check da marca."),
        item("Match com a campanha", "Comparamos o seu conteúdo com o resumo do que buscamos."),
        item("Comunidade", `Quem combina entra na base de creators da ${form.organizationName}.`),
      ],
    })
  }
  if (/faq|perguntas/i.test(prompt) || prompt.length < 8) {
    const faq = createBlock("faq")
    if (faq.type === "faq") {
      blocks.push({
        ...faq,
        title: "Perguntas frequentes",
        items: [
          item("Preciso ter muitos seguidores?", "Não. O Brief Check olha a afinidade do conteúdo com a marca antes do tamanho da audiência."),
          item("Quando recebo a resposta?", "A marca avalia as candidaturas em até dois dias úteis."),
        ],
      })
    }
  }
  if (/depoimento|testimonial|prova/i.test(prompt)) {
    blocks.push(createBlock("testimonial"))
  }
  if (/html|embed|script/i.test(prompt)) {
    const html = createBlock("html")
    if (html.type === "html") {
      blocks.push({
        ...html,
        code: `<div style="padding:28px;border-radius:16px;background:${color};color:#fff;font-family:sans-serif;text-align:center">
  <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8">Candidatura</p>
  <p style="margin:8px 0 0;font-size:22px;font-weight:700">${form.title}</p>
</div>`,
        height: 140,
      })
    }
  }
  blocks.push(createBlock("button"))
  return blocks
}

function highMatchPage(form: ApplicationForm): SitePage {
  const page = createPage("thanks", "Match alto")
  page.blocks = [
    { id: uid("blk"), type: "spacer", size: "lg" },
    {
      id: uid("blk"),
      type: "heading",
      text: `Seu perfil tem a cara da ${form.organizationName}`,
      size: "lg",
      align: "center",
    },
    {
      id: uid("blk"),
      type: "text",
      text: "O Brief Check encontrou um match alto entre as suas respostas e o que a marca busca. Você entrou na fila prioritária.",
      align: "center",
    },
    { id: uid("blk"), type: "spacer", size: "lg" },
  ]
  return page
}

function applyEdits(site: FormSite, form: ApplicationForm, prompt: string): FormSite {
  let next: FormSite = {
    ...site,
    theme: { ...site.theme, primary: colorFrom(prompt, site.theme.primary) },
    pages: site.pages.map((page) => ({ ...page, blocks: page.blocks.map((block) => ({ ...block })) })),
  }
  if (/serif/i.test(prompt)) next = { ...next, theme: { ...next.theme, font: "serif" } }
  if (/sans/i.test(prompt)) next = { ...next, theme: { ...next.theme, font: "sans" } }
  if (/escuro|dark|preto/i.test(prompt)) next = { ...next, theme: { ...next.theme, background: "#09090b" } }
  if (/claro|white|branco/i.test(prompt)) next = { ...next, theme: { ...next.theme, background: "#ffffff" } }

  const landing = next.pages.find((page) => page.id === next.entryPageId) ?? next.pages[0]
  const addToLanding = (block: SiteBlock) => {
    next = {
      ...next,
      pages: next.pages.map((page) => (page.id === landing.id ? { ...page, blocks: [...page.blocks, block] } : page)),
    }
  }

  if (/faq/i.test(prompt) && !landing.blocks.some((block) => block.type === "faq")) addToLanding(createBlock("faq"))
  if (/depoimento|testimonial/i.test(prompt) && !landing.blocks.some((block) => block.type === "testimonial")) {
    addToLanding(createBlock("testimonial"))
  }
  if (/banner/i.test(prompt) && !landing.blocks.some((block) => block.type === "banner")) {
    addToLanding(createBlock("banner"))
  }
  if (/html/i.test(prompt) && !landing.blocks.some((block) => block.type === "html")) addToLanding(createBlock("html"))
  if (/v[ií]deo|youtube/i.test(prompt) && !landing.blocks.some((block) => block.type === "video")) {
    addToLanding(createBlock("video"))
  }
  if (/n[uú]meros|stats/i.test(prompt) && !landing.blocks.some((block) => block.type === "stats")) {
    addToLanding(createBlock("stats"))
  }

  if (/match alto|p[aá]gina de obrigado|thank/i.test(prompt)) {
    const existing = next.pages.find((page) => page.kind === "thanks" && page.id !== next.fallbackPageId)
    const page = existing ?? highMatchPage(form)
    if (!existing) next = { ...next, pages: [...next.pages, page] }
    if (!next.rules.some((rule) => rule.condition.kind === "score")) {
      next = {
        ...next,
        rules: [{ id: uid("rule"), condition: { kind: "score", min: 70 }, pageId: page.id }, ...next.rules],
      }
    }
  }

  if (/reescrev|texto|copy|t[ií]tulo/i.test(prompt)) {
    next = {
      ...next,
      pages: next.pages.map((page) => ({
        ...page,
        blocks: page.blocks.map((block) => rewrite(block, form.title, form.description, form.organizationName)),
      })),
    }
  }

  return next
}

export function generateSite(form: ApplicationForm, prompt: string, current?: FormSite): { site: FormSite; note: string } {
  const color = colorFrom(`${prompt} ${form.organizationName}`, current?.theme.primary ?? "#18181b")
  const looksLikeEdit =
    !!current &&
    /adicion|inclu|mud|alter|troc|crie uma p[aá]gina|reescrev|faq|depoimento|html|cor|tom|match/i.test(prompt)

  if (looksLikeEdit && current) {
    return { site: applyEdits(current, form, prompt), note: "edit" }
  }

  const landing: SitePage = {
    id: uid("pg"),
    name: "Início",
    kind: "landing",
    blocks: landingBlocks(form, prompt, color),
  }
  const formStep = createPage("form", "Formulário")
  const thanks = createPage("thanks", "Obrigado")
  const pages = [landing, formStep, thanks]
  const rules: FormSite["rules"] = []
  if (/match|brief check|priorit/i.test(prompt) || (form.brandSummary && form.questions.some((question) => question.match))) {
    const match = highMatchPage(form)
    pages.splice(pages.length - 1, 0, match)
    rules.push({ id: uid("rule"), condition: { kind: "score", min: 70 }, pageId: match.id })
  }

  const site: FormSite = {
    ...(current ? { ...current } : defaultSite(color)),
    entryPageId: landing.id,
    fallbackPageId: thanks.id,
    rules,
    theme: { primary: color, background: /escuro|dark/i.test(prompt) ? "#09090b" : "#ffffff", font: /serif/i.test(prompt) ? "serif" : "sans" },
    pages,
  }
  return { site, note: "create" }
}
