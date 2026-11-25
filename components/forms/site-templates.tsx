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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MARKET_TEMPLATES, type MarketTemplate, type MarketVariation } from "@/lib/mock-data/form-markets"
import { SITE_TEMPLATES, type SiteTemplate } from "@/lib/mock-data/form-templates"
import { cloneSite, type FormSite } from "@/lib/mock-data/form-site"
import type { ApplicationForm, FormQuestion } from "@/lib/mock-data/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"

const VARIATION_KEY: Record<MarketVariation, MessageKey> = {
  quiz: "forms.variation.quiz",
  application: "forms.variation.application",
  capture: "forms.variation.capture",
}

function adoptMarket(template: MarketTemplate) {
  const built = template.build()
  const ids = new Map<string, string>()
  const questions = built.questions.map((question) => {
    const id = `q_${crypto.randomUUID()}`
    ids.set(question.id, id)
    return {
      ...question,
      id,
      options: question.options ? [...question.options] : undefined,
    }
  })
  return { site: cloneSite(built.site, ids), questions }
}

function TemplateCard({
  template,
  form,
  category,
  onUse,
}: {
  template: SiteTemplate
  form: ApplicationForm
  category: string
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
          {category}
        </Badge>
      </div>
    </div>
  )
}

function MarketCard({
  template,
  form,
  category,
  onUse,
}: {
  template: MarketTemplate
  form: ApplicationForm
  category: string
  onUse: () => void
}) {
  const { t } = useI18n()
  const built = useMemo(() => template.build(), [template])
  const page = built.site.pages.find((item) => item.id === built.site.entryPageId) ?? built.site.pages[0]
  const preview = { ...form, questions: built.questions, site: built.site }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
      <SiteThumbPreview form={preview} site={built.site} page={page} className="h-64 border-b border-zinc-200">
        <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-zinc-950/75 via-zinc-950/35 to-transparent pt-16 pb-3 opacity-0 transition-opacity group-hover/thumb:opacity-100">
          <Button type="button" size="sm" onClick={onUse}>
            <Check />
            {t("forms.templatesUse")}
          </Button>
        </div>
      </SiteThumbPreview>
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: template.accent }} />
            <p className="truncate text-sm font-semibold text-zinc-900">{template.market}</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{template.tagline}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {category}
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
  onApply: (site: FormSite, questions?: FormQuestion[]) => void
}) {
  const { t } = useI18n()

  const applyStyle = (site: FormSite) => {
    onApply(cloneSite(site))
    onOpenChange(false)
  }

  const applyMarket = (template: MarketTemplate) => {
    const adopted = adoptMarket(template)
    onApply(adopted.site, adopted.questions)
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
        <Tabs defaultValue="markets" className="min-h-0 flex-1">
          <div className="border-b border-zinc-200 px-5 py-3">
            <TabsList>
              <TabsTrigger value="markets">{t("forms.templateMarkets")}</TabsTrigger>
              <TabsTrigger value="styles">{t("forms.templateStyles")}</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="markets" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {MARKET_TEMPLATES.map((template) => (
                <MarketCard
                  key={template.id}
                  template={template}
                  form={form}
                  category={t(VARIATION_KEY[template.variation])}
                  onUse={() => applyMarket(template)}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="styles" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {SITE_TEMPLATES.map((template) => (
                <TemplateCard key={template.id} template={template} form={form} category={template.category} onUse={applyStyle} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
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
  onApply: (site: FormSite, questions?: FormQuestion[]) => void
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
