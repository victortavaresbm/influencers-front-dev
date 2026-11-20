import type { SeedingCampaign, SeedingProduct } from "@/lib/mock-data/seeding"
import type { Creator } from "@/lib/mock-data/creators"
import {
  normalizeMentions,
  type Campaign,
  type CampaignStrategy,
  type CampaignTactic,
  type CampaignType,
  type CampaignVisibility,
  type CommercialTerm,
  type ContentFormat,
  type CreatorRequirementKey,
  type FormatQuantity,
  type Participant,
  type SocialNetwork,
} from "@/lib/mock-data/campaigns"

export const STRATEGIES: { id: CampaignStrategy; label: string; description: string }[] = [
  { id: "alcance", label: "Alcance", description: "Fazer a marca ser vista e lembrada" },
  { id: "engajamento", label: "Engajamento", description: "Comentário, salvamento e comunidade" },
  { id: "vendas", label: "Vendas", description: "Clique, cupom e pedido" },
]

export const TACTICS: { id: CampaignTactic; label: string; description: string }[] = [
  { id: "publipost", label: "Publi post", description: "Pagamento por post" },
  { id: "live", label: "Live commerce", description: "Venda ao vivo" },
  { id: "link", label: "Link", description: "Link rastreável" },
  { id: "cupom", label: "Cupom", description: "Cupom de desconto" },
]

export const COMMERCIAL_TERMS: { id: CommercialTerm; label: string }[] = [
  { id: "fixo", label: "Fixo" },
  { id: "permuta", label: "Permuta" },
  { id: "comissao", label: "Comissão" },
]

export const REQUIREMENT_FIELDS: { id: CreatorRequirementKey; label: string }[] = [
  { id: "niches", label: "Nicho" },
  { id: "followers", label: "Porte" },
  { id: "engagement", label: "Engajamento mínimo" },
  { id: "location", label: "Localização" },
  { id: "audience", label: "Dados de audiência" },
  { id: "language", label: "Idioma" },
  { id: "networks", label: "Rede social" },
]

export const NICHES = ["beleza", "moda", "fitness", "gastronomia", "tecnologia", "lifestyle", "humor", "games", "finanças", "viagem"]

export const AGE_RANGES = ["0-17", "18-24", "25-34", "35-44", "45+"]

export const COUNTRIES = ["Brasil", "Portugal", "Estados Unidos", "França", "Espanha", "México"]

export const LANGUAGES = ["Português", "Inglês", "Espanhol", "Francês"]

export function strategyLabel(id?: string) {
  return STRATEGIES.find((item) => item.id === id)?.label ?? id ?? ""
}

export function tacticLabel(id?: string) {
  return TACTICS.find((item) => item.id === id)?.label ?? id ?? ""
}

export function deriveCampaignType(input: {
  strategy?: CampaignStrategy
  tactics?: CampaignTactic[]
  commercialTerms?: CommercialTerm[]
}): CampaignType {
  const tactics = input.tactics ?? []
  const terms = input.commercialTerms ?? []
  if (tactics.includes("live")) return "live"
  if (input.strategy === "vendas" && tactics.includes("cupom")) return "afiliado"
  if (input.strategy === "vendas" && tactics.includes("link")) return "conversao"
  if (terms.includes("permuta") && !terms.includes("fixo")) return "seeding"
  if (input.strategy === "engajamento") return "engajamento"
  return "awareness"
}

export function fieldsFromLegacyType(type: CampaignType): {
  strategy: CampaignStrategy
  tactics: CampaignTactic[]
  commercialTerms?: CommercialTerm[]
} {
  if (type === "engajamento" || type === "embaixador") return { strategy: "engajamento", tactics: ["publipost"] }
  if (type === "live") return { strategy: "vendas", tactics: ["live"] }
  if (type === "conversao") return { strategy: "vendas", tactics: ["link"] }
  if (type === "afiliado") return { strategy: "vendas", tactics: ["cupom"] }
  if (type === "seeding") return { strategy: "alcance", tactics: ["publipost"], commercialTerms: ["permuta"] }
  return { strategy: "alcance", tactics: ["publipost"] }
}

export function datesAreValid(start?: string, end?: string) {
  if (!start || !end) return true
  return end >= start
}

export function applicationWindowValid(draft: {
  startDate?: string
  endDate?: string
  applicationStart?: string
  applicationEnd?: string
}) {
  if (!datesAreValid(draft.applicationStart, draft.applicationEnd)) return false
  if (draft.applicationEnd && draft.endDate && draft.applicationEnd > draft.endDate) return false
  if (draft.applicationStart && draft.startDate && draft.endDate && draft.applicationStart > draft.endDate) return false
  return true
}

