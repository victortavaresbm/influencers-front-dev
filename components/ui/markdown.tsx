import { markdownToHtml } from "@/lib/markdown"
import { cn } from "@/lib/utils"

export function Markdown({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const html = markdownToHtml(value)
  if (!html) return null
  return (
    <div
      className={cn("lesson-copy text-sm leading-relaxed text-zinc-700", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
