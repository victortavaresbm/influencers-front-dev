import type { LucideIcon } from "lucide-react"
import {
  BadgePercent,
  Circle,
  Clapperboard,
  Crown,
  Gift,
  Heart,
  Image as ImageIcon,
  Megaphone,
  Radio,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TvMinimalPlay,
  Video,
} from "lucide-react"
import type { CampaignType, ContentFormat } from "@/lib/mock-data/campaigns"

export type CampaignGoalId = "alcance" | "conteudo" | "vendas"

export interface CampaignGoal {
  id: CampaignGoalId
  label: string
  description: string
  measures: string
  icon: LucideIcon
  wellClass: string
  iconClass: string
}

export interface CampaignTypeMeta {
  value: CampaignType
  label: string
  goal: CampaignGoalId
  description: string
  measures: string
  suggestedObjective: string
  audienceTip: string
  suggestedNetworks: string[]
  suggestedFormats: ContentFormat[]
  icon: LucideIcon
  wellClass: string
  iconClass: string
}

export const CAMPAIGN_GOALS: CampaignGoal[] = [
  {
    id: "alcance",
    label: "Alcance",
    description: "Fazer a marca ser vista e lembrada",
    measures: "Impressões, alcance e reconhecimento",
    icon: Megaphone,
    wellClass: "bg-violet-100 text-violet-700",
    iconClass: "text-violet-700",
  },
  {
    id: "conteudo",
    label: "Conteúdo",
    description: "Peças para publicar e reutilizar",
    measures: "Volume, qualidade e direito de uso",
    icon: Clapperboard,
    wellClass: "bg-amber-100 text-amber-800",
    iconClass: "text-amber-800",
  },
  {
    id: "vendas",
    label: "Vendas",
    description: "Clique, cupom e pedido",
    measures: "Cliques, pedidos e receita",
    icon: ShoppingBag,
    wellClass: "bg-sky-100 text-sky-800",
    iconClass: "text-sky-800",
  },
]

export const CAMPAIGN_TYPE_META: CampaignTypeMeta[] = [
  {
    value: "awareness",
    label: "Awareness",
    goal: "alcance",
    description: "Apresentar a marca para gente que ainda não conhece.",
    measures: "alcance e impressões",
    suggestedObjective: "Gerar reconhecimento da marca e alcance qualificado.",
    audienceTip: "Reels e TikTok costumam abrir mais alcance do que o feed parado.",
    suggestedNetworks: ["instagram", "tiktok"],
    suggestedFormats: ["reels", "stories"],
    icon: Megaphone,
    wellClass: "bg-violet-100 text-violet-700",
    iconClass: "text-violet-700",
  },
  {
    value: "engajamento",
    label: "Engajamento",
    goal: "alcance",
    description: "Puxar comentário, salvamento e sensação de comunidade.",
    measures: "interações e salvamentos",
    suggestedObjective: "Aumentar conversa em volta da marca e fortalecer a comunidade.",
    audienceTip: "Audiências menores, que comentam de verdade, rendem mais do que alcance vazio.",
    suggestedNetworks: ["instagram", "tiktok"],
    suggestedFormats: ["reels", "feed"],
    icon: Heart,
    wellClass: "bg-rose-100 text-rose-700",
    iconClass: "text-rose-700",
  },
  {
    value: "ugc",
    label: "UGC",
    goal: "conteudo",
    description: "Conteúdo feito pelo creator para a marca usar em anúncio e no site.",
    measures: "peças entregues e aprovadas",
    suggestedObjective: "Produzir um banco de peças autênticas para anúncios e redes da marca.",
    audienceTip: "Nano e micro costumam entregar um visual mais natural para anúncio.",
    suggestedNetworks: ["instagram", "tiktok"],
    suggestedFormats: ["reels", "tiktok"],
    icon: Clapperboard,
    wellClass: "bg-amber-100 text-amber-800",
    iconClass: "text-amber-800",
  },
  {
    value: "seeding",
    label: "Seeding",
    goal: "conteudo",
    description: "Enviar produto e deixar o creator publicar do jeito dele.",
    measures: "publicações orgânicas",
    suggestedObjective: "Colocar o produto na rotina de creators e gerar conteúdo orgânico.",
    audienceTip: "O nicho importa mais do que o porte: a pessoa precisa conseguir receber e usar o produto.",
    suggestedNetworks: ["instagram", "tiktok"],
    suggestedFormats: ["reels", "stories"],
    icon: Gift,
    wellClass: "bg-emerald-100 text-emerald-700",
    iconClass: "text-emerald-700",
  },
  {
    value: "embaixador",
    label: "Embaixadores",
    goal: "conteudo",
    description: "Relação longa, com a mesma pessoa falando da marca por meses.",
    measures: "recorrência e consistência",
    suggestedObjective: "Montar um grupo de embaixadores que representa a marca ao longo do tempo.",
    audienceTip: "Vale restringir o nicho e pedir um engajamento estável. Embaixador fica meses.",
    suggestedNetworks: ["instagram"],
    suggestedFormats: ["reels", "stories", "feed"],
    icon: Crown,
    wellClass: "bg-indigo-100 text-indigo-700",
    iconClass: "text-indigo-700",
  },
  {
    value: "live",
    label: "Live commerce",
    goal: "conteudo",
    description: "Venda ao vivo, com demonstração e oferta na hora.",
    measures: "audiência da live e pedidos",
    suggestedObjective: "Vender ao vivo com demonstração do produto e oferta durante a transmissão.",
    audienceTip: "Procure quem já vende em live e segura a audiência até o fim.",
    suggestedNetworks: ["instagram", "tiktok"],
    suggestedFormats: ["live"],
    icon: Radio,
    wellClass: "bg-fuchsia-100 text-fuchsia-700",
    iconClass: "text-fuchsia-700",
  },
  {
    value: "conversao",
    label: "Conversão",
    goal: "vendas",
    description: "Levar clique, lead e venda com uma oferta clara.",
    measures: "cliques, leads e pedidos",
    suggestedObjective: "Gerar cliques e vendas com uma oferta direta para o e-commerce.",
    audienceTip: "Cupom e link de cada creator entram depois, na gestão da campanha.",
    suggestedNetworks: ["instagram", "tiktok"],
    suggestedFormats: ["reels", "stories"],
    icon: ShoppingCart,
    wellClass: "bg-sky-100 text-sky-800",
    iconClass: "text-sky-800",
  },
  {
    value: "afiliado",
    label: "Afiliado",
    goal: "vendas",
    description: "Comissão por venda rastreada, com cupom ou link.",
    measures: "pedidos e comissão",
    suggestedObjective: "Ativar creators no modelo de comissão por venda rastreada.",
    audienceTip: "Sem rastreio não há comissão. Defina um engajamento mínimo para evitar alcance vazio.",
    suggestedNetworks: ["instagram", "youtube"],
    suggestedFormats: ["reels", "stories", "shorts"],
    icon: BadgePercent,
    wellClass: "bg-teal-100 text-teal-800",
    iconClass: "text-teal-800",
  },
]

