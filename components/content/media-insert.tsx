"use client"

import { useRef, useState } from "react"
import { Film, Image as ImageIcon, Play, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import { imageHtml, pendingVideoHtml, resolvePlayback, videoEmbedHtml, type Playback } from "@/lib/content-media"
import { cn } from "@/lib/utils"

type MediaKind = "video" | "image"
type SourceMode = "file" | "link"

const IMAGE_TYPES = /^image\/(png|jpe?g|webp|gif|avif)$/
const VIDEO_TYPES = /^video\/(mp4|webm|quicktime)$/
const IMAGE_MAX = 10 * 1024 * 1024

export function MediaInsert({
  kind,
  onCancel,
  onInsert,
}: {
  kind: MediaKind
  onCancel: () => void
  onInsert: (html: string, linkedVideo?: string) => void
}) {
  const { t } = useI18n()
  const fileInput = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<SourceMode>("file")
  const [link, setLink] = useState("")
  const [alt, setAlt] = useState("")
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState("")
  const [imageBroken, setImageBroken] = useState(false)

  const noun = kind === "video" ? t("content.mediaVideo") : t("content.mediaImage")
  const playback = kind === "video" && link.trim() ? resolvePlayback(link.trim()) : null
  const linkReady = Boolean(playback && playback.kind !== "none" && playback.src && (playback.kind === "video" || playback.provider === "YouTube" || playback.provider === "Vimeo"))
  const imageLink = kind === "image" && /^https?:\/\//i.test(link.trim())
  const canInsert = kind === "image" ? imageLink : linkReady

  async function insertFiles(files: File[]) {
    for (const file of files) {
      const problem = fileProblem(file, kind)
      if (problem) {
        setError(problem)
        return
      }
      if (kind === "video") {
        onInsert(pendingVideoHtml(URL.createObjectURL(file)))
        continue
      }
      onInsert(imageHtml(await readFile(file), alt))
    }
    onCancel()
  }

  function takeFiles(list: FileList | null | undefined) {
    if (!list?.length) return
    void insertFiles(Array.from(list))
  }

  function insertLink() {
    const value = link.trim()
    if (kind === "image") {
      if (!/^https?:\/\//i.test(value)) {
        setError(t("content.imageLinkHint"))
        return
      }
      onInsert(imageHtml(value, alt))
      onCancel()
      return
    }
    const embed = videoEmbedHtml(value, { anyLink: true })
    if (!embed || !linkReady) {
      setError(t("content.videoLinkHint"))
      return
    }
    onInsert(`<div>${embed}</div>`, value)
    onCancel()
  }

  return (
    <div
      className="border-y border-border bg-muted/50 px-4 py-3"
      onDragEnter={(event) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        setDragging(true)
      }}
      onDragOver={(event) => {
        if (!hasFiles(event)) return
        event.preventDefault()
      }}
      onDragLeave={(event) => {
        const next = event.relatedTarget
        if (next instanceof Node && event.currentTarget.contains(next)) return
        setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        takeFiles(event.dataTransfer.files)
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{t("content.addMedia", { kind: noun })}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {kind === "video" ? t("content.mediaVideoHelp") : t("content.mediaImageHelp")}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("content.cancel")} onClick={onCancel}>
          <X />
        </Button>
      </div>

      <div className="mt-3 inline-flex rounded-lg border border-border bg-background p-0.5" role="tablist">
        <Tab active={mode === "file"} onClick={() => setMode("file")}>{t("content.mediaFile")}</Tab>
        <Tab active={mode === "link"} onClick={() => setMode("link")}>{t("content.mediaLink")}</Tab>
      </div>

      {mode === "file" ? (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className={cn(
            "mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center",
            dragging ? "border-foreground bg-background" : "border-border bg-background hover:bg-muted/60",
          )}
        >
          <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
            {dragging ? <Upload className="size-4" /> : kind === "video" ? <Film className="size-4" /> : <ImageIcon className="size-4" />}
          </span>
          <span className="text-sm font-medium text-foreground">
            {dragging ? t("content.dropNow") : kind === "video" ? t("content.dropVideo") : t("content.dropImage")}
          </span>
          <span className="max-w-xs text-xs text-muted-foreground">
            {kind === "video" ? t("content.videoTypes") : t("content.imageTypes")}
          </span>
        </button>
      ) : (
        <div className="mt-3 grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor={`media-link-${kind}`}>{t("content.pasteLink")}</Label>
            <Input
              id={`media-link-${kind}`}
              value={link}
              spellCheck={false}
              placeholder={kind === "video" ? "https://youtube.com/watch?v=…" : "https://…"}
              onChange={(event) => {
                setLink(event.target.value)
                setImageBroken(false)
                setError("")
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canInsert) {
                  event.preventDefault()
                  insertLink()
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              {kind === "video" ? t("content.videoLinkHint") : t("content.imageLinkHint")}
            </p>
          </div>
          {kind === "video" && playback && linkReady && <LinkPreview playback={playback} url={link.trim()} readyLabel={t("content.previewReady")} />}
          {kind === "image" && imageLink && (
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              {imageBroken ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("content.imageLinkHint")}</p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={link.trim()} alt="" className="max-h-56 w-full object-contain" onError={() => setImageBroken(true)} />
              )}
            </div>
          )}
          {kind === "image" && (
            <div className="grid gap-1.5">
              <Label htmlFor="media-alt">{t("content.alt")}</Label>
              <Input id="media-alt" value={alt} placeholder={t("content.alt")} onChange={(event) => setAlt(event.target.value.slice(0, 200))} />
              <p className="text-xs text-muted-foreground">{t("content.altHint")}</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept={kind === "video" ? "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" : "image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"}
        multiple
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          takeFiles(event.target.files)
          event.target.value = ""
        }}
      />

      {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}

      {mode === "link" && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {canInsert
              ? kind === "video"
                ? t("content.linkReady", { provider: playback?.provider ?? "Vídeo" })
                : t("content.imageReady")
              : t("content.pasteToContinue")}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>{t("content.cancel")}</Button>
            <Button type="button" onClick={insertLink} disabled={!canInsert}>{t("content.insert")}</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function LinkPreview({ playback, url, readyLabel }: { playback: Playback; url: string; readyLabel: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-background p-3">
      <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-md bg-foreground">
        {playback.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={playback.poster} alt="" className="size-full object-cover" />
        ) : playback.kind === "video" && playback.src ? (
          <video src={playback.src} muted playsInline preload="metadata" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-background">
            <Play className="size-6" />
          </span>
        )}
      </div>
      <div className="min-w-0 self-center">
        <p className="text-sm font-medium text-foreground">{playback.provider ?? "Vídeo"}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{hostOf(url)}</p>
        <p className="mt-2 text-xs font-medium text-foreground">{readyLabel}</p>
      </div>
    </div>
  )
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn("h-8 rounded-md px-3 text-sm font-medium", active ? "bg-muted text-foreground" : "text-muted-foreground")}
    >
      {children}
    </button>
  )
}

function fileProblem(file: File, kind: MediaKind): string | null {
  if (kind === "image") {
    if (!IMAGE_TYPES.test(file.type) && !/\.(png|jpe?g|webp|gif|avif)$/i.test(file.name)) return "Use uma imagem PNG, JPG, WEBP ou GIF."
    if (file.size > IMAGE_MAX) return "A imagem passa de 10 MB."
    return null
  }
  if (!VIDEO_TYPES.test(file.type) && !/\.(mp4|webm|mov)$/i.test(file.name)) return "Use um vídeo MP4, WebM ou MOV."
  return null
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function hasFiles(event: React.DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes("Files")
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}
