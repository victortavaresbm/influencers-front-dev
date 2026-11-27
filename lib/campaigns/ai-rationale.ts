import type { AutofillSuggestion, BrandAbrangencia, BrandModelo, BrandPorte, CompanyProfile } from "@/lib/campaigns/autofill"
import { nicheLabel as catalogNicheLabel, strategyLabel, tacticLabel } from "@/lib/campaigns/shape"
import type { WizardStepId } from "@/lib/campaigns/wizard-steps"
import { SOCIAL_NETWORK_LABEL, isSocialNetwork, type CampaignStrategy, type CampaignTactic, type CampaignVisibility, type ContentFormat } from "@/lib/mock-data/campaigns"
import { TIERS } from "@/lib/audience-tiers"
import { stripMarkdown } from "@/lib/markdown"
import { successMetricById } from "@/lib/success-metrics"
import type { WizardDraft } from "@/lib/stores/campaigns"

export interface RationalePoint {
  label: string
  value: string
  why: string
}

export interface StepRationale {
  title: string
  lead: string
  points: RationalePoint[]
  source?: string
  /** Opções/valores selecionados na etapa — para destacar no texto do Insight. */
  highlights?: string[]
}

const PORTE_LABEL: Record<BrandPorte, string> = {
  pequena: "marca pequena / emergente",
  media: "marca média / em expansão",
  grande: "marca grande / enterprise",
}

const MODELO_LABEL: Record<BrandModelo, string> = {
  ecommerce_d2c: "e-commerce próprio",
  marketplace: "marketplace / varejo multimarca",
  app_saas: "app ou software",
  servico_b2b: "serviço B2B",
  negocio_local: "negócio local",
  institucional: "marca institucional",
}

const ABRANGENCIA_LABEL: Record<BrandAbrangencia, string> = {
  local: "atuação local",
  regional: "atuação regional",
  nacional: "cobertura nacional",
  global_br: "operação global com presença no Brasil",
}

const VISIBILITY_LABEL: Record<CampaignVisibility, string> = {
  publica: "Pública",
  privada: "Privada",
  secreta: "Secreta",
}

const FORMAT_LABEL: Record<ContentFormat, string> = {
  reels: "Reels",
  stories: "Stories",
  feed: "Feed",
  tiktok: "TikTok",
  youtube: "YouTube",
  shorts: "Shorts",
  live: "Live",
}

function noteOf(suggestion: AutofillSuggestion | undefined, id: WizardStepId) {
  return humanizeInsight(suggestion?.notes?.[id]?.trim() || "")
}

/** Remove IDs técnicos e underscores de textos exibidos ao usuário. */
export function humanizeInsight(text: string) {
  if (!text) return ""
  let next = text
  const replacements: [RegExp, string][] = [
    [/\becommerce_d2c\b/gi, "e-commerce próprio"],
    [/\bapp_saas\b/gi, "app ou software"],
    [/\bservico_b2b\b/gi, "serviço B2B"],
    [/\bnegocio_local\b/gi, "negócio local"],
    [/\bglobal_br\b/gi, "operação global no Brasil"],
    [/\btracked_link_clicks\b/gi, "cliques no link rastreável"],
    [/\bcoupon_uses\b/gi, "cupons utilizados"],
    [/\bstory_link_clicks\b/gi, "cliques no link do Story"],
    [/\bbio_link_clicks\b/gi, "cliques no link do perfil"],
    [/\bapp_download_clicks\b/gi, "cliques para baixar o app"],
    [/\bengaged_views\b/gi, "visualizações engajadas"],
    [/\bskip_rate\b/gi, "taxa de pulo"],
    [/\bprofile_visits\b/gi, "visitas ao perfil"],
    [/\bdirection_clicks\b/gi, "cliques em como chegar"],
    [/\btext_clicks\b/gi, "cliques em mensagem"],
    [/\bpublipost\b/gi, "Publi Post"],
    [/\bcomissao\b/gi, "comissão"],
    [/\bpublica\b/gi, "pública"],
    [/\bprivada\b/gi, "privada"],
    [/\bsecreta\b/gi, "secreta"],
    [/[_]+/g, " "],
  ]
  for (const [pattern, value] of replacements) next = next.replace(pattern, value)
  return next.replace(/\s{2,}/g, " ").trim()
}

