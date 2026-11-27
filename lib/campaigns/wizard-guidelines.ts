import { WIZARD_STEPS, type WizardStepId } from "@/lib/campaigns/wizard-steps"

export interface WizardGuideline {
  id: WizardStepId
  prompt: string
  card: string
  fields: string[]
  /** Campos que a IA nunca preenche nesta etapa (Human-in-the-Loop). */
  blocked?: string[]
}

export const WIZARD_GUIDELINES: WizardGuideline[] = [
  {
    id: "website",
    prompt:
      "Não preencha o site. A URL é input do usuário. Ao avançar, construa o Dossiê da Marca (porte, modelo de negócio, abrangência, ticket, recorrência, identidade/catálogo) e leia histórico da conta se houver.",
    card:
      "A leitura do site gera o dossiê interno. Todas as etapas seguintes consultam esse dossiê. Em sites pobres, não invente linhas de produto, cupons ou abrangência — diga no card que a sugestão usa só o que é público.",
    fields: ["brandWebsite"],
    blocked: [],
  },
  {
    id: "identity",
    prompt:
      "PREENCHE nome e niches (array 1–3 ids oficiais). Nome = [Nome da Marca] + [eixo temático real do site]. Evite nomes genéricos ou promocionais sem confirmação. Nichos oficiais: beleza, saude-bem-estar, fitness, moda, gastronomia, lifestyle, casa-decoracao, maternidade-familia, pets, tecnologia, games, financas-negocios, educacao, viagem, automotivo, cultura-entretenimento. REGRA DE OURO DO NICHO: classifique pelo que a marca VENDE/ENTREGA (catálogo, linhas, serviço), não por adjetivos de propósito (vegano, cruelty-free, sustentável, clean, natural). Pets = só se houver produto/serviço PARA animais de estimação (ração, pet shop, veterinária, coleira). PROIBIDO pets por 'não testa em animais', 'cruelty-free', 'vegano' ou 'amigável aos animais' em marca de cosmético/skincare/moda humana — nesses casos use beleza (e saude-bem-estar se fizer sentido). Combinações: farmácia→saude-bem-estar+beleza; suplementos→fitness+saude-bem-estar; skincare vegano→beleza; eletro→casa-decoracao+tecnologia; infantil→maternidade-familia+moda; festival/bar→cultura-entretenimento+gastronomia. NUNCA preencha datas nem banner.",
    card:
      "Explique atratividade do nome e por que cada nicho espelha o catálogo real (o que vende), não o discurso ético isolado. Datas e banner ficam com a marca.",
    fields: ["name", "niches", "niche"],
    blocked: ["startDate", "endDate", "applicationStart", "applicationEnd", "coverImage"],
  },
  {
    id: "strategy",
    prompt:
      "NUNCA PREENCHE strategy nem objective. Deixe os três cards (alcance, engajamento, vendas) para a marca. No card lateral, modo consultor: se há e-commerce/checkout, explique que Vendas rastreia conversão, Alcance serve a lançamentos/novos públicos e Engajamento a consideração/comunidade; se institucional/físico sem checkout, Alcance ou Engajamento tendem a ser mais coerentes; se SaaS/App/Serviço, Vendas para lead/assinatura e Engajamento para educar.",
    card:
      "Nem toda campanha tem venda direta como objetivo. A escolha é 100% da marca; a IA só orienta o alinhamento com o modelo do site.",
    fields: [],
    blocked: ["strategy", "objective"],
  },
  {
    id: "tactics",
    prompt:
      "PREENCHE somente depois que a marca escolheu Estratégia. Opções: publipost, live, link, cupom. Matriz: Alcance → publipost (+ link se lançamento/app/hotsite). Engajamento → publipost (+ live opcional se moda/beleza/varejo visual e marca média/grande). Vendas D2C → publipost+link+cupom; luxo/sem desconto → publipost+link; App/SaaS → publipost+link (+cupom só se trial/desconto no site); liquidação/drop → +live; negócio local → publipost+cupom (ou link WhatsApp). Não marque live sem evidência de venda/demonstração ao vivo.",
    card:
      "Conecte cada tática à Estratégia + estrutura de venda do site. Cada subcard explica o papel único daquele item (Elo → Evidência → Efeito).",
    fields: ["tactics"],
  },
  {
    id: "audience",
    prompt:
      "PREENCHE localização e faixas etárias. E-commerce nacional/App/SaaS → Brasil (nunca travar em cidade só porque a sede fica lá). Negócio local/restaurante/clínica → Cidade/Estado do site. Idades entre 0-17, 18-24, 25-34, 35-44, 45+. Nunca marcar 0-17 por padrão (só teen/gamer/escolar explícito). 18-24 pesa TikTok+IG; 25-34 equilíbrio IG+TT/YT; 35-44 IG+YT; 45+ IG+YT com tom direto. NUNCA ative exigências/travas de público.",
    card:
      "Explique a abrangência geográfica real e o recorte geracional compatível com o catálogo. Travas de público ficam com a marca.",
    fields: ["audienceCountry", "audienceAges"],
    blocked: ["requiredAudienceFields"],
  },
  {
    id: "creator",
    prompt:
      "PREENCHE local, idioma, redes (1–2 principais; 3 só se marca grande/histórico), portes (audienceTiers), nichos (targetNiches) e engajamento mínimo. Idioma acompanha o site (Português em operação BR). Local espelha Público. targetNiches OBRIGATÓRIO: inclua sempre o nicho principal da marca (primeiro id de niches da identificação/site). Pode somar 1–2 nichos adjacentes — múltiplos nichos na audiência são bem-vindos — mas nunca omita o principal. PORTE DO CREATOR — leitura obrigatória (nunca default Micro+Mid): cruze (1) porte da marca no dossiê, (2) Estratégia confirmada, (3) papel da campanha (alcance de marca, comunidade, performance/vendas, lançamento, local vs nacional, ticket, B2B/luxo). Exemplos: marca pequena + vendas/engajamento → Nano+Micro; pequena + alcance nacional/lançamento → Nano+Micro+Mid; média + alcance/branding → Micro+Mid+Macro; média + engajamento → Nano+Micro+Mid; média/grande B2B ou ticket alto em vendas → Mid+Macro; grande + alcance → Mid+Macro ou Macro+Mega; grande + engajamento → Micro+Mid+Macro; negócio local → Nano+Micro. PROIBIDO repetir sempre Micro+Mid sem ligar à empresa e ao objetivo. Redes: moda/beleza/fitness/gastro/lifestyle → IG+TT; tech/finanças/ticket alto → YT+IG; games → YT+TT; local → IG (+TT se experiência). Engajamento: nano/micro → 2–3,5%; mid/macro/mega → 1–2%. NUNCA ative chips Exigir… (nicho, porte, engajamento, localização, audiência, idioma, rede).",
    card:
      "Justifique portes e nichos: o nicho principal do site deve estar na audiência; extras só se ampliarem o funil com coerência. Reforce: audiência não é influência. Oriente que travas Exigir… reduzem volume de candidaturas.",
    fields: [
      "targetNiches",
      "targetNetworks",
      "creatorLocation",
      "creatorLanguage",
      "audienceNotes",
      "audienceTiers",
      "minEngagement",
      "minFollowers",
      "maxFollowers",
    ],
    blocked: ["requiredCreatorFields"],
  },
  {
    id: "privacy",
    prompt:
      "PREENCHE só visibility: publica (pequena/média buscando escala ou Vendas+Comissão), privada (Engajamento recorrente/embaixadores), secreta (grande/luxo, embargo ou foco Macro).",
    card:
      "Explique o trade-off entre volume de candidaturas e controle de imagem/curadoria.",
    fields: ["visibility"],
  },
  {
    id: "recommend",
    prompt:
      "PREENCHE recommendToMatching = true (Sim) por padrão. Se visibility for secreta, omita o campo — a etapa não aparece no fluxo.",
    card:
      "Sim por padrão amplia o funil de creators compatíveis. Em campanha secreta esta etapa some.",
    fields: ["recommendToMatching"],
    blocked: [],
  },
  {
    id: "cap",
    prompt:
      "PREENCHE applicationCap = 0 (Não / sem teto) por padrão. Nunca invente um número de teto. Se visibility for secreta, omita — a etapa não aparece. Períodos e banner continuam bloqueados.",
    card:
      "Não por padrão deixa a vitrine aberta. Em campanha secreta esta etapa some.",
    fields: ["applicationCap"],
    blocked: ["startDate", "endDate", "applicationStart", "applicationEnd", "coverImage"],
  },
  {
    id: "community",
    prompt: "NUNCA PREENCHE. O vínculo da comunidade é gerado pela plataforma.",
    card: "O link da comunidade é criado ao salvar e aponta para a campanha.",
    fields: [],
    blocked: ["communityLink"],
  },
  {
    id: "terms",
    prompt:
      "PREENCHE commercialTerms (fixo, permuta, comissao) sem inventar valores e SEMPRE alinhado à Estratégia confirmada (não à recommendedStrategy se o usuário mudou). Matriz: Alcance pequena física → só permuta; Alcance digital ou média/grande → só fixo; PROIBIDO comissão em Alcance; PROIBIDO inventar Fixo+Permuta juntos em Alcance. Engajamento pequena física → permuta ou fixo+permuta; Engajamento média/grande → fixo; Vendas com link/cupom → comissao (+permuta se físico e pequena) ou fixo+comissao (média/grande); sem link/cupom → só fixo (NUNCA comissao sem tática rastreável). notes.terms deve citar exatamente as condições escolhidas e a Estratégia atual (ex.: se Alcance+Permuta, não fale em Comissão nem Vendas). O teto (budget/maxInfluencers) só aparece na UI com Fixo — NUNCA invente cifras.",
    card:
      "Justifique as condições marcadas na tela e a Estratégia atual (Alcance ≠ Vendas). Com Fixo, o teto aparece aqui; sem Fixo, não se aplica. Não invente cifras.",
    fields: ["commercialTerms"],
    blocked: ["fixedFeePerPost", "commission", "budget", "maxInfluencers", "perInfluencerFee", "budgetNotApplicable"],
  },
  {
    id: "budget",
    prompt:
      "NUNCA PREENCHE NADA: valor fixo por post, comissão %, tipo de comissão, oferta no banner. O teto já foi tratado em condições comerciais (só com Fixo). Só oriente no card.",
    card:
      "Preserve o planejamento financeiro. Oriente calibragem (fixo+comissão pode ter cachê mais enxuto), pulverização vs concentração (nano/micro), custos invisíveis (envio, frete, impulsionamento, direitos de uso) e oferta no banner (Mostrar oferta vs Entre em contato) — sem cifras inventadas.",
    fields: [],
    blocked: ["fixedFeePerPost", "commission", "budget", "maxInfluencers", "perInfluencerFee", "budgetNotApplicable"],
  },
  {
    id: "brief",
    prompt:
      "PREENCHE description (até 3 blocos: Objetivo/Contexto; Pontos-chave + integração à rotina; CTA coerente com Estratégia), doList (3–4), dontList (2–4) e productCategories do site. Anti-propaganda: proibido texto institucional em 3ª pessoa e falas prontas/scripts. Falar com o creator. doList traduz Estratégia (Alcance: gancho 3s + rotina; Engajamento: pergunta/tutorial/salvamento; Vendas: quebra de objeção + link/cupom fluido) + #publi. dontList só editorial/compliance (sinalizar publi, sem concorrentes, sem promessas clínicas/financeiras irreais). PROIBIDO vazar regras comerciais da plataforma no briefing. NUNCA preencha produtos da loja.",
    card:
      "Mostre como a abordagem evita cara de anúncio frio e lembre a marca de reservar aprovação prévia antes da publicação.",
    fields: ["description", "doList", "dontList", "productCategories"],
    blocked: ["seedingProducts", "formId"],
  },
  {
    id: "scope",
    prompt:
      "PREENCHE formatos espelhando estritamente as redes de Creator ideal (quantity 1 por formato). IG Alcance→reels; Engajamento→reels+stories (ou feed carrossel educativo); Vendas→reels+stories. TikTok→tiktok (1). YouTube Alcance→shorts (ou youtube se review complexo); Engajamento/Vendas→youtube (ou shorts). Live commerce na tática + IG ativo → live (1). PROIBIDO sugerir formato de rede não marcada.",
    card:
      "Explique a função de cada formato no funil. Escopo enxuto (1 por formato) mantém viabilidade.",
    fields: ["formatQuantities", "contentFormats"],
  },
  {
    id: "metrics",
    prompt:
      "PREENCHE KPIs (successTargets) e 3–4 hashtags/@. target=0 (só marcar checkbox; NUNCA inventar metas numéricas, CPM ou ROI). Filtrar por redes/formatos ativos. Alcance IG/TT→reach, views (+skip_rate ou completion); Alcance YT→views, engaged_views. Engajamento IG→interactions, saves, comments; TT/YT→comments, shares, saves. Vendas com link+cupom→tracked_link_clicks, coupon_uses, orders, revenue (+story_link_clicks se Stories). Só link→tracked_link_clicks, orders/leads. App→tracked_link_clicks, app_download_clicks. Local→coupon_uses, text_clicks ou direction_clicks. Nunca só vanity (views/interactions) em Vendas.",
    card:
      "Explique por que cada métrica comprova o resultado da Estratégia e da Tática, sem cifras inventadas.",
    fields: ["successTargets", "mandatoryHashtags", "mandatoryMentions"],
  },
  {
    id: "invites",
    prompt: "NUNCA PREENCHE. A marca escolhe os perfis.",
    card:
      "Checklist de curadoria: compatibilidade real de audiência/linguagem, envolvimento genuíno com a categoria e atenção a red flags (seguidores falsos, métricas infladas, comentários desconexos).",
    fields: [],
    blocked: ["inviteIds"],
  },
  {
    id: "preview",
    prompt: "Não preencha a revisão, os termos de aceite nem os convites.",
    card: "Revise a campanha como o creator a vê, na web ou no celular.",
    fields: [],
    blocked: ["termsAccepted", "inviteIds"],
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
      const blocked = guide.blocked?.length ? ` Bloqueados: ${guide.blocked.join(", ")}.` : ""
      return `Etapa ${id}. ${guide.prompt} Campos permitidos: ${guide.fields.join(", ") || "nenhum"}.${blocked}`
    })
    .join("\n")
}

