export type ContentStatus = "published" | "draft"

export type ContentCourse = {
  id: string
  organizationId: string
  title: string
  description: string
  status: ContentStatus
  cover?: string
}

export type ContentHouseBanner = {
  image: string
  title: string
  subtitle: string
  courseId: string
}

export const CONTENT_HOUSE_BANNERS: Record<string, ContentHouseBanner> = {
  org1: {
    image: "/content/natura/natura-hero.jpg",
    title: "A casa de conteúdos",
    subtitle: "Filmes oficiais, a voz da marca e o jeito de criar com a comunidade.",
    courseId: "course-natura-casa",
  },
}

export type ContentFolder = {
  id: string
  courseId: string
  title: string
  status: ContentStatus
}

export type ContentPage = {
  id: string
  courseId: string
  folderId: string | null
  title: string
  body: string
  status: ContentStatus
}

function film(id: string, title: string) {
  return `<iframe src="https://www.youtube.com/embed/${id}" title="${title}" allowfullscreen></iframe>`
}

export const CONTENT_COURSES: ContentCourse[] = [
  {
    id: "course-natura-casa",
    organizationId: "org1",
    title: "Bem estar bem",
    description: "O começo da casa. Manifesto, voz e o combinado de quem cria com a Natura.",
    status: "published",
    cover: "/content/natura/natura-bem-estar.jpg",
  },
  {
    id: "course-natura-linhas",
    organizationId: "org1",
    title: "Filmes das linhas",
    description: "Filmes oficiais de Ekos, Tododia, Luna, Kaiak e Essencial, e o que cada um ensina.",
    status: "published",
    cover: "/content/natura/natura-linhas.jpg",
  },
  {
    id: "course-natura-oficina",
    organizationId: "org1",
    title: "Oficina do creator",
    description: "Luz, gancho, legenda e o que fica de fora do corte antes de publicar.",
    status: "published",
    cover: "/content/natura/natura-oficina.jpg",
  },
  {
    id: "course-natura-campanhas",
    organizationId: "org1",
    title: "Campanhas no ar",
    description: "O que a comunidade está produzindo agora: Ekos Primavera, Chronos e o refil SOU.",
    status: "published",
    cover: "/content/natura/natura-campanhas.jpg",
  },
  {
    id: "course-2",
    organizationId: "org2",
    title: "Boas práticas nas redes",
    description: "Tom de voz, menções e o que evitar quando a marca aparece no conteúdo.",
    status: "draft",
  },
  {
    id: "course-3",
    organizationId: "org2",
    title: "Cupom e menção na Magazine Luiza",
    description: "Como publicar com o cupom da campanha e marcar a marca do jeito certo.",
    status: "published",
  },
]

export const CONTENT_FOLDERS: ContentFolder[] = [
  { id: "folder-casa-marca", courseId: "course-natura-casa", title: "A marca", status: "published" },
  { id: "folder-casa-comunidade", courseId: "course-natura-casa", title: "Na comunidade", status: "published" },
  { id: "folder-ekos", courseId: "course-natura-linhas", title: "Ekos", status: "published" },
  { id: "folder-tododia", courseId: "course-natura-linhas", title: "Tododia", status: "published" },
  { id: "folder-luna", courseId: "course-natura-linhas", title: "Luna", status: "published" },
  { id: "folder-perfumaria", courseId: "course-natura-linhas", title: "Perfumaria", status: "published" },
  { id: "folder-pele", courseId: "course-natura-linhas", title: "Pele e cabelo", status: "published" },
  { id: "folder-antes", courseId: "course-natura-oficina", title: "Antes de gravar", status: "published" },
  { id: "folder-publicar", courseId: "course-natura-oficina", title: "Na publicação", status: "published" },
  { id: "folder-limites", courseId: "course-natura-oficina", title: "Limites", status: "published" },
  { id: "folder-primavera", courseId: "course-natura-campanhas", title: "Ekos Primavera", status: "published" },
  { id: "folder-chronos", courseId: "course-natura-campanhas", title: "Chronos", status: "published" },
  { id: "folder-sou", courseId: "course-natura-campanhas", title: "SOU", status: "published" },
  { id: "folder-3", courseId: "course-2", title: "Tom de voz", status: "draft" },
]

