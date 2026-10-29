import type { Campaign, CampaignStatus, Participant } from "@/lib/mock-data/campaigns"
import { CREATORS } from "@/lib/mock-data/creators"
import { ORG_LOGOS, type MockUser } from "@/lib/mock-data/users"

export interface CommunityAuthor {
  id: string
  name: string
  avatar: string
  photo?: string
  handle: string
}

export interface CommunityMember extends CommunityAuthor {
  level: string
}

export interface CommunityCategory {
  id: string
  name: string
  emoji: string
}

export type CommunityMedia =
  | { type: "image"; url: string; alt: string }
  | { type: "gif"; url: string; alt: string }
  | { type: "youtube"; youtubeId: string; alt: string }

export interface CommunityComment {
  id: string
  postId: string
  parentId?: string
  author: CommunityAuthor
  body: string
  createdAt: string
  likeCount: number
  likedByMe: boolean
  media?: CommunityMedia
}

export interface CommunityPost {
  id: string
  title: string
  body: string
  categoryId: string
  author: CommunityAuthor
  createdAt: string
  likeCount: number
  likedByMe: boolean
  isPinned: boolean
  campaignId?: string
  media?: CommunityMedia
}

const CHANNEL_STATUSES = new Set<CampaignStatus>(["aberta", "em_execucao", "concluida"])
const IN_CAMPAIGN = new Set<Participant["status"]>(["convidado", "selecionado", "entregue"])

export function campaignAudience(campaign: Campaign) {
  return campaign.participants.filter((participant) => IN_CAMPAIGN.has(participant.status))
}