/** Doutrina estratégica v2.0 — concatenada ao system prompt do autofill. */
export function strategicDoctrinePrompt() {
  return [
    "## Arquitetura (4 camadas)",
    "1) Dossiê da Marca a partir do site. 2) Memória de performance/histórico da conta (se houver) tem precedência sobre inferência do site na mesma Estratégia. 3) Governança Human-in-the-Loop: preencher só o permitido; nos bloqueados, atuar só no card Justificativa. 4) Encadeamento reativo: Sugestão = Dossiê + Histórico + Decisões confirmadas pelo usuário.",
    "",
    "## Dossiê — classificar company com:",
    "porte: pequena | media | grande",
    "modeloNegocio: ecommerce_d2c | marketplace | app_saas | servico_b2b | negocio_local | institucional",
    "abrangencia: local | regional | nacional | global_br",
    "ticketMedio: baixo | medio | alto",
    "recorrencia: alta | media | baixa",
    "tomDeVoz, diferenciais (lista), recommendedStrategy (apenas consultoria — NÃO copie para suggestion.strategy).",
    "",
    "## 10 travas de ouro",
    "1. Retornar vazio/omitir: strategy, objective, exigências de público/creator, períodos, banner, orçamento inteiro, produtos da loja, convites. recommendToMatching=true e applicationCap=0 por padrão (omitir ambos se visibility=secreta).",
    "2. Histórico validado na mesma Estratégia > inferência genérica do site.",
    "3. Tática, Condições, Briefing, Escopo e Métricas dependem da Estratégia escolhida (ou de recommendedStrategy só para rascunhar campos fillable quando filled.strategy ainda não veio).",
    "4. Marcas nacionais → Brasil; faixas etárias calibram redes e tom do briefing.",
    "5. Escopo e KPIs ⊆ redes ativas em Creator ideal.",
    "6. Comissão só se Link ou Cupom estiverem nas táticas.",
    "7. Briefing anti-propaganda + #publi + sem concorrentes; nunca vazar regras comerciais da plataforma.",
    "8. KPIs com target 0; hashtags reais; sem views/faturamento/CPM inventados.",
    "9. Card de orçamento: custos invisíveis (envio, frete, mídia, direitos) sem preencher campos.",
    "10. Justificativa por subcard: Elo → Evidência → Efeito; sem circularidade, sem texto duplicado, 100% fiel ao que seria marcado na tela.",
    "",
    "## Justificativa (notes) — linguagem para o usuário",
    "Para cada etapa, notes[etapa] em português profissional e direto, 1–3 frases.",
    "Fórmula: por que isso encaixa nesta marca e neste objetivo + por que as alternativas principais não encaixam agora.",
    "Cite evidência concreta do site (produto, modelo de venda, público). Nunca explique o que o botão faz de forma genérica.",
    "PROIBIDO usar IDs técnicos ou underscores (ex.: ecommerce_d2c, publipost, tracked_link_clicks, nano). Use português: e-commerce próprio, Publi Post, cliques no link rastreável, Nano.",
    "Em strategy/budget/invites: só consultoria. Em recommend/cap: padrões Sim/Não (omitir se secreta).",
    "",
    "## Anti-padrões",
    "Proibido: 'esta opção serve para X' sem ligar à marca; texto circular; underscores/IDs; repetir a mesma frase em subcards; inventar evidência.",
    "Proibido: audienceTiers sempre micro+mid (ou sempre o mesmo par) sem justificar com porte da marca + Estratégia + finalidade da campanha.",
    "Proibido: nichar como pets por veganismo, cruelty-free, 'não testa em animais' ou bem-estar animal em marca humana (skincare, cosmético, moda, alimento humano). Pets exige catálogo pet real.",
  ].join("\n")
}
