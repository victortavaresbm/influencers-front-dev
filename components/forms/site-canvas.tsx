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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { MediaCover } from "@/components/forms/media-field"
import { SocialLinksField } from "@/components/forms/social-links-field"
import { socialLinksFilled } from "@/lib/forms/social-links"
import { BorderBeam, NumberTicker, Reveal } from "@/components/forms/site-animations"
import {
  blockActions,
  videoEmbed,
  type FormSite,
  type SiteAction,
  type SiteBlock,
  type SitePage,
} from "@/lib/mock-data/form-site"
import {
  isChoiceType,
  type AnswerValue,
  type ApplicationForm,
  type FormAnswer,
  type FormQuestion,
} from "@/lib/mock-data/forms"
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

const WIDTH_CLASS: Record<string, string> = { narrow: "max-w-xl", regular: "max-w-3xl", wide: "max-w-5xl" }
const SPACING_CLASS: Record<string, string> = { tight: "py-1", regular: "py-5", relaxed: "py-10" }

export function SiteShell({
  site,
  className,
  progress,
  children,
}: {
  site: FormSite
  className?: string
  // Form-step progress (0–1) for the header progress bar; only the live runtime
  // passes it.
  progress?: number
  children: React.ReactNode
}) {
  const theme = site.theme
  useEffect(() => {
    ensureGoogleFont(theme.heading.font)
    ensureGoogleFont(theme.body.font)
  }, [theme.heading.font, theme.body.font])

  const pageFont = siteFontFamily(theme.body.font)
  const cssVars = {
    "--site-primary": theme.primary,
    "--site-radius": `${theme.radius}px`,
    "--site-font": pageFont,
    "--site-heading-font": siteFontFamily(theme.heading.font),
    "--site-heading-color": theme.heading.color,
    "--site-heading-weight": String(theme.heading.weight),
    "--site-heading-line": String(theme.heading.lineHeight),
  } as React.CSSProperties

  return (
    <div
      className={cn("site-page relative min-h-full", className)}
      style={{
        ...cssVars,
        fontFamily: pageFont,
        fontSize: theme.body.size,
        lineHeight: theme.body.lineHeight,
        color: theme.body.color,
        textAlign: theme.align,
      }}
    >
      <ThemeBackground theme={theme} />
      <div className="relative z-10">
        {theme.logo || theme.showProgress ? <ThemeHeader theme={theme} progress={progress} /> : null}
        <div className={cn("mx-auto", WIDTH_CLASS[theme.width] ?? "max-w-3xl", SPACING_CLASS[theme.spacing] ?? "py-5")}>
          {children}
        </div>
      </div>
    </div>
  )
}

function ThemeBackground({ theme }: { theme: FormSite["theme"] }) {
  const base: React.CSSProperties = {}
  if (theme.backgroundMode === "gradient") base.background = theme.backgroundGradient
  else if (theme.backgroundMode === "image") {
    base.backgroundImage = `url(${theme.backgroundImage})`
    base.backgroundSize = "cover"
    base.backgroundPosition = "center"
  } else base.background = theme.background
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden" style={base}>
      {theme.backgroundMode === "video" && theme.backgroundVideo ? (
        <video className="absolute inset-0 size-full object-cover" src={theme.backgroundVideo} autoPlay muted loop playsInline />
      ) : null}
      <ThemeEffect effect={theme.backgroundEffect} />
    </div>
  )
}

function ThemeEffect({ effect }: { effect: FormSite["theme"]["backgroundEffect"] }) {
  if (effect === "none") return null
  if (effect === "dark") return <div className="absolute inset-0 bg-black/40" />
  if (effect === "gradient") return <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/60" />
  if (effect === "blur") return <div className="absolute inset-0 backdrop-blur-md" />
  // grain
  return (
    <div
      className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  )
}

