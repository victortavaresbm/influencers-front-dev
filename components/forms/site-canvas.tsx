"use client"

import {
  ClipboardList,
  Code,
  Columns3,
  Heading,
  Image,
  LayoutTemplate,
  List,
  Minus,
  MousePointerClick,
  Quote,
  SeparatorHorizontal,
  SquareStack,
  Type,
  Video,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { FormRunner } from "@/components/forms/form-runner"
import { MediaCover } from "@/components/forms/media-field"
import {
  blockActions,
  videoEmbed,
  type FormSite,
  type SiteAction,
  type SiteBlock,
  type SitePage,
} from "@/lib/mock-data/form-site"
import type { ApplicationForm, FormAnswer } from "@/lib/mock-data/forms"
import { ensureGoogleFont, siteFontFamily } from "@/lib/google-fonts"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const BLOCK_ICON: Record<SiteBlock["type"], typeof LayoutTemplate> = {
  banner: LayoutTemplate,
  heading: Heading,
  text: Type,
  image: Image,
  video: Video,
  button: MousePointerClick,
  features: SquareStack,
  stats: Columns3,
  faq: List,
  testimonial: Quote,
  form: ClipboardList,
  html: Code,
  divider: Minus,
  spacer: SeparatorHorizontal,
}

const BLOCK_KEY: Record<SiteBlock["type"], MessageKey> = {
  banner: "forms.block.banner",
  heading: "forms.block.heading",
  text: "forms.block.text",
  image: "forms.block.image",
  video: "forms.block.video",
  button: "forms.block.button",
  features: "forms.block.features",
  stats: "forms.block.stats",
  faq: "forms.block.faq",
  testimonial: "forms.block.testimonial",
  form: "forms.block.form",
  html: "forms.block.html",
  divider: "forms.block.divider",
  spacer: "forms.block.spacer",
}

export function SiteShell({
  site,
  className,
  children,
}: {
  site: FormSite
  className?: string
  children: React.ReactNode
}) {
  useEffect(() => {
    ensureGoogleFont(site.theme.font)
  }, [site.theme.font])

  const lightPage = site.theme.background === "#ffffff"
  return (
    <div
      className={cn(
        "min-h-full",
        lightPage && "bg-white text-zinc-900",
        site.theme.font === "serif" && "font-serif",
        (site.theme.font === "sans" || !site.theme.font) && "font-sans",
        className,
      )}
      style={{
        fontFamily: siteFontFamily(site.theme.font),
        ...(lightPage
          ? {}
          : {
              background: site.theme.background,
              color: "#fafafa",
            }),
      }}
    >
      {children}
    </div>
  )
}

export function SiteCanvas({
  form,
  site,
  page,
  mode,
  selectedBlockId,
  alreadySubmitted,
  formSlot,
  onSelectBlock,
  onReorder,
  onAction,
  onSubmitForm,
  onFormDone,
}: {
  form: ApplicationForm
  site: FormSite
  page: SitePage
  mode: "edit" | "live"
  selectedBlockId?: string
  alreadySubmitted?: boolean
  formSlot?: React.ReactNode
  onSelectBlock?: (id: string | null) => void
  onReorder?: (fromId: string, toId: string, place: "before" | "after") => void
  onAction?: (action: SiteAction, block: SiteBlock) => void
  onSubmitForm?: (answers: FormAnswer[]) => void
  onFormDone?: () => void
}) {
  const { t } = useI18n()
  const dragId = useRef<string | null>(null)
  const dragged = useRef(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropAt, setDropAt] = useState<{ id: string; place: "before" | "after" } | null>(null)
  const editable = mode === "edit" && Boolean(onReorder)

  return (
    <SiteShell site={site}>
      {page.blocks.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-zinc-400">{t("forms.emptyPage")}</p>
      ) : (
        page.blocks.map((block, index) => {
          const selected = mode === "edit" && selectedBlockId === block.id
          return (
            <div
              key={block.id}
              id={block.type === "form" ? "site-form" : undefined}
              data-block-id={block.id}
              draggable={editable}
              className={cn(
                "relative",
                editable && "cursor-grab outline-offset-2 hover:outline hover:outline-zinc-300 active:cursor-grabbing",
                selected && "z-10 outline outline-2 outline-zinc-900 hover:outline-zinc-900",
                draggingId === block.id && "opacity-50",
              )}
              onDragStart={
                editable
                  ? (event) => {
                      const target = event.target
                      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable='true']")) {
                        event.preventDefault()
                        return
                      }
                      dragId.current = block.id
                      dragged.current = false
                      setDraggingId(block.id)
                      event.dataTransfer.effectAllowed = "move"
                      event.dataTransfer.setData("text/plain", block.id)
                    }
                  : undefined
              }
              onDragOver={
                editable
                  ? (event) => {
                      if (!dragId.current || dragId.current === block.id) return
                      event.preventDefault()
                      event.stopPropagation()
                      event.dataTransfer.dropEffect = "move"
                      const rect = event.currentTarget.getBoundingClientRect()
                      const place = event.clientY < rect.top + rect.height / 2 ? "before" : "after"
                      setDropAt((current) =>
                        current?.id === block.id && current.place === place ? current : { id: block.id, place },
                      )
                    }
                  : undefined
              }
              onDrop={
                editable
                  ? (event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      const fromId = dragId.current
                      const place =
                        dropAt?.id === block.id
                          ? dropAt.place
                          : event.clientY <
                              event.currentTarget.getBoundingClientRect().top +
                                event.currentTarget.getBoundingClientRect().height / 2
                            ? "before"
                            : "after"
                      dragId.current = null
                      setDraggingId(null)
                      setDropAt(null)
                      if (!fromId || fromId === block.id) return
                      onReorder?.(fromId, block.id, place)
                    }
                  : undefined
              }
              onDrag={() => {
                dragged.current = true
              }}
              onDragEnd={() => {
                dragId.current = null
                setDraggingId(null)
                setDropAt(null)
                window.setTimeout(() => {
                  dragged.current = false
                }, 0)
              }}
              onClick={
                mode === "edit"
                  ? (event) => {
                      event.stopPropagation()
                      if (dragged.current) {
                        dragged.current = false
                        return
                      }
                      onSelectBlock?.(block.id)
                    }
                  : undefined
              }
            >
              {dropAt?.id === block.id ? (
                <span
                  className={cn(
                    "pointer-events-none absolute inset-x-0 z-20 h-0.5 bg-zinc-900",
                    dropAt.place === "before" ? "top-0" : "bottom-0",
                  )}
                />
              ) : null}
              {mode === "edit" && selected ? (
                <span className="absolute top-2 left-2 z-10 rounded-md bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {t(BLOCK_KEY[block.type])}
                </span>
              ) : null}
              <BlockView
                block={block}
                site={site}
                form={form}
                live={mode === "live"}
                alreadySubmitted={alreadySubmitted}
                formSlot={formSlot}
                isFirst={index === 0}
                onAction={(action) => onAction?.(action, block)}
                onSubmitForm={onSubmitForm}
                onFormDone={onFormDone}
              />
            </div>
          )
        })
      )}
    </SiteShell>
  )
}

