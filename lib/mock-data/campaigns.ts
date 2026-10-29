export type CampaignStatus =
  | "rascunho"
  | "aberta"
  | "em_execucao"
  | "concluida"
  | "cancelada"
  | "arquivada"

export type CampaignVisibility = "publica" | "privada" | "secreta"

export type CampaignType =
  | "awareness"
  | "conversao"
  | "engajamento"
  | "ugc"
  | "seeding"
  | "embaixador"
  | "live"
  | "afiliado"

export type ContentFormat = "reels" | "stories" | "feed" | "tiktok" | "shorts" | "live"

export type SocialNetwork = "instagram" | "tiktok" | "youtube"

export interface CampaignMention {
  network: SocialNetwork
  handle: string
}

export const SOCIAL_NETWORK_LABEL: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
}

export function isSocialNetwork(value: string): value is SocialNetwork {
  return value === "instagram" || value === "tiktok" || value === "youtube"
}

export function normalizeMentions(value: unknown): CampaignMention[] {
  if (!Array.isArray(value)) return []
  const mentions: CampaignMention[] = []
  for (const item of value) {
    if (typeof item === "string") {
      const handle = item.startsWith("@") ? item : `@${item}`
      if (handle.length > 1) mentions.push({ network: "instagram", handle })
      continue
    }
    if (!item || typeof item !== "object" || !("network" in item) || !("handle" in item)) continue
    const network = String((item as { network: unknown }).network)
    const handleRaw = (item as { handle: unknown }).handle
    if (!isSocialNetwork(network) || typeof handleRaw !== "string") continue
    const handle = handleRaw.startsWith("@") ? handleRaw : `@${handleRaw}`
    if (handle.length > 1) mentions.push({ network, handle })
  }
  return mentions
}

export interface Deliverable {
  type: "post_feed" | "stories" | "reels" | "video_youtube" | "tiktok"
  quantity: number
}

export interface Participant {
  creatorId: string
  creatorName: string
  creatorHandle: string
  avatar: string
  tier: "nano" | "micro" | "mid" | "macro" | "mega"
  status: "convidado" | "candidato" | "selecionado" | "recusado" | "entregue"
  fee: number
  deliverables: Deliverable[]
  couponCode?: string
  trackingLink?: string
  revenue?: number
  clicks?: number
  orders?: number
  postsDelivered?: number
  postsApproved?: number
  totalReach?: number
  totalEngagement?: number
  roi?: number
  level?: "bronze" | "silver" | "gold" | "platinum"
  memberType?: "standard" | "vip" | "ambassador"
  lastPost?: string
}

export interface Campaign {
  id: string
  organizationId: string
  organizationName: string
  name: string
  description: string
  objective: string
  type: CampaignType
  status: CampaignStatus
  startDate: string
  endDate: string
  budget: number
  budgetSpent: number
  targetNiches: string[]
  targetNetworks: string[]
  minFollowers: number
  maxFollowers: number
  minEngagement: number
  mandatoryHashtags: string[]
  mandatoryMentions: CampaignMention[]
  contentFormats?: ContentFormat[]
  recommended?: string
  notRecommended?: string
  participants: Participant[]
  briefingId?: string
  formId?: string
  createdAt: string
  updatedAt: string
  coverImage?: string
  totalReach?: number
  totalEngagement?: number
  totalClicks?: number
  totalRevenue?: number
  roi?: number
  visibility: CampaignVisibility
}

