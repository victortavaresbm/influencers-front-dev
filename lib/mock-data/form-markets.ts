import {
  defaultTheme,
  fieldBlock,
  item,
  uid,
  type FormSite,
  type SiteBlock,
  type SitePage,
} from "@/lib/mock-data/form-site"
import type { FormQuestion } from "@/lib/mock-data/forms"

export type MarketVariation = "quiz" | "application" | "capture"

export interface MarketTemplate {
  id: string
  market: string
  variation: MarketVariation
  tagline: string
  accent: string
  build: () => { site: FormSite; questions: FormQuestion[] }
}

interface MarketCopy {
  id: string
  name: string
  accent: string
  background: string
  font: string
  headline: string
  sub: string
  offers: [string, string][]
  quiz: { title: string; options: string[] }[]
  niche: string[]
  why: string
}

const MARKETS: MarketCopy[] = [
  {
    id: "beleza",
    name: "Beleza",
    accent: "#be185d",
    background: "#fff7f9",
    font: "Fraunces",
    headline: "Sua rotina de pele, com a cara da marca.",
    sub: "Estamos escolhendo creators de beleza para a próxima temporada. Conte como você fala de cuidado.",
    offers: [
      ["Produto para testar", "Receba o lançamento antes de gravar."],
      ["Roteiro curto", "Três cenas. Nada de texto engessado."],
      ["Comissão no link", "Cada venda com o seu cupom volta para você."],
    ],
    quiz: [
      { title: "O que você mais mostra?", options: ["Skincare", "Maquiagem", "Cabelo", "Bem-estar"] },
      { title: "Onde o conteúdo acontece?", options: ["Penteadeira", "Banheiro", "Rua", "Estúdio"] },
      { title: "Seu tom de voz", options: ["Tutorial", "Resenha honesta", "Rotina real", "Humor"] },
    ],
    niche: ["Skincare", "Maquiagem", "Cabelo", "Bem-estar"],
    why: "Por que a sua rotina combina com esta marca?",
  },
  {
    id: "moda",
    name: "Moda",
    accent: "#18181b",
    background: "#fafafa",
    font: "Newsreader",
    headline: "Vista a coleção do seu jeito.",
    sub: "Um funil para creators de moda que mostram look, caimento e o dia em que a peça foi usada.",
    offers: [
      ["Look da coleção", "Você escolhe as peças dentro do briefing."],
      ["Publicação livre", "Reels, TikTok ou fotos. O formato é seu."],
      ["Cupom exclusivo", "Sua audiência compra com o seu código."],
    ],
    quiz: [
      { title: "Qual é o seu estilo?", options: ["Alfaiataria", "Casual", "Street", "Festa"] },
      { title: "Como você apresenta a roupa?", options: ["Provador", "Look do dia", "Costura", "Editorial"] },
      { title: "O público compra mais", options: ["Básicos", "Tendência", "Acessórios", "Alfaiataria"] },
    ],
    niche: ["Alfaiataria", "Casual", "Street", "Festa"],
    why: "Como você vestiria esta coleção no seu conteúdo?",
  },
  {
    id: "fitness",
    name: "Fitness",
    accent: "#15803d",
    background: "#f4fbf6",
    font: "Outfit",
    headline: "Treino de verdade, produto de verdade.",
    sub: "Creators de treino e nutrição para mostrar o produto dentro da rotina, não num anúncio solto.",
    offers: [
      ["Kit de treino", "Use o produto nas séries que você já grava."],
      ["Desafio de 7 dias", "Uma série curta, com começo e fim."],
      ["Resultado visível", "Antes e depois sem promessa milagrosa."],
    ],
    quiz: [
      { title: "Qual treino você conduz?", options: ["Musculação", "Corrida", "Casa", "Yoga"] },
      { title: "O que a audiência pede?", options: ["Treino", "Dieta", "Recuperação", "Motivação"] },
      { title: "Onde você grava?", options: ["Academia", "Parque", "Sala", "Estúdio"] },
    ],
    niche: ["Musculação", "Corrida", "Casa", "Yoga"],
    why: "Como o produto entra no treino que você já mostra?",
  },
  {
    id: "gastronomia",
    name: "Gastronomia",
    accent: "#c2410c",
    background: "#fff8f3",
    font: "Fraunces",
    headline: "Uma receita, um produto, uma mesa.",
    sub: "Para quem cozinha de verdade e indica o que usou — da despensa ao prato pronto.",
    offers: [
      ["Ingredientes", "Receba o que vai aparecer na receita."],
      ["Receita sua", "O roteiro é o seu, com o produto no passo certo."],
      ["Link na descrição", "Quem quiser reproduzir compra por você."],
    ],
    quiz: [
      { title: "O que você cozinha?", options: ["Dia a dia", "Sobremesa", "Churrasco", "Fit"] },
      { title: "O formato preferido", options: ["Receita rápida", "ASMR", "Review", "Mesa posta"] },
      { title: "Onde a receita acontece?", options: ["Cozinha de casa", "Restaurante", "Ar livre", "Estúdio"] },
    ],
    niche: ["Dia a dia", "Sobremesa", "Churrasco", "Fit"],
    why: "Qual receita você faria com este produto?",
  },
  {
    id: "tecnologia",
    name: "Tecnologia",
    accent: "#0086ff",
    background: "#f5f9ff",
    font: "IBM Plex Sans",
    headline: "Mostre o produto funcionando.",
    sub: "Creators de tech para unboxing, review e o uso real — tela, setup e o problema que o produto resolve.",
    offers: [
      ["Unidade para review", "Teste antes de publicar."],
      ["Pontos do briefing", "Três funções obrigatórias, o resto é seu."],
      ["Link rastreado", "A venda volta para o seu painel."],
    ],
    quiz: [
      { title: "O que você cobre?", options: ["Celular", "Setup", "Casa conectada", "Games"] },
      { title: "Como você explica?", options: ["Review longo", "Shorts", "Comparativo", "Tutorial"] },
      { title: "Seu público decide por", options: ["Preço", "Câmera", "Bateria", "Design"] },
    ],
    niche: ["Celular", "Setup", "Casa conectada", "Games"],
    why: "Qual teste você faria no primeiro vídeo?",
  },
  {
    id: "casa",
    name: "Casa",
    accent: "#0f766e",
    background: "#f4fbfa",
    font: "Newsreader",
    headline: "A casa real, com o produto dentro dela.",
    sub: "Decoração, organização e reforma pequena. O funil escolhe quem mostra o ambiente de verdade.",
    offers: [
      ["Peça para o ambiente", "Use no cômodo que você já filma."],
      ["Antes e depois", "Um corte, um resultado, um link."],
      ["Cupom da casa", "A audiência monta o mesmo canto."],
    ],
    quiz: [
      { title: "Qual canto você mais mostra?", options: ["Sala", "Cozinha", "Quarto", "Varanda"] },
      { title: "Seu tipo de conteúdo", options: ["Decoração", "Organização", "Reforma", "DIY"] },
      { title: "O imóvel é", options: ["Apartamento", "Casa", "Alugado", "Estúdio"] },
    ],
    niche: ["Decoração", "Organização", "Reforma", "DIY"],
    why: "Qual canto da casa você transformaria?",
  },
  {
    id: "maternidade",
    name: "Maternidade",
    accent: "#db2777",
    background: "#fff7fb",
    font: "Fraunces",
    headline: "A rotina com filho, sem pose.",
    sub: "Creators que mostram o cuidado real — o que entra em casa e o que funciona no dia corrido.",
    offers: [
      ["Produto para testar em casa", "Use na rotina que você já conta."],
      ["Sem roteiro de comercial", "Fale como você fala com quem te acompanha."],
      ["Indicação com link", "Quem se identificar compra por você."],
    ],
    quiz: [
      { title: "A fase que você vive", options: ["Gestação", "Bebê", "Criança", "Rotina familiar"] },
      { title: "O que você mais indica", options: ["Cuidado", "Organização", "Alimentação", "Brincar"] },
      { title: "Quando você grava", options: ["Manhã", "Soneca", "Noite", "Fim de semana"] },
    ],
    niche: ["Gestação", "Bebê", "Criança", "Rotina familiar"],
    why: "Como este produto entra no seu dia com a criança?",
  },
  {
    id: "viagem",
    name: "Viagem",
    accent: "#0369a1",
    background: "#f4f9fc",
    font: "Outfit",
    headline: "O destino, com o que você levou na mala.",
    sub: "Para creators que mostram o caminho e indicam o que realmente usaram na viagem.",
    offers: [
      ["Item da mala", "Leve o produto no próximo roteiro."],
      ["Diário de bordo", "Um vídeo por etapa da viagem."],
      ["Link na legenda", "Quem for repetir o roteiro compra por você."],
    ],
    quiz: [
      { title: "Que viagem você faz?", options: ["Cidade", "Praia", "Trilha", "Roteiro em família"] },
      { title: "O formato", options: ["Vlog", "Dica rápida", "Hotel", "Roteiro salvo"] },
      { title: "O público viaja para", options: ["Descansar", "Comer", "Trabalhar remoto", "Aventura"] },
    ],
    niche: ["Cidade", "Praia", "Trilha", "Família"],
    why: "Em que momento da viagem o produto aparece?",
  },
]

