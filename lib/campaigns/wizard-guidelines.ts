import { WIZARD_STEPS, type WizardStepId } from "@/lib/campaigns/wizard-steps"

export interface WizardGuideline {
  id: WizardStepId
  prompt: string
  card: string
  fields: string[]
}

export const WIZARD_GUIDELINES: WizardGuideline[] = [
  {
    id: "website",
    prompt: "Guarde a URL do site da marca. Não invente outro domínio. Se a URL já veio preenchida, não a troque.",
    card: "Marque o acompanhamento com IA (50 créditos) e avance. A pesquisa acontece no Próximo e o preenchimento começa na identificação.",
    fields: ["brandWebsite"],
  },
  {
    id: "identity",
    prompt: "Sugira um nome curto de campanha em português, um nicho da lista (beleza, moda, fitness, gastronomia, tecnologia, lifestyle, humor, games, finanças, viagem) e, só se o site indicar um lançamento, datas de início e fim. Período de candidatura só entra se houver uma janela clara. Não invente banner.",
    card: "Nome, nicho e datas aparecem na vitrine e no convite.",
    fields: ["name", "niche", "startDate", "endDate", "applicationStart", "applicationEnd"],
  },
  {
    id: "strategy",
    prompt: "Escolha uma estratégia: alcance, engajamento ou vendas. Alcance quando a marca quer ser vista. Engajamento quando quer conversa e comunidade. Vendas quando quer clique, cupom ou pedido. Uma só.",
    card: "A estratégia define as metas e o badge que o creator vê.",
    fields: ["strategy", "objective"],
  },
  {
    id: "tactics",
    prompt: "Escolha uma ou mais táticas: publipost (pagamento por post), live (live commerce), link (link rastreável) ou cupom. Use cupom ou link quando a estratégia for vendas. Não marque live se o site não vender ao vivo.",
    card: "A tática diz como o creator entrega e como a venda é medida.",
    fields: ["tactics"],
  },
  {
    id: "audience",
    prompt: "Diga o país da audiência (Brasil se o site for brasileiro) e faixas etárias entre 0-17, 18-24, 25-34, 35-44 e 45+. Deixe vazio o que o site não indicar.",
    card: "O público é quem a campanha quer atingir, não o creator.",
    fields: ["audienceCountry", "audienceAges"],
  },
  {
    id: "creator",
    prompt: "Descreva o creator ideal: nichos da mesma lista, redes entre instagram, tiktok e youtube, localização, idioma e uma nota curta de audiência. Não marque requisitos obrigatórios. Isso cabe à marca.",
    card: "Requisitos marcados depois impedem a candidatura de quem não combina.",
    fields: ["targetNiches", "targetNetworks", "creatorLocation", "creatorLanguage", "audienceNotes", "minEngagement", "minFollowers", "maxFollowers"],
  },
  {
    id: "privacy",
    prompt: "Sugira publica para recrutamento na vitrine, privada se a campanha for só da comunidade, secreta se o site indicar convite fechado. Na dúvida, publica.",
    card: "Pública aparece na vitrine. Privada fica na comunidade. Secreta só entra por convite.",
    fields: ["visibility"],
  },
  {
    id: "recommend",
    prompt: "recommendToMatching true quando a campanha pode ser oferecida a creators compatíveis. false quando a marca parecer querer controle total do elenco.",
    card: "Com a recomendação ligada, creators compatíveis recebem a campanha.",
    fields: ["recommendToMatching"],
  },
  {
    id: "cap",
    prompt: "Só preencha applicationCap se o site indicar um volume pequeno de vagas. Caso contrário, omita o campo.",
    card: "Ao atingir o teto, a campanha sai da vitrine.",
    fields: ["applicationCap"],
  },
  {
    id: "community",
    prompt: "Não preencha esta etapa. O vínculo da comunidade é gerado pela plataforma.",
    card: "O link da comunidade é criado ao salvar e aponta para a campanha.",
    fields: [],
  },
  {
    id: "terms",
    prompt: "Escolha condições combináveis: fixo, permuta, comissao. Permuta quando houver envio de produto. Comissão quando houver venda rastreada. Fixo quando houver cachê. Pode combinar.",
    card: "Cada condição abre o bloco correspondente no orçamento. As outras ficam escondidas.",
    fields: ["commercialTerms"],
  },
  {
    id: "budget",
    prompt: "Se houver fixo, sugira fixedFeePerPost em reais por post. Se houver comissão, use mode percent ou fixed e um value. budget é o teto da campanha. maxInfluencers é um inteiro. perInfluencerFee é um número ou a string contact quando o valor não deve aparecer. Não invente produtos.",
    card: "A simulação mostra o teto, o máximo de influencers e o valor por creator.",
    fields: ["fixedFeePerPost", "commission", "budget", "maxInfluencers", "perInfluencerFee"],
  },
  {
    id: "brief",
    prompt: "Escreva description em português, com o que não pode faltar na história. doList e dontList são listas curtas. productCategories são categorias do site, não produtos inventados. Não escolha formulário.",
    card: "O briefing é o texto que o creator lê antes de se candidatar.",
    fields: ["description", "doList", "dontList", "productCategories"],
  },
  {
    id: "scope",
    prompt: "Escolha formatos entre reels, stories, feed, tiktok, youtube, shorts e live, com quantity inteira. targetNetworks deve bater com os formatos.",
    card: "Formato, quantidade e rede definem o que o creator entrega.",
    fields: ["formatQuantities", "targetNetworks", "contentFormats"],
  },
  {
    id: "metrics",
    prompt: "Sugira successTargets só com métricas de visualização (views, reach) ou interação (likes, comments, saves, shares, interactions). target é um número. Hashtags começam com #. Menções têm network e handle com @. Poucas, alinhadas à marca.",
    card: "As metas levam o badge da estratégia escolhida.",
    fields: ["successTargets", "mandatoryHashtags", "mandatoryMentions"],
  },
  {
    id: "invites",
    prompt: "Não convide creators. A marca escolhe os perfis nesta etapa.",
    card: "Quem for convidado recebe e-mail e, se já tiver o app, uma notificação.",
    fields: [],
  },
  {
    id: "preview",
    prompt: "Não preencha a revisão, os termos de aceite nem os convites.",
    card: "Revise a campanha como o creator a vê, na web ou no celular.",
    fields: [],
  },
]

export function guidelineById(id: WizardStepId) {
  return WIZARD_GUIDELINES.find((item) => item.id === id) ?? WIZARD_GUIDELINES[0]
}

export function guidelinesPrompt() {
  const order = WIZARD_STEPS.map((step) => step.id)
  return order
    .map((id) => {
      const guide = guidelineById(id)
      return `Etapa ${id}. ${guide.prompt} Campos permitidos: ${guide.fields.join(", ") || "nenhum"}.`
    })
    .join("\n")
}
