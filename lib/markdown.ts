/** Escape HTML so Markdown source cannot inject tags. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Plain text from Markdown, for summaries and line-clamps. */
export function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/[-*_]{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function inlineMarkdown(value: string) {
  let text = escapeHtml(value)
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>")
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>')
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>")
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>")
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>")
  text = text.replace(/~~([^~]+)~~/g, "<s>$1</s>")
  return text
}

/** Convert a Markdown subset to safe HTML (headings, emphasis, lists, links, code). */
export function markdownToHtml(source: string) {
  const input = source.replace(/\r\n?/g, "\n").trim()
  if (!input) return ""

  const lines = input.split("\n")
  const html: string[] = []
  let paragraph: string[] = []
  let listType: "ul" | "ol" | null = null

  const flushParagraph = () => {
    if (!paragraph.length) return
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`)
    paragraph = []
  }

  const flushList = () => {
    if (!listType) return
    html.push(`</${listType}>`)
    listType = null
  }

  const openList = (type: "ul" | "ol") => {
    if (listType === type) return
    flushParagraph()
    flushList()
    listType = type
    html.push(`<${type}>`)
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      flushParagraph()
      flushList()
      continue
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line)
    if (heading) {
      flushParagraph()
      flushList()
      const level = heading[1].length
      html.push(`<h${level}>${inlineMarkdown(heading[2].trim())}</h${level}>`)
      continue
    }

    const unordered = /^[-*+]\s+(.+)$/.exec(line)
    if (unordered) {
      openList("ul")
      html.push(`<li>${inlineMarkdown(unordered[1])}</li>`)
      continue
    }

    const ordered = /^\d+\.\s+(.+)$/.exec(line)
    if (ordered) {
      openList("ol")
      html.push(`<li>${inlineMarkdown(ordered[1])}</li>`)
      continue
    }

    const quote = /^>\s?(.*)$/.exec(line)
    if (quote) {
      flushParagraph()
      flushList()
      html.push(`<blockquote><p>${inlineMarkdown(quote[1])}</p></blockquote>`)
      continue
    }

    flushList()
    paragraph.push(line.trim())
  }

  flushParagraph()
  flushList()
  return html.join("")
}