const HIGHLIGHT_STATUS = new Set([
  "incluída",
  "incluida",
  "acompanhar",
  "sim",
  "não",
  "nao",
])

const HIGHLIGHT_EXCLUDED = new Set(["de fora", "omitida", "não se aplica", "nao se aplica", "—", "-", "a definir"])

function pushHighlightTerms(bucket: string[], raw?: string | null) {
  if (!raw) return
  const text = humanizeInsight(raw)
  if (!text) return
  for (const part of text.split(/[,·|/]/).map((item) => item.trim()).filter(Boolean)) {
    if (part.length < 2) continue
    if (HIGHLIGHT_EXCLUDED.has(part.toLowerCase())) continue
    if (HIGHLIGHT_STATUS.has(part.toLowerCase())) continue
    bucket.push(part)
  }
}

/**
 * Termos a destacar no Insight = o que foi selecionado na etapa
 * (táticas, redes, faixas, condições etc.), não o status "Incluída".
 */
export function insightHighlightTerms(rationale: StepRationale, extra: string[] = []) {
  const terms: string[] = [...extra]
  for (const point of rationale.points) {
    const value = humanizeInsight(point.value)
    const label = humanizeInsight(point.label)
    const valueKey = value.toLowerCase()
    // Pontos de exclusão não entram no destaque
    if (HIGHLIGHT_EXCLUDED.has(valueKey)) continue
    // "Publi Post / Incluída" → destaca Publi Post; "Onde / Brasil" → destaca Brasil
    if (HIGHLIGHT_STATUS.has(valueKey)) pushHighlightTerms(terms, label)
    else pushHighlightTerms(terms, value)
  }
  if (rationale.highlights?.length) {
    for (const item of rationale.highlights) pushHighlightTerms(terms, item)
  }
  return [...new Set(terms)].sort((a, b) => b.length - a.length)
}

