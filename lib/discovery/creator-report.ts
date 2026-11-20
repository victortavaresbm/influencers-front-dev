import { CREATORS, type Creator } from "@/lib/mock-data/creators"
import {
  TODAY,
  accountTypeOf,
  creatorPosts,
  fakeFollowersPct,
  formatCompact,
  platformProfile,
  type AccountType,
  type Platform,
} from "@/lib/discovery/discover-query"
import { buildProfileWidgets, formatBRL, riskLabel } from "@/lib/discovery/profile-widgets"

export interface ShareRow {
  label: string
  pct: number
}

export interface GrowthPoint {
  label: string
  value: number
}

export interface ReportPost {
  id: string
  image?: string
  likes: number
  comments: number
  caption: string
}

export interface ReportStat {
  label: string
  value: string
}

export interface CompareRow {
  label: string
  likers: string
  followers: string
}

export interface AudienceBlock {
  gender: ShareRow[]
  age: ShareRow[]
  countries: ShareRow[]
  cities: ShareRow[]
  languages: ShareRow[]
}

export interface CreatorReport {
  fileName: string
  generatedOn: string
  name: string
  handle: string
  photo: string
  networkLabel: string
  accountLine: string
  bio: string
  followersLabel: string
  followerGrowthLabel: string
  avgLikesLabel: string
  likesDeltaLabel: string
  engagementLabel: string
  engagementNote: string
  postsEstimated: boolean
  posts: ReportPost[]
  followerTotalLabel: string
  fakeFollowersLabel: string
  fakeComparison: string
  audienceMix: ShareRow[]
  reachability: ShareRow[]
  followerGrowth: GrowthPoint[]
  likesGrowth: GrowthPoint[]
  content: ReportStat[]
  reelsTitle: string
  reels: ReportStat[]
  stories: ReportStat[] | null
  collaborations: ReportStat[]
  brands: ShareRow[]
  interests: ShareRow[]
  hashtags: ShareRow[]
  hashtagsNote: string | null
  mentions: ShareRow[]
  mentionsNote: string | null
  genderTable: CompareRow[]
  interestTable: CompareRow[]
  brandTable: CompareRow[]
  followerAudience: AudienceBlock
  likerAudience: AudienceBlock
  priceLabel: string
  credibilityLabel: string
  safety: ReportStat[]
  grades: ReportStat[]
}

const NETWORK_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
}

const ACCOUNT_LINE: Record<AccountType, string> = {
  creator: "Conta de creator",
  creator_group: "Grupo de creators",
  brand: "Conta de marca",
  anonymous: "Conta anônima",
}

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]

const INTERESTS: Record<string, string[]> = {
  beleza: ["Beleza e cuidados", "Moda e acessórios", "Saúde e bem-estar", "Família", "Comida e mercado", "Viagem"],
  moda: ["Moda e acessórios", "Beleza e cuidados", "Compras", "Lifestyle", "Viagem", "Arte e design"],
  fitness: ["Esporte e fitness", "Saúde e bem-estar", "Comida e mercado", "Lifestyle", "Roupa esportiva", "Viagem"],
  gastronomia: ["Comida e mercado", "Restaurantes", "Família", "Viagem", "Lifestyle", "Casa"],
  tecnologia: ["Eletrônicos", "Games", "Trabalho e carreira", "Compras", "Lifestyle", "Viagem"],
  humor: ["Entretenimento", "Família", "Comida e mercado", "Games", "Música", "Viagem"],
  games: ["Games", "Eletrônicos", "Entretenimento", "Esportes", "Música", "Compras"],
  finanças: ["Finanças", "Trabalho e carreira", "Tecnologia", "Compras", "Família", "Viagem"],
  viagem: ["Viagem", "Fotografia", "Comida e mercado", "Lifestyle", "Moda e acessórios", "Família"],
  maternidade: ["Família", "Bebês e crianças", "Saúde e bem-estar", "Casa", "Comida e mercado", "Beleza e cuidados"],
  sustentabilidade: ["Sustentabilidade", "Casa", "Comida e mercado", "Beleza e cuidados", "Viagem", "Família"],
  pets: ["Pets", "Família", "Casa", "Comida e mercado", "Lifestyle", "Viagem"],
  decoração: ["Casa", "Arte e design", "Compras", "Família", "Lifestyle", "Comida e mercado"],
  esportes: ["Esporte e fitness", "Roupa esportiva", "Saúde e bem-estar", "Viagem", "Lifestyle", "Entretenimento"],
  lifestyle: ["Lifestyle", "Viagem", "Comida e mercado", "Moda e acessórios", "Família", "Beleza e cuidados"],
}

