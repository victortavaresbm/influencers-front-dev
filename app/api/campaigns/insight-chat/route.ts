import {
  buildInsightChatUserPayload,
  insightChatSystemPrompt,
  type InsightChatMessage,
} from "@/lib/campaigns/insight-chat"
import type { StepRationale } from "@/lib/campaigns/ai-rationale"
import type { AutofillSuggestion, CompanyProfile } from "@/lib/campaigns/autofill"
import type { WizardStepId } from "@/lib/campaigns/wizard-steps"
import type { WizardDraft } from "@/lib/stores/campaigns"

export const maxDuration = 60

type Body = {
  message?: string
  stepId?: WizardStepId
  draft?: WizardDraft
  company?: CompanyProfile | null
  suggestion?: AutofillSuggestion
  rationale?: StepRationale | null
  history?: InsightChatMessage[]
}

export async function POST(request: Request) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    return Response.json({ error: "A chave do OpenRouter não está configurada." }, { status: 500 })
  }

  let body: Body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Não foi possível ler o pedido." }, { status: 400 })
  }

  const message = body.message?.trim() ?? ""
  const stepId = body.stepId
  const draft = body.draft
  if (!message || !stepId || !draft) {
    return Response.json({ error: "Dados insuficientes para o chat." }, { status: 400 })
  }

  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini"
  const payload = buildInsightChatUserPayload({
    stepId,
    message,
    draft,
    company: body.company,
    suggestion: body.suggestion,
    rationale: body.rationale,
    history: body.history,
  })

  const historyMessages = (body.history ?? []).slice(-8).map((item) => ({
    role: item.role,
    content: item.content,
  }))

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
          { role: "system", content: insightChatSystemPrompt() },
          ...historyMessages,
          {
            role: "user",
            content: JSON.stringify(payload),
          },
        ],
      }),
    })
  } catch {
    return Response.json({ error: "Não foi possível falar com o OpenRouter." }, { status: 502 })
  }

  if (!response.ok) {
    return Response.json({ error: "O OpenRouter não respondeu. Tente de novo em instantes." }, { status: 502 })
  }

  const result = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  const content = result.choices?.[0]?.message?.content?.trim()
  if (!content) {
    return Response.json({ error: "A resposta da IA veio vazia." }, { status: 502 })
  }

  return Response.json({ reply: content })
}
