"use client"

import { useMemo, useRef, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  Copy,
  Eye,
  GripVertical,
  Home,
  Monitor,
  PanelsTopLeft,
  Plus,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Workflow,
} from "lucide-react"
import { FontPicker } from "@/components/forms/font-picker"
import { SiteAiPanel } from "@/components/forms/site-ai-panel"
import { BLOCK_ICON, BLOCK_KEY, SiteCanvas } from "@/components/forms/site-canvas"
import { SiteFlow } from "@/components/forms/site-flow"
import { SiteComponentsButton } from "@/components/forms/site-components"
import { SiteTemplatesButton } from "@/components/forms/site-templates"
import { ColorField, SiteInspector } from "@/components/forms/site-inspector"
import { SitePlayer } from "@/components/forms/site-player"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ApplicationForm } from "@/lib/mock-data/forms"
import {
  BLOCK_GROUPS,
  cloneBlock,
  createBlock,
  createPage,
  defaultSite,
  duplicatePage,
  insertBlock,
  mapBlock,
  moveBlock,
  removeBlock,
  reorderBlock,
  removePage,
  type BlockType,
  type FormSite,
  type PageKind,
  type SiteBlock,
} from "@/lib/mock-data/form-site"
import { ORG_LOGOS } from "@/lib/mock-data/users"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const GROUP_KEY: Record<(typeof BLOCK_GROUPS)[number]["id"], MessageKey> = {
  structure: "forms.group.structure",
  content: "forms.group.content",
  media: "forms.group.media",
  conversion: "forms.group.conversion",
}

const KIND_KEY: Record<PageKind, MessageKey> = {
  landing: "forms.kindLanding",
  form: "forms.kindForm",
  thanks: "forms.kindThanks",
  custom: "forms.kindCustom",
}

type BuilderView = "visual" | "flow" | "preview"
type Device = "desktop" | "mobile"

function blockPreview(block: SiteBlock) {
  switch (block.type) {
    case "banner":
    case "features":
    case "bento":
    case "steps":
    case "faq":
    case "form":
      return block.title
    case "heading":
    case "text":
    case "announcement":
      return block.text
    case "button":
      return block.label
    case "testimonial":
      return block.quote
    case "image":
      return block.alt || block.caption
    case "video":
      return block.url
    case "stats":
    case "marquee":
      return block.items.map((item) => item.title).filter(Boolean).join(" · ")
    case "gallery":
    case "html":
    case "divider":
    case "spacer":
      return ""
  }
}

