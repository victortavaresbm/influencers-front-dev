import {
  item,
  uid,
  type Align,
  type FormSite,
  type ListAppearance,
  type SiteAction,
  type SiteBlock,
  type SitePage,
} from "@/lib/mock-data/form-site"

// Premium ready-made landings — each template is a distinct design movement
// the brand can apply in one click and then swap texts, colors and images.

const PHOTO = "?auto=format&fit=crop&w=1600&q=70"

function hero(o: {
  title: string
  subtitle: string
  background: string
  tone: "light" | "dark"
  image?: string
  align?: Align
  cta?: string
}): SiteBlock {
  return {
    id: uid("blk"),
    type: "banner",
    title: o.title,
    subtitle: o.subtitle,
    image: o.image ?? "",
    background: o.background,
    tone: o.tone,
    align: o.align ?? "center",
    ctaLabel: o.cta ?? "Quero me candidatar",
    action: { kind: "form" },
  }
}

function stats(items: [string, string][]): SiteBlock {
  return { id: uid("blk"), type: "stats", items: items.map(([t, x]) => item(t, x)) }
}

function features(title: string, items: [string, string][], appearance?: ListAppearance): SiteBlock {
  return { id: uid("blk"), type: "features", title, items: items.map(([t, x]) => item(t, x)), appearance }
}

function bento(title: string, items: [string, string][], appearance?: ListAppearance): SiteBlock {
  return { id: uid("blk"), type: "bento", title, items: items.map(([t, x]) => item(t, x)), appearance }
}

function steps(title: string, items: [string, string][]): SiteBlock {
  return { id: uid("blk"), type: "steps", title, items: items.map(([t, x]) => item(t, x)) }
}

function marquee(labels: string[]): SiteBlock {
  return { id: uid("blk"), type: "marquee", items: labels.map((label) => item(label, "")) }
}

function gallery(images: [string, string][]): SiteBlock {
  return {
    id: uid("blk"),
    type: "gallery",
    items: images.map(([src, caption]) => ({ id: uid("it"), src, caption })),
  }
}

function announcement(text: string, cta: string, background: string, tone: "light" | "dark" = "light"): SiteBlock {
  return { id: uid("blk"), type: "announcement", text, ctaLabel: cta, action: { kind: "form" }, background, tone }
}

function faq(title: string, items: [string, string][]): SiteBlock {
  return { id: uid("blk"), type: "faq", title, items: items.map(([t, x]) => item(t, x)) }
}

function testimonial(quote: string, author: string, role: string): SiteBlock {
  return { id: uid("blk"), type: "testimonial", quote, author, role }
}

function heading(text: string, align: Align = "center", size: "md" | "lg" = "lg"): SiteBlock {
  return { id: uid("blk"), type: "heading", text, size, align }
}

function paragraph(text: string, align: Align = "center"): SiteBlock {
  return { id: uid("blk"), type: "text", text, align }
}

function button(label: string, action: SiteAction = { kind: "form" }, style: "solid" | "outline" = "solid", align: Align = "center"): SiteBlock {
  return { id: uid("blk"), type: "button", label, style, align, action }
}

function spacer(size: "sm" | "md" | "lg" = "lg"): SiteBlock {
  return { id: uid("blk"), type: "spacer", size }
}

function divider(): SiteBlock {
  return { id: uid("blk"), type: "divider" }
}

function form(title = "Sua candidatura"): SiteBlock {
  return { id: uid("blk"), type: "form", title }
}

function landing(blocks: SiteBlock[]): SitePage {
  return { id: uid("pg"), name: "Início", kind: "landing", blocks }
}

function formPage(title = "Sua candidatura"): SitePage {
  return { id: uid("pg"), name: "Formulário", kind: "form", blocks: [form(title)] }
}

function thanks(name: string, title: string, body: string, extra?: SiteBlock): SitePage {
  return {
    id: uid("pg"),
    name,
    kind: "thanks",
    blocks: [spacer("lg"), heading(title, "center"), paragraph(body, "center"), ...(extra ? [extra] : []), spacer("lg")],
  }
}

function site(theme: FormSite["theme"], landingPage: SitePage, formPg: SitePage, thanksPage: SitePage): FormSite {
  return {
    entryPageId: landingPage.id,
    fallbackPageId: thanksPage.id,
    rules: [],
    theme,
    pages: [landingPage, formPg, thanksPage],
  }
}

export interface SiteTemplate {
  id: string
  name: string
  tagline: string
  category: string
  accent: string
  build: () => FormSite
}