function question(partial: Omit<FormQuestion, "id">): FormQuestion {
  return { id: uid("q"), ...partial }
}

function banner(market: MarketCopy, nextPageId: string): SiteBlock {
  return {
    id: uid("blk"),
    type: "banner",
    title: market.headline,
    subtitle: market.sub,
    image: "",
    background: market.accent,
    tone: "light",
    align: "left",
    ctaLabel: "Quero participar",
    action: { kind: "page", pageId: nextPageId },
  }
}

function offers(market: MarketCopy): SiteBlock {
  return {
    id: uid("blk"),
    type: "features",
    title: "O que você recebe",
    items: market.offers.map(([title, text]) => item(title, text)),
  }
}

function continueButton(label: string, pageId: string, emoji?: string): SiteBlock {
  return { id: uid("blk"), type: "button", label, emoji, style: "solid", align: "center", action: { kind: "page", pageId } }
}

function thanksPage(id: string, name: string, title: string, body: string): SitePage {
  return {
    id,
    name,
    kind: "thanks",
    final: true,
    blocks: [
      { id: uid("blk"), type: "spacer", size: "lg" },
      { id: uid("blk"), type: "heading", text: title, size: "lg", align: "center" },
      { id: uid("blk"), type: "text", text: body, align: "center" },
      { id: uid("blk"), type: "spacer", size: "lg" },
    ],
  }
}

