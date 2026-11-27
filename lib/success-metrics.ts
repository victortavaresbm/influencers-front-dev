import { SOCIAL_NETWORK_LABEL, type CampaignType, type SocialNetwork } from "@/lib/mock-data/campaigns"

/**
 * Eventos contáveis que a campanha pode usar como meta.
 *
 * Fontes consultadas em 30 out 2026:
 * - Instagram Media Insights: comments, likes, saved, shares, views, reach,
 *   follows, profile_visits, profile_activity, total_interactions, reposts,
 *   replies, navigation, link_clicks, ig_reels_avg_watch_time, reels_skip_rate,
 *   crossposted_views. Impressões de mídia viraram `views` para conteúdo
 *   criado depois de 2 jul 2024.
 * - TikTok Accounts API v1.3 `business/video/list`: likes, comments, shares,
 *   favorites, reach, video_views, total_time_watched, average_time_watched,
 *   full_video_watched_rate, new_followers, profile_views, website_clicks,
 *   phone_number_clicks, lead_submissions, app_download_clicks, email_clicks,
 *   address_clicks.
 * - YouTube Analytics: views, engagedViews, likes, comments, shares,
 *   subscribersGained, videosAddedToPlaylists, estimatedMinutesWatched,
 *   averageViewDuration, averageViewPercentage, cardClicks.
 *
 * Ficam de fora quebras que não são um número de meta (idade, gênero, país,
 * cidade, origem do tráfego, retenção por segundo) e sinais negativos que a
 * marca não persegue (descurtidas, inscritos perdidos).
 */

export type SuccessMetricId =
  | "views"
  | "reach"
  | "engaged_views"
  | "crossposted_views"
  | "watch_time"
  | "avg_watch"
  | "completion"
  | "skip_rate"
  | "likes"
  | "comments"
  | "saves"
  | "shares"
  | "reposts"
  | "replies"
  | "interactions"
  | "playlist_adds"
  | "card_clicks"
  | "follows"
  | "profile_visits"
  | "bio_link_clicks"
  | "story_link_clicks"
  | "call_clicks"
  | "direction_clicks"
  | "email_clicks"
  | "text_clicks"
  | "app_download_clicks"
  | "leads"
  | "tracked_link_clicks"
  | "coupon_uses"
  | "orders"
  | "revenue"

export type SuccessMetricUnit = "count" | "percent" | "seconds" | "minutes" | "currency"
export type SuccessMetricDirection = "min" | "max"
export type SuccessMetricGroup = "alcance" | "interacao" | "perfil" | "conversao" | "vendas"

export interface SuccessMetricSource {
  network: SocialNetwork
  field: string
}

export interface SuccessMetric {
  id: SuccessMetricId
  group: SuccessMetricGroup
  label: string
  description: string
  unit: SuccessMetricUnit
  direction: SuccessMetricDirection
  sources: SuccessMetricSource[]
}

export interface CampaignSuccessTarget {
  metric: SuccessMetricId
  target: number
}

export const SUCCESS_METRIC_GROUPS: { id: SuccessMetricGroup; label: string }[] = [
  { id: "alcance", label: "Alcance e reprodução" },
  { id: "interacao", label: "Interação" },
  { id: "perfil", label: "Perfil" },
  { id: "conversao", label: "Cliques e conversão" },
  { id: "vendas", label: "Vendas" },
]