export const CAMPAIGNS: Campaign[] = [
  // ── ORG 1: NATURA ────────────────────────────────────────────
  {
    id: "camp1",
    organizationId: "org1",
    organizationName: "Natura",
    name: "Natura Ekos — Lançamento Coleção Primavera",
    description:
      "Campanha de lançamento da nova linha Ekos com ingredientes da Amazônia. Queremos creators que transmitam autenticidade e conexão com a natureza.",
    objective: "Gerar awareness da nova linha e direcionar tráfego para o e-commerce.",
    type: "awareness",
    status: "em_execucao",
    startDate: "2026-10-01",
    endDate: "2026-11-30",
    budget: 85000,
    budgetSpent: 52000,
    targetNiches: ["beleza", "lifestyle", "fitness"],
    targetNetworks: ["instagram", "tiktok"],
    minFollowers: 50000,
    maxFollowers: 2000000,
    minEngagement: 3.5,
    mandatoryHashtags: ["#NaturaEkos", "#BelezaAmazônica", "#NaturaEkos2026"],
    mandatoryMentions: [
      { network: "instagram", handle: "@naturabrasil" },
      { network: "tiktok", handle: "@naturaTT" },
    ],
    participants: [
      {
        creatorId: "c1",
        creatorName: "Bianca Torres",
        creatorHandle: "@biancatorres",
        avatar: "BT",
        tier: "macro",
        status: "entregue",
        fee: 8500,
        deliverables: [{ type: "reels", quantity: 2 }, { type: "stories", quantity: 5 }],
        couponCode: "BIANCA15",
        trackingLink: "https://nat.link/bianca",
        revenue: 12400,
        clicks: 3820,
        orders: 124,
        postsDelivered: 7,
        postsApproved: 6,
        totalReach: 182000,
        totalEngagement: 9400,
        roi: 46,
        level: "gold",
        memberType: "vip",
        lastPost: "2026-10-22",
      },
      {
        creatorId: "c3",
        creatorName: "Carolina Souza",
        creatorHandle: "@carolsouza",
        avatar: "CS",
        tier: "macro",
        status: "selecionado",
        fee: 12000,
        deliverables: [{ type: "reels", quantity: 1 }, { type: "post_feed", quantity: 2 }, { type: "stories", quantity: 4 }],
        couponCode: "CAROL20",
        trackingLink: "https://nat.link/carol",
        revenue: 8900,
        clicks: 2100,
        orders: 89,
        postsDelivered: 5,
        postsApproved: 5,
        totalReach: 245000,
        totalEngagement: 11200,
        roi: -26,
        level: "platinum",
        memberType: "ambassador",
        lastPost: "2026-10-25",
      },
      {
        creatorId: "c5",
        creatorName: "Fernanda Costa",
        creatorHandle: "@fercostamoda",
        avatar: "FC",
        tier: "mega",
        status: "selecionado",
        fee: 22000,
        deliverables: [{ type: "reels", quantity: 2 }, { type: "tiktok", quantity: 2 }, { type: "stories", quantity: 6 }],
        couponCode: "FER25",
        trackingLink: "https://nat.link/fer",
        revenue: 31000,
        clicks: 8940,
        orders: 310,
        postsDelivered: 8,
        postsApproved: 8,
        totalReach: 780000,
        totalEngagement: 38000,
        roi: 41,
        level: "platinum",
        memberType: "ambassador",
        lastPost: "2026-10-27",
      },
      {
        creatorId: "c13",
        creatorName: "Henrique Campos",
        creatorHandle: "@henriquehair",
        avatar: "HC",
        tier: "macro",
        status: "selecionado",
        fee: 9800,
        deliverables: [{ type: "reels", quantity: 2 }, { type: "tiktok", quantity: 1 }, { type: "stories", quantity: 3 }],
        couponCode: "HENRI10",
        trackingLink: "https://nat.link/henri",
        revenue: 11200,
        clicks: 2840,
        orders: 112,
        postsDelivered: 4,
        postsApproved: 3,
        totalReach: 324000,
        totalEngagement: 18400,
        roi: 14,
        level: "gold",
        memberType: "vip",
        lastPost: "2026-10-20",
      },
    ],
    briefingId: "b1",
    coverImage: "https://picsum.photos/seed/natura-ekos-primavera/1200/400",
    createdAt: "2026-09-15",
    updatedAt: "2026-10-27",
    totalReach: 1531000,
    totalEngagement: 77000,
    totalClicks: 17700,
    totalRevenue: 63500,
    roi: 22,
    visibility: "secreta",
  },
  {
    id: "camp4",
    organizationId: "org1",
    organizationName: "Natura",
    name: "Natura Chronos — Skincare Anti-Idade",
    description: "Campanha focada na linha Chronos para público 30+. Buscamos creators com audiência adulta e credibilidade em skincare.",
    objective: "Awareness e educação sobre a linha Chronos.",
    type: "awareness",
    status: "rascunho",
    startDate: "2026-12-01",
    endDate: "2027-01-31",
    budget: 95000,
    budgetSpent: 0,
    targetNiches: ["beleza", "lifestyle", "fitness"],
    targetNetworks: ["instagram", "youtube"],
    minFollowers: 80000,
    maxFollowers: 3000000,
    minEngagement: 3.0,
    mandatoryHashtags: ["#NaturaChronos", "#SkincareBrasileiro"],
    mandatoryMentions: [
      { network: "instagram", handle: "@naturabrasil" },
      { network: "youtube", handle: "@NaturaBrasil" },
    ],
    participants: [],
    coverImage: "https://picsum.photos/seed/natura-chronos-skin/1200/400",
    createdAt: "2026-10-20",
    updatedAt: "2026-10-27",
    visibility: "secreta",
  },
  {
    id: "camp6",
    organizationId: "org1",
    organizationName: "Natura",
    name: "Natura SOU — Refil Sustentável",
    description:
      "Campanha de conscientização sobre as embalagens refil da linha SOU. Buscamos creators ligados à sustentabilidade, consumo consciente e slow living.",
    objective: "Engajamento e posicionamento de marca sustentável.",
    type: "engajamento",
    status: "concluida",
    startDate: "2026-07-01",
    endDate: "2026-08-31",
    budget: 48000,
    budgetSpent: 44200,
    targetNiches: ["sustentabilidade", "beleza", "lifestyle"],
    targetNetworks: ["instagram", "youtube"],
    minFollowers: 30000,
    maxFollowers: 1000000,
    minEngagement: 4.0,
    mandatoryHashtags: ["#NaturaSOU", "#RefilSustentável", "#ConsciênciaVerde"],
    mandatoryMentions: [
      { network: "instagram", handle: "@naturabrasil" },
      { network: "youtube", handle: "@NaturaBrasil" },
    ],
    participants: [
      {
        creatorId: "c11",
        creatorName: "Isabela Mendes",
        creatorHandle: "@isabelasustenta",
        avatar: "IM",
        tier: "micro",
        status: "entregue",
        fee: 4200,
        deliverables: [{ type: "post_feed", quantity: 2 }, { type: "video_youtube", quantity: 1 }, { type: "stories", quantity: 4 }],
        couponCode: "ISA10",
        trackingLink: "https://nat.link/isa",
        revenue: 6800,
        clicks: 1920,
        orders: 68,
        postsDelivered: 7,
        postsApproved: 7,
        totalReach: 92000,
        totalEngagement: 5800,
        roi: 62,
        level: "bronze",
        memberType: "standard",
        lastPost: "2026-08-20",
      },
      {
        creatorId: "c3",
        creatorName: "Carolina Souza",
        creatorHandle: "@carolsouza",
        avatar: "CS",
        tier: "macro",
        status: "entregue",
        fee: 14000,
        deliverables: [{ type: "reels", quantity: 2 }, { type: "stories", quantity: 5 }],
        couponCode: "CAROL15",
        trackingLink: "https://nat.link/carol2",
        revenue: 22000,
        clicks: 5400,
        orders: 220,
        postsDelivered: 7,
        postsApproved: 7,
        totalReach: 412000,
        totalEngagement: 21000,
        roi: 57,
        level: "platinum",
        memberType: "ambassador",
        lastPost: "2026-08-28",
      },
    ],
    coverImage: "https://picsum.photos/seed/natura-sou-refil/1200/400",
    createdAt: "2026-06-15",
    updatedAt: "2026-09-02",
    totalReach: 504000,
    totalEngagement: 26800,
    totalClicks: 7320,
    totalRevenue: 28800,
    roi: -35,
    visibility: "secreta",
  },
  // ── ORG 2: MAGAZINE LUIZA ─────────────────────────────────────
  {
    id: "camp2",
    organizationId: "org2",
    organizationName: "Magazine Luiza",
    name: "Tech Week — Semana de Tecnologia Magalu",
    description:
      "Queremos creators de tecnologia para apresentar as melhores ofertas da Tech Week. Foco em demonstração de produtos e call-to-action para o app.",
    objective: "Conversão direta via cupom e link de afiliado.",
    type: "afiliado",
    status: "aberta",
    startDate: "2026-11-10",
    endDate: "2026-11-17",
    budget: 120000,
    budgetSpent: 0,
    targetNiches: ["tecnologia", "games", "lifestyle"],
    targetNetworks: ["youtube", "instagram", "tiktok"],
    minFollowers: 30000,
    maxFollowers: 5000000,
    minEngagement: 2.5,
    mandatoryHashtags: ["#TechWeekMagalu", "#Magalu"],
    mandatoryMentions: [
      { network: "instagram", handle: "@magazineluiza" },
      { network: "tiktok", handle: "@magaluTT" },
      { network: "youtube", handle: "@MagazineLuiza" },
    ],
    participants: [
      {
        creatorId: "c4",
        creatorName: "Lucas Oliveira",
        creatorHandle: "@lucasotech",
        avatar: "LO",
        tier: "mid",
        status: "convidado",
        fee: 9500,
        deliverables: [{ type: "video_youtube", quantity: 1 }, { type: "reels", quantity: 1 }],
        level: "silver",
        memberType: "standard",
      },
      {
        creatorId: "c6",
        creatorName: "Rafael Nunes",
        creatorHandle: "@rafaelgames",
        avatar: "RN",
        tier: "macro",
        status: "candidato",
        fee: 7200,
        deliverables: [{ type: "tiktok", quantity: 2 }, { type: "stories", quantity: 3 }],
        level: "gold",
        memberType: "standard",
      },
      {
        creatorId: "c8",
        creatorName: "Thiago Ribeiro",
        creatorHandle: "@thiagoinvestidor",
        avatar: "TR",
        tier: "mid",
        status: "candidato",
        fee: 6400,
        deliverables: [{ type: "video_youtube", quantity: 1 }, { type: "stories", quantity: 2 }],
        level: "gold",
        memberType: "vip",
      },
      {
        creatorId: "c1",
        creatorName: "Bianca Torres",
        creatorHandle: "@biancatorres",
        avatar: "BT",
        tier: "macro",
        status: "recusado",
        fee: 0,
        deliverables: [],
        level: "gold",
        memberType: "vip",
      },
    ],
    briefingId: "b2",
    formId: "form-tech-week",
    coverImage: "https://picsum.photos/seed/magalu-tech-week/1200/400",
    createdAt: "2026-10-10",
    updatedAt: "2026-10-25",
    visibility: "publica",
  },
  {
    id: "camp5",
    organizationId: "org2",
    organizationName: "Magazine Luiza",
    name: "Black Friday Magalu 2026",
    description: "A maior campanha do ano! Queremos os maiores creators do Brasil para a Black Friday.",
    objective: "Máxima conversão via links de afiliado e cupons exclusivos.",
    type: "afiliado",
    status: "concluida",
    startDate: "2026-11-20",
    endDate: "2026-11-30",
    budget: 350000,
    budgetSpent: 318000,
    targetNiches: ["tecnologia", "moda", "beleza", "games", "lifestyle"],
    targetNetworks: ["instagram", "tiktok", "youtube"],
    minFollowers: 100000,
    maxFollowers: 10000000,
    minEngagement: 2.0,
    mandatoryHashtags: ["#BlackFridayMagalu", "#Magalu"],
    mandatoryMentions: [
      { network: "instagram", handle: "@magazineluiza" },
      { network: "tiktok", handle: "@magaluTT" },
      { network: "youtube", handle: "@MagazineLuiza" },
    ],
    participants: [
      {
        creatorId: "c5",
        creatorName: "Fernanda Costa",
        creatorHandle: "@fercostamoda",
        avatar: "FC",
        tier: "mega",
        status: "entregue",
        fee: 85000,
        deliverables: [{ type: "tiktok", quantity: 4 }, { type: "reels", quantity: 4 }, { type: "stories", quantity: 10 }],
        couponCode: "FERMAGA30",
        revenue: 480000,
        clicks: 92000,
        orders: 4800,
        postsDelivered: 18,
        postsApproved: 16,
        totalReach: 5200000,
        totalEngagement: 384000,
        roi: 465,
        level: "platinum",
        memberType: "ambassador",
        lastPost: "2026-11-29",
      },
      {
        creatorId: "c6",
        creatorName: "Rafael Nunes",
        creatorHandle: "@rafaelgames",
        avatar: "RN",
        tier: "macro",
        status: "entregue",
        fee: 42000,
        deliverables: [{ type: "tiktok", quantity: 5 }, { type: "video_youtube", quantity: 2 }, { type: "reels", quantity: 1 }],
        couponCode: "RAFAGAMES25",
        revenue: 210000,
        clicks: 48000,
        orders: 2100,
        postsDelivered: 8,
        postsApproved: 6,
        totalReach: 3800000,
        totalEngagement: 312000,
        roi: 400,
        level: "gold",
        memberType: "standard",
        lastPost: "2026-11-28",
      },
      {
        creatorId: "c1",
        creatorName: "Bianca Torres",
        creatorHandle: "@biancatorres",
        avatar: "BT",
        tier: "macro",
        status: "entregue",
        fee: 38000,
        deliverables: [{ type: "reels", quantity: 4 }, { type: "stories", quantity: 6 }, { type: "post_feed", quantity: 2 }],
        couponCode: "BIANCAMAGA20",
        revenue: 158000,
        clicks: 32000,
        orders: 1580,
        postsDelivered: 12,
        postsApproved: 10,
        totalReach: 2100000,
        totalEngagement: 128000,
        roi: 316,
        level: "gold",
        memberType: "vip",
        lastPost: "2026-11-30",
      },
      {
        creatorId: "c4",
        creatorName: "Lucas Oliveira",
        creatorHandle: "@lucasotech",
        avatar: "LO",
        tier: "mid",
        status: "entregue",
        fee: 28000,
        deliverables: [{ type: "video_youtube", quantity: 2 }, { type: "reels", quantity: 2 }, { type: "tiktok", quantity: 2 }],
        couponCode: "LUCASTECH15",
        revenue: 92000,
        clicks: 22000,
        orders: 920,
        postsDelivered: 6,
        postsApproved: 4,
        totalReach: 980000,
        totalEngagement: 46000,
        roi: 229,
        level: "silver",
        memberType: "standard",
        lastPost: "2026-11-27",
      },
    ],
    coverImage: "https://picsum.photos/seed/magalu-black-friday/1200/400",
    createdAt: "2026-09-01",
    updatedAt: "2026-12-01",
    totalReach: 12080000,
    totalEngagement: 870000,
    totalClicks: 194000,
    totalRevenue: 940000,
    roi: 196,
    visibility: "secreta",
  },
  {
    id: "camp7",
    organizationId: "org2",
    organizationName: "Magazine Luiza",
    name: "Magalu Casa & Decor — Novo App",
    description:
      "Lançamento do módulo Casa & Decor no app Magalu. Creators de decoração para demonstrar como planejar ambientes com realidade aumentada.",
    objective: "Downloads do app e awareness da nova funcionalidade.",
    type: "conversao",
    status: "em_execucao",
    startDate: "2026-10-15",
    endDate: "2026-11-15",
    budget: 72000,
    budgetSpent: 38000,
    targetNiches: ["decoração", "lifestyle", "tecnologia"],
    targetNetworks: ["instagram", "youtube", "tiktok"],
    minFollowers: 40000,
    maxFollowers: 2000000,
    minEngagement: 3.0,
    mandatoryHashtags: ["#MagaluCasaDecor", "#AppMagalu", "#DecoraçãoAR"],
    mandatoryMentions: [
      { network: "instagram", handle: "@magazineluiza" },
      { network: "tiktok", handle: "@magaluTT" },
      { network: "youtube", handle: "@MagazineLuiza" },
    ],
    participants: [
      {
        creatorId: "c14",
        creatorName: "Juliana Freitas",
        creatorHandle: "@judecordecasa",
        avatar: "JF",
        tier: "mid",
        status: "selecionado",
        fee: 6800,
        deliverables: [{ type: "reels", quantity: 3 }, { type: "stories", quantity: 4 }],
        couponCode: "JU15",
        trackingLink: "https://maga.link/jude",
        revenue: 4200,
        clicks: 1840,
        orders: 42,
        postsDelivered: 6,
        postsApproved: 3,
        totalReach: 118000,
        totalEngagement: 5400,
        roi: -38,
        level: "bronze",
        memberType: "standard",
        lastPost: "2026-10-27",
      },
      {
        creatorId: "c11",
        creatorName: "Isabela Mendes",
        creatorHandle: "@isabelasustenta",
        avatar: "IM",
        tier: "micro",
        status: "selecionado",
        fee: 4800,
        deliverables: [{ type: "post_feed", quantity: 2 }, { type: "stories", quantity: 3 }],
        couponCode: "ISA15",
        trackingLink: "https://maga.link/isabela",
        revenue: 3600,
        clicks: 1240,
        orders: 36,
        postsDelivered: 4,
        postsApproved: 3,
        totalReach: 84000,
        totalEngagement: 4200,
        roi: -25,
        level: "bronze",
        memberType: "standard",
        lastPost: "2026-10-26",
      },
    ],
    formId: "form-casa",
    coverImage: "https://picsum.photos/seed/magalu-casa-decor/1200/400",
    createdAt: "2026-10-01",
    updatedAt: "2026-10-27",
    totalReach: 202000,
    totalEngagement: 9600,
    totalClicks: 3080,
    totalRevenue: 7800,
    roi: -80,
    visibility: "secreta",
  },
  // ── ORG 3: IFOOD ─────────────────────────────────────────────
  {
    id: "camp3",
    organizationId: "org3",
    organizationName: "iFood",
    name: "iFood Sabores do Brasil — Gastronomia Regional",
    description:
      "Série de conteúdos destacando pratos típicos de cada região do Brasil preparados com ingredientes pedidos via iFood.",
    objective: "Engajamento e brand awareness com foco em culinária regional.",
    type: "ugc",
    status: "em_execucao",
    startDate: "2026-09-20",
    endDate: "2026-12-20",
    budget: 65000,
    budgetSpent: 28000,
    targetNiches: ["gastronomia", "lifestyle"],
    targetNetworks: ["instagram", "tiktok", "youtube"],
    minFollowers: 20000,
    maxFollowers: 1000000,
    minEngagement: 4.0,
    mandatoryHashtags: ["#SaboresDoBrasil", "#iFood", "#GastronomiaRegional"],
    mandatoryMentions: [
      { network: "instagram", handle: "@ifoodbrasil" },
      { network: "tiktok", handle: "@ifoodTT" },
      { network: "youtube", handle: "@iFood" },
    ],
    participants: [
      {
        creatorId: "c2",
        creatorName: "Pedro Alves",
        creatorHandle: "@pedroalves",
        avatar: "PA",
        tier: "mid",
        status: "entregue",
        fee: 6800,
        deliverables: [{ type: "reels", quantity: 3 }, { type: "tiktok", quantity: 2 }, { type: "stories", quantity: 6 }],
        couponCode: "PEDRO10",
        trackingLink: "https://if.link/pedro",
        revenue: 9200,
        clicks: 4100,
        orders: 412,
        postsDelivered: 11,
        postsApproved: 10,
        totalReach: 198000,
        totalEngagement: 16800,
        roi: 35,
        level: "silver",
        memberType: "standard",
        lastPost: "2026-10-19",
      },
      {
        creatorId: "c9",
        creatorName: "Amanda Oliveira",
        creatorHandle: "@amandamae",
        avatar: "AO",
        tier: "mid",
        status: "selecionado",
        fee: 5400,
        deliverables: [{ type: "reels", quantity: 2 }, { type: "tiktok", quantity: 2 }, { type: "stories", quantity: 4 }],
        couponCode: "AMANDA10",
        trackingLink: "https://if.link/amanda",
        revenue: 7800,
        clicks: 3200,
        orders: 78,
        postsDelivered: 6,
        postsApproved: 6,
        totalReach: 154000,
        totalEngagement: 13600,
        roi: 44,
        level: "silver",
        memberType: "standard",
        lastPost: "2026-10-23",
      },
      {
        creatorId: "c7",
        creatorName: "Mariana Pinto",
        creatorHandle: "@marianaviagemreal",
        avatar: "MP",
        tier: "mid",
        status: "convidado",
        fee: 4200,
        deliverables: [{ type: "reels", quantity: 2 }, { type: "stories", quantity: 3 }],
        level: "bronze",
        memberType: "standard",
      },
    ],
    briefingId: "b3",
    coverImage: "https://picsum.photos/seed/ifood-sabores-brasil/1200/400",
    createdAt: "2026-09-05",
    updatedAt: "2026-10-20",
    totalReach: 352000,
    totalEngagement: 30400,
    totalClicks: 7300,
    totalRevenue: 17000,
    roi: -39,
    visibility: "secreta",
  },
  {
    id: "camp8",
    organizationId: "org3",
    organizationName: "iFood",
    name: "iFood Pet — Ração Premium Delivery",
    description:
      "Lançamento do iFood Pet, serviço de entrega de ração e produtos para animais. Buscamos creators de pets para apresentar a conveniência do serviço.",
    objective: "Cadastros no iFood Pet e primeiros pedidos.",
    type: "conversao",
    status: "aberta",
    startDate: "2026-11-01",
    endDate: "2026-12-15",
    budget: 38000,
    budgetSpent: 0,
    targetNiches: ["pets", "lifestyle"],
    targetNetworks: ["instagram", "tiktok"],
    minFollowers: 20000,
    maxFollowers: 800000,
    minEngagement: 5.0,
    mandatoryHashtags: ["#iFoodPet", "#RaçãoPremium"],
    mandatoryMentions: [
      { network: "instagram", handle: "@ifoodbrasil" },
      { network: "tiktok", handle: "@ifoodTT" },
    ],
    participants: [
      {
        creatorId: "c12",
        creatorName: "Giovanna Lopes",
        creatorHandle: "@giovannapet",
        avatar: "GL",
        tier: "micro",
        status: "candidato",
        fee: 3800,
        deliverables: [{ type: "reels", quantity: 2 }, { type: "tiktok", quantity: 2 }, { type: "stories", quantity: 4 }],
        level: "silver",
        memberType: "standard",
      },
    ],
    coverImage: "https://picsum.photos/seed/ifood-pet-racao/1200/400",
    createdAt: "2026-10-18",
    updatedAt: "2026-10-27",
    visibility: "publica",
  },
  {
    id: "camp9",
    organizationId: "org3",
    organizationName: "iFood",
    name: "iFood Verão 2026 — Happy Hour em Casa",
    description: "Campanha de verão focando em drinks, petiscos e momentos de lazer com pedidos via iFood. Criadores de lifestyle e gastronomia.",
    objective: "Aumentar ticket médio e frequência de pedidos no verão.",
    type: "engajamento",
    status: "rascunho",
    startDate: "2026-12-10",
    endDate: "2027-03-10",
    budget: 80000,
    budgetSpent: 0,
    targetNiches: ["gastronomia", "lifestyle"],
    targetNetworks: ["instagram", "tiktok"],
    minFollowers: 50000,
    maxFollowers: 3000000,
    minEngagement: 3.5,
    mandatoryHashtags: ["#iFoodVerão", "#HappyHourEmCasa"],
    mandatoryMentions: [
      { network: "instagram", handle: "@ifoodbrasil" },
      { network: "tiktok", handle: "@ifoodTT" },
    ],
    participants: [],
    coverImage: "https://picsum.photos/seed/ifood-verao-summer/1200/400",
    createdAt: "2026-10-25",
    updatedAt: "2026-10-27",
    visibility: "secreta",
  },
]