function themeFor(market: MarketCopy) {
  const theme = defaultTheme(market.accent)
  theme.background = market.background
  theme.heading.font = market.font
  theme.body.font = "Inter"
  return theme
}

function assemble(market: MarketCopy, pages: SitePage[], entryId: string, fallbackId: string, rules: FormSite["rules"]): FormSite {
  return { entryPageId: entryId, fallbackPageId: fallbackId, rules, theme: themeFor(market), pages }
}

function quiz(market: MarketCopy) {
  const questions = market.quiz.map((step) =>
    question({ type: "single_choice", title: step.title, required: true, options: step.options }),
  )
  const entryId = uid("pg")
  const stepIds = questions.map(() => uid("pg"))
  const matchId = uid("pg")
  const thanksId = uid("pg")
  const landing: SitePage = { id: entryId, name: "Início", kind: "landing", blocks: [banner(market, stepIds[0]), offers(market)] }
  const steps: SitePage[] = questions.map((itemQuestion, index) => ({
    id: stepIds[index],
    name: `Pergunta ${index + 1}`,
    kind: "form",
    blocks: [
      { id: uid("blk"), type: "heading", text: itemQuestion.title, size: "md", align: "left" },
      fieldBlock(itemQuestion.id),
      continueButton(index === questions.length - 1 ? "Ver resultado" : "Continuar", index === questions.length - 1 ? thanksId : stepIds[index + 1]),
    ],
  }))
  const last = questions[questions.length - 1]
  const ideal = last?.options?.[0] ?? ""
  return {
    questions,
    site: assemble(
      market,
      [
        landing,
        ...steps,
        thanksPage(matchId, "Afinidade alta", "Seu conteúdo tem a cara desta marca.", "Você entrou na fila prioritária. A equipe retorna pela plataforma."),
        thanksPage(thanksId, "Obrigado", "Recebemos as suas respostas.", "A marca avalia o seu perfil e fala com você pela plataforma."),
      ],
      entryId,
      thanksId,
      ideal && last ? [{ id: uid("rule"), condition: { kind: "answer", questionId: last.id, value: ideal }, pageId: matchId }] : [],
    ),
  }
}

