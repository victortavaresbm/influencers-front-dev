"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/stores/auth"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
import type { FormTemplate } from "@/lib/mock-data/forms"
import { SITE_TEMPLATES } from "@/lib/mock-data/form-templates"
import { landingOnlySite, type FormSite, type SiteAction } from "@/lib/mock-data/form-site"

const FORM_TEMPLATES: { id: FormTemplate; titleKey: MessageKey; helpKey: MessageKey }[] = [
  { id: "blank", titleKey: "forms.templateBlank", helpKey: "forms.templateBlankHelp" },
  { id: "creator", titleKey: "forms.templateCreator", helpKey: "forms.templateCreatorHelp" },
  { id: "affiliate", titleKey: "forms.templateAffiliate", helpKey: "forms.templateAffiliateHelp" },
]

// Turn a full template (landing + form + thanks) into a landing-only page site.
function toPageSite(site: FormSite): FormSite {
  const clear = (action: SiteAction): SiteAction => (action.kind === "form" ? { kind: "none" } : action)
  const pages = site.pages
    .filter((page) => page.kind !== "form")
    .map((page) => ({
      ...page,
      blocks: page.blocks.map((block) =>
        block.type === "banner" || block.type === "button" || block.type === "announcement"
          ? { ...block, action: clear(block.action) }
          : block,
      ),
    }))
  const entry = pages.find((page) => page.id === site.entryPageId) ?? pages.find((page) => page.kind === "landing") ?? pages[0]
  const fallback = pages.find((page) => page.kind === "thanks") ?? pages[pages.length - 1]
  return { ...site, pages, entryPageId: entry.id, fallbackPageId: fallback.id, rules: [] }
}

function NewFormInner() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useSearchParams()
  const kind = params.get("kind") === "page" ? "page" : "form"
  const user = useAuthStore((state) => state.user)
  const createForm = useFormStore((state) => state.createForm)

  const startForm = (template: FormTemplate) => {
    if (!user) return
    const form = createForm({
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      kind: "form",
      template,
      title: t(template === "creator" ? "forms.templateCreator" : template === "affiliate" ? "forms.templateAffiliate" : "forms.templateBlank"),
    })
    router.push(`/forms/${form.id}`)
  }

  const startPage = (site: FormSite | undefined, title: string) => {
    if (!user) return
    const form = createForm({
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      kind: "page",
      template: "blank",
      title,
      site,
    })
    router.push(`/forms/${form.id}`)
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={kind === "page" ? t("pages.newPage") : t("pages.newForm")}
        subtitle={kind === "page" ? t("forms.choosePageHelp") : t("forms.chooseTemplateHelp")}
        actions={
          <Link href="/forms">
            <Button variant="outline" size="sm" type="button">
              {t("pages.cancel")}
            </Button>
          </Link>
        }
      />
      {kind === "page" ? (
        <div className="mx-auto grid w-full max-w-4xl gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            className="h-auto items-start justify-start whitespace-normal px-4 py-4 text-left"
            onClick={() => startPage(undefined, t("forms.pageBlank"))}
          >
            <span>
              <span className="block text-sm font-semibold text-zinc-900">{t("forms.pageBlank")}</span>
              <span className="mt-1 block text-xs font-normal text-zinc-500">{t("forms.pageBlankHelp")}</span>
            </span>
          </Button>
          {SITE_TEMPLATES.map((template) => (
            <Button
              key={template.id}
              type="button"
              variant="outline"
              className="h-auto items-start justify-start whitespace-normal px-4 py-4 text-left"
              onClick={() => startPage(toPageSite(template.build()), template.name)}
            >
              <span>
                <span className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: template.accent }} />
                  <span className="text-sm font-semibold text-zinc-900">{template.name}</span>
                </span>
                <span className="mt-1 block text-xs font-normal text-zinc-500">{template.tagline}</span>
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-4xl gap-3 p-6 sm:grid-cols-3">
          {FORM_TEMPLATES.map((template) => (
            <Button
              key={template.id}
              type="button"
              variant="outline"
              className="h-auto items-start justify-start whitespace-normal px-4 py-4 text-left"
              onClick={() => startForm(template.id)}
            >
              <span>
                <span className="block text-sm font-semibold text-zinc-900">{t(template.titleKey)}</span>
                <span className="mt-1 block text-xs font-normal text-zinc-500">{t(template.helpKey)}</span>
              </span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function NewFormPage() {
  return (
    <Suspense>
      <NewFormInner />
    </Suspense>
  )
}