export function visibleCampaignChannels(campaigns: Campaign[], user: MockUser | null) {
  if (!user) return []
  const creator = user.role === "creator"
    ? CREATORS.find((item) => item.email.toLowerCase() === user.email.toLowerCase())
    : undefined

  return campaigns
    .filter((campaign) => {
      if (!CHANNEL_STATUSES.has(campaign.status)) return false
      if (user.role === "brand") return campaign.organizationId === user.organizationId
      return creator ? campaignAudience(campaign).some((participant) => participant.creatorId === creator.id) : false
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
}

export interface PartnerCommunity {
  id: string
  name: string
  logo?: string
}

export function partnerCommunities(campaigns: Campaign[], user: MockUser | null): PartnerCommunity[] {
  const seen = new Map<string, PartnerCommunity>()
  for (const campaign of visibleCampaignChannels(campaigns, user)) {
    if (seen.has(campaign.organizationId)) continue
    const logo = ORG_LOGOS[campaign.organizationId as keyof typeof ORG_LOGOS]?.logo
    seen.set(campaign.organizationId, {
      id: campaign.organizationId,
      name: campaign.organizationName,
      logo,
    })
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
}

function brand(orgId: keyof typeof ORG_LOGOS, name: string, avatar: string): CommunityAuthor {
  return {
    id: `brand-${orgId}`,
    name,
    avatar,
    photo: ORG_LOGOS[orgId].logo,
    handle: name,
  }
}

function author(id: string): CommunityAuthor {
  const creator = CREATORS.find((item) => item.id === id)
  if (!creator) throw new Error(`Creator ${id} não encontrado`)
  return {
    id: creator.id,
    name: creator.name,
    avatar: creator.avatar,
    photo: creator.photo,
    handle: creator.handle,
  }
}

export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  { id: "avisos", name: "Avisos", emoji: "📌" },
  { id: "duvidas", name: "Dúvidas", emoji: "💬" },
  { id: "bastidores", name: "Bastidores", emoji: "🎬" },
  { id: "resultados", name: "Resultados", emoji: "📈" },
  { id: "tutoriais", name: "Tutoriais", emoji: "🎓" },
]

export const COMMUNITY_MEMBERS: CommunityMember[] = [
  { ...author("c1"), level: "Embaixadora" },
  { ...author("c5"), level: "Ouro" },
  { ...author("c6"), level: "Ouro" },
  { ...author("c3"), level: "Prata" },
  { ...author("c2"), level: "Prata" },
  { ...author("c11"), level: "Bronze" },
  { ...author("c4"), level: "Prata" },
]

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    title: "Briefing da Black Friday no ar",
    body: "O briefing da campanha já está na plataforma. Usem o cupom de cada um na legenda e marquem @magazineluiza. Dúvidas de prazo podem ir aqui no feed.",
    categoryId: "avisos",
    author: author("c5"),
    createdAt: "2026-10-27T14:00:00.000Z",
    likeCount: 18,
    likedByMe: false,
    isPinned: true,
  },
  {
    id: "post-2",
    title: "Alguém já recebeu o produto da Tech Week?",
    body: "Postei o unboxing ontem e o rastreio ainda não atualizou para o segundo envio. Queria saber se mais alguém está nesse prazo.",
    categoryId: "duvidas",
    author: author("c6"),
    createdAt: "2026-10-28T19:30:00.000Z",
    likeCount: 6,
    likedByMe: true,
    isPinned: false,
  },
  {
    id: "post-3",
    title: "Referência de take que funcionou no Reels",
    body: "Gravei o cupom na tela nos 3 primeiros segundos e o salvamento subiu. Se alguém quiser, mando o roteiro que usei na Casa & Decor.",
    categoryId: "bastidores",
    author: author("c1"),
    createdAt: "2026-10-29T11:15:00.000Z",
    likeCount: 11,
    likedByMe: false,
    isPinned: false,
  },
  {
    id: "post-4",
    title: "Primeira semana de cupom fechou bem",
    body: "FERMAGA30 passou de 80 pedidos. Vou repetir o formato de jantar na air fryer, que foi o que mais converteu.",
    categoryId: "resultados",
    author: author("c5"),
    createdAt: "2026-10-29T08:40:00.000Z",
    likeCount: 9,
    likedByMe: false,
    isPinned: false,
  },
  {
    id: "post-camp1",
    title: "Como falar da coleção Primavera",
    body: "O briefing pede tom de autenticidade, a hashtag #NaturaEkos e a marcação @naturabrasil. Evitem comparativo com outras marcas. Prazos e menções obrigatórias ficam neste canal.",
    categoryId: "avisos",
    author: author("c3"),
    createdAt: "2026-10-21T13:00:00.000Z",
    likeCount: 7,
    likedByMe: false,
    isPinned: true,
    campaignId: "camp1",
  },
  {
    id: "post-camp2",
    title: "Link de afiliado da Tech Week",
    body: "O cupom entra na descrição do vídeo e o link rastreado fica na bio durante a semana. A marca libera o produto depois da confirmação do convite.",
    categoryId: "avisos",
    author: author("c4"),
    createdAt: "2026-10-24T16:20:00.000Z",
    likeCount: 3,
    likedByMe: false,
    isPinned: true,
    campaignId: "camp2",
  },
  {
    id: "post-camp3",
    title: "Roteiro de Sabores do Brasil",
    body: "O vídeo precisa mostrar o prato regional e o pedido no app. Usem a hashtag da campanha e não misturem oferta de outra marca.",
    categoryId: "avisos",
    author: author("c2"),
    createdAt: "2026-10-22T18:10:00.000Z",
    likeCount: 5,
    likedByMe: false,
    isPinned: true,
    campaignId: "camp3",
  },
  {
    id: "post-camp5",
    title: "Cupons e prazos da Black Friday",
    body: "Cada afiliado usa só o próprio cupom e o link rastreado do briefing. A última entrega entra até 30/11. Dúvidas de peça e prazo ficam neste canal.",
    categoryId: "avisos",
    author: author("c5"),
    createdAt: "2026-10-26T10:00:00.000Z",
    likeCount: 14,
    likedByMe: false,
    isPinned: true,
    campaignId: "camp5",
  },
  {
    id: "post-camp6",
    title: "Refil SOU: o que entra no conteúdo",
    body: "Contem a troca da embalagem e o refil. Não falem de desconto que não está no briefing da campanha.",
    categoryId: "avisos",
    author: author("c3"),
    createdAt: "2026-10-18T11:30:00.000Z",
    likeCount: 4,
    likedByMe: false,
    isPinned: true,
    campaignId: "camp6",
  },
  {
    id: "post-camp7",
    title: "Referência do app Casa & Decor",
    body: "Mostrem o fluxo de salvar um ambiente no app novo. O chamado para ação é o link desta campanha, sem cupom de outra ação.",
    categoryId: "bastidores",
    author: author("c11"),
    createdAt: "2026-10-23T15:45:00.000Z",
    likeCount: 6,
    likedByMe: false,
    isPinned: false,
    campaignId: "camp7",
  },
  {
    id: "post-5",
    title: "Bastidores do encontro com a Fer",
    body: "Gravamos o take juntas ontem. A luz da janela segurou o produto sem ring light. Deixo o still aqui para quem quiser repetir o enquadramento.",
    categoryId: "bastidores",
    author: author("c1"),
    createdAt: "2026-10-29T16:10:00.000Z",
    likeCount: 22,
    likedByMe: false,
    isPinned: false,
    media: {
      type: "image",
      url: "https://picsum.photos/seed/wesell-encontro/960/540",
      alt: "Still do encontro entre Bianca e Fernanda, com o produto na luz da janela",
    },
  },
  {
    id: "post-6",
    title: "A reação quando o cupom entra no segundo 3",
    body: "Testei o formato que a Bianca comentou. O salvamento subiu e o Rafael mandou esse GIF no grupo. Vale o corte curto.",
    categoryId: "bastidores",
    author: author("c2"),
    createdAt: "2026-10-29T17:40:00.000Z",
    likeCount: 15,
    likedByMe: true,
    isPinned: false,
    media: {
      type: "gif",
      url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
      alt: "GIF de comemoração entre os participantes",
    },
  },
  {
    id: "post-7",
    title: "Corte que a gente fechou juntas",
    body: "Versão final do vídeo que a Fer e eu alinhamos no canal. Os três primeiros segundos são o produto, depois o cupom falado.",
    categoryId: "resultados",
    author: author("c5"),
    createdAt: "2026-10-29T18:05:00.000Z",
    likeCount: 19,
    likedByMe: false,
    isPinned: false,
    media: {
      type: "youtube",
      youtubeId: "ScMzIvxBSi4",
      alt: "Vídeo de referência do corte combinado entre Fernanda e Bianca",
    },
  },
  {
    id: "tutorial-camp1",
    title: "Como postar o conteúdo da coleção Primavera",
    body: "1. Abra com o produto em luz natural, sem filtro pesado. 2. Fale o benefício em uma frase. 3. Na legenda, use #NaturaEkos e marque @naturabrasil. 4. Publique o story no mesmo dia, com o mesmo enquadramento do vídeo.",
    categoryId: "tutoriais",
    author: brand("org1", "Natura", "NA"),
    createdAt: "2026-10-20T12:00:00.000Z",
    likeCount: 16,
    likedByMe: false,
    isPinned: true,
    campaignId: "camp1",
    media: {
      type: "youtube",
      youtubeId: "LXb3EKWsInQ",
      alt: "Tutorial da Natura sobre enquadramento e luz para o post",
    },
  },
  {
    id: "tutorial-camp3",
    title: "Como mostrar o pedido no vídeo",
    body: "Filme o prato por 5 segundos, depois a tela do app com o pedido confirmado. Fale a hashtag da campanha uma vez. Não use cupom de outra marca no mesmo corte.",
    categoryId: "tutoriais",
    author: brand("org3", "iFood", "iF"),
    createdAt: "2026-10-21T09:30:00.000Z",
    likeCount: 8,
    likedByMe: false,
    isPinned: true,
    campaignId: "camp3",
    media: {
      type: "image",
      url: "https://picsum.photos/seed/wesell-pedido/960/540",
      alt: "Exemplo de enquadramento do prato e do pedido no app",
    },
  },
  {
    id: "tutorial-camp5",
    title: "Como postar o Reels e o story da Black Friday",
    body: "1. Os 3 primeiros segundos mostram a oferta. 2. Fale o seu cupom em voz alta. 3. Legenda com #BlackFridayMagalu, @magazineluiza e o link de afiliado. 4. No story, repita o cupom em texto grande e publique no mesmo dia do Reels.",
    categoryId: "tutoriais",
    author: brand("org2", "Magazine Luiza", "ML"),
    createdAt: "2026-10-25T11:00:00.000Z",
    likeCount: 27,
    likedByMe: false,
    isPinned: true,
    campaignId: "camp5",
    media: {
      type: "youtube",
      youtubeId: "M7lc1UVf-VE",
      alt: "Tutorial da Magalu de como publicar Reels e story",
    },
  },
  {
    id: "post-camp5-gif",
    title: "Quando o cupom converte no primeiro story",
    body: "A Fer publicou no formato do tutorial e o grupo reagiu assim. O story saiu 20 minutos depois do Reels.",
    categoryId: "resultados",
    author: author("c6"),
    createdAt: "2026-10-28T20:15:00.000Z",
    likeCount: 12,
    likedByMe: false,
    isPinned: false,
    campaignId: "camp5",
    media: {
      type: "gif",
      url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
      alt: "GIF da reação dos afiliados ao story da Fernanda",
    },
  },
]