function application(market: MarketCopy) {
  const questions = [
    question({ type: "short_text", title: "Como você se apresenta?", required: true }),
    question({ type: "email", title: "Seu e-mail", required: true }),
    question({ type: "single_choice", title: "Seu foco de conteúdo", required: true, options: market.niche }),
    question({ type: "long_text", title: market.why, required: true }),
  ]
  const entryId = uid("pg")
  const formId = uid("pg")
  const thanksId = uid("pg")
  return {
    questions,
    site: assemble(
      market,
      [
        { id: entryId, name: "Início", kind: "landing", blocks: [banner(market, formId), offers(market)] },
        {
          id: formId,
          name: "Candidatura",
          kind: "form",
          blocks: [
            { id: uid("blk"), type: "heading", text: "Sua candidatura", size: "md", align: "left" },
            ...questions.map((itemQuestion) => fieldBlock(itemQuestion.id)),
            continueButton("Enviar candidatura", thanksId, "🚀"),
          ],
        },
        thanksPage(thanksId, "Obrigado", "Candidatura enviada.", "A marca avalia o seu perfil e retorna pela plataforma."),
      ],
      entryId,
      thanksId,
      [],
    ),
  }
}

function capture(market: MarketCopy) {
  const questions = [
    question({ type: "short_text", title: "Seu nome", required: true }),
    question({ type: "email", title: "Seu e-mail", required: true }),
    question({ type: "phone", title: "WhatsApp", required: false }),
  ]
  const entryId = uid("pg")
  const formId = uid("pg")
  const thanksId = uid("pg")
  return {
    questions,
    site: assemble(
      market,
      [
        { id: entryId, name: "Início", kind: "landing", blocks: [banner(market, formId), offers(market)] },
        {
          id: formId,
          name: "Cadastro",
          kind: "form",
          blocks: [
            { id: uid("blk"), type: "heading", text: "Receba o convite", size: "md", align: "left" },
            { id: uid("blk"), type: "text", text: "Deixe seu contato. A marca avisa quando abrir a próxima turma.", align: "left" },
            ...questions.map((itemQuestion) => fieldBlock(itemQuestion.id)),
            continueButton("Quero o convite", thanksId),
          ],
        },
        thanksPage(thanksId, "Obrigado", "Você está na lista.", "O convite chega no e-mail quando a próxima turma abrir."),
      ],
      entryId,
      thanksId,
      [],
    ),
  }
}

const VARIATIONS: { id: MarketVariation; tagline: (market: MarketCopy) => string; build: (market: MarketCopy) => { site: FormSite; questions: FormQuestion[] } }[] = [
  { id: "quiz", tagline: (market) => `Três perguntas para achar creators de ${market.name.toLowerCase()} com afinidade.`, build: quiz },
  { id: "application", tagline: (market) => `Candidatura completa para uma campanha de ${market.name.toLowerCase()}.`, build: application },
  { id: "capture", tagline: (market) => `Nome, e-mail e WhatsApp para a lista de ${market.name.toLowerCase()}.`, build: capture },
]

export const MARKET_TEMPLATES: MarketTemplate[] = MARKETS.flatMap((market) =>
  VARIATIONS.map((variation) => ({
    id: `${market.id}-${variation.id}`,
    market: market.name,
    variation: variation.id,
    tagline: variation.tagline(market),
    accent: market.accent,
    build: () => variation.build(market),
  })),
)

export const MARKET_NAMES = MARKETS.map((market) => market.name)
