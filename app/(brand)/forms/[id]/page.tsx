"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Archive, Copy, ExternalLink, Link2, Pause, Play } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { FunnelFlow } from "@/components/forms/funnel-flow"
import { SiteBuilder } from "@/components/forms/site-builder"
import { SiteDesignPanel } from "@/components/forms/site-design"
import { SitePlayer } from "@/components/forms/site-player"
import { answerText, canPublish, type ApplicationForm, type FormResponse, type FormStatus } from "@/lib/mock-data/forms"
import { formPublicPath } from "@/lib/forms/brief-check"
import { defaultSite } from "@/lib/mock-data/form-site"
import { ORG_LOGOS } from "@/lib/mock-data/users"
import { useAuthStore } from "@/lib/stores/auth"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { formatDateBR } from "@/lib/dates"

const STATUS_META: Record<FormStatus, { key: MessageKey; dot: string }> = {
  publicado: { key: "forms.statusActive", dot: "#16a34a" },
  inativo: { key: "forms.statusInactive", dot: "#d97706" },
  rascunho: { key: "forms.statusDraft", dot: "#a1a1aa" },
  arquivado: { key: "forms.statusArchived", dot: "#71717a" },
}

export default function FunnelEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t } = useI18n()
  const router = useRouter()
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const forms = useFormStore((state) => state.forms)
  const responses = useFormStore((state) => state.responses)
  const updateForm = useFormStore((state) => state.updateForm)
  const duplicateForm = useFormStore((state) => state.duplicateForm)
  const archiveForm = useFormStore((state) => state.archiveForm)
  const stored = forms.find((form) => form.id === id && form.organizationId === organizationId)
  const [draft, setDraft] = useState<ApplicationForm | null>(null)
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const [openResponse, setOpenResponse] = useState<FormResponse | null>(null)
  const [tab, setTab] = useState("builder")
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)

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
      site: defaultSite(
        ORG_LOGOS[draft.organizationId]?.color ?? "#18181b",
        draft.questions.map((question) => question.id),
      ),
    })
    return null
  }

  const formResponses = responses.filter((response) => response.formId === stored.id)
  const labels = { yes: t("forms.yes"), no: t("forms.no"), empty: t("forms.emptyAnswer") }

  const save = (status: FormStatus) => {
    if (status === "publicado" && !canPublish(draft)) return
    updateForm(draft.id, { ...draft, status })
    setDraft({ ...draft, status })
  }

  const statusMeta = STATUS_META[draft.status]

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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700">
              <span className="size-2 rounded-full" style={{ background: statusMeta.dot }} />
              {t(statusMeta.key)}
            </span>
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
            <Button type="button" variant="outline" size="sm" onClick={() => save("rascunho")}>
              {t("forms.saveDraft")}
            </Button>
            {draft.status === "publicado" ? (
              <Button type="button" variant="outline" size="sm" onClick={() => save("inativo")}>
                <Pause />
                {t("forms.setInactive")}
              </Button>
            ) : (
              <Button type="button" size="sm" disabled={!canPublish(draft)} onClick={() => save("publicado")}>
                <Play />
                {t("forms.publish")}
              </Button>
            )}
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4">
        <Tabs value={tab} onValueChange={(value) => value && setTab(value)} className="min-h-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="builder">{t("forms.tabBuilder")}</TabsTrigger>
              <TabsTrigger value="flow">{t("forms.tabFlow")}</TabsTrigger>
              <TabsTrigger value="design">{t("forms.tabDesign")}</TabsTrigger>
              <TabsTrigger value="leads">{t("forms.tabLeads")}</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2">
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

          <TabsContent value="builder" className="-mx-6 flex min-h-0 flex-col overflow-hidden">
            <SiteBuilder
              form={draft}
              onChange={setDraft}
              pageId={selectedPageId ?? undefined}
              onPageChange={setSelectedPageId}
            />
          </TabsContent>

          <TabsContent value="flow" className="-mx-6 min-h-0 flex-1 overflow-hidden border-t border-zinc-200">
            <FunnelFlow
              site={draft.site}
              selectedPageId={selectedPageId ?? draft.site.entryPageId}
              onSelectPage={(id) => {
                setSelectedPageId(id)
                setTab("builder")
              }}
              onChange={(site) => setDraft({ ...draft, site })}
            />
          </TabsContent>

          <TabsContent value="design" className="min-h-0 overflow-auto pb-6">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
              <SiteDesignPanel
                theme={draft.site.theme}
                onChange={(theme) => setDraft({ ...draft, site: { ...draft.site!, theme } })}
              />
              <div className="xl:sticky xl:top-4 xl:self-start">
                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  <SitePlayer form={draft} preview />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="min-h-0 overflow-auto pb-6">
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
                      <span className="block text-sm font-medium text-zinc-900">{response.creatorName || t("forms.anonLead")}</span>
                      <span className="block text-xs font-normal text-zinc-400">{response.creatorHandle}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {!response.complete ? <Badge variant="secondary">{t("forms.leadIncomplete")}</Badge> : null}
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
            <SheetTitle>{openResponse?.creatorName || t("forms.anonLead")}</SheetTitle>
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

