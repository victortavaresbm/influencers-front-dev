"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/stores/auth"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
import type { FormTemplate } from "@/lib/mock-data/forms"
import { SITE_TEMPLATES } from "@/lib/mock-data/form-templates"

const STARTERS: { id: FormTemplate; titleKey: MessageKey; helpKey: MessageKey }[] = [
  { id: "blank", titleKey: "forms.templateBlank", helpKey: "forms.templateBlankHelp" },
  { id: "creator", titleKey: "forms.templateCreator", helpKey: "forms.templateCreatorHelp" },
  { id: "affiliate", titleKey: "forms.templateAffiliate", helpKey: "forms.templateAffiliateHelp" },
]

export default function NewFunnelPage() {
  const { t } = useI18n()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const createForm = useFormStore((state) => state.createForm)

  const startBlank = (template: FormTemplate) => {
    if (!user) return
    const form = createForm({
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      template,
      title: t(template === "creator" ? "forms.templateCreator" : template === "affiliate" ? "forms.templateAffiliate" : "forms.templateBlank"),
    })
    router.push(`/forms/${form.id}`)
  }

  const startFromTemplate = (templateId: string) => {
    if (!user) return
    const template = SITE_TEMPLATES.find((item) => item.id === templateId)
    if (!template) return
    const form = createForm({
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      template: "blank",
      title: template.name,
      site: template.build(),
    })
    router.push(`/forms/${form.id}`)
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("pages.newFunnel")}
        subtitle={t("forms.chooseTemplateHelp")}
        actions={
          <Button variant="outline" size="sm" type="button" render={<Link href="/forms" />}>
            {t("pages.cancel")}
          </Button>
        }
      />
      <div className="mx-auto w-full max-w-5xl space-y-8 p-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900">{t("forms.startFromScratch")}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {STARTERS.map((starter) => (
              <Button
                key={starter.id}
                type="button"
                variant="outline"
                className="h-auto items-start justify-start whitespace-normal px-4 py-4 text-left"
                onClick={() => startBlank(starter.id)}
              >
                <span>
                  <span className="block text-sm font-semibold text-zinc-900">{t(starter.titleKey)}</span>
                  <span className="mt-1 block text-xs font-normal text-zinc-500">{t(starter.helpKey)}</span>
                </span>
              </Button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900">{t("forms.startFromTemplate")}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SITE_TEMPLATES.map((template) => (
              <Button
                key={template.id}
                type="button"
                variant="outline"
                className="h-auto items-start justify-start whitespace-normal px-4 py-4 text-left"
                onClick={() => startFromTemplate(template.id)}
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
        </section>
      </div>
    </div>
  )
}
