export type Network = "instagram" | "tiktok" | "youtube"
export type Niche =
  | "beleza"
  | "moda"
  | "fitness"
  | "gastronomia"
  | "tecnologia"
  | "lifestyle"
  | "humor"
  | "games"
  | "finanças"
  | "viagem"
  | "maternidade"
  | "sustentabilidade"
  | "pets"
  | "decoração"
  | "esportes"

export interface CreatorNetwork {
  network: Network
  handle: string
  followers: number
  avgViews: number
  engagementRate: number
  verified: boolean
}

export interface Creator {
  id: string
  name: string
  handle: string
  avatar: string
  photo: string
  bio: string
  location: string
  niche: Niche[]
  networks: CreatorNetwork[]
  totalFollowers: number
  avgEngagement: number
  audienceAge: { range: string; pct: number }[]
  audienceGender: { label: string; pct: number }[]
  audienceLocation: { city: string; pct: number }[]
  score: number
  tier: "nano" | "micro" | "mid" | "macro" | "mega"
  tags: string[]
  status: "available" | "in_campaign" | "blocked"
  approvalStatus: "approved" | "pending" | "rejected"
  mediaValue: number
  email: string
  phone: string
  joined: string
  lastActivity: string
  lastPost: string
  fraudScore: number
  pastCampaigns: number
  totalSales?: number
  totalCommission?: number
  totalPosts?: number
  memberType: "standard" | "vip" | "ambassador"
  level: "bronze" | "silver" | "gold" | "platinum"
  origin: "organic" | "invite" | "brand_page"
}

