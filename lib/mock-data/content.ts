export type ContentStatus = "published" | "draft"

export type ContentCourse = {
  id: string
  organizationId: string
  title: string
  description: string
  status: ContentStatus
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

export const CONTENT_COURSES: ContentCourse[] = [
  {
    id: "course-1",
    organizationId: "org1",
    title: "Como entregar uma campanha",
    description: "O passo a passo para ler o briefing, produzir e publicar sem retrabalho.",
    status: "published",
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
  { id: "folder-1", courseId: "course-1", title: "Antes de gravar", status: "published" },
  { id: "folder-2", courseId: "course-1", title: "Na publicação", status: "published" },
  { id: "folder-3", courseId: "course-2", title: "Tom de voz", status: "draft" },
]

export const CONTENT_PAGES: ContentPage[] = [
  {
    id: "page-1",
    courseId: "course-1",
    folderId: null,
    title: "Comece por aqui",
    body: "Este material é o guia da marca para a campanha. Leia as páginas na ordem e use o briefing da campanha como complemento.\n\nSe algo não estiver claro, pergunte no canal da campanha antes de gravar.",
    status: "published",
  },
  {
    id: "page-2",
    courseId: "course-1",
    folderId: "folder-1",
    title: "Ler o briefing",
    body: "Confira o objetivo, as datas e os obrigatórios do post. O produto, a oferta e o cupom precisam aparecer como a marca pediu.\n\nNão invente preço, prazo ou benefício que não esteja no briefing.",
    status: "published",
  },
  {
    id: "page-3",
    courseId: "course-1",
    folderId: "folder-1",
    title: "O que gravar",
    body: "Mostre o produto em uso, fale o benefício principal e feche com o cupom. Um take curto vale mais do que um roteiro longo.\n\nGrave na vertical quando a rede for Reels, TikTok ou Shorts.",
    status: "published",
  },
  {
    id: "page-4",
    courseId: "course-1",
    folderId: "folder-2",
    title: "Checklist do post",
    body: "Antes de publicar, confira:\n\n• Menção da marca\n• Cupom visível na legenda\n• Link ou direcionamento combinado\n• Data dentro da janela da campanha",
    status: "published",
  },
  {
    id: "page-5",
    courseId: "course-1",
    folderId: "folder-2",
    title: "Depois de publicar",
    body: "Envie o link do post na campanha no mesmo dia. Se a marca pedir ajuste, responda no canal antes de editar a publicação.",
    status: "draft",
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
