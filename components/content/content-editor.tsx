"use client"

import { useRef, useState } from "react"
import {
  Bold, Code, Image as ImageIcon, Italic, Link2, List, ListOrdered, Minus, Quote, Strikethrough, Video,
} from "lucide-react"
import { MediaInsert } from "@/components/content/media-insert"
import { useI18n } from "@/lib/i18n"
import { ensureHtml, promoteVideoLinks, videoEmbedHtml } from "@/lib/content-media"
import { cn } from "@/lib/utils"

type MediaKind = "video" | "image"

const EMPTY_P = "<p><br></p>"

export function ContentEditor({
  editorRef,
  initialHtml,
  label,
  children,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>
  initialHtml: string
  label: string
  children?: React.ReactNode
}) {
  const { t } = useI18n()
  const selection = useRef<Range | null>(null)
  const [media, setMedia] = useState<MediaKind | null>(null)

  function prepareEditor() {
    const root = editorRef.current
    if (!root) return
    lockMedia(root)
    ensureTypingSlots(root)
  }

  function run(command: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    prepareEditor()
  }

  function rememberSelection() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      selection.current = sel.getRangeAt(0).cloneRange()
    }
  }

  function insertHtml(html: string) {
    const root = editorRef.current
    root?.focus()
    const sel = window.getSelection()
    if (selection.current && sel) {
      sel.removeAllRanges()
      sel.addRange(selection.current)
    }
    document.execCommand("insertHTML", false, html)
    if (root) {
      prepareEditor()
      const inserted = root.querySelectorAll("img, video, iframe, .pending-video")
      const last = inserted[inserted.length - 1]
      if (last) placeCaretBeside(root, last, "after")
    }
  }

  function askLink() {
    const value = window.prompt(t("content.promptLink"))
    if (!value) return
    run("createLink", value)
  }

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-2">
        {(["H1", "H2", "H3", "H4"] as const).map((tag) => (
          <button key={tag} type="button" className="rounded-md px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted" onMouseDown={(event) => event.preventDefault()} onClick={() => run("formatBlock", tag)}>
            {tag}
          </button>
        ))}
        <Tool label={t("content.bold")} onClick={() => run("bold")}><Bold className="size-4" /></Tool>
        <Tool label={t("content.italic")} onClick={() => run("italic")}><Italic className="size-4" /></Tool>
        <Tool label={t("content.strike")} onClick={() => run("strikeThrough")}><Strikethrough className="size-4" /></Tool>
        <Tool label={t("content.code")} onClick={() => run("formatBlock", "PRE")}><Code className="size-4" /></Tool>
        <Tool label={t("content.list")} onClick={() => run("insertUnorderedList")}><List className="size-4" /></Tool>
        <Tool label={t("content.listOrdered")} onClick={() => run("insertOrderedList")}><ListOrdered className="size-4" /></Tool>
        <Tool label={t("content.quote")} onClick={() => run("formatBlock", "BLOCKQUOTE")}><Quote className="size-4" /></Tool>
        <Tool label={t("content.video")} active={media === "video"} onMouseDown={rememberSelection} onClick={() => { rememberSelection(); setMedia((current) => current === "video" ? null : "video") }}><Video className="size-4" /></Tool>
        <Tool label={t("content.image")} active={media === "image"} onMouseDown={rememberSelection} onClick={() => { rememberSelection(); setMedia((current) => current === "image" ? null : "image") }}><ImageIcon className="size-4" /></Tool>
        <Tool label={t("content.link")} onClick={askLink}><Link2 className="size-4" /></Tool>
        <Tool label={t("content.divider")} onClick={() => run("insertHorizontalRule")}><Minus className="size-4" /></Tool>
      </div>
      {media && (
        <MediaInsert
          key={media}
          kind={media}
          onCancel={() => setMedia(null)}
          onInsert={(html) => {
            insertHtml(html)
            setMedia(null)
            requestAnimationFrame(() => editorRef.current?.focus())
          }}
        />
      )}
      {children}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        data-placeholder={t("content.editorPlaceholder")}
        className="lesson-copy editor-surface min-h-64 px-4 py-3 text-sm text-foreground outline-none"
        dangerouslySetInnerHTML={{ __html: seed(promoteVideoLinks(ensureHtml(initialHtml))) }}
        onInput={() => ensureTypingSlots(editorRef.current)}
        onMouseDown={(event) => focusEditorAtClick(event, editorRef.current, prepareEditor)}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text/plain").trim()
          const embed = videoEmbedHtml(text)
          if (!embed) return
          event.preventDefault()
          insertHtml(embed)
        }}
      />
    </div>
  )
}

function seed(html: string) {
  return html.trim() ? html : EMPTY_P
}

function lockMedia(root: ParentNode) {
  root.querySelectorAll("img, video, iframe, .pending-video, hr").forEach((node) => {
    node.setAttribute("contenteditable", "false")
  })
}

function createEmptyParagraph() {
  const paragraph = document.createElement("p")
  paragraph.appendChild(document.createElement("br"))
  return paragraph
}

function isLockedBlock(node: Node | null): boolean {
  if (!(node instanceof HTMLElement)) return false
  return node.matches("img, video, iframe, hr, .pending-video") || node.getAttribute("contenteditable") === "false"
}

function ensureTypingSlots(root: HTMLElement | null) {
  if (!root) return
  if (root.childNodes.length === 0) {
    root.appendChild(createEmptyParagraph())
    return
  }
  for (const block of [...root.children].filter(isLockedBlock)) {
    if (!block.previousElementSibling || isLockedBlock(block.previousElementSibling)) root.insertBefore(createEmptyParagraph(), block)
    if (!block.nextElementSibling || isLockedBlock(block.nextElementSibling)) root.insertBefore(createEmptyParagraph(), block.nextElementSibling)
  }
  if (!root.lastElementChild || isLockedBlock(root.lastElementChild)) root.appendChild(createEmptyParagraph())
}

function placeCaretIn(node: Node, where: "start" | "end") {
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(node)
  range.collapse(where === "start")
  selection.removeAllRanges()
  selection.addRange(range)
}

function placeCaretBeside(root: HTMLElement, locked: Element, side: "before" | "after") {
  ensureTypingSlots(root)
  let block: Element = locked
  while (block.parentElement && block.parentElement !== root) block = block.parentElement
  const target = side === "before" ? block.previousElementSibling : block.nextElementSibling
  if (target) placeCaretIn(target, side === "before" ? "end" : "start")
}

function focusEditorAtClick(event: React.MouseEvent<HTMLDivElement>, root: HTMLDivElement | null, prepare: () => void) {
  if (!root) return
  prepare()
  const target = event.target as HTMLElement
  if (target.closest("video, audio, iframe")) return
  const locked = target.closest("img, .pending-video, hr, [contenteditable='false']")
  if (locked && root.contains(locked)) {
    event.preventDefault()
    root.focus()
    placeCaretBeside(root, locked, event.clientY < locked.getBoundingClientRect().top + locked.clientHeight / 2 ? "before" : "after")
  }
}

function Tool({
  label,
  onClick,
  onMouseDown,
  active,
  children,
}: {
  label: string
  onClick: () => void
  onMouseDown?: () => void
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      className={cn("grid size-8 place-items-center rounded-md text-foreground hover:bg-muted", active && "bg-muted")}
      onMouseDown={(event) => {
        event.preventDefault()
        onMouseDown?.()
      }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
