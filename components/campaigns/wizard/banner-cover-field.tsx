"use client"

import { useCallback, useRef, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { ImagePlus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/** Proporção do card no marketplace (~2.5:1), alinhada à prévia da vitrine. */
const BANNER_WIDTH = 1920
const BANNER_HEIGHT = 768
const BANNER_ASPECT = BANNER_WIDTH / BANNER_HEIGHT

async function cropToBanner(imageSrc: string, area: Area) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener("load", () => resolve(img))
    img.addEventListener("error", () => reject(new Error("Falha ao carregar a imagem")))
    img.src = imageSrc
  })

  const canvas = document.createElement("canvas")
  canvas.width = BANNER_WIDTH
  canvas.height = BANNER_HEIGHT
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas indisponível")

  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    BANNER_WIDTH,
    BANNER_HEIGHT,
  )

  return canvas.toDataURL("image/jpeg", 0.92)
}

export function BannerCoverField({
  value,
  onChange,
}: {
  value?: string
  onChange: (coverImage: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const openEditor = useCallback((imageSrc: string) => {
    setSource(imageSrc)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setArea(null)
    setOpen(true)
  }, [])

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => openEditor(String(reader.result ?? ""))
    reader.readAsDataURL(file)
  }, [openEditor])

  async function applyCrop() {
    if (!source || !area) return
    setSaving(true)
    try {
      const next = await cropToBanner(source, area)
      onChange(next)
      setOpen(false)
      setSource(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-900">
        Banner <span className="font-normal text-zinc-500">1920×1080 · 16:9</span>
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file) readFile(file)
        }}
      />
      <div className="space-y-3">
        <button
          type="button"
          className={cn(
            "group relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 text-left transition-colors hover:border-zinc-400",
            !value && "border-dashed",
          )}
          onClick={() => {
            if (value) openEditor(value)
            else fileRef.current?.click()
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            const file = event.dataTransfer.files?.[0]
            if (file) readFile(file)
          }}
        >
          {value ? (
            <>
              <img src={value} alt="Prévia do banner" className="aspect-[5/2] w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-zinc-950/70 px-2 py-2 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Pencil className="size-3" />
                Ajustar recorte
              </span>
            </>
          ) : (
            <span className="flex aspect-[5/2] w-full flex-col items-center justify-center gap-2 px-4 text-center text-xs font-medium text-zinc-500">
              <ImagePlus className="size-5" />
              Escolher imagem
            </span>
          )}
        </button>
        <div className="space-y-2">
          <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
            Proporção panorâmica 5:2 (como no card do marketplace). Arraste a imagem ou clique para enviar e ajustar o enquadramento.
          </p>
          {value ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                Trocar imagem
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                Remover
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setSource(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl" showCloseButton={!saving}>
          <DialogHeader>
            <DialogTitle>Ajustar banner</DialogTitle>
            <DialogDescription>
              Arraste para reposicionar e use o zoom para redimensionar. A área mantém 5:2 (1920×768), igual ao card do marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-[5/2] overflow-hidden rounded-2xl bg-zinc-950">
            {source ? (
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                aspect={BANNER_ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) => setArea(croppedAreaPixels)}
                showGrid
              />
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-zoom">Zoom</Label>
            <input
              id="banner-zoom"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-zinc-900"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={saving || !area} onClick={() => void applyCrop()}>
              {saving ? "Aplicando…" : "Aplicar recorte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
