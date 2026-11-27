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
  { id: "publipost", label: "Publi Post", description: "Pagamento por post" },
  { id: "live", label: "Live Commerce", description: "Venda ao vivo" },
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

export const NICHE_CATALOG = [
  {
    id: "beleza",
    label: "Beleza",
    description: "Maquiagem, pele e cabelo",
    examples: "Cosméticos, skincare, salões, dermocosméticos",
  },
  {
    id: "saude-bem-estar",
    label: "Saúde & Bem-estar",
    description: "Farmácia, suplementos e autocuidado",
    examples: "Farmácias, drogarias, vitaminas, clínicas, saúde mental",
  },
  {
    id: "fitness",
    label: "Fitness & Esportes",
    description: "Treino, corrida e performance",
    examples: "Academias, artigos esportivos, roupas fitness, nutrição esportiva",
  },
  {
    id: "moda",
    label: "Moda",
    description: "Roupa, calçado e acessório",
    examples: "Lojas de vestuário, calçados, joias, óticas, streetwear",
  },
  {
    id: "gastronomia",
    label: "Gastronomia",
    description: "Comida, bebida e culinária",
    examples: "Restaurantes, delivery, cafeterias, bebidas, mercados",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    description: "Rotina, vlogs e dia a dia",
    examples: "Marcas de consumo diário, papelaria, presentes, conveniência",
  },
  {
    id: "casa-decoracao",
    label: "Casa & Decoração",
    description: "Móveis, organização e reforma",
    examples: "Lojas de móveis, cama/mesa/banho, eletros, arquitetura, DIY",
  },
  {
    id: "maternidade-familia",
    label: "Maternidade & Família",
    description: "Bebês, crianças e parentalidade",
    examples: "Moda infantil, brinquedos, puericultura, produtos para gestantes",
  },
  {
    id: "pets",
    label: "Pets",
    description: "Produtos e serviços PARA cães, gatos e outros animais de estimação",
    examples: "Pet shops, rações, coleiras, brinquedos pet, clínicas veterinárias — nunca marcas humanas veganas/cruelty-free",
  },
  {
    id: "tecnologia",
    label: "Tecnologia",
    description: "Eletrônicos, apps e software",
    examples: "SaaS, celulares, gadgets, eletrônicos, inteligência artificial",
  },
  {
    id: "games",
    label: "Games",
    description: "Jogos e cultura gamer",
    examples: "Periféricos, consoles, jogos, cadeiras gamer, e-sports",
  },
  {
    id: "financas-negocios",
    label: "Finanças & Negócios",
    description: "Dinheiro, investimentos e carreira",
    examples: "Bancos, fintechs, contabilidade, ferramentas B2B, empreendedorismo",
  },
  {
    id: "educacao",
    label: "Educação",
    description: "Cursos, idiomas e livros",
    examples: "Edtechs, faculdades, escolas de idiomas, infoprodutos, editoras",
  },
  {
    id: "viagem",
    label: "Viagem & Turismo",
    description: "Destinos, hotéis e experiências",
    examples: "Agências, companhias aéreas, hotéis, malas, parques",
  },
  {
    id: "automotivo",
    label: "Automotivo",
    description: "Carros, motos e mobilidade",
    examples: "Concessionárias, estética automotiva, autopeças, apps de mobilidade",
  },
  {
    id: "cultura-entretenimento",
    label: "Cultura & Entretenimento",
    description: "Humor, música, cinema e eventos",
    examples: "Festivais, streamings, teatros, humoristas, eventos locais",
  },
] as const

export type NicheId = (typeof NICHE_CATALOG)[number]["id"]

export const NICHES: NicheId[] = NICHE_CATALOG.map((item) => item.id)

