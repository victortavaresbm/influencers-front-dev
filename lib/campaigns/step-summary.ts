import { TIERS } from "@/lib/audience-tiers"
import { contentFormatByValue } from "@/lib/campaign-types"
import { COMMERCIAL_TERMS, STRATEGIES, TACTICS, formatBannerOfferLabel, nicheLabel as labelOfNiche } from "@/lib/campaigns/shape"
import type { WizardStepId } from "@/lib/campaigns/wizard-steps"
import { SOCIAL_NETWORK_LABEL } from "@/lib/mock-data/campaigns"
import { stripMarkdown } from "@/lib/markdown"
import { isBudgetNotApplicable } from "@/lib/campaigns/wizard-flow"
import type { WizardDraft } from "@/lib/stores/campaigns"

function money(value?: number) {
  if (!value) return null
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

function list(items: string[]) {
  if (items.length <= 1) return items[0] ?? ""
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`
}

export function stepSummary(id: WizardStepId, draft: WizardDraft): string | null {
  if (id === "website") {
    if (!draft.brandWebsite?.trim()) return "Informe o site. Se marcar o acompanhamento com IA (50 créditos), a pesquisa acontece ao avançar."
    if (draft.aiAccompaniment) return `Com o acompanhamento ligado (50 créditos), o Próximo lê ${draft.brandWebsite.trim()} e começa a preencher na identificação.`
    return `O site ${draft.brandWebsite.trim()} fica guardado. Sem acompanhamento, você preenche as próximas etapas à mão.`
  }
  if (id === "identity") {
    const niches = draft.niches?.length ? draft.niches : draft.niche ? [draft.niche] : []
    if (!draft.name?.trim() && !niches.length) return "Nome e nicho são o que o creator vê primeiro na vitrine."
    const name = draft.name?.trim()
    const nicheText = niches.length ? list(niches.map((item) => labelOfNiche(item) || item)) : ""
    const perpetual = draft.endDateNotApplicable ? " Campanha perpétua: sem data de encerramento até você fechar manualmente." : ""
    if (name && nicheText) return `${name} entra na vitrine como campanha de ${nicheText}.${perpetual}`
    if (name) return `${name} é o título que aparece no convite e na vitrine.${perpetual}`
    return `O nicho ${nicheText} organiza a campanha entre as outras da marca.${perpetual}`
  }
  if (id === "strategy") {
    const strategy = STRATEGIES.find((item) => item.id === draft.strategy)
    if (!strategy) return "A estratégia diz se a campanha quer ser vista, gerar conversa ou vender."
    if (strategy.id === "alcance") return "Alcance significa fazer a marca ser vista. As metas desta campanha medem visualização."
    if (strategy.id === "engajamento") return "Engajamento significa conversa, salvamento e comunidade. As metas medem interação."
    return "Vendas significa clique, cupom ou pedido. A tática e a comissão medem o resultado."
  }
  if (id === "tactics") {
    const picked = TACTICS.filter((item) => draft.tactics?.includes(item.id))
    if (!picked.length) return "A tática diz como o creator entrega e como o resultado é acompanhado."
    return `A entrega acontece por ${list(picked.map((item) => item.label.toLowerCase()))}. ${picked.map((item) => item.description).join(" ")}`
  }
  if (id === "audience") {
    if (!draft.audienceCountry && !draft.audienceAges?.length) return "O público é quem a campanha quer atingir, não o perfil do creator."
    const ages = draft.audienceAges?.length ? ` nas faixas ${list(draft.audienceAges)}` : ""
    const country = draft.audienceCountry ? ` em ${draft.audienceCountry}` : ""
    return `A campanha fala com pessoas${country}${ages}.`
  }
  if (id === "creator") {
    const networks = (draft.targetNetworks ?? []).map((item) => SOCIAL_NETWORK_LABEL[item as keyof typeof SOCIAL_NETWORK_LABEL] ?? item)
    const tiers = TIERS.filter((item) => draft.audienceTiers?.includes(item.id)).map((item) => item.label)
    const parts = [
      draft.creatorLocation ? `creators de ${draft.creatorLocation}` : "",
      draft.creatorLanguage ? `que falam ${draft.creatorLanguage}` : "",
      networks.length ? `ativos em ${list(networks)}` : "",
      tiers.length ? `no porte ${list(tiers)}` : "",
      draft.targetNiches?.length ? `do nicho ${list(draft.targetNiches)}` : "",
      typeof draft.minEngagement === "number"
        ? draft.minEngagement > 0
          ? `com pelo menos ${String(draft.minEngagement).replace(".", ",")}% de engajamento`
          : "com engajamento mínimo de 0%"
        : "",
    ].filter(Boolean)
    if (!parts.length) return "O creator ideal descreve quem pode se candidatar. Requisitos marcados depois bloqueiam quem não combina."
    return `A campanha procura ${parts.join(", ")}.`
  }
  if (id === "privacy") {
    if (draft.visibility === "publica") return "Pública aparece na vitrine e qualquer creator compatível pode se candidatar."
    if (draft.visibility === "privada") return "Privada fica na comunidade da marca e não entra na vitrine aberta."
    if (draft.visibility === "secreta") return "Secreta só existe para quem recebe o convite."
    return "A visibilidade define quem encontra a campanha."
  }
  if (id === "recommend") {
    if (draft.recommendToMatching === true) return "A plataforma pode indicar esta campanha para creators compatíveis."
    if (draft.recommendToMatching === false) return "A campanha não será sugerida. Só entra quem achar o anúncio ou receber convite."
    return "A recomendação decide se creators compatíveis recebem esta campanha."
  }
  if (id === "cap") {
    if (draft.applicationCap && draft.applicationCap >= 1) return `Depois de ${draft.applicationCap} candidaturas, a campanha sai da vitrine.`
    return "Sem limite, a campanha continua recebendo candidaturas na vitrine."
  }
  if (id === "community") return "O vínculo leva o creator da comunidade direto para esta campanha."
  if (id === "terms") {
    const terms = COMMERCIAL_TERMS.filter((item) => draft.commercialTerms?.includes(item.id)).map((item) => item.label.toLowerCase())
    if (!terms.length) return "A condição comercial abre o bloco correspondente no orçamento."
    const hasFixo = draft.commercialTerms?.includes("fixo")
    const teto = !hasFixo
      ? ""
      : isBudgetNotApplicable(draft)
        ? " Sem teto de campanha."
        : money(draft.budget) || draft.maxInfluencers
          ? ` Teto${money(draft.budget) ? ` de ${money(draft.budget)}` : ""}${draft.maxInfluencers ? ` para até ${draft.maxInfluencers} influencers` : ""}.`
          : ""
    return `A campanha paga com ${list(terms)}.${teto || " Cada condição escolhida pede o valor dela no próximo passo."}`
  }
  if (id === "budget") {
    const bannerLabel = formatBannerOfferLabel({
      bannerOffer: draft.bannerOffer,
      bannerShowItems: draft.bannerShowItems,
      perInfluencerFee: draft.perInfluencerFee,
      fixedFeePerPost: draft.fixedFeePerPost,
      commissionPercent: draft.commissionPercent,
      commissionFixed: draft.commissionFixed,
      commission: draft.commission,
      commissionModes: draft.commissionModes,
    })
    const fee =
      bannerLabel === "—" || bannerLabel === "Entre em contato"
        ? bannerLabel === "Entre em contato"
          ? "Entre em contato no banner do marketplace"
          : ""
        : `${bannerLabel} no banner do marketplace para os influenciadores`
    const bits = [
      (draft.commissionModes?.includes("percent") || draft.commission?.mode === "percent") && (draft.commissionPercent ?? draft.commission?.value)
        ? `comissão de ${draft.commissionPercent ?? draft.commission?.value}%`
        : "",
      (draft.commissionModes?.includes("fixed") || draft.commission?.mode === "fixed") && (draft.commissionFixed ?? (draft.commission?.mode === "fixed" ? draft.commission.value : undefined))
        ? `comissão de ${money(draft.commissionFixed ?? draft.commission?.value)}`
        : "",
      (draft.commissionModes?.includes("contract") || draft.commission?.mode === "contract") && (draft.commissionModes?.length ?? 1) === 1
        ? "comissão em contrato"
        : "",
      draft.commercialTerms?.includes("fixo") && draft.fixedFeePerPost ? `fixo de ${money(draft.fixedFeePerPost)} por post` : "",
      fee,
    ].filter(Boolean)
    if (!bits.length) {
      return "No orçamento você define o valor de cada condição e o que aparece no banner do marketplace."
    }
    return `A simulação fica com ${list(bits)}.`
  }
  if (id === "brief") {
    if (!draft.description?.trim() && !draft.productCategories?.length) return "O briefing é o texto que o creator lê antes de se candidatar."
    const categories = draft.productCategories?.length ? ` Categorias: ${list(draft.productCategories)}.` : ""
    const story = stripMarkdown(draft.description ?? "") || "O creator segue as categorias da marca."
    return `${story}${categories}`
  }
  if (id === "scope") {
    const formats = (draft.formatQuantities ?? []).map((item) => {
      const label = contentFormatByValue(item.format)?.label ?? item.format
      return `${item.quantity} ${label}`
    })
    if (!formats.length) return "Formato, quantidade e rede definem o que o creator entrega."
    return `O creator entrega ${list(formats)}.`
  }
  if (id === "metrics") {
    const tags = [...(draft.mandatoryHashtags ?? []), ...(draft.mandatoryMentions ?? []).map((item) => item.handle)]
    const goals = draft.successTargets?.length ? `${draft.successTargets.length} meta${draft.successTargets.length > 1 ? "s" : ""} de resultado` : ""
    if (!tags.length && !goals) return "As metas medem visualização ou interação, no tom da estratégia escolhida."
    return `A campanha acompanha ${[goals, tags.length ? list(tags) : ""].filter(Boolean).join(" e ")}.`
  }
  if (id === "invites") {
    const count = draft.inviteIds?.length ?? 0
    if (!count) return "Quem for convidado recebe e-mail e, se já tiver o app, uma notificação."
    return `${count} perfil${count > 1 ? "s" : ""} já ${count > 1 ? "recebem" : "recebe"} o convite ao publicar.`
  }
  return null
}