export const COMMUNITY_COMMENTS: CommunityComment[] = [
  {
    id: "comment-1",
    postId: "post-1",
    author: author("c1"),
    body: "Vi o briefing. O cupom entra também no story ou só na legenda do Reels?",
    createdAt: "2026-10-27T15:10:00.000Z",
    likeCount: 3,
    likedByMe: false,
  },
  {
    id: "comment-2",
    postId: "post-1",
    parentId: "comment-1",
    author: author("c3"),
    body: "No meu convite pediram os dois: legenda e um frame do story.",
    createdAt: "2026-10-27T15:42:00.000Z",
    likeCount: 2,
    likedByMe: false,
  },
  {
    id: "comment-3",
    postId: "post-2",
    author: author("c2"),
    body: "O meu chegou hoje de manhã. O código de rastreio mudou ontem à noite.",
    createdAt: "2026-10-28T21:05:00.000Z",
    likeCount: 1,
    likedByMe: false,
  },
  {
    id: "comment-4",
    postId: "post-3",
    author: author("c11"),
    body: "Quero o roteiro sim. Vou adaptar para o post de decoração.",
    createdAt: "2026-10-29T12:02:00.000Z",
    likeCount: 4,
    likedByMe: false,
  },
  {
    id: "comment-5",
    postId: "post-4",
    author: author("c6"),
    body: "Aqui o RAFAGAMES25 foi melhor no review longo do que no unboxing. Vale testar os dois cortes.",
    createdAt: "2026-10-29T09:20:00.000Z",
    likeCount: 5,
    likedByMe: false,
  },
  {
    id: "comment-6",
    postId: "post-5",
    author: author("c5"),
    body: "Ficou melhor sem a ring light. Vou repetir esse still no próximo Reels.",
    createdAt: "2026-10-29T16:28:00.000Z",
    likeCount: 4,
    likedByMe: false,
  },
  {
    id: "comment-7",
    postId: "post-5",
    parentId: "comment-6",
    author: author("c3"),
    body: "A reação de quem estava no set.",
    createdAt: "2026-10-29T16:41:00.000Z",
    likeCount: 6,
    likedByMe: false,
    media: {
      type: "gif",
      url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
      alt: "GIF de reação da Carolina ao still",
    },
  },
  {
    id: "comment-8",
    postId: "post-6",
    author: author("c6"),
    body: "Foi exatamente essa a reação no grupo. O corte curto segurou mais do que o review.",
    createdAt: "2026-10-29T17:55:00.000Z",
    likeCount: 3,
    likedByMe: false,
  },
  {
    id: "comment-9",
    postId: "post-7",
    author: author("c1"),
    body: "Fechado. Eu entro no segundo take com o cupom, você segura o produto.",
    createdAt: "2026-10-29T18:20:00.000Z",
    likeCount: 2,
    likedByMe: false,
  },
  {
    id: "comment-10",
    postId: "tutorial-camp1",
    author: author("c1"),
    body: "Segui o passo da luz natural e o story segurou mais visualização.",
    createdAt: "2026-10-22T10:12:00.000Z",
    likeCount: 5,
    likedByMe: false,
  },
  {
    id: "comment-11",
    postId: "tutorial-camp5",
    author: author("c5"),
    body: "Publiquei o Reels e o story no mesmo dia, como no tutorial. O cupom apareceu nos dois.",
    createdAt: "2026-10-27T13:05:00.000Z",
    likeCount: 7,
    likedByMe: false,
  },
  {
    id: "comment-12",
    postId: "tutorial-camp5",
    parentId: "comment-11",
    author: author("c1"),
    body: "Repeti o texto grande no story. A Magalu tinha razão no passo 4.",
    createdAt: "2026-10-27T13:40:00.000Z",
    likeCount: 3,
    likedByMe: false,
  },
  {
    id: "comment-13",
    postId: "tutorial-camp3",
    author: author("c2"),
    body: "Gravei o prato e a tela do pedido. Ficou claro sem misturar outra oferta.",
    createdAt: "2026-10-23T19:18:00.000Z",
    likeCount: 2,
    likedByMe: false,
  },
]
