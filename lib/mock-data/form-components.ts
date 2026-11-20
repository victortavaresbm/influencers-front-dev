import {
  item,
  uid,
  type Align,
  type ListAppearance,
  type SiteAction,
  type SiteBlock,
} from "@/lib/mock-data/form-site"

// 21st.dev-inspired catalog of ready-made section components. Each preset is one
// or more pre-configured blocks the user can preview and drop into a page.

const PHOTO = "?auto=format&fit=crop&w=1600&q=70"

function hero(o: {
  title: string
  subtitle: string
  background: string
  tone: "light" | "dark"
  image?: string
  align?: Align
  cta?: string
}): SiteBlock {
  return {
    id: uid("blk"),
    type: "banner",
    title: o.title,
    subtitle: o.subtitle,
    image: o.image ?? "",
    background: o.background,
    tone: o.tone,
    align: o.align ?? "center",
    ctaLabel: o.cta ?? "Quero me candidatar",
    action: { kind: "form" },
  }
}

function stats(items: [string, string][]): SiteBlock {
  return { id: uid("blk"), type: "stats", items: items.map(([t, x]) => item(t, x)) }
}

function features(title: string, items: [string, string][], appearance?: ListAppearance): SiteBlock {
  return { id: uid("blk"), type: "features", title, items: items.map(([t, x]) => item(t, x)), appearance }
}

function faq(title: string, items: [string, string][]): SiteBlock {
  return { id: uid("blk"), type: "faq", title, items: items.map(([t, x]) => item(t, x)) }
}

function testimonial(quote: string, author: string, role: string): SiteBlock {
  return { id: uid("blk"), type: "testimonial", quote, author, role }
}

function heading(text: string, align: Align = "center", size: "md" | "lg" = "lg"): SiteBlock {
  return { id: uid("blk"), type: "heading", text, size, align }
}

function paragraph(text: string, align: Align = "center"): SiteBlock {
  return { id: uid("blk"), type: "text", text, align }
}

function button(label: string, action: SiteAction = { kind: "form" }, style: "solid" | "outline" = "solid", align: Align = "center"): SiteBlock {
  return { id: uid("blk"), type: "button", label, style, align, action }
}

function image(src: string, caption = ""): SiteBlock {
  return { id: uid("blk"), type: "image", src, alt: caption, caption }
}

function form(title = "Sua candidatura"): SiteBlock {
  return { id: uid("blk"), type: "form", title }
}

function divider(): SiteBlock {
  return { id: uid("blk"), type: "divider" }
}

function spacer(size: "sm" | "md" | "lg" = "md"): SiteBlock {
  return { id: uid("blk"), type: "spacer", size }
}

function marquee(labels: string[]): SiteBlock {
  return { id: uid("blk"), type: "marquee", items: labels.map((label) => item(label, "")) }
}

function bento(title: string, items: [string, string][], appearance?: ListAppearance): SiteBlock {
  return { id: uid("blk"), type: "bento", title, items: items.map(([t, x]) => item(t, x)), appearance }
}

function steps(title: string, items: [string, string][]): SiteBlock {
  return { id: uid("blk"), type: "steps", title, items: items.map(([t, x]) => item(t, x)) }
}

function gallery(images: [string, string][]): SiteBlock {
  return { id: uid("blk"), type: "gallery", items: images.map(([src, caption]) => ({ id: uid("it"), src, caption })) }
}

function announcement(text: string, cta: string, background: string, tone: "light" | "dark" = "light"): SiteBlock {
  return { id: uid("blk"), type: "announcement", text, ctaLabel: cta, action: { kind: "form" }, background, tone }
}

export type ComponentCategory =
  | "hero"
  | "features"
  | "stats"
  | "social"
  | "faq"
  | "cta"
  | "content"
  | "media"
  | "conversion"