/** Seleções reais do draft (e sugestão) por etapa — fonte canônica do destaque. */
export function selectionHighlightTerms(
  id: WizardStepId,
  draft: WizardDraft,
  suggestion?: AutofillSuggestion,
  company?: CompanyProfile | null,
) {
  const terms: string[] = []
  if (id === "website" || id === "identity") {
    pushHighlightTerms(terms, company?.name || draft.research?.company?.name)
    pushHighlightTerms(terms, draft.name)
    pushHighlightTerms(terms, nicheLabel((draft.niches ?? suggestion?.niches)?.join(" · ") || draft.niche || suggestion?.niche))
  }
  if (id === "strategy") {
    pushHighlightTerms(terms, strategyLabel(draft.strategy || company?.recommendedStrategy))
  }
  if (id === "tactics") {
    const tactics = (draft.tactics?.length ? draft.tactics : suggestion?.tactics ?? []) as CampaignTactic[]
    for (const tactic of tactics) pushHighlightTerms(terms, tacticLabel(tactic))
  }
  if (id === "audience") {
    pushHighlightTerms(terms, draft.audienceCountry || suggestion?.audienceCountry)
    for (const age of draft.audienceAges?.length ? draft.audienceAges : suggestion?.audienceAges ?? []) {
      pushHighlightTerms(terms, age)
    }
  }
  if (id === "creator") {
    const networks = (draft.targetNetworks?.length ? draft.targetNetworks : suggestion?.targetNetworks ?? []).filter(isSocialNetwork)
    for (const network of networks) pushHighlightTerms(terms, SOCIAL_NETWORK_LABEL[network])
    for (const tier of TIERS.filter((item) => (draft.audienceTiers || suggestion?.audienceTiers || []).includes(item.id))) {
      pushHighlightTerms(terms, tier.label)
    }
    pushHighlightTerms(terms, nicheLabel((draft.targetNiches || suggestion?.targetNiches || []).join(" · ")))
    pushHighlightTerms(terms, draft.creatorLocation || suggestion?.creatorLocation)
    pushHighlightTerms(terms, draft.creatorLanguage || suggestion?.creatorLanguage)
    const engagement = draft.minEngagement ?? suggestion?.minEngagement
    if (typeof engagement === "number") {
      pushHighlightTerms(terms, `${String(engagement).replace(".", ",")}%`)
      pushHighlightTerms(terms, `${engagement}%`)
    }
  }
  if (id === "privacy") {
    const visibility = (draft.visibility || suggestion?.visibility) as CampaignVisibility | undefined
    if (visibility) pushHighlightTerms(terms, VISIBILITY_LABEL[visibility])
  }
  if (id === "recommend" && draft.recommendToMatching !== undefined) {
    terms.push(draft.recommendToMatching ? "Sim" : "Não")
  }
  if (id === "cap" && draft.applicationCap !== undefined) {
    if (draft.applicationCap > 0) terms.push(String(draft.applicationCap))
    else terms.push("Não")
  }
  if (id === "terms") {
    for (const term of draft.commercialTerms?.length ? draft.commercialTerms : suggestion?.commercialTerms ?? []) {
      pushHighlightTerms(terms, term === "fixo" ? "Fixo" : term === "comissao" ? "Comissão" : "Permuta")
    }
  }
  if (id === "budget") {
    for (const term of draft.commercialTerms ?? []) {
      pushHighlightTerms(terms, term === "fixo" ? "Fixo" : term === "comissao" ? "Comissão" : "Permuta")
    }
  }
  if (id === "scope") {
    const formats = (draft.contentFormats?.length ? draft.contentFormats : suggestion?.contentFormats ?? []) as string[]
    pushHighlightTerms(terms, formatLabels(formats))
  }
  if (id === "metrics") {
    for (const item of draft.successTargets?.length ? draft.successTargets : suggestion?.successTargets ?? []) {
      pushHighlightTerms(terms, successMetricById(item.metric)?.label || item.metric)
    }
  }
  return [...new Set(terms)].sort((a, b) => b.length - a.length)
}

function porteLabel(company?: CompanyProfile | null) {
  return company?.porte ? PORTE_LABEL[company.porte] : "esta marca"
}

function modeloLabel(company?: CompanyProfile | null) {
  return company?.modeloNegocio ? MODELO_LABEL[company.modeloNegocio] : "o modelo visto no site"
}

function abrangenciaLabel(company?: CompanyProfile | null) {
  return company?.abrangencia ? ABRANGENCIA_LABEL[company.abrangencia] : "a abrangência do site"
}

function nicheLabel(value?: string) {
  if (!value) return "—"
  return value
    .split(/[·,|/]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => catalogNicheLabel(item) || item)
    .join(", ")
}

function formatLabels(formats: string[]) {
  return formats.map((item) => FORMAT_LABEL[item as ContentFormat] ?? item).join(", ")
}

function productFocus(company?: CompanyProfile | null, suggestion?: AutofillSuggestion) {
  const products = (suggestion?.productCategories?.length ? suggestion.productCategories : company?.products ?? []).slice(0, 3)
  if (products.length) return products.join(", ")
  return "o que a marca realmente vende no site"
}

function workingStrategy(draft: WizardDraft, company?: CompanyProfile | null): CampaignStrategy | undefined {
  return draft.strategy || company?.recommendedStrategy
}

