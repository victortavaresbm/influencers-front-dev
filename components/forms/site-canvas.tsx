"use client"

import {
  ClipboardList,
  Code,
  Columns3,
  GalleryHorizontal,
  Heading,
  Image,
  Images,
  LayoutGrid,
  LayoutTemplate,
  List,
  ListOrdered,
  Megaphone,
  Minus,
  MousePointerClick,
  Music,
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
import { BorderBeam, NumberTicker, Reveal } from "@/components/forms/site-animations"
import {
  blockActions,
  videoEmbed,
  type FormSite,
  type SiteAction,
  type SiteBlock,
  type SitePage,
} from "@/lib/mock-data/form-site"
import { isChoiceType, type ApplicationForm, type FormAnswer, type FormQuestion } from "@/lib/mock-data/forms"
import { ensureGoogleFont, siteFontFamily } from "@/lib/google-fonts"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const BLOCK_ICON: Record<SiteBlock["type"], typeof LayoutTemplate> = {
  banner: LayoutTemplate,
  announcement: Megaphone,
  heading: Heading,
  text: Type,
  image: Image,
  gallery: Images,
  video: Video,
  audio: Music,
  field: ClipboardList,
  button: MousePointerClick,
  features: SquareStack,
  bento: LayoutGrid,
  steps: ListOrdered,
  stats: Columns3,
  marquee: GalleryHorizontal,
  faq: List,
  testimonial: Quote,
  html: Code,
  divider: Minus,
  spacer: SeparatorHorizontal,
}

const BLOCK_KEY: Record<SiteBlock["type"], MessageKey> = {
  banner: "forms.block.banner",
  announcement: "forms.block.announcement",
  heading: "forms.block.heading",
  text: "forms.block.text",
  image: "forms.block.image",
  gallery: "forms.block.gallery",
  video: "forms.block.video",
  audio: "forms.block.audio",
  field: "forms.block.field",
  button: "forms.block.button",
  features: "forms.block.features",
  bento: "forms.block.bento",
  steps: "forms.block.steps",
  stats: "forms.block.stats",
  marquee: "forms.block.marquee",
  faq: "forms.block.faq",
  testimonial: "forms.block.testimonial",
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
  const headingFont = site.theme.heading.font
  const bodyFont = site.theme.body.font
  useEffect(() => {
    ensureGoogleFont(headingFont)
    ensureGoogleFont(bodyFont)
  }, [headingFont, bodyFont])

  const lightPage = site.theme.background === "#ffffff"
  return (
    <div
      className={cn("min-h-full font-sans", lightPage && "bg-white text-zinc-900", className)}
      style={{
        fontFamily: siteFontFamily(bodyFont),
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
  formOptions,
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
  formOptions?: { id: string; title: string }[]
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
              id={block.type === "field" ? "site-form" : undefined}
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
                formOptions={formOptions}
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
  formOptions,
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
  formOptions?: { id: string; title: string }[]
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
        className={cn("relative overflow-hidden", isFirst ? "min-h-[280px] sm:min-h-[340px]" : "min-h-[220px] sm:min-h-[240px]")}
        style={{ background: block.background }}
      >
        {block.image ? (
          <MediaCover src={block.image} playing className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50" />
        ) : null}
        {live && light ? (
          <>
            <span
              className="site-aurora -top-24 -left-16 size-72"
              style={{ background: primary, opacity: 0.28 }}
            />
            <span
              className="site-aurora -right-20 -bottom-28 size-80"
              style={{ background: primary, opacity: 0.2, "--site-aurora-duration": "11s" } as React.CSSProperties}
            />
          </>
        ) : null}
        <div
          className={cn(
            "relative mx-auto flex max-w-3xl flex-col gap-4 px-5 py-12 sm:px-6 sm:py-16",
            block.align === "center" ? "items-center text-center" : "items-start text-left",
            light ? "text-white" : "text-zinc-900",
          )}
        >
          <Reveal active={live}>
            <h2 className="text-[1.65rem] leading-tight font-semibold tracking-tight sm:text-4xl">{block.title}</h2>
          </Reveal>
          {block.subtitle ? (
            <Reveal active={live} delay={120}>
              <p className={cn("max-w-xl text-[0.95rem] leading-relaxed sm:text-base", light ? "text-white/80" : "text-zinc-600")}>
                {block.subtitle}
              </p>
            </Reveal>
          ) : null}
          {block.ctaLabel.trim() ? (
            <Reveal active={live} delay={240} className="w-full sm:w-auto">
              <Button
                type="button"
                size="lg"
                className={cn("w-full sm:w-auto", live && "site-shine")}
                style={{ background: primary, borderColor: primary, color: "#fff" }}
                onClick={(event) => {
                  if (!live) return
                  event.stopPropagation()
                  if (action) onAction(action)
                }}
              >
                {block.ctaLabel}
              </Button>
            </Reveal>
          ) : null}
        </div>
      </section>
    )
  }

  if (block.type === "heading") {
    return (
      <Reveal active={live}>
        <div className={cn("mx-auto max-w-3xl px-5 pt-8 sm:px-6 sm:pt-10", block.align === "center" && "text-center")}>
          <h2 className={cn("font-semibold tracking-tight", block.size === "lg" ? "text-xl sm:text-3xl" : "text-lg sm:text-xl")}>
            {block.text}
          </h2>
        </div>
      </Reveal>
    )
  }

  if (block.type === "text") {
    return (
      <Reveal active={live}>
        <div className={cn("mx-auto max-w-3xl px-5 py-3 sm:px-6", block.align === "center" && "text-center")}>
          <p className={cn("text-sm leading-relaxed sm:text-[0.95rem]", muted)}>{block.text}</p>
        </div>
      </Reveal>
    )
  }

  if (block.type === "image") {
    return (
      <Reveal active={live}>
        <figure className="mx-auto max-w-3xl px-5 py-5 sm:px-6 sm:py-6">
          {block.src ? (
            <img src={block.src} alt={block.alt} draggable={false} className="w-full rounded-2xl object-cover" />
          ) : (
            <div className={cn("flex h-48 items-center justify-center rounded-2xl border border-dashed text-sm", border, muted)}>
              {t("forms.imagePlaceholder")}
            </div>
          )}
          {block.caption ? <figcaption className={cn("mt-2 text-center text-xs", muted)}>{block.caption}</figcaption> : null}
        </figure>
      </Reveal>
    )
  }

  if (block.type === "video") {
    const embed = videoEmbed(block.url)
    return (
      <Reveal active={live}>
        <div className="mx-auto max-w-3xl px-5 py-5 sm:px-6 sm:py-6">
          {embed?.kind === "iframe" ? (
            <iframe title={t("forms.block.video")} src={embed.src} className="aspect-video w-full rounded-2xl border-0" allowFullScreen />
          ) : embed?.kind === "file" ? (
            <video src={embed.src} controls className="w-full rounded-2xl" />
          ) : (
            <div className={cn("flex aspect-video items-center justify-center rounded-2xl border border-dashed text-sm", border, muted)}>
              {t("forms.videoPlaceholder")}
            </div>
          )}
        </div>
      </Reveal>
    )
  }

  if (block.type === "button") {
    const action = block.action
    return (
      <Reveal active={live}>
        <div className={cn("px-5 py-5 sm:px-6 sm:py-6", block.align === "center" ? "flex justify-center" : "flex justify-start")}>
          <Button
            type="button"
            variant={block.style === "outline" ? "outline" : "default"}
            size="lg"
            className={cn("w-full sm:w-auto", live && block.style !== "outline" && "site-shine")}
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
      </Reveal>
    )
  }

  if (block.type === "features") {
    const appearance = block.appearance
    return (
      <section className="mx-auto max-w-3xl px-5 py-7 sm:px-6 sm:py-8">
        {block.title ? (
          <Reveal active={live}>
            <h3 className="mb-5 text-lg font-semibold tracking-tight sm:mb-6 sm:text-xl">{block.title}</h3>
          </Reveal>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {block.items.map((entry, index) => (
            <Reveal key={entry.id} active={live} delay={index * 110} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl border p-5 sm:p-5",
                  !appearance && border,
                  !appearance && card,
                  live && "site-lift",
                )}
                style={
                  appearance
                    ? { background: appearance.background, color: appearance.color, borderColor: appearance.border }
                    : undefined
                }
              >
                {live ? <BorderBeam color={primary} duration={6 + index} /> : null}
                <span
                  className="flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: primary }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-base font-semibold tracking-tight">{entry.title}</p>
                <p className={cn("text-sm leading-relaxed", !appearance && muted)} style={appearance ? { opacity: 0.72 } : undefined}>
                  {entry.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    )
  }

  if (block.type === "stats") {
    return (
      <section className="mx-auto grid max-w-3xl grid-cols-3 gap-2 px-5 py-7 sm:gap-4 sm:px-6 sm:py-8">
        {block.items.map((entry, index) => (
          <Reveal key={entry.id} active={live} delay={index * 110}>
            <div className={cn("rounded-2xl border px-2 py-4 text-center sm:px-3 sm:py-5", border, card)}>
              <p className="text-lg font-semibold tracking-tight break-words sm:text-2xl" style={{ color: primary }}>
                <NumberTicker value={entry.title} animate={live} />
              </p>
              <p className={cn("mt-1.5 text-[11px] leading-snug sm:text-xs", muted)}>{entry.text}</p>
            </div>
          </Reveal>
        ))}
      </section>
    )
  }

  if (block.type === "faq") {
    return (
      <section className="mx-auto max-w-3xl px-5 py-7 sm:px-6 sm:py-8">
        {block.title ? (
          <Reveal active={live}>
            <h3 className="mb-5 text-lg font-semibold tracking-tight sm:text-xl">{block.title}</h3>
          </Reveal>
        ) : null}
        <div className="space-y-3">
          {block.items.map((entry, index) => (
            <Reveal key={entry.id} active={live} delay={index * 90}>
              <div className={cn("rounded-2xl border p-4 sm:p-5", border, card)}>
                <p className="text-sm font-semibold tracking-tight sm:text-base">{entry.title}</p>
                <p className={cn("mt-2 text-sm leading-relaxed", muted)}>{entry.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    )
  }

  if (block.type === "testimonial") {
    return (
      <Reveal active={live}>
        <figure className="mx-auto max-w-2xl px-5 py-8 text-center sm:px-6 sm:py-10">
          <blockquote className="text-base leading-relaxed font-medium tracking-tight sm:text-lg">“{block.quote}”</blockquote>
          <figcaption className={cn("mt-4 text-sm", muted)}>
            {block.author}
            {block.role ? ` · ${block.role}` : ""}
          </figcaption>
        </figure>
      </Reveal>
    )
  }

  if (block.type === "field") {
    const question = form.questions.find((item) => item.id === block.questionId)
    return (
      <section className="mx-auto max-w-xl px-5 py-3 sm:px-6" id="site-form">
        <Reveal active={live}>
          <FieldPreview question={question} border={border} muted={muted} primary={site.theme.primary} />
        </Reveal>
      </section>
    )
  }

  if (block.type === "audio") {
    return (
      <section className="mx-auto max-w-xl px-5 py-4 sm:px-6">
        {block.title ? <p className={cn("mb-2 text-sm font-medium", muted)}>{block.title}</p> : null}
        {block.url ? (
          <audio controls src={block.url} className="w-full" />
        ) : (
          <div className={cn("rounded-xl border border-dashed px-4 py-6 text-center text-sm", border, muted)}>
            {t("forms.audioPlaceholder")}
          </div>
        )}
      </section>
    )
  }

  if (block.type === "announcement") {
    const action = blockActions(block)
    const light = block.tone === "light"
    return (
      <div
        className="flex w-full flex-col items-center justify-center gap-1 px-4 py-3 text-center text-sm sm:flex-row sm:flex-wrap sm:gap-x-2 sm:gap-y-1 sm:py-2.5"
        style={{ background: block.background, color: light ? "#fafafa" : "#18181b" }}
      >
        <span className="leading-snug">{block.text}</span>
        {block.ctaLabel.trim() ? (
          <button
            type="button"
            className="font-semibold underline underline-offset-2"
            style={{ color: light ? "#fafafa" : primary }}
            onClick={(event) => {
              if (!live) return
              event.stopPropagation()
              if (action) onAction(action)
            }}
          >
            {block.ctaLabel}
          </button>
        ) : null}
      </div>
    )
  }

  if (block.type === "marquee") {
    const labels = block.items.map((entry) => entry.title).filter(Boolean)
    if (labels.length === 0) {
      return (
        <div className={cn("mx-auto max-w-3xl px-5 py-6 text-center text-sm sm:px-6 sm:py-7", muted)}>{t("forms.marqueeEmpty")}</div>
      )
    }
    const row = [...labels, ...labels]
    return (
      <Reveal active={live}>
        <div className="overflow-hidden py-5 sm:py-7 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className={cn("flex w-max items-center gap-8 sm:gap-12", live && "site-marquee")}>
            {row.map((label, index) => (
              <span key={index} className={cn("text-base font-semibold tracking-tight whitespace-nowrap sm:text-lg", muted)}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    )
  }

  if (block.type === "bento") {
    const appearance = block.appearance
    const spans = ["sm:col-span-2 sm:row-span-2", "", "", "sm:col-span-2", "", ""]
    return (
      <section className="mx-auto max-w-3xl px-5 py-7 sm:px-6 sm:py-8">
        {block.title ? (
          <Reveal active={live}>
            <h3 className="mb-5 text-lg font-semibold tracking-tight sm:mb-6 sm:text-xl">{block.title}</h3>
          </Reveal>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3 sm:[grid-auto-rows:minmax(120px,1fr)]">
          {block.items.map((entry, index) => (
            <div key={entry.id} className={cn("min-h-[112px] sm:min-h-[120px]", spans[index] ?? "")}>
              <Reveal active={live} delay={index * 90} className="h-full">
                <div
                  className={cn(
                    "relative flex h-full flex-col justify-end gap-1.5 overflow-hidden rounded-2xl border p-5",
                    !appearance && border,
                    !appearance && card,
                    live && "site-lift",
                  )}
                  style={
                    appearance
                      ? { background: appearance.background, color: appearance.color, borderColor: appearance.border }
                      : undefined
                  }
                >
                  {live ? <BorderBeam color={primary} duration={6 + index} /> : null}
                  <p className="text-base font-semibold tracking-tight">{entry.title}</p>
                  <p
                    className={cn("text-sm leading-relaxed", !appearance && muted)}
                    style={appearance ? { opacity: 0.72 } : undefined}
                  >
                    {entry.text}
                  </p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (block.type === "steps") {
    return (
      <section className="mx-auto max-w-3xl px-5 py-7 sm:px-6 sm:py-8">
        {block.title ? (
          <Reveal active={live}>
            <h3 className="mb-5 text-lg font-semibold tracking-tight sm:mb-6 sm:text-xl">{block.title}</h3>
          </Reveal>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {block.items.map((entry, index) => (
            <Reveal key={entry.id} active={live} delay={index * 110}>
              <div className="flex gap-3 sm:flex-col sm:gap-0">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white sm:mb-3"
                  style={{ background: primary }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold tracking-tight">{entry.title}</p>
                  <p className={cn("mt-1 text-sm leading-relaxed", muted)}>{entry.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    )
  }

  if (block.type === "gallery") {
    return (
      <section className="mx-auto max-w-3xl px-5 py-7 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-3">
          {block.items.map((img, index) => (
            <Reveal key={img.id} active={live} delay={index * 80}>
              <figure className={cn("overflow-hidden rounded-2xl border", border, card)}>
                {img.src ? (
                  <img src={img.src} alt={img.caption} draggable={false} className="aspect-[4/3] w-full object-cover sm:aspect-square" />
                ) : (
                  <div className={cn("flex aspect-[4/3] items-center justify-center text-xs sm:aspect-square", muted)}>
                    {t("forms.imagePlaceholder")}
                  </div>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
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

// A non-interactive preview of a single question (field block) rendered on the
// canvas. The live, submitting runtime is handled by the SitePlayer.
function FieldPreview({
  question,
  border,
  muted,
  primary,
}: {
  question?: FormQuestion
  border: string
  muted: string
  primary: string
}) {
  if (!question) {
    return <div className={cn("rounded-xl border border-dashed px-4 py-4 text-sm", border, muted)}>—</div>
  }
  const box = cn("pointer-events-none w-full rounded-lg border bg-white/60 px-3 py-2 text-sm text-zinc-400", border)
  const label = (
    <span className="mb-1.5 block text-sm font-medium">
      {question.title || "Pergunta sem título"}
      {question.required ? <span style={{ color: primary }}> *</span> : null}
    </span>
  )
  if (isChoiceType(question.type)) {
    return (
      <div>
        {label}
        <div className="flex flex-col gap-2">
          {(question.options ?? []).map((option, index) => (
            <div key={index} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", border, muted)}>
              <span
                className={cn("size-4 border", question.type === "single_choice" ? "rounded-full" : "rounded")}
                style={{ borderColor: primary }}
              />
              {option || `Opção ${index + 1}`}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (question.type === "yes_no") {
    return (
      <div>
        {label}
        <div className="flex gap-2">
          <span className={cn("rounded-lg border px-4 py-2 text-sm", border, muted)}>Sim</span>
          <span className={cn("rounded-lg border px-4 py-2 text-sm", border, muted)}>Não</span>
        </div>
      </div>
    )
  }
  if (question.type === "long_text") {
    return (
      <div>
        {label}
        <div className={cn(box, "h-20")} />
      </div>
    )
  }
  if (question.type === "video_response") {
    return (
      <div>
        {label}
        <div className={cn("flex h-24 items-center justify-center rounded-lg border border-dashed text-sm", border, muted)}>
          🎥
        </div>
      </div>
    )
  }
  return (
    <div>
      {label}
      <div className={box}>{question.help || ""}</div>
    </div>
  )
}

export { BLOCK_ICON, BLOCK_KEY }
