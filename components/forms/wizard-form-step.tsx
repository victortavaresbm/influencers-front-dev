"use client"

import { Button } from "@/components/ui/button"
import { FormBuilder } from "@/components/forms/form-builder"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n } from "@/lib/i18n"
import type { FormTemplate } from "@/lib/mock-data/forms"

const TEMPLATES: { id: FormTemplate; titleKey: "forms.templateBlank" | "forms.templateCreator" | "forms.templateAffiliate"; helpKey: "forms.templateBlankHelp" | "forms.templateCreatorHelp" | "forms.templateAffiliateHelp" }[] = [
  { id: "blank", titleKey: "forms.templateBlank", helpKey: "forms.templateBlankHelp" },
  { id: "creator", titleKey: "forms.templateCreator", helpKey: "forms.templateCreatorHelp" },
  { id: "affiliate", titleKey: "forms.templateAffiliate", helpKey: "forms.templateAffiliateHelp" },
]

export function WizardFormStep({
  organizationId,
  organizationName,
  formId,
  onFormId,
}: {
  organizationId: string
  organizationName: string
  formId?: string
  onFormId: (formId?: string) => void
}) {
  const { t } = useI18n()
  const forms = useFormStore((state) => state.forms)
  const createForm = useFormStore((state) => state.createForm)
  const updateForm = useFormStore((state) => state.updateForm)
  const deleteForm = useFormStore((state) => state.deleteForm)
  const form = forms.find((item) => item.id === formId)

  const start = (template: FormTemplate) => {
    if (form && form.status === "rascunho" && !form.campaignId) deleteForm(form.id)
    const created = createForm({
      organizationId,
      organizationName,
      template,
      scope: "campaign",
      title: t(template === "blank" ? "forms.templateBlank" : template === "creator" ? "forms.templateCreator" : "forms.templateAffiliate"),
      description: t("forms.wizardDescription"),
    })
    onFormId(created.id)
  }

  if (!form) {
    return (
      <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{t("forms.chooseTemplate")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">{t("forms.chooseTemplateHelp")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {TEMPLATES.map((template) => (
            <Button
              key={template.id}
              type="button"
              variant="outline"
              className="h-auto items-start justify-start whitespace-normal px-4 py-3 text-left"
              onClick={() => start(template.id)}
            >
              <span>
                <span className="block text-sm font-semibold text-zinc-900">{t(template.titleKey)}</span>
                <span className="mt-1 block text-xs font-normal text-zinc-500">{t(template.helpKey)}</span>
              </span>
            </Button>
          ))}
        </div>
        <p className="text-sm text-zinc-500">{t("forms.skipHint")}</p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{form.title}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t("forms.wizardEditHelp")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (form.status === "rascunho" && !form.campaignId) deleteForm(form.id)
            onFormId(undefined)
          }}
        >
          {t("forms.removeForm")}
        </Button>
      </div>
      <FormBuilder
        form={form}
        campaigns={[]}
        hideScope
        onChange={(next) => updateForm(form.id, next)}
      />
    </section>
  )
}
