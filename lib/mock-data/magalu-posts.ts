import type { MonitorPost, PostAiStatus } from "./metrics"

const CREATORS = {
  fernanda: { creatorId: "c5", creatorName: "Fernanda Costa", creatorHandle: "@fercostamoda", avatar: "FC" },
  rafael: { creatorId: "c6", creatorName: "Rafael Nunes", creatorHandle: "@rafaelgames", avatar: "RN" },
  bianca: { creatorId: "c1", creatorName: "Bianca Torres", creatorHandle: "@biancatorres", avatar: "BT" },
  lucas: { creatorId: "c4", creatorName: "Lucas Oliveira", creatorHandle: "@lucasotech", avatar: "LO" },
  juliana: { creatorId: "c14", creatorName: "Juliana Freitas", creatorHandle: "@judecordecasa", avatar: "JF" },
  isabela: { creatorId: "c11", creatorName: "Isabela Mendes", creatorHandle: "@isabelasustenta", avatar: "IM" },
} as const

const CAMPAIGN_NAMES = {
  camp5: "Black Friday Magalu 2026",
  camp7: "Magalu Casa & Decor — Novo App",
} as const

function cover(photoId: string) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=720&h=900&q=75`
}

const COVER_IMAGES: Record<keyof typeof CREATORS, string[]> = {
  fernanda: [
    "photo-1483985988355-763728e1935b",
    "photo-1515886657613-9f3515b0c78f",
    "photo-1490481651871-ab68de25d43d",
    "photo-1469334031218-e382a71b716b",
    "photo-1524504388940-b1c1722653e1",
    "photo-1445205170230-053b83016050",
    "photo-1556905055-8f358a7a47b2",
    "photo-1593359677879-a4bb92f829d1",
    "photo-1556228578-0d85b1a4d571",
    "photo-1542291026-7eec264c27ff",
  ],
  bianca: [
    "photo-1596462502278-27bfdc403348",
    "photo-1522335789203-aabd1fc54bc9",
    "photo-1487412947147-5cebf100ffc2",
    "photo-1522338242992-e1a54906a8da",
    "photo-1512496015851-a90fb38ba796",
    "photo-1571781926291-c477ebfd024b",
    "photo-1616683693504-3ea7e9ad6fec",
    "photo-1560750588-73207b1ef5b8",
  ],
  rafael: [
    "photo-1542751371-adc38448a05e",
    "photo-1552820728-8b83bb6b773f",
    "photo-1606144042614-b2417e99c4e3",
    "photo-1511512578047-dfb367046420",
    "photo-1493711662062-fa541adb3fc8",
    "photo-1538481199705-c710c4e965fc",
    "photo-1593640408182-31c70c8268f5",
    "photo-1550745165-9bc0b252726f",
  ],
  lucas: [
    "photo-1517336714731-489689fd1ca8",
    "photo-1510557880182-3d4d3cba35a5",
    "photo-1511707171634-5f897ff02aa9",
    "photo-1505740420928-5e560c06d30e",
    "photo-1550009158-9ebf69173e03",
    "photo-1587829741301-dc798b83add3",
  ],
  juliana: [
    "photo-1618221195710-dd6b41faaea6",
    "photo-1586023492125-27b2c045efd7",
    "photo-1616486338812-3dadae4b4ace",
    "photo-1555041469-a586c61ea9bc",
    "photo-1615874959474-d609969a20ed",
    "photo-1567016432779-094069958ea5",
  ],
  isabela: [
    "photo-1616046229478-9901c5536a45",
    "photo-1617103996702-96ff29b1c467",
    "photo-1618220179428-22790b461013",
    "photo-1616486338812-3dadae4b4ace",
  ],
}

const coverCursor: Record<string, number> = {}

function nextCover(creator: keyof typeof CREATORS) {
  const pool = COVER_IMAGES[creator]
  const cursor = coverCursor[creator] ?? 0
  coverCursor[creator] = cursor + 1
  return cover(pool[cursor % pool.length])
}

type Seed = {
  creator: keyof typeof CREATORS
  campaignId: keyof typeof CAMPAIGN_NAMES
  network: MonitorPost["network"]
  type: MonitorPost["type"]
  publishedAt: string
  reach: number
  engagement: number
  aiStatus: PostAiStatus
  aiScore: number
  caption: string
  aiVerdict: string
  aiIssues?: string[]
  humanRating?: number
}

function splitEngagement(reach: number, engagement: number, type: MonitorPost["type"]) {
  const interactions = Math.max(1, Math.round(reach * (engagement / 100)))
  const video = type === "tiktok" || type === "video_youtube"
  const shares = Math.round(
    interactions * (type === "tiktok" ? 0.22 : type === "video_youtube" ? 0.12 : type === "stories" ? 0.08 : 0.1)
  )
  const comments = Math.round(interactions * (type === "tiktok" ? 0.06 : 0.05))
  const saves = video ? 0 : Math.round(interactions * (type === "stories" ? 0.12 : 0.16))
  const likes = Math.max(0, interactions - shares - comments - saves)
  const views =
    type === "tiktok" ? Math.round(reach * 2.6) : type === "video_youtube" ? Math.round(reach * 1.18) : undefined
  return { likes, comments, shares, saves, views }
}

const SEEDS: Seed[] = [
  // ── Fernanda Costa · Black Friday (4 TikTok, 4 Reels, 10 Stories) ──
  {
    creator: "fernanda", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-21", reach: 980000, engagement: 18.4,
    aiStatus: "aprovado", aiScore: 98, humanRating: 5,
    caption: "A TV de 65\" que eu escolhi na Black Friday Magalu chegou e o unboxing foi cinematográfico. Cupom FERMAGA30 no app. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Unboxing alinhado ao briefing. Hashtags, menção e cupom presentes, com produto em destaque o tempo todo.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-24", reach: 820000, engagement: 15.2,
    aiStatus: "aprovado", aiScore: 95, humanRating: 5,
    caption: "Provador de vestidos da Black Friday: três looks, um cupom. FERMAGA30 no Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Prova de produto natural e CTA claro para o app. Todos os requisitos obrigatórios atendidos.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-27", reach: 740000, engagement: 21.6,
    aiStatus: "aprovado", aiScore: 99, humanRating: 5,
    caption: "Jantar de sexta em 20 minutos com a air fryer que peguei no Magalu. Link e cupom FERMAGA30 nos comentários fixados. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Conteúdo de alta performance. Produto integrado à rotina e cupom legível na tela.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-29", reach: 610000, engagement: 16.8,
    aiStatus: "aprovado", aiScore: 94, humanRating: 4,
    caption: "Últimas horas de Black Friday. Separei o que ainda vale a pena no Magalu antes de acabar o estoque. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "CTA de urgência coerente com o fim da campanha. Menção e hashtags corretas.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-20", reach: 420000, engagement: 11.2,
    aiStatus: "aprovado", aiScore: 96, humanRating: 5,
    caption: "O perfume que esgotou em duas horas na Black Friday Magalu. Ainda dá tempo com FERMAGA30. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Produto em close, hashtags obrigatórias e menção à marca presentes.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-23", reach: 310000, engagement: 9.4,
    aiStatus: "aprovado", aiScore: 92, humanRating: 4,
    caption: "Tênis branco novo, unboxing no sofá e o cupom FERMAGA30 na legenda. Comprei pelo app Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Execução correta. Cupom e link de afiliado citados na legenda.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-26", reach: 240000, engagement: 8.7,
    aiStatus: "aprovado", aiScore: 93, humanRating: 4,
    caption: "Kit de skincare com 40% off na Black Friday. Mostrei textura, cheiro e o preço final no app. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Demonstração de produto completa e preço final exibido. Briefing atendido.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-28", reach: 180000, engagement: 10.1,
    aiStatus: "aprovado", aiScore: 91, humanRating: 4,
    caption: "Troquei de celular no meio da Black Friday e gravei a migração inteira. Aparelho saiu do Magalu com FERMAGA30. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Narrativa de compra real, com marca e cupom identificáveis.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-20", reach: 145000, engagement: 4.2,
    aiStatus: "aprovado", aiScore: 90, humanRating: 4,
    caption: "Stories de abertura: contagem regressiva da Black Friday Magalu e lembrete do cupom FERMAGA30. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Sequência de stories com sticker de link e hashtags obrigatórias.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-21", reach: 120000, engagement: 3.8,
    aiStatus: "aprovado", aiScore: 88, humanRating: 4,
    caption: "Bastidores do unboxing da TV, com enquete de qual tamanho a audiência compraria. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Stories complementares ao TikTok, com marca visível e enquete no tema.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-22", reach: 98000, engagement: 5.1,
    aiStatus: "aprovado", aiScore: 94, humanRating: 5,
    caption: "Caixa de perguntas: respondi dúvida de frete, prazo e parcelamento do Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Conteúdo útil de objeção de compra. Menção à marca em todos os frames.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-23", reach: 92000, engagement: 3.4,
    aiStatus: "aprovado", aiScore: 89, humanRating: 4,
    caption: "Try-on rápido dos vestidos com link direto para a vitrine da Black Friday. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Link sticker ativo e produtos identificáveis. Requisitos atendidos.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-24", reach: 86000, engagement: 4.6,
    aiStatus: "aprovado", aiScore: 90,
    caption: "Cupom FERMAGA30 em destaque no story, com print do desconto aplicado no carrinho. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Prova visual do cupom aplicado. Hashtags e menção presentes.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-25", reach: 78000, engagement: 2.9,
    aiStatus: "alerta", aiScore: 71, humanRating: 3,
    caption: "Look do dia com peças que comprei na promoção. O cupom está no link, corre que acaba hoje.",
    aiVerdict: "Peças da campanha aparecem, mas as hashtags obrigatórias e a menção à marca ficaram de fora.",
    aiIssues: ["#BlackFridayMagalu ausente", "#Magalu ausente", "@magazineluiza não mencionado"],
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-26", reach: 72000, engagement: 3.6,
    aiStatus: "aprovado", aiScore: 92, humanRating: 4,
    caption: "Review relâmpago do kit de skincare, com antes e depois da textura. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Produto da vitrine em primeiro plano e requisitos de texto atendidos.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-27", reach: 69000, engagement: 4.0,
    aiStatus: "alerta", aiScore: 74, humanRating: 3,
    caption: "Air fryer em uso no jantar. Esqueci de cravar o cupom na tela, mas o link do Magalu está no sticker. #Magalu @magazineluiza",
    aiVerdict: "Marca presente, porém a hashtag principal da campanha e o cupom não aparecem.",
    aiIssues: ["#BlackFridayMagalu ausente", "Cupom FERMAGA30 não exibido"],
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-28", reach: 64000, engagement: 3.1,
    aiStatus: "aprovado", aiScore: 87,
    caption: "Migração do celular antigo para o novo, comprado no Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Stories coerentes com o Reels do mesmo dia. Requisitos mínimos ok.",
  },
  {
    creator: "fernanda", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-29", reach: 76000, engagement: 5.4,
    aiStatus: "aprovado", aiScore: 97, humanRating: 5,
    caption: "Story final da Black Friday: o que eu compraria de novo e o que deixaria passar. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Encerramento claro, com recap de ofertas e menção correta à marca.",
  },

  // ── Rafael Nunes · Black Friday (5 TikTok, 2 YouTube, 1 Reels) ──
  {
    creator: "rafael", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-21", reach: 720000, engagement: 24.5,
    aiStatus: "aprovado", aiScore: 97, humanRating: 5,
    caption: "Montei um setup gamer completo só com oferta da Black Friday Magalu. Cupom RAFAGAMES25 na tela. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Setup demonstrado peça a peça, com cupom e hashtags obrigatórias.",
  },
  {
    creator: "rafael", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-23", reach: 640000, engagement: 19.2,
    aiStatus: "aprovado", aiScore: 94, humanRating: 5,
    caption: "Teste do headset sem fio no ranked. Comprei no Magalu e o preço cabe no cupom RAFAGAMES25. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Produto em uso real e CTA para o app. Briefing atendido.",
  },
  {
    creator: "rafael", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-25", reach: 510000, engagement: 16.8,
    aiStatus: "reprovado", aiScore: 34, humanRating: 1,
    caption: "Gameplay do lançamento da semana. Setup novo, mas a loja que usei não foi a da campanha. #games #setup",
    aiVerdict: "Vídeo sem relação explícita com o Magalu. Nenhuma hashtag obrigatória e uma loja concorrente aparece na descrição.",
    aiIssues: ["Loja concorrente citada", "#BlackFridayMagalu ausente", "#Magalu ausente", "@magazineluiza não mencionado", "Cupom RAFAGAMES25 ausente"],
  },
  {
    creator: "rafael", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-27", reach: 430000, engagement: 14.1,
    aiStatus: "aprovado", aiScore: 91, humanRating: 4,
    caption: "Console + dois controles na Black Friday. Mostrei o parcelamento no app Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Oferta, preço e marca visíveis. Requisitos de texto ok.",
  },
  {
    creator: "rafael", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-28", reach: 380000, engagement: 11.6,
    aiStatus: "aprovado", aiScore: 89, humanRating: 4,
    caption: "Ranking das 5 ofertas gamer que ainda estão de pé no Magalu. RAFAGAMES25 no final. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Lista de produtos da vitrine oficial, com cupom no encerramento.",
  },
  {
    creator: "rafael", campaignId: "camp5", network: "youtube", type: "video_youtube",
    publishedAt: "2026-11-22", reach: 620000, engagement: 4.8,
    aiStatus: "aprovado", aiScore: 96, humanRating: 5,
    caption: "Review completo: notebook gamer da Black Friday Magalu, com benchmarks e o cupom RAFAGAMES25 na descrição. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Review longo dentro do briefing. Link de afiliado, cupom e menção na descrição e no vídeo.",
  },
  {
    creator: "rafael", campaignId: "camp5", network: "youtube", type: "video_youtube",
    publishedAt: "2026-11-26", reach: 340000, engagement: 3.6,
    aiStatus: "alerta", aiScore: 69, humanRating: 3,
    caption: "Comparativo de monitores 144 Hz. Os dois modelos estão em promoção, mas a hashtag da campanha ficou só no card final. @magazineluiza",
    aiVerdict: "Produtos corretos e menção presente, porém #BlackFridayMagalu e #Magalu não entram na fala nem na descrição.",
    aiIssues: ["#BlackFridayMagalu ausente na descrição", "#Magalu ausente", "Cupom RAFAGAMES25 só no card final"],
  },
  {
    creator: "rafael", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-24", reach: 160000, engagement: 8.9,
    aiStatus: "aprovado", aiScore: 92, humanRating: 4,
    caption: "Versão curta do setup: mesa, cadeira e monitor que saíram do Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Recorte fiel do conteúdo principal, com todos os obrigatórios.",
  },

  // ── Bianca Torres · Black Friday (4 Reels, 6 Stories, 2 Feed) ──
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-21", reach: 380000, engagement: 12.4,
    aiStatus: "aprovado", aiScore: 97, humanRating: 5,
    caption: "GRWM de Black Friday com a paleta e o secador que comprei no Magalu. Cupom BIANCAMAGA20. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Beleza integrada à oferta, sem desviar o foco do produto. Briefing completo.",
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-24", reach: 290000, engagement: 10.8,
    aiStatus: "aprovado", aiScore: 93, humanRating: 4,
    caption: "Chapinha nova, cabelo lisinho e o preço riscado na tela do app Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Demonstração clara e preço final visível. Hashtags corretas.",
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-27", reach: 210000, engagement: 9.2,
    aiStatus: "alerta", aiScore: 73, humanRating: 3,
    caption: "Tutorial de make com a base que está em promoção. #BlackFridayMagalu #Magalu",
    aiVerdict: "Hashtags ok, mas a menção obrigatória @magazineluiza não aparece na legenda nem na fala.",
    aiIssues: ["@magazineluiza não mencionado", "Cupom BIANCAMAGA20 ausente"],
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-30", reach: 160000, engagement: 7.6,
    aiStatus: "aprovado", aiScore: 90, humanRating: 4,
    caption: "Último dia: o que ainda está com estoque no Magalu de beleza. BIANCAMAGA20 segue ativo. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Encerramento dentro da janela da campanha, com cupom e marca.",
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-22", reach: 140000, engagement: 4.1,
    aiStatus: "aprovado", aiScore: 91, humanRating: 4,
    caption: "Stories do GRWM com close nos produtos e sticker de link do Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Sequência coerente com o Reels. Link e hashtags presentes.",
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-23", reach: 120000, engagement: 3.5,
    aiStatus: "aprovado", aiScore: 88, humanRating: 4,
    caption: "Enquete: base matte ou glow? As duas estão na seleção Black Friday Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Enquete no tema da campanha e marca identificável.",
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-25", reach: 110000, engagement: 5.2,
    aiStatus: "aprovado", aiScore: 95, humanRating: 5,
    caption: "Print do pedido confirmado no app, com o desconto BIANCAMAGA20 aplicado. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Prova de conversão sem expor dados sensíveis. Excelente aderência.",
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-26", reach: 95000, engagement: 2.8,
    aiStatus: "alerta", aiScore: 66, humanRating: 2,
    caption: "Rotina da noite com vários potes na bancada. Ficou difícil saber o que é da campanha.",
    aiVerdict: "Produto da campanha pouco identificável e texto obrigatório ausente.",
    aiIssues: ["Produto da campanha pouco visível", "#BlackFridayMagalu ausente", "@magazineluiza não mencionado"],
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-28", reach: 88000, engagement: 3.9,
    aiStatus: "aprovado", aiScore: 90,
    caption: "Perguntas da caixinha sobre indicação de presente de beleza até R$ 150 no Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Respostas objetivas, com produtos da vitrine e menção correta.",
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "stories",
    publishedAt: "2026-11-30", reach: 72000, engagement: 4.4,
    aiStatus: "aprovado", aiScore: 92, humanRating: 4,
    caption: "Recap do mês: três compras de Black Friday que eu repetiria. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Fechamento alinhado. Hashtags e marca ok.",
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "post_feed",
    publishedAt: "2026-11-20", reach: 240000, engagement: 6.8,
    aiStatus: "aprovado", aiScore: 94, humanRating: 5,
    caption: "Flat lay da seleção de beleza da Black Friday Magalu. Tudo com BIANCAMAGA20. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Foto de catálogo com produtos etiquetados e texto completo.",
  },
  {
    creator: "bianca", campaignId: "camp5", network: "instagram", type: "post_feed",
    publishedAt: "2026-11-29", reach: 195000, engagement: 5.9,
    aiStatus: "aprovado", aiScore: 91, humanRating: 4,
    caption: "Carrossel de antes e depois usando só itens comprados no Magalu nesta Black Friday. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Carrossel dentro do escopo. Menção e hashtags em cada slide relevante.",
  },

  // ── Lucas Oliveira · Black Friday (2 YouTube, 2 Reels, 2 TikTok) ──
  {
    creator: "lucas", campaignId: "camp5", network: "youtube", type: "video_youtube",
    publishedAt: "2026-11-21", reach: 310000, engagement: 5.2,
    aiStatus: "aprovado", aiScore: 95, humanRating: 5,
    caption: "Vale a pena o smartphone da Black Friday Magalu? Teste de câmera, bateria e o cupom LUCASTECH15. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Review técnico com CTA e cupom na descrição. Briefing atendido.",
  },
  {
    creator: "lucas", campaignId: "camp5", network: "youtube", type: "video_youtube",
    publishedAt: "2026-11-27", reach: 240000, engagement: 4.1,
    aiStatus: "aprovado", aiScore: 90, humanRating: 4,
    caption: "Fone bluetooth por menos de R$ 200 no Magalu: medi o cancelamento de ruído e comparei com o modelo do ano passado. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Comparativo justo, produto da campanha identificado e link na descrição.",
  },
  {
    creator: "lucas", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-23", reach: 145000, engagement: 7.4,
    aiStatus: "aprovado", aiScore: 92, humanRating: 4,
    caption: "30 segundos para decidir se o robô aspirador da Black Friday presta. Spoiler: presta. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Demo curta e objetiva, com marca e hashtags.",
  },
  {
    creator: "lucas", campaignId: "camp5", network: "instagram", type: "reels",
    publishedAt: "2026-11-26", reach: 98000, engagement: 6.2,
    aiStatus: "alerta", aiScore: 70, humanRating: 3,
    caption: "Unboxing do notebook. Esqueci de falar o cupom em voz alta, mas #Magalu e @magazineluiza estão na legenda.",
    aiVerdict: "Marca presente, porém #BlackFridayMagalu e o cupom LUCASTECH15 não aparecem.",
    aiIssues: ["#BlackFridayMagalu ausente", "Cupom LUCASTECH15 não mencionado"],
  },
  {
    creator: "lucas", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-22", reach: 112000, engagement: 13.8,
    aiStatus: "aprovado", aiScore: 93, humanRating: 4,
    caption: "POV: configurando a casa inteligente que montei com ofertas do Magalu. #BlackFridayMagalu #Magalu @magazineluiza",
    aiVerdict: "Produtos da seleção de tecnologia e texto obrigatório completo.",
  },
  {
    creator: "lucas", campaignId: "camp5", network: "tiktok", type: "tiktok",
    publishedAt: "2026-11-25", reach: 75000, engagement: 9.5,
    aiStatus: "reprovado", aiScore: 22, humanRating: 1,
    caption: "Comprei esse echo no site errado e só percebi depois. Não usem meu cupom aqui. #tecnologia",
    aiVerdict: "Compra atribuída a outro varejista. Fora do escopo e sem qualquer obrigatório da campanha.",
    aiIssues: ["Varejista concorrente em destaque", "Produto não comprado no Magalu", "Nenhum hashtag obrigatório", "@magazineluiza ausente"],
  },

  // ── Juliana Freitas · Casa & Decor (3 Reels, 3 Stories) ──
  {
    creator: "juliana", campaignId: "camp7", network: "instagram", type: "reels",
    publishedAt: "2026-10-18", reach: 42000, engagement: 6.4,
    aiStatus: "aprovado", aiScore: 94, humanRating: 5,
    caption: "Projetei a sala inteira no modo realidade aumentada do app Magalu antes de comprar o sofá. #MagaluCasaDecor #AppMagalu #DecoraçãoAR @magazineluiza",
    aiVerdict: "Funcionalidade de RA demonstrada do início ao fim. Hashtags e menção ok.",
  },
  {
    creator: "juliana", campaignId: "camp7", network: "instagram", type: "reels",
    publishedAt: "2026-10-22", reach: 28000, engagement: 5.1,
    aiStatus: "aprovado", aiScore: 91, humanRating: 4,
    caption: "Troca de luminária: medi o canto com o app e o modelo encaixou certinho. #MagaluCasaDecor #AppMagalu #DecoraçãoAR @magazineluiza",
    aiVerdict: "Uso real da ferramenta de RA, com produto do módulo Casa & Decor.",
  },
  {
    creator: "juliana", campaignId: "camp7", network: "instagram", type: "reels",
    publishedAt: "2026-10-26", reach: 18000, engagement: 4.2,
    aiStatus: "reprovado", aiScore: 31, humanRating: 1,
    caption: "Reforma do quarto com móveis que comprei em outra loja. Ficou lindo, mas não é o app da campanha.",
    aiVerdict: "Conteúdo de decoração sem o app Magalu e com móveis de outro varejista.",
    aiIssues: ["App Magalu não demonstrado", "Móveis de outro varejista", "#MagaluCasaDecor ausente", "@magazineluiza ausente"],
  },
  {
    creator: "juliana", campaignId: "camp7", network: "instagram", type: "stories",
    publishedAt: "2026-10-19", reach: 14000, engagement: 3.2,
    aiStatus: "aprovado", aiScore: 89, humanRating: 4,
    caption: "Stories do teste de RA: sofá azul, verde e areia no mesmo canto. #MagaluCasaDecor #AppMagalu #DecoraçãoAR @magazineluiza",
    aiVerdict: "Complemento do Reels, com a ferramenta em uso e texto completo.",
  },
  {
    creator: "juliana", campaignId: "camp7", network: "instagram", type: "stories",
    publishedAt: "2026-10-23", reach: 9000, engagement: 2.6,
    aiStatus: "alerta", aiScore: 68, humanRating: 3,
    caption: "Tour pela sala nova. Os móveis são do Magalu, mas não abri a realidade aumentada. #MagaluCasaDecor @magazineluiza",
    aiVerdict: "Marca citada, porém a funcionalidade central da campanha (RA) não foi mostrada.",
    aiIssues: ["Realidade aumentada não demonstrada", "#AppMagalu ausente", "#DecoraçãoAR ausente"],
  },
  {
    creator: "juliana", campaignId: "camp7", network: "instagram", type: "stories",
    publishedAt: "2026-10-27", reach: 7000, engagement: 3.8,
    aiStatus: "alerta", aiScore: 72, humanRating: 3,
    caption: "Detalhe do tapete e do abajur comprados pelo app. #AppMagalu #DecoraçãoAR @magazineluiza",
    aiVerdict: "Produtos corretos, mas a hashtag principal #MagaluCasaDecor ficou de fora.",
    aiIssues: ["#MagaluCasaDecor ausente"],
  },

  // ── Isabela Mendes · Casa & Decor (2 Feed, 2 Stories) ──
  {
    creator: "isabela", campaignId: "camp7", network: "instagram", type: "post_feed",
    publishedAt: "2026-10-17", reach: 32000, engagement: 7.1,
    aiStatus: "aprovado", aiScore: 96, humanRating: 5,
    caption: "Cantinho de leitura montado com peças vistas antes no app Magalu, em realidade aumentada. Menos compra por impulso. #MagaluCasaDecor #AppMagalu #DecoraçãoAR @magazineluiza",
    aiVerdict: "Mensagem alinhada ao objetivo de downloads. Todos os obrigatórios presentes.",
  },
  {
    creator: "isabela", campaignId: "camp7", network: "instagram", type: "post_feed",
    publishedAt: "2026-10-24", reach: 24000, engagement: 5.4,
    aiStatus: "aprovado", aiScore: 90, humanRating: 4,
    caption: "Carrossel: o que eu coloquei no carrinho versus o que a RA mostrou que não cabia. #MagaluCasaDecor #AppMagalu #DecoraçãoAR @magazineluiza",
    aiVerdict: "Uso didático da ferramenta. Hashtags e menção corretas.",
  },
  {
    creator: "isabela", campaignId: "camp7", network: "instagram", type: "stories",
    publishedAt: "2026-10-20", reach: 16000, engagement: 3.3,
    aiStatus: "aprovado", aiScore: 88, humanRating: 4,
    caption: "Passo a passo de como abrir o módulo Casa & Decor no app. #MagaluCasaDecor #AppMagalu #DecoraçãoAR @magazineluiza",
    aiVerdict: "Tutorial curto e fiel ao briefing de awareness da funcionalidade.",
  },
  {
    creator: "isabela", campaignId: "camp7", network: "instagram", type: "stories",
    publishedAt: "2026-10-26", reach: 12000, engagement: 2.9,
    aiStatus: "alerta", aiScore: 67, humanRating: 2,
    caption: "Mostrei a estante nova pelo app Magalu, mas faltou a hashtag de realidade aumentada. #MagaluCasaDecor #AppMagalu @magazineluiza",
    aiVerdict: "Quase completo. Falta apenas #DecoraçãoAR, obrigatória no briefing.",
    aiIssues: ["#DecoraçãoAR ausente"],
  },
]

export const MAGALU_MONITOR_POSTS: MonitorPost[] = SEEDS.map((seed, index) => {
  const creator = CREATORS[seed.creator]
  const metrics = splitEngagement(seed.reach, seed.engagement, seed.type)
  return {
    id: `magalu-${String(index + 1).padStart(2, "0")}`,
    campaignId: seed.campaignId,
    campaignName: CAMPAIGN_NAMES[seed.campaignId],
    ...creator,
    image: nextCover(seed.creator),
    network: seed.network,
    type: seed.type,
    publishedAt: seed.publishedAt,
    reach: seed.reach,
    ...metrics,
    engagement: seed.engagement,
    url: "#",
    caption: seed.caption,
    aiStatus: seed.aiStatus,
    aiScore: seed.aiScore,
    aiVerdict: seed.aiVerdict,
    aiIssues: seed.aiIssues,
    humanRating: seed.humanRating,
  }
})
