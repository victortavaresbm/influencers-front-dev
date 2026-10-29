"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Copy, Archive } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormBuilder } from "@/components/forms/form-builder"
import { answerText, canPublish, type ApplicationForm, type FormResponse } from "@/lib/mock-data/forms"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n } from "@/lib/i18n"
import { formatDateBR } from "@/lib/dates"

export default function FormEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t } = useI18n()
  const router = useRouter()
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const forms = useFormStore((state) => state.forms)
  const responses = useFormStore((state) => state.responses)
  const updateForm = useFormStore((state) => state.updateForm)
  const duplicateForm = useFormStore((state) => state.duplicateForm)
  const archiveForm = useFormStore((state) => state.archiveForm)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const stored = forms.find((form) => form.id === id && form.organizationId === organizationId)
  const [draft, setDraft] = useState<ApplicationForm | null>(null)
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const [openResponse, setOpenResponse] = useState<FormResponse | null>(null)

  if (stored && loadedId !== stored.id) {
    setLoadedId(stored.id)
    setDraft(structuredClone(stored))
  }

  if (!stored) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-sm text-zinc-500">{t("pages.formNotFound")}</p>
        <Link href="/forms">
          <Button variant="outline" size="sm">{t("pages.back")}</Button>
        </Link>
      </div>
    )
  }

  if (!draft || draft.id !== stored.id) return null

  const orgCampaigns = campaigns
    .filter((campaign) => campaign.organizationId === organizationId)
    .map((campaign) => ({ id: campaign.id, name: campaign.name }))
  const formResponses = responses.filter((response) => response.formId === stored.id)
  const conflict = forms.find(
    (form) =>
      form.id !== draft.id &&
      form.status === "publicado" &&
      form.scope === "campaign" &&
      draft.scope === "campaign" &&
      draft.campaignId &&
      form.campaignId === draft.campaignId,
  )
  const labels = { yes: t("forms.yes"), no: t("forms.no"), empty: t("forms.emptyAnswer") }

  const save = (status: "rascunho" | "publicado") => {
    if (status === "publicado" && !canPublish(draft)) return
    updateForm(draft.id, { ...draft, status })
    setDraft({ ...draft, status })
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={draft.title || t("forms.untitled")}
        subtitle={t("forms.responsesCount", { count: formResponses.length })}
        actions={
          <>
            <ActionsMenu
              items={[
                {
                  label: t("forms.duplicate"),
                  icon: Copy,
                  onSelect: () => {
                    const copy = duplicateForm(draft.id, t("forms.copyName", { title: draft.title }))
                    if (copy) router.push(`/forms/${copy.id}`)
                  },
                },
                {
                  label: t("forms.archive"),
                  icon: Archive,
                  destructive: true,
                  onSelect: () => {
                    archiveForm(draft.id)
                    router.push("/forms")
                  },
                },
              ]}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => save("rascunho")}>
              {t("forms.saveDraft")}
            </Button>
            <Button type="button" size="sm" disabled={!canPublish(draft)} onClick={() => save("publicado")}>
              {t("forms.publish")}
            </Button>
          </>
        }
      />

      <div className="p-6">
        <Tabs defaultValue="editor">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">{t("forms.editor")}</TabsTrigger>
            <TabsTrigger value="responses">{t("forms.responses")}</TabsTrigger>
          </TabsList>
          <TabsContent value="editor">
            <FormBuilder
              form={draft}
              campaigns={orgCampaigns}
              conflictNote={conflict ? t("forms.replacesPublished", { name: conflict.title }) : undefined}
              onChange={setDraft}
            />
          </TabsContent>
          <TabsContent value="responses">
            {formResponses.length === 0 ? (
              <p className="py-16 text-center text-sm text-zinc-500">{t("forms.responsesEmpty")}</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                {formResponses.map((response) => (
                  <Button
                    key={response.id}
                    type="button"
                    variant="ghost"
                    onClick={() => setOpenResponse(response)}
                    className="h-auto w-full justify-between rounded-none border-b border-zinc-100 px-4 py-3 text-left last:border-b-0"
                  >
                    <span>
                      <span className="block text-sm font-medium text-zinc-900">{response.creatorName}</span>
                      <span className="block text-xs font-normal text-zinc-400">{response.creatorHandle}</span>
                    </span>
                    <Badge variant="secondary">{formatDateBR(response.submittedAt)}</Badge>
                  </Button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={!!openResponse} onOpenChange={(open) => !open && setOpenResponse(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{openResponse?.creatorName}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            {draft.questions.map((question) => {
              const answer = openResponse?.answers.find((item) => item.questionId === question.id)
              return (
                <div key={question.id}>
                  <p className="text-xs text-zinc-400">{question.title}</p>
                  <p className="mt-1 text-sm text-zinc-800">{answerText(question, answer?.value, labels)}</p>
                </div>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
