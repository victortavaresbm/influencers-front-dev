"use client"

import { useMemo, useState } from "react"
import { Blocks, Plus, Search } from "lucide-react"
import { SiteThumbPreview } from "@/components/forms/site-thumb-preview"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  COMPONENT_CATEGORIES,
  SITE_COMPONENTS,
  type ComponentCategory,
  type ComponentPreset,
} from "@/lib/mock-data/form-components"
import type { FormSite, SiteBlock, SitePage } from "@/lib/mock-data/form-site"
import type { ApplicationForm } from "@/lib/mock-data/forms"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

function ComponentCard({
  preset,
  form,
  site,
  onInsert,
}: {
  preset: ComponentPreset
  form: ApplicationForm
  site: FormSite
  onInsert: (blocks: SiteBlock[]) => void
}) {
  const { t } = useI18n()
  const blocks = useMemo(() => preset.build(site.theme.primary), [preset, site.theme.primary])
  const page: SitePage = useMemo(
    () => ({ id: "preview", name: "", kind: "custom", blocks }),
    [blocks],
  )

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
      <SiteThumbPreview form={form} site={site} page={page} className="h-40 border-b border-zinc-200">
        <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-zinc-950/75 via-zinc-950/35 to-transparent pt-14 pb-3 opacity-0 transition-opacity group-hover/thumb:opacity-100">
          <Button type="button" size="sm" onClick={() => onInsert(blocks)}>
            <Plus />
            {t("forms.componentsInsert")}
          </Button>
        </div>
      </SiteThumbPreview>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-zinc-900">{preset.name}</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{preset.description}</p>
      </div>
    </div>
  )
}

export function SiteComponentsDialog({
  form,
  site,
  open,
  onOpenChange,
  onInsert,
}: {
  form: ApplicationForm
  site: FormSite
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (blocks: SiteBlock[]) => void
}) {
  const { t } = useI18n()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<ComponentCategory | "all">("all")

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return SITE_COMPONENTS.filter((preset) => {
      if (category !== "all" && preset.category !== category) return false
      if (!text) return true
      return `${preset.name} ${preset.description}`.toLowerCase().includes(text)
    })
  }, [query, category])

  const insert = (blocks: SiteBlock[]) => {
    onInsert(blocks)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-zinc-200 p-5">
          <DialogTitle className="flex items-center gap-2">
            <Blocks className="size-4 text-zinc-500" />
            {t("forms.componentsTitle")}
          </DialogTitle>
          <DialogDescription>{t("forms.componentsHelp")}</DialogDescription>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("forms.componentsSearch")}
                className="pl-8"
              />
            </div>
            <ScrollArea className="min-w-0 flex-1">
              <div className="flex gap-1.5 pb-1">
                <Button
                  type="button"
                  size="sm"
                  variant={category === "all" ? "secondary" : "ghost"}
                  onClick={() => setCategory("all")}
                >
                  {t("forms.componentsAll")}
                </Button>
                {COMPONENT_CATEGORIES.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    size="sm"
                    variant={category === item.id ? "secondary" : "ghost"}
                    onClick={() => setCategory(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-zinc-400">{t("forms.componentsEmpty")}</p>
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((preset) => (
                <ComponentCard key={preset.id} preset={preset} form={form} site={site} onInsert={insert} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SiteComponentsButton({
  form,
  site,
  onInsert,
  className,
}: {
  form: ApplicationForm
  site: FormSite
  onInsert: (blocks: SiteBlock[]) => void
  className?: string
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" variant="outline" size="sm" className={cn("w-full", className)} onClick={() => setOpen(true)}>
        <Blocks />
        {t("forms.componentsBrowse")}
      </Button>
      <SiteComponentsDialog form={form} site={site} open={open} onOpenChange={setOpen} onInsert={onInsert} />
    </>
  )
}
