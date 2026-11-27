"use client"

import { useEffect, useRef, useState } from "react"
import { Lightbulb, Loader2, MessageCircle, Send } from "lucide-react"
import {
  humanizeInsight,
  insightHighlightTerms,
  selectionHighlightTerms,
  type StepRationale,
} from "@/lib/campaigns/ai-rationale"
import type { InsightChatMessage } from "@/lib/campaigns/insight-chat"
import type { WizardStepId } from "@/lib/campaigns/wizard-steps"
import type { WizardDraft } from "@/lib/stores/campaigns"
import type { AutofillSuggestion, CompanyProfile } from "@/lib/campaigns/autofill"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Normaliza traços tipográficos para casar 18-24 com 18–24 no texto da IA. */
function normalizeHighlightKey(value: string) {
  return value.toLowerCase().replace(/[\u2010-\u2015\u2212]/g, "-")
}

function termToPattern(term: string) {
  return escapeRegExp(term).replace(/-/g, "[\\u2010-\\u2015\\u2212-]")
}

function HighlightedInsight({ text, terms }: { text: string; terms: string[] }) {
  const content = humanizeInsight(text)
  if (!content) return null
  if (!terms.length) return <>{content}</>

  const pattern = new RegExp(`(${terms.map(termToPattern).join("|")})`, "gi")
  const parts = content.split(pattern)
  const lookup = new Set(terms.map(normalizeHighlightKey))

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null
        if (lookup.has(normalizeHighlightKey(part))) {
          return (
            <strong key={`${part}-${index}`} className="font-semibold text-zinc-900">
              {part}
            </strong>
          )
        }
        return <span key={`${part}-${index}`}>{part}</span>
      })}
    </>
  )
}

const CHAT_EXAMPLES = [
  "Por que estas opções e não as outras?",
  "Qual a linha de raciocínio desta campanha até aqui?",
  "O que muda se eu trocar esta escolha?",
]