const BRANDS: Record<string, string[]> = {
  beleza: ["Natura", "O Boticário", "Avon", "Quem Disse, Berenice?", "Salon Line", "Dove"],
  moda: ["Renner", "C&A", "Farm", "Arezzo", "Hering", "Schutz"],
  fitness: ["Nike", "Adidas", "Growth", "Smart Fit", "Centauro", "Olympikus"],
  gastronomia: ["iFood", "Nestlé", "Sadia", "Bauducco", "Qualy", "Heineken"],
  tecnologia: ["Samsung", "Apple", "Magalu", "Xiaomi", "Dell", "Motorola"],
  humor: ["Netflix", "iFood", "Nubank", "Magalu", "YouTube", "Amazon"],
  games: ["PlayStation", "Xbox", "Nintendo", "Riot", "Razer", "Magalu"],
  finanças: ["Nubank", "Inter", "XP", "Itaú", "PicPay", "Mercado Pago"],
  viagem: ["Decolar", "Airbnb", "Latam", "Azul", "Booking", "Localiza"],
  maternidade: ["Pampers", "Huggies", "Johnson's", "Natura", "Fisher-Price", "Pampers"],
  sustentabilidade: ["Natura", "Positiv.a", "Reserva", "Insecta", "Pantys", "O Boticário"],
  pets: ["Petz", "Pedigree", "Whiskas", "Zee.Dog", "Royal Canin", "Premier"],
  decoração: ["Tok&Stok", "Etna", "MadeiraMadeira", "Leroy Merlin", "Mobly", "Camicado"],
  esportes: ["Nike", "Adidas", "Centauro", "Olympikus", "Penalty", "Asics"],
  lifestyle: ["Natura", "Magalu", "Airbnb", "Netflix", "iFood", "Renner"],
}

const TAGS: Record<string, string[]> = {
  beleza: ["#skincare", "#beleza", "#maquiagem", "#rotina", "#cuidados"],
  moda: ["#moda", "#lookdodia", "#estilo", "#ootd", "#tendencia"],
  fitness: ["#treino", "#fitness", "#saude", "#rotina", "#corrida"],
  gastronomia: ["#receita", "#comida", "#cozinha", "#gastronomia", "#delivery"],
  tecnologia: ["#tecnologia", "#review", "#gadget", "#setup", "#unboxing"],
  humor: ["#humor", "#comedia", "#engracado", "#reels", "#viral"],
  games: ["#games", "#gameplay", "#gamer", "#live", "#setup"],
  finanças: ["#financas", "#dinheiro", "#investimentos", "#dicas", "#carreira"],
  viagem: ["#viagem", "#travel", "#roteiro", "#ferias", "#destino"],
  maternidade: ["#maternidade", "#familia", "#bebe", "#rotina", "#casa"],
  sustentabilidade: ["#sustentabilidade", "#consumo", "#refil", "#meioambiente", "#casa"],
  pets: ["#pets", "#cachorro", "#gato", "#petlover", "#rotina"],
  decoração: ["#decoracao", "#casa", "#interiores", "#design", "#reforma"],
  esportes: ["#esporte", "#jogo", "#treino", "#time", "#atleta"],
  lifestyle: ["#lifestyle", "#rotina", "#dia", "#dicas", "#favoritos"],
}