/** Mapeia IDs legados para o catálogo atual. */
const NICHE_ALIASES: Record<string, NicheId> = {
  humor: "cultura-entretenimento",
  finanças: "financas-negocios",
  financas: "financas-negocios",
  saude: "saude-bem-estar",
  "bem-estar": "saude-bem-estar",
  casa: "casa-decoracao",
  decoração: "casa-decoracao",
  decoracao: "casa-decoracao",
  maternidade: "maternidade-familia",
  família: "maternidade-familia",
  familia: "maternidade-familia",
  educação: "educacao",
  esportes: "fitness",
  entretenimento: "cultura-entretenimento",
}

export function nicheById(id?: string) {
  if (!id) return undefined
  const normalized = normalizeNicheId(id)
  return NICHE_CATALOG.find((item) => item.id === normalized)
}

export function nicheLabel(id?: string) {
  return nicheById(id)?.label ?? id ?? ""
}

export function normalizeNicheId(value: string): NicheId | undefined {
  const raw = value.trim().toLowerCase()
  if (!raw) return undefined
  if ((NICHES as string[]).includes(raw)) return raw as NicheId
  return NICHE_ALIASES[raw]
}

export function normalizeNicheList(values: string[] | undefined, max = 3): NicheId[] {
  if (!values?.length) return []
  const seen = new Set<NicheId>()
  const result: NicheId[] = []
  for (const value of values) {
    const id = normalizeNicheId(value)
    if (!id || seen.has(id)) continue
    seen.add(id)
    result.push(id)
    if (result.length >= max) break
  }
  return result
}

/** Opções do dropdown de engajamento mínimo no wizard (ids = valor numérico). */
export const ENGAGEMENT_MIN_OPTIONS = [
  { id: "0", value: 0, label: "0%", description: "Sem restrição de engajamento" },
  { id: "1", value: 1, label: "1%", description: "Audiência ampla, pouca conversa" },
  { id: "2", value: 2, label: "2%", description: "Equilíbrio entre alcance e resposta" },
  { id: "3.5", value: 3.5, label: "3,5%", description: "Comunidade que comenta e salva" },
  { id: "5", value: 5, label: "5%", description: "Audiência muito próxima da marca" },
] as const

export function snapMinEngagement(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return undefined
  let bestValue = ENGAGEMENT_MIN_OPTIONS[0].value
  let bestDist = Math.abs(value - bestValue)
  for (const option of ENGAGEMENT_MIN_OPTIONS) {
    const dist = Math.abs(value - option.value)
    if (dist < bestDist) {
      bestValue = option.value
      bestDist = dist
    }
  }
  return bestValue
}

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
  niches?: string[]
  applicationStart?: string
  applicationEnd?: string
  endDateNotApplicable?: boolean
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
  commissionModes?: Array<"percent" | "fixed" | "contract">
  commissionPercent?: number
  commissionFixed?: number
  maxInfluencers?: number
  perInfluencerFee?: number | "contact"
  bannerOffer?: "contact" | "show"
  bannerShowItems?: BannerShowItem[]
  bannerOfferKind?: "percent" | "fixed"
  termsAccepted?: boolean
  productCategories?: string[]
  seedingProducts?: SeedingProduct[]
  daysToPost?: number
  seedingMode?: SeedingCampaign["mode"]
  inviteIds?: string[]
  audienceTiers?: string[]
}

export type BannerShowItem = "fixedFee" | "commissionPercent" | "commissionFixed"

export function availableBannerShowItems(input: {
  commercialTerms?: CommercialTerm[]
  commissionModes?: Array<"percent" | "fixed" | "contract">
  commission?: Campaign["commission"]
}): BannerShowItem[] {
  const terms = input.commercialTerms ?? []
  const modes = input.commissionModes?.length
    ? input.commissionModes
    : input.commission?.mode
      ? [input.commission.mode]
      : []
  const items: BannerShowItem[] = []
  if (terms.includes("fixo")) items.push("fixedFee")
  if (terms.includes("comissao") && modes.includes("percent")) items.push("commissionPercent")
  if (terms.includes("comissao") && modes.includes("fixed")) items.push("commissionFixed")
  return items
}