export interface CampaignTemplate {
  id: string
  label: string
  blurb: string
  icon: LucideIcon
  type: CampaignType
  objective: string
  networks: string[]
  niches: string[]
  formats: ContentFormat[]
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "lancamento",
    label: "Lançamento",
    blurb: "Awareness em Instagram e TikTok",
    icon: Sparkles,
    type: "awareness",
    objective: "Apresentar o lançamento e gerar alcance qualificado nas primeiras semanas.",
    networks: ["instagram", "tiktok"],
    niches: ["lifestyle"],
    formats: ["reels", "stories"],
  },
  {
    id: "ugc",
    label: "Banco de UGC",
    blurb: "Peças curtas para anúncios",
    icon: Clapperboard,
    type: "ugc",
    objective: "Reunir peças curtas e naturais para usar em anúncios.",
    networks: ["instagram", "tiktok"],
    niches: ["beleza", "lifestyle"],
    formats: ["reels", "tiktok"],
  },
  {
    id: "afiliados",
    label: "Afiliados",
    blurb: "Comissão por venda rastreada",
    icon: BadgePercent,
    type: "afiliado",
    objective: "Recrutar afiliados e pagar comissão sobre vendas rastreadas.",
    networks: ["instagram", "youtube"],
    niches: ["lifestyle"],
    formats: ["reels", "stories"],
  },
]

export const CONTENT_FORMATS: { value: ContentFormat; label: string; hint: string; icon: LucideIcon }[] = [
  { value: "reels", label: "Reels", hint: "Vídeo curto", icon: Clapperboard },
  { value: "stories", label: "Stories", hint: "24 horas", icon: Circle },
  { value: "feed", label: "Feed", hint: "Post estático", icon: ImageIcon },
  { value: "tiktok", label: "TikTok", hint: "Vídeo nativo", icon: Video },
  { value: "shorts", label: "Shorts", hint: "YouTube curto", icon: TvMinimalPlay },
  { value: "live", label: "Live", hint: "Ao vivo", icon: Radio },
]

export function campaignTypeByValue(value?: string) {
  return CAMPAIGN_TYPE_META.find((type) => type.value === value)
}

export function campaignTypeLabel(value?: string) {
  return campaignTypeByValue(value)?.label ?? value ?? "—"
}

export function contentFormatByValue(value?: string) {
  return CONTENT_FORMATS.find((format) => format.value === value)
}

export function campaignGoalById(id?: string) {
  return CAMPAIGN_GOALS.find((goal) => goal.id === id)
}
