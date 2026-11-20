"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { generateSite } from "@/lib/forms/site-ai"
import type { ApplicationForm } from "@/lib/mock-data/forms"
import type { FormSite } from "@/lib/mock-data/form-site"
import { useI18n } from "@/lib/i18n"

type ChatItem = { role: "user" | "agent"; text: string }

export function SiteAiPanel({
  form,
  site,
  onApply,
}: {
  form: ApplicationForm
  site: FormSite
  onApply: (site: FormSite) => void
}) {
  const { t } = useI18n()
  const [prompt, setPrompt] = useState("")
  const [thinking, setThinking] = useState(false)
  const [messages, setMessages] = useState<ChatItem[]>([])

  const examples = [t("forms.aiExample1"), t("forms.aiExample2"), t("forms.aiExample3")]

  const run = async (text: string) => {
    const value = text.trim()
    if (!value || thinking) return
    setThinking(true)
    setMessages((current) => [...current, { role: "user", text: value }])
    setPrompt("")

    const blockCount = site.pages.reduce((total, page) => total + page.blocks.length, 0)
    const createIntent = /\b(cri[ae]|criar|refa[çz]|refazer|do zero|come[cç]|nova\s+p[aá]gina|ger(e|ar)|monte|montar)\b/i.test(value)
    const mode = createIntent || blockCount <= 2 ? "create" : "edit"

    const applyLocal = () => {
      const result = generateSite(form, value, site)
      onApply(result.site)
      return result
    }

    try {
      const response = await fetch("/api/forms/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, site, prompt: value, mode }),
      })
      if (response.ok) {
        const data = (await response.json()) as { site?: FormSite; mode?: string }
        if (data.site) {
          onApply(data.site)
          setMessages((current) => [
            ...current,
            { role: "agent", text: data.mode === "edit" ? t("forms.aiEditApplied") : t("forms.aiCreateApplied") },
          ])
          return
        }
      }
      applyLocal()
      setMessages((current) => [...current, { role: "agent", text: t("forms.aiFallback") }])
    } catch {
      applyLocal()
      setMessages((current) => [...current, { role: "agent", text: t("forms.aiFallback") }])
    } finally {
      setThinking(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium text-zinc-900">
          <Sparkles className="size-4" />
          {t("forms.aiTitle")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{t("forms.aiHelp")}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !thinking ? (
          <div className="space-y-2">
            {examples.map((example) => (
              <Button
                key={example}
                type="button"
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal px-3 py-2 text-left text-xs font-normal text-zinc-600"
                onClick={() => void run(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-6 rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white"
                  : "mr-6 rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-800"
              }
            >
              {message.text}
            </div>
          ))
        )}
        {thinking ? (
          <p className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="size-4 animate-spin" />
            {t("forms.aiThinking")}
          </p>
        ) : null}
      </div>
      <form
        className="space-y-2 border-t border-zinc-200 p-3"
        onSubmit={(event) => {
          event.preventDefault()
          void run(prompt)
        }}
      >
        <Textarea
          rows={3}
          value={prompt}
          placeholder={t("forms.aiPlaceholder")}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              void run(prompt)
            }
          }}
        />
        <Button type="submit" className="w-full" disabled={thinking || !prompt.trim()}>
          <Sparkles />
          {t("forms.aiSend")}
        </Button>
      </form>
    </div>
  )
}
