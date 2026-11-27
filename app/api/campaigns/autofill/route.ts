import { autofillSystemPrompt, completeCampaignPlan, enrichCompany, sanitizeCompany, sanitizeSuggestion } from "@/lib/campaigns/autofill"
import { readCompanySite } from "@/lib/campaigns/read-website"

export const maxDuration = 60

function parseJson(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced?.[1] ?? content
  return JSON.parse(raw) as unknown
}

export async function POST(request: Request) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    return Response.json({ error: "A chave do OpenRouter não está configurada." }, { status: 500 })
  }
  let body: { website?: string; organizationName?: string; filled?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Não foi possível ler o pedido." }, { status: 400 })
  }
  const website = body.website?.trim() ?? ""
  if (!website) {
    return Response.json({ error: "Informe o site da marca para a IA ler a empresa." }, { status: 400 })
  }
  const source = await readCompanySite(website)
  if (!source) {
    return Response.json({ error: "Não consegui abrir esse site. Confira o endereço e tente de novo." }, { status: 422 })
  }
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini"
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: autofillSystemPrompt() },
        {
          role: "user",
          content: JSON.stringify({
            website: source.url,
            pageTitle: source.title,
            organizationName: body.organizationName ?? "",
            siteText: source.text,
            filled: body.filled ?? {},
          }),
        },
      ],
      response_format: { type: "json_object" },
    }),
  })
  if (!response.ok) {
    return Response.json({ error: "O OpenRouter não respondeu. Tente de novo em instantes." }, { status: 502 })
  }
  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    return Response.json({ error: "A resposta da IA veio vazia." }, { status: 502 })
  }
  try {
    const parsed = parseJson(content) as Record<string, unknown>
    const rawCompany = sanitizeCompany(parsed.company, source.url, source.title) ?? {
      name: source.title,
      summary: source.text.replace(/^Title:.*$/m, "").replace(/\s+/g, " ").trim().slice(0, 500),
      products: [],
      source: source.url,
    }
    const company = enrichCompany(rawCompany, source.url, source.text)
    const draft = completeCampaignPlan(sanitizeSuggestion(parsed), company, source.url, source.text)
    return Response.json({ draft, company })
  } catch {
    return Response.json({ error: "A IA não devolveu um rascunho válido." }, { status: 502 })
  }
}
