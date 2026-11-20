"use client"

import { useRef } from "react"
import { Bold, Italic, Link2, List, ListOrdered } from "lucide-react"
import { Markdown } from "@/components/ui/markdown"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
  "data-ai-field"?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  className,
  "data-ai-field": dataAiField,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const hasContent = Boolean(value.trim())

  function applyWrap(before: string, after = before, empty = "texto") {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end) || empty
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`
    if (maxLength != null && next.length > maxLength) return
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      const from = start + before.length
      el.setSelectionRange(from, from + selected.length)
    })
  }

  function applyLinePrefix(prefix: string) {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const lineStart = value.lastIndexOf("\n", start - 1) + 1
    const lineEndIndex = value.indexOf("\n", end)
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex
    const block = value.slice(lineStart, lineEnd)
    const nextBlock = block
      .split("\n")
      .map((line) => {
        const trimmed = line.replace(/^#{1,4}\s+/, "").replace(/^[-*+]\s+/, "").replace(/^\d+\.\s+/, "")
        return `${prefix}${trimmed || "título"}`
      })
      .join("\n")
    const next = `${value.slice(0, lineStart)}${nextBlock}${value.slice(lineEnd)}`
    if (maxLength != null && next.length > maxLength) return
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(lineStart, lineStart + nextBlock.length)
    })
  }

  function applyLink() {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end) || "link"
    const url = window.prompt("URL do link", "https://")
    if (!url) return
    const snippet = `[${selected}](${url})`
    const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`
    if (maxLength != null && next.length > maxLength) return
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      const caret = start + snippet.length
      el.setSelectionRange(caret, caret)
    })
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-input bg-transparent", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
        <Tool label="Título 1" onClick={() => applyLinePrefix("# ")}>H1</Tool>
        <Tool label="Título 2" onClick={() => applyLinePrefix("## ")}>H2</Tool>
        <Tool label="Título 3" onClick={() => applyLinePrefix("### ")}>H3</Tool>
        <Tool label="Negrito" onClick={() => applyWrap("**")}><Bold className="size-4" /></Tool>
        <Tool label="Itálico" onClick={() => applyWrap("*")}><Italic className="size-4" /></Tool>
        <Tool label="Lista" onClick={() => applyLinePrefix("- ")}><List className="size-4" /></Tool>
        <Tool label="Lista numerada" onClick={() => applyLinePrefix("1. ")}><ListOrdered className="size-4" /></Tool>
        <Tool label="Link" onClick={applyLink}><Link2 className="size-4" /></Tool>
        {maxLength != null ? (
          <span className="ml-auto px-1 text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>

      <div className="grid md:grid-cols-2">
        <div className="min-w-0 border-b border-border md:border-r md:border-b-0">
          <p className="border-b border-border px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Escrever
          </p>
          <Textarea
            ref={ref}
            data-ai-field={dataAiField}
            value={value}
            maxLength={maxLength}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="min-h-44 resize-none rounded-none border-0 focus-visible:ring-0"
          />
        </div>

        <div className="min-w-0 bg-zinc-50/80">
          <p className="border-b border-border px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Como o creator vê
          </p>
          <div className="min-h-44 px-3 py-2.5">
            {hasContent ? (
              <Markdown value={value} />
            ) : (
              <p className="text-sm text-muted-foreground">
                O texto formatado aparece aqui em tempo real.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Tool({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="grid h-7 min-w-7 place-items-center rounded-md px-1.5 text-xs font-semibold text-foreground hover:bg-muted"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
