"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { FormCardPreview } from "@/components/forms/form-card-preview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
import type { ApplicationForm, FormStatus } from "@/lib/mock-data/forms"

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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {forms.map((form) => {
        const campaign = campaigns.find((item) => item.id === form.campaignId)
        const count = responses.filter((response) => response.formId === form.id).length
        return (
          <Link
            key={form.id}
            href={`/forms/${form.id}`}
            className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow group-hover:shadow-md">
              <div className="relative">
                <FormCardPreview form={form} />
                <Badge
                  variant={form.status === "publicado" ? "default" : "secondary"}
                  className="absolute top-3 right-3 shadow-sm ring-1 ring-background/70"
                >
                  {t(STATUS_KEY[form.status])}
                </Badge>
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="line-clamp-2 leading-snug">{form.title}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {form.scope === "campaign" ? campaign?.name ?? t("forms.scopeCampaign") : t("forms.scopeBrand")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4 text-xs text-muted-foreground">
                {t("forms.questionsCount", { count: form.questions.length })}
                {" · "}
                {t("forms.pagesCount", { count: form.site?.pages.length ?? 0 })}
                {" · "}
                {t("forms.responsesCount", { count })}
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
