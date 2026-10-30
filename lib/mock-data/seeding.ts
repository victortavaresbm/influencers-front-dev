export type SeedingStatus = "rascunho" | "ativa" | "encerrada" | "pausada"
export type SeedingMode = "fechado" | "aberto"
export type CreatorSeedingStatus =
  | "convidado"
  | "endereco_coletado"
  | "enviado"
  | "entregue"
  | "postou"
  | "nao_postou"

export interface SeedingProduct {
  id: string
  name: string
  variants: string[]
  imageUrl?: string
  unitCost: number
  stockForSeeding: number
  stockUsed: number
}

export interface SeedingAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface SeedingCreatorEntry {
  id: string
  creatorId: string
  creatorName: string
  creatorHandle: string
  creatorAvatar: string
  creatorPhoto?: string
  status: CreatorSeedingStatus
  selectedProductId?: string
  selectedVariant?: string
  address?: SeedingAddress
  trackingCode?: string
  shippedAt?: string
  deliveredAt?: string
  postUrl?: string
  postViews?: number
  postLikes?: number
  postComments?: number
  couponCode?: string
  couponSales?: number
  invitedAt: string
}

export interface SeedingCampaign {
  id: string
  campaignId?: string
  organizationId: string
  name: string
  status: SeedingStatus
  mode: SeedingMode
  objective: string
  expectedHashtag?: string
  expectedMention?: string
  expectedFormats: string[]
  daysToPost: number
  products: SeedingProduct[]
  creators: SeedingCreatorEntry[]
  createdAt: string
  startDate?: string
  endDate?: string
  totalBudget?: number
}

