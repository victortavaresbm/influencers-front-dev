"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/stores/auth"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
import type { FormTemplate } from "@/lib/mock-data/forms"

const TEMPLATES: { id: FormTemplate; titleKey: MessageKey; helpKey: MessageKey }[] = [
  { id: "blank", titleKey: "forms.templateBlank", helpKey: "forms.templateBlankHelp" },
  { id: "creator", titleKey: "forms.templateCreator", helpKey: "forms.templateCreatorHelp" },
  { id: "affiliate", titleKey: "forms.templateAffiliate", helpKey: "forms.templateAffiliateHelp" },
]

export default function NewFormPage() {
  const { t } = useI18n()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const createForm = useFormStore((state) => state.createForm)

  const start = (template: FormTemplate) => {
    if (!user) return
    const form = createForm({
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      template,
      title: t(template === "creator" ? "forms.templateCreator" : template === "affiliate" ? "forms.templateAffiliate" : "forms.templateBlank"),
    })
    router.push(`/forms/${form.id}`)
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("pages.newForm")}
        subtitle={t("forms.chooseTemplateHelp")}
        actions={
          <Link href="/forms">
            <Button variant="outline" size="sm" type="button">
              {t("pages.cancel")}
            </Button>
          </Link>
        }
      />
      <div className="mx-auto grid w-full max-w-4xl gap-3 p-6 sm:grid-cols-3">
        {TEMPLATES.map((template) => (
          <Button
            key={template.id}
            type="button"
            variant="outline"
            className="h-auto items-start justify-start whitespace-normal px-4 py-4 text-left"
            onClick={() => start(template.id)}
          >
            <span>
              <span className="block text-sm font-semibold text-zinc-900">{t(template.titleKey)}</span>
              <span className="mt-1 block text-xs font-normal text-zinc-500">{t(template.helpKey)}</span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