export function stepRationale(
  id: WizardStepId,
  draft: WizardDraft,
  suggestion?: AutofillSuggestion,
  company?: CompanyProfile | null,
): StepRationale | null {
  if (!draft.aiAccompaniment || !suggestion) return null
  const brand = company?.name || "A marca"
  const productLine = productFocus(company, suggestion)
  const lead = noteOf(suggestion, id)
  const strategy = workingStrategy(draft, company)

  if (id === "website") {
    return {
      title: "Leitura da marca",
      lead:
        lead ||
        `A partir do site, montamos um dossiê de ${brand} para orientar as próximas escolhas com base no que a marca de fato publica — sem inventar catálogo ou promessas.`,
      points: [
        {
          label: "O que vimos",
          value: brand,
          why: `${porteLabel(company)}, ${modeloLabel(company)}, ${abrangenciaLabel(company)}. Isso define porte de creator, redes e tom do briefing.`,
        },
        {
          label: "Linhas no site",
          value: productLine,
          why: "Nicho, briefing e categorias só avançam com evidência pública. Se o site for pobre, preferimos menos campos a inventar.",
        },
      ],
      source: company?.source,
    }
  }

  if (id === "identity") {
    const niches = draft.niches?.length ? draft.niches : draft.niche ? [draft.niche] : suggestion.niche ? [suggestion.niche] : []
    return {
      title: "Por que este nome e nicho",
      lead:
        lead ||
        `O nome e o nicho precisam soar como ${brand} na vitrine — ligados ao catálogo real (${productLine}), não a um título genérico de “campanha de vendas”.`,
      points: [
        {
          label: "Nome",
          value: suggestion.name || draft.name || "—",
          why: `Combina a marca com o eixo temático do site para o creator reconhecer a proposta em segundos.`,
        },
        {
          label: "Nichos",
          value: nicheLabel(niches.join(" · ")),
          why: `Refletem o core de ${brand}. Evitamos Humor ou Lifestyle soltos sem evidência no posicionamento.`,
        },
      ],
      source: company?.source,
    }
  }

  if (id === "strategy") {
    const recommended = company?.recommendedStrategy
    const whyRecommended =
      recommended === "vendas"
        ? `${brand} opera como ${modeloLabel(company)} com caminho de compra ou lead. Vendas deixa medir clique, cupom e pedido — o que Alcance e Engajamento sozinhos não comprovam.`
        : recommended === "engajamento"
          ? `${brand} se beneficia de rotina e relacionamento. Engajamento prioriza conversa e salvamento; Vendas só faz sentido se houver funil rastreável claro.`
          : `${brand} ainda precisa de lembrança e descoberta. Alcance amplia presença; Vendas ficaria forçada se o site não converte online.`
    return {
      title: "Como escolher a estratégia",
      lead:
        lead ||
        `Não marcamos a estratégia por você — é decisão de negócio. Pela leitura de ${brand}, o caminho mais coerente hoje é ${strategyLabel(recommended) || "avaliar o momento"}.`,
      points: [
        {
          label: "Melhor encaixe",
          value: strategyLabel(recommended) || "A definir",
          why: whyRecommended,
        },
        {
          label: "Quando mudar",
          value: "Alcance · Engajamento · Vendas",
          why:
            recommended === "vendas"
              ? "Prefira Alcance em lançamento de marca ou mercado novo; Engajamento se a meta for comunidade antes da conversão."
              : "Mude para Vendas quando houver checkout, trial ou lead rastreável; use Engajamento se a prioridade for educar e reter.",
        },
      ],
      source: company?.source,
    }
  }

  if (id === "tactics") {
    const tactics = (suggestion.tactics?.length ? suggestion.tactics : draft.tactics ?? []) as CampaignTactic[]
    const unused = (["publipost", "live", "link", "cupom"] as CampaignTactic[]).filter((item) => !tactics.includes(item))
    return {
      title: "Por que estas táticas",
      lead:
        lead ||
        `Para ${strategyLabel(strategy) || "o objetivo escolhido"} em ${brand} (${modeloLabel(company)}), estas táticas fecham o funil sem poluir a mensagem.`,
      points: [
        ...tactics.map((tactic) => ({
          label: tacticLabel(tactic),
          value: "Incluída",
          why:
            tactic === "cupom"
              ? `Atribui vendas mesmo quando a compra acontece depois — útil para ${productLine}.`
              : tactic === "link"
                ? `Mede curiosidade e conversão no funil digital de ${brand}.`
                : tactic === "live"
                  ? `Quebra objeções ao vivo em catálogo visual — faz sentido para ${productLine}.`
                  : `Gera narrativa e distribuição orgânica sem transformar o conteúdo em anúncio frio.`,
        })),
        ...(unused.length
          ? [
              {
                label: "De fora",
                value: unused.map((item) => tacticLabel(item)).join(", "),
                why:
                  strategy === "alcance"
                    ? "Em Alcance, link/cupom/live costumam diluir a lembrança. Entram só se houver página de lançamento ou venda ao vivo clara."
                    : strategy === "engajamento"
                      ? "Link e cupom empurram para conversão imediata; aqui a prioridade é conversa e salvamento."
                      : `Não cabem ao modelo de ${brand} ou faltou evidência no site (ex.: live sem venda ao vivo, cupom sem desconto/trial).`,
              },
            ]
          : []),
      ],
      source: company?.source,
    }
  }

  if (id === "audience") {
    const ages = suggestion.audienceAges || draft.audienceAges || []
    return {
      title: "Por que este público",
      lead:
        lead ||
        `O público segue quem compra ${productLine} — não a cidade da sede nem um chute demográfico genérico.`,
      points: [
        {
          label: "Onde",
          value: suggestion.audienceCountry || draft.audienceCountry || "—",
          why:
            company?.abrangencia === "local"
              ? `${brand} é ${abrangenciaLabel(company)}; restringir faz sentido para deslocamento e conversão local.`
              : `${brand} tem ${abrangenciaLabel(company)}. Travamos em Brasil (ou mercado amplo), não na cidade do escritório.`,
        },
        {
          label: "Faixas etárias",
          value: ages.join(", ") || "—",
          why: `Combinam com ${productLine} e definem tom do briefing e peso das redes (ex.: 18–24 puxa TikTok; 35+ puxa YouTube/Instagram mais explicativo).`,
        },
      ],
      source: company?.source,
    }
  }

  if (id === "creator") {
    const networks = (suggestion.targetNetworks || draft.targetNetworks || []).filter(isSocialNetwork).map((item) => SOCIAL_NETWORK_LABEL[item])
    const tierIds = suggestion.audienceTiers || draft.audienceTiers || []
    const tiers = TIERS.filter((tier) => tierIds.includes(tier.id)).map((tier) => tier.label)
    const hasNanoMicro = tierIds.some((tier) => tier === "nano" || tier === "micro")
    const hasMacroMega = tierIds.some((tier) => tier === "macro" || tier === "mega")
    const brandSize = porteLabel(company)
    const tierWhy =
      strategy === "vendas"
        ? hasMacroMega && !hasNanoMicro
          ? `Em vendas com ${brandSize}, Mid/Macro (ou acima) reforçam autoridade e confiança na oferta — proximidade sozinha não escala o funil.`
          : hasMacroMega
            ? `Misturamos proximidade (Nano/Micro) com autoridade (Mid/Macro) porque ${brandSize} precisa converter e ainda parecer sólida.`
            : `Para vendas em ${brandSize}, portes menores priorizam confiança e CAC; celebridade rara raramente paga o pedido.`
        : strategy === "engajamento"
          ? hasMacroMega
            ? `Comunidade em ${brandSize}: Micro/Mid sustentam conversa e Mid/Macro ampliam prova social sem virar só vanity.`
            : `Portes menores sustentam conversa e retenção em ${brandSize}; mega raramente entrega proximidade.`
          : hasMacroMega
            ? `Alcance para ${brandSize}: estes portes equilibram cobertura e custo alinhados ao papel da campanha (awareness/lançamento vs teste).`
            : `Em ${brandSize}, pulverizar em Nano/Micro/Mid rende mais cobertura útil do que um único nome caro sem encaixe.`
    const allNetworks = ["Instagram", "TikTok", "YouTube"]
    const skippedNetworks = allNetworks.filter((item) => !networks.includes(item))
    return {
      title: "Por que este creator",
      lead:
        lead ||
        `Para ${strategyLabel(strategy) || "este objetivo"} em uma ${brandSize}, priorizamos creators que conversam de verdade com quem já consome ${productLine}.`,
      points: [
        {
          label: "Porte",
          value: tiers.join(", ") || "—",
          why: tierWhy,
        },
        {
          label: "Redes",
          value: networks.join(", ") || "—",
          why: skippedNetworks.length
            ? `Foco em ${networks.join(" e ") || "poucas redes"}. Deixamos ${skippedNetworks.join(", ")} de fora para não diluir formato e métrica.`
            : "Cobertura alinhada ao catálogo e à faixa etária do público.",
        },
        {
          label: "Nichos e engajamento",
          value: `${nicheLabel((suggestion.targetNiches || draft.targetNiches || []).join(" · "))} · mín. ${suggestion.minEngagement ?? draft.minEngagement ?? "—"}%`,
          why: `Creators próximos de ${productLine} contam a história com naturalidade. Travas “Exigir…” ficam desligadas para não secar candidaturas cedo.`,
        },
      ],
      source: company?.source,
    }
  }

  if (id === "privacy") {
    const visibility = (draft.visibility || suggestion.visibility || "publica") as CampaignVisibility
    return {
      title: "Por que esta visibilidade",
      lead:
        lead ||
        `A privacidade equilibra volume de candidaturas e controle de imagem para ${brand}.`,
      points: [
        {
          label: "Escolha",
          value: VISIBILITY_LABEL[visibility],
          why:
            visibility === "secreta"
              ? `Faz sentido com rigor editorial ou elenco fechado. Em secreta, recomendação e teto somem — o recrutamento é por convite.`
              : visibility === "privada"
                ? `Prioriza quem já conhece ${brand}. Menos volume na vitrine, mais aderência de comunidade.`
                : `Como ${porteLabel(company)}, pública acelera descoberta de talentos e afiliados sem depender só de convite manual.`,
        },
      ],
      source: company?.source,
    }
  }

  if (id === "recommend") {
    const value = draft.recommendToMatching ?? suggestion.recommendToMatching
    return {
      title: "Por que recomendar",
      lead:
        lead ||
        (value
          ? `Sim: a plataforma pode indicar a campanha de ${brand} a creators já compatíveis com o filtro — mais alcance sem abrir mão do perfil.`
          : `Não: o recrutamento fica só na vitrine orgânica e nos convites manuais.`),
      points: [
        {
          label: "Decisão",
          value: value ? "Sim" : "Não",
          why: value
            ? "Reduz custo de prospecção enquanto o creator ideal (nicho, rede, porte) continua filtrando quem entra."
            : "Use quando quiser controle total da lista, típico de ações fechadas.",
        },
      ],
    }
  }

  if (id === "cap") {
    const cap = draft.applicationCap ?? suggestion.applicationCap
    const limited = (cap ?? 0) >= 1
    return {
      title: "Por que este teto",
      lead:
        lead ||
        (limited
          ? `Limitamos em ${cap} candidaturas para tirar a campanha da vitrine quando o volume bastar.`
          : `Sem teto por padrão: ${brand} continua recebendo candidaturas enquanto a campanha estiver aberta.`),
      points: [
        {
          label: "Limite na vitrine",
          value: limited ? `Sim · ${cap}` : "Não",
          why: limited
            ? "Útil quando a operação não aguenta triagem infinita."
            : "Evita cortar talentos bons cedo demais. Você ainda pode limitar depois.",
        },
      ],
    }
  }

  if (id === "terms") {
    // Draft prevalece — notes do modelo podem estar presas à estratégia recomendada antiga
    const terms = (draft.commercialTerms?.length ? draft.commercialTerms : suggestion.commercialTerms) || []
    const labels = terms.map((term) => (term === "fixo" ? "Fixo" : term === "comissao" ? "Comissão" : "Permuta"))
    const hasFixo = terms.includes("fixo")
    const strategyName = strategyLabel(strategy) || "este objetivo"
    const points = terms.map((term) => ({
      label: term === "fixo" ? "Fixo" : term === "comissao" ? "Comissão" : "Permuta",
      value: "Incluída",
      why:
        term === "comissao"
          ? `Alinha ganho à conversão de ${productLine} — só faz sentido em Vendas com link ou cupom rastreável.`
          : term === "fixo"
            ? strategy === "alcance"
              ? "Cachê previsível garante publicação e cobertura mesmo sem meta de venda imediata. O teto da campanha limita o caixa comprometido."
              : "Garante produção e atrai bons creators mesmo sem venda imediata. O teto da campanha aparece aqui para limitar o caixa comprometido."
            : strategy === "alcance"
              ? `Produto de ${productLine} no conteúdo gera prova social e lembrança com menor trava de caixa — comum em Alcance com marca física.`
              : `Viabiliza uso real de ${productLine} no conteúdo com menor trava de caixa — típico de marca emergente com produto físico.`,
    }))
    if (!hasFixo) {
      points.push({
        label: "Teto da campanha",
        value: "Não se aplica",
        why: "Sem Fixo não há cachê previsível por post — o teto só entra quando há condição fixa.",
      })
    }
    const noteLooksStale =
      Boolean(lead) &&
      ((/comiss[aã]o/i.test(lead) && !terms.includes("comissao")) ||
        (/vendas/i.test(lead) && strategy === "alcance") ||
        (/vendas/i.test(lead) && strategy === "engajamento") ||
        (/permuta/i.test(lead) && !terms.includes("permuta")) ||
        (/fixo/i.test(lead) && !terms.includes("fixo")))
    const termsLead =
      strategy === "alcance"
        ? `Em ${strategyName} para ${brand}, ${labels.join(" + ") || "estas condições"} sustentam cobertura e lembrança — sem amarrar a campanha a comissão de venda.`
        : strategy === "engajamento"
          ? `Em ${strategyName} para ${brand}, ${labels.join(" + ") || "estas condições"} sustentam conteúdo recorrente e comunidade.`
          : `Em ${strategyName} para ${brand}, ${labels.join(" + ") || "estas condições"} equilibram adesão de creators e retorno.`
    return {
      title: "Por que estas condições",
      lead: noteLooksStale ? termsLead : lead || termsLead,
      points,
      source: company?.source,
    }
  }

  if (id === "budget") {
    const budgetTierIds = draft.audienceTiers || suggestion.audienceTiers || []
    const tiers = TIERS.filter((tier) => budgetTierIds.includes(tier.id)).map((tier) => tier.label)
    const leanTiers = budgetTierIds.every((tier) => tier === "nano" || tier === "micro")
    return {
      title: "Como calibrar valores e oferta",
      lead:
        lead ||
        `Não preenchemos cifras — isso é decisão sua. Com o perfil de ${brand}, calibre assim:`,
      points: [
        {
          label: "Modelo escolhido",
          value: (draft.commercialTerms || suggestion.commercialTerms || []).map((term) => (term === "fixo" ? "Fixo" : term === "comissao" ? "Comissão" : "Permuta")).join(" + ") || "A definir",
          why: "Com Fixo + Comissão, o cachê pode ser mais enxuto se a comissão for atraente para o ticket do produto.",
        },
        {
          label: "Distribuição",
          value: tiers.join(", ") || "conforme o porte do creator",
          why: leanTiers
            ? "Com Nano/Micro, pulverizar em mais creators reduz risco e amplia testes criativos."
            : "Com Mid/Macro/Mega no mix, concentre orçamento em poucos nomes-chave e reserve uma fatia para testes em portes menores.",
        },
        {
          label: "Custos fora do cachê",
          value: "Envio, frete, mídia e direitos",
          why: "Impactam o ROI real — especialmente com permuta ou exclusividade.",
        },
      ],
    }
  }

  if (id === "brief") {
    return {
      title: "Por que este briefing",
      lead:
        lead ||
        `O texto fala com o creator sobre ${productLine}, em pontos-chave e rotina — sem script engessado nem texto institucional de ${brand}.`,
      points: [
        {
          label: "Abordagem",
          value: stripMarkdown(suggestion.description || draft.description || "").slice(0, 140) || "—",
          why: `Traduz ${strategyLabel(strategy) || "o objetivo"} para a linguagem do público da campanha, evitando cara de anúncio.`,
        },
        {
          label: "Pode / Não pode",
          value: `${(suggestion.doList || draft.doList || []).length} orientações · ${(suggestion.dontList || draft.dontList || []).length} limites`,
          why: "Liberdade criativa com compliance (#publi, sem concorrentes, sem promessa irreal). Regras comerciais da plataforma ficam fora do briefing.",
        },
      ],
      source: company?.source,
    }
  }

  if (id === "scope") {
    const formats = (suggestion.formatQuantities || draft.formatQuantities || []).map((item) => item.format)
    const networks = (suggestion.targetNetworks || draft.targetNetworks || []).filter(isSocialNetwork).map((item) => SOCIAL_NETWORK_LABEL[item])
    return {
      title: "Por que este escopo",
      lead:
        lead ||
        `Os formatos seguem só as redes do creator ideal (${networks.join(", ") || "as escolhidas"}) e o papel de cada um em ${strategyLabel(strategy) || "o funil"}.`,
      points: [
        {
          label: "Entregas",
          value: formatLabels(formats) || "—",
          why:
            strategy === "vendas"
              ? "Reels/TikTok geram desejo; Stories (quando ativos) entregam o clique de link ou cupom."
              : strategy === "engajamento"
                ? "Formatos que convidam a salvar, comentar e voltar — não só view vazia."
                : "Prioridade para formatos de alta distribuição, com pacote enxuto (1 por formato) para caber no orçamento.",
        },
      ],
    }
  }

  if (id === "metrics") {
    const targets = suggestion.successTargets || draft.successTargets || []
    return {
      title: "Por que estas métricas",
      lead:
        lead ||
        `Marcamos os indicadores que provam ${strategyLabel(strategy) || "o objetivo"} de ${brand} — sem inventar meta numérica sem orçamento.`,
      points: targets.map((item) => {
        const metric = successMetricById(item.metric)
        return {
          label: metric?.label || humanizeInsight(item.metric),
          value: item.target > 0 ? String(item.target) : "Acompanhar",
          why:
            strategy === "vendas"
              ? `Liga conteúdo à conversão de ${productLine}, em vez de só contar views.`
              : strategy === "engajamento"
                ? "Mostra conversa e retenção reais — o que importa para comunidade."
                : "Mostra se a marca está sendo vista e lembrada no formato certo.",
        }
      }),
    }
  }

  if (id === "community") {
    return {
      title: "Vínculo da comunidade",
      lead: lead || `O link é gerado ao salvar e leva o creator da comunidade direto para a campanha de ${brand}.`,
      points: [],
    }
  }

  if (id === "invites" || id === "preview") {
    return {
      title: id === "invites" ? "Curadoria de convites" : "Revisão final",
      lead:
        lead ||
        (id === "invites"
          ? `Não escolhemos perfis por você. Antes de convidar, valide audiência real, envolvimento com ${productLine} e sinais de métrica inflada.`
          : `Revise como o creator vê a campanha de ${brand} — e confirme se nome, oferta e briefing estão coerentes.`),
      points: [],
    }
  }

  return lead
    ? { title: "Por que esta escolha", lead, points: [], source: company?.source }
    : null
}