/** Normaliza a seleção: remove inválidos e garante no máx. uma comissão. */
export function normalizeBannerShowItems(
  selected: BannerShowItem[] | undefined,
  available: BannerShowItem[],
  preferCommission?: "commissionPercent" | "commissionFixed",
): BannerShowItem[] {
  const allowed = new Set(available)
  const next = (selected ?? []).filter((item) => allowed.has(item))
  const hasPercent = next.includes("commissionPercent")
  const hasFixed = next.includes("commissionFixed")
  if (hasPercent && hasFixed) {
    const keep = preferCommission && allowed.has(preferCommission)
      ? preferCommission
      : next.includes("commissionPercent")
        ? "commissionPercent"
        : "commissionFixed"
    return next.filter((item) => item === "fixedFee" || item === keep)
  }
  return next
}

export function defaultBannerShowItems(available: BannerShowItem[]): BannerShowItem[] {
  if (!available.length) return []
  const hasFee = available.includes("fixedFee")
  const commission = available.includes("commissionPercent")
    ? "commissionPercent" as const
    : available.includes("commissionFixed")
      ? "commissionFixed" as const
      : undefined
  if (hasFee && commission) return ["fixedFee", commission]
  if (hasFee) return ["fixedFee"]
  if (commission) return [commission]
  return available.slice(0, 1)
}

export function primaryBannerFee(input: {
  bannerShowItems?: BannerShowItem[]
  fixedFeePerPost?: number
  commissionPercent?: number
  commissionFixed?: number
  commission?: Campaign["commission"]
}): number | undefined {
  const items = input.bannerShowItems ?? []
  if (items.includes("commissionPercent")) {
    return input.commissionPercent ?? (input.commission?.mode === "percent" ? input.commission.value : undefined)
  }
  if (items.includes("commissionFixed")) {
    return input.commissionFixed ?? (input.commission?.mode === "fixed" ? input.commission.value : undefined)
  }
  if (items.includes("fixedFee")) return input.fixedFeePerPost
  return undefined
}

