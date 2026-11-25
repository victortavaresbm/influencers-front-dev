"use client"

import { useState } from "react"
import { ClipboardList, FileText, Flag, Home, Plus, Trash2, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  defaultListAppearance,
  uid,
  type FormSite,
  type GalleryImage,
  type ListItem,
  type PageKind,
  type SiteAction,
  type SiteBlock,
} from "@/lib/mock-data/form-site"
import { useI18n } from "@/lib/i18n"

const BUTTON_EMOJIS = ["🚀", "✨", "💌", "🎯", "⭐", "🔥", "🧡", "💜", "🙌", "👋", "✅", "💡", "🎉", "💎", "🌿", "🏆", "💪", "📣"]

const PAGE_KIND_ICON: Record<PageKind, LucideIcon> = {
  landing: Home,
  form: ClipboardList,
  thanks: Flag,
  custom: FileText,
}

function EmojiPicker({ value, onChange }: { value?: string; onChange: (emoji: string) => void }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger render={<Button type="button" variant="outline" className="w-full justify-start" />}>
        {value ? <span aria-hidden className="text-base leading-none">{value}</span> : null}
        {value ?? t("forms.buttonEmojiPick")}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto p-2">
        <div className="grid grid-cols-6 gap-1">
          {BUTTON_EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              type="button"
              variant={value === emoji ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label={emoji}
              onClick={() => {
                onChange(emoji)
                setOpen(false)
              }}
            >
              <span className="text-base leading-none">{emoji}</span>
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
import { MediaField } from "@/components/forms/media-field"
import { BLOCK_ICON, BLOCK_KEY } from "@/components/forms/site-canvas"

export function SiteInspector({
  site,
  block,
  formOptions,
  onCreatePage,
  onChange,
  onDelete,
}: {
  site: FormSite
  block: SiteBlock
  formOptions?: { id: string; title: string }[]
  onCreatePage?: () => string
  onChange: (block: SiteBlock) => void
  onDelete: () => void
}) {
  const { t } = useI18n()
  const Icon = BLOCK_ICON[block.type]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-zinc-900">
          <Icon className="size-4 shrink-0 text-zinc-500" />
          <span className="truncate">{t(BLOCK_KEY[block.type])}</span>
        </p>
        <Button type="button" variant="destructive" size="icon-sm" aria-label={t("forms.deleteBlock")} onClick={onDelete}>
          <Trash2 />
        </Button>
      </div>
      <p className="text-xs text-zinc-400">{t("forms.inspector")}</p>
      <Tabs defaultValue="content">
        <TabsList className="w-full">
          <TabsTrigger value="style">{t("forms.styleTab")}</TabsTrigger>
          <TabsTrigger value="content">{t("forms.contentTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <BlockFields
            pane="content"
            site={site}
            block={block}
            formOptions={formOptions}
            onCreatePage={onCreatePage}
            onChange={onChange}
          />
        </TabsContent>
        <TabsContent value="style">
          <BlockFields pane="style" site={site} block={block} onChange={onChange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BlockFields({
  pane,
  site,
  block,
  formOptions,
  onCreatePage,
  onChange,
}: {
  pane: "content" | "style"
  site: FormSite
  block: SiteBlock
  formOptions?: { id: string; title: string }[]
  onCreatePage?: () => string
  onChange: (block: SiteBlock) => void
}) {
  const { t } = useI18n()
  const fields =
    pane === "content" ? contentFields(site, block, onChange, t, formOptions, onCreatePage) : styleFields(site, block, onChange, t)
  if (!fields) {
    return <p className="text-sm text-zinc-500">{t(pane === "content" ? "forms.contentEmpty" : "forms.styleEmpty")}</p>
  }
  return <div className="space-y-3">{fields}</div>
}

function contentFields(
  site: FormSite,
  block: SiteBlock,
  onChange: (block: SiteBlock) => void,
  t: ReturnType<typeof useI18n>["t"],
  formOptions?: { id: string; title: string }[],
  onCreatePage?: () => string,
) {
  if (block.type === "banner") {
    return (
      <>
        <Field label={t("forms.blockTitle")}>
          <Input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} />
        </Field>
        <Field label={t("forms.blockSubtitle")}>
          <Textarea rows={3} value={block.subtitle} onChange={(event) => onChange({ ...block, subtitle: event.target.value })} />
        </Field>
        <MediaField
          label={t("forms.blockMedia")}
          value={block.image}
          accept="media"
          onChange={(image) => onChange({ ...block, image })}
        />
        <Field label={t("forms.ctaLabel")}>
          <Input value={block.ctaLabel} onChange={(event) => onChange({ ...block, ctaLabel: event.target.value })} />
        </Field>
        <ActionFields site={site} action={block.action} onCreatePage={onCreatePage} onChange={(action) => onChange({ ...block, action })} />
      </>
    )
  }

  if (block.type === "heading") {
    return (
      <Field label={t("forms.blockText")}>
        <Input value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} />
      </Field>
    )
  }

  if (block.type === "text") {
    return (
      <Field label={t("forms.blockText")}>
        <Textarea rows={5} value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} />
      </Field>
    )
  }

  if (block.type === "image") {
    return (
      <>
        <MediaField label={t("forms.blockImage")} value={block.src} accept="image" onChange={(src) => onChange({ ...block, src })} />
        <Field label={t("forms.blockAlt")}>
          <Input value={block.alt} onChange={(event) => onChange({ ...block, alt: event.target.value })} />
        </Field>
        <Field label={t("forms.blockCaption")}>
          <Input value={block.caption} onChange={(event) => onChange({ ...block, caption: event.target.value })} />
        </Field>
      </>
    )
  }

  if (block.type === "video") {
    return (
      <MediaField label={t("forms.blockVideo")} value={block.url} accept="video" onChange={(url) => onChange({ ...block, url })} />
    )
  }

  if (block.type === "button") {
    return (
      <>
        <Field label={t("forms.ctaLabel")}>
          <Input value={block.label} onChange={(event) => onChange({ ...block, label: event.target.value })} />
        </Field>
        <Field label={t("forms.buttonEmoji")}>
          <EmojiPicker value={block.emoji} onChange={(emoji) => onChange({ ...block, emoji })} />
        </Field>
        <ActionFields site={site} action={block.action} onCreatePage={onCreatePage} onChange={(action) => onChange({ ...block, action })} />
      </>
    )
  }

  if (block.type === "announcement") {
    return (
      <>
        <Field label={t("forms.blockText")}>
          <Textarea rows={2} value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} />
        </Field>
        <Field label={t("forms.ctaLabel")}>
          <Input value={block.ctaLabel} onChange={(event) => onChange({ ...block, ctaLabel: event.target.value })} />
        </Field>
        <ActionFields site={site} action={block.action} onCreatePage={onCreatePage} onChange={(action) => onChange({ ...block, action })} />
      </>
    )
  }

  if (block.type === "features" || block.type === "faq" || block.type === "bento" || block.type === "steps") {
    return (
      <>
        <Field label={t("forms.blockTitle")}>
          <Input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} />
        </Field>
        <ItemsEditor items={block.items} onChange={(items) => onChange({ ...block, items })} />
      </>
    )
  }

  if (block.type === "stats" || block.type === "marquee") {
    return <ItemsEditor items={block.items} onChange={(items) => onChange({ ...block, items })} />
  }

  if (block.type === "gallery") {
    return <GalleryEditor images={block.items} onChange={(items) => onChange({ ...block, items })} />
  }

  if (block.type === "testimonial") {
    return (
      <>
        <Field label={t("forms.quote")}>
          <Textarea rows={3} value={block.quote} onChange={(event) => onChange({ ...block, quote: event.target.value })} />
        </Field>
        <Field label={t("forms.author")}>
          <Input value={block.author} onChange={(event) => onChange({ ...block, author: event.target.value })} />
        </Field>
        <Field label={t("forms.role")}>
          <Input value={block.role} onChange={(event) => onChange({ ...block, role: event.target.value })} />
        </Field>
      </>
    )
  }

  if (block.type === "audio") {
    return (
      <>
        <Field label={t("forms.blockTitle")}>
          <Input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} />
        </Field>
        <Field label={t("forms.audioUrl")}>
          <Input value={block.url} onChange={(event) => onChange({ ...block, url: event.target.value })} />
        </Field>
      </>
    )
  }

  if (block.type === "field") {
    return (
      <Field label={t("forms.fieldQuestion")}>
        <p className="text-xs text-zinc-500">{t("forms.fieldQuestionHint")}</p>
      </Field>
    )
  }

  if (block.type === "html") {
    return (
      <Field label={t("forms.htmlCode")}>
        <Textarea
          rows={8}
          className="font-mono text-xs"
          value={block.code}
          onChange={(event) => onChange({ ...block, code: event.target.value })}
        />
      </Field>
    )
  }

  return null
}

function styleFields(
  site: FormSite,
  block: SiteBlock,
  onChange: (block: SiteBlock) => void,
  t: ReturnType<typeof useI18n>["t"],
) {
  if (block.type === "banner") {
    return (
      <>
        <ColorField
          label={t("forms.blockBackground")}
          value={block.background}
          onChange={(background) => onChange({ ...block, background })}
        />
        <SelectField
          label={t("forms.blockTone")}
          value={block.tone}
          onChange={(tone) => onChange({ ...block, tone: tone as "light" | "dark" })}
          options={[
            { value: "light", label: t("forms.toneLight") },
            { value: "dark", label: t("forms.toneDark") },
          ]}
        />
        <AlignField value={block.align} onChange={(align) => onChange({ ...block, align })} />
      </>
    )
  }

  if (block.type === "heading") {
    return (
      <>
        <SelectField
          label={t("forms.headingSize")}
          value={block.size}
          onChange={(size) => onChange({ ...block, size: size as "md" | "lg" })}
          options={[
            { value: "md", label: t("forms.sizeMd") },
            { value: "lg", label: t("forms.sizeLg") },
          ]}
        />
        <AlignField value={block.align} onChange={(align) => onChange({ ...block, align })} />
      </>
    )
  }

  if (block.type === "text") {
    return <AlignField value={block.align} onChange={(align) => onChange({ ...block, align })} />
  }

  if (block.type === "button") {
    return (
      <>
        <SelectField
          label={t("forms.buttonStyle")}
          value={block.style}
          onChange={(style) => onChange({ ...block, style: style as "solid" | "outline" })}
          options={[
            { value: "solid", label: t("forms.styleSolid") },
            { value: "outline", label: t("forms.styleOutline") },
          ]}
        />
        <AlignField value={block.align} onChange={(align) => onChange({ ...block, align })} />
      </>
    )
  }

  if (block.type === "announcement") {
    return (
      <>
        <ColorField
          label={t("forms.blockBackground")}
          value={block.background}
          onChange={(background) => onChange({ ...block, background })}
        />
        <SelectField
          label={t("forms.blockTone")}
          value={block.tone}
          onChange={(tone) => onChange({ ...block, tone: tone as "light" | "dark" })}
          options={[
            { value: "light", label: t("forms.toneLight") },
            { value: "dark", label: t("forms.toneDark") },
          ]}
        />
      </>
    )
  }

  if (block.type === "features" || block.type === "bento") {
    const appearance = block.appearance ?? defaultListAppearance(site.theme.background)
    const setAppearance = (patch: Partial<typeof appearance>) => onChange({ ...block, appearance: { ...appearance, ...patch } })
    return (
      <>
        <ColorField
          label={t("forms.blockBackground")}
          value={appearance.background}
          onChange={(background) => setAppearance({ background })}
        />
        <ColorField
          label={t("forms.blockTextColor")}
          value={appearance.color}
          onChange={(color) => setAppearance({ color })}
        />
        <ColorField label={t("forms.blockBorder")} value={appearance.border} onChange={(border) => setAppearance({ border })} />
      </>
    )
  }

  if (block.type === "html") {
    return (
      <Field label={t("forms.htmlHeight")}>
        <Input
          type="number"
          value={block.height}
          onChange={(event) => onChange({ ...block, height: Number(event.target.value) || 160 })}
        />
      </Field>
    )
  }

  if (block.type === "spacer") {
    return (
      <SelectField
        label={t("forms.spacerSize")}
        value={block.size}
        onChange={(size) => onChange({ ...block, size: size as "sm" | "md" | "lg" })}
        options={[
          { value: "sm", label: t("forms.sizeSm") },
          { value: "md", label: t("forms.sizeMd") },
          { value: "lg", label: t("forms.sizeLg") },
        ]}
      />
    )
  }

  return null
}

function ActionFields({
  site,
  action,
  onCreatePage,
  onChange,
}: {
  site: FormSite
  action: SiteAction
  onCreatePage?: () => string
  onChange: (action: SiteAction) => void
}) {
  const { t } = useI18n()
  const kind = action.kind
  return (
    <div className="space-y-3">
      <SelectField
        label={t("forms.blockAction")}
        value={kind}
        onChange={(next) => {
          if (next === "page") onChange({ kind: "page", pageId: site.pages[0]?.id ?? "" })
          else if (next === "url") onChange({ kind: "url", url: action.kind === "url" ? action.url : "" })
          else onChange({ kind: "none" })
        }}
        options={[
          { value: "none", label: t("forms.actionNone") },
          { value: "page", label: t("forms.actionPage") },
          { value: "url", label: t("forms.actionUrl") },
        ]}
      />
      {kind === "page" ? (
        <>
          <SelectField
            label={t("forms.actionPageValue")}
            value={action.pageId}
            onChange={(pageId) => onChange({ kind: "page", pageId })}
            options={site.pages.map((page) => ({
              value: page.id,
              label: page.name,
              icon: page.final ? Flag : PAGE_KIND_ICON[page.kind],
            }))}
          />
          {onCreatePage ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onChange({ kind: "page", pageId: onCreatePage() })}
            >
              <Plus />
              {t("forms.actionCreatePage")}
            </Button>
          ) : null}
        </>
      ) : null}
      {kind === "url" ? (
        <Field label={t("forms.actionUrlValue")}>
          <Input
            placeholder="https://"
            value={action.url}
            onChange={(event) => onChange({ kind: "url", url: event.target.value })}
          />
        </Field>
      ) : null}
    </div>
  )
}

