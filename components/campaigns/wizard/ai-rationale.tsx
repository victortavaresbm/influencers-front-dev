"use client"

import { Lightbulb } from "lucide-react"
import type { StepRationale } from "@/lib/campaigns/ai-rationale"

export function AiRationalePanel({ rationale }: { rationale: StepRationale | null }) {
  if (!rationale) {
    return (
      <aside className="rounded-[22px] border border-dashed border-zinc-200 bg-white p-4 text-sm text-zinc-500">
        <p className="font-medium text-zinc-800">Justificativa da IA</p>
        <p className="mt-2 leading-relaxed">Marque o acompanhamento com IA no site da marca para ver aqui o porquê de cada escolha.</p>
      </aside>
    )
  }

  return (
    <aside className="sticky top-6 space-y-3">
      <div className="overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-3">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
            <Lightbulb className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Justificativa da IA</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900">{rationale.title}</p>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4">
          <p className="text-sm leading-relaxed text-zinc-700">{rationale.lead}</p>

          {rationale.points.length > 0 ? (
            <div className="space-y-3">
              {rationale.points.map((point) => (
                <div key={`${point.label}-${point.value}`} className="rounded-xl bg-zinc-50 px-3 py-2.5">
                  <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{point.label}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900 break-words">{point.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">{point.why}</p>
                </div>
              ))}
            </div>
          ) : null}

          {rationale.source ? (
            <p className="truncate text-xs text-zinc-400">Fonte: {rationale.source.replace(/^https?:\/\//, "")}</p>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