export function formatBannerOfferLabel(input: {
  bannerOffer?: "contact" | "show"
  bannerShowItems?: BannerShowItem[]
  perInfluencerFee?: number | "contact"
  fixedFeePerPost?: number
  commissionPercent?: number
  commissionFixed?: number
  commission?: Campaign["commission"]
  commissionModes?: Array<"percent" | "fixed" | "contract">
}): string {
  if (
    input.bannerOffer === "contact"
    || input.perInfluencerFee === "contact"
    || (input.commissionModes?.length === 1 && input.commissionModes[0] === "contract")
    || input.commission?.mode === "contract"
  ) {
    return "Entre em contato"
  }
  if (input.bannerOffer !== "show") {
    return typeof input.perInfluencerFee === "number"
      ? input.perInfluencerFee.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
      : "—"
  }
  const items = input.bannerShowItems?.length
    ? input.bannerShowItems
    : defaultBannerShowItems(
        availableBannerShowItems({
          commercialTerms: [
            ...(input.fixedFeePerPost ? (["fixo"] as CommercialTerm[]) : []),
            ...((input.commissionPercent !== undefined || input.commission?.mode === "percent" || input.commissionModes?.includes("percent")) ? (["comissao"] as CommercialTerm[]) : []),
          ],
          commissionModes: input.commissionModes ?? (input.commission?.mode ? [input.commission.mode] : []),
          commission: input.commission,
        }),
      )
  const parts: string[] = []
  if (items.includes("fixedFee") && input.fixedFeePerPost) {
    parts.push(input.fixedFeePerPost.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }))
  }
  if (items.includes("commissionPercent")) {
    const amount = input.commissionPercent ?? (input.commission?.mode === "percent" ? input.commission.value : undefined)
    if (amount !== undefined) parts.push(`${String(amount).replace(".", ",")}%`)
  }
  if (items.includes("commissionFixed")) {
    const amount = input.commissionFixed ?? (input.commission?.mode === "fixed" ? input.commission.value : undefined)
    if (amount !== undefined) {
      parts.push(amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) + " / pedido")
    }
  }
  return parts.length ? parts.join(" + ") : "—"
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
    niche: draft.niches?.length ? draft.niches.map((item) => nicheLabel(item) || item).join(" · ") : draft.niche,
    applicationStart: draft.applicationStart,
    applicationEnd: draft.applicationEnd,
    recommendToMatching: draft.recommendToMatching,
    applicationCap: draft.applicationCap && draft.applicationCap >= 1 ? draft.applicationCap : undefined,
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
    commission: (() => {
      const modes = draft.commissionModes?.length
        ? draft.commissionModes
        : draft.commission?.mode
          ? [draft.commission.mode]
          : []
      if (!modes.length) return draft.commission
      if (modes.includes("contract")) return { mode: "contract" as const, notes: draft.commission?.notes }
      const prefer = draft.bannerOfferKind && modes.includes(draft.bannerOfferKind)
        ? draft.bannerOfferKind
        : modes.includes("percent")
          ? "percent" as const
          : "fixed" as const
      const value = prefer === "percent"
        ? draft.commissionPercent ?? (draft.commission?.mode === "percent" ? draft.commission.value : undefined)
        : draft.commissionFixed ?? (draft.commission?.mode === "fixed" ? draft.commission.value : undefined)
      return { mode: prefer, value, notes: draft.commission?.notes }
    })(),
    maxInfluencers: draft.maxInfluencers,
    bannerOffer: draft.bannerOffer,
    bannerShowItems: (() => {
      const available = availableBannerShowItems(draft)
      if (draft.bannerOffer === "contact" || (draft.commissionModes?.length === 1 && draft.commissionModes[0] === "contract")) {
        return undefined
      }
      if (draft.bannerShowItems?.length) return normalizeBannerShowItems(draft.bannerShowItems, available)
      // Compat: rascunhos antigos com bannerOfferKind
      if (draft.bannerOffer === "show" && draft.bannerOfferKind) {
        const legacy: BannerShowItem[] = []
        if (available.includes("fixedFee") && draft.bannerOfferKind !== "percent") legacy.push("fixedFee")
        if (draft.bannerOfferKind === "percent" && available.includes("commissionPercent")) legacy.push("commissionPercent")
        if (draft.bannerOfferKind === "fixed" && available.includes("commissionFixed")) legacy.push("commissionFixed")
        if (!legacy.length && available.includes("fixedFee")) legacy.push("fixedFee")
        return normalizeBannerShowItems(legacy, available)
      }
      return draft.bannerOffer === "show" ? defaultBannerShowItems(available) : undefined
    })(),
    perInfluencerFee: (() => {
      const modes = draft.commissionModes?.length
        ? draft.commissionModes
        : draft.commission?.mode
          ? [draft.commission.mode]
          : []
      if (
        draft.bannerOffer === "contact"
        || draft.perInfluencerFee === "contact"
        || (modes.length === 1 && modes[0] === "contract")
      ) {
        return "contact" as const
      }
      if (draft.bannerOffer !== "show") return draft.perInfluencerFee
      const available = availableBannerShowItems(draft)
      const items = normalizeBannerShowItems(
        draft.bannerShowItems?.length ? draft.bannerShowItems : defaultBannerShowItems(available),
        available,
      )
      return primaryBannerFee({
        bannerShowItems: items,
        fixedFeePerPost: draft.fixedFeePerPost,
        commissionPercent: draft.commissionPercent,
        commissionFixed: draft.commissionFixed,
        commission: draft.commission,
      }) ?? (typeof draft.perInfluencerFee === "number" ? draft.perInfluencerFee : undefined)
    })(),
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