export const CREATORS: Creator[] = [
  {
    id: "c1",
    name: "Bianca Torres",
    handle: "@biancatorres",
    avatar: "BT",
    photo: "https://i.pravatar.cc/300?img=1",
    bio: "Maquiadora profissional e apaixonada por skincare. Criando conteúdo sobre beleza desde 2019.",
    location: "São Paulo, SP",
    niche: ["beleza", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@biancatorres", followers: 385000, avgViews: 42000, engagementRate: 4.8, verified: true },
      { network: "tiktok", handle: "@biancatorres", followers: 612000, avgViews: 180000, engagementRate: 7.2, verified: false },
      { network: "youtube", handle: "Bianca Torres Beauty", followers: 98000, avgViews: 35000, engagementRate: 3.1, verified: false },
    ],
    totalFollowers: 1095000,
    avgEngagement: 5.2,
    audienceAge: [{ range: "18-24", pct: 38 }, { range: "25-34", pct: 42 }, { range: "35-44", pct: 14 }, { range: "45+", pct: 6 }],
    audienceGender: [{ label: "Feminino", pct: 87 }, { label: "Masculino", pct: 13 }],
    audienceLocation: [{ city: "São Paulo", pct: 34 }, { city: "Rio de Janeiro", pct: 18 }, { city: "Belo Horizonte", pct: 9 }],
    score: 92, tier: "macro", tags: ["beleza", "skincare", "maquiagem", "lifestyle"],
    status: "available", approvalStatus: "approved",
    mediaValue: 4800, email: "bianca@gmail.com", phone: "(11) 99999-0001",
    joined: "2024-01-15", lastActivity: "2026-10-25", lastPost: "2026-10-24",
    fraudScore: 2, pastCampaigns: 14, totalSales: 42000, totalCommission: 4200, totalPosts: 127,
    memberType: "vip", level: "gold", origin: "invite",
  },
  {
    id: "c2",
    name: "Pedro Alves",
    handle: "@pedroalves",
    avatar: "PA",
    photo: "https://i.pravatar.cc/300?img=3",
    bio: "Chef amador e entusiasta de gastronomia. Receitas práticas para o dia a dia.",
    location: "Curitiba, PR",
    niche: ["gastronomia", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@pedroalves", followers: 124000, avgViews: 18000, engagementRate: 6.1, verified: false },
      { network: "tiktok", handle: "@pedroalvescozinha", followers: 287000, avgViews: 95000, engagementRate: 8.4, verified: false },
    ],
    totalFollowers: 411000, avgEngagement: 7.1,
    audienceAge: [{ range: "18-24", pct: 28 }, { range: "25-34", pct: 45 }, { range: "35-44", pct: 21 }, { range: "45+", pct: 6 }],
    audienceGender: [{ label: "Feminino", pct: 61 }, { label: "Masculino", pct: 39 }],
    audienceLocation: [{ city: "Curitiba", pct: 22 }, { city: "São Paulo", pct: 28 }, { city: "Porto Alegre", pct: 14 }],
    score: 85, tier: "mid", tags: ["gastronomia", "receitas", "cozinha", "food"],
    status: "in_campaign", approvalStatus: "approved",
    mediaValue: 2200, email: "pedro@gmail.com", phone: "(41) 99999-0002",
    joined: "2024-03-20", lastActivity: "2026-10-26", lastPost: "2026-10-23",
    fraudScore: 1, pastCampaigns: 7, totalSales: 18600, totalCommission: 1860, totalPosts: 84,
    memberType: "standard", level: "silver", origin: "organic",
  },
  {
    id: "c3",
    name: "Carolina Souza",
    handle: "@carolsouza",
    avatar: "CS",
    photo: "https://i.pravatar.cc/300?img=5",
    bio: "Personal trainer e nutricionista. Saúde e bem-estar de forma acessível.",
    location: "Rio de Janeiro, RJ",
    niche: ["fitness", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@carolsouza", followers: 520000, avgViews: 68000, engagementRate: 5.5, verified: true },
      { network: "youtube", handle: "Carol Souza Fit", followers: 215000, avgViews: 82000, engagementRate: 4.2, verified: true },
    ],
    totalFollowers: 735000, avgEngagement: 4.9,
    audienceAge: [{ range: "18-24", pct: 35 }, { range: "25-34", pct: 48 }, { range: "35-44", pct: 12 }, { range: "45+", pct: 5 }],
    audienceGender: [{ label: "Feminino", pct: 72 }, { label: "Masculino", pct: 28 }],
    audienceLocation: [{ city: "Rio de Janeiro", pct: 28 }, { city: "São Paulo", pct: 31 }, { city: "Brasília", pct: 8 }],
    score: 88, tier: "macro", tags: ["fitness", "saúde", "nutrição", "treino"],
    status: "available", approvalStatus: "approved",
    mediaValue: 5600, email: "carol@gmail.com", phone: "(21) 99999-0003",
    joined: "2023-11-08", lastActivity: "2026-10-27", lastPost: "2026-10-26",
    fraudScore: 3, pastCampaigns: 21, totalSales: 67000, totalCommission: 6700, totalPosts: 203,
    memberType: "ambassador", level: "platinum", origin: "invite",
  },
  {
    id: "c4",
    name: "Lucas Oliveira",
    handle: "@lucasotech",
    avatar: "LO",
    photo: "https://i.pravatar.cc/300?img=8",
    bio: "Dev e criador de conteúdo tech. Reviews de gadgets, apps e dicas de produtividade.",
    location: "Florianópolis, SC",
    niche: ["tecnologia", "lifestyle"],
    networks: [
      { network: "youtube", handle: "Lucas Oliveira Tech", followers: 345000, avgViews: 145000, engagementRate: 4.8, verified: true },
      { network: "instagram", handle: "@lucasotech", followers: 88000, avgViews: 12000, engagementRate: 3.9, verified: false },
    ],
    totalFollowers: 433000, avgEngagement: 4.4,
    audienceAge: [{ range: "18-24", pct: 42 }, { range: "25-34", pct: 44 }, { range: "35-44", pct: 11 }, { range: "45+", pct: 3 }],
    audienceGender: [{ label: "Masculino", pct: 78 }, { label: "Feminino", pct: 22 }],
    audienceLocation: [{ city: "São Paulo", pct: 35 }, { city: "Florianópolis", pct: 12 }, { city: "Porto Alegre", pct: 10 }],
    score: 79, tier: "mid", tags: ["tech", "gadgets", "dev", "produtividade"],
    status: "available", approvalStatus: "approved",
    mediaValue: 3100, email: "lucas@gmail.com", phone: "(48) 99999-0004",
    joined: "2024-06-01", lastActivity: "2026-10-24", lastPost: "2026-10-21",
    fraudScore: 1, pastCampaigns: 5, totalSales: 12400, totalCommission: 1240, totalPosts: 56,
    memberType: "standard", level: "silver", origin: "organic",
  },
  {
    id: "c5",
    name: "Fernanda Costa",
    handle: "@fercostamoda",
    avatar: "FC",
    photo: "https://i.pravatar.cc/300?img=2",
    bio: "Estilista e consultora de imagem. Moda para todos os tipos e bolsos.",
    location: "São Paulo, SP",
    niche: ["moda", "lifestyle", "beleza"],
    networks: [
      { network: "instagram", handle: "@fercostamoda", followers: 890000, avgViews: 110000, engagementRate: 4.1, verified: true },
      { network: "tiktok", handle: "@fercostamoda", followers: 1200000, avgViews: 420000, engagementRate: 6.8, verified: true },
    ],
    totalFollowers: 2090000, avgEngagement: 5.5,
    audienceAge: [{ range: "18-24", pct: 44 }, { range: "25-34", pct: 39 }, { range: "35-44", pct: 13 }, { range: "45+", pct: 4 }],
    audienceGender: [{ label: "Feminino", pct: 91 }, { label: "Masculino", pct: 9 }],
    audienceLocation: [{ city: "São Paulo", pct: 38 }, { city: "Rio de Janeiro", pct: 20 }, { city: "Curitiba", pct: 7 }],
    score: 95, tier: "mega", tags: ["moda", "estilo", "consultoria", "tendências"],
    status: "in_campaign", approvalStatus: "approved",
    mediaValue: 12000, email: "fer@agencia.com", phone: "(11) 99999-0005",
    joined: "2023-08-14", lastActivity: "2026-10-27", lastPost: "2026-10-27",
    fraudScore: 2, pastCampaigns: 38, totalSales: 184000, totalCommission: 18400, totalPosts: 412,
    memberType: "ambassador", level: "platinum", origin: "invite",
  },
  {
    id: "c6",
    name: "Rafael Nunes",
    handle: "@rafaelgames",
    avatar: "RN",
    photo: "https://i.pravatar.cc/300?img=12",
    bio: "Streamer e criador de conteúdo gamer. Lives diárias e reviews de jogos.",
    location: "Belo Horizonte, MG",
    niche: ["games", "humor"],
    networks: [
      { network: "tiktok", handle: "@rafaelgames", followers: 445000, avgViews: 195000, engagementRate: 9.1, verified: false },
      { network: "youtube", handle: "Rafael Games BR", followers: 178000, avgViews: 65000, engagementRate: 5.3, verified: false },
    ],
    totalFollowers: 623000, avgEngagement: 7.2,
    audienceAge: [{ range: "13-17", pct: 22 }, { range: "18-24", pct: 51 }, { range: "25-34", pct: 21 }, { range: "35+", pct: 6 }],
    audienceGender: [{ label: "Masculino", pct: 82 }, { label: "Feminino", pct: 18 }],
    audienceLocation: [{ city: "Belo Horizonte", pct: 18 }, { city: "São Paulo", pct: 29 }, { city: "Brasília", pct: 11 }],
    score: 81, tier: "macro", tags: ["games", "stream", "humor", "entretenimento"],
    status: "available", approvalStatus: "approved",
    mediaValue: 3800, email: "rafael@gmail.com", phone: "(31) 99999-0006",
    joined: "2024-02-10", lastActivity: "2026-10-26", lastPost: "2026-10-25",
    fraudScore: 4, pastCampaigns: 9, totalSales: 28000, totalCommission: 2800, totalPosts: 98,
    memberType: "standard", level: "gold", origin: "organic",
  },
  {
    id: "c7",
    name: "Mariana Pinto",
    handle: "@marianaviagemreal",
    avatar: "MP",
    photo: "https://i.pravatar.cc/300?img=6",
    bio: "Viajante solo e nômade digital. Dicas reais de viagem para o Brasil e mundo.",
    location: "Nômade Digital",
    niche: ["viagem", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@marianaviagemreal", followers: 212000, avgViews: 28000, engagementRate: 5.9, verified: false },
      { network: "youtube", handle: "Mariana Viagem Real", followers: 89000, avgViews: 42000, engagementRate: 4.6, verified: false },
    ],
    totalFollowers: 301000, avgEngagement: 5.3,
    audienceAge: [{ range: "25-34", pct: 48 }, { range: "35-44", pct: 32 }, { range: "18-24", pct: 15 }, { range: "45+", pct: 5 }],
    audienceGender: [{ label: "Feminino", pct: 64 }, { label: "Masculino", pct: 36 }],
    audienceLocation: [{ city: "São Paulo", pct: 30 }, { city: "Rio de Janeiro", pct: 22 }, { city: "Exterior", pct: 18 }],
    score: 76, tier: "mid", tags: ["viagem", "nômade", "dicas", "travel"],
    status: "available", approvalStatus: "pending",
    mediaValue: 1800, email: "mariana@gmail.com", phone: "(11) 99999-0007",
    joined: "2024-05-22", lastActivity: "2026-10-22", lastPost: "2026-10-19",
    fraudScore: 2, pastCampaigns: 4, totalSales: 0, totalCommission: 0, totalPosts: 34,
    memberType: "standard", level: "bronze", origin: "brand_page",
  },
  {
    id: "c8",
    name: "Thiago Ribeiro",
    handle: "@thiagoinvestidor",
    avatar: "TR",
    photo: "https://i.pravatar.cc/300?img=11",
    bio: "Economista e investidor. Educação financeira descomplicada para jovens.",
    location: "São Paulo, SP",
    niche: ["finanças", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@thiagoinvestidor", followers: 158000, avgViews: 21000, engagementRate: 5.2, verified: false },
      { network: "youtube", handle: "Thiago Investidor", followers: 312000, avgViews: 88000, engagementRate: 3.8, verified: false },
    ],
    totalFollowers: 470000, avgEngagement: 4.5,
    audienceAge: [{ range: "18-24", pct: 31 }, { range: "25-34", pct: 52 }, { range: "35-44", pct: 13 }, { range: "45+", pct: 4 }],
    audienceGender: [{ label: "Masculino", pct: 67 }, { label: "Feminino", pct: 33 }],
    audienceLocation: [{ city: "São Paulo", pct: 41 }, { city: "Brasília", pct: 15 }, { city: "Rio de Janeiro", pct: 12 }],
    score: 83, tier: "mid", tags: ["finanças", "investimento", "economia", "educação"],
    status: "available", approvalStatus: "approved",
    mediaValue: 2900, email: "thiago@gmail.com", phone: "(11) 99999-0008",
    joined: "2024-04-03", lastActivity: "2026-10-25", lastPost: "2026-10-22",
    fraudScore: 1, pastCampaigns: 11, totalSales: 31000, totalCommission: 3100, totalPosts: 119,
    memberType: "vip", level: "gold", origin: "organic",
  },
  {
    id: "c9",
    name: "Amanda Oliveira",
    handle: "@amandamae",
    avatar: "AO",
    photo: "https://i.pravatar.cc/300?img=7",
    bio: "Mãe de dois, criadora de conteúdo sobre maternidade real e sem filtros.",
    location: "Campinas, SP",
    niche: ["maternidade", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@amandamae", followers: 178000, avgViews: 24000, engagementRate: 7.4, verified: false },
      { network: "tiktok", handle: "@amandamae", followers: 312000, avgViews: 88000, engagementRate: 10.2, verified: false },
    ],
    totalFollowers: 490000, avgEngagement: 8.8,
    audienceAge: [{ range: "25-34", pct: 52 }, { range: "35-44", pct: 31 }, { range: "18-24", pct: 12 }, { range: "45+", pct: 5 }],
    audienceGender: [{ label: "Feminino", pct: 94 }, { label: "Masculino", pct: 6 }],
    audienceLocation: [{ city: "São Paulo", pct: 38 }, { city: "Campinas", pct: 14 }, { city: "Rio de Janeiro", pct: 11 }],
    score: 87, tier: "mid", tags: ["maternidade", "família", "bebê", "parentalidade"],
    status: "available", approvalStatus: "approved",
    mediaValue: 3200, email: "amanda@gmail.com", phone: "(19) 99999-0009",
    joined: "2024-01-08", lastActivity: "2026-10-27", lastPost: "2026-10-26",
    fraudScore: 1, pastCampaigns: 8, totalSales: 22000, totalCommission: 2200, totalPosts: 96,
    memberType: "standard", level: "silver", origin: "organic",
  },
  {
    id: "c10",
    name: "Bruno Santos",
    handle: "@brunofit",
    avatar: "BS",
    photo: "https://i.pravatar.cc/300?img=13",
    bio: "Atleta amador e coach de corrida. Do 0 a maratona em 12 meses.",
    location: "Porto Alegre, RS",
    niche: ["fitness", "esportes", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@brunofit", followers: 96000, avgViews: 14000, engagementRate: 5.8, verified: false },
      { network: "youtube", handle: "Bruno Fit Channel", followers: 44000, avgViews: 18000, engagementRate: 4.1, verified: false },
    ],
    totalFollowers: 140000, avgEngagement: 5.0,
    audienceAge: [{ range: "18-24", pct: 29 }, { range: "25-34", pct: 51 }, { range: "35-44", pct: 17 }, { range: "45+", pct: 3 }],
    audienceGender: [{ label: "Masculino", pct: 62 }, { label: "Feminino", pct: 38 }],
    audienceLocation: [{ city: "Porto Alegre", pct: 28 }, { city: "São Paulo", pct: 22 }, { city: "Curitiba", pct: 12 }],
    score: 71, tier: "micro", tags: ["corrida", "maratona", "fitness", "esporte"],
    status: "available", approvalStatus: "pending",
    mediaValue: 900, email: "bruno@gmail.com", phone: "(51) 99999-0010",
    joined: "2026-09-15", lastActivity: "2026-10-20", lastPost: "2026-10-18",
    fraudScore: 1, pastCampaigns: 1, totalSales: 0, totalCommission: 0, totalPosts: 22,
    memberType: "standard", level: "bronze", origin: "brand_page",
  },
  {
    id: "c11",
    name: "Isabela Mendes",
    handle: "@isabelasustenta",
    avatar: "IM",
    photo: "https://i.pravatar.cc/300?img=9",
    bio: "Arquiteta e criadora de conteúdo sobre sustentabilidade, slow living e decoração consciente.",
    location: "São Paulo, SP",
    niche: ["sustentabilidade", "decoração", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@isabelasustenta", followers: 142000, avgViews: 19000, engagementRate: 6.3, verified: false },
      { network: "youtube", handle: "Isabela Sustenta", followers: 58000, avgViews: 22000, engagementRate: 4.8, verified: false },
    ],
    totalFollowers: 200000, avgEngagement: 5.6,
    audienceAge: [{ range: "25-34", pct: 44 }, { range: "35-44", pct: 35 }, { range: "18-24", pct: 16 }, { range: "45+", pct: 5 }],
    audienceGender: [{ label: "Feminino", pct: 79 }, { label: "Masculino", pct: 21 }],
    audienceLocation: [{ city: "São Paulo", pct: 42 }, { city: "Rio de Janeiro", pct: 18 }, { city: "BH", pct: 8 }],
    score: 78, tier: "micro", tags: ["sustentabilidade", "decoração", "slow living", "consciente"],
    status: "available", approvalStatus: "approved",
    mediaValue: 1400, email: "isabela@gmail.com", phone: "(11) 99999-0011",
    joined: "2024-07-12", lastActivity: "2026-10-23", lastPost: "2026-10-20",
    fraudScore: 2, pastCampaigns: 3, totalSales: 8400, totalCommission: 840, totalPosts: 41,
    memberType: "standard", level: "bronze", origin: "organic",
  },
  {
    id: "c12",
    name: "Giovanna Lopes",
    handle: "@giovannapet",
    avatar: "GL",
    photo: "https://i.pravatar.cc/300?img=4",
    bio: "Veterinária e tutora de 3 cachorros. Dicas de saúde e bem-estar animal.",
    location: "Ribeirão Preto, SP",
    niche: ["pets", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@giovannapet", followers: 88000, avgViews: 12000, engagementRate: 8.9, verified: false },
      { network: "tiktok", handle: "@giovannapet", followers: 195000, avgViews: 74000, engagementRate: 11.4, verified: false },
    ],
    totalFollowers: 283000, avgEngagement: 10.2,
    audienceAge: [{ range: "18-24", pct: 26 }, { range: "25-34", pct: 48 }, { range: "35-44", pct: 20 }, { range: "45+", pct: 6 }],
    audienceGender: [{ label: "Feminino", pct: 76 }, { label: "Masculino", pct: 24 }],
    audienceLocation: [{ city: "São Paulo", pct: 31 }, { city: "Ribeirão Preto", pct: 16 }, { city: "BH", pct: 9 }],
    score: 82, tier: "micro", tags: ["pets", "veterinária", "cachorros", "animais"],
    status: "available", approvalStatus: "approved",
    mediaValue: 1800, email: "giovanna@gmail.com", phone: "(16) 99999-0012",
    joined: "2024-02-28", lastActivity: "2026-10-27", lastPost: "2026-10-25",
    fraudScore: 1, pastCampaigns: 6, totalSales: 14200, totalCommission: 1420, totalPosts: 78,
    memberType: "standard", level: "silver", origin: "organic",
  },
  {
    id: "c13",
    name: "Henrique Campos",
    handle: "@henriquehair",
    avatar: "HC",
    photo: "https://i.pravatar.cc/300?img=15",
    bio: "Cabeleireiro e especialista em colorimetria. Transformações capilares todos os dias.",
    location: "São Paulo, SP",
    niche: ["beleza", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@henriquehair", followers: 224000, avgViews: 31000, engagementRate: 5.6, verified: true },
      { network: "tiktok", handle: "@henriquehair", followers: 418000, avgViews: 142000, engagementRate: 8.1, verified: false },
    ],
    totalFollowers: 642000, avgEngagement: 6.9,
    audienceAge: [{ range: "18-24", pct: 41 }, { range: "25-34", pct: 43 }, { range: "35-44", pct: 13 }, { range: "45+", pct: 3 }],
    audienceGender: [{ label: "Feminino", pct: 84 }, { label: "Masculino", pct: 16 }],
    audienceLocation: [{ city: "São Paulo", pct: 44 }, { city: "Rio de Janeiro", pct: 16 }, { city: "Curitiba", pct: 8 }],
    score: 86, tier: "macro", tags: ["cabelo", "colorimetria", "beleza", "transformação"],
    status: "available", approvalStatus: "approved",
    mediaValue: 4100, email: "henrique@gmail.com", phone: "(11) 99999-0013",
    joined: "2023-12-05", lastActivity: "2026-10-26", lastPost: "2026-10-25",
    fraudScore: 2, pastCampaigns: 16, totalSales: 48000, totalCommission: 4800, totalPosts: 178,
    memberType: "vip", level: "gold", origin: "invite",
  },
  {
    id: "c14",
    name: "Juliana Freitas",
    handle: "@judecordecasa",
    avatar: "JF",
    photo: "https://i.pravatar.cc/300?img=10",
    bio: "Designer de interiores e DIY lover. Decoração criativa com baixo orçamento.",
    location: "Brasília, DF",
    niche: ["decoração", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@judecordecasa", followers: 168000, avgViews: 22000, engagementRate: 5.1, verified: false },
      { network: "youtube", handle: "Ju Decor de Casa", followers: 72000, avgViews: 28000, engagementRate: 4.4, verified: false },
    ],
    totalFollowers: 240000, avgEngagement: 4.8,
    audienceAge: [{ range: "25-34", pct: 41 }, { range: "35-44", pct: 38 }, { range: "18-24", pct: 15 }, { range: "45+", pct: 6 }],
    audienceGender: [{ label: "Feminino", pct: 82 }, { label: "Masculino", pct: 18 }],
    audienceLocation: [{ city: "Brasília", pct: 24 }, { city: "São Paulo", pct: 29 }, { city: "Goiânia", pct: 10 }],
    score: 74, tier: "mid", tags: ["decoração", "DIY", "casa", "design"],
    status: "available", approvalStatus: "rejected",
    mediaValue: 1600, email: "juliana@gmail.com", phone: "(61) 99999-0014",
    joined: "2026-10-01", lastActivity: "2026-10-15", lastPost: "2026-10-12",
    fraudScore: 6, pastCampaigns: 0, totalSales: 0, totalCommission: 0, totalPosts: 8,
    memberType: "standard", level: "bronze", origin: "brand_page",
  },
  {
    id: "c15",
    name: "Diego Almeida",
    handle: "@diegorun",
    avatar: "DA",
    photo: "https://i.pravatar.cc/300?img=14",
    bio: "Ultra-corredor e aventureiro. Trilhas, montanhas e a busca pelo próximo desafio.",
    location: "Manaus, AM",
    niche: ["esportes", "viagem", "lifestyle"],
    networks: [
      { network: "instagram", handle: "@diegorun", followers: 64000, avgViews: 9200, engagementRate: 7.2, verified: false },
      { network: "youtube", handle: "Diego Run", followers: 28000, avgViews: 12000, engagementRate: 5.8, verified: false },
    ],
    totalFollowers: 92000, avgEngagement: 6.5,
    audienceAge: [{ range: "18-24", pct: 24 }, { range: "25-34", pct: 54 }, { range: "35-44", pct: 18 }, { range: "45+", pct: 4 }],
    audienceGender: [{ label: "Masculino", pct: 71 }, { label: "Feminino", pct: 29 }],
    audienceLocation: [{ city: "Manaus", pct: 22 }, { city: "São Paulo", pct: 24 }, { city: "Belém", pct: 11 }],
    score: 68, tier: "micro", tags: ["corrida", "trilha", "aventura", "ultramaratona"],
    status: "available", approvalStatus: "pending",
    mediaValue: 600, email: "diego@gmail.com", phone: "(92) 99999-0015",
    joined: "2026-10-10", lastActivity: "2026-10-24", lastPost: "2026-10-22",
    fraudScore: 2, pastCampaigns: 0, totalSales: 0, totalCommission: 0, totalPosts: 12,
    memberType: "standard", level: "bronze", origin: "brand_page",
  },
]
