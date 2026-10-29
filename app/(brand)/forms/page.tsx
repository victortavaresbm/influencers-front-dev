"use client"

import Link from "next/link"
import { TopBar } from "@/components/layout/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
import type { ApplicationForm, FormStatus } from "@/lib/mock-data/forms"
import { Plus } from "lucide-react"

const STATUS_KEY: Record<FormStatus, MessageKey> = {
  rascunho: "forms.statusDraft",
  publicado: "forms.statusPublished",
  arquivado: "forms.statusArchived",
}

export default function FormsPage() {
  const { t } = useI18n()
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const forms = useFormStore((state) => state.forms)
  const responses = useFormStore((state) => state.responses)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const mine = forms.filter((form) => form.organizationId === organizationId && form.status !== "arquivado")
  const brandForms = mine.filter((form) => form.scope === "brand")
  const campaignForms = mine.filter((form) => form.scope === "campaign")

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("pages.forms")}
        subtitle={t("pages.formsCount", { count: mine.length })}
        actions={
          <Link href="/forms/new">
            <Button size="sm">
              <Plus />
              {t("pages.newForm")}
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="marca">
          <TabsList className="mb-4">
            <TabsTrigger value="marca">{t("pages.formsBrand")}</TabsTrigger>
            <TabsTrigger value="campanha">{t("pages.formsCampaign")}</TabsTrigger>
          </TabsList>
          <TabsContent value="marca">
            <FormGrid forms={brandForms} responses={responses} campaigns={campaigns} empty={t("pages.formsEmpty")} />
          </TabsContent>
          <TabsContent value="campanha">
            <FormGrid forms={campaignForms} responses={responses} campaigns={campaigns} empty={t("pages.formsEmpty")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function FormGrid({
  forms,
  responses,
  campaigns,
  empty,
}: {
  forms: ApplicationForm[]
  responses: { formId: string }[]
  campaigns: { id: string; name: string }[]
  empty: string
}) {
  const { t } = useI18n()
  if (forms.length === 0) {
    return <p className="py-16 text-center text-sm text-zinc-500">{empty}</p>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => {
        const campaign = campaigns.find((item) => item.id === form.campaignId)
        const count = responses.filter((response) => response.formId === form.id).length
        return (
          <Link
            key={form.id}
            href={`/forms/${form.id}`}
            className="rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{form.title}</p>
              <Badge variant={form.status === "publicado" ? "default" : "secondary"}>{t(STATUS_KEY[form.status])}</Badge>
            </div>
            <p className="mb-3 line-clamp-2 text-xs text-zinc-500">
              {form.scope === "campaign" ? campaign?.name ?? t("forms.scopeCampaign") : t("forms.scopeBrand")}
            </p>
            <p className="text-xs text-zinc-400">
              {t("forms.questionsCount", { count: form.questions.length })}
              {" · "}
              {t("forms.responsesCount", { count })}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