function ItemsEditor({ items, onChange }: { items: ListItem[]; onChange: (items: ListItem[]) => void }) {
  const { t } = useI18n()
  return (
    <div className="space-y-2">
      {items.map((entry, index) => (
        <div key={entry.id} className="space-y-2 rounded-lg border border-zinc-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <Input
              value={entry.title}
              placeholder={t("forms.itemTitle")}
              onChange={(event) => {
                const next = [...items]
                next[index] = { ...entry, title: event.target.value }
                onChange(next)
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("forms.removeItem")}
              onClick={() => onChange(items.filter((item) => item.id !== entry.id))}
            >
              <Trash2 />
            </Button>
          </div>
          <Textarea
            rows={2}
            value={entry.text}
            placeholder={t("forms.itemText")}
            onChange={(event) => {
              const next = [...items]
              next[index] = { ...entry, text: event.target.value }
              onChange(next)
            }}
          />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { id: uid("it"), title: "", text: "" }])}>
        {t("forms.addItem")}
      </Button>
    </div>
  )
}

function GalleryEditor({ images, onChange }: { images: GalleryImage[]; onChange: (images: GalleryImage[]) => void }) {
  const { t } = useI18n()
  return (
    <div className="space-y-2">
      {images.map((img, index) => (
        <div key={img.id} className="space-y-2 rounded-lg border border-zinc-200 p-3">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <MediaField
                label={`${t("forms.blockImage")} ${index + 1}`}
                value={img.src}
                accept="image"
                onChange={(src) => onChange(images.map((entry) => (entry.id === img.id ? { ...entry, src } : entry)))}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("forms.removeItem")}
              onClick={() => onChange(images.filter((entry) => entry.id !== img.id))}
            >
              <Trash2 />
            </Button>
          </div>
          <Input
            value={img.caption}
            placeholder={t("forms.blockCaption")}
            onChange={(event) => onChange(images.map((entry) => (entry.id === img.id ? { ...entry, caption: event.target.value } : entry)))}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...images, { id: uid("it"), src: "", caption: "" }])}
      >
        {t("forms.addImage")}
      </Button>
    </div>
  )
}

function AlignField({ value, onChange }: { value: "left" | "center"; onChange: (value: "left" | "center") => void }) {
  const { t } = useI18n()
  return (
    <SelectField
      label={t("forms.blockAlign")}
      value={value}
      onChange={(next) => onChange(next as "left" | "center")}
      options={[
        { value: "left", label: t("forms.alignLeft") },
        { value: "center", label: t("forms.alignCenter") },
      ]}
    />
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#([0-9a-f]{6})$/i.test(value) ? value : "#18181b"}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-zinc-200 bg-white p-0.5"
        />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </Field>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 p-0.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function SelectOptionLabel({ label, icon: Icon }: { label: string; icon?: LucideIcon }) {
  return (
    <>
      {Icon ? <Icon className="text-zinc-400" /> : null}
      <span className="truncate">{label}</span>
    </>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; icon?: LucideIcon }[]
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={(next) => next && onChange(next)}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {(current) => {
              const option = options.find((item) => item.value === current)
              return option ? <SelectOptionLabel label={option.label} icon={option.icon} /> : null
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <SelectOptionLabel label={option.label} icon={option.icon} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export { ColorField }
