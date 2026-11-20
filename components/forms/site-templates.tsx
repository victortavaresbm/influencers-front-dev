"use client"

import { useMemo, useState } from "react"
import { Check, LayoutTemplate, Sparkles } from "lucide-react"
import { SiteThumbPreview } from "@/components/forms/site-thumb-preview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SITE_TEMPLATES, type SiteTemplate } from "@/lib/mock-data/form-templates"
import { cloneSite, type FormSite } from "@/lib/mock-data/form-site"
import type { ApplicationForm } from "@/lib/mock-data/forms"
import { useI18n } from "@/lib/i18n"

function TemplateCard({
  template,
  form,
  onUse,
}: {
  template: SiteTemplate
  form: ApplicationForm
  onUse: (site: FormSite) => void
}) {
  const { t } = useI18n()
  const site = useMemo(() => template.build(), [template])
  const page = site.pages.find((item) => item.id === site.entryPageId) ?? site.pages[0]

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
      <SiteThumbPreview form={form} site={site} page={page} className="h-64 border-b border-zinc-200">
        <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-zinc-950/75 via-zinc-950/35 to-transparent pt-16 pb-3 opacity-0 transition-opacity group-hover/thumb:opacity-100">
          <Button type="button" size="sm" onClick={() => onUse(site)}>
            <Check />
            {t("forms.templatesUse")}
          </Button>
        </div>
      </SiteThumbPreview>
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: template.accent }} />
            <p className="truncate text-sm font-semibold text-zinc-900">{template.name}</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{template.tagline}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {template.category}
        </Badge>
      </div>
    </div>
  )
}

export function SiteTemplatesDialog({
  form,
  open,
  onOpenChange,
  onApply,
}: {
  form: ApplicationForm
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (site: FormSite) => void
}) {
  const { t } = useI18n()

  const use = (site: FormSite) => {
    onApply(cloneSite(site))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-zinc-200 p-5">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-zinc-500" />
            {t("forms.templatesTitle")}
          </DialogTitle>
          <DialogDescription>{t("forms.templatesHelp")}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {SITE_TEMPLATES.map((template) => (
              <TemplateCard key={template.id} template={template} form={form} onUse={use} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SiteTemplatesButton({
  form,
  onApply,
  variant = "outline",
}: {
  form: ApplicationForm
  onApply: (site: FormSite) => void
  variant?: "outline" | "default" | "secondary"
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" variant={variant} size="sm" onClick={() => setOpen(true)}>
        <LayoutTemplate />
        {t("forms.templates")}
      </Button>
      <SiteTemplatesDialog form={form} open={open} onOpenChange={setOpen} onApply={onApply} />
    </>
  )
}
