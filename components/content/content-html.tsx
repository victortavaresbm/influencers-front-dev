"use client"

import { ensureHtml, promoteVideoLinks, sanitizeHtml } from "@/lib/content-media"

export function ContentHtml({ html, className }: { html: string; className?: string }) {
  const safe = sanitizeHtml(promoteVideoLinks(ensureHtml(html)))
  return <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />
}