export const COMPONENT_CATEGORIES: { id: ComponentCategory; label: string }[] = [
  { id: "hero", label: "Destaque" },
  { id: "features", label: "Recursos" },
  { id: "stats", label: "Números" },
  { id: "social", label: "Prova social" },
  { id: "faq", label: "FAQ" },
  { id: "cta", label: "Chamada" },
  { id: "content", label: "Conteúdo" },
  { id: "media", label: "Mídia" },
  { id: "conversion", label: "Conversão" },
]

export interface ComponentPreset {
  id: string
  name: string
  description: string
  category: ComponentCategory
  // primary lets previews and inserts match the current theme color.
  build: (primary: string) => SiteBlock[]
}

export const SITE_COMPONENTS: ComponentPreset[] = [
  // ── Destaque (heros) ──────────────────────────────────────────
  {
    id: "hero-dark",
    name: "Destaque escuro",
    description: "Banner escuro centralizado com imagem de fundo e CTA.",
    category: "hero",
    build: () => [
      hero({
        title: "Faça parte do nosso time de creators",
        subtitle: "Conte quem você é e mostre como o seu conteúdo conversa com a marca.",
        background: "#14141c",
        tone: "light",
        align: "center",
        image: `https://images.unsplash.com/photo-1511988617509-a57c8a288659${PHOTO}`,
      }),
    ],
  },
  {
    id: "hero-split",
    name: "Destaque dividido",
    description: "Título à esquerda sobre imagem, estilo revista.",
    category: "hero",
    build: () => [
      hero({
        title: "Creators selecionados para a próxima campanha",
        subtitle: "Buscamos vozes que combinam com a marca. Candidate-se e entre na curadoria.",
        background: "#1f2430",
        tone: "light",
        align: "left",
        image: `https://images.unsplash.com/photo-1483985988355-763728e1935b${PHOTO}`,
      }),
    ],
  },
  {
    id: "hero-minimal",
    name: "Destaque minimal",
    description: "Fundo claro, tipográfico, sem imagem.",
    category: "hero",
    build: () => [
      hero({
        title: "Entre para a comunidade de creators",
        subtitle: "Um processo simples e direto para começar a trabalhar com a marca.",
        background: "#f4f4f5",
        tone: "dark",
        align: "left",
        cta: "Começar candidatura",
      }),
    ],
  },

  {
    id: "hero-badge",
    name: "Destaque com aviso",
    description: "Barra de novidade acima de um hero centralizado.",
    category: "hero",
    build: () => [
      announcement("Novidade: inscrições abertas para a próxima campanha", "Ver detalhes", "#18181b", "light"),
      hero({
        title: "Seja um creator oficial da marca",
        subtitle: "Candidate-se e participe das próximas campanhas, com cachê e produtos para testar.",
        background: "#0b0b14",
        tone: "light",
        align: "center",
        image: `https://images.unsplash.com/photo-1519389950473-47ba0277781c${PHOTO}`,
      }),
    ],
  },
  {
    id: "hero-stats",
    name: "Destaque com números",
    description: "Hero seguido de uma faixa de métricas.",
    category: "hero",
    build: () => [
      hero({
        title: "Transforme o seu conteúdo em parceria",
        subtitle: "Mostre o seu trabalho e entre para a comunidade de creators da marca.",
        background: "#1f2430",
        tone: "light",
        align: "left",
        image: `https://images.unsplash.com/photo-1600880292203-757bb62b4baf${PHOTO}`,
      }),
      stats([
        ["+300", "creators na comunidade"],
        ["15%", "de comissão por venda"],
        ["48h", "para a resposta"],
      ]),
    ],
  },
  {
    id: "hero-logos",
    name: "Destaque com logos",
    description: "Hero escuro com faixa de marcas rolando.",
    category: "hero",
    build: () => [
      hero({
        title: "Creators em quem as marcas confiam",
        subtitle: "Entre para a rede e participe das campanhas das maiores marcas do país.",
        background: "#0b0b14",
        tone: "light",
        align: "center",
      }),
      marquee(["Natura", "Avon", "The Body Shop", "O Boticário", "Quem Disse, Berenice"]),
    ],
  },
  {
    id: "hero-dual",
    name: "Destaque com dois botões",
    description: "Hero com CTA principal e um botão secundário.",
    category: "hero",
    build: () => [
      hero({
        title: "Pronto para a sua próxima campanha?",
        subtitle: "Candidate-se agora ou conheça como a parceria com a marca funciona.",
        background: "#14141c",
        tone: "light",
        align: "center",
        cta: "Quero me candidatar",
      }),
      button("Como funciona", { kind: "none" }, "outline", "center"),
    ],
  },
  {
    id: "hero-collage",
    name: "Destaque com galeria",
    description: "Hero claro seguido de uma grade de imagens.",
    category: "hero",
    build: () => [
      hero({
        title: "Mostre o seu trabalho para a marca",
        subtitle: "Buscamos creators com estética própria e boas histórias para contar.",
        background: "#f4f4f5",
        tone: "dark",
        align: "center",
        cta: "Enviar candidatura",
      }),
      gallery([
        [`https://images.unsplash.com/photo-1515886657613-9f3515b0c78f${PHOTO}`, "Ensaio"],
        [`https://images.unsplash.com/photo-1524504388940-b1c1722653e1${PHOTO}`, "Bastidores"],
        [`https://images.unsplash.com/photo-1492691527719-9d1e07e534b4${PHOTO}`, "Campanha"],
      ]),
    ],
  },
  {
    id: "hero-glow",
    name: "Destaque com brilho",
    description: "Hero escuro imersivo com brilho da cor da marca.",
    category: "hero",
    build: () => [
      hero({
        title: "Faça parte de algo maior",
        subtitle: "A comunidade de creators que cresce junto com a marca.",
        background: "#09090f",
        tone: "light",
        align: "center",
        cta: "Entrar para a comunidade",
      }),
    ],
  },
  {
    id: "hero-mockup",
    name: "Destaque com mockup",
    description: "Hero com uma imagem grande de produto logo abaixo.",
    category: "hero",
    build: () => [
      hero({
        title: "O app que conecta você às marcas",
        subtitle: "Candidate-se, acompanhe campanhas e receba os seus ganhos em um só lugar.",
        background: "#101322",
        tone: "light",
        align: "center",
        cta: "Começar agora",
      }),
      image(`https://images.unsplash.com/photo-1551650975-87deedd944c3${PHOTO}`, "Prévia do painel"),
    ],
  },

  // ── Recursos (features) ───────────────────────────────────────
  {
    id: "features-3",
    name: "Benefícios 3 colunas",
    description: "Três cards de benefícios lado a lado.",
    category: "features",
    build: () => [
      features("O que você ganha", [
        ["Comissão por venda", "Ganhe a cada pedido feito com o seu cupom."],
        ["Produtos para testar", "Receba lançamentos antes de todo mundo."],
        ["Campanhas pagas", "Entre na lista de convites para campanhas."],
      ]),
    ],
  },
  {
    id: "features-tinted",
    name: "Cards destacados",
    description: "Cards com fundo tonalizado para dar relevo.",
    category: "features",
    build: (primary) => [
      features(
        "Por que participar",
        [
          ["Acesso antecipado", "Veja os lançamentos antes de irem ao ar."],
          ["Suporte dedicado", "Um time pronto para ajudar na sua criação."],
          ["Mais alcance", "Sua publi no feed oficial da marca."],
        ],
        tint(primary),
      ),
    ],
  },
  {
    id: "features-steps",
    name: "Como funciona",
    description: "Passo a passo numerado em três etapas.",
    category: "features",
    build: () => [
      features("Como funciona", [
        ["1 · Candidatura", "Conte quem você é e mostre o seu melhor conteúdo."],
        ["2 · Avaliação", "A marca olha a afinidade do seu perfil com a proposta."],
        ["3 · Parceria", "Você entra na comunidade e recebe os próximos convites."],
      ]),
    ],
  },

  {
    id: "bento-benefits",
    name: "Bento de benefícios",
    description: "Grade assimétrica de destaques, estilo Framer.",
    category: "features",
    build: () => [
      bento("Tudo o que você precisa", [
        ["Comissão por venda", "Ganhe a cada pedido feito com o seu cupom exclusivo."],
        ["Produtos para testar", "Receba os lançamentos antes de todo mundo."],
        ["Campanhas pagas", "Entre na lista de convites para campanhas."],
        ["Comunidade", "Troque ideias com outros creators e com a marca."],
      ]),
    ],
  },
  {
    id: "steps-process",
    name: "Passo a passo",
    description: "Processo numerado em três etapas.",
    category: "features",
    build: () => [
      steps("Como funciona", [
        ["Candidatura", "Conte quem você é e mostre o seu melhor conteúdo."],
        ["Avaliação", "A marca olha a afinidade do seu perfil com a proposta."],
        ["Parceria", "Você entra na comunidade e recebe os próximos convites."],
      ]),
    ],
  },

  // ── Números (stats) ───────────────────────────────────────────
  {
    id: "stats-band",
    name: "Faixa de números",
    description: "Três métricas em destaque com a cor da marca.",
    category: "stats",
    build: () => [
      stats([
        ["15%", "de comissão por venda"],
        ["+300", "creators na comunidade"],
        ["48h", "para a resposta"],
      ]),
    ],
  },
  {
    id: "stats-affiliate",
    name: "Métricas de afiliado",
    description: "Números voltados para comissão e pagamento.",
    category: "stats",
    build: () => [
      stats([
        ["até 20%", "de comissão"],
        ["Pix semanal", "pagamento dos ganhos"],
        ["R$ 0", "para começar"],
      ]),
    ],
  },

  // ── Prova social ──────────────────────────────────────────────
  {
    id: "testimonial-center",
    name: "Depoimento",
    description: "Citação centralizada com autor e função.",
    category: "social",
    build: () => [
      testimonial(
        "Entrei pela candidatura e em um mês já estava na primeira campanha paga.",
        "Letícia Prado",
        "Lifestyle · 140 mil seguidores",
      ),
    ],
  },
  {
    id: "social-proof",
    name: "Depoimento + números",
    description: "Prova social combinando citação e métricas.",
    category: "social",
    build: () => [
      testimonial(
        "A parceria respeita o meu ritmo e o conteúdo continua sendo meu.",
        "Carolina Souza",
        "Bem-estar · 60 mil seguidores",
      ),
      stats([
        ["4,9", "avaliação das marcas"],
        ["+300", "creators ativos"],
        ["12 meses", "de parceria média"],
      ]),
    ],
  },

  {
    id: "marquee-brands",
    name: "Faixa rolante",
    description: "Nomes ou marcas rolando em loop contínuo.",
    category: "social",
    build: () => [marquee(["Creators", "Comunidade", "Campanhas pagas", "Afiliados", "Produtos", "Lançamentos"])],
  },

  // ── FAQ ───────────────────────────────────────────────────────
  {
    id: "faq-basic",
    name: "Perguntas frequentes",
    description: "Lista de dúvidas e respostas.",
    category: "faq",
    build: () => [
      faq("Perguntas frequentes", [
        ["Preciso ter muitos seguidores?", "Não. Olhamos a afinidade do seu conteúdo com a marca antes do tamanho da audiência."],
        ["Quando recebo a resposta?", "A marca avalia as candidaturas em até dois dias úteis."],
        ["É gratuito?", "Sim. A candidatura é gratuita e sem compromisso."],
      ]),
    ],
  },

  // ── Chamada (CTA) ─────────────────────────────────────────────
  {
    id: "cta-band",
    name: "Chamada final",
    description: "Título, texto e botão para fechar a página.",
    category: "cta",
    build: () => [
      heading("Pronto para começar?", "center", "lg"),
      paragraph("Envie a sua candidatura agora e entre para a próxima campanha.", "center"),
      button("Quero me candidatar", { kind: "form" }),
    ],
  },
  {
    id: "cta-button",
    name: "Botão de ação",
    description: "Um botão isolado que abre o formulário.",
    category: "cta",
    build: () => [button("Quero me candidatar", { kind: "form" })],
  },
  {
    id: "cta-outline",
    name: "Botão de contorno",
    description: "Botão secundário com estilo de contorno.",
    category: "cta",
    build: () => [button("Saber mais", { kind: "none" }, "outline")],
  },
  {
    id: "announcement-bar",
    name: "Barra de aviso",
    description: "Faixa fina no topo com aviso e link.",
    category: "cta",
    build: () => [announcement("Inscrições abertas por tempo limitado", "Participar", "#18181b", "light")],
  },

  // ── Conteúdo ──────────────────────────────────────────────────
  {
    id: "content-heading-text",
    name: "Título + texto",
    description: "Um bloco de título com parágrafo de apoio.",
    category: "content",
    build: () => [
      heading("O que procuramos", "left", "lg"),
      paragraph(
        "Creators que pensam a estética do próprio conteúdo e sabem transformar um produto em história.",
        "left",
      ),
    ],
  },
  {
    id: "content-divider",
    name: "Divisor",
    description: "Uma linha para separar seções.",
    category: "content",
    build: () => [divider()],
  },
  {
    id: "content-spacer",
    name: "Espaço",
    description: "Um respiro vertical entre blocos.",
    category: "content",
    build: () => [spacer("lg")],
  },

  // ── Mídia ─────────────────────────────────────────────────────
  {
    id: "media-image",
    name: "Imagem com legenda",
    description: "Uma imagem larga com legenda opcional.",
    category: "media",
    build: () => [
      image(`https://images.unsplash.com/photo-1515378791036-0648a3ef77b2${PHOTO}`, "Bastidores da campanha"),
    ],
  },
  {
    id: "media-gallery",
    name: "Dupla de imagens",
    description: "Duas imagens em sequência para contar uma história.",
    category: "media",
    build: () => [
      image(`https://images.unsplash.com/photo-1542744173-8e7e53415bb0${PHOTO}`, "Antes"),
      image(`https://images.unsplash.com/photo-1522202176988-66273c2fd55f${PHOTO}`, "Depois"),
    ],
  },
  {
    id: "media-gallery-grid",
    name: "Galeria",
    description: "Grade de imagens para bastidores e ensaios.",
    category: "media",
    build: () => [
      gallery([
        [`https://images.unsplash.com/photo-1515886657613-9f3515b0c78f${PHOTO}`, "Bastidores"],
        [`https://images.unsplash.com/photo-1524504388940-b1c1722653e1${PHOTO}`, "Ensaio"],
        [`https://images.unsplash.com/photo-1492691527719-9d1e07e534b4${PHOTO}`, "Campanha"],
      ]),
    ],
  },

  // ── Conversão ─────────────────────────────────────────────────
  {
    id: "conversion-form",
    name: "Formulário",
    description: "O formulário de candidatura da campanha.",
    category: "conversion",
    build: () => [form()],
  },
]

function tint(primary: string): ListAppearance {
  // Soft hex tints derived from the brand color (stay editable in color pickers).
  return { background: blend(primary, 0.92), color: "#18181b", border: blend(primary, 0.78) }
}

function blend(hex: string, whiteRatio: number) {
  const value = hex.replace("#", "")
  if (value.length !== 6) return "#f4f4f5"
  const mix = (start: number) => Math.round(start + (255 - start) * whiteRatio)
  const r = mix(parseInt(value.slice(0, 2), 16))
  const g = mix(parseInt(value.slice(2, 4), 16))
  const b = mix(parseInt(value.slice(4, 6), 16))
  const toHex = (n: number) => n.toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
