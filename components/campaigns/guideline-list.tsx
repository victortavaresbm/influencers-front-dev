"use client"

import { useRef, useState } from "react"
import { Check, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function cleanGuidelines(items?: string[]) {
  return (items ?? []).map((item) => item.trim()).filter(Boolean)
}

const COPY = {
  do: { title: "Pode fazer", emoji: "✅", add: "Adicionar item" },
  dont: { title: "Não pode fazer", emoji: "❌", add: "Adicionar item" },
} as const

export function GuidelineList({
  tone,
  items,
  onChange,
}: {
  tone: "do" | "dont"
  items: string[]
  onChange?: (items: string[]) => void
}) {
  const editable = Boolean(onChange)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const skipBlur = useRef(false)
  const copy = COPY[tone]
  const good = tone === "do"

  function commit(value: string) {
    const text = value.trim()
    setDraft("")
    setAdding(false)
    if (!text || !onChange) return
    onChange([...items, text])
  }

  if (!editable && items.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
        <span aria-hidden>{copy.emoji}</span>
        {copy.title}
      </p>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={`${tone}-${index}`}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2",
                good ? "border-zinc-200 bg-zinc-50" : "border-red-100 bg-red-50",
              )}
            >
              {good ? (
                <Check className="size-3.5 shrink-0 text-emerald-600" />
              ) : (
                <X className="size-3.5 shrink-0 text-red-500" />
              )}
              {editable ? (
                <Input
                  value={item}
                  aria-label={`${copy.title}, item ${index + 1}`}
                  className="h-7 min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  onChange={(event) => {
                    const next = [...items]
                    next[index] = event.target.value
                    onChange?.(next)
                  }}
                  onBlur={() => {
                    if (!item.trim()) onChange?.(items.filter((_, itemIndex) => itemIndex !== index))
                  }}
                />
              ) : (
                <p className="min-w-0 flex-1 text-sm text-zinc-800">{item}</p>
              )}
              {editable && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remover ${item || "item"}`}
                  onClick={() => onChange?.(items.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <X />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {editable && adding && (
        <div className={cn("flex min-w-0 items-center gap-2 rounded-lg border bg-white px-3 py-2", good ? "border-zinc-200" : "border-red-100")}>
          {good ? (
            <Check className="size-3.5 shrink-0 text-emerald-600" />
          ) : (
            <X className="size-3.5 shrink-0 text-red-500" />
          )}
          <Input
            autoFocus
            value={draft}
            placeholder="Escreva e pressione Enter"
            aria-label={`Novo item de ${copy.title}`}
            className="h-7 min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                skipBlur.current = true
                commit(draft)
              }
              if (event.key === "Escape") {
                skipBlur.current = true
                setDraft("")
                setAdding(false)
              }
            }}
            onBlur={() => {
              if (skipBlur.current) {
                skipBlur.current = false
                return
              }
              commit(draft)
            }}
          />
        </div>
      )}
      {editable && !adding && (
        <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(true)}>
          <Plus />
          {copy.add}
        </Button>
      )}
    </div>
  )
}

export function GuidelineLists({
  doList,
  dontList,
  onChange,
}: {
  doList: string[]
  dontList: string[]
  onChange?: (next: { doList?: string[]; dontList?: string[] }) => void
}) {
  return (
    <div className="space-y-5">
      <GuidelineList tone="do" items={doList} onChange={onChange ? (next) => onChange({ doList: next }) : undefined} />
      <GuidelineList tone="dont" items={dontList} onChange={onChange ? (next) => onChange({ dontList: next }) : undefined} />
    </div>
  )
}
