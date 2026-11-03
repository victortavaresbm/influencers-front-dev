"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Copy, Archive, ExternalLink, Link2 } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { FormBuilder } from "@/components/forms/form-builder"
import { SiteBuilder } from "@/components/forms/site-builder"
import { answerText, canPublish, type ApplicationForm, type FormResponse } from "@/lib/mock-data/forms"
import { formPublicPath, scoreApplication } from "@/lib/forms/brief-check"
import { defaultSite } from "@/lib/mock-data/form-site"
import { ORG_LOGOS } from "@/lib/mock-data/users"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
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
        <Button variant="outline" size="sm" render={<Link href="/forms" />}>
          <ArrowLeft />
          {t("pages.back")}
        </Button>
      </div>
    )
  }

  if (!draft || draft.id !== stored.id) return null

  if (!draft.site) {
    setDraft({
      ...draft,
      site: defaultSite(ORG_LOGOS[draft.organizationId]?.color ?? "#18181b"),
    })
    return null
  }

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
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar
        title={draft.title || t("forms.untitled")}
        subtitle={t("forms.responsesCount", { count: formResponses.length })}
        leading={
          <Button variant="outline" size="sm" render={<Link href="/forms" />}>
            <ArrowLeft />
            {t("pages.back")}
          </Button>
        }
        actions={
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => save("rascunho")}>
              {t("forms.saveDraft")}
            </Button>
            <Button type="button" size="sm" disabled={!canPublish(draft)} onClick={() => save("publicado")}>
              {t("forms.publish")}
            </Button>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-6">
        <Tabs defaultValue="editor" className="min-h-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="editor">{t("forms.questionsTab")}</TabsTrigger>
              <TabsTrigger value="pages">{t("forms.pagesTab")}</TabsTrigger>
              <TabsTrigger value="responses">{t("forms.responses")}</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(`${window.location.origin}${formPublicPath(draft.id)}`)
                  toast.add({ type: "success", title: t("forms.linkCopied") })
                }}
              >
                <Link2 />
                {t("forms.copyLink")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(formPublicPath(draft.id), "_blank", "noopener,noreferrer")}
              >
                <ExternalLink />
                {t("forms.openLp")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const copy = duplicateForm(draft.id, t("forms.copyName", { title: draft.title }))
                  if (copy) router.push(`/forms/${copy.id}`)
                }}
              >
                <Copy />
                {t("forms.duplicate")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  archiveForm(draft.id)
                  router.push("/forms")
                }}
              >
                <Archive />
                {t("forms.archive")}
              </Button>
            </div>
          </div>
          <TabsContent value="editor" className="min-h-0 overflow-auto pb-6">
            <FormBuilder
              form={draft}
              campaigns={orgCampaigns}
              conflictNote={conflict ? t("forms.replacesPublished", { name: conflict.title }) : undefined}
              onChange={setDraft}
            />
          </TabsContent>
          <TabsContent value="pages" className="-mx-6 flex min-h-0 flex-col overflow-hidden">
            <SiteBuilder form={draft} onChange={setDraft} />
          </TabsContent>
          <TabsContent value="responses" className="min-h-0 overflow-auto pb-6">
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
                    <span className="flex items-center gap-2">
                      <MatchBadge form={draft} answers={response.answers} />
                      <Badge variant="secondary">{formatDateBR(response.submittedAt)}</Badge>
                    </span>
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
            {openResponse ? (
              <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
                <p className="text-xs text-zinc-500">{t("forms.briefCheck")}</p>
                <MatchBadge form={draft} answers={openResponse.answers} />
              </div>
            ) : null}
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

function MatchBadge({ form, answers }: { form: ApplicationForm; answers: FormResponse["answers"] }) {
  const { t } = useI18n()
  if (!form.brandSummary && !form.questions.some((question) => (question.match?.weight ?? 0) > 0)) return null
  const result = scoreApplication(form, answers)
  const key: MessageKey =
    result.label === "alto" ? "forms.matchHighLabel" : result.label === "medio" ? "forms.matchMidLabel" : "forms.matchLowLabel"
  return (
    <Badge variant={result.label === "alto" ? "default" : "secondary"}>
      {t(key)} · {result.score}%
    </Badge>
  )
}
