export interface BriefingVersion {
  version: number
  createdAt: string
  createdBy: string
  summary: string
  requiresReAcceptance?: boolean
}

export interface BriefingAcceptance {
  creatorId: string
  creatorName: string
  status: "pending" | "accepted" | "re_acceptance_required"
  acceptedAt?: string
  version: number
}

export interface Briefing {
  id: string
  type: "brand" | "campaign"
  organizationId: string
  status: "rascunho" | "publicado" | "arquivado"

  // Brand briefing only
  scope?: string

  // Campaign briefing only
  campaignId?: string
  campaignName?: string
  brandBriefingId?: string
  brandBriefingTitle?: string
  deliverables?: { type: string; quantity: number; deadline: string; notes: string }[]
  approvalDeadline?: string
  publicationWindow?: string
  acceptances?: BriefingAcceptance[]

  // Common
  title: string
  objective: string
  targetAudience: string
  keyMessages: string[]
  doList: string[]
  dontList: string[]
  toneOfVoice: string
  mandatoryElements: string[]
  inspirationLinks: string[]

  currentPublishedVersion?: number
  versions: BriefingVersion[]
  createdAt: string
  updatedAt: string
}

export const BRIEFINGS: Briefing[] = [
  // ── BRAND BRIEFINGS ────────────────────────────────────────────
  {
    id: "bb1",
    type: "brand",
    organizationId: "org1",
    status: "publicado",
    scope: "Identidade Geral",
    title: "Guia de Marca Natura — Identidade Geral",
    objective:
      "Orientar todos os creators e afiliados parceiros sobre como comunicar a Natura de forma autêntica, respeitando os valores de bem-estar, sustentabilidade e conexão com a natureza.",
    targetAudience:
      "Mulheres e homens de 22 a 45 anos, com interesse em beleza natural, cuidados pessoais sustentáveis e bem-estar.",
    keyMessages: [
      "Natura acredita que a beleza que transforma é a que conecta as pessoas à natureza e entre si",
      "Ingredientes brasileiros com ciência e respeito à biodiversidade",
      "Bem estar bem: beleza que faz bem para quem usa e para o mundo",
    ],
    doList: [
      "Falar com autenticidade — conte sua história real com a marca",
      "Mostrar o produto em uso no cotidiano, de forma natural",
      "Valorizar a origem dos ingredientes brasileiros",
      "Usar tons visuais terrosos, verdes e naturais quando possível",
      "Referenciar a preocupação ambiental da marca quando pertinente",
    ],
    dontList: [
      "Não comparar com outras marcas de beleza",
      "Não fazer promessas médicas ou terapêuticas",
      "Não usar filtros excessivos que alterem a aparência dos produtos",
      "Não publicar em contextos de conflito político ou tragédias",
      "Não associar a marca a conteúdo de cunho sexual",
    ],
    toneOfVoice:
      "Caloroso, genuíno e consciente. A Natura fala com proximidade, como uma amiga que sabe o que é bom e cuida. Sem exageros, sem superlativos vazios. Preferir verbos de ação e sentimento a adjetivos.",
    mandatoryElements: ["@naturabrasil", "#BemEstarBem"],
    inspirationLinks: [
      "https://www.instagram.com/naturabrasil",
      "https://www.natura.com.br",
    ],
    currentPublishedVersion: 2,
    versions: [
      { version: 1, createdAt: "2026-07-01", createdBy: "Ana Beatriz Lima", summary: "Versão inicial do guia de marca" },
      { version: 2, createdAt: "2026-09-05", createdBy: "Ana Beatriz Lima", summary: "Atualização do tom de voz e adição de restrições visuais", requiresReAcceptance: false },
    ],
    createdAt: "2026-07-01",
    updatedAt: "2026-09-05",
  },
  {
    id: "bb2",
    type: "brand",
    organizationId: "org1",
    status: "publicado",
    scope: "Linha Ekos",
    title: "Guia de Marca Natura — Linha Ekos",
    objective:
      "Posicionar a linha Ekos como referência em beleza com ingredientes amazônicos, sustentabilidade e eficácia comprovada.",
    targetAudience:
      "Mulheres de 25 a 42 anos apaixonadas por skincare, sustentabilidade e cultura brasileira.",
    keyMessages: [
      "Ingredientes 100% naturais da Amazônia, com manejo sustentável",
      "Embalagem refil reduz plástico em até 70%",
      "Eficácia dermatologicamente comprovada",
    ],
    doList: [
      "Mostrar a textura e aplicação dos produtos em detalhes",
      "Falar sobre a origem dos ingredientes (ex: murmuru, tucumã, buriti)",
      "Integrar o produto à rotina de skincare real",
      "Usar a hashtag #NaturaEkos e #BelezaAmazônica",
    ],
    dontList: [
      "Não misturar Ekos com outras linhas da Natura no mesmo conteúdo",
      "Não fazer comparações com produtos internacionais",
      "Não prometer resultados em prazo determinado",
    ],
    toneOfVoice:
      "Sensorial e educativo. O creator deve transmitir a experiência de usar o produto — cheiro, textura, sensação — e conectar com a riqueza natural brasileira.",
    mandatoryElements: ["#NaturaEkos", "#BelezaAmazônica", "@naturabrasil"],
    inspirationLinks: ["Referência visual: tons terrosos, verde-natureza, branco"],
    currentPublishedVersion: 1,
    versions: [
      { version: 1, createdAt: "2026-08-10", createdBy: "Ana Beatriz Lima", summary: "Versão inicial do guia Ekos" },
    ],
    createdAt: "2026-08-10",
    updatedAt: "2026-08-10",
  },
  {
    id: "bb3",
    type: "brand",
    organizationId: "org2",
    status: "publicado",
    scope: "Identidade Geral",
    title: "Guia de Marca Magazine Luiza — Identidade Geral",
    objective:
      "Orientar creators e afiliados sobre como representar a Magalu de forma energética, confiável e orientada a resultados — sempre com CTA claro e foco em conversão.",
    targetAudience:
      "Brasileiros de 18 a 45 anos que compram online, buscando preço, praticidade e entrega rápida.",
    keyMessages: [
      "Magalu tem o menor preço e entrega rápida em todo o Brasil",
      "App Magalu: a forma mais fácil de comprar",
      "Parcelamento em até 12x sem juros",
    ],
    doList: [
      "Sempre incluir CTA claro para o app ou link de afiliado",
      "Mostrar o produto de forma empolgante com destaque no preço",
      "Usar o cupom de desconto exclusivo em destaque",
      "Incentivar o download do app Magalu",
    ],
    dontList: [
      "Não mostrar preços desatualizados sem confirmar",
      "Não prometer frete grátis sem verificar condições",
      "Não comparar com Amazon, Mercado Livre ou outros e-commerces",
    ],
    toneOfVoice:
      "Energético, direto e confiável. A Lu fala com todo mundo. CTA sempre presente. Linguagem acessível, sem tecnicismos.",
    mandatoryElements: ["#Magalu", "@magazineluiza", "Link de afiliado no caption"],
    inspirationLinks: ["https://www.instagram.com/magazineluiza"],
    currentPublishedVersion: 1,
    versions: [
      { version: 1, createdAt: "2026-08-20", createdBy: "Carlos Mendes", summary: "Versão inicial" },
    ],
    createdAt: "2026-08-20",
    updatedAt: "2026-08-20",
  },
  {
    id: "bb4",
    type: "brand",
    organizationId: "org3",
    status: "rascunho",
    scope: "Identidade Geral",
    title: "Guia de Marca iFood — Identidade Geral",
    objective:
      "Estabelecer diretrizes de comunicação para creators parceiros do iFood, focando em apetite, conveniência e celebração da culinária brasileira.",
    targetAudience: "Brasileiros de 18 a 40 anos que pedem comida online regularmente.",
    keyMessages: [
      "iFood traz o restaurante favorito até você",
      "Mais de 300 mil restaurantes no app",
      "Entrega rápida, pagamento fácil",
    ],
    doList: [
      "Mostrar o unboxing do pedido de forma apetitosa",
      "Falar sobre a conveniência e rapidez da entrega",
      "Referenciar restaurantes e culinárias regionais",
    ],
    dontList: [
      "Não mostrar comida fria ou com aparência ruim",
      "Não mencionar concorrentes como Rappi ou Uber Eats",
    ],
    toneOfVoice:
      "Descontraído, apetitoso e celebratório. O iFood é sobre prazer, não sobre dieta. Linguagem jovem e inclusiva.",
    mandatoryElements: ["#iFood", "@ifoodbr"],
    inspirationLinks: [],
    currentPublishedVersion: undefined,
    versions: [
      { version: 1, createdAt: "2026-10-01", createdBy: "Fernanda Costa", summary: "Rascunho inicial — aguardando aprovação interna" },
    ],
    createdAt: "2026-10-01",
    updatedAt: "2026-10-01",
  },

  // ── CAMPAIGN BRIEFINGS ────────────────────────────────────────
  {
    id: "b1",
    type: "campaign",
    organizationId: "org1",
    status: "publicado",
    campaignId: "camp1",
    campaignName: "Natura Ekos — Lançamento Coleção Primavera",
    brandBriefingId: "bb2",
    brandBriefingTitle: "Guia de Marca Natura — Linha Ekos",
    title: "Briefing — Natura Ekos Coleção Primavera 2026",
    objective:
      "Apresentar a nova linha Ekos com ingredientes da Amazônia, destacando a sustentabilidade e eficácia dos produtos. O creator deve transmitir autenticidade e conexão com a natureza.",
    targetAudience:
      "Mulheres de 22 a 40 anos, interessadas em beleza natural, skincare e sustentabilidade. Preferencialmente residentes em capitais brasileiras.",
    keyMessages: [
      "Ingredientes 100% naturais da Amazônia",
      "Embalagem refil sustentável",
      "Eficácia comprovada dermatologicamente",
      "Biodiversidade brasileira valorizada",
    ],
    doList: [
      "Mostrar a textura e a aplicação do produto",
      "Mencionar o cheiro e a sensação na pele",
      "Usar os produtos no rosto ou no corpo de forma natural",
      "Integrar o produto à sua rotina real",
      "Usar a hashtag #NaturaEkos e mencionar @naturabrasil",
    ],
    dontList: [
      "Não comparar com produtos concorrentes",
      "Não fazer promessas médicas ou terapêuticas",
      "Não usar filtros excessivos que alterem a cor do produto",
      "Não publicar em dias de crise ou tragédias nacionais",
    ],
    toneOfVoice:
      "Autêntico, caloroso e consciente. A comunicação deve ser próxima e genuína, sem exageros ou superlativos vazios.",
    deliverables: [
      { type: "Reels Instagram", quantity: 2, deadline: "2026-10-20", notes: "Mínimo 30s, máximo 90s. Mostrar aplicação e resultado." },
      { type: "Stories Instagram", quantity: 5, deadline: "2026-10-22", notes: "Incluir sticker de link para o e-commerce. 1 story com enquete." },
    ],
    mandatoryElements: ["#NaturaEkos", "#BelezaAmazônica", "#NaturaEkos2026", "@naturabrasil", "Cupom desconto visível"],
    inspirationLinks: ["https://www.instagram.com/naturabrasil", "Referência visual: tons terrosos, verde-natureza, branco"],
    approvalDeadline: "2026-10-15",
    publicationWindow: "01/10/2026 a 30/11/2026",
    acceptances: [
      { creatorId: "c1", creatorName: "Bianca Torres", status: "accepted", acceptedAt: "2026-09-25", version: 3 },
      { creatorId: "c3", creatorName: "Carolina Silva", status: "accepted", acceptedAt: "2026-09-26", version: 3 },
      { creatorId: "c5", creatorName: "Felipe Costa", status: "pending", version: 3 },
      { creatorId: "c13", creatorName: "Henrique Campos", status: "pending", version: 3 },
    ],
    currentPublishedVersion: 3,
    versions: [
      { version: 1, createdAt: "2026-09-10", createdBy: "Ana Beatriz Lima", summary: "Versão inicial do briefing" },
      { version: 2, createdAt: "2026-09-16", createdBy: "Ana Beatriz Lima", summary: "Adicionados itens na lista de DOs e revisados os hashtags obrigatórios", requiresReAcceptance: false },
      { version: 3, createdAt: "2026-09-22", createdBy: "Ana Beatriz Lima", summary: "Inclusão da janela de publicação e ajuste no prazo de aprovação", requiresReAcceptance: true },
    ],
    createdAt: "2026-09-10",
    updatedAt: "2026-09-22",
  },
  {
    id: "b2",
    type: "campaign",
    organizationId: "org2",
    status: "publicado",
    campaignId: "camp2",
    campaignName: "Tech Week — Semana de Tecnologia Magalu",
    brandBriefingId: "bb3",
    brandBriefingTitle: "Guia de Marca Magazine Luiza — Identidade Geral",
    title: "Briefing — Tech Week Magalu 2026",
    objective:
      "Apresentar as melhores ofertas de tecnologia da Tech Week Magalu, incentivando o download do app e a compra via link/cupom de afiliado.",
    targetAudience:
      "Homens e mulheres de 18 a 35 anos, interessados em tecnologia, gadgets e games.",
    keyMessages: [
      "Preços imbatíveis na Tech Week",
      "App Magalu com ofertas exclusivas",
      "Entrega rápida em todo o Brasil",
      "Parcelamento em até 12x sem juros",
    ],
    doList: [
      "Mostrar o produto desejado de forma empolgante",
      "Destacar o desconto e o preço",
      "Direcionar para o app com CTA claro",
      "Usar o cupom de desconto exclusivo",
    ],
    dontList: [
      "Não mostrar preços incorretos",
      "Não prometer frete grátis sem confirmar condições",
      "Não comparar com Amazon ou outros e-commerces",
    ],
    toneOfVoice:
      "Energético, direto e confiável. Estamos na maior semana de tech do ano! CTA sempre presente.",
    deliverables: [
      { type: "Video YouTube", quantity: 1, deadline: "2026-11-08", notes: "Mínimo 5 minutos. Review + unboxing de produto." },
      { type: "Reels Instagram", quantity: 1, deadline: "2026-11-09", notes: "60s máximo. Destaque da oferta mais impactante." },
    ],
    mandatoryElements: ["#TechWeekMagalu", "#Magalu", "@magazineluiza", "Cupom e link de afiliado no caption e na bio"],
    inspirationLinks: [],
    approvalDeadline: "2026-11-05",
    publicationWindow: "10/11/2026 a 17/11/2026",
    acceptances: [
      { creatorId: "c4", creatorName: "Larissa Oliveira", status: "accepted", acceptedAt: "2026-10-20", version: 1 },
      { creatorId: "c6", creatorName: "Rafaela Nunes", status: "re_acceptance_required", version: 1 },
      { creatorId: "c8", creatorName: "Thiago Rodrigues", status: "pending", version: 1 },
      { creatorId: "c1", creatorName: "Bianca Torres", status: "accepted", acceptedAt: "2026-10-21", version: 1 },
    ],
    currentPublishedVersion: 1,
    versions: [
      { version: 1, createdAt: "2026-10-12", createdBy: "Carlos Mendes", summary: "Versão inicial", requiresReAcceptance: true },
    ],
    createdAt: "2026-10-12",
    updatedAt: "2026-10-12",
  },
  {
    id: "b3",
    type: "campaign",
    organizationId: "org3",
    status: "publicado",
    campaignId: "camp3",
    campaignName: "iFood — Sabores do Brasil",
    title: "Briefing — iFood Sabores do Brasil",
    objective:
      "Celebrar a diversidade gastronômica brasileira através de pedidos no iFood, incentivando os seguidores a descobrirem restaurantes regionais no app.",
    targetAudience: "Brasileiros de 18 a 38 anos que amam gastronomia e cultura regional.",
    keyMessages: [
      "O Brasil tem sabores únicos — encontre todos no iFood",
      "Descubra restaurantes regionais perto de você",
      "Peça agora e receba em minutos",
    ],
    doList: [
      "Mostrar o unboxing do pedido de forma apetitosa",
      "Falar sobre a culinária regional escolhida",
      "Usar o cupom exclusivo da campanha",
      "Referenciar o restaurante e sua cozinha",
    ],
    dontList: [
      "Não mostrar comida fria ou com aparência ruim",
      "Não mencionar Rappi, Uber Eats ou concorrentes",
      "Não fazer conteúdo em horários de baixo apetite (logo após acordar)",
    ],
    toneOfVoice:
      "Descontraído, apetitoso e celebratório. Transmitir prazer e descoberta gastronômica.",
    deliverables: [
      { type: "Reels Instagram", quantity: 2, deadline: "2026-11-15", notes: "Mostrar pedido chegando + prova. 60s máx." },
      { type: "TikTok", quantity: 1, deadline: "2026-11-15", notes: "Tendência de culinária regional. Usar áudio trend." },
    ],
    mandatoryElements: ["#SaboresDoiFood", "#iFood", "@ifoodbr", "Cupom no caption"],
    inspirationLinks: [],
    approvalDeadline: "2026-11-10",
    publicationWindow: "15/11/2026 a 30/11/2026",
    acceptances: [
      { creatorId: "c7", creatorName: "Mariana Pereira", status: "accepted", acceptedAt: "2026-10-28", version: 1 },
      { creatorId: "c2", creatorName: "Pedro Alves", status: "pending", version: 1 },
    ],
    currentPublishedVersion: 1,
    versions: [
      { version: 1, createdAt: "2026-10-15", createdBy: "Fernanda Costa", summary: "Versão inicial", requiresReAcceptance: true },
    ],
    createdAt: "2026-10-15",
    updatedAt: "2026-10-15",
  },
  {
    id: "b4",
    type: "campaign",
    organizationId: "org1",
    status: "rascunho",
    campaignId: "camp4",
    campaignName: "Natura Chronos — Skincare Anti-Idade",
    brandBriefingId: "bb1",
    brandBriefingTitle: "Guia de Marca Natura — Identidade Geral",
    title: "Briefing — Natura Chronos Anti-Idade 2026",
    objective:
      "Apresentar a linha Chronos como solução eficaz de skincare anti-idade, com respaldo científico e foco na autoestima e naturalidade.",
    targetAudience: "Mulheres de 35 a 55 anos interessadas em skincare e anti-aging.",
    keyMessages: [
      "Chronos: ciência e natureza para uma pele mais jovem",
      "Fórmula com ativos de alta eficácia comprovada",
      "Cuide-se hoje para amanhã",
    ],
    doList: [
      "Mostrar a rotina de skincare completa com Chronos",
      "Falar sobre benefícios percebidos após o uso",
      "Transmitir autoconfiança e naturalidade",
    ],
    dontList: [
      "Não fazer promessas de resultado em prazo específico",
      "Não associar envelhecimento a algo negativo",
      "Não usar filtros que escondam rugas ou imperfeições",
    ],
    toneOfVoice:
      "Empoderador e científico. Falar para mulheres que abraçam o tempo com inteligência e cuidado.",
    deliverables: [
      { type: "Reels Instagram", quantity: 1, deadline: "2026-12-05", notes: "Rotina noturna com Chronos. 60s-90s." },
      { type: "Stories Instagram", quantity: 3, deadline: "2026-12-07", notes: "Before/after sutil. Incluir link para e-commerce." },
    ],
    mandatoryElements: ["#NaturaChronos", "@naturabrasil", "Cupom de desconto visível"],
    inspirationLinks: [],
    approvalDeadline: "2026-11-28",
    publicationWindow: "05/12/2026 a 20/12/2026",
    acceptances: [],
    currentPublishedVersion: undefined,
    versions: [
      { version: 1, createdAt: "2026-10-25", createdBy: "Ana Beatriz Lima", summary: "Rascunho inicial — pendente revisão jurídica" },
    ],
    createdAt: "2026-10-25",
    updatedAt: "2026-10-25",
  },
]
