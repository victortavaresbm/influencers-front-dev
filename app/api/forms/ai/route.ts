import { sanitizeSite, siteAiSystemPrompt } from "@/lib/forms/site-ai-llm"
import type { ApplicationForm } from "@/lib/mock-data/forms"
import type { FormSite } from "@/lib/mock-data/form-site"

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

  let body: { form?: ApplicationForm; site?: FormSite; prompt?: string; mode?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Não foi possível ler o pedido." }, { status: 400 })
  }

  const form = body.form
  const site = body.site
  const prompt = body.prompt?.trim() ?? ""
  if (!form || !site || !prompt) {
    return Response.json({ error: "Dados insuficientes para gerar a página." }, { status: 400 })
  }

  const mode = body.mode === "edit" ? "edit" : "create"
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini"

  const userPayload = {
    mode,
    brand: {
      title: form.title,
      description: form.description,
      organization: form.organizationName,
      brandSummary: form.brandSummary ?? "",
    },
    questions: (form.questions ?? []).map((question) => question.title).filter(Boolean),
    primaryColor: site.theme.primary,
    instruction: prompt,
    currentSite: mode === "edit" ? site : undefined,
  }

  let response: Response
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: siteAiSystemPrompt() },
          { role: "user", content: JSON.stringify(userPayload) },
        ],
        response_format: { type: "json_object" },
      }),
    })
  } catch {
    return Response.json({ error: "Não foi possível falar com o OpenRouter." }, { status: 502 })
  }

  if (!response.ok) {
    return Response.json({ error: "O OpenRouter não respondeu. Tente de novo em instantes." }, { status: 502 })
  }

  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    return Response.json({ error: "A resposta da IA veio vazia." }, { status: 502 })
  }

  try {
    const parsed = parseJson(content)
    const next = sanitizeSite(parsed, site)
    return Response.json({ site: next, mode })
  } catch {
    return Response.json({ error: "A IA não devolveu uma página válida." }, { status: 502 })
  }
}