export function applicationCount(campaign: Campaign) {
  return (campaign.participants ?? []).filter((participant) => participant.status !== "convidado").length
}

export function communityPath(organizationId: string, campaignId: string) {
  return `/creator/campaigns/${campaignId}?community=${organizationId}`
}

function fold(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
}

export function creatorBlockedByRequirements(campaign: Campaign, creator: Creator) {
  const required = new Set(campaign.requiredCreatorFields ?? [])
  if (required.has("niches") && campaign.targetNiches?.length) {
    const wanted = new Set(campaign.targetNiches)
    if (!creator.niche.some((item) => wanted.has(item))) return "nicho"
  }
  if (required.has("followers")) {
    const min = campaign.minFollowers ?? 0
    const max = campaign.maxFollowers || Number.POSITIVE_INFINITY
    if (creator.totalFollowers < min || creator.totalFollowers > max) return "porte"
  }
  if (required.has("engagement") && (campaign.minEngagement ?? 0) > 0) {
    if (creator.avgEngagement < (campaign.minEngagement ?? 0)) return "engajamento"
  }
  if (required.has("networks") && campaign.targetNetworks?.length) {
    const wanted = new Set(campaign.targetNetworks)
    if (!creator.networks.some((item) => wanted.has(item.network))) return "rede"
  }
  if (required.has("location") && campaign.creatorLocation && creator.location) {
    const place = fold(creator.location)
    const wanted = fold(campaign.creatorLocation)
    if (!place.includes(wanted) && !wanted.includes(place)) return "localização"
  }
  if (required.has("audience") && campaign.audienceAges?.length && creator.audienceAge?.length) {
    const ageKey = (value: string) => value.replace(/[–—]/g, "-").replace(/\s/g, "")
    const ages = new Set(creator.audienceAge.map((item) => ageKey(item.range)))
    if (!campaign.audienceAges.some((item) => ages.has(ageKey(item)))) return "audiência"
  }
  return null
}

function deliverableType(format: ContentFormat): Participant["deliverables"][number]["type"] {
  if (format === "reels") return "reels"
  if (format === "stories") return "stories"
  if (format === "tiktok") return "tiktok"
  if (format === "feed") return "post_feed"
  return "video_youtube"
}

export interface PublishInput {
  reservedId?: string
  name?: string
  description?: string
  objective?: string
  strategy?: CampaignStrategy
  tactics?: CampaignTactic[]
  commercialTerms?: CommercialTerm[]
  startDate?: string
  endDate?: string
  budget?: number
  targetNiches?: string[]
  targetNetworks?: string[]
  minFollowers?: number
  maxFollowers?: number
  minEngagement?: number
  mandatoryHashtags?: string[]
  mandatoryMentions?: Campaign["mandatoryMentions"]
  contentFormats?: ContentFormat[]
  formatQuantities?: FormatQuantity[]
  doList?: string[]
  dontList?: string[]
  successTargets?: Campaign["successTargets"]
  formId?: string
  visibility?: CampaignVisibility
  coverImage?: string
  brandWebsite?: string
  niche?: string
  applicationStart?: string
  applicationEnd?: string
  recommendToMatching?: boolean
  applicationCap?: number
  creatorLocation?: string
  creatorLanguage?: string
  audienceNotes?: string
  audienceCountry?: string
  audienceAges?: string[]
  requiredCreatorFields?: CreatorRequirementKey[]
  fixedFeePerPost?: number
  commission?: Campaign["commission"]
  maxInfluencers?: number
  perInfluencerFee?: number | "contact"
  termsAccepted?: boolean
  productCategories?: string[]
  seedingProducts?: SeedingProduct[]
  daysToPost?: number
  seedingMode?: SeedingCampaign["mode"]
  inviteIds?: string[]
  audienceTiers?: string[]
}

