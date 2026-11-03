"use client"

import { useEffect, useRef, useState } from "react"
import { Film, Image as ImageIcon, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isVideoSource, videoEmbed } from "@/lib/mock-data/form-site"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Accept = "image" | "video" | "media"

const IMAGE_MAX = 10 * 1024 * 1024
const VIDEO_MAX = 100 * 1024 * 1024
const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i
const VIDEO_EXT = /\.(mp4|webm|mov)$/i
const localNames = new Map<string, string>()

export function MediaCover({
  src,
  className,
  playing = false,
}: {
  src: string
  className?: string
  playing?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const node = videoRef.current
    if (!node || !playing) return
    const start = () => {
      void node.play().catch(() => {})
    }
    if (node.readyState >= 2) start()
    else node.addEventListener("loadeddata", start, { once: true })
    return () => node.removeEventListener("loadeddata", start)
  }, [playing, src])
  if (isVideoSource(src)) {
    return (
      <video
        ref={videoRef}
        key={src}
        src={src}
        autoPlay={playing}
        muted
        loop
        playsInline
        preload={playing ? "auto" : "metadata"}
        className={className}
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={src} src={src} alt="" draggable={false} className={className} />
  )
}

export function MediaField({
  label,
  value,
  accept,
  onChange,
}: {
  label: string
  value: string
  accept: Accept
  onChange: (value: string) => void
}) {
  const { t } = useI18n()
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<MessageKey | null>(null)
  const [brokenFor, setBrokenFor] = useState<string | null>(null)
  const local = isLocalMedia(value)
  const preview = previewKind(value, accept)
  const broken = brokenFor === value
  const hint =
    accept === "video" ? t("forms.mediaVideoHint") : accept === "image" ? t("forms.mediaImageHint") : t("forms.mediaBothHint")

  function applyFile(file: File | undefined) {
    if (!file) return
    const problem = fileProblem(file, accept)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    if (isVideoFile(file)) {
      const url = URL.createObjectURL(file)
      localNames.set(url, file.name)
      onChange(url)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result)
      localNames.set(url, file.name)
      onChange(url)
    }
    reader.onerror = () => setError(accept === "video" ? "forms.mediaVideoInvalid" : "forms.mediaImageInvalid")
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-1.5 p-0.5">
      <Label>{label}</Label>
      {preview && !broken ? (
        <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
          <Preview value={value} kind={preview} onBroken={() => setBrokenFor(value)} />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1.5 right-1.5 bg-background/80"
            aria-label={t("forms.mediaRemove")}
            onClick={() => {
              setError(null)
              onChange("")
            }}
          >
            <X />
          </Button>
        </div>
      ) : null}
      {local ? (
        <p className="truncate text-xs text-muted-foreground">{localNames.get(value) || t("forms.mediaLocal")}</p>
      ) : null}
      <label
        tabIndex={0}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed px-3 py-4 text-center outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          dragging ? "border-foreground bg-muted" : "border-input bg-background hover:bg-muted/60",
        )}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return
          event.preventDefault()
          event.currentTarget.querySelector("input")?.click()
        }}
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
          applyFile(event.dataTransfer.files?.[0])
        }}
      >
        <span className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground">
          {dragging ? <Upload className="size-4" /> : accept === "video" ? <Film className="size-4" /> : <ImageIcon className="size-4" />}
        </span>
        <span className="text-xs font-medium text-foreground">{dragging ? t("forms.mediaDrop") : t("forms.mediaUpload")}</span>
        <span className="text-[11px] leading-snug text-muted-foreground">{hint}</span>
        <input
          type="file"
          accept={acceptAttr(accept)}
          tabIndex={-1}
          className="sr-only"
          aria-label={t("forms.mediaUpload")}
          onChange={(event) => {
            applyFile(event.target.files?.[0])
            event.target.value = ""
          }}
        />
      </label>
      <p className="text-xs text-muted-foreground">{t("forms.mediaOrLink")}</p>
      <Input
        value={local ? "" : value}
        spellCheck={false}
        placeholder={accept === "video" ? "https://youtube.com/watch?v=…" : "https://"}
        aria-label={t("forms.mediaLink")}
        onChange={(event) => {
          const next = event.target.value
          if (!next && local) return
          setError(null)
          onChange(next)
        }}
      />
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {t(error)}
        </p>
      ) : null}
    </div>
  )
}

function Preview({ value, kind, onBroken }: { value: string; kind: "image" | "iframe" | "file"; onBroken: () => void }) {
  const { t } = useI18n()
  if (kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={value} src={value} alt="" className="max-h-36 w-full object-cover" onError={onBroken} />
    )
  }
  const embed = videoEmbed(value)
  if (kind === "iframe" && embed?.kind === "iframe") {
    return <iframe key={embed.src} title={t("forms.block.video")} src={embed.src} className="aspect-video w-full border-0" />
  }
  if (embed?.kind === "file") {
    return <video key={embed.src} src={embed.src} controls className="max-h-36 w-full bg-black" onError={onBroken} />
  }
  return null
}

function previewKind(value: string, accept: Accept): "image" | "iframe" | "file" | null {
  if (!value.trim()) return null
  const asVideo = accept === "video" || (accept === "media" && isVideoSource(value))
  if (!asVideo) {
    if (value.startsWith("data:image/") || /^https?:\/\//i.test(value)) return "image"
    return null
  }
  return videoEmbed(value)?.kind ?? null
}

function acceptAttr(accept: Accept) {
  const image = "image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
  const video = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
  if (accept === "image") return image
  if (accept === "video") return video
  return `${image},${video}`
}

function isImageFile(file: File) {
  return /^image\/(png|jpe?g|webp|gif)$/.test(file.type) || IMAGE_EXT.test(file.name)
}

function isVideoFile(file: File) {
  return /^video\/(mp4|webm|quicktime)$/.test(file.type) || VIDEO_EXT.test(file.name)
}

function isLocalMedia(value: string) {
  return value.startsWith("blob:") || value.startsWith("data:")
}

function hasFiles(event: React.DragEvent) {
  return Array.from(event.dataTransfer.types).includes("Files")
}

function fileProblem(file: File, accept: Accept): MessageKey | null {
  const image = isImageFile(file)
  const video = isVideoFile(file)
  if (accept === "image") {
    if (!image || file.size > IMAGE_MAX) return "forms.mediaImageInvalid"
    return null
  }
  if (accept === "video") {
    if (!video || file.size > VIDEO_MAX) return "forms.mediaVideoInvalid"
    return null
  }
  if (image) return file.size > IMAGE_MAX ? "forms.mediaImageInvalid" : null
  if (video) return file.size > VIDEO_MAX ? "forms.mediaVideoInvalid" : null
  return "forms.mediaInvalid"
}