export const SITE_TEMPLATES: SiteTemplate[] = [
  {
    id: "luft",
    name: "Luft",
    tagline: "Minimalismo puro: tipografia, respiro e um único gesto.",
    category: "Minimalismo",
    accent: "#18181b",
    build: () =>
      site(
        { primary: "#18181b", background: "#ffffff", font: "Inter" },
        landing([
          spacer("lg"),
          heading("Menos ruído. Mais criação.", "left", "lg"),
          paragraph(
            "Um processo limpo para creators que preferem clareza. Sem excessos — só o essencial para se candidatar.",
            "left",
          ),
          spacer("md"),
          button("Começar", { kind: "form" }, "solid", "left"),
          spacer("lg"),
          divider(),
          stats([
            ["3", "passos"],
            ["48h", "resposta"],
            ["0", "taxa"],
          ]),
          spacer("md"),
          steps("Como funciona", [
            ["Conte quem você é", "Nome, nicho e um link do seu melhor trabalho."],
            ["A marca avalia", "Afinidade primeiro. Números depois."],
            ["Entre na lista", "Convites e campanhas chegam pelo painel."],
          ]),
          spacer("md"),
          faq("Dúvidas", [
            ["É gratuito?", "Sim. A candidatura não tem custo."],
            ["Posso editar depois?", "Sim, pelo painel a qualquer momento."],
          ]),
          spacer("md"),
          button("Começar candidatura", { kind: "form" }),
          spacer("lg"),
        ]),
        formPage(),
        thanks("Obrigado", "Registrado.", "Sua candidatura entrou na fila. A marca retorna pela plataforma."),
      ),
  },
  {
    id: "raster",
    name: "Raster",
    tagline: "Swiss Design: grade, contraste e tipografia precisa.",
    category: "Swiss Design",
    accent: "#e10600",
    build: () =>
      site(
        { primary: "#e10600", background: "#ffffff", font: "IBM Plex Sans" },
        landing([
          announcement("Vagas abertas · turma de primavera", "Candidatar-se", "#e10600", "light"),
          hero({
            title: "Sistema. Clareza. Resultado.",
            subtitle: "Layout suíço para marcas que tratam creators como parceiros de comunicação — não como mídia avulsa.",
            background: "#f4f4f5",
            tone: "dark",
            align: "left",
            cta: "Enviar portfólio",
          }),
          features(
            "01 — O que oferecemos",
            [
              ["Cachê transparente", "Valores publicados antes da entrega. Sem surpresa."],
              ["Brief objetivo", "Uma página. Três entregas. Zero ambiguidade."],
              ["Crédito na marca", "Seu nome aparece onde a campanha roda."],
            ],
            { background: "#ffffff", color: "#18181b", border: "#18181b" },
          ),
          heading("02 — Números", "left", "md"),
          stats([
            ["120+", "creators ativos"],
            ["4,9", "nota média"],
            ["72h", "SLA de resposta"],
          ]),
          divider(),
          testimonial(
            "O brief cabia em uma tela. Entreguei, cobrei, recebi. É raro funcionar assim.",
            "Helena Vogt",
            "Design · 92 mil",
          ),
          faq("Perguntas", [
            ["Preciso de muitos seguidores?", "Não. Olhamos consistência e legibilidade do perfil."],
            ["Qual o prazo?", "Resposta em até três dias úteis."],
          ]),
          button("Enviar portfólio", { kind: "form" }),
        ]),
        formPage("Portfólio"),
        thanks("Obrigado", "Recebido.", "A curadoria avalia e retorna pela plataforma."),
      ),
  },
  {
    id: "chroma",
    name: "Chroma",
    tagline: "Flat Design: cores sólidas, ícones claros, zero ornamentação.",
    category: "Flat Design",
    accent: "#2563eb",
    build: () =>
      site(
        { primary: "#2563eb", background: "#ffffff", font: "Nunito" },
        landing([
          hero({
            title: "Candidatura simples. Cores que falam.",
            subtitle: "Landing plana e amigável para campanhas de alcance — fácil de ler no celular.",
            background: "#2563eb",
            tone: "light",
            align: "center",
            cta: "Quero entrar",
          }),
          marquee(["Cachê", "Produto", "Comissão", "Comunidade", "Cupom", "Campanhas"]),
          bento(
            "Tudo o que importa",
            [
              ["Sem burocracia", "Formulário curto. Resposta rápida."],
              ["Painel claro", "Status da candidatura em um lugar só."],
              ["Pagamento certo", "Cachê ou comissão, combinado na hora."],
              ["Suporte humano", "Time da marca responde pela plataforma."],
            ],
            { background: "#eff6ff", color: "#1e3a8a", border: "#bfdbfe" },
          ),
          stats([
            ["15%", "comissão"],
            ["+400", "creators"],
            ["R$ 0", "para começar"],
          ]),
          testimonial(
            "Entendi o que precisava fazer em 30 segundos. Isso muda tudo.",
            "Diego Alves",
            "Lifestyle · 210 mil",
          ),
          faq("FAQ", [
            ["Funciona no celular?", "Sim. A página inteira foi pensada para o feed."],
            ["Posso indicar alguém?", "Sim — depois da sua aprovação."],
          ]),
          button("Quero entrar", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Candidatura enviada!", "Acompanhe o status no painel."),
      ),
  },
  {
    id: "paper",
    name: "Paper",
    tagline: "Material Design: elevação, indigo e superfícies organizadas.",
    category: "Material Design",
    accent: "#4f46e5",
    build: () =>
      site(
        { primary: "#4f46e5", background: "#f8fafc", font: "Roboto" },
        landing([
          announcement("Nova temporada de campanhas", "Ver vagas", "#4f46e5", "light"),
          hero({
            title: "Superfícies claras. Decisões rápidas.",
            subtitle: "Inspirado no Material: cards elevados, hierarquia óbvia e um fluxo que qualquer creator entende.",
            background: "#312e81",
            tone: "light",
            align: "left",
            image: `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d${PHOTO}`,
            cta: "Abrir candidatura",
          }),
          features(
            "Benefícios em cards",
            [
              ["Inbox unificado", "Convites, briefs e pagamentos no mesmo lugar."],
              ["Metas visíveis", "Acompanhe entregas com progresso claro."],
              ["Feedback rápido", "A marca comenta direto no conteúdo enviado."],
            ],
            { background: "#ffffff", color: "#1e1b4b", border: "#e0e7ff" },
          ),
          steps("Fluxo em 4 atos", [
            ["Inscreva-se", "Preencha o formulário com o essencial."],
            ["Combine", "Aceite brief, datas e valor."],
            ["Publique", "Envie o conteúdo pela plataforma."],
            ["Receba", "Cachê liberado após aprovação."],
          ]),
          stats([
            ["+850", "campanhas"],
            ["98%", "pagamentos em dia"],
            ["24h", "média de review"],
          ]),
          faq("Ajuda", [
            ["Preciso de app?", "Não. Tudo roda no navegador."],
            ["Tem contrato?", "Sim, digital e assinado na plataforma."],
          ]),
          button("Abrir candidatura", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Estamos analisando", "Você recebe a notificação no painel e no e-mail."),
      ),
  },
  {
    id: "prism",
    name: "Prism",
    tagline: "Glassmorphism: vidro fosco, blur e brilho suave.",
    category: "Glassmorphism",
    accent: "#a78bfa",
    build: () =>
      site(
        { primary: "#a78bfa", background: "#0b1020", font: "Sora" },
        landing([
          announcement("Early access · creators selecionados", "Entrar na lista", "#7c3aed", "light"),
          hero({
            title: "Transparência que brilha",
            subtitle: "Estética de vidro para marcas premium. A candidatura parece um convite — não um formulário.",
            background: "#12182b",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe${PHOTO}`,
            cta: "Quero o convite",
          }),
          marquee(["Glass", "Glow", "Premium", "Soft light", "Depth", "Blur"]),
          bento(
            "Camadas de valor",
            [
              ["Convite VIP", "Acesso antecipado às campanhas da temporada."],
              ["Kit físico", "Produto na sua casa antes do drop."],
              ["Mentoria", "Calls com o time de marca e creator leads."],
              ["Spotlight", "Destaque na vitrine da comunidade."],
            ],
            { background: "#1a2238", color: "#f5f3ff", border: "#4c1d95" },
          ),
          gallery([
            [`https://images.unsplash.com/photo-1618005198919-d00d353bac7f${PHOTO}`, "Mood"],
            [`https://images.unsplash.com/photo-1579546929518-9e396f3cc809${PHOTO}`, "Glow"],
            [`https://images.unsplash.com/photo-1558591710-4b4a1ae728f0${PHOTO}`, "Texture"],
          ]),
          testimonial(
            "Parecia um site de marca de luxo — e a parceria acompanhou o nível visual.",
            "Nina Park",
            "Beauty · 310 mil",
          ),
          faq("FAQ", [
            ["É só estética?", "Não. O fluxo de candidatura e pagamento é o mesmo da plataforma."],
            ["Quem entra?", "Creators alinhados ao posicionamento premium da marca."],
          ]),
          button("Quero o convite", { kind: "form" }),
        ]),
        formPage("Lista VIP"),
        thanks("Obrigado", "Você está na lista", "Avisamos assim que a marca abrir a próxima leva."),
      ),
  },
  {
    id: "clay",
    name: "Clay",
    tagline: "Neumorphism: volume suave, cinzas quentes e toque tátil.",
    category: "Neumorphism",
    accent: "#64748b",
    build: () =>
      site(
        { primary: "#6366f1", background: "#e8eef5", font: "Nunito" },
        landing([
          spacer("md"),
          hero({
            title: "Suave por fora. Firme por dentro.",
            subtitle: "Visual neumórfico para marcas de bem-estar e produto físico — a página parece tocável.",
            background: "#d9e2ec",
            tone: "dark",
            align: "center",
            cta: "Candidatar-me",
          }),
          features(
            "O que você sente na parceria",
            [
              ["Ritmo humano", "Prazos pensados para criação de verdade."],
              ["Produto na mão", "Teste antes de falar. Sem roteiro engessado."],
              ["Comunidade calma", "Troca entre creators sem pressa tóxica."],
            ],
            { background: "#eef3f8", color: "#334155", border: "#cbd5e1" },
          ),
          stats([
            ["12 meses", "parceria média"],
            ["100%", "produto para testar"],
            ["+220", "creators ativos"],
          ]),
          steps("Passo a passo", [
            ["Inscrição", "Conte sua rotina e seu nicho."],
            ["Seleção", "A marca combina expectativa e calendário."],
            ["Criação", "Você publica no seu tom."],
          ]),
          testimonial(
            "A página já transmitia o cuidado que a marca tem com a gente. Combinou com o meu conteúdo.",
            "Lara Mendes",
            "Bem-estar · 74 mil",
          ),
          faq("Perguntas", [
            ["Preciso ser expert?", "Não. Buscamos autenticidade na rotina."],
            ["É pago?", "Produto + comissão ou cachê, conforme a campanha."],
          ]),
          button("Candidatar-me", { kind: "form" }),
          spacer("md"),
        ]),
        formPage(),
        thanks("Obrigado", "Recebemos você", "A marca avalia com calma e retorna pela plataforma."),
      ),
  },
  {
    id: "raw",
    name: "Raw",
    tagline: "Brutalism: contraste duro, tipografia crua, zero filtro.",
    category: "Brutalism",
    accent: "#facc15",
    build: () =>
      site(
        { primary: "#facc15", background: "#ffffff", font: "Space Mono" },
        landing([
          announcement("SEM ENFEITE. SÓ TRABALHO.", "ENTRAR →", "#18181b", "light"),
          hero({
            title: "PARE DE PEDIR PERMISSÃO.",
            subtitle: "Candidatura brutalista para creators que entregam. Preto, branco, amarelo. Sem pastel.",
            background: "#18181b",
            tone: "light",
            align: "left",
            cta: "MANDAR AGORA",
          }),
          marquee(["RAW", "LOUD", "DIRECT", "NO FILTER", "SHIP IT", "RAW"]),
          features(
            "REGRAS DO JOGO",
            [
              ["BRIEF CURTO", "Uma tela. Sem PDF de 40 páginas."],
              ["PAGAMENTO RÁPIDO", "Aprovado? Cai. Sem teatro."],
              ["CRÉDITO VISÍVEL", "Seu @ na peça. Sempre."],
            ],
            { background: "#facc15", color: "#18181b", border: "#18181b" },
          ),
          stats([
            ["0", "desculpas"],
            ["1", "candidatura"],
            ["48h", "ou nada"],
          ]),
          testimonial(
            "Finalmente uma marca que não finge. O visual já avisava o tom da parceria.",
            "Kai Oliveira",
            "Street · 180 mil",
          ),
          faq("Q&A", [
            ["É sério?", "Sim. Só parece agressivo."],
            ["Serve pra mim?", "Se você publica com opinião, sim."],
          ]),
          button("MANDAR AGORA", { kind: "form" }),
        ]),
        formPage("Candidatura"),
        thanks("OK", "ENTROU.", "Aguarde o retorno no painel."),
      ),
  },
  {
    id: "bolt",
    name: "Bolt",
    tagline: "Neo-brutalism: bordas grossas, cor pop e atitude.",
    category: "Neo-brutalism",
    accent: "#fb7185",
    build: () =>
      site(
        { primary: "#fb7185", background: "#fff7ed", font: "Syne" },
        landing([
          announcement("Vagas abertas · turma colorida", "Quero!", "#fb7185", "light"),
          hero({
            title: "Alto contraste. Alta energia.",
            subtitle: "Neo-brutalismo para campanhas que querem ser vistas no feed — bold, divertido e memorável.",
            background: "#ffedd5",
            tone: "dark",
            align: "left",
            image: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe${PHOTO}`,
            cta: "Me candidatar",
          }),
          bento(
            "Por que essa cara?",
            [
              ["Bordas que gritam", "A página compete com o scroll infinito."],
              ["Cor com personalidade", "Rosa, laranja e preto — sem meio-termo."],
              ["Texto curto", "Você lê em 20 segundos e decide."],
              ["CTA óbvio", "Um botão. Sem labirinto."],
            ],
            { background: "#ffffff", color: "#18181b", border: "#18181b" },
          ),
          steps("Três batidas", [
            ["Aplique", "Formulário em menos de 3 minutos."],
            ["Combine", "Brief + valor + data."],
            ["Publique", "Seu estilo. Nossa marca."],
          ]),
          gallery([
            [`https://images.unsplash.com/photo-1550684848-fac1c5b4e853${PHOTO}`, "Pop"],
            [`https://images.unsplash.com/photo-1614850715649-1d1766291419${PHOTO}`, "Bold"],
            [`https://images.unsplash.com/photo-1579546929662-711aa81148cf${PHOTO}`, "Color"],
          ]),
          testimonial(
            "A landing já parecia o meu feed. A parceria veio no mesmo espírito.",
            "Bia Torres",
            "Humor · 520 mil",
          ),
          faq("Dúvidas", [
            ["Serve só pra Gen Z?", "Não. Serve pra quem quer destaque visual."],
            ["Tem cachê?", "Sim, combinado por campanha."],
          ]),
          button("Me candidatar", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Chegou!", "A marca avalia e te avisa no painel."),
      ),
  },
  {
    id: "neon",
    name: "Neon",
    tagline: "Cyberpunk: noite, neon e interface de outro mundo.",
    category: "Cyberpunk",
    accent: "#22d3ee",
    build: () =>
      site(
        { primary: "#22d3ee", background: "#05050a", font: "Orbitron" },
        landing([
          announcement("SIGNAL DETECTED · OPEN SLOTS", "JACK IN", "#f472b6", "light"),
          hero({
            title: "Entre no grid. Saia em destaque.",
            subtitle: "Campanha cyberpunk para creators de tech, games e cultura digital. Neon no visual. Precisão no brief.",
            background: "#0a0a12",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1550745165-9bc0b252726f${PHOTO}`,
            cta: "Iniciar uplink",
          }),
          marquee(["NEON", "GLITCH", "NIGHT CITY", "UPLINK", "CREATORS", "DROP"]),
          features(
            "Protocolo da parceria",
            [
              ["Drop antecipado", "Acesso ao produto antes do anúncio público."],
              ["Cachê em cripto ou Pix", "Você escolhe como receber."],
              ["Overlay na marca", "Seu handle nos assets oficiais."],
            ],
            { background: "#0f172a", color: "#e2e8f0", border: "#22d3ee" },
          ),
          stats([
            ["2077", "mood"],
            ["R$ 90k", "pool de cachês"],
            ["72h", "resposta"],
          ]),
          testimonial(
            "A página parecia um trailer. A campanha entregou o mesmo feeling.",
            "Rex Nakamura",
            "Games · 640 mil",
          ),
          faq("Terminal", [
            ["Preciso falar de tech?", "Tech, games, sci-fi ou cultura digital."],
            ["Como recebo?", "Pix ou cripto, combinado na aprovação."],
          ]),
          button("Iniciar uplink", { kind: "form" }),
        ]),
        formPage("Uplink"),
        thanks("OK", "Signal received", "Aguarde o handshake da marca no painel."),
      ),
  },
  {
    id: "orbit",
    name: "Orbit",
    tagline: "Futuristic Design: linhas limpas, espaço e precisão.",
    category: "Futuristic",
    accent: "#38bdf8",
    build: () =>
      site(
        { primary: "#38bdf8", background: "#020617", font: "Exo 2" },
        landing([
          announcement("Próxima órbita de creators · vagas limitadas", "Reservar lugar", "#0ea5e9", "light"),
          hero({
            title: "O futuro da parceria começa aqui",
            subtitle: "Design futurista para marcas de inovação: tipografia técnica, profundidade espacial e um fluxo impecável.",
            background: "#0b1224",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1451187580459-43490279c0fa${PHOTO}`,
            cta: "Entrar na órbita",
          }),
          marquee(["LAUNCH", "SYSTEMS", "CREATORS", "ORBIT", "SIGNAL", "FUTURE"]),
          steps("Sequência de lançamento", [
            ["Telemetry", "Envie perfil, nicho e canais."],
            ["Docking", "A marca alinha brief e calendário."],
            ["Ignition", "Você publica e acompanha no painel."],
            ["Orbit", "Parceria contínua com novos drops."],
          ]),
          bento(
            "Sistemas a bordo",
            [
              ["Painel em tempo real", "Status, brief e pagamento sincronizados."],
              ["Assets oficiais", "Kit visual pronto para o seu conteúdo."],
              ["Ranking da temporada", "Destaque para quem performa."],
              ["Suporte dedicado", "Canal direto com o time da marca."],
            ],
            { background: "#0f172a", color: "#e0f2fe", border: "#1e3a5f" },
          ),
          stats([
            ["+1.2k", "creators"],
            ["99%", "uptime do painel"],
            ["36h", "SLA médio"],
          ]),
          gallery([
            [`https://images.unsplash.com/photo-1446776811953-b23d57bd21aa${PHOTO}`, "Space"],
            [`https://images.unsplash.com/photo-1462331940025-496dfbfcba91${PHOTO}`, "Nebula"],
            [`https://images.unsplash.com/photo-1419242902214-272b3f66ee7a${PHOTO}`, "Orbit"],
          ]),
          testimonial(
            "Visual de produto de ponta. A operação acompanhou: rápido, limpo, previsível.",
            "Sofia Chen",
            "Tech · 290 mil",
          ),
          faq("Mission control", [
            ["Serve só para tech?", "Tech, inovação, mobilidade e marcas que querem cara de futuro."],
            ["Como começo?", "Candidatura abaixo. Aprovação em até dois dias."],
          ]),
          button("Entrar na órbita", { kind: "form" }),
        ]),
        formPage("Reserva"),
        thanks(
          "Obrigado",
          "Você entrou na fila de lançamento",
          "Confirmaremos a vaga pela plataforma em breve.",
          button("Abrir painel", { kind: "none" }, "outline", "center"),
        ),
      ),
  },
  {
    id: "folio",
    name: "Folio",
    tagline: "Editorial Design: tipografia de revista, colunas e ritmo de leitura.",
    category: "Editorial Design",
    accent: "#1c1917",
    build: () =>
      site(
        { primary: "#1c1917", background: "#faf7f2", font: "Libre Baskerville" },
        landing([
          spacer("md"),
          heading("A edição de creators desta temporada", "left", "lg"),
          paragraph(
            "Layout editorial para marcas que tratam a parceria como matéria de capa — hierarquia clara, texto generoso, zero pressa visual.",
            "left",
          ),
          spacer("sm"),
          button("Assinar a edição", { kind: "form" }, "solid", "left"),
          spacer("md"),
          divider(),
          features(
            "Nesta edição",
            [
              ["Perfil em profundidade", "Contamos a história do creator, não só o alcance."],
              ["Brief como pauta", "Uma página, três entregas, contexto de marca."],
              ["Crédito de autor", "Seu nome na peça — tipografia de capa."],
            ],
            { background: "#ffffff", color: "#1c1917", border: "#d6d3d1" },
          ),
          stats([
            ["12", "páginas de brief"],
            ["48h", "retorno"],
            ["∞", "estilo próprio"],
          ]),
          testimonial(
            "Parecia uma revista. A parceria teve o mesmo cuidado com o texto.",
            "Clara Nogueira",
            "Cultura · 145 mil",
          ),
          faq("Rodapé", [
            ["Serve para qualquer nicho?", "Melhor para lifestyle, moda, cultura e marca premium."],
            ["É pago?", "Cachê editorial combinado por campanha."],
          ]),
          button("Assinar a edição", { kind: "form" }),
          spacer("md"),
        ]),
        formPage("Candidatura editorial"),
        thanks("Obrigado", "Sua pauta entrou", "A redação da marca retorna pela plataforma."),
      ),
  },
  {
    id: "zigzag",
    name: "Zigzag",
    tagline: "Memphis Design: formas geométricas, cores quentes e irreverência.",
    category: "Memphis Design",
    accent: "#f97316",
    build: () =>
      site(
        { primary: "#f97316", background: "#fffbeb", font: "Fredoka" },
        landing([
          announcement("Formas livres · vagas abertas", "Entrar no zig", "#ec4899", "light"),
          hero({
            title: "Geometria que dança",
            subtitle: "Memphis dos anos 80 revisitado: triângulos, bolinhas e uma candidatura que não leva a si mesma a sério demais.",
            background: "#fef3c7",
            tone: "dark",
            align: "left",
            cta: "Quero o zigzag",
          }),
          marquee(["SQUIGGLE", "DOT", "TRIANGLE", "POP", "PATTERN", "FUN"]),
          bento(
            "Kit Memphis",
            [
              ["Paleta quente", "Laranja, rosa e amarelo sem medo."],
              ["Formas soltas", "A página quebra a grade de propósito."],
              ["Tom leve", "Brief divertido, entrega autêntica."],
              ["CTA óbvio", "Um botão. Zero labirinto."],
            ],
            { background: "#ffffff", color: "#9a3412", border: "#fb923c" },
          ),
          stats([
            ["80s", "vibes"],
            ["+300", "creators"],
            ["R$ 0", "para começar"],
          ]),
          testimonial(
            "Minha feed já era colorida — a landing combinou na hora.",
            "Theo Martins",
            "Arte · 88 mil",
          ),
          faq("FAQ", [
            ["É só estética?", "Não. O fluxo de candidatura é o da plataforma."],
            ["Serve para B2B?", "Melhor para lifestyle, design e cultura pop."],
          ]),
          button("Quero o zigzag", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Você entrou no padrão", "A marca avalia e te avisa no painel."),
      ),
  },
  {
    id: "sepia",
    name: "Sepia",
    tagline: "Vintage Design: texturas quentes, nostalgia e tipografia clássica.",
    category: "Vintage Design",
    accent: "#92400e",
    build: () =>
      site(
        { primary: "#92400e", background: "#f5e6d3", font: "Cormorant Garamond" },
        landing([
          hero({
            title: "Parcerias com alma de arquivo",
            subtitle: "Visual vintage para marcas com história: sépia, papel e um convite que parece carta.",
            background: "#d4a574",
            tone: "dark",
            align: "center",
            image: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d${PHOTO}`,
            cta: "Enviar carta",
          }),
          features(
            "O que preservamos",
            [
              ["Tom humano", "Textos longos, sem jargão de growth."],
              ["Produto com história", "Você conta a origem, não só o preço."],
              ["Ritmo lento", "Prazos pensados para criação cuidadosa."],
            ],
            { background: "#faf0e4", color: "#78350f", border: "#d6b896" },
          ),
          stats([
            ["1920", "mood"],
            ["100%", "produto real"],
            ["7 dias", "SLA"],
          ]),
          testimonial(
            "A página cheirava a papel antigo. A marca entregou o mesmo carinho.",
            "Helena Costa",
            "Lifestyle · 62 mil",
          ),
          faq("Arquivo", [
            ["Preciso de estética vintage?", "Ajuda, mas autenticidade conta mais."],
            ["Como recebo?", "Cachê ou produto + comissão."],
          ]),
          button("Enviar carta", { kind: "form" }),
        ]),
        formPage("Carta de candidatura"),
        thanks("Obrigado", "Carta recebida", "A marca responde pela plataforma."),
      ),
  },
  {
    id: "vinyl",
    name: "Vinyl",
    tagline: "Retro Design: anos 70–90, cores saturadas e nostalgia pop.",
    category: "Retro Design",
    accent: "#db2777",
    build: () =>
      site(
        { primary: "#db2777", background: "#fff1f2", font: "Righteous" },
        landing([
          announcement("Rewind · turma aberta", "Play →", "#db2777", "light"),
          hero({
            title: "Press play na parceria",
            subtitle: "Retro chic para creators de moda, música e cultura. Disco, neon suave e um CTA que pede bis.",
            background: "#831843",
            tone: "light",
            align: "center",
            cta: "Entrar na faixa",
          }),
          marquee(["RETRO", "VINYL", "GROOVE", "REWIND", "POP", "SIDE A"]),
          steps("Lado A", [
            ["Inscreva-se", "Perfil + link do melhor conteúdo."],
            ["Combine", "Brief, datas e cachê."],
            ["Publique", "Seu tom. Nossa trilha."],
          ]),
          stats([
            ["45", "rpm de energia"],
            ["+500", "creators"],
            ["72h", "resposta"],
          ]),
          testimonial(
            "Visual de capa de disco. A campanha veio no mesmo groove.",
            "DJ Luna",
            "Música · 210 mil",
          ),
          faq("Bis", [
            ["Só para música?", "Música, moda, lifestyle e nostalgia pop."],
            ["Tem cachê?", "Sim, por campanha."],
          ]),
          button("Entrar na faixa", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Na fila do setlist", "Avisamos no painel."),
      ),
  },
  {
    id: "depth",
    name: "Depth",
    tagline: "3D Design: volume, sombra e profundidade que saltam da tela.",
    category: "3D Design",
    accent: "#6366f1",
    build: () =>
      site(
        { primary: "#6366f1", background: "#0f172a", font: "Poppins" },
        landing([
          hero({
            title: "Camadas que você sente",
            subtitle: "Landing 3D para produtos digitais e marcas de inovação — profundidade visual, CTA em primeiro plano.",
            background: "#1e1b4b",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1633356122544-f134324a6cee${PHOTO}`,
            cta: "Entrar em 3D",
          }),
          bento(
            "Eixos da parceria",
            [
              ["Volume real", "Assets 3D e mockups para o seu conteúdo."],
              ["Profundidade de brief", "Contexto completo, sem PDF infinito."],
              ["Sombra de suporte", "Time da marca sempre no canal."],
              ["Highlight no feed", "Peças pensadas para scroll."],
            ],
            { background: "#1e293b", color: "#e0e7ff", border: "#4f46e5" },
          ),
          stats([
            ["360°", "visão"],
            ["+180", "creators"],
            ["24h", "review"],
          ]),
          testimonial(
            "A página já tinha volume. O kit 3D elevou meu Reels.",
            "Marcus Wei",
            "Tech · 175 mil",
          ),
          faq("Z-axis", [
            ["Preciso saber 3D?", "Não. Os assets vêm prontos."],
            ["Nicho?", "Tech, games, produto e design."],
          ]),
          button("Entrar em 3D", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Render na fila", "A marca retorna no painel."),
      ),
  },
  {
    id: "velour",
    name: "Velour",
    tagline: "Luxury Design: ouro suave, tipografia fina e exclusividade.",
    category: "Luxury Design",
    accent: "#b45309",
    build: () =>
      site(
        { primary: "#b45309", background: "#0c0a09", font: "Playfair Display" },
        landing([
          announcement("Lista privada · por convite", "Solicitar acesso", "#b45309", "light"),
          hero({
            title: "Exclusivo por natureza",
            subtitle: "Estética de luxo para marcas premium. Poucas vagas, muito cuidado, zero pressa.",
            background: "#1c1917",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1441986300917-64674bd600d8${PHOTO}`,
            cta: "Solicitar acesso",
          }),
          features(
            "Cortesia da casa",
            [
              ["Kit VIP", "Produto antes do lançamento."],
              ["Brief sob medida", "Alinhamento 1:1 com a marca."],
              ["Cachê premium", "Valores compatíveis com o posicionamento."],
            ],
            { background: "#1c1917", color: "#fef3c7", border: "#92400e" },
          ),
          stats([
            ["12", "vagas/mês"],
            ["AAA", "nível"],
            ["5★", "média"],
          ]),
          testimonial(
            "Finalmente uma landing tão cuidada quanto a marca que represento.",
            "Isadora Klein",
            "Luxury · 95 mil",
          ),
          faq("Concierge", [
            ["É seletivo?", "Sim. Curadoria alinhada ao posicionamento."],
            ["Como sei se fui aceito?", "Notificação no painel e e-mail."],
          ]),
          button("Solicitar acesso", { kind: "form" }),
        ]),
        formPage("Lista VIP"),
        thanks("Obrigado", "Pedido recebido", "A curadoria responde em breve."),
      ),
  },
  {
    id: "atlas",
    name: "Atlas",
    tagline: "Corporate Design: confiança, grade limpa e tom institucional.",
    category: "Corporate Design",
    accent: "#1e40af",
    build: () =>
      site(
        { primary: "#1e40af", background: "#f8fafc", font: "IBM Plex Sans" },
        landing([
          announcement("Programa de creators · inscrição aberta", "Candidatar-se", "#1e40af", "light"),
          hero({
            title: "Parceria com governança",
            subtitle: "Visual corporativo para marcas B2B e instituições: clareza, compliance e um fluxo auditável.",
            background: "#1e3a8a",
            tone: "light",
            align: "left",
            cta: "Iniciar candidatura",
          }),
          features(
            "Pilares do programa",
            [
              ["Contrato digital", "Termos claros antes da primeira entrega."],
              ["SLA publicado", "Prazos de review e pagamento visíveis."],
              ["Relatório de campanha", "Números compartilhados com transparência."],
            ],
            { background: "#ffffff", color: "#1e3a8a", border: "#bfdbfe" },
          ),
          steps("Processo", [
            ["Aplicação", "Formulário + portfólio."],
            ["Compliance", "Verificação de dados e contrato."],
            ["Onboarding", "Brief e calendário."],
            ["Entrega", "Publicação e pagamento."],
          ]),
          stats([
            ["+2.4k", "creators"],
            ["99%", "pagamentos no prazo"],
            ["3 dias", "SLA"],
          ]),
          faq("Governança", [
            ["Preciso de CNPJ?", "PF ou PJ, conforme a campanha."],
            ["Há NDA?", "Quando a campanha exigir, sim."],
          ]),
          button("Iniciar candidatura", { kind: "form" }),
        ]),
        formPage("Candidatura corporativa"),
        thanks("Obrigado", "Registro recebido", "O time de parcerias retorna pelo painel."),
      ),
  },
  {
    id: "fjord",
    name: "Fjord",
    tagline: "Scandinavian Design: luz, madeira clara e funcionalidade serena.",
    category: "Scandinavian Design",
    accent: "#0f766e",
    build: () =>
      site(
        { primary: "#0f766e", background: "#f8faf9", font: "DM Sans" },
        landing([
          spacer("md"),
          hero({
            title: "Menos. Melhor. Juntos.",
            subtitle: "Design nórdico para marcas de bem-estar e produto consciente — espaço em branco, tipografia calma, CTA gentil.",
            background: "#ecfdf5",
            tone: "dark",
            align: "center",
            cta: "Candidatar-me",
          }),
          features(
            "Hygge da parceria",
            [
              ["Ritmo humano", "Prazos que respeitam criação real."],
              ["Produto consciente", "Teste antes de falar."],
              ["Comunidade quieta", "Troca sem barulho desnecessário."],
            ],
            { background: "#ffffff", color: "#134e4a", border: "#99f6e4" },
          ),
          stats([
            ["lagom", "equilíbrio"],
            ["+190", "creators"],
            ["100%", "produto"],
          ]),
          testimonial(
            "A página respirava. A parceria também.",
            "Freja Lind",
            "Slow living · 54 mil",
          ),
          faq("Perguntas", [
            ["Serve para tech?", "Melhor para lifestyle, casa e bem-estar."],
            ["É pago?", "Produto + cachê ou comissão."],
          ]),
          button("Candidatar-me", { kind: "form" }),
          spacer("md"),
        ]),
        formPage(),
        thanks("Obrigado", "Recebemos você", "Retorno com calma pela plataforma."),
      ),
  },
  {
    id: "bloom",
    name: "Bloom",
    tagline: "Organic Design: curvas naturais, verde vivo e textura viva.",
    category: "Organic Design",
    accent: "#16a34a",
    build: () =>
      site(
        { primary: "#16a34a", background: "#f0fdf4", font: "Nunito" },
        landing([
          hero({
            title: "Cresça com a marca",
            subtitle: "Formas orgânicas para marcas naturais e sustentabilidade — a candidatura parece um jardim, não um funil.",
            background: "#166534",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1466692476866-aef1dfb1e735${PHOTO}`,
            cta: "Plantar candidatura",
          }),
          marquee(["GROW", "ROOTS", "LEAF", "SOIL", "BLOOM", "CARE"]),
          bento(
            "Nutrientes",
            [
              ["Ingredientes claros", "Brief transparente do começo."],
              ["Ciclo longo", "Parcerias que florescem ao longo do ano."],
              ["Kit físico", "Produto na sua rotina."],
              ["Comunidade", "Creators que falam de cuidado de verdade."],
            ],
            { background: "#ffffff", color: "#14532d", border: "#86efac" },
          ),
          stats([
            ["4 estações", "de campanha"],
            ["0", "greenwashing"],
            ["+260", "creators"],
          ]),
          testimonial(
            "Visual vivo, parceria consistente. Combina com o que eu posto.",
            "Ana Verde",
            "Natureza · 120 mil",
          ),
          faq("Solo", [
            ["Preciso falar de ESG?", "Autenticidade > discurso."],
            ["Como começo?", "Candidatura abaixo."],
          ]),
          button("Plantar candidatura", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Semente plantada", "Acompanhe o crescimento no painel."),
      ),
  },
  {
    id: "boxen",
    name: "Boxen",
    tagline: "Bento Grid: módulos empilháveis, hierarquia e densidade útil.",
    category: "Bento Grid",
    accent: "#2563eb",
    build: () =>
      site(
        { primary: "#2563eb", background: "#ffffff", font: "Inter" },
        landing([
          hero({
            title: "Tudo no seu compartimento",
            subtitle: "Grid bento para marcas que querem mostrar benefícios em blocos — denso, escaneável, moderno.",
            background: "#eff6ff",
            tone: "dark",
            align: "left",
            cta: "Abrir o bento",
          }),
          bento(
            "Módulos da parceria",
            [
              ["Brief em card", "Uma célula. Três entregas."],
              ["Status visível", "Aprovado, pendente, pago."],
              ["Assets oficiais", "Kit na mesma grade."],
              ["Suporte", "Canal direto no painel."],
              ["Ranking", "Quem performa, aparece."],
              ["Pagamento", "Cachê ou comissão."],
            ],
            { background: "#f8fafc", color: "#1e3a8a", border: "#bfdbfe" },
          ),
          stats([
            ["6", "módulos"],
            ["1", "candidatura"],
            ["36h", "SLA"],
          ]),
          faq("Grid", [
            ["Por que bento?", "Você vê tudo sem scroll infinito de texto."],
            ["Mobile?", "Os módulos empilham com elegância."],
          ]),
          button("Abrir o bento", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Módulo enviado", "Status no painel."),
      ),
  },
  {
    id: "timber",
    name: "Timber",
    tagline: "Skeuomorphism: texturas reais, madeira, metal e toque tátil.",
    category: "Skeuomorphism",
    accent: "#a16207",
    build: () =>
      site(
        { primary: "#a16207", background: "#faf6f1", font: "Merriweather" },
        landing([
          hero({
            title: "Parece real porque é",
            subtitle: "Skeuomorphism para produtos físicos e craft — texturas que lembram madeira, couro e papel.",
            background: "#78350f",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1616486338812-3dadae4b4ace${PHOTO}`,
            cta: "Tocar a parceria",
          }),
          features(
            "Materiais da parceria",
            [
              ["Produto na mão", "Você testa antes de criar."],
              ["Brief tátil", "Referências físicas, não só moodboard."],
              ["Entrega artesanal", "Tempo para o acabamento certo."],
            ],
            { background: "#fffbeb", color: "#713f12", border: "#d6b896" },
          ),
          stats([
            ["100%", "físico"],
            ["+140", "creators"],
            ["10 dias", "ciclo"],
          ]),
          testimonial(
            "A landing já tinha textura. O produto acompanhou.",
            "Rafael Souza",
            "Craft · 41 mil",
          ),
          faq("Oficina", [
            ["Serve para digital?", "Melhor para produto físico e lifestyle."],
            ["Frete?", "A marca envia o kit."],
          ]),
          button("Tocar a parceria", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Pedido na bancada", "Retorno no painel."),
      ),
  },
  {
    id: "borealis",
    name: "Borealis",
    tagline: "Aurora UI: gradientes etéreos, brilho noturno e leveza.",
    category: "Aurora UI",
    accent: "#c084fc",
    build: () =>
      site(
        { primary: "#c084fc", background: "#0b0f1a", font: "Sora" },
        landing([
          announcement("Aurora aberta · early creators", "Entrar no brilho", "#8b5cf6", "light"),
          hero({
            title: "Luz que se move",
            subtitle: "Aurora UI para marcas de beleza, wellness e tech suave — gradientes vivos, atmosfera de sonho.",
            background: "#13182a",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809${PHOTO}`,
            cta: "Seguir a aurora",
          }),
          marquee(["AURORA", "GLOW", "SOFT", "NIGHT", "DREAM", "LIGHT"]),
          bento(
            "Camadas de luz",
            [
              ["Kit glow", "Produto e assets com o mesmo brilho."],
              ["Brief etéreo", "Tom de voz suave, sem pressão."],
              ["Drops noturnos", "Campanhas com horário de destaque."],
              ["Comunidade", "Creators de beleza e bem-estar."],
            ],
            { background: "#1a1030", color: "#f5f3ff", border: "#7c3aed" },
          ),
          stats([
            ["∞", "gradientes"],
            ["+320", "creators"],
            ["48h", "resposta"],
          ]),
          testimonial(
            "A página parecia um filtro. A marca manteve a magia.",
            "Yuki Tanaka",
            "Beauty · 280 mil",
          ),
          faq("Céu", [
            ["Só beauty?", "Beauty, wellness e lifestyle soft."],
            ["Como entro?", "Candidatura abaixo."],
          ]),
          button("Seguir a aurora", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Você brilhou na fila", "Avisamos no painel."),
      ),
  },
  {
    id: "noir",
    name: "Noir",
    tagline: "Dark Mode Design: contraste alto, OLED e foco no conteúdo.",
    category: "Dark Mode Design",
    accent: "#a3e635",
    build: () =>
      site(
        { primary: "#a3e635", background: "#09090b", font: "Inter" },
        landing([
          hero({
            title: "Escuro por padrão. Claro no que importa.",
            subtitle: "Dark mode nativo para creators noturnos e marcas digitais — menos cansaço visual, mais destaque no CTA.",
            background: "#18181b",
            tone: "light",
            align: "left",
            cta: "Ativar modo escuro",
          }),
          features(
            "Benefícios em low light",
            [
              ["Contraste AA+", "Legibilidade em qualquer tela."],
              ["Foco no brief", "Sem distrações claras demais."],
              ["Accent neon", "O CTA é o único ponto de luz."],
            ],
            { background: "#27272a", color: "#fafafa", border: "#3f3f46" },
          ),
          stats([
            ["0 lux", "ruído"],
            ["+410", "creators"],
            ["24h", "SLA"],
          ]),
          testimonial(
            "Finalmente uma landing que não me queima os olhos à meia-noite.",
            "Noah Kim",
            "Tech · 198 mil",
          ),
          faq("Night shift", [
            ["Tem versão clara?", "Esta é dark-first de propósito."],
            ["Nicho?", "Tech, games, cultura digital."],
          ]),
          button("Ativar modo escuro", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Sinal recebido", "Retorno no painel."),
      ),
  },
  {
    id: "spectrum",
    name: "Spectrum",
    tagline: "Gradient Design: transições de cor como identidade visual.",
    category: "Gradient Design",
    accent: "#ec4899",
    build: () =>
      site(
        { primary: "#ec4899", background: "#ffffff", font: "Plus Jakarta Sans" },
        landing([
          hero({
            title: "Cor em movimento",
            subtitle: "Gradientes ousados para marcas jovens e campanhas de lançamento — a cor conta a história antes do texto.",
            background: "#fdf2f8",
            tone: "dark",
            align: "center",
            image: `https://images.unsplash.com/photo-1579546929662-711aa81148cf${PHOTO}`,
            cta: "Entrar no espectro",
          }),
          marquee(["PINK", "VIOLET", "ORANGE", "CYAN", "BLEND", "POP"]),
          features(
            "Faixas da parceria",
            [
              ["Paleta oficial", "Gradientes prontos para Stories e Reels."],
              ["Brief colorido", "Tom de voz alinhado à identidade."],
              ["CTA saturado", "Impossível não ver o botão."],
            ],
            { background: "#fdf4ff", color: "#86198f", border: "#f0abfc" },
          ),
          stats([
            ["360°", "cor"],
            ["+550", "creators"],
            ["R$ 0", "inscrição"],
          ]),
          testimonial(
            "Meu feed já era gradiente. A landing falou a mesma língua.",
            "Camila Rocha",
            "Lifestyle · 340 mil",
          ),
          faq("Blend", [
            ["Serve para B2B?", "Melhor para consumer e lifestyle."],
            ["Tem cachê?", "Sim."],
          ]),
          button("Entrar no espectro", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Cor registrada", "Aguarde no painel."),
      ),
  },
  {
    id: "pulse",
    name: "Pulse",
    tagline: "Motion Design: ritmo, timing e hierarquia animada.",
    category: "Motion Design",
    accent: "#f43f5e",
    build: () =>
      site(
        { primary: "#f43f5e", background: "#0c0a09", font: "Space Grotesk" },
        landing([
          announcement("Beat aberto · creators em movimento", "Entrar no pulse", "#f43f5e", "light"),
          hero({
            title: "A página que marca o tempo",
            subtitle: "Motion-first para marcas de entretenimento e esportes — ritmo visual, CTAs em sincronia.",
            background: "#1c1917",
            tone: "light",
            align: "center",
            cta: "Sincronizar",
          }),
          steps("Timeline", [
            ["Cue", "Inscrição rápida."],
            ["Beat", "Alinhamento de brief."],
            ["Drop", "Publicação no pico."],
            ["Encore", "Renovações da temporada."],
          ]),
          stats([
            ["60fps", "energia"],
            ["+700", "creators"],
            ["12h", "review em campanha"],
          ]),
          testimonial(
            "A landing já batia o ritmo. A campanha veio no tempo certo.",
            "Leo Santos",
            "Esporte · 450 mil",
          ),
          faq("BPM", [
            ["Preciso editar vídeo?", "Ajuda, mas foto + caption também rola."],
            ["Como recebo?", "Cachê por entrega."],
          ]),
          button("Sincronizar", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "No beat", "Retorno no painel."),
      ),
  },
  {
    id: "slim",
    name: "Slim",
    tagline: "Responsive Minimalism: mobile-first, uma coluna, zero excesso.",
    category: "Responsive Minimalism",
    accent: "#334155",
    build: () =>
      site(
        { primary: "#334155", background: "#ffffff", font: "Inter" },
        landing([
          spacer("lg"),
          heading("Cabe no bolso. Cabe no feed.", "center", "lg"),
          paragraph(
            "Minimalismo responsivo: uma coluna, tipografia legível, botão sempre ao alcance do polegar.",
            "center",
          ),
          spacer("sm"),
          button("Começar no celular", { kind: "form" }),
          spacer("md"),
          stats([
            ["1", "coluna"],
            ["3", "passos"],
            ["0", "ruído"],
          ]),
          steps("No polegar", [
            ["Abra", "Página leve, carrega rápido."],
            ["Preencha", "Campos essenciais só."],
            ["Envie", "Pronto. Sem desktop obrigatório."],
          ]),
          faq("Mobile", [
            ["Funciona offline?", "Não — mas é leve o suficiente para 4G."],
            ["Posso editar?", "Sim, no painel."],
          ]),
          button("Começar no celular", { kind: "form" }),
          spacer("lg"),
        ]),
        formPage(),
        thanks("Obrigado", "Enviado", "Status no app/painel."),
      ),
  },
  {
    id: "linea",
    name: "Linea",
    tagline: "Modern Minimalism: linhas finas, neutros e precisão contemporânea.",
    category: "Modern Minimalism",
    accent: "#18181b",
    build: () =>
      site(
        { primary: "#18181b", background: "#fafafa", font: "Manrope" },
        landing([
          spacer("md"),
          hero({
            title: "Linha limpa. Decisão rápida.",
            subtitle: "Minimalismo moderno para marcas de produto e SaaS — tipografia precisa, neutros, um único acento.",
            background: "#f4f4f5",
            tone: "dark",
            align: "left",
            cta: "Aplicar",
          }),
          features(
            "Essenciais",
            [
              ["Hierarquia óbvia", "Título, texto, botão. Fim."],
              ["Neutros quentes", "Cinza que não cansa."],
              ["Acento único", "O CTA é o único ponto de cor."],
            ],
            { background: "#ffffff", color: "#18181b", border: "#e4e4e7" },
          ),
          stats([
            ["−80%", "ruído visual"],
            ["+1.1k", "creators"],
            ["24h", "SLA"],
          ]),
          testimonial(
            "Sem firula. Li, entendi, apliquei.",
            "Priya Shah",
            "Product · 67 mil",
          ),
          faq("Linha", [
            ["É frio demais?", "É preciso — o tom do brief humaniza."],
            ["Nicho?", "Produto, SaaS, design."],
          ]),
          button("Aplicar", { kind: "form" }),
          spacer("md"),
        ]),
        formPage(),
        thanks("Obrigado", "Recebido", "Retorno no painel."),
      ),
  },
  {
    id: "serif",
    name: "Serif",
    tagline: "Typography-driven Design: a letra como herói da página.",
    category: "Typography-driven Design",
    accent: "#7c2d12",
    build: () =>
      site(
        { primary: "#7c2d12", background: "#fffbeb", font: "Fraunces" },
        landing([
          spacer("lg"),
          heading("A tipografia é a marca.", "left", "lg"),
          paragraph(
            "Design tipográfico: pouco imagem, muita voz. Para marcas editoriais, culturais e de conteúdo.",
            "left",
          ),
          spacer("sm"),
          button("Compor candidatura", { kind: "form" }, "solid", "left"),
          spacer("md"),
          divider(),
          features(
            "Glyphs da parceria",
            [
              ["Voz consistente", "Tom de texto alinhado à marca."],
              ["Hierarquia tipográfica", "H1, lead, corpo — sem competir com foto."],
              ["Crédito de autor", "Seu nome em destaque tipográfico."],
            ],
            { background: "#ffffff", color: "#7c2d12", border: "#fcd34d" },
          ),
          stats([
            ["72pt", "atitude"],
            ["+95", "creators"],
            ["5 dias", "ciclo"],
          ]),
          testimonial(
            "Finalmente uma landing que trata texto como design.",
            "Elena Vargas",
            "Escrita · 38 mil",
          ),
          faq("Kerning", [
            ["Preciso ser escritor?", "Ajuda gostar de texto. Não exige livro publicado."],
            ["Imagens?", "Opcional — a letra lidera."],
          ]),
          button("Compor candidatura", { kind: "form" }),
          spacer("md"),
        ]),
        formPage(),
        thanks("Obrigado", "Texto recebido", "A marca lê e responde."),
      ),
  },
  {
    id: "lattice",
    name: "Lattice",
    tagline: "Geometric Design: círculos, grades e precisão matemática.",
    category: "Geometric Design",
    accent: "#4f46e5",
    build: () =>
      site(
        { primary: "#4f46e5", background: "#eef2ff", font: "Outfit" },
        landing([
          hero({
            title: "Forma. Função. Grade.",
            subtitle: "Geometria pura para marcas de design e educação — módulos alinhados, ritmo previsível.",
            background: "#312e81",
            tone: "light",
            align: "center",
            cta: "Encaixar na grade",
          }),
          bento(
            "Módulos",
            [
              ["Grid 12", "Layout que escala do mobile ao desktop."],
              ["Ícones geométricos", "Linguagem visual consistente."],
              ["Brief modular", "Blocos reutilizáveis por campanha."],
              ["Métricas", "Números no mesmo sistema visual."],
            ],
            { background: "#ffffff", color: "#312e81", border: "#a5b4fc" },
          ),
          stats([
            ["90°", "precisão"],
            ["+210", "creators"],
            ["48h", "SLA"],
          ]),
          faq("Régua", [
            ["É rígido?", "A grade é firme; o tom do conteúdo é seu."],
            ["Nicho?", "Design, educação, produto."],
          ]),
          button("Encaixar na grade", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Na grade", "Retorno no painel."),
      ),
  },
  {
    id: "drift",
    name: "Drift",
    tagline: "Abstract Design: formas livres, arte e interpretação aberta.",
    category: "Abstract Design",
    accent: "#8b5cf6",
    build: () =>
      site(
        { primary: "#8b5cf6", background: "#0f0a1a", font: "Syne" },
        landing([
          hero({
            title: "Sem literalidade. Com presença.",
            subtitle: "Abstrato para marcas culturais e criativas — a página é uma instalação, a candidatura é o ingresso.",
            background: "#1a1028",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1541701494587-cb58502866ab${PHOTO}`,
            cta: "Entrar na peça",
          }),
          gallery([
            [`https://images.unsplash.com/photo-1541961017774-22349e4a1262${PHOTO}`, "Form"],
            [`https://images.unsplash.com/photo-1550684848-fac1c5b4e853${PHOTO}`, "Color"],
            [`https://images.unsplash.com/photo-1579546929518-9e396f3cc809${PHOTO}`, "Flow"],
          ]),
          features(
            "Sala da parceria",
            [
              ["Liberdade criativa", "Brief aberto, entrega autoral."],
              ["Curadoria", "Seleção por afinidade estética."],
              ["Exposição", "Destaque na vitrine da marca."],
            ],
            { background: "#1e1433", color: "#ede9fe", border: "#7c3aed" },
          ),
          testimonial(
            "Parecia uma galeria. A parceria respeitou meu olhar.",
            "Milo Arts",
            "Arte · 72 mil",
          ),
          faq("Sala", [
            ["Preciso ser artista?", "Creators com voz visual forte."],
            ["Pago?", "Cachê + crédito."],
          ]),
          button("Entrar na peça", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Ingresso reservado", "Curadoria responde no painel."),
      ),
  },
  {
    id: "dynamic",
    name: "Dynamic",
    tagline: "Material You: cor dinâmica, superfícies tonais e personalização.",
    category: "Material You",
    accent: "#6750a4",
    build: () =>
      site(
        { primary: "#6750a4", background: "#fffbfe", font: "Roboto" },
        landing([
          announcement("Tema dinâmico · vagas abertas", "Personalizar entrada", "#6750a4", "light"),
          hero({
            title: "A cor acompanha você",
            subtitle: "Material You para marcas mobile-first: tons derivados da identidade, cards suaves, fluxo familiar.",
            background: "#eaddff",
            tone: "dark",
            align: "left",
            cta: "Começar",
          }),
          features(
            "Tonalidades",
            [
              ["Primary container", "CTA sempre legível."],
              ["Surface tones", "Cards com hierarquia suave."],
              ["Expressive", "Personalidade sem caos."],
            ],
            { background: "#f6edff", color: "#4a4458", border: "#e8def8" },
          ),
          steps("Fluxo You", [
            ["Inscreva", "Dados essenciais."],
            ["Combine", "Brief e valor."],
            ["Publique", "No seu estilo."],
          ]),
          stats([
            ["M3", "linguagem"],
            ["+380", "creators"],
            ["24h", "SLA"],
          ]),
          faq("Tema", [
            ["É o mesmo Material Design?", "É a evolução tonal — mais pessoal."],
            ["Mobile?", "Pensado para polegar e OLED."],
          ]),
          button("Começar", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Tema aplicado", "Acompanhe no painel."),
      ),
  },
  {
    id: "chrome",
    name: "Chrome",
    tagline: "Y2K Design: metal líquido, cyber-cute e nostalgia 2000.",
    category: "Y2K Design",
    accent: "#e879f9",
    build: () =>
      site(
        { primary: "#e879f9", background: "#0a0a0f", font: "Audiowide" },
        landing([
          announcement("Y2K DROP · LIMITED SLOTS", "ENTER ★", "#e879f9", "light"),
          hero({
            title: "chrome dreams · future past",
            subtitle: "Y2K para moda, beleza e cultura digital — prata, rosa e tipografia que pisca no feed.",
            background: "#151521",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1620641788421-7a1c342ea42e${PHOTO}`,
            cta: "jack in ★",
          }),
          marquee(["★ Y2K", "CHROME", "STAR", "2000", "GLOSS", "★"]),
          bento(
            "kit 2000",
            [
              ["gloss assets", "stickers e overlays oficiais."],
              ["brief cute", "tom leve, entrega ousada."],
              ["drop list", "acesso antecipado."],
              ["spotlight", "destaque na comunidade."],
            ],
            { background: "#1c1c2a", color: "#fce7f3", border: "#e879f9" },
          ),
          stats([
            ["2000", "era"],
            ["+600", "creators"],
            ["48h", "reply"],
          ]),
          testimonial(
            "minha estética já era y2k. a marca entendeu na hora.",
            "starlex",
            "fashion · 390 mil",
          ),
          faq("faq ★", [
            ["só gen z?", "quem vibra com nostalgia digital."],
            ["cachê?", "sim."],
          ]),
          button("jack in ★", { kind: "form" }),
        ]),
        formPage("★ candidatura"),
        thanks("★", "you're in the queue", "check the panel."),
      ),
  },
  {
    id: "gatsby",
    name: "Gatsby",
    tagline: "Art Deco: geometria dourada, glamour e simetria dos anos 20.",
    category: "Art Deco",
    accent: "#ca8a04",
    build: () =>
      site(
        { primary: "#ca8a04", background: "#0c0a09", font: "Cinzel" },
        landing([
          announcement("Soirée de creators · RSVP", "Confirmar presença", "#ca8a04", "light"),
          hero({
            title: "Glamour com estrutura",
            subtitle: "Art Deco para marcas de luxo e hospitalidade — fanais geométricos, ouro e tipografia cerimonial.",
            background: "#1c1917",
            tone: "light",
            align: "center",
            cta: "RSVP",
          }),
          features(
            "Salão da parceria",
            [
              ["Convite exclusivo", "Lista curada."],
              ["Brief cerimonial", "Detalhe e etiqueta."],
              ["Cachê de gala", "Valores premium."],
            ],
            { background: "#1c1917", color: "#fef9c3", border: "#a16207" },
          ),
          stats([
            ["1925", "esprit"],
            ["24", "vagas"],
            ["5★", "serviço"],
          ]),
          testimonial(
            "A página era um convite de gala. A campanha manteve o nível.",
            "Victoire Dubois",
            "Luxury · 110 mil",
          ),
          faq("Salão", [
            ["Dress code?", "Estética alinhada ao posicionamento da marca."],
            ["Como entro?", "RSVP abaixo."],
          ]),
          button("RSVP", { kind: "form" }),
        ]),
        formPage("RSVP"),
        thanks("Merci", "Presença anotada", "Confirmação pelo painel."),
      ),
  },
  {
    id: "werk",
    name: "Werk",
    tagline: "Bauhaus: forma segue função, primárias e tipografia geométrica.",
    category: "Bauhaus",
    accent: "#dc2626",
    build: () =>
      site(
        { primary: "#dc2626", background: "#ffffff", font: "Archivo" },
        landing([
          announcement("FORM FOLLOWS FUNCTION", "APPLY", "#dc2626", "light"),
          hero({
            title: "Círculo. Quadrado. Triângulo. Parceria.",
            subtitle: "Bauhaus para marcas de design e educação — primárias, geometria e zero ornamento inútil.",
            background: "#fafafa",
            tone: "dark",
            align: "left",
            cta: "Aplicar",
          }),
          features(
            "Princípios",
            [
              ["Função primeiro", "Brief objetivo. Entrega clara."],
              ["Primárias", "Vermelho, azul, amarelo — sem pastel."],
              ["Tipografia geométrica", "Legível a qualquer distância."],
            ],
            { background: "#fef2f2", color: "#18181b", border: "#18181b" },
          ),
          stats([
            ["1919", "escola"],
            ["3", "formas"],
            ["48h", "SLA"],
          ]),
          testimonial(
            "Visual de oficina. Processo igualmente limpo.",
            "Jonas Keller",
            "Design · 84 mil",
          ),
          faq("Ateliê", [
            ["É rígido?", "É disciplinado — o conteúdo é seu."],
            ["Nicho?", "Design, arquitetura, educação."],
          ]),
          button("Aplicar", { kind: "form" }),
        ]),
        formPage(),
        thanks("Danke", "Bewerbung erhalten", "Retorno no painel."),
      ),
  },
  {
    id: "pop",
    name: "Pop",
    tagline: "Pop Art: Ben-Day, contraste e cultura de massa com ironia.",
    category: "Pop Art",
    accent: "#ef4444",
    build: () =>
      site(
        { primary: "#ef4444", background: "#fefce8", font: "Bangers" },
        landing([
          announcement("WOW · VAGAS ABERTAS", "QUERO!", "#ef4444", "light"),
          hero({
            title: "POW! Sua candidatura em destaque",
            subtitle: "Pop Art para campanhas barulhentas — onomatopeias, cores chapadas e um CTA que grita.",
            background: "#fef08a",
            tone: "dark",
            align: "center",
            cta: "BANG → candidatar",
          }),
          marquee(["WOW", "POW", "POP", "YES", "NOW", "BAM"]),
          bento(
            "Quadrinhos da parceria",
            [
              ["Brief curto", "Uma vinheta. Três balões."],
              ["Cor chapada", "Assets prontos para Stories."],
              ["Tom irônico", "Sem corporativês."],
              ["CTA óbvio", "Impossível perder."],
            ],
            { background: "#ffffff", color: "#18181b", border: "#18181b" },
          ),
          stats([
            ["!!!", "energia"],
            ["+480", "creators"],
            ["24h", "resposta"],
          ]),
          testimonial(
            "A landing já era um quadrinho. A campanha virou hit.",
            "Comic Bea",
            "Humor · 610 mil",
          ),
          faq("Balão", [
            ["Só humor?", "Humor, moda e cultura pop."],
            ["Pago?", "Sim."],
          ]),
          button("BANG → candidatar", { kind: "form" }),
        ]),
        formPage(),
        thanks("WOW", "Recebido!", "Painel te avisa."),
      ),
  },
  {
    id: "excess",
    name: "Excess",
    tagline: "Maximalism: mais é mais — camadas, padrão e personalidade.",
    category: "Maximalism",
    accent: "#db2777",
    build: () =>
      site(
        { primary: "#db2777", background: "#4c0519", font: "Pacifico" },
        landing([
          announcement("Mais cor. Mais texto. Mais você.", "Entrar no excesso", "#db2777", "light"),
          hero({
            title: "Não cabe no minimalismo? Perfeito.",
            subtitle: "Maximalismo para creators expressivos — padrões, tipografia ornamentada e zero medo de exagerar.",
            background: "#831843",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1550684848-86a5d8727436${PHOTO}`,
            cta: "Quero tudo",
          }),
          marquee(["MORE", "MORE", "PATTERN", "COLOR", "VOICE", "MORE"]),
          features(
            "Camadas",
            [
              ["Liberdade total", "Seu estilo sem filtro de marca."],
              ["Assets ricos", "Texturas, stickers, overlays."],
              ["Campanhas densas", "Várias entregas, várias faces."],
            ],
            { background: "#9d174d", color: "#fce7f3", border: "#f9a8d4" },
          ),
          stats([
            ["10×", "personalidade"],
            ["+270", "creators"],
            ["72h", "SLA"],
          ]),
          testimonial(
            "Finalmente uma marca que não me pede para ‘simplificar’.",
            "Maxine Bloom",
            "Fashion · 230 mil",
          ),
          faq("Mais", [
            ["É caótico?", "É abundante — com brief claro por baixo."],
            ["Nicho?", "Moda, beleza, lifestyle expressivo."],
          ]),
          button("Quero tudo", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Excesso registrado", "Retorno no painel."),
      ),
  },
  {
    id: "revival",
    name: "Revival",
    tagline: "Memphis Revival: o Memphis dos 80 com energia de agora.",
    category: "Memphis Revival",
    accent: "#06b6d4",
    build: () =>
      site(
        { primary: "#06b6d4", background: "#fdf4ff", font: "Rubik" },
        landing([
          hero({
            title: "Memphis de novo. Sem nostalgia vazia.",
            subtitle: "Revival contemporâneo: formas ousadas, tipografia atual e uma candidatura que diverte.",
            background: "#fae8ff",
            tone: "dark",
            align: "left",
            cta: "Revivir",
          }),
          marquee(["SQUIGGLE 2.0", "DOT", "WAVE", "NOW", "FUN", "REVIVAL"]),
          bento(
            "Remix",
            [
              ["Paleta atualizada", "Ciano, magenta, limão."],
              ["Formas com propósito", "Ornamento que guia o olho."],
              ["Tom Gen Z", "Leve, direto, sem ironia barata."],
              ["CTA firme", "Um clique. Sem labirinto."],
            ],
            { background: "#ffffff", color: "#701a75", border: "#e879f9" },
          ),
          stats([
            ["80s×26", "remix"],
            ["+350", "creators"],
            ["36h", "SLA"],
          ]),
          testimonial(
            "Memphis sem parecer fantasia. A campanha veio fresca.",
            "Ira Costa",
            "Design · 156 mil",
          ),
          faq("Remix", [
            ["Diferença do Memphis clássico?", "Mesma irreverência, tipografia e UX de agora."],
            ["Pago?", "Sim."],
          ]),
          button("Revivir", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Revival iniciado", "Painel te atualiza."),
      ),
  },
  {
    id: "softclay",
    name: "Softclay",
    tagline: "Claymorphism: volume fofo, pastéis e UI que parece modelada.",
    category: "Claymorphism",
    accent: "#f472b6",
    build: () =>
      site(
        { primary: "#f472b6", background: "#fdf2f8", font: "Quicksand" },
        landing([
          hero({
            title: "Macio por fora. Claro por dentro.",
            subtitle: "Claymorphism para apps e marcas kids/wellness — botões inchados, sombras suaves, tom amigável.",
            background: "#fce7f3",
            tone: "dark",
            align: "center",
            cta: "Amassar candidatura",
          }),
          features(
            "Textura da parceria",
            [
              ["Tom acolhedor", "Brief sem pressão."],
              ["Kit fofo", "Produto + stickers."],
              ["Comunidade leve", "Creators de lifestyle suave."],
            ],
            { background: "#ffffff", color: "#9d174d", border: "#fbcfe8" },
          ),
          stats([
            ["100%", "suave"],
            ["+200", "creators"],
            ["5 dias", "ciclo"],
          ]),
          testimonial(
            "A UI parecia brinquedo. A marca era séria no cuidado.",
            "Pippa Lane",
            "Kids/Family · 89 mil",
          ),
          faq("Argila", [
            ["É o mesmo que neumorphism?", "Não — mais cor, mais volume ‘clay’."],
            ["Nicho?", "Kids, wellness, lifestyle."],
          ]),
          button("Amassar candidatura", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Na forja suave", "Retorno no painel."),
      ),
  },
  {
    id: "pixel",
    name: "Pixel",
    tagline: "Pixel Art Design: 8-bit, nostalgia gamer e precisão em blocos.",
    category: "Pixel Art Design",
    accent: "#22c55e",
    build: () =>
      site(
        { primary: "#22c55e", background: "#052e16", font: "Press Start 2P" },
        landing([
          announcement("INSERT COIN · OPEN SLOTS", "START", "#22c55e", "light"),
          hero({
            title: "LEVEL UP SUA PARCERIA",
            subtitle: "Pixel art para games e cultura geek — blocos, high score e um CTA de continue screen.",
            background: "#14532d",
            tone: "light",
            align: "center",
            cta: "PRESS START",
          }),
          marquee(["8-BIT", "HP", "XP", "COMBO", "DROP", "GG"]),
          steps("QUEST", [
            ["SELECT", "Envie perfil e canal."],
            ["LOAD", "Brief e datas."],
            ["BOSS", "Publique e entregue."],
            ["CLEAR", "Cachê liberado."],
          ]),
          stats([
            ["255", "energia"],
            ["+900", "players"],
            ["24h", "respawn"],
          ]),
          testimonial(
            "Landing de arcade. Campanha de true ending.",
            "PixelPete",
            "Games · 520 mil",
          ),
          faq("CONTINUE?", [
            ["Só games?", "Games, tech e cultura nerd."],
            ["Pago em XP?", "Em Pix. Ou cripto."],
          ]),
          button("PRESS START", { kind: "form" }),
        ]),
        formPage("SAVE FILE"),
        thanks("GG", "DATA SAVED", "Check the panel."),
      ),
  },
  {
    id: "sketch",
    name: "Sketch",
    tagline: "Hand-drawn Design: traço humano, imperfeição e calor.",
    category: "Hand-drawn Design",
    accent: "#ea580c",
    build: () =>
      site(
        { primary: "#ea580c", background: "#fff7ed", font: "Caveat" },
        landing([
          spacer("md"),
          heading("Feito à mão. Como o bom conteúdo.", "left", "lg"),
          paragraph(
            "Visual hand-drawn para marcas artesanais e educacionais — tipografia que parece escrita, traços que respiram.",
            "left",
          ),
          spacer("sm"),
          button("Rabiscar candidatura", { kind: "form" }, "solid", "left"),
          spacer("md"),
          features(
            "No caderno",
            [
              ["Tom humano", "Textos sem corporativês."],
              ["Referências reais", "Moodboard com sketch e foto."],
              ["Ritmo artesanal", "Prazos que cabem no processo criativo."],
            ],
            { background: "#ffffff", color: "#9a3412", border: "#fdba74" },
          ),
          stats([
            ["1", "caderno"],
            ["+130", "creators"],
            ["7 dias", "ciclo"],
          ]),
          testimonial(
            "A página parecia meu sketchbook. Combinou comigo.",
            "Lia Drawn",
            "Ilustração · 47 mil",
          ),
          faq("Lápis", [
            ["Preciso desenhar?", "Não. Precisa de autenticidade."],
            ["Nicho?", "Craft, educação, lifestyle."],
          ]),
          button("Rabiscar candidatura", { kind: "form" }),
          spacer("md"),
        ]),
        formPage(),
        thanks("Obrigado", "No caderno", "Retorno no painel."),
      ),
  },
  {
    id: "shout",
    name: "Shout",
    tagline: "Brutalist Typography: letras gigantes, contraste e impacto.",
    category: "Brutalist Typography",
    accent: "#fafafa",
    build: () =>
      site(
        { primary: "#fafafa", background: "#000000", font: "Anton" },
        landing([
          hero({
            title: "LEIA ISTO.",
            subtitle: "Tipografia brutalista: a letra é o layout. Para marcas com opinião e creators com voz alta.",
            background: "#000000",
            tone: "light",
            align: "left",
            cta: "ENVIAR",
          }),
          marquee(["BIG TYPE", "NO IMAGE", "LOUD", "CLEAR", "NOW", "TYPE"]),
          features(
            "REGRAS",
            [
              ["TIPO GRANDE", "Hierarquia sem decoração."],
              ["POUCO TEXTO", "Uma ideia por bloco."],
              ["CTA ÚNICO", "Sem distração."],
            ],
            { background: "#18181b", color: "#fafafa", border: "#fafafa" },
          ),
          stats([
            ["120pt", "voz"],
            ["1", "botão"],
            ["12h", "SLA"],
          ]),
          testimonial(
            "A página gritava. A marca manteve a honestidade.",
            "Hard Type",
            "Opinião · 275 mil",
          ),
          faq("CAPS", [
            ["É agressivo?", "É direto."],
            ["Serve pra mim?", "Se você tem posição, sim."],
          ]),
          button("ENVIAR", { kind: "form" }),
        ]),
        formPage("ENVIO"),
        thanks("OK", "RECEBIDO", "PAINEL."),
      ),
  },
  {
    id: "raygun",
    name: "Raygun",
    tagline: "Retro-futurism: foguetes de revista pulp e amanhã analógico.",
    category: "Retro-futurism",
    accent: "#f59e0b",
    build: () =>
      site(
        { primary: "#f59e0b", background: "#1c1917", font: "Orbitron" },
        landing([
          announcement("TO THE FUTURE · BOARDING NOW", "LAUNCH", "#f59e0b", "light"),
          hero({
            title: "O futuro que as revistas prometeram",
            subtitle: "Retro-futurismo para tech e cultura — foguetes, raios e tipografia de capa pulp.",
            background: "#292524",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1446776877081-d282a0f896e2${PHOTO}`,
            cta: "Embarcar",
          }),
          marquee(["RAYGUN", "ATOM", "ROCKET", "1955", "TOMORROW", "PULP"]),
          steps("Missão", [
            ["Check-in", "Candidatura."],
            ["Briefing", "Mapa da campanha."],
            ["Launch", "Publicação."],
            ["Orbit", "Renovação."],
          ]),
          stats([
            ["∞", "amanhã"],
            ["+240", "crew"],
            ["48h", "signal"],
          ]),
          testimonial(
            "Visual de capa antiga. Produto de ponta. Combinação perfeita.",
            "Captain Rex",
            "Tech · 188 mil",
          ),
          faq("Hangar", [
            ["Só sci-fi?", "Tech, inovação e cultura geek."],
            ["Pago?", "Sim."],
          ]),
          button("Embarcar", { kind: "form" }),
        ]),
        formPage("Boarding pass"),
        thanks("Copy that", "You're on the manifest", "Panel updates incoming."),
      ),
  },
  {
    id: "forge",
    name: "Forge",
    tagline: "Industrial Design: aço, utilidade e honestidade material.",
    category: "Industrial Design",
    accent: "#78716c",
    build: () =>
      site(
        { primary: "#ea580c", background: "#1c1917", font: "Barlow Condensed" },
        landing([
          hero({
            title: "Construído para durar",
            subtitle: "Industrial para marcas de ferramenta, outdoor e manufatura — metal, tipografia condensada, zero perfume.",
            background: "#292524",
            tone: "light",
            align: "left",
            image: `https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1${PHOTO}`,
            cta: "Entrar na fábrica",
          }),
          features(
            "Linha de montagem",
            [
              ["Brief técnico", "Specs claras."],
              ["Produto real", "Teste em campo."],
              ["Pagamento pontual", "Como a linha: no prazo."],
            ],
            { background: "#44403c", color: "#fafaf9", border: "#a8a29e" },
          ),
          stats([
            ["24/7", "resiliência"],
            ["+160", "creators"],
            ["72h", "SLA"],
          ]),
          testimonial(
            "Página de chão de fábrica. Parceria igualmente direta.",
            "Hugo Stahl",
            "Outdoor · 93 mil",
          ),
          faq("Oficina", [
            ["Nicho?", "Ferramentas, auto, outdoor, manufatura."],
            ["Preciso ser expert?", "Uso real conta mais que diploma."],
          ]),
          button("Entrar na fábrica", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Na linha", "Retorno no painel."),
      ),
  },
  {
    id: "mono",
    name: "Mono",
    tagline: "Monochromatic Design: uma cor, mil tons, máxima coesão.",
    category: "Monochromatic Design",
    accent: "#3b82f6",
    build: () =>
      site(
        { primary: "#3b82f6", background: "#eff6ff", font: "Inter" },
        landing([
          hero({
            title: "Uma família. Todos os tons.",
            subtitle: "Monocromático azul para marcas que querem coesão total — do hero ao botão, a mesma nota.",
            background: "#1d4ed8",
            tone: "light",
            align: "center",
            cta: "Entrar no tom",
          }),
          features(
            "Escala",
            [
              ["50 → 900", "Hierarquia só com luminosidade."],
              ["Zero conflito", "Nenhuma cor competindo."],
              ["CTA óbvio", "O tom mais saturado."],
            ],
            { background: "#dbeafe", color: "#1e3a8a", border: "#93c5fd" },
          ),
          stats([
            ["1", "matiz"],
            ["+300", "creators"],
            ["24h", "SLA"],
          ]),
          testimonial(
            "A coesão visual me deu confiança na marca.",
            "Sam Blue",
            "Product · 77 mil",
          ),
          faq("Escala", [
            ["Só azul?", "Este template é azul; a marca pode trocar o primary."],
            ["Nicho?", "SaaS, fintech, educação."],
          ]),
          button("Entrar no tom", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Tom registrado", "Painel."),
      ),
  },
  {
    id: "mist",
    name: "Mist",
    tagline: "Pastel Design: tons suaves, ar leve e delicadeza.",
    category: "Pastel Design",
    accent: "#f9a8d4",
    build: () =>
      site(
        { primary: "#f9a8d4", background: "#fdf8f6", font: "Nunito" },
        landing([
          hero({
            title: "Suave sem ser frágil",
            subtitle: "Pastéis para beleza, maternidade e wellness — cores que acalmam, CTA que convida.",
            background: "#fce7f3",
            tone: "dark",
            align: "center",
            cta: "Entrar no pastel",
          }),
          marquee(["blush", "lilac", "mint", "cream", "soft", "care"]),
          bento(
            "Camadas suaves",
            [
              ["Tom gentil", "Brief sem pressão."],
              ["Kit delicado", "Produto + embalagem cuidada."],
              ["Comunidade", "Creators de cuidado."],
              ["Prazos humanos", "Sem sprint tóxico."],
            ],
            { background: "#ffffff", color: "#9d174d", border: "#fbcfe8" },
          ),
          stats([
            ["100%", "suave"],
            ["+280", "creators"],
            ["5 dias", "ciclo"],
          ]),
          testimonial(
            "A página era um suspiro. A marca manteve o cuidado.",
            "Mia Pastel",
            "Beauty · 165 mil",
          ),
          faq("Névoa", [
            ["É só estética?", "É tom de voz + visual."],
            ["Pago?", "Produto + cachê."],
          ]),
          button("Entrar no pastel", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Na névoa", "Retorno suave no painel."),
      ),
  },
  {
    id: "wave",
    name: "Wave",
    tagline: "Liquid Design: fluxos, blobs e interfaces que escorrem.",
    category: "Liquid Design",
    accent: "#06b6d4",
    build: () =>
      site(
        { primary: "#06b6d4", background: "#042f2e", font: "Sora" },
        landing([
          hero({
            title: "A interface que flui",
            subtitle: "Liquid Design para marcas digitais fluidas — formas orgânicas, gradientes aquáticos, CTA que flutua.",
            background: "#134e4a",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1557682250-33bd709cbe85${PHOTO}`,
            cta: "Entrar na corrente",
          }),
          marquee(["FLOW", "BLOB", "WAVE", "DRIFT", "FLUID", "DROP"]),
          features(
            "Correntes",
            [
              ["Brief fluido", "Adapta ao seu formato."],
              ["Assets líquidos", "Overlays e loops oficiais."],
              ["Ritmo contínuo", "Campanhas em temporada."],
            ],
            { background: "#115e59", color: "#ccfbf1", border: "#2dd4bf" },
          ),
          stats([
            ["∞", "fluxo"],
            ["+310", "creators"],
            ["36h", "SLA"],
          ]),
          testimonial(
            "Visual que escorria no Stories. Marca no mesmo ritmo.",
            "Aqua Lin",
            "Digital · 142 mil",
          ),
          faq("Maré", [
            ["Nicho?", "Digital, beleza, lifestyle."],
            ["Como começo?", "Candidatura abaixo."],
          ]),
          button("Entrar na corrente", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Na corrente", "Painel."),
      ),
  },
  {
    id: "iridescent",
    name: "Iridescent",
    tagline: "Holographic Design: reflexos, oil-slick e brilho mutante.",
    category: "Holographic Design",
    accent: "#e879f9",
    build: () =>
      site(
        { primary: "#e879f9", background: "#0a0612", font: "Syncopate" },
        landing([
          announcement("HOLO DROP · LIMITED", "REFLETIR", "#a78bfa", "light"),
          hero({
            title: "Brilho que muda com o ângulo",
            subtitle: "Holográfico para beleza e moda — oil-slick, prismas e uma candidatura que parece sticker premium.",
            background: "#150a24",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1558591710-4b4a1ae728f0${PHOTO}`,
            cta: "Capturar o brilho",
          }),
          gallery([
            [`https://images.unsplash.com/photo-1579546929518-9e396f3cc809${PHOTO}`, "Prism"],
            [`https://images.unsplash.com/photo-1618005198919-d00d353bac7f${PHOTO}`, "Slick"],
            [`https://images.unsplash.com/photo-1620641788421-7a1c342ea42e${PHOTO}`, "Chrome"],
          ]),
          bento(
            "Facetas",
            [
              ["Kit holo", "Stickers e overlays oficiais."],
              ["Brief premium", "Tom de exclusividade."],
              ["Drop list", "Acesso antecipado."],
              ["Spotlight", "Destaque na vitrine."],
            ],
            { background: "#1a0f2e", color: "#f5d0fe", border: "#d946ef" },
          ),
          stats([
            ["360°", "brilho"],
            ["+290", "creators"],
            ["48h", "SLA"],
          ]),
          testimonial(
            "Meu conteúdo já era holo. A marca entendeu o ângulo.",
            "Prism Jae",
            "Beauty · 305 mil",
          ),
          faq("Prisma", [
            ["Só beauty?", "Beauty, moda e cultura digital."],
            ["Pago?", "Sim."],
          ]),
          button("Capturar o brilho", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Reflexo capturado", "Painel."),
      ),
  },
  {
    id: "iso",
    name: "Iso",
    tagline: "Isometric Design: perspectiva 2.5D, sistemas e clareza espacial.",
    category: "Isometric Design",
    accent: "#0ea5e9",
    build: () =>
      site(
        { primary: "#0ea5e9", background: "#f0f9ff", font: "Exo 2" },
        landing([
          hero({
            title: "Veja o sistema por cima",
            subtitle: "Isométrico para SaaS e educação — blocos 2.5D que explicam a parceria como um mapa.",
            background: "#e0f2fe",
            tone: "dark",
            align: "left",
            image: `https://images.unsplash.com/photo-1558655146-9f40138edfeb${PHOTO}`,
            cta: "Mapear candidatura",
          }),
          steps("Planta baixa", [
            ["Base", "Inscrição."],
            ["Estrutura", "Brief e datas."],
            ["Cobertura", "Publicação."],
            ["Vista aérea", "Resultados no painel."],
          ]),
          features(
            "Camadas do mapa",
            [
              ["Visão sistêmica", "Você entende o fluxo inteiro."],
              ["Assets isométricos", "Illustrações oficiais."],
              ["Métricas claras", "Números no mesmo plano."],
            ],
            { background: "#ffffff", color: "#0c4a6e", border: "#7dd3fc" },
          ),
          stats([
            ["30°", "ângulo"],
            ["+220", "creators"],
            ["36h", "SLA"],
          ]),
          faq("Mapa", [
            ["Nicho?", "SaaS, educação, produtividade."],
            ["Como começo?", "Candidatura abaixo."],
          ]),
          button("Mapear candidatura", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "No mapa", "Painel."),
      ),
  },
  {
    id: "flatline",
    name: "Flatline",
    tagline: "Flat 2.0 Design: flat com sombra sutil, ícones e profundidade leve.",
    category: "Flat 2.0 Design",
    accent: "#3b82f6",
    build: () =>
      site(
        { primary: "#3b82f6", background: "#ffffff", font: "Nunito Sans" },
        landing([
          hero({
            title: "Flat, mas com ar",
            subtitle: "Flat 2.0: cores sólidas + sombra suave. Amigável no mobile, profissional no desktop.",
            background: "#dbeafe",
            tone: "dark",
            align: "center",
            cta: "Começar",
          }),
          bento(
            "Camadas leves",
            [
              ["Ícones claros", "Sem textura excessiva."],
              ["Sombra 1dp", "Profundidade sem skeuo."],
              ["CTA sólido", "Cor chapada, ação óbvia."],
              ["Mobile-first", "Cards que empilham bem."],
            ],
            { background: "#eff6ff", color: "#1e3a8a", border: "#bfdbfe" },
          ),
          stats([
            ["2.0", "geração"],
            ["+640", "creators"],
            ["24h", "SLA"],
          ]),
          testimonial(
            "Simples sem parecer pobre. Exatamente o que eu precisava.",
            "Dana Flat",
            "Lifestyle · 112 mil",
          ),
          faq("Camada", [
            ["Diferença do Flat clássico?", "Mesma clareza, um toque de profundidade."],
            ["Pago?", "Sim."],
          ]),
          button("Começar", { kind: "form" }),
        ]),
        formPage(),
        thanks("Obrigado", "Enviado", "Painel."),
      ),
  },
  {
    id: "pane",
    name: "Pane",
    tagline: "Glass UI: painéis translúcidos, blur e hierarquia em camadas.",
    category: "Glass UI",
    accent: "#67e8f9",
    build: () =>
      site(
        { primary: "#67e8f9", background: "#020617", font: "Sora" },
        landing([
          announcement("Glass panels · early access", "Abrir o painel", "#22d3ee", "light"),
          hero({
            title: "Translúcido. Nítido. Premium.",
            subtitle: "Glass UI para marcas digitais premium — painéis foscos, blur e um CTA que flutua sobre a profundidade.",
            background: "#0b1224",
            tone: "light",
            align: "center",
            image: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe${PHOTO}`,
            cta: "Abrir o painel",
          }),
          marquee(["GLASS", "BLUR", "DEPTH", "PANEL", "LIGHT", "UI"]),
          bento(
            "Camadas de vidro",
            [
              ["Painel VIP", "Acesso antecipado."],
              ["Kit visual", "Assets com o mesmo vidro."],
              ["Brief limpo", "Uma superfície. Três ações."],
              ["Suporte", "Canal direto no painel."],
            ],
            { background: "#0f172a", color: "#ecfeff", border: "#22d3ee" },
          ),
          stats([
            ["12px", "blur"],
            ["+400", "creators"],
            ["36h", "SLA"],
          ]),
          testimonial(
            "Vidro fosco, operação cristalina. Raro.",
            "Glass Mira",
            "Tech · 205 mil",
          ),
          faq("Painel", [
            ["É o mesmo Glassmorphism?", "Mesma família — aqui o foco é UI de painéis."],
            ["Nicho?", "Tech, SaaS, premium digital."],
          ]),
          button("Abrir o painel", { kind: "form" }),
        ]),
        formPage("Glass access"),
        thanks("Obrigado", "Painel reservado", "Confirmação na plataforma."),
      ),
  },
]
