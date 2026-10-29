export interface Playback {
  kind: "iframe" | "video" | "none"
  src?: string
  poster?: string
  provider?: string
}

const ALLOWED_TAGS = new Set([
  "b", "strong", "i", "em", "u", "s", "strike", "code", "p", "br", "ul", "ol", "li",
  "span", "a", "h1", "h2", "h3", "h4", "div", "blockquote", "pre", "hr", "img", "iframe", "video",
])

const VIDEO_HOST = /(?:youtube\.com|youtu\.be|vimeo\.com|\.(?:mp4|webm|ogg|mov)(?:\?|$))/i
const BARE_VIDEO = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s<"]+|youtu\.be\/[^\s<"]+|vimeo\.com\/\d+)/gi

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function ensureHtml(body: string): string {
  const value = body.trim()
  if (!value) return ""
  if (looksLikeHtml(value)) return value
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

export function vimeoEmbedSrc(id: string): string {
  const params = new URLSearchParams({ title: "0", byline: "0", portrait: "0", dnt: "1" })
  return `https://player.vimeo.com/video/${id}?${params.toString()}`
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
}

function safeHttp(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url
    return null
  } catch {
    return null
  }
}

function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")
    if (host === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] ?? null
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2] ?? null
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2] ?? null
      return parsed.searchParams.get("v")
    }
    return null
  } catch {
    return null
  }
}

function safeMediaSrc(src: string): boolean {
  return /^(https?:\/\/|blob:|data:image\/(?:png|jpeg|jpg|gif|webp);base64,)/i.test(src)
}

function safeEmbedSrc(src: string): boolean {
  try {
    const url = new URL(src)
    if (url.protocol !== "https:") return false
    const host = url.hostname.replace(/^www\./, "")
    return host === "youtube.com" || host === "youtube-nocookie.com" || host === "player.vimeo.com"
  } catch {
    return false
  }
}

export function resolvePlayback(url: string | undefined): Playback {
  const value = url?.trim() ?? ""
  if (!value) return { kind: "none" }

  if (value.startsWith("blob:") || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(value)) {
    return { kind: "video", src: value, provider: "Arquivo" }
  }

  const yt = youtubeId(value)
  if (yt) {
    return {
      kind: "iframe",
      src: `https://www.youtube.com/embed/${yt}`,
      poster: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
      provider: "YouTube",
    }
  }

  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) {
    return { kind: "iframe", src: vimeoEmbedSrc(vimeo[1]), provider: "Vimeo" }
  }

  const http = safeHttp(value)
  if (!http) return { kind: "none" }
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(http)) return { kind: "video", src: http, provider: "Arquivo" }
  return { kind: "iframe", src: http, provider: "Vídeo" }
}

export function videoEmbedHtml(url: string, options?: { anyLink?: boolean }): string | null {
  const value = url.trim()
  if (!options?.anyLink && !VIDEO_HOST.test(value) && !/<iframe/i.test(value)) return null
  const playback = resolvePlayback(value)
  if (!playback.src || playback.kind === "none") return null
  const src = escapeAttr(playback.src)
  if (playback.kind === "video") return `<video src="${src}" controls playsinline></video>`
  if (!safeEmbedSrc(playback.src)) return null
  return `<iframe src="${src}" title="Vídeo" allowfullscreen></iframe>`
}

export function promoteVideoLinks(html: string): string {
  const linked = html.replace(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi, (full, href: string) => {
    const embed = videoEmbedHtml(href.replace(/&amp;/g, "&"))
    return embed ?? full
  })
  return linked.replace(BARE_VIDEO, (url) => videoEmbedHtml(url) ?? url)
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (full, rawName: string, attrs: string) => {
      const tag = rawName.toLowerCase()
      if (!ALLOWED_TAGS.has(tag)) return ""
      if (full.startsWith("</")) return tag === "br" ? "" : `</${tag}>`
      if (tag === "br" || tag === "hr") return `<${tag}>`
      if (tag === "img") {
        const src = /src\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] ?? ""
        if (!safeMediaSrc(src)) return ""
        const alt = (/alt\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] ?? "").replace(/[<>]/g, "").slice(0, 200)
        return `<img src="${src}" alt="${escapeAttr(alt)}">`
      }
      if (tag === "iframe") {
        const src = /src\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] ?? ""
        return safeEmbedSrc(src) ? `<iframe src="${escapeAttr(src)}" title="Vídeo" allowfullscreen></iframe>` : ""
      }
      if (tag === "video") {
        const src = /src\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] ?? ""
        return safeMediaSrc(src) ? `<video src="${escapeAttr(src)}" controls playsinline></video>` : ""
      }
      if (tag === "a") {
        const href = /href\s*=\s*["'](https?:\/\/[^"']+)["']/i.exec(attrs)
        return href ? `<a href="${href[1]}" rel="noopener noreferrer" target="_blank">` : "<a>"
      }
      if (tag === "div" && /pending-video/.test(attrs)) return `<div class="pending-video">`
      return `<${tag}>`
    })
}

export function readContentHtml(root: HTMLElement | null): string {
  if (!root) return ""
  return sanitizeHtml(root.innerHTML)
}

export function pendingVideoHtml(objectUrl: string): string {
  const src = escapeAttr(objectUrl)
  return (
    `<div class="pending-video"><video src="${src}" controls playsinline preload="metadata"></video></div>`
  )
}

export function imageHtml(src: string, alt: string): string {
  return `<div><img src="${escapeAttr(src)}" alt="${escapeAttr(alt.trim())}"></div>`
}