export function buildPublishedCampaign(
  draft: PublishInput,
  user: { organizationId?: string; organizationName?: string },
  creators: Creator[],
  status: "rascunho" | "aberta",
) {
  const today = new Date().toISOString().split("T")[0]
  const id = draft.reservedId || `camp_${Date.now()}`
  const organizationId = user.organizationId ?? "org1"
  const quantities = (draft.formatQuantities ?? []).filter((item) => item.quantity > 0)
  const formats = quantities.length
    ? quantities.map((item) => item.format)
    : draft.contentFormats ?? []
  const type = deriveCampaignType(draft)
  const invited = creators.filter((creator) => (draft.inviteIds ?? []).includes(creator.id))
  const participants: Participant[] = invited.map((creator) => ({
    creatorId: creator.id,
    creatorName: creator.name,
    creatorHandle: creator.handle,
    avatar: creator.avatar,
    tier: creator.tier,
    status: "convidado",
    fee: Number(draft.fixedFeePerPost) || 0,
    deliverables: formats.map((format) => ({ type: deliverableType(format), quantity: quantities.find((item) => item.format === format)?.quantity ?? 1 })),
    level: creator.level,
    memberType: creator.memberType,
  }))
  const strategy = draft.strategy
  const campaign: Campaign = {
    id,
    organizationId,
    organizationName: user.organizationName ?? "",
    name: draft.name?.trim() || "Campanha sem nome",
    description: draft.description?.trim() ?? "",
    objective: draft.objective?.trim() || (strategy ? strategyLabel(strategy) : ""),
    type,
    status,
    startDate: draft.startDate ?? "",
    endDate: draft.endDate ?? "",
    budget: Number(draft.budget) || 0,
    budgetSpent: 0,
    targetNiches: draft.targetNiches ?? [],
    targetNetworks: draft.targetNetworks ?? [],
    minFollowers: Number(draft.minFollowers) || 0,
    maxFollowers: Number(draft.maxFollowers) || 10_000_000,
    minEngagement: Number(draft.minEngagement) || 0,
    mandatoryHashtags: draft.mandatoryHashtags ?? [],
    mandatoryMentions: normalizeMentions(draft.mandatoryMentions),
    contentFormats: formats,
    formatQuantities: quantities.length ? quantities : undefined,
    successTargets: draft.successTargets,
    doList: draft.doList?.filter((item) => item.trim()).length ? draft.doList.filter((item) => item.trim()) : undefined,
    dontList: draft.dontList?.filter((item) => item.trim()).length ? draft.dontList.filter((item) => item.trim()) : undefined,
    participants,
    formId: draft.formId,
    createdAt: today,
    updatedAt: today,
    coverImage: draft.coverImage,
    visibility: draft.visibility ?? "publica",
    brandWebsite: draft.brandWebsite,
    niche: draft.niche,
    applicationStart: draft.applicationStart,
    applicationEnd: draft.applicationEnd,
    recommendToMatching: draft.recommendToMatching,
    applicationCap: draft.applicationCap,
    communityLink: communityPath(organizationId, id),
    strategy: draft.strategy,
    tactics: draft.tactics,
    productCategories: draft.productCategories,
    creatorLocation: draft.creatorLocation,
    creatorLanguage: draft.creatorLanguage,
    audienceNotes: draft.audienceNotes,
    audienceCountry: draft.audienceCountry,
    audienceAges: draft.audienceAges,
    requiredCreatorFields: draft.requiredCreatorFields,
    commercialTerms: draft.commercialTerms,
    fixedFeePerPost: draft.fixedFeePerPost,
    commission: draft.commission,
    maxInfluencers: draft.maxInfluencers,
    perInfluencerFee: draft.perInfluencerFee,
    termsAccepted: status === "aberta" ? true : draft.termsAccepted,
  }
  const products = (draft.seedingProducts ?? [])
    .map((product) => ({ ...product, name: product.name.trim(), variants: product.variants.length ? product.variants : ["Único"], stockUsed: 0 }))
    .filter((product) => product.name)
  const seeding: SeedingCampaign | null = draft.commercialTerms?.includes("permuta") && products.length
    ? {
        id: `s-${id}`,
        campaignId: id,
        organizationId,
        name: campaign.name,
        status: status === "aberta" ? "ativa" : "rascunho",
        mode: draft.seedingMode ?? "fechado",
        objective: campaign.objective,
        expectedHashtag: campaign.mandatoryHashtags[0],
        expectedMention: campaign.mandatoryMentions[0]?.handle,
        expectedFormats: formats,
        daysToPost: draft.daysToPost ?? 7,
        products,
        creators: [],
        createdAt: today,
        startDate: campaign.startDate || undefined,
        endDate: campaign.endDate || undefined,
      }
    : null
  return { campaign, seeding }
}

export function isSocialNetwork(value: string): value is SocialNetwork {
  return value === "instagram" || value === "tiktok" || value === "youtube"
}
