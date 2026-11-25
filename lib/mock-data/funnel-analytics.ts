import type { FunnelAnalytics } from "@/lib/mock-data/forms"

// Traffic that never became a row in Respostas. The Casa & Decor sample leads
// illustrate the table; these numbers are the rest of the funnel.
export const FUNNEL_ANALYTICS: FunnelAnalytics[] = [
  {
    formId: "form-casa",
    visitors: 1284,
    responses: 186,
    leads: 142,
    completions: 96,
    score: 78,
    byDevice: [
      { device: "mobile", count: 710 },
      { device: "desktop", count: 420 },
      { device: "tablet", count: 154 },
    ],
    bySource: [
      { source: "instagram", count: 540 },
      { source: "tiktok", count: 310 },
      { source: "youtube", count: 180 },
      { source: "direct", count: 254 },
    ],
    byUtm: [
      { campaign: "casa-nov", count: 620 },
      { campaign: "stories", count: 280 },
      { campaign: "bio", count: 140 },
    ],
    timeline: [
      { date: "2026-11-12", visitors: 70, responses: 9, leads: 7 },
      { date: "2026-11-13", visitors: 64, responses: 8, leads: 6 },
      { date: "2026-11-14", visitors: 88, responses: 12, leads: 9 },
      { date: "2026-11-15", visitors: 91, responses: 11, leads: 8 },
      { date: "2026-11-16", visitors: 76, responses: 10, leads: 8 },
      { date: "2026-11-17", visitors: 102, responses: 16, leads: 12 },
      { date: "2026-11-18", visitors: 110, responses: 18, leads: 14 },
      { date: "2026-11-19", visitors: 84, responses: 12, leads: 9 },
      { date: "2026-11-20", visitors: 96, responses: 15, leads: 11 },
      { date: "2026-11-21", visitors: 108, responses: 17, leads: 13 },
      { date: "2026-11-22", visitors: 120, responses: 19, leads: 15 },
      { date: "2026-11-23", visitors: 98, responses: 14, leads: 11 },
      { date: "2026-11-24", visitors: 92, responses: 13, leads: 10 },
      { date: "2026-11-25", visitors: 85, responses: 12, leads: 9 },
    ],
    funnel: [
      { label: "Visitantes", count: 1284 },
      { pageId: "pg-casa-home", label: "Início", count: 980 },
      { pageId: "pg-casa-form", label: "Formulário", count: 640 },
      { pageId: "pg-casa-match", label: "Match alto", count: 210 },
      { pageId: "pg-casa-thanks", label: "Obrigado", count: 96 },
    ],
  },
]