export const CONTENT_PAGES: ContentPage[] = [
  {
    id: "page-casa-inicio",
    courseId: "course-natura-casa",
    folderId: null,
    title: "Comece por aqui",
    body: `<p>Esta casa é o lugar onde a Natura conversa com quem cria. Os filmes abaixo são do canal oficial da marca. Use como tom, não como roteiro para copiar.</p>
${film("U5Ox5_x-lIE", "O que uma marca de beleza pode fazer pela Amazônia?")}
<p>O filme faz uma pergunta e responde com a floresta de pé. É o espírito da casa: beleza que deixa o mundo maior, não menor.</p>
<h2>O mapa</h2>
<ul>
<li><strong>Bem estar bem</strong> — voz, manifesto e o combinado da comunidade.</li>
<li><strong>Filmes das linhas</strong> — Ekos, Tododia, Luna, Kaiak, Essencial, Chronos e Lumina.</li>
<li><strong>Oficina do creator</strong> — luz, produto, gancho e legenda.</li>
<li><strong>Campanhas no ar</strong> — o que está aberto agora e o que entra em cada entrega.</li>
</ul>
<blockquote>Bem estar bem é a relação da pessoa consigo, com o outro e com a natureza. O produto é a ponte, não o discurso.</blockquote>`,
    status: "published",
  },
  {
    id: "page-casa-sonora",
    courseId: "course-natura-casa",
    folderId: "folder-casa-marca",
    title: "A marca que se ouve",
    body: `<p>A Natura foi até a floresta captar os pulsos elétricos de árvores nativas e transformou isso em melodia. A marca sonora nasce desse gesto: ciência, natureza e afeto no mesmo compasso.</p>
${film("abhuBA4Jf2o", "Marca Sonora Natura")}
<h2>O que levar para o seu conteúdo</h2>
<ul>
<li>Comece pelo sentido. Cheiro, textura, luz, o som do ambiente.</li>
<li>Deixe um segundo de silêncio antes de falar o nome do produto.</li>
<li>Se usar música, prefira algo orgânico. Evite trilha de anúncio genérico.</li>
</ul>
<p>Não precisa explicar a marca sonora no vídeo. Basta que o corte respire do mesmo jeito.</p>`,
    status: "published",
  },
  {
    id: "page-casa-voz",
    courseId: "course-natura-casa",
    folderId: "folder-casa-marca",
    title: "Como a Natura fala",
    body: `<p>A voz é calorosa, genuína e consciente. Perto, como quem indica algo que usa. Sem exagero e sem superlativo vazio.</p>
<h2>Prefira</h2>
<ul>
<li>Verbos de ação e de sensação: passar, sentir, abrir, guardar, repetir.</li>
<li>A origem do ingrediente, quando ela fizer parte da sua história.</li>
<li>O cotidiano. Banho, penteadeira, bolsa, janela, fim de tarde.</li>
</ul>
<h2>Troque</h2>
<ul>
<li>“O melhor do mundo” por o que você sentiu na pele.</li>
<li>“Revolucionário” pelo benefício que está no briefing.</li>
<li>Comparação com outra marca por a sua própria rotina.</li>
</ul>
<blockquote>Fale como você fala com a sua audiência. A marca entra na história, não no lugar dela.</blockquote>
<p>Menção de casa: <strong>@naturabrasil</strong> e <strong>#BemEstarBem</strong>. Cada campanha soma as hashtags do briefing.</p>`,
    status: "published",
  },
  {
    id: "page-casa-mapa",
    courseId: "course-natura-casa",
    folderId: "folder-casa-comunidade",
    title: "O que vive nesta casa",
    body: `<p>A comunidade Natura junta briefing, filme e conversa. Cada peça tem um lugar.</p>
<ul>
<li><strong>Conteúdos</strong> — o que você está lendo. Fica no ar entre uma campanha e outra.</li>
<li><strong>Comunidade</strong> — o feed. Dúvida de prazo, referência de take, resultado de cupom.</li>
<li><strong>Campanhas</strong> — o pedido fechado: datas, entregas, menções e cupom.</li>
<li><strong>Materiais</strong> — foto, logo e arquivo para baixar.</li>
</ul>
<p>Se o briefing e esta casa divergirem, o briefing da campanha vale. Esta casa ensina o jeito. A campanha define o que entra naquela entrega.</p>`,
    status: "published",
  },
  {
    id: "page-casa-combinado",
    courseId: "course-natura-casa",
    folderId: "folder-casa-comunidade",
    title: "O combinado",
    body: `<p>Quem cria com a Natura entra com a própria voz e sai com a história da marca intacta.</p>
<h2>A gente pede</h2>
<ul>
<li>Produto em uso, com luz que não briga com a cor da embalagem.</li>
<li>Uma frase sua sobre a sensação, antes de qualquer dado.</li>
<li>Menção e hashtag do briefing, escritas certo.</li>
<li>O link da publicação no mesmo dia, dentro da campanha.</li>
</ul>
<h2>A gente não pede</h2>
<ul>
<li>Que você finja um resultado que não viveu.</li>
<li>Que copie o filme oficial frame a frame.</li>
<li>Que misture duas linhas no mesmo corte, salvo quando o briefing permitir.</li>
</ul>
<p>Dúvida de prazo, produto ou frase cabe no canal da campanha, antes de gravar.</p>`,
    status: "published",
  },
  {
    id: "page-ekos-tukuma",
    courseId: "course-natura-linhas",
    folderId: "folder-ekos",
    title: "Tukumã, a palmeira que renasce",
    body: `<p>Ekos é a Amazônia na pele e no cabelo. O tukumã é uma palmeira que brota depois do fogo. A linha pega emprestada essa renovação: hidratação, textura e a floresta como origem, não como cenário de fundo.</p>
${film("ph0p2pDW-s8", "Natura Ekos Tukumã")}
<h2>No seu vídeo</h2>
<ul>
<li>Mostre a textura. O dedo no creme, o óleo na palma, a espuma abrindo.</li>
<li>Diga de onde vem o ingrediente se você souber contar em uma frase.</li>
<li>Luz natural, fundo quieto, verde, terra ou branco. Sem filtro que mude a cor do produto.</li>
</ul>
<p>Hashtags da linha: <strong>#NaturaEkos</strong> e <strong>#BelezaAmazônica</strong>, com <strong>@naturabrasil</strong>.</p>`,
    status: "published",
  },
  {
    id: "page-ekos-castanha",
    courseId: "course-natura-linhas",
    folderId: "folder-ekos",
    title: "Castanha, o clássico",
    body: `<p>Castanha é a memória olfativa de muita gente que cresceu com Ekos. O filme é curto e sensorial: o fruto, a pele, o banho. Sirva de referência de ritmo, não de figurino.</p>
${film("sUTadyEuLSY", "Natura Ekos Castanha")}
<p>Se a campanha for de outro ativo, não troque o nome. Murumuru, maracujá, açaí e tukumã não são sinônimos. Fale o que está na embalagem que você recebeu.</p>
<blockquote>Sensorial e educativo. Cheiro, textura, sensação, e a riqueza da flora brasileira numa frase só.</blockquote>`,
    status: "published",
  },
  {
    id: "page-todo-cereja",
    courseId: "course-natura-linhas",
    folderId: "folder-tododia",
    title: "Antes que o dia termine",
    body: `<p>Tododia é o cuidado que cabe no dia comum. O filme de cereja e avelã não espera o fim de semana: o convite é não se deixar para amanhã.</p>
${film("Hwi4MQzypgQ", "Natura Tododia | Antes que termine o dia - Cereja e Avelã")}
<h2>Como traduzir</h2>
<ul>
<li>Uma cena de rotina real. Saída do banho, bolsa no carro, noite antes de dormir.</li>
<li>O cheiro como personagem. Fale o que a fragrância lembra, sem inventar nota que não está no briefing.</li>
<li>Energia de afeto, não de comercial de televisão.</li>
</ul>`,
    status: "published",
  },
  {
    id: "page-todo-energia",
    courseId: "course-natura-linhas",
    folderId: "folder-tododia",
    title: "Uma dose de energia",
    body: `<p>Capim-limão e hortelã entram como um intervalo no meio do dia. O corte é mais acordado, ainda assim caseiro.</p>
${film("QBj4ZnOoQ_Q", "Natura Tododia | Dose extra de energia na sua rotina")}
<p>Bom formato para Stories em sequência: o produto na pia, o vapor do banho, você já vestida, uma frase. No Reels, segure o frasco perto do rosto nos três primeiros segundos para a fragrância existir mesmo sem cheiro.</p>`,
    status: "published",
  },
  {
    id: "page-todo-corpo",
    courseId: "course-natura-linhas",
    folderId: "folder-tododia",
    title: "De corpo inteiro",
    body: `<p>Tododia se sente na pele, não só no pulso. O filme percorre o corpo com a fragrância como gesto de cuidado, não como pose.</p>
${film("bQG7aMztDnI", "Natura Tododia | Sinta de corpo inteiro com as fragrâncias de Natura Tododia")}
<p>Se for mostrar aplicação, filme o movimento inteiro: tampa, textura, pele. Evite corte picado demais. O ritual é o conteúdo.</p>`,
    status: "published",
  },
  {
    id: "page-luna-coragem",
    courseId: "course-natura-linhas",
    folderId: "folder-luna",
    title: "Vai com coragem",
    body: `<p>Luna Coragem junta histórias reais de mulheres. Consultora, mãe, perfumista, estilista, nadadora. O filme fecha com a frase que dá nome à página e com a assinatura da casa de perfumaria do Brasil.</p>
${film("8yCRqJc6BHk", "Vai com coragem. Luna vai com você.")}
<h2>O que cabe no seu corte</h2>
<ul>
<li>Uma ousadia sua, pequena e verdadeira. Não precisa ser épica.</li>
<li>A fragrância como companhia dessa escolha, não como troféu.</li>
<li>Rosto em luz franca. Luna não pede filtro de pele de porcelana.</li>
</ul>`,
    status: "published",
  },
  {
    id: "page-luna-ousadia",
    courseId: "course-natura-linhas",
    folderId: "folder-luna",
    title: "Ousadia",
    body: `<p>Luna Ousadia, com Taís Araújo, conta a vida em ousadias e não em tempo. O quarto, o álbum, a fragrância no pescoço. É um filme de memória.</p>
${film("39Rtb_3bRHk", "Novo Natura Luna Ousadia")}
<p>Se a sua campanha for Ousadia, abra com uma frase sua nesse espírito. “No meu caminho eu não conto tempo” é da marca. A sua versão precisa ser sua. Não reproduza o texto do filme na íntegra.</p>`,
    status: "published",
  },
  {
    id: "page-kaiak",
    courseId: "course-natura-linhas",
    folderId: "folder-perfumaria",
    title: "Kaiak Sonar",
    body: `<p>Kaiak é frescor com potência. Sonar acrescenta a tecnologia VibraScent: a fragrância como algo que se move, não só como algo que se borrifa.</p>
${film("HaO0cdXVhNQ", "Novo Kaiak Sonar com tecnologia VibraScent")}
<p>No conteúdo, água, movimento e ar livre funcionam melhor do que estúdio fechado. Fale o frescor que você sentiu. Não prometa duração em horas se o briefing não trouxer o número.</p>
<p>A linha também conversa com oceano e consumo consciente. Se for citar, fique no que o briefing autorizar.</p>`,
    status: "published",
  },
  {
    id: "page-essencial",
    courseId: "course-natura-linhas",
    folderId: "folder-perfumaria",
    title: "Essencial Sentir",
    body: `<p>Essencial é a sofisticação quieta da casa. O filme Sentir parte de um encontro inesperado. A frase da marca é curta: sentir muda tudo.</p>
${film("vAIKGe8Arnk", "Sentir muda tudo. Novo Natura Essencial Sentir.")}
<h2>Clima do corte</h2>
<ul>
<li>Menos pressa do que Tododia. Deixe a fragrância chegar.</li>
<li>Roupa e cenário com respiro. Dourado, madeira, linho, pele.</li>
<li>Uma história de dois, ou de você consigo. Sem locução de catálogo.</li>
</ul>`,
    status: "published",
  },
  {
    id: "page-chronos-linha",
    courseId: "course-natura-linhas",
    folderId: "folder-pele",
    title: "Chronos, a pele no tempo",
    body: `<p>Chronos fala com quem cuida da pele em qualquer idade. O conceito que a marca sustentou na campanha contra o etarismo cabe numa frase: a sua melhor pele, em qualquer tempo.</p>
<h2>Como aparecer</h2>
<ul>
<li>Rosto sem filtro que apague textura. A linha existe para a pele real.</li>
<li>Rotina, não milagre. Limpeza, sérum, hidratação, do jeito que você faz.</li>
<li>Idade como número, não como ressalva. Evite “apesar da idade” e “parece mais nova”.</li>
</ul>
<h2>O que não dizer</h2>
<ul>
<li>Promessa médica, prazo de resultado ou comparação com procedimento.</li>
<li>“Rejuvenesce” se o briefing não usar essa palavra.</li>
<li>Antes e depois com luz diferente entre as fotos.</li>
</ul>
<p>Hashtags quando a campanha pedir: <strong>#NaturaChronos</strong> e <strong>#SkincareBrasileiro</strong>.</p>`,
    status: "published",
  },
  {
    id: "page-lumina",
    courseId: "course-natura-linhas",
    folderId: "folder-pele",
    title: "Lumina, o fio com precisão",
    body: `<p>Lumina é a especialista em cabelo da casa. A linha de nutrição de nanoprecisão fala em cuidado que não pesa: shampoo, condicionador, máscara e óleo bifásico.</p>
<h2>O que a marca comunica</h2>
<ul>
<li>Nutrição imediata, sem pesar o fio.</li>
<li>Brilho prolongado, no número que estiver na embalagem ou no briefing.</li>
<li>BioProteína de tripla ação e o ativo nanocorretor, se o briefing pedir o nome técnico.</li>
</ul>
<h2>No vídeo</h2>
<ul>
<li>Cabelo em movimento, não só a embalagem na mão.</li>
<li>O óleo bifásico pede o gesto: agitar, separar as fases, passar nas pontas.</li>
<li>Luz lateral para o brilho aparecer de verdade. Ring light chapada esconde o resultado.</li>
</ul>
<p>Não invente porcentagem. Se o número não está no material da campanha, fale a sensação.</p>`,
    status: "published",
  },
  {
    id: "page-oficina-ritual",
    courseId: "course-natura-oficina",
    folderId: null,
    title: "O ritual de um conteúdo",
    body: `<p>Um conteúdo Natura cabe em quatro movimentos. Leia o briefing, grave com luz honesta, publique com a menção certa, devolva o link no mesmo dia.</p>
<ol>
<li>Separe o produto, a frase e o obrigatório da campanha.</li>
<li>Grave na janela, com o produto reconhecível nos três primeiros segundos.</li>
<li>Fale uma sensação. Escreva a hashtag. Marque a marca.</li>
<li>Publique dentro da janela e envie o link na campanha.</li>
</ol>
<p>As pastas desta casa detalham cada movimento. O filme de modo de uso da Castanha, em Antes de gravar, mostra o gesto sem pressa.</p>`,
    status: "published",
  },
  {
    id: "page-oficina-luz",
    courseId: "course-natura-oficina",
    folderId: "folder-antes",
    title: "A luz da janela",
    body: `<p>A Natura se vê melhor em luz de dia. A janela segura o verde da embalagem, o dourado do óleo e a pele sem pintar por cima.</p>
<h2>Faça</h2>
<ul>
<li>Filme de frente para a janela, ou a 45 graus, no meio da manhã.</li>
<li>Afaste a ring light. Se precisar de apoio, use uma luz baixa e quente, fora do quadro.</li>
<li>Fundo simples. Planta, madeira, parede clara, tecido cru.</li>
</ul>
<h2>Evite</h2>
<ul>
<li>Filtro que esverdeie ou dessature o produto.</li>
<li>Contra-luz que vire a embalagem numa silhueta.</li>
<li>Flash direto na tampa, que estoura o logo.</li>
</ul>`,
    status: "published",
  },
  {
    id: "page-oficina-produto",
    courseId: "course-natura-oficina",
    folderId: "folder-antes",
    title: "O produto na mão",
    body: `<p>O modo de uso do concentrado de castanha é uma aula curta de gesto. Veja a calma da aplicação e o quanto o produto permanece no quadro.</p>
${film("EWSW_bXFKo4", "Natura Ekos - Concentrado corporal em creme de Castanha | Modo de uso")}
<h2>Para repetir no seu take</h2>
<ul>
<li>Abra o produto em câmera. Tampa, textura, cheiro descrito em voz.</li>
<li>Aplique de verdade. Não encene o gesto no ar.</li>
<li>Deixe o nome da linha legível por pelo menos dois segundos.</li>
<li>Uma linha por vídeo. Ekos não divide o quadro com Luna.</li>
</ul>`,
    status: "published",
  },
  {
    id: "page-oficina-gancho",
    courseId: "course-natura-oficina",
    folderId: "folder-publicar",
    title: "Os três primeiros segundos",
    body: `<p>O começo segura ou perde. Na Natura, o gancho é sensorial, não é grito.</p>
<ul>
<li>Segundo 0: o produto, ou o gesto de passar, já no quadro.</li>
<li>Segundo 1: uma frase sua. “Isso aqui mudou o meu banho” vale mais do que “vem ver esse lançamento”.</li>
<li>Segundo 3: o nome da linha, falado uma vez.</li>
</ul>
<p>Formatos curtos pedem vertical: Reels, TikTok e Shorts. No YouTube longo, os mesmos três segundos abrem o vídeo. O restante pode ser rotina.</p>
<p>Stories repetem o quadro do vídeo principal, com o cupom ou a frase da campanha em texto grande, no mesmo dia.</p>`,
    status: "published",
  },
  {
    id: "page-oficina-legenda",
    courseId: "course-natura-oficina",
    folderId: "folder-publicar",
    title: "Legenda, menção e hashtag",
    body: `<p>A legenda continua a conversa. Não é um release.</p>
<h2>Ordem que funciona</h2>
<ol>
<li>Uma frase sua, a mesma do vídeo ou a seguinte.</li>
<li>O benefício que está no briefing, em linguagem sua.</li>
<li>Menção <strong>@naturabrasil</strong>.</li>
<li>Hashtags obrigatórias da campanha, sem inventar variação.</li>
<li>Cupom e link, se a campanha tiver. Um cupom só, o seu.</li>
</ol>
<p>Exemplo de clima, não de texto para copiar: “Passei o concentrado de castanha ainda com a pele úmida. O cheiro ficou no pulso a tarde inteira. #NaturaEkos #BelezaAmazônica @naturabrasil”.</p>`,
    status: "published",
  },
  {
    id: "page-oficina-limites",
    courseId: "course-natura-oficina",
    folderId: "folder-limites",
    title: "O que fica de fora",
    body: `<p>Estes cortes a marca não aprova, mesmo com boa intenção.</p>
<ul>
<li>Comparar com outra marca de beleza.</li>
<li>Prometer resultado clínico, prazo ou “antes e depois”.</li>
<li>Inventar preço, frete, brinde ou desconto.</li>
<li>Filtro que altere a cor do produto ou apague a pele.</li>
<li>Contexto de tragédia, conflito político ou conteúdo sexual.</li>
<li>Duas linhas da Natura disputando o mesmo vídeo, quando o briefing pede uma.</li>
<li>Trecho integral do filme oficial como se fosse o seu conteúdo.</li>
</ul>
<p>Se a dúvida for de frase, grave sem publicar e pergunte no canal da campanha.</p>`,
    status: "published",
  },
  {
    id: "page-camp-abertas",
    courseId: "course-natura-campanhas",
    folderId: null,
    title: "O que está aberto",
    body: `<p>Três frentes convivem na comunidade. Cada uma tem pasta, briefing e obrigatórios próprios.</p>
<ul>
<li><strong>Ekos Primavera</strong> — no ar até 30 de novembro de 2026. Awareness da coleção, com creators de beleza, lifestyle e bem-estar.</li>
<li><strong>Chronos</strong> — em preparação. Skincare para quem fala com audiência adulta, no Instagram e no YouTube.</li>
<li><strong>SOU</strong> — ciclo encerrado. O refil segue como referência de conteúdo de consciência.</li>
</ul>
<p>Entre numa pasta só quando o convite daquela campanha estiver com você. O tom geral continua o de Bem estar bem.</p>`,
    status: "published",
  },
  {
    id: "page-camp-primavera",
    courseId: "course-natura-campanhas",
    folderId: "folder-primavera",
    title: "O pedido da Primavera",
    body: `<p>A coleção pede autenticidade e Amazônia. O objetivo é apresentar a linha e levar gente até a loja. O creator conta a própria relação com o produto.</p>
${film("ph0p2pDW-s8", "Natura Ekos Tukumã")}
<p>O filme de Tukumã é a referência de clima. A sua peça mostra o produto que você recebeu, na sua casa.</p>
<h2>Entra no conteúdo</h2>
<ul>
<li>Produto em uso, com textura visível.</li>
<li><strong>#NaturaEkos</strong>, <strong>#BelezaAmazônica</strong> e <strong>#NaturaEkos2026</strong>.</li>
<li><strong>@naturabrasil</strong> no Instagram. No TikTok, <strong>@naturaTT</strong>.</li>
<li>O seu cupom, se o convite trouxer um. Só o seu.</li>
</ul>
<h2>Fica de fora</h2>
<ul>
<li>Outra linha da Natura no mesmo corte.</li>
<li>Comparativo com marca internacional.</li>
<li>Prazo de resultado que o briefing não escreveu.</li>
</ul>
<p>Entregas típicas do convite: Reels e Stories, às vezes TikTok. Publique dentro da janela e devolva o link no dia.</p>`,
    status: "published",
  },
  {
    id: "page-camp-chronos",
    courseId: "course-natura-campanhas",
    folderId: "folder-chronos",
    title: "Sua melhor pele",
    body: `<p>Chronos ainda está em preparação. Quando o convite abrir, o pedido é educação e presença, com gente que a audiência adulta já escuta sobre pele.</p>
<h2>O corte</h2>
<ul>
<li>Rotina de verdade: limpeza, tratamento, hidratação.</li>
<li>Rosto com textura. A campanha não usa filtro de pele lisa.</li>
<li>Uma frase sobre o tempo, sem etarismo. Nada de “para a idade”.</li>
</ul>
<h2>Obrigatórios previstos</h2>
<ul>
<li><strong>#NaturaChronos</strong> e <strong>#SkincareBrasileiro</strong>.</li>
<li><strong>@naturabrasil</strong> no Instagram e <strong>@NaturaBrasil</strong> no YouTube.</li>
</ul>
<p>Não publique Chronos enquanto o status estiver em rascunho. Use esta página para alinhar o tom e espere o briefing fechado.</p>`,
    status: "published",
  },
  {
    id: "page-camp-sou",
    courseId: "course-natura-campanhas",
    folderId: "folder-sou",
    title: "O refil na história",
    body: `<p>SOU encerrou o ciclo, e o jeito de contar continua válido para qualquer conteúdo de refil que a marca abrir depois.</p>
<h2>A história</h2>
<ul>
<li>Mostre a troca. Embalagem que fica, refil que entra.</li>
<li>O gesto é o argumento. Não precisa de discurso longo sobre planeta.</li>
<li>Uma frase sua sobre por que repetir o refil cabe melhor do que um dado solto.</li>
</ul>
<h2>O que a campanha pedia</h2>
<ul>
<li><strong>#NaturaSOU</strong>, <strong>#RefilSustentável</strong> e <strong>#ConsciênciaVerde</strong>.</li>
<li><strong>@naturabrasil</strong> e, no YouTube, <strong>@NaturaBrasil</strong>.</li>
<li>Nenhum desconto que não estivesse no briefing.</li>
</ul>
<p>Se a entrega daquela janela ainda estiver sem link na campanha, envie agora. Não publique peça nova em cima de um ciclo encerrado.</p>`,
    status: "published",
  },
  {
    id: "page-6",
    courseId: "course-2",
    folderId: "folder-3",
    title: "Como falar da marca",
    body: "Fale como você fala com a sua audiência. A marca entra na história, não no lugar dela.\n\nEvite superlativo absoluto, comparação com concorrente e promessa de resultado.",
    status: "draft",
  },
  {
    id: "page-7",
    courseId: "course-3",
    folderId: null,
    title: "Onde colocar o cupom",
    body: "O cupom da Magazine Luiza entra na legenda e na fala. Marque @magazineluiza e use o link de rastreio da campanha.",
    status: "published",
  },
]