export const SEEDING_CAMPAIGNS: SeedingCampaign[] = [
  {
    id: "s1",
    organizationId: "org1",
    name: "Lançamento Coleção Verão 2026",
    status: "ativa",
    mode: "fechado",
    objective: "Gerar conteúdo orgânico para o lançamento da coleção verão e aumentar awareness da nova linha.",
    expectedHashtag: "#WeSellVerão",
    expectedMention: "@wesell",
    expectedFormats: ["reels", "stories", "tiktok"],
    daysToPost: 7,
    createdAt: "2026-10-01",
    startDate: "2026-10-10",
    endDate: "2026-11-30",
    totalBudget: 8500,
    products: [
      {
        id: "p1",
        name: "Camiseta Premium Oversized",
        variants: ["P", "M", "G", "GG"],
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        unitCost: 89,
        stockForSeeding: 40,
        stockUsed: 28,
      },
      {
        id: "p2",
        name: "Short Estampado",
        variants: ["P", "M", "G"],
        imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400",
        unitCost: 65,
        stockForSeeding: 30,
        stockUsed: 18,
      },
      {
        id: "p3",
        name: "Kit Verão (Camisa + Óculos)",
        variants: ["Único"],
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        unitCost: 145,
        stockForSeeding: 15,
        stockUsed: 10,
      },
    ],
    creators: [
      {
        id: "sc1",
        creatorId: "c1",
        creatorName: "Bianca Torres",
        creatorHandle: "@biancatorres",
        creatorAvatar: "BT",
        creatorPhoto: "https://i.pravatar.cc/300?img=1",
        status: "postou",
        selectedProductId: "p1",
        selectedVariant: "M",
        address: { street: "Rua das Flores", number: "123", neighborhood: "Jardins", city: "São Paulo", state: "SP", zipCode: "01401-000" },
        trackingCode: "BR123456789BR",
        shippedAt: "2026-10-12",
        deliveredAt: "2026-10-15",
        postUrl: "https://instagram.com/p/abc123",
        postViews: 184000,
        postLikes: 8900,
        postComments: 342,
        couponCode: "BIANCA10",
        couponSales: 3800,
        invitedAt: "2026-10-10",
      },
      {
        id: "sc2",
        creatorId: "c3",
        creatorName: "Carolina Souza",
        creatorHandle: "@carolsouza",
        creatorAvatar: "CS",
        creatorPhoto: "https://i.pravatar.cc/300?img=5",
        status: "postou",
        selectedProductId: "p1",
        selectedVariant: "P",
        address: { street: "Av. Atlântica", number: "2000", neighborhood: "Copacabana", city: "Rio de Janeiro", state: "RJ", zipCode: "22070-001" },
        trackingCode: "BR987654321BR",
        shippedAt: "2026-10-13",
        deliveredAt: "2026-10-17",
        postUrl: "https://instagram.com/p/def456",
        postViews: 312000,
        postLikes: 14200,
        postComments: 891,
        couponCode: "CAROL10",
        couponSales: 5600,
        invitedAt: "2026-10-10",
      },
      {
        id: "sc3",
        creatorId: "c2",
        creatorName: "Pedro Alves",
        creatorHandle: "@pedroalves",
        creatorAvatar: "PA",
        creatorPhoto: "https://i.pravatar.cc/300?img=3",
        status: "entregue",
        selectedProductId: "p3",
        selectedVariant: "Único",
        address: { street: "Rua XV de Novembro", number: "500", neighborhood: "Centro", city: "Curitiba", state: "PR", zipCode: "80020-310" },
        trackingCode: "BR555444333BR",
        shippedAt: "2026-10-14",
        deliveredAt: "2026-10-19",
        invitedAt: "2026-10-10",
      },
      {
        id: "sc4",
        creatorId: "c4",
        creatorName: "Mariana Lima",
        creatorHandle: "@marilima",
        creatorAvatar: "ML",
        creatorPhoto: "https://i.pravatar.cc/300?img=16",
        status: "enviado",
        selectedProductId: "p2",
        selectedVariant: "M",
        address: { street: "Rua das Acácias", number: "78", neighborhood: "Boa Viagem", city: "Recife", state: "PE", zipCode: "51021-000" },
        trackingCode: "BR111222333BR",
        shippedAt: "2026-10-18",
        invitedAt: "2026-10-11",
      },
      {
        id: "sc5",
        creatorId: "c5",
        creatorName: "Lucas Ferreira",
        creatorHandle: "@lucasfer",
        creatorAvatar: "LF",
        creatorPhoto: "https://i.pravatar.cc/300?img=33",
        status: "endereco_coletado",
        selectedProductId: "p1",
        selectedVariant: "G",
        address: { street: "Av. Paulista", number: "1500", neighborhood: "Bela Vista", city: "São Paulo", state: "SP", zipCode: "01310-100" },
        invitedAt: "2026-10-12",
      },
      {
        id: "sc6",
        creatorId: "c6",
        creatorName: "Juliana Costa",
        creatorHandle: "@jucosta",
        creatorAvatar: "JC",
        creatorPhoto: "https://i.pravatar.cc/300?img=20",
        status: "endereco_coletado",
        selectedProductId: "p2",
        selectedVariant: "P",
        address: { street: "Rua Afonso Pena", number: "234", neighborhood: "Centro", city: "Belo Horizonte", state: "MG", zipCode: "30130-001" },
        invitedAt: "2026-10-13",
      },
      {
        id: "sc7",
        creatorId: "c7",
        creatorName: "Rafael Mendes",
        creatorHandle: "@rafamendes",
        creatorAvatar: "RM",
        creatorPhoto: "https://i.pravatar.cc/300?img=51",
        status: "convidado",
        invitedAt: "2026-10-20",
      },
      {
        id: "sc8",
        creatorId: "c8",
        creatorName: "Thais Oliveira",
        creatorHandle: "@thaisoliveira",
        creatorAvatar: "TO",
        creatorPhoto: "https://i.pravatar.cc/300?img=23",
        status: "convidado",
        invitedAt: "2026-10-20",
      },
      {
        id: "sc9",
        creatorId: "c9",
        creatorName: "Gabriela Nunes",
        creatorHandle: "@gabnunes",
        creatorAvatar: "GN",
        creatorPhoto: "https://i.pravatar.cc/300?img=25",
        status: "nao_postou",
        selectedProductId: "p3",
        selectedVariant: "Único",
        address: { street: "Rua Sergipe", number: "890", neighborhood: "Higienópolis", city: "São Paulo", state: "SP", zipCode: "01243-001" },
        trackingCode: "BR999888777BR",
        shippedAt: "2026-10-11",
        deliveredAt: "2026-10-14",
        invitedAt: "2026-10-10",
      },
    ],
  },
  {
    id: "s2",
    organizationId: "org1",
    name: "PR Skincare — Linha Hidratação",
    status: "encerrada",
    mode: "fechado",
    objective: "Aumentar awareness da nova linha de skincare entre micro-influenciadoras do nicho beleza.",
    expectedHashtag: "#PelePerfeita",
    expectedMention: "@wesell",
    expectedFormats: ["reels", "stories"],
    daysToPost: 5,
    createdAt: "2026-08-01",
    startDate: "2026-08-10",
    endDate: "2026-09-30",
    totalBudget: 4200,
    products: [
      {
        id: "p4",
        name: "Kit Hidratação Facial",
        variants: ["Pele Seca", "Pele Oleosa", "Pele Mista"],
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&h=200&q=80",
        unitCost: 120,
        stockForSeeding: 25,
        stockUsed: 25,
      },
    ],
    creators: [
      {
        id: "sc10",
        creatorId: "c1",
        creatorName: "Bianca Torres",
        creatorHandle: "@biancatorres",
        creatorAvatar: "BT",
        creatorPhoto: "https://i.pravatar.cc/300?img=1",
        status: "postou",
        selectedProductId: "p4",
        selectedVariant: "Pele Seca",
        trackingCode: "BR000111222BR",
        shippedAt: "2026-08-12",
        deliveredAt: "2026-08-16",
        postUrl: "https://instagram.com/p/ghi789",
        postViews: 210000,
        postLikes: 9400,
        postComments: 510,
        couponCode: "BIANCA15",
        couponSales: 4100,
        invitedAt: "2026-08-10",
      },
      {
        id: "sc11",
        creatorId: "c3",
        creatorName: "Carolina Souza",
        creatorHandle: "@carolsouza",
        creatorAvatar: "CS",
        creatorPhoto: "https://i.pravatar.cc/300?img=5",
        status: "postou",
        selectedProductId: "p4",
        selectedVariant: "Pele Mista",
        trackingCode: "BR333444555BR",
        shippedAt: "2026-08-13",
        deliveredAt: "2026-08-18",
        postUrl: "https://instagram.com/p/jkl012",
        postViews: 180000,
        postLikes: 7200,
        postComments: 290,
        couponCode: "CAROL15",
        couponSales: 2900,
        invitedAt: "2026-08-10",
      },
    ],
  },
  {
    id: "s3",
    organizationId: "org1",
    name: "Gifting Nano Creators — Outubro",
    status: "rascunho",
    mode: "aberto",
    objective: "Testar programa de seeding com nano-influenciadores autênticos do nicho lifestyle.",
    expectedHashtag: "#WeSellLifestyle",
    expectedFormats: ["reels", "tiktok", "feed"],
    daysToPost: 10,
    createdAt: "2026-10-25",
    totalBudget: 3000,
    products: [
      {
        id: "p5",
        name: "Necessaire Viagem",
        variants: ["Preto", "Bege", "Rosa"],
        imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=200&h=200&q=80",
        unitCost: 75,
        stockForSeeding: 20,
        stockUsed: 0,
      },
    ],
    creators: [],
  },
]