function ThemeHeader({ theme, progress }: { theme: FormSite["theme"]; progress?: number }) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 px-5 py-3">
      {theme.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={theme.logo} alt="" className="h-7 w-auto shrink-0" />
      ) : (
        <span className="shrink-0" />
      )}
      {theme.showProgress ? (
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.round((progress ?? 0) * 100)}%`, background: theme.primary }}
          />
        </div>
      ) : null}
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
  className,
  progress,
  answers,
  invalidQuestionIds,
  footer,
  onSelectBlock,
  onReorder,
  onAction,
  onAnswer,
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
  className?: string
  progress?: number
  answers?: FormAnswer[]
  invalidQuestionIds?: string[]
  footer?: React.ReactNode
  onSelectBlock?: (id: string | null) => void
  onReorder?: (fromId: string, toId: string, place: "before" | "after") => void
  onAction?: (action: SiteAction, block: SiteBlock) => void
  onAnswer?: (questionId: string, value: AnswerValue) => void
  onSubmitForm?: (answers: FormAnswer[]) => void
  onFormDone?: () => void
}) {
  const { t } = useI18n()
  const dragId = useRef<string | null>(null)
  const dragged = useRef(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropAt, setDropAt] = useState<{ id: string; place: "before" | "after" } | null>(null)
  const editable = mode === "edit" && Boolean(onReorder)

  const firstFieldId = page.blocks.find((block) => block.type === "field")?.id
  const anchorButtonId = [...page.blocks].reverse().find((block) => block.type === "button")?.id

  return (
    <SiteShell site={site} className={className} progress={progress}>
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
                formSlot={block.id === firstFieldId ? formSlot : undefined}
                answers={answers}
                invalid={invalidQuestionIds?.includes(block.type === "field" ? block.questionId : "")}
                formOptions={formOptions}
                isFirst={index === 0}
                onAction={(action) => onAction?.(action, block)}
                onAnswer={onAnswer}
                onSubmitForm={onSubmitForm}
                onFormDone={onFormDone}
                companion={block.id === anchorButtonId ? footer : undefined}
              />
            </div>
          )
        })
      )}
      {anchorButtonId ? null : footer ? <div className="px-5 pb-8 sm:px-6">{footer}</div> : null}
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
  answers,
  invalid,
  formOptions,
  isFirst,
  onAction,
  onAnswer,
  onSubmitForm,
  onFormDone,
  companion,
}: {
  block: SiteBlock
  site: FormSite
  form: ApplicationForm
  live: boolean
  alreadySubmitted?: boolean
  formSlot?: React.ReactNode
  answers?: FormAnswer[]
  invalid?: boolean
  formOptions?: { id: string; title: string }[]
  isFirst: boolean
  onAction: (action: SiteAction) => void
  onAnswer?: (questionId: string, value: AnswerValue) => void
  onSubmitForm?: (answers: FormAnswer[]) => void
  onFormDone?: () => void
  companion?: React.ReactNode
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
          <h2
            className={cn("tracking-tight", block.size === "lg" ? "text-xl sm:text-3xl" : "text-lg sm:text-xl")}
            style={{
              fontFamily: "var(--site-heading-font)",
              color: "var(--site-heading-color)",
              fontWeight: "var(--site-heading-weight)" as unknown as number,
              lineHeight: "var(--site-heading-line)",
            }}
          >
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
        <div
          className={cn(
            "flex flex-wrap items-center gap-3 px-5 py-5 sm:px-6 sm:py-6",
            block.align === "center" ? "justify-center" : "justify-start",
          )}
        >
          {companion}
          <Button
            type="button"
            variant={block.style === "outline" ? "outline" : "default"}
            size="lg"
            className={cn(companion ? "w-auto" : "w-full sm:w-auto", live && block.style !== "outline" && "site-shine")}
            style={
              block.style === "outline"
                ? { borderColor: primary, color: primary, borderRadius: "var(--site-radius)" }
                : { background: primary, borderColor: primary, color: "#fff", borderRadius: "var(--site-radius)" }
            }
            onClick={(event) => {
              if (!live) return
              event.stopPropagation()
              onAction(action)
            }}
          >
            {block.emoji ? <span aria-hidden className="text-base leading-none">{block.emoji}</span> : null}
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {block.items.map((entry, index) => (
            <Reveal key={entry.id} active={live} delay={index * 110} className="h-full min-w-0">
              <div
                className={cn(
                  "relative flex h-full min-w-0 flex-col gap-2 overflow-hidden rounded-2xl border p-5 sm:p-5",
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
                <p className="text-base font-semibold tracking-tight break-words">{entry.title}</p>
                <p className={cn("text-sm leading-relaxed break-words", !appearance && muted)} style={appearance ? { opacity: 0.72 } : undefined}>
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
    const value = answers?.find((item) => item.questionId === block.questionId)?.value
    return (
      <section className="mx-auto max-w-xl px-5 py-3 text-left sm:px-6" id="site-form">
        <Reveal active={live}>
          {formSlot ? (
            formSlot
          ) : live && onAnswer && question ? (
            <LiveField
              question={question}
              value={value}
              invalid={!!invalid}
              border={border}
              primary={site.theme.primary}
              onChange={(next) => onAnswer(question.id, next)}
            />
          ) : (
            <FieldPreview question={question} border={border} muted={muted} primary={site.theme.primary} />
          )}
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

function LiveField({
  question,
  value,
  invalid,
  border,
  primary,
  onChange,
}: {
  question: FormQuestion
  value: AnswerValue | undefined
  invalid: boolean
  border: string
  primary: string
  onChange: (value: AnswerValue) => void
}) {
  const { t } = useI18n()
  const text = typeof value === "string" ? value : ""
  const box = "bg-white"
  const label = (
    <span className="mb-1.5 block text-sm font-medium">
      {question.title || t("forms.untitledQuestion")}
      {question.required ? <span style={{ color: primary }}> *</span> : null}
    </span>
  )
  const inputType =
    question.type === "email"
      ? "email"
      : question.type === "phone"
        ? "tel"
        : question.type === "date"
          ? "date"
          : question.type === "number"
            ? "number"
            : question.type === "link" || question.type === "video_response"
              ? "url"
              : "text"

  return (
    <div className="space-y-1.5">
      {question.type === "long_text" ? (
        <div>
          {label}
          <Textarea
            value={text}
            rows={4}
            aria-invalid={invalid}
            className={box}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      ) : question.type === "yes_no" || question.type === "single_choice" ? (
        <div>
          {label}
          <RadioGroup
            value={text}
            onValueChange={(next) => {
              if (typeof next === "string") onChange(next)
            }}
            className="grid gap-2"
          >
            {(question.type === "yes_no" ? (["yes", "no"] as const) : (question.options ?? []).filter((option) => option.trim())).map(
              (option) => {
                const optionLabel = option === "yes" ? t("forms.yes") : option === "no" ? t("forms.no") : option
                const id = `${question.id}-${option}`
                return (
                  <label key={option} htmlFor={id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-3 py-2", border)}>
                    <RadioGroupItem id={id} value={option} />
                    <Label htmlFor={id} className="cursor-pointer font-normal">
                      {optionLabel}
                    </Label>
                  </label>
                )
              },
            )}
          </RadioGroup>
        </div>
      ) : question.type === "social_links" ? (
        <div>
          {label}
          <SocialLinksField idPrefix={question.id} value={value} showInvalid={invalid} onChange={onChange} />
        </div>
      ) : question.type === "multiple_choice" ? (
        <div>
          {label}
          <div className="grid gap-2">
            {(question.options ?? [])
              .filter((option) => option.trim())
              .map((option) => {
                const selected = Array.isArray(value) ? value : []
                const checked = selected.includes(option)
                return (
                  <label key={option} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-3 py-2", border)}>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) => {
                        const on = next === true
                        onChange(on ? [...selected, option] : selected.filter((item) => item !== option))
                      }}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                )
              })}
          </div>
        </div>
      ) : (
        <div>
          {label}
          <Input
            type={inputType}
            inputMode={question.type === "phone" ? "tel" : question.type === "number" ? "numeric" : undefined}
            placeholder={question.type === "link" || question.type === "video_response" ? "https://" : undefined}
            value={text}
            aria-invalid={invalid}
            className={box}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      )}
      {question.help ? <p className="text-xs text-zinc-500">{question.help}</p> : null}
      {invalid && !(question.type === "social_links" && socialLinksFilled(value)) ? (
        <p className="text-sm text-red-600">
          {question.type === "social_links" ? t("forms.socialRequired") : t("forms.requiredHint")}
        </p>
      ) : null}
    </div>
  )
}

// A non-interactive preview of a single question (field block) rendered on the
// canvas. The live runtime edits the same block through LiveField.
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
  if (question.type === "social_links") {
    return (
      <div>
        {label}
        <div className="space-y-2">
          {["Instagram", "TikTok", "YouTube"].map((network) => (
            <div key={network} className={cn(box, "text-xs")}>
              {network}
            </div>
          ))}
        </div>
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