const TYPING_PAUSE_MS = 1000
const TYPE_CHAR_MS = 18

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function AiRationalePanel({
  rationale,
  stepId,
  draft,
  suggestion,
  company,
}: {
  rationale: StepRationale | null
  stepId?: WizardStepId
  draft?: WizardDraft
  suggestion?: AutofillSuggestion
  company?: CompanyProfile | null
}) {
  const [messages, setMessages] = useState<InsightChatMessage[]>([])
  const [prompt, setPrompt] = useState("")
  const [thinking, setThinking] = useState(false)
  const [typingPause, setTypingPause] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const streamGeneration = useRef(0)

  const busy = thinking || typingPause || revealing

  useEffect(() => {
    const node = scroller.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, thinking, typingPause, revealing])

  useEffect(() => {
    return () => {
      streamGeneration.current += 1
    }
  }, [])

  const selected =
    stepId && draft
      ? selectionHighlightTerms(stepId, draft, suggestion, company)
      : []
  const highlights = rationale ? insightHighlightTerms(rationale, selected) : selected

  const revealAssistant = async (fullText: string) => {
    const generation = ++streamGeneration.current
    setThinking(false)
    setTypingPause(true)
    await delay(TYPING_PAUSE_MS)
    if (streamGeneration.current !== generation) return

    setTypingPause(false)
    setRevealing(true)
    setMessages((current) => [...current, { role: "assistant", content: "" }])

    const chars = Array.from(fullText)
    let shown = ""
    for (const char of chars) {
      if (streamGeneration.current !== generation) return
      shown += char
      const nextContent = shown
      setMessages((current) => {
        if (!current.length) return current
        const next = [...current]
        next[next.length - 1] = { role: "assistant", content: nextContent }
        return next
      })
      await delay(char === " " || char === "\n" ? Math.max(8, TYPE_CHAR_MS / 2) : TYPE_CHAR_MS)
    }

    if (streamGeneration.current === generation) {
      setRevealing(false)
    }
  }

  const send = async (text: string) => {
    const value = text.trim()
    if (!value || busy || !stepId || !draft) return
    streamGeneration.current += 1
    setThinking(true)
    setTypingPause(false)
    setRevealing(false)
    setError(null)
    const history = messages
    setMessages((current) => [...current, { role: "user", content: value }])
    setPrompt("")

    try {
      const response = await fetch("/api/campaigns/insight-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: value,
          stepId,
          draft,
          company,
          suggestion,
          rationale,
          history,
        }),
      })
      const data = (await response.json()) as { reply?: string; error?: string }
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Não foi possível obter a resposta.")
      }
      await revealAssistant(data.reply)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha no chat."
      setError(message)
      setThinking(false)
      setTypingPause(false)
      await revealAssistant("Não consegui responder agora. Tente de novo em instantes.")
    }
  }

  return (
    <aside className="sticky top-6 space-y-3">
      <div className="flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-sm">
        <div className="flex shrink-0 items-start gap-3 border-b border-zinc-100 px-4 py-3">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
            <Lightbulb className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Insight da IA</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900">
              {rationale?.title || "Converse sobre a campanha"}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {rationale ? (
            <>
              <p className="text-sm leading-relaxed text-zinc-700">
                <HighlightedInsight text={rationale.lead} terms={highlights} />
              </p>

              {rationale.points.length > 0 ? (
                <div className="space-y-3">
                  {rationale.points.map((point) => (
                    <div key={`${point.label}-${point.value}`} className="rounded-xl bg-zinc-50 px-3 py-2.5">
                      <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{point.label}</p>
                      <p className="mt-1 text-sm font-semibold break-words text-zinc-900">
                        <HighlightedInsight text={point.value} terms={highlights} />
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                        <HighlightedInsight text={point.why} terms={highlights} />
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {rationale.source ? (
                <p className="truncate text-xs text-zinc-400">Fonte: {rationale.source.replace(/^https?:\/\//, "")}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm leading-relaxed text-zinc-500">
              Marque o acompanhamento com IA no site da marca para ver o porquê de cada escolha. Você já pode conversar sobre a linha da campanha.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col border-t border-zinc-100 bg-zinc-50/80">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2">
            <MessageCircle className="size-3.5 text-zinc-500" />
            <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">Chat da campanha</p>
          </div>

          <div ref={scroller} className="max-h-44 space-y-2 overflow-y-auto px-3 py-2.5">
            {messages.length === 0 && !busy ? (
              <div className="space-y-1.5">
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Pergunte por que algo foi escolhido, o que ficou de fora ou como a campanha se conecta até aqui.
                </p>
                {CHAT_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="block w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-left text-[11px] leading-snug text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                    onClick={() => void send(example)}
                    disabled={!stepId || !draft || busy}
                  >
                    {example}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((message, index) => {
                const isStreamingAssistant =
                  revealing && message.role === "assistant" && index === messages.length - 1
                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn(
                      "rounded-xl px-2.5 py-2 text-xs leading-relaxed",
                      message.role === "user"
                        ? "ml-4 bg-zinc-900 text-white"
                        : "mr-4 bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-100",
                    )}
                  >
                    {message.content}
                    {isStreamingAssistant ? (
                      <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-zinc-400 align-middle" aria-hidden />
                    ) : null}
                  </div>
                )
              })
            )}
            {thinking ? (
              <p className="flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 className="size-3.5 animate-spin" />
                Pensando…
              </p>
            ) : null}
            {typingPause ? (
              <p className="mr-4 flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-100">
                <span className="flex gap-1" aria-hidden>
                  <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
                </span>
                Digitando…
              </p>
            ) : null}
            {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
          </div>

          <form
            className="space-y-2 border-t border-zinc-100 p-3"
            onSubmit={(event) => {
              event.preventDefault()
              void send(prompt)
            }}
          >
            <Textarea
              rows={2}
              value={prompt}
              placeholder="Ex.: Por que não incluímos Live?"
              className="min-h-[2.5rem] resize-none bg-white text-xs"
              disabled={busy || !stepId || !draft}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  void send(prompt)
                }
              }}
            />
            <Button type="submit" size="sm" className="w-full" disabled={busy || !prompt.trim() || !stepId || !draft}>
              <Send className="size-3.5" />
              Perguntar
            </Button>
          </form>
        </div>
      </div>
    </aside>
  )
}
