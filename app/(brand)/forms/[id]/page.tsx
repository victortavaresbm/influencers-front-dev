"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Archive, Copy, ExternalLink, GitBranch, Link2, PanelsTopLeft, Pause, Play, Users } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { FunnelFlow } from "@/components/forms/funnel-flow"
import { SiteBuilder } from "@/components/forms/site-builder"
import { LeadsPanel } from "@/components/forms/leads/leads-panel"
import { canPublish, type ApplicationForm, type FormStatus } from "@/lib/mock-data/forms"
import { formPublicPath } from "@/lib/forms/brief-check"
import { defaultSite } from "@/lib/mock-data/form-site"
import { ORG_LOGOS } from "@/lib/mock-data/users"
import { useAuthStore } from "@/lib/stores/auth"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"

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
              <TabsTrigger value="builder">
                <PanelsTopLeft />
                {t("forms.tabBuilder")}
              </TabsTrigger>
              <TabsTrigger value="flow">
                <GitBranch />
                {t("forms.tabFlow")}
              </TabsTrigger>
              <TabsTrigger value="leads">
                <Users />
                {t("forms.tabLeads")}
              </TabsTrigger>
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

          <TabsContent value="leads" className="min-h-0 overflow-auto pb-6">
            <LeadsPanel form={draft} responses={formResponses} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

