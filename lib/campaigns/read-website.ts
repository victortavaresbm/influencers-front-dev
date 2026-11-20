export interface CompanySource {
  url: string
  title: string
  text: string
}

const ABOUT = /sobre|about|quem-somos|nossa-historia|a-marca|institucional|nossa historia/i

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withProtocol)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url
  } catch {
    return null
  }
}

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function absoluteLink(href: string, base: URL) {
  try {
    const url = new URL(href, base)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    if (url.hostname !== base.hostname) return null
    url.hash = ""
    return url.toString()
  } catch {
    return null
  }
}

async function readDirect(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  })
  if (!response.ok) return ""
  const html = await response.text()
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")
  const text = decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
  if (text.length < 80) return ""
  return `Title: ${title}\n\n${text}`.slice(0, 14000)
}

async function readViaJina(url: string) {
  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: { Accept: "text/plain", "X-Return-Format": "markdown" },
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  })
  if (!response.ok) return ""
  return (await response.text()).slice(0, 14000)
}

function titleFromMarkdown(markdown: string, fallback: string) {
  const titled = markdown.match(/^Title:\s*(.+)$/m)?.[1]?.trim()
  return titled || fallback
}

function linksFromMarkdown(markdown: string, base: URL) {
  const hrefs = [...markdown.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((match) => match[1])
  return hrefs
    .map((href) => absoluteLink(href, base))
    .filter((href): href is string => Boolean(href))
}

export async function readCompanySite(rawUrl: string): Promise<CompanySource | null> {
  const url = normalizeUrl(rawUrl)
  if (!url) return null
  const homeMarkdown = await readViaJina(url.toString()).catch(() => "") || await readDirect(url.toString()).catch(() => "")
  if (homeMarkdown.trim().length < 80) return null
  const aboutUrl = linksFromMarkdown(homeMarkdown, url).find((href) => ABOUT.test(href) && href !== url.toString())
  const aboutMarkdown = aboutUrl ? await readViaJina(aboutUrl).catch(() => "") : ""
  const title = titleFromMarkdown(homeMarkdown, url.hostname.replace(/^www\./, ""))
  const text = [homeMarkdown, aboutMarkdown].filter((part) => part.trim().length > 80).join("\n\n").slice(0, 18000)
  return { url: url.toString(), title: decode(title), text }
}