export function formatPct(value: number) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`
}

export function formatSignedPct(value: number) {
  const text = formatPct(Math.abs(value))
  if (value > 0) return `+${text}`
  if (value < 0) return `−${text}`
  return text
}

export function buildCreatorReport(creator: Creator, platform: Platform): CreatorReport {
  const widgets = buildProfileWidgets(creator, platform)
  const profile = platformProfile(creator, platform) ?? creator.networks[0]
  const peers = CREATORS.map((item) => item.networks.find((network) => network.network === platform)).filter((item) => item != null)
  const seed = hash(creator.id + platform)
  const niche = creator.niche[0] ?? "lifestyle"
  const country = /brasil/i.test(creator.location) || /,\s*[A-Z]{2}$/.test(creator.location.trim()) ? "Brasil" : creator.location
  const realPosts = creatorPosts(creator.id, platform)
  const posts = (realPosts.length > 0 ? realPosts.map((post) => ({
    id: post.id,
    image: post.image,
    likes: post.likes,
    comments: post.comments,
    views: post.views ?? post.reach,
    caption: post.caption,
    type: post.type,
    shares: post.shares,
    campaignId: post.campaignId,
  })) : syntheticPosts(creator, profile)).sort((a, b) => b.likes - a.likes)
  const popular = posts.slice(0, 6)
  const likeMedian = median(peers.map((item) => estimatedLikes(item.avgViews, item.engagementRate)))
  const engagementMedian = median(peers.map((item) => item.engagementRate))
  const likesDelta = likeMedian > 0 ? ((widgets.avgLikes - likeMedian) / likeMedian) * 100 : 0
  const firstFollowers = widgets.series[0]?.followers ?? profile.followers
  const lastFollowers = widgets.series.at(-1)?.followers ?? profile.followers
  const followerGrowth = firstFollowers > 0 ? ((lastFollowers - firstFollowers) / firstFollowers) * 100 : 0
  const lastEngagement = widgets.series.at(-1)?.engagements || 1
  const fake = fakeFollowersPct(creator)
  const fakeMedian = median(CREATORS.map((item) => fakeFollowersPct(item)))
  const sponsored = posts.filter((post) => post.campaignId)
  const sponsoredViews = sponsored.reduce((sum, post) => sum + post.views, 0)
  const allViews = posts.reduce((sum, post) => sum + post.views, 0)
  const reelPosts = posts.filter((post) => post.type === "reels" || post.type === "tiktok" || post.type === "video_youtube")
  const reelBase = reelPosts.length > 0 ? reelPosts : posts
  const followerAudience = followerBlock(creator, country, seed)
  const likerAudience = shiftAudience(followerAudience, seed)
  const brands = brandRows(widgets.collabs.map((item) => item.brand), niche, seed)
  const interests = interestRows(niche, seed)
  const hashtagStats = shareFromCaptions(posts.map((post) => post.caption), /#[\p{L}\p{N}_]+/gu)
  const mentionStats = shareFromCaptions(posts.map((post) => post.caption), /@[\p{L}\p{N}_.]+/gu)
  const hashtags = hashtagStats.length > 0 ? hashtagStats : estimatedTags(niche, seed)
  const mentions = mentionStats.length > 0 ? mentionStats : estimatedMentions(profile.handle, widgets.collabs.map((item) => item.brand))
  const [year, month, day] = TODAY.split("-")
  const slug = profile.handle.replace(/^@/, "").replace(/[^\w.-]+/g, "") || creator.id

  return {
    fileName: `relatorio-${slug}-${day}-${month}-${year}`,
    generatedOn: `${Number(day)} de ${MONTHS[Number(month) - 1]} de ${year}`,
    name: creator.name,
    handle: profile.handle,
    photo: creator.photo,
    networkLabel: NETWORK_LABEL[platform],
    accountLine: `${ACCOUNT_LINE[accountTypeOf(creator)]} · ${NETWORK_LABEL[platform]} · ${country}`,
    bio: creator.bio,
    followersLabel: formatCompact(profile.followers),
    followerGrowthLabel: formatSignedPct(followerGrowth),
    avgLikesLabel: formatCompact(widgets.avgLikes),
    likesDeltaLabel: formatSignedPct(likesDelta),
    engagementLabel: formatPct(profile.engagementRate),
    engagementNote: profile.engagementRate >= engagementMedian
      ? "acima da média deste porte"
      : "abaixo da média deste porte",
    postsEstimated: realPosts.length === 0,
    posts: popular.map((post) => ({
      id: post.id,
      image: post.image,
      likes: post.likes,
      comments: post.comments,
      caption: post.caption,
    })),
    followerTotalLabel: formatCompact(profile.followers),
    fakeFollowersLabel: formatPct(fake),
    fakeComparison: `Este creator ${formatPct(fake)}. Mediana da base ${formatPct(fakeMedian)}.`,
    audienceMix: audienceMix(seed, fake, profile.verified),
    reachability: reachability(seed),
    followerGrowth: widgets.series.map((point) => ({ label: point.label, value: point.followers })),
    likesGrowth: widgets.series.map((point) => ({
      label: point.label,
      value: Math.max(1, Math.round(widgets.avgLikes * (point.engagements / lastEngagement))),
    })),
    content: [
      { label: "Curtidas médias", value: formatCompact(widgets.avgLikes) },
      { label: "Curtidas falsas", value: formatPct(Math.min(35, Math.round(fake * 0.55 + (seed % 4)))) },
      { label: "Taxa de engajamento", value: formatPct(profile.engagementRate) },
      { label: "Impressões estimadas", value: formatCompact(Math.round(profile.avgViews * 1.15)) },
      { label: "Alcance estimado", value: formatCompact(Math.round(profile.avgViews * 0.72)) },
      { label: "Comentários médios", value: formatCompact(widgets.avgComments) },
    ],
    reelsTitle: platform === "instagram" ? "Reels" : "Vídeos",
    reels: [
      { label: "Taxa de engajamento", value: formatPct(average(reelBase.map((post) => (post.views > 0 ? ((post.likes + post.comments) / post.views) * 100 : profile.engagementRate)), profile.engagementRate)) },
      { label: platform === "youtube" ? "Views médios" : "Plays médios", value: formatCompact(Math.round(average(reelBase.map((post) => post.views), profile.avgViews))) },
      { label: "Curtidas médias", value: formatCompact(Math.round(average(reelBase.map((post) => post.likes), widgets.avgLikes))) },
      { label: "Comentários médios", value: formatCompact(Math.round(average(reelBase.map((post) => post.comments), widgets.avgComments))) },
      { label: "Compartilhamentos médios", value: formatCompact(Math.round(average(reelBase.map((post) => post.shares), widgets.avgComments * 0.8))) },
    ],
    stories: platform === "instagram" ? [
      { label: "Alcance estimado", value: formatCompact(Math.round(profile.avgViews * 0.62)) },
      { label: "Impressões estimadas", value: formatCompact(Math.round(profile.avgViews * 0.67)) },
    ] : null,
    collaborations: sponsored.length === 0 && widgets.collabs.length === 0
      ? []
      : [
          { label: "Posts com marca", value: String(sponsored.length || widgets.collabs.reduce((sum, item) => sum + item.count, 0)) },
          { label: "Efetividade do engajamento pago", value: formatPct(widgets.mentionEffectiveness) },
          { label: "Participação das views pagas", value: formatPct(allViews > 0 ? (sponsoredViews / allViews) * 100 : 0) },
        ],
    brands,
    interests,
    hashtags,
    hashtagsNote: hashtagStats.length > 0 ? null : "Estimadas pelo nicho, porque os posts recentes desta rede não trazem hashtag.",
    mentions,
    mentionsNote: mentionStats.length > 0 ? null : "Estimadas pelas colaborações, porque os posts recentes não trazem menção.",
    genderTable: compareRows(followerAudience.gender, likerAudience.gender, profile.followers, widgets.avgLikes),
    interestTable: compareRows(interests, shiftShares(interests, seed), profile.followers, widgets.avgLikes),
    brandTable: compareRows(brands, shiftShares(brands, seed + 5), profile.followers, widgets.avgLikes),
    followerAudience,
    likerAudience,
    priceLabel: `${formatBRL(widgets.priceMin)} – ${formatBRL(widgets.priceMax)}`,
    credibilityLabel: `${widgets.credibility.toLocaleString("pt-BR")}% de audiência real`,
    safety: widgets.safety.map((axis) => ({ label: axis.label, value: riskLabel(axis.level) })),
    grades: widgets.grades.map((metric) => ({
      label: metric.label,
      value: metric.top > 55 ? `${metric.grade} · entre os ${100 - metric.top}% menores` : `${metric.grade} · entre os ${metric.top}% melhores`,
    })),
  }
}

interface SourcePost {
  id: string
  image?: string
  likes: number
  comments: number
  views: number
  caption: string
  type: string
  shares: number
  campaignId: string
}

function syntheticPosts(creator: Creator, profile: { avgViews: number; engagementRate: number }): SourcePost[] {
  const factors = [1.15, 0.74, 0.48]
  return factors.map((factor, index) => {
    const likes = estimatedLikes(profile.avgViews * factor, profile.engagementRate)
    return {
      id: `${creator.id}-est-${index}`,
      image: creator.photo,
      likes,
      comments: Math.max(1, Math.round(likes * 0.045)),
      views: Math.max(1, Math.round(profile.avgViews * factor)),
      caption: creator.bio,
      type: "reels",
      shares: Math.max(1, Math.round(likes * 0.04)),
      campaignId: "",
    }
  })
}

function estimatedLikes(views: number, engagementRate: number) {
  return Math.max(1, Math.round(views * (engagementRate / 100) * 0.86))
}

function followerBlock(creator: Creator, country: string, seed: number): AudienceBlock {
  const brasil = 64 + (seed % 16)
  const abroad = portions([4, 2.2, 1.4, 1], 100 - brasil)
  return {
    gender: normalize(creator.audienceGender.map((item) => ({ label: item.label, pct: item.pct }))),
    age: normalize(creator.audienceAge.map((item) => ({ label: item.range, pct: item.pct }))),
    countries: [
      { label: country, pct: brasil },
      { label: "Argentina", pct: abroad[0] },
      { label: "Portugal", pct: abroad[1] },
      { label: "Estados Unidos", pct: abroad[2] },
      { label: "Outros", pct: abroad[3] },
    ],
    cities: normalize(creator.audienceLocation.map((item) => ({ label: item.city, pct: item.pct })), "Outras cidades"),
    languages: labeled(["Português", "Inglês", "Espanhol", "Francês", "Outros"], portions([90, 4.2, 3, 1.6, 1.2])),
  }
}

function shiftAudience(block: AudienceBlock, seed: number): AudienceBlock {
  return {
    gender: shiftPair(block.gender, 2),
    age: shiftToward(block.age, "18-24", 3),
    countries: moveShare(block.countries, block.countries[0]?.label ?? "Brasil", 12),
    cities: moveShare(block.cities, block.cities[0]?.label ?? "", 4),
    languages: labeled(["Português", "Inglês", "Espanhol", "Francês", "Outros"], portions([58 + (seed % 5), 14, 11, 8, 6])),
  }
}

function audienceMix(seed: number, fake: number, verified: boolean): ShareRow[] {
  const notable = verified ? 6 + (seed % 3) : 3 + (seed % 3)
  let realMass = 8 + (seed % 5)
  const suspiciousMass = Math.round(fake * 0.48)
  const suspiciousAccounts = fake - suspiciousMass
  let realPeople = 100 - notable - realMass - suspiciousMass - suspiciousAccounts
  if (realPeople < 40) {
    const take = Math.min(40 - realPeople, Math.max(0, realMass - 4))
    realMass -= take
    realPeople += take
  }
  return [
    { label: "Pessoas reais", pct: realPeople },
    { label: "Seguidores notáveis", pct: notable },
    { label: "Seguidores em massa", pct: realMass },
    { label: "Massa suspeita", pct: suspiciousMass },
    { label: "Contas suspeitas", pct: suspiciousAccounts },
  ]
}

function reachability(seed: number): ShareRow[] {
  const under = 42 + (seed % 12)
  const mid = 18 + ((seed * 3) % 8)
  const high = 8 + ((seed * 5) % 5)
  return [
    { label: "Menos de 500 contas", pct: under },
    { label: "500 a 1 mil", pct: mid },
    { label: "1 mil a 1,5 mil", pct: high },
    { label: "Mais de 1,5 mil", pct: 100 - under - mid - high },
  ]
}

function brandRows(collabs: string[], niche: string, seed: number): ShareRow[] {
  const labels = unique([...collabs, ...(BRANDS[niche] ?? BRANDS.lifestyle)]).slice(0, 6)
  const start = 18 + (seed % 8)
  return labels.map((label, index) => ({ label, pct: Math.max(2, start - index * 2.4) }))
}

function interestRows(niche: string, seed: number): ShareRow[] {
  const labels = INTERESTS[niche] ?? INTERESTS.lifestyle
  const start = 32 + (seed % 8)
  return labels.map((label, index) => ({ label, pct: Math.max(6, start - index * 4) }))
}

function estimatedTags(niche: string, seed: number): ShareRow[] {
  const labels = TAGS[niche] ?? TAGS.lifestyle
  return labeled(labels, portions(labels.map((_, index) => 8 - index), 40 + (seed % 15)))
}

function estimatedMentions(handle: string, collabs: string[]): ShareRow[] {
  const labels = unique([handle, ...collabs]).slice(0, 4)
  if (labels.length === 0) return []
  return labeled(labels, portions(labels.map((_, index) => labels.length - index)))
}

function shareFromCaptions(captions: string[], pattern: RegExp): ShareRow[] {
  if (captions.length === 0) return []
  const counts = new Map<string, number>()
  for (const caption of captions) {
    const seen = new Set<string>()
    for (const token of caption.match(pattern) ?? []) {
      const key = token.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([label, count]) => ({ label, pct: (count / captions.length) * 100 }))
}

function compareRows(followers: ShareRow[], likers: ShareRow[], followerBase: number, likerBase: number): CompareRow[] {
  return followers.map((row, index) => {
    const liker = likers[index] ?? row
    return {
      label: row.label,
      likers: countLabel(likerBase, liker.pct),
      followers: countLabel(followerBase, row.pct),
    }
  })
}

function countLabel(base: number, pct: number) {
  return `${Math.round((base * pct) / 100).toLocaleString("pt-BR")} / ${formatPct(pct)}`
}

function shiftShares(rows: ShareRow[], seed: number): ShareRow[] {
  return rows.map((row, index) => {
    const delta = ((seed + index * 3) % 7) - 3
    return { ...row, pct: Math.max(0.5, Math.round((row.pct + delta) * 10) / 10) }
  })
}

function shiftPair(rows: ShareRow[], points: number): ShareRow[] {
  if (rows.length < 2) return rows
  const next = rows.map((row) => ({ ...row }))
  const from = next[0].pct >= next[1].pct ? 0 : 1
  const to = from === 0 ? 1 : 0
  const move = Math.min(points, next[from].pct)
  next[from].pct = round(next[from].pct - move)
  next[to].pct = round(next[to].pct + move)
  return next
}

function shiftToward(rows: ShareRow[], label: string, points: number): ShareRow[] {
  if (rows.length < 2) return rows
  const next = rows.map((row) => ({ ...row }))
  const target = next.find((row) => row.label === label) ?? next[0]
  const source = [...next].sort((a, b) => b.pct - a.pct).find((row) => row !== target)
  if (!source) return next
  const move = Math.min(points, source.pct / 2)
  source.pct = round(source.pct - move)
  target.pct = round(target.pct + move)
  return next
}

function moveShare(rows: ShareRow[], fromLabel: string, points: number): ShareRow[] {
  if (rows.length < 2) return rows
  const next = rows.map((row) => ({ ...row }))
  const source = next.find((row) => row.label === fromLabel) ?? next[0]
  const target = next[next.length - 1]
  if (source === target) return next
  const move = Math.min(points, Math.max(0, source.pct - 8))
  source.pct = round(source.pct - move)
  target.pct = round(target.pct + move)
  return next
}

function normalize(rows: ShareRow[], remainderLabel = "Outras"): ShareRow[] {
  const positive = rows.filter((row) => row.pct > 0)
  if (positive.length === 0) return []
  const sum = positive.reduce((total, row) => total + row.pct, 0)
  if (sum > 100.05) return labeled(positive.map((row) => row.label), portions(positive.map((row) => row.pct)))
  const next = positive.map((row) => ({ label: row.label, pct: round(row.pct) }))
  const used = next.reduce((total, row) => total + row.pct, 0)
  const rest = round(100 - used)
  if (rest >= 0.5) next.push({ label: remainderLabel, pct: rest })
  else if (next.length > 0 && rest !== 0) next[0].pct = round(next[0].pct + rest)
  return next
}

function labeled(labels: string[], pcts: number[]): ShareRow[] {
  return labels.map((label, index) => ({ label, pct: pcts[index] ?? 0 }))
}

function portions(weights: number[], total = 100) {
  const safe = weights.map((weight) => Math.max(0, weight))
  const sum = safe.reduce((total, weight) => total + weight, 0) || 1
  const target = Math.round(total * 100)
  const raw = safe.map((weight) => (weight / sum) * target)
  const base = raw.map((value) => Math.floor(value))
  let drift = target - base.reduce((total, value) => total + value, 0)
  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index)
  for (let step = 0; step < order.length && drift > 0; step += 1) {
    base[order[step].index] += 1
    drift -= 1
  }
  return base.map((value) => value / 100)
}

function unique(values: string[]) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const key = value.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(value.trim())
  }
  return result
}

function average(values: number[], fallback: number) {
  if (values.length === 0) return fallback
  return values.reduce((total, value) => total + value, 0) / values.length
}

function median(values: number[]) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function hash(id: string) {
  return id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function round(value: number) {
  return Math.round(value * 100) / 100
}
