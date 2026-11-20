"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { buildCreatorReport } from "@/lib/discovery/creator-report"
import { creatorReportHtml, openCreatorReport } from "@/lib/discovery/print-creator-report"
import { type Platform } from "@/lib/discovery/discover-query"
import { type Creator } from "@/lib/mock-data/creators"

export function CreatorReportDialog({
  creator,
  platform,
  open,
  onOpenChange,
}: {
  creator: Creator
  platform: Platform
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const report = useMemo(() => (open ? buildCreatorReport(creator, platform) : null), [creator, open, platform])
  const html = useMemo(() => (report ? creatorReportHtml(report, "preview") : ""), [report])

  function download() {
    if (!report) return
    const opened = openCreatorReport(report)
    if (!opened) {
      toast.add({ type: "error", title: "O navegador bloqueou a nova aba do PDF." })
      return
    }
    toast.add({ type: "success", title: "Relatório aberto", description: "Na nova aba, salve como PDF." })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(880px,calc(100vh-2rem))] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3 pr-14">
          <div className="min-w-0 flex-1">
            <DialogTitle>Relatório completo</DialogTitle>
            <DialogDescription className="mt-1">
              Audiência, conteúdo, crescimento e posts de {creator.name}.
            </DialogDescription>
          </div>
          <Button type="button" onClick={download}>
            <Download />
            Baixar PDF
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-100">
          {html ? <ReportFrame html={html} /> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ReportFrame({ html }: { html: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(720)

  useEffect(() => {
    const node = frame.current
    if (!node) return
    const update = () => {
      const next = node.contentDocument?.documentElement.scrollHeight
      if (next && next > 0) setHeight(next)
    }
    node.addEventListener("load", update)
    const timer = window.setTimeout(update, 600)
    return () => {
      node.removeEventListener("load", update)
      window.clearTimeout(timer)
    }
  }, [html])

  return (
    <iframe
      ref={frame}
      title="Prévia do relatório"
      srcDoc={html}
      className="w-full border-0 bg-zinc-100"
      style={{ height }}
      onLoad={() => {
        const next = frame.current?.contentDocument?.documentElement.scrollHeight
        if (next && next > 0) setHeight(next)
      }}
    />
  )
}
