import type { AutofillSuggestion, CompanyProfile } from "@/lib/campaigns/autofill"
import { strategyLabel, tacticLabel } from "@/lib/campaigns/shape"
import type { WizardStepId } from "@/lib/campaigns/wizard-steps"
import { SOCIAL_NETWORK_LABEL, isSocialNetwork } from "@/lib/mock-data/campaigns"
import { TIERS } from "@/lib/audience-tiers"
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
}

function money(value?: number) {
  if (!value) return ""
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

function noteOf(suggestion: AutofillSuggestion | undefined, id: WizardStepId) {
  return suggestion?.notes?.[id]?.trim() || ""
}

export function stepRationale(
  id: WizardStepId,
  draft: WizardDraft,
  suggestion?: AutofillSuggestion,
  company?: CompanyProfile | null,
): StepRationale | null {
  if (!draft.aiAccompaniment || !suggestion) return null
  const brand = company?.name || "A marca"
  const products = (suggestion.productCategories?.length ? suggestion.productCategories : company?.products ?? []).slice(0, 4)
  const productLine = products.length ? products.join(", ") : "o que a marca publica"
  const lead = noteOf(suggestion, id)

  if (id === "website") {
    return {
      title: "Por que ler o site",
      lead: lead || `A IA usa ${brand} como fonte única para as próximas escolhas.`,
      points: [
        { label: "Fonte", value: company?.source?.replace(/^https?:\/\//, "") || draft.brandWebsite || "—", why: "Tudo o que entra no formulário precisa aparecer no site ou ser derivado dele." },
        { label: "Marca", value: brand, why: "O nome e o posicionamento ancoram nicho, público e briefing." },
      ],
      source: company?.source,
    }
  }

  if (id === "identity") {
    return {
      title: "Por que esta identificação",
      lead: lead || `${brand} sugere um nome e um nicho a partir do que vende.`,
      points: [
        { label: "Nome", value: suggestion.name || draft.name || "—", why: `Mantém ${brand} reconhecível na vitrine e no convite.` },
        { label: "Nicho", value: suggestion.niche || draft.niche || "—", why: `Combina com as linhas vistas no site: ${productLine}.` },
      ],
      source: company?.source,
    }
  }

  if (id === "strategy") {
    const strategy = suggestion.strategy || draft.strategy
    return {
      title: "Por que esta estratégia",
      lead: lead || `A leitura de ${brand} aponta para ${strategyLabel(strategy)}.`,
      points: [
        {
          label: "Estratégia",
          value: strategyLabel(strategy) || "—",
          why:
            strategy === "vendas"
              ? `${brand} vende online ou destaca compra, cupom e pedido no site.`
              : strategy === "engajamento"
                ? `${brand} reforça comunidade e conversa com o público.`
                : `${brand} precisa ser vista e lembrada antes de converter.`,
        },
        { label: "Objetivo", value: suggestion.objective || draft.objective || "—", why: "Resume o que a marca publica sobre o próprio negócio." },
      ],
      source: company?.source,
    }
  }

  if (id === "tactics") {
    const tactics = suggestion.tactics?.length ? suggestion.tactics : draft.tactics ?? []
    return {
      title: "Por que estas táticas",
      lead: lead || `As táticas acompanham como ${brand} já chega no público.`,
      points: tactics.map((tactic) => ({
        label: tacticLabel(tactic),
        value: tacticLabel(tactic),
        why:
          tactic === "link" || tactic === "cupom"
            ? `${brand} tem caminho de venda rastreável no site.`
            : tactic === "live"
              ? "O site indica venda ou demonstração ao vivo."
              : "Publi post cobre a entrega principal em redes sociais.",
      })),
      source: company?.source,
    }
  }

  if (id === "audience") {
    return {
      title: "Por que este público",
      lead: lead || `O público segue o mercado e o tom de ${brand}.`,
      points: [
        { label: "País", value: suggestion.audienceCountry || draft.audienceCountry || "—", why: "O domínio e o conteúdo do site apontam para esse mercado." },
        { label: "Idades", value: (suggestion.audienceAges || draft.audienceAges || []).join(", ") || "—", why: `Faixas compatíveis com quem consome ${productLine}.` },
        { label: "Nota", value: suggestion.audienceNotes || draft.audienceNotes || "—", why: "Lê o interesse declarado nas páginas da marca." },
      ],
      source: company?.source,
    }
  }

  if (id === "creator") {
    const networks = (suggestion.targetNetworks || draft.targetNetworks || []).filter(isSocialNetwork).map((item) => SOCIAL_NETWORK_LABEL[item])
    const tiers = TIERS.filter((tier) => (suggestion.audienceTiers || draft.audienceTiers || []).includes(tier.id)).map((tier) => tier.label)
    return {
      title: "Por que este creator",
      lead: lead || `O creator ideal fala com quem já consome ${productLine}.`,
      points: [
        { label: "Local e idioma", value: [suggestion.creatorLocation || draft.creatorLocation, suggestion.creatorLanguage || draft.creatorLanguage].filter(Boolean).join(" · ") || "—", why: "Alinha o creator ao mercado da marca." },
        { label: "Redes", value: networks.join(", ") || "—", why: "São as redes em que o conteúdo da marca normalmente performa." },
        { label: "Porte", value: tiers.join(", ") || "—", why: "Equilibra alcance e autenticidade para a campanha." },
        { label: "Nichos", value: (suggestion.targetNiches || draft.targetNiches || []).join(", ") || "—", why: `Creators próximos de ${productLine} contam a história com mais naturalidade.` },
      ],
      source: company?.source,
    }
  }

  if (id === "privacy") {
    return {
      title: "Por que esta privacidade",
      lead: lead || "A campanha começa aberta para recrutar na vitrine.",
      points: [
        { label: "Visibilidade", value: draft.visibility || suggestion.visibility || "publica", why: "Pública acelera candidaturas enquanto a marca valida o elenco." },
      ],
      source: company?.source,
    }
  }

  if (id === "recommend") {
    return {
      title: "Por que recomendar",
      lead: lead || "Creators compatíveis podem receber a campanha.",
      points: [
        { label: "Recomendação", value: (draft.recommendToMatching ?? suggestion.recommendToMatching) ? "Sim" : "Não", why: "Aumenta o alcance sem abrir mão do filtro de perfil." },
      ],
    }
  }

  if (id === "terms") {
    const terms = suggestion.commercialTerms || draft.commercialTerms || []
    return {
      title: "Por que estas condições",
      lead: lead || `A remuneração acompanha a estratégia de ${brand}.`,
      points: terms.map((term) => ({
        label: term === "fixo" ? "Fixo" : term === "comissao" ? "Comissão" : "Permuta",
        value: term === "fixo" ? money(suggestion.fixedFeePerPost || draft.fixedFeePerPost) || "Fixo" : term === "comissao" ? `${suggestion.commission?.value ?? draft.commission?.value ?? ""}%` : "Permuta",
        why: term === "comissao" ? `${brand} vende e pode rastrear resultado.` : term === "fixo" ? "Garante entrega mesmo sem conversão imediata." : "Troca produto por conteúdo.",
      })),
      source: company?.source,
    }
  }

  if (id === "budget") {
    return {
      title: "Por que este orçamento",
      lead: lead || "O teto reparte o valor entre os creators escolhidos.",
      points: [
        { label: "Teto", value: money(suggestion.budget || draft.budget) || "—", why: "Parte do valor por post e do número de creators." },
        { label: "Creators", value: String(suggestion.maxInfluencers || draft.maxInfluencers || "—"), why: "Volume suficiente para testar a campanha sem diluir o orçamento." },
        { label: "Por post", value: money(suggestion.fixedFeePerPost || draft.fixedFeePerPost) || "—", why: "Referência de cachê alinhada ao porte sugerido." },
      ],
    }
  }

  if (id === "brief") {
    return {
      title: "Por que este briefing",
      lead: lead || company?.summary || `O texto conta o que ${brand} precisa ver no conteúdo.`,
      points: [
        { label: "História", value: (suggestion.description || draft.description || "").slice(0, 120) || "—", why: `Parte do posicionamento publicado por ${brand}.` },
        { label: "Produtos", value: productLine, why: "Só entram categorias citadas ou inferidas do site." },
      ],
      source: company?.source,
    }
  }

  if (id === "scope") {
    const formats = (suggestion.formatQuantities || draft.formatQuantities || []).map((item) => item.format)
    return {
      title: "Por que este escopo",
      lead: lead || "Os formatos cobrem as redes escolhidas.",
      points: [
        { label: "Formatos", value: formats.join(", ") || "—", why: "Combinam com as redes do creator ideal e com o ritmo da marca." },
      ],
    }
  }

  if (id === "metrics") {
    return {
      title: "Por que estas metas",
      lead: lead || "As metas seguem a estratégia definida na pesquisa.",
      points: (suggestion.successTargets || draft.successTargets || []).map((item) => ({
        label: item.metric,
        value: String(item.target),
        why: `Mede o resultado esperado da estratégia ${strategyLabel(suggestion.strategy || draft.strategy)}.`,
      })),
    }
  }

  if (id === "cap" || id === "community" || id === "invites" || id === "preview") {
    return {
      title: "Decisão da etapa",
      lead: lead || "Esta etapa fica com a marca. A IA não escolhe sozinha.",
      points: [],
    }
  }

  return lead
    ? { title: "Por que a IA escolheu assim", lead, points: [], source: company?.source }
    : null
}