function BlockView({
  block,
  site,
  form,
  live,
  alreadySubmitted,
  formSlot,
  isFirst,
  onAction,
  onSubmitForm,
  onFormDone,
}: {
  block: SiteBlock
  site: FormSite
  form: ApplicationForm
  live: boolean
  alreadySubmitted?: boolean
  formSlot?: React.ReactNode
  isFirst: boolean
  onAction: (action: SiteAction) => void
  onSubmitForm?: (answers: FormAnswer[]) => void
  onFormDone?: () => void
}) {
  const { t } = useI18n()
  const primary = site.theme.primary
  const darkPage = site.theme.background !== "#ffffff"
  const muted = darkPage ? "text-zinc-400" : "text-zinc-500"
  const border = darkPage ? "border-zinc-800" : "border-zinc-200"
  const card = darkPage ? "bg-zinc-900" : "bg-white"

  if (block.type === "banner") {
    const light = block.tone === "light"
    const action = blockActions(block)
    return (
      <section
        className={cn("relative overflow-hidden", isFirst ? "min-h-[340px]" : "min-h-[240px]")}
        style={{ background: block.background }}
      >
        {block.image ? (
          <MediaCover src={block.image} playing className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50" />
        ) : null}
        <div
          className={cn(
            "relative mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16",
            block.align === "center" ? "items-center text-center" : "items-start text-left",
            light ? "text-white" : "text-zinc-900",
          )}
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{block.title}</h2>
          {block.subtitle ? (
            <p className={cn("max-w-xl text-sm leading-relaxed sm:text-base", light ? "text-white/80" : "text-zinc-600")}>
              {block.subtitle}
            </p>
          ) : null}
          {block.ctaLabel.trim() ? (
            <Button
              type="button"
              size="lg"
              style={{ background: primary, borderColor: primary, color: "#fff" }}
              onClick={(event) => {
                if (!live) return
                event.stopPropagation()
                if (action) onAction(action)
              }}
            >
              {block.ctaLabel}
            </Button>
          ) : null}
        </div>
      </section>
    )
  }

  if (block.type === "heading") {
    return (
      <div className={cn("mx-auto max-w-3xl px-6 pt-10", block.align === "center" && "text-center")}>
        <h2 className={cn("font-semibold tracking-tight", block.size === "lg" ? "text-2xl sm:text-3xl" : "text-xl")}>
          {block.text}
        </h2>
      </div>
    )
  }

  if (block.type === "text") {
    return (
      <div className={cn("mx-auto max-w-3xl px-6 py-3", block.align === "center" && "text-center")}>
        <p className={cn("text-sm leading-relaxed", muted)}>{block.text}</p>
      </div>
    )
  }

  if (block.type === "image") {
    return (
      <figure className="mx-auto max-w-3xl px-6 py-6">
        {block.src ? (
          <img src={block.src} alt={block.alt} draggable={false} className="w-full rounded-xl object-cover" />
        ) : (
          <div className={cn("flex h-48 items-center justify-center rounded-xl border border-dashed text-sm", border, muted)}>
            {t("forms.imagePlaceholder")}
          </div>
        )}
        {block.caption ? <figcaption className={cn("mt-2 text-center text-xs", muted)}>{block.caption}</figcaption> : null}
      </figure>
    )
  }

  if (block.type === "video") {
    const embed = videoEmbed(block.url)
    return (
      <div className="mx-auto max-w-3xl px-6 py-6">
        {embed?.kind === "iframe" ? (
          <iframe title={t("forms.block.video")} src={embed.src} className="aspect-video w-full rounded-xl border-0" allowFullScreen />
        ) : embed?.kind === "file" ? (
          <video src={embed.src} controls className="w-full rounded-xl" />
        ) : (
          <div className={cn("flex aspect-video items-center justify-center rounded-xl border border-dashed text-sm", border, muted)}>
            {t("forms.videoPlaceholder")}
          </div>
        )}
      </div>
    )
  }

  if (block.type === "button") {
    const action = block.action
    return (
      <div className={cn("px-6 py-6", block.align === "center" ? "flex justify-center" : "flex justify-start")}>
        <Button
          type="button"
          variant={block.style === "outline" ? "outline" : "default"}
          size="lg"
          style={
            block.style === "outline"
              ? { borderColor: primary, color: primary }
              : { background: primary, borderColor: primary, color: "#fff" }
          }
          onClick={(event) => {
            if (!live) return
            event.stopPropagation()
            onAction(action)
          }}
        >
          {block.label}
        </Button>
      </div>
    )
  }

  if (block.type === "features") {
    const appearance = block.appearance
    return (
      <section className="mx-auto max-w-3xl px-6 py-8">
        {block.title ? <h3 className="mb-4 text-lg font-semibold tracking-tight">{block.title}</h3> : null}
        <div className="grid gap-3 sm:grid-cols-3">
          {block.items.map((entry) => (
            <div
              key={entry.id}
              className={cn("rounded-xl border p-4", !appearance && border, !appearance && card)}
              style={
                appearance
                  ? { background: appearance.background, color: appearance.color, borderColor: appearance.border }
                  : undefined
              }
            >
              <p className="text-sm font-medium">{entry.title}</p>
              <p className={cn("mt-1 text-xs leading-relaxed", !appearance && muted)} style={appearance ? { opacity: 0.72 } : undefined}>
                {entry.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (block.type === "stats") {
    return (
      <section className="mx-auto grid max-w-3xl grid-cols-3 gap-3 px-6 py-8">
        {block.items.map((entry) => (
          <div key={entry.id} className="text-center">
            <p className="text-xl font-semibold tracking-tight sm:text-2xl" style={{ color: primary }}>
              {entry.title}
            </p>
            <p className={cn("mt-1 text-xs", muted)}>{entry.text}</p>
          </div>
        ))}
      </section>
    )
  }

  if (block.type === "faq") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-8">
        {block.title ? <h3 className="mb-4 text-lg font-semibold tracking-tight">{block.title}</h3> : null}
        <div className="space-y-3">
          {block.items.map((entry) => (
            <div key={entry.id} className={cn("rounded-xl border p-4", border, card)}>
              <p className="text-sm font-medium">{entry.title}</p>
              <p className={cn("mt-1 text-sm leading-relaxed", muted)}>{entry.text}</p>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (block.type === "testimonial") {
    return (
      <figure className="mx-auto max-w-2xl px-6 py-10 text-center">
        <blockquote className="text-lg font-medium tracking-tight">“{block.quote}”</blockquote>
        <figcaption className={cn("mt-3 text-sm", muted)}>
          {block.author}
          {block.role ? ` · ${block.role}` : ""}
        </figcaption>
      </figure>
    )
  }

  if (block.type === "form") {
    return (
      <section className="mx-auto max-w-xl px-6 py-10" id="site-form">
        {block.title ? <h3 className="mb-4 text-lg font-semibold tracking-tight">{block.title}</h3> : null}
        {formSlot ? (
          formSlot
        ) : live ? (
          <FormRunner
            form={form}
            skipIntro
            alreadySubmitted={alreadySubmitted}
            onSubmit={onSubmitForm}
            onDone={onFormDone}
          />
        ) : (
          <div className={cn("rounded-xl border border-dashed px-4 py-8 text-center text-sm", border, muted)}>
            {t("forms.formPlaceholder")}
          </div>
        )}
      </section>
    )
  }

  if (block.type === "html") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-4">
        <iframe
          title={t("forms.block.html")}
          sandbox=""
          srcDoc={block.code}
          className="w-full rounded-xl border-0"
          style={{ height: block.height }}
        />
      </div>
    )
  }

  if (block.type === "divider") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-2">
        <hr className={border} />
      </div>
    )
  }

  if (block.type === "spacer") {
    const height = block.size === "sm" ? 24 : block.size === "lg" ? 80 : 48
    return <div style={{ height }} />
  }

  return null
}

export { BLOCK_ICON, BLOCK_KEY }