export const SUCCESS_METRICS: SuccessMetric[] = [
  {
    id: "views",
    group: "alcance",
    label: "Visualizações",
    description: "Vezes que o conteúdo foi reproduzido. No Instagram, views substitui as impressões de mídia.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "views" },
      { network: "tiktok", field: "video_views" },
      { network: "youtube", field: "views" },
    ],
  },
  {
    id: "reach",
    group: "alcance",
    label: "Alcance",
    description: "Contas únicas que viram o conteúdo pelo menos uma vez.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "reach" },
      { network: "tiktok", field: "reach" },
    ],
  },
  {
    id: "engaged_views",
    group: "alcance",
    label: "Visualizações engajadas",
    description: "Reproduções que passaram do primeiro quadro ou em que a pessoa deu play.",
    unit: "count",
    direction: "min",
    sources: [{ network: "youtube", field: "engagedViews" }],
  },
  {
    id: "crossposted_views",
    group: "alcance",
    label: "Visualizações no Facebook",
    description: "Reproduções do Reel quando ele também aparece no Facebook.",
    unit: "count",
    direction: "min",
    sources: [{ network: "instagram", field: "crossposted_views" }],
  },
  {
    id: "watch_time",
    group: "alcance",
    label: "Tempo assistido",
    description: "Minutos somados de reprodução. No TikTok a API entrega segundos; a meta fica em minutos.",
    unit: "minutes",
    direction: "min",
    sources: [
      { network: "tiktok", field: "total_time_watched" },
      { network: "youtube", field: "estimatedMinutesWatched" },
    ],
  },
  {
    id: "avg_watch",
    group: "alcance",
    label: "Tempo médio de visualização",
    description: "Segundos médios por reprodução. No Reel, a API do Instagram entrega milissegundos.",
    unit: "seconds",
    direction: "min",
    sources: [
      { network: "instagram", field: "ig_reels_avg_watch_time" },
      { network: "tiktok", field: "average_time_watched" },
      { network: "youtube", field: "averageViewDuration" },
    ],
  },
  {
    id: "completion",
    group: "alcance",
    label: "Conclusão do vídeo",
    description: "Percentual de quem assiste até o fim, ou a média do vídeo assistida no YouTube.",
    unit: "percent",
    direction: "min",
    sources: [
      { network: "tiktok", field: "full_video_watched_rate" },
      { network: "youtube", field: "averageViewPercentage" },
    ],
  },
  {
    id: "skip_rate",
    group: "alcance",
    label: "Taxa de pulo",
    description: "Percentual de quem pula o Reel. A meta é um teto: quanto menor, melhor.",
    unit: "percent",
    direction: "max",
    sources: [{ network: "instagram", field: "reels_skip_rate" }],
  },
  {
    id: "likes",
    group: "interacao",
    label: "Curtidas",
    description: "Curtidas orgânicas no post. Impulsionamento entra à parte no Instagram.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "likes" },
      { network: "tiktok", field: "likes" },
      { network: "youtube", field: "likes" },
    ],
  },
  {
    id: "comments",
    group: "interacao",
    label: "Comentários",
    description: "Comentários deixados no conteúdo.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "comments" },
      { network: "tiktok", field: "comments" },
      { network: "youtube", field: "comments" },
    ],
  },
  {
    id: "saves",
    group: "interacao",
    label: "Salvamentos",
    description: "Vezes que o post foi salvo. No TikTok o evento se chama favoritos.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "saved" },
      { network: "tiktok", field: "favorites" },
    ],
  },
  {
    id: "shares",
    group: "interacao",
    label: "Encaminhamentos",
    description: "Compartilhamentos. No TikTok soma envio para amigos e compartilhamento externo.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "shares" },
      { network: "tiktok", field: "shares" },
      { network: "youtube", field: "shares" },
    ],
  },
  {
    id: "reposts",
    group: "interacao",
    label: "Reposts",
    description: "Vezes que outras contas republicaram o post ou o Reel.",
    unit: "count",
    direction: "min",
    sources: [{ network: "instagram", field: "reposts" }],
  },
  {
    id: "replies",
    group: "interacao",
    label: "Respostas",
    description: "Respostas ao Story. Contas na Europa e no Japão devolvem zero nesse evento.",
    unit: "count",
    direction: "min",
    sources: [{ network: "instagram", field: "replies" }],
  },
  {
    id: "interactions",
    group: "interacao",
    label: "Interações",
    description: "Curtidas, salvamentos, comentários e encaminhamentos, já descontando o que foi desfeito.",
    unit: "count",
    direction: "min",
    sources: [{ network: "instagram", field: "total_interactions" }],
  },
  {
    id: "playlist_adds",
    group: "interacao",
    label: "Adições a playlists",
    description: "Vezes que o vídeo entrou em uma playlist.",
    unit: "count",
    direction: "min",
    sources: [{ network: "youtube", field: "videosAddedToPlaylists" }],
  },
  {
    id: "card_clicks",
    group: "interacao",
    label: "Cliques em cards",
    description: "Cliques nos cards de informação do vídeo.",
    unit: "count",
    direction: "min",
    sources: [{ network: "youtube", field: "cardClicks" }],
  },
  {
    id: "follows",
    group: "perfil",
    label: "Novos seguidores",
    description: "Contas que passaram a seguir a partir do conteúdo. No YouTube são inscritos ganhos.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "follows" },
      { network: "tiktok", field: "new_followers" },
      { network: "youtube", field: "subscribersGained" },
    ],
  },
  {
    id: "profile_visits",
    group: "perfil",
    label: "Visitas ao perfil",
    description: "Visitas ao perfil originadas pelo post. No Reel o Instagram não devolve esse número.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "profile_visits" },
      { network: "tiktok", field: "profile_views" },
    ],
  },
  {
    id: "bio_link_clicks",
    group: "conversao",
    label: "Cliques no link do perfil",
    description: "Toques no link da bio, ou no site de quem chegou ao perfil pelo post no TikTok.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "profile_activity.bio_link_clicked" },
      { network: "tiktok", field: "website_clicks" },
    ],
  },
  {
    id: "story_link_clicks",
    group: "conversao",
    label: "Cliques no link do Story",
    description: "Toques no link ou figurinha de link do Story.",
    unit: "count",
    direction: "min",
    sources: [{ network: "instagram", field: "link_clicks" }],
  },
  {
    id: "call_clicks",
    group: "conversao",
    label: "Cliques para ligar",
    description: "Toques no botão de telefone do perfil.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "profile_activity.call" },
      { network: "tiktok", field: "phone_number_clicks" },
    ],
  },
  {
    id: "direction_clicks",
    group: "conversao",
    label: "Cliques em como chegar",
    description: "Toques no endereço ou na rota do perfil.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "profile_activity.direction" },
      { network: "tiktok", field: "address_clicks" },
    ],
  },
  {
    id: "email_clicks",
    group: "conversao",
    label: "Cliques no e-mail",
    description: "Toques no e-mail do perfil.",
    unit: "count",
    direction: "min",
    sources: [
      { network: "instagram", field: "profile_activity.email" },
      { network: "tiktok", field: "email_clicks" },
    ],
  },
  {
    id: "text_clicks",
    group: "conversao",
    label: "Cliques em mensagem",
    description: "Toques no botão de mensagem do perfil.",
    unit: "count",
    direction: "min",
    sources: [{ network: "instagram", field: "profile_activity.text" }],
  },
  {
    id: "app_download_clicks",
    group: "conversao",
    label: "Cliques para baixar o app",
    description: "Toques no link de download do app a partir do post.",
    unit: "count",
    direction: "min",
    sources: [{ network: "tiktok", field: "app_download_clicks" }],
  },
  {
    id: "leads",
    group: "conversao",
    label: "Leads",
    description: "Formulários enviados por quem chegou ao perfil pelo post.",
    unit: "count",
    direction: "min",
    sources: [{ network: "tiktok", field: "lead_submissions" }],
  },
  {
    id: "tracked_link_clicks",
    group: "vendas",
    label: "Cliques no link rastreável",
    description: "Cliques no link da campanha medidos pela WeSell.",
    unit: "count",
    direction: "min",
    sources: [],
  },
  {
    id: "coupon_uses",
    group: "vendas",
    label: "Cupons utilizados",
    description: "Vezes que o cupom da campanha foi aplicado em pedidos.",
    unit: "count",
    direction: "min",
    sources: [],
  },
  {
    id: "orders",
    group: "vendas",
    label: "Pedidos gerados",
    description: "Pedidos atribuídos à campanha por link ou cupom.",
    unit: "count",
    direction: "min",
    sources: [],
  },
  {
    id: "revenue",
    group: "vendas",
    label: "Receita gerada",
    description: "Faturamento atribuído à campanha em reais.",
    unit: "currency",
    direction: "min",
    sources: [],
  },
]