export function SiteBuilder({
  form,
  onChange,
}: {
  form: ApplicationForm
  onChange: (next: ApplicationForm) => void
}) {
  const { t } = useI18n()
  const primary = ORG_LOGOS[form.organizationId]?.color ?? "#18181b"
  const site = form.site ?? defaultSite(primary)
  const allForms = useFormStore((state) => state.forms)
  const formOptions = useMemo(
    () =>
      allForms
        .filter((item) => item.organizationId === form.organizationId && item.kind === "form" && item.status !== "arquivado")
        .map((item) => ({ id: item.id, title: item.title })),
    [allForms, form.organizationId],
  )
  const [pageId, setPageId] = useState(site.entryPageId)
  const [blockId, setBlockId] = useState<string | null>(null)
  const [view, setView] = useState<BuilderView>("visual")
  const [device, setDevice] = useState<Device>("desktop")
  const [chat, setChat] = useState(false)
  const [appearanceHeight, setAppearanceHeight] = useState<number | null>(null)
  const asideRef = useRef<HTMLElement>(null)
  const dragId = useRef<string | null>(null)

  const resizeAppearance = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    const panel = event.currentTarget.parentElement
    const startHeight = appearanceHeight ?? panel?.getBoundingClientRect().height ?? 260
    const startY = event.clientY
    const max = Math.max(180, (asideRef.current?.clientHeight ?? 480) - 96)
    const previousCursor = document.body.style.cursor
    const previousSelect = document.body.style.userSelect
    document.body.style.cursor = "row-resize"
    document.body.style.userSelect = "none"
    const move = (ev: PointerEvent) => {
      const next = startHeight + (startY - ev.clientY)
      setAppearanceHeight(Math.round(Math.min(max, Math.max(180, next))))
    }
    const stop = () => {
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousSelect
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
  }

  const page = site.pages.find((item) => item.id === pageId) ?? site.pages[0]
  const selected = page?.blocks.find((block) => block.id === blockId)

  const patchSite = (next: FormSite) => {
    const pages = next.pages
    if (!pages.some((item) => item.id === pageId) && pages[0]) setPageId(pages[0].id)
    onChange({ ...form, site: next })
  }

  const addPage = (kind: PageKind) => {
    const created = createPage(
      kind,
      kind === "landing"
        ? t("forms.pageLanding")
        : kind === "form"
          ? t("forms.pageForm")
          : kind === "thanks"
            ? t("forms.pageThanks")
            : t("forms.pageCustom"),
    )
    patchSite({
      ...site,
      pages: [...site.pages, created],
      entryPageId: kind === "landing" && !site.pages.some((item) => item.kind === "landing") ? created.id : site.entryPageId,
      fallbackPageId: kind === "thanks" && !site.pages.some((item) => item.kind === "thanks") ? created.id : site.fallbackPageId,
    })
    setPageId(created.id)
    setBlockId(null)
    setView("visual")
  }

  const addBlock = (type: BlockType) => {
    if (!page) return
    const block = createBlock(type)
    patchSite(insertBlock(site, page.id, block, blockId ?? undefined))
    setBlockId(block.id)
    setView("visual")
  }

  const applyTemplate = (next: FormSite) => {
    patchSite(next)
    setPageId(next.entryPageId)
    setBlockId(null)
    setView("visual")
  }

  const insertComponent = (blocks: SiteBlock[]) => {
    if (!page || blocks.length === 0) return
    let next = site
    let afterId = blockId ?? undefined
    for (const block of blocks) {
      next = insertBlock(next, page.id, block, afterId)
      afterId = block.id
    }
    patchSite(next)
    setBlockId(blocks[blocks.length - 1].id)
    setView("visual")
  }

  const palette = BLOCK_GROUPS.map((group) => (
        <div key={group.id} className="space-y-2">
          <p className="px-1 text-[11px] font-medium tracking-wide text-zinc-400 uppercase">{t(GROUP_KEY[group.id])}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {group.types.map((type) => {
              const Icon = BLOCK_ICON[type]
              return (
                <Button
                  key={type}
                  type="button"
                  variant="outline"
                  className="h-auto flex-col items-center gap-1 px-2 py-2 text-[11px] font-normal"
                  onClick={() => addBlock(type)}
                >
                  <Icon className="size-4" />
                  {t(BLOCK_KEY[type])}
                </Button>
              )
            })}
          </div>
        </div>
      ))

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden border-t border-zinc-200 bg-white">
      <aside ref={asideRef} className="flex min-h-0 w-[16.8rem] shrink-0 flex-col border-r border-zinc-200">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-xs font-medium text-zinc-500">{t("forms.pagesTree")}</p>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={t("forms.addPage")} />}>
              <Plus />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => addPage("landing")}>{t("forms.pageLanding")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addPage("form")}>{t("forms.pageForm")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addPage("thanks")}>{t("forms.pageThanks")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addPage("custom")}>{t("forms.pageCustom")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ScrollArea className="min-h-0 flex-1 overflow-hidden">
          <div className="space-y-1 p-3">
            {site.pages.map((item) => (
              <div key={item.id} className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPageId(item.id)
                    setBlockId(null)
                    setView("visual")
                  }}
                  className={cn(
                    "h-auto min-w-0 flex-1 justify-start px-2 py-1.5 text-left",
                    item.id === page?.id && "bg-zinc-100",
                  )}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1">
                      {item.id === site.entryPageId ? (
                        <Home className="size-3 text-zinc-400" />
                      ) : item.kind === "form" ? (
                        <ClipboardList className="size-3 text-zinc-400" />
                      ) : null}
                      <span className="block truncate text-sm font-medium text-zinc-900">{item.name}</span>
                    </span>
                    <span className="block text-[11px] font-normal text-zinc-400">{t(KIND_KEY[item.kind])}</span>
                  </span>
                </Button>
                <ActionsMenu
                  trigger="ellipsis"
                  items={[
                    { label: t("forms.setEntry"), icon: Home, onSelect: () => patchSite({ ...site, entryPageId: item.id }) },
                    { label: t("forms.setFallback"), icon: Star, onSelect: () => patchSite({ ...site, fallbackPageId: item.id }) },
                    {
                      label: t("forms.duplicatePage"),
                      icon: Copy,
                      onSelect: () => {
                        const next = duplicatePage(site, item.id)
                        const added = next.pages[next.pages.length - 1]
                        patchSite(next)
                        if (added) setPageId(added.id)
                      },
                    },
                    {
                      label: t("forms.deletePage"),
                      icon: Trash2,
                      destructive: true,
                      disabled: site.pages.length <= 1,
                      onSelect: () => patchSite(removePage(site, item.id)),
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex min-h-0 flex-1 flex-col border-t border-zinc-200">
          <p className="px-3 pt-3 text-xs font-medium text-zinc-500">{t("forms.blocks")}</p>
          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="space-y-1 p-3">
              {!page || page.blocks.length === 0 ? (
                <p className="px-1 text-xs text-zinc-400">{t("forms.blocksEmpty")}</p>
              ) : (
                page.blocks.map((block) => {
                  const Icon = BLOCK_ICON[block.type]
                  const preview = blockPreview(block)
                  return (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(event) => {
                        dragId.current = block.id
                        event.dataTransfer.effectAllowed = "move"
                        event.dataTransfer.setData("text/plain", block.id)
                      }}
                      onDragEnd={() => {
                        dragId.current = null
                      }}
                      onDragOver={(event) => {
                        event.preventDefault()
                        event.dataTransfer.dropEffect = "move"
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        const fromId = dragId.current
                        dragId.current = null
                        if (!fromId || fromId === block.id) return
                        const from = page.blocks.findIndex((item) => item.id === fromId)
                        const to = page.blocks.findIndex((item) => item.id === block.id)
                        patchSite(reorderBlock(site, page.id, from, to))
                      }}
                      className="flex cursor-grab items-center gap-1 rounded-lg active:cursor-grabbing"
                    >
                      <span aria-hidden className="text-zinc-400">
                        <GripVertical className="size-4" />
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setBlockId(block.id)
                          setView("visual")
                          document.querySelector(`[data-block-id="${block.id}"]`)?.scrollIntoView({ block: "nearest" })
                        }}
                        className={cn(
                          "h-auto min-w-0 flex-1 justify-start px-2 py-1.5 text-left",
                          block.id === blockId && "bg-zinc-100",
                        )}
                      >
                        <Icon className="size-4 shrink-0 text-zinc-400" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-zinc-900">
                            {preview || t(BLOCK_KEY[block.type])}
                          </span>
                          {preview ? (
                            <span className="block truncate text-[11px] font-normal text-zinc-400">
                              {t(BLOCK_KEY[block.type])}
                            </span>
                          ) : null}
                        </span>
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
        <div
          className={cn(
            "flex min-h-0 shrink flex-col border-t border-zinc-200",
            appearanceHeight ? "overflow-hidden" : "max-h-[70%] overflow-y-auto",
          )}
          style={appearanceHeight ? { height: appearanceHeight } : undefined}
        >
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label={t("forms.resizeHeight")}
            aria-valuemin={180}
            aria-valuenow={appearanceHeight ?? undefined}
            className="sticky top-0 z-10 flex h-2 shrink-0 cursor-row-resize items-center justify-center bg-white"
            onPointerDown={resizeAppearance}
          >
            <span className="h-1 w-8 rounded-full bg-zinc-300" />
          </div>
          <div className={cn("space-y-3 p-4 pt-2", appearanceHeight && "min-h-0 flex-1 overflow-y-auto")}>
            <p className="text-xs font-medium text-zinc-500">{t("forms.theme")}</p>
            <ColorField
              label={t("forms.themePrimary")}
              value={site.theme.primary}
              onChange={(color) => patchSite({ ...site, theme: { ...site.theme, primary: color } })}
            />
            <ColorField
              label={t("forms.themeBackground")}
              value={site.theme.background}
              onChange={(color) => patchSite({ ...site, theme: { ...site.theme, background: color } })}
            />
            <div className="space-y-1.5">
              <Label>{t("forms.themeFont")}</Label>
              <FontPicker value={site.theme.font} onChange={(font) => patchSite({ ...site, theme: { ...site.theme, font } })} />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-50">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 py-2">
          <Tabs value={view} onValueChange={(value) => value && setView(value as BuilderView)}>
            <TabsList>
              <TabsTrigger value="visual">
                <PanelsTopLeft />
                {t("forms.viewVisual")}
              </TabsTrigger>
              <TabsTrigger value="flow">
                <Workflow />
                {t("forms.viewFlow")}
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye />
                {t("forms.viewPreview")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-1">
            {(view === "visual" || view === "preview") && (
              <>
                <Button
                  type="button"
                  variant={device === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDevice("desktop")}
                >
                  <Monitor />
                  {t("forms.previewDesktop")}
                </Button>
                <Button
                  type="button"
                  variant={device === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDevice("mobile")}
                >
                  <Smartphone />
                  {t("forms.previewMobile")}
                </Button>
              </>
            )}
            <SiteTemplatesButton form={{ ...form, site }} onApply={applyTemplate} />
            <Button type="button" variant={chat ? "secondary" : "outline"} size="sm" onClick={() => setChat((current) => !current)}>
              <Sparkles />
              {t("forms.ai")}
            </Button>
          </div>
        </div>

        {view === "visual" && page ? (
          <div className="flex min-h-0 flex-1 flex-col" onClick={() => setBlockId(null)}>
            <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2">
              <Input
                value={page.name}
                onChange={(event) =>
                  patchSite({
                    ...site,
                    pages: site.pages.map((item) => (item.id === page.id ? { ...item, name: event.target.value } : item)),
                  })
                }
                className="h-8 max-w-xs"
                aria-label={t("forms.pageName")}
              />
              {page.id === site.entryPageId ? <Badge variant="secondary">{t("forms.entryBadge")}</Badge> : null}
              {page.id === site.fallbackPageId ? <Badge variant="secondary">{t("forms.fallbackBadge")}</Badge> : null}
            </div>
            <ScrollArea className="min-h-0 flex-1 overflow-hidden">
              <div className="min-h-full">
                <div className={cn("mx-auto min-h-full p-6", device === "mobile" ? "max-w-[392px]" : "max-w-4xl")}>
                  <div className={cn("min-h-full", device === "mobile" && "overflow-hidden rounded-[28px] border border-zinc-200 shadow-sm")}>
                    <SiteCanvas
                      form={form}
                      site={site}
                      page={page}
                      mode="edit"
                      formOptions={formOptions}
                      selectedBlockId={blockId ?? undefined}
                      onSelectBlock={setBlockId}
                      onReorder={(fromId, toId, place) => {
                        const from = page.blocks.findIndex((item) => item.id === fromId)
                        let to = page.blocks.findIndex((item) => item.id === toId)
                        if (from < 0 || to < 0 || from === to) return
                        if (place === "after") to += 1
                        if (from < to) to -= 1
                        patchSite(reorderBlock(site, page.id, from, to))
                      }}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : null}

        {view === "flow" ? (
          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="mx-auto max-w-2xl p-6">
              <SiteFlow
                form={form}
                site={site}
                selectedPageId={page?.id ?? ""}
                onSelectPage={(id) => {
                  setPageId(id)
                  setView("visual")
                }}
                onChange={patchSite}
              />
            </div>
          </ScrollArea>
        ) : null}

        {view === "preview" ? (
          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className={cn(device === "desktop" && "mx-auto max-w-4xl p-4")}>
              <SitePlayer form={{ ...form, site }} preview device={device} />
            </div>
          </ScrollArea>
        ) : null}
      </div>

      <aside className="flex min-h-0 w-72 shrink-0 flex-col border-l border-zinc-200 bg-white">
        {chat ? (
          <SiteAiPanel
            form={{ ...form, site }}
            site={site}
            onApply={(next) => {
              patchSite(next)
              setPageId(next.entryPageId)
              setBlockId(null)
            }}
          />
        ) : selected && page ? (
          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="p-4">
              <SiteInspector
                site={site}
                block={selected}
                formOptions={formOptions}
                onChange={(block) => patchSite(mapBlock(site, page.id, block.id, () => block))}
                onDelete={() => {
                  patchSite(removeBlock(site, page.id, selected.id))
                  setBlockId(null)
                }}
              />
              <div className="mt-4">
                <ActionsMenu
                  align="start"
                  items={[
                    {
                      label: t("forms.moveUp"),
                      icon: ArrowUp,
                      onSelect: () => patchSite(moveBlock(site, page.id, selected.id, -1)),
                    },
                    {
                      label: t("forms.moveDown"),
                      icon: ArrowDown,
                      onSelect: () => patchSite(moveBlock(site, page.id, selected.id, 1)),
                    },
                    {
                      label: t("forms.duplicateBlock"),
                      icon: Copy,
                      onSelect: () => {
                        const copy = cloneBlock(selected)
                        patchSite(insertBlock(site, page.id, copy, selected.id))
                        setBlockId(copy.id)
                      },
                    },
                  ]}
                />
              </div>
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="space-y-4 p-3">
              <SiteComponentsButton form={{ ...form, site }} site={site} onInsert={insertComponent} />
              <p className="px-1 text-xs font-medium text-zinc-500">{t("forms.elements")}</p>
              {palette}
            </div>
          </ScrollArea>
        )}
      </aside>
    </div>
  )
}
