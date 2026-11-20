"use client"

import { useEffect, useState } from "react"
import { Check, Globe, LoaderCircle, Search, Sparkles, Target, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export const RESEARCH_STEPS = [
  { id: "open", label: "Abrindo o site", detail: "Conectando à página da marca", icon: Globe },
  { id: "read", label: "Lendo o conteúdo", detail: "Extraindo textos, produtos e ofertas", icon: Search },
  { id: "brand", label: "Entendendo a marca", detail: "Nome, posicionamento e linhas", icon: Sparkles },
  { id: "audience", label: "Pesquisando o público", detail: "País, idade e interesses", icon: Users },
  { id: "creator", label: "Desenhando o creator ideal", detail: "Rede, porte e nicho", icon: Target },
  { id: "plan", label: "Montando o plano da campanha", detail: "Estratégia, tática e briefing", icon: Check },
] as const

export function ResearchProgress({
  active,
  website,
  done,
}: {
  active: boolean
  website?: string
  done?: boolean
}) {
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    if (!active) {
      setCursor(0)
      return
    }
    setCursor(0)
    const timer = window.setInterval(() => {
      setCursor((current) => Math.min(current + 1, RESEARCH_STEPS.length - 1))
    }, 1600)
    return () => window.clearInterval(timer)
  }, [active])

  useEffect(() => {
    if (done) setCursor(RESEARCH_STEPS.length - 1)
  }, [done])

  const current = done ? RESEARCH_STEPS.length - 1 : cursor
  const host = (() => {
    if (!website?.trim()) return ""
    try {
      return new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`).hostname.replace(/^www\./, "")
    } catch {
      return website
    }
  })()

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Pesquisa em andamento</p>
          <p className="text-xs text-zinc-500">{host ? `Analisando ${host}` : "Lendo o site da marca"}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
          <LoaderCircle className="size-3.5 animate-spin" />
          {done ? "Pronto" : "Pesquisando"}
        </span>
      </div>

      <div className="space-y-1 p-3">
        {RESEARCH_STEPS.map((step, index) => {
          const Icon = step.icon
          const complete = done || index < current
          const running = !done && index === current
          const pending = !complete && !running
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-500",
                running && "bg-zinc-50",
                complete && "opacity-100",
                pending && "opacity-45",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                  complete && "bg-zinc-900 text-white",
                  running && "bg-zinc-200 text-zinc-800",
                  pending && "bg-zinc-100 text-zinc-400",
                )}
              >
                {complete ? <Check className="size-3.5" /> : running ? <LoaderCircle className="size-3.5 animate-spin" /> : <Icon className="size-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-sm font-medium", running ? "text-zinc-900" : "text-zinc-800")}>
                  {step.label}
                  {running ? <span className="ml-1 inline-flex gap-0.5 align-middle">
                    <span className="size-1 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                    <span className="size-1 animate-bounce rounded-full bg-zinc-500 [animation-delay:120ms]" />
                    <span className="size-1 animate-bounce rounded-full bg-zinc-500 [animation-delay:240ms]" />
                  </span> : null}
                </span>
                <span className="block text-xs text-zinc-500">{step.detail}</span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="px-4 pb-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-zinc-900 transition-[width] duration-700 ease-out"
            style={{ width: `${Math.round(((current + (done ? 1 : 0.35)) / RESEARCH_STEPS.length) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