const METRIC_BY_ID = new Map(SUCCESS_METRICS.map((metric) => [metric.id, metric]))

export const SUCCESS_METRIC_SUGGESTIONS: Record<CampaignType, SuccessMetricId[]> = {
  awareness: ["views", "reach", "follows"],
  engajamento: ["likes", "comments", "saves", "shares"],
  ugc: ["views", "saves", "shares"],
  seeding: ["views", "saves", "profile_visits"],
  embaixador: ["follows", "views", "saves"],
  live: ["views", "comments", "likes"],
  conversao: ["tracked_link_clicks", "orders", "revenue", "bio_link_clicks"],
  afiliado: ["coupon_uses", "orders", "revenue", "tracked_link_clicks"],
}

export function successMetricById(id: string) {
  return METRIC_BY_ID.get(id as SuccessMetricId)
}

export function metricsForNetworks(networks: SocialNetwork[]) {
  if (networks.length === 0) return SUCCESS_METRICS
  const selected = new Set(networks)
  return SUCCESS_METRICS.filter(
    (metric) => metric.sources.length === 0 || metric.sources.some((source) => selected.has(source.network)),
  )
}

export function readSuccessTargets(value: { metric: string; target: number }[] | undefined): CampaignSuccessTarget[] {
  if (!value) return []
  const targets: CampaignSuccessTarget[] = []
  for (const item of value) {
    const metric = successMetricById(item.metric)
    if (!metric || !Number.isFinite(item.target)) continue
    targets.push({ metric: metric.id, target: Math.max(0, item.target) })
  }
  return targets
}

export function suggestSuccessTargets(type: CampaignType, networks: SocialNetwork[]): CampaignSuccessTarget[] {
  const available = new Set(metricsForNetworks(networks).map((metric) => metric.id))
  return SUCCESS_METRIC_SUGGESTIONS[type]
    .filter((id) => available.has(id))
    .map((metric) => ({ metric, target: 0 }))
}

export function formatSuccessTarget(metric: SuccessMetric, target: number) {
  if (target <= 0) return "A definir"
  if (metric.unit === "currency") {
    return target.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
  }
  const number = target.toLocaleString("pt-BR")
  if (metric.unit === "percent") return `${number}%`
  if (metric.unit === "seconds") return `${number} s`
  if (metric.unit === "minutes") return `${number} min`
  return number
}

export function formatSuccessTargetList(value: { metric: string; target: number }[] | undefined) {
  const configured = readSuccessTargets(value).filter((item) => item.target > 0)
  if (configured.length === 0) return "A definir"
  return configured
    .map((item) => {
      const metric = successMetricById(item.metric)
      if (!metric) return null
      return `${metric.label}: ${formatSuccessTarget(metric, item.target)}`
    })
    .filter((item): item is string => Boolean(item))
    .join(" · ")
}

export function networksLabel(metric: SuccessMetric, networks: SocialNetwork[]) {
  const selected = networks.length === 0 ? null : new Set(networks)
  const names = metric.sources
    .map((source) => source.network)
    .filter((network, index, list) => list.indexOf(network) === index)
    .filter((network) => !selected || selected.has(network))
    .map((network) => SOCIAL_NETWORK_LABEL[network])
  return names.join(" · ")
}

export function unitCaption(metric: SuccessMetric) {
  const goal = metric.direction === "max" ? "Teto" : "Meta"
  if (metric.unit === "percent") return `${goal} em %`
  if (metric.unit === "seconds") return `${goal} em segundos`
  if (metric.unit === "minutes") return `${goal} em minutos`
  if (metric.unit === "currency") return `${goal} em R$`
  return goal
}
