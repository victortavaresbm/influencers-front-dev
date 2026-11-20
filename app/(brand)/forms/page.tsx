"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Archive, Copy, FilePen, FileText, LayoutPanelTop, Pause, Play, Plus } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { FormCardPreview } from "@/components/forms/form-card-preview"
import { ActionsMenu, type ActionMenuItem } from "@/components/ui/actions-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { canPublish, type ApplicationForm, type FormKind, type FormStatus } from "@/lib/mock-data/forms"

const STATUS_META: Record<FormStatus, { key: MessageKey; dot: string }> = {
  publicado: { key: "forms.statusActive", dot: "#16a34a" },
  inativo: { key: "forms.statusInactive", dot: "#d97706" },
  rascunho: { key: "forms.statusDraft", dot: "#a1a1aa" },
  arquivado: { key: "forms.statusArchived", dot: "#71717a" },
}

type StatusFilter = "all" | FormStatus

const FILTERS: { value: StatusFilter; key: MessageKey }[] = [
  { value: "all", key: "forms.filterAll" },
  { value: "publicado", key: "forms.statusActive" },
  { value: "inativo", key: "forms.statusInactive" },
  { value: "rascunho", key: "forms.statusDraft" },
  { value: "arquivado", key: "forms.statusArchived" },
]

export default function FormsPage() {
  const { t } = useI18n()
  const router = useRouter()
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const forms = useFormStore((state) => state.forms)
  const responses = useFormStore((state) => state.responses)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const [tab, setTab] = useState<FormKind>("form")
  const [filter, setFilter] = useState<StatusFilter>("all")

  const mine = forms.filter((form) => form.organizationId === organizationId)
  const visible = (kind: FormKind) =>
    mine
      .filter((form) => form.kind === kind)
      .filter((form) => (filter === "all" ? form.status !== "arquivado" : form.status === filter))

  const formCount = mine.filter((form) => form.kind === "form" && form.status !== "arquivado").length
  const pageCount = mine.filter((form) => form.kind === "page" && form.status !== "arquivado").length

  const create = (kind: FormKind) => router.push(`/forms/new?kind=${kind}`)

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("pages.hubTitle")}
        subtitle={t("pages.hubSubtitle")}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button size="sm" type="button" />}>
              <Plus />
              {t("pages.create")}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => create("form")}>
                <FileText />
                {t("pages.createForm")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => create("page")}>
                <LayoutPanelTop />
                {t("pages.createPage")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <div className="space-y-4 p-6">
        <Tabs value={tab} onValueChange={(value) => value && setTab(value as FormKind)}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="form">
                <FileText />
                {t("pages.hubForms")}
                <span className="ml-1 text-xs text-muted-foreground">{formCount}</span>
              </TabsTrigger>
              <TabsTrigger value="page">
                <LayoutPanelTop />
                {t("pages.hubPages")}
                <span className="ml-1 text-xs text-muted-foreground">{pageCount}</span>
              </TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={filter === item.value ? "secondary" : "ghost"}
                  onClick={() => setFilter(item.value)}
                >
                  {t(item.key)}
                </Button>
              ))}
            </div>
          </div>
          <TabsContent value="form" className="mt-4">
            <ChannelGrid
              forms={visible("form")}
              kind="form"
              responses={responses}
              campaigns={campaigns}
              onCreate={() => create("form")}
            />
          </TabsContent>
          <TabsContent value="page" className="mt-4">
            <ChannelGrid
              forms={visible("page")}
              kind="page"
              responses={responses}
              campaigns={campaigns}
              onCreate={() => create("page")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ChannelGrid({
  forms,
  kind,
  responses,
  campaigns,
  onCreate,
}: {
  forms: ApplicationForm[]
  kind: FormKind
  responses: { formId: string }[]
  campaigns: { id: string; name: string }[]
  onCreate: () => void
}) {
  const { t } = useI18n()

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 py-16 text-center">
        <p className="text-sm text-zinc-500">{t(kind === "page" ? "pages.pagesEmpty" : "pages.formsEmpty")}</p>
        <Button type="button" variant="outline" size="sm" onClick={onCreate}>
          <Plus />
          {t(kind === "page" ? "pages.createPage" : "pages.createForm")}
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {forms.map((form) => (
        <ChannelCard key={form.id} form={form} responses={responses} campaigns={campaigns} />
      ))}
    </div>
  )
}

function ChannelCard({
  form,
  responses,
  campaigns,
}: {
  form: ApplicationForm
  responses: { formId: string }[]
  campaigns: { id: string; name: string }[]
}) {
  const { t } = useI18n()
  const router = useRouter()
  const updateForm = useFormStore((state) => state.updateForm)
  const duplicateForm = useFormStore((state) => state.duplicateForm)
  const archiveForm = useFormStore((state) => state.archiveForm)

  const campaign = campaigns.find((item) => item.id === form.campaignId)
  const count = responses.filter((response) => response.formId === form.id).length
  const meta = STATUS_META[form.status]

  const setStatus = (status: FormStatus) => updateForm(form.id, { status })

  const items: ActionMenuItem[] = []
  if (form.status !== "publicado") {
    items.push({ label: t("forms.setActive"), icon: Play, disabled: !canPublish(form), onSelect: () => setStatus("publicado") })
  }
  if (form.status === "publicado") {
    items.push({ label: t("forms.setInactive"), icon: Pause, onSelect: () => setStatus("inativo") })
  }
  if (form.status !== "rascunho") {
    items.push({ label: t("forms.setDraft"), icon: FilePen, onSelect: () => setStatus("rascunho") })
  }
  items.push({
    label: t("forms.duplicate"),
    icon: Copy,
    onSelect: () => {
      const copy = duplicateForm(form.id, t("forms.copyName", { title: form.title }))
      if (copy) router.push(`/forms/${copy.id}`)
    },
  })
  items.push({ label: t("forms.archive"), icon: Archive, destructive: true, onSelect: () => archiveForm(form.id) })

  return (
    <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link
        href={`/forms/${form.id}`}
        className="group block rounded-t-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative">
          <FormCardPreview form={form} />
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ring-foreground/10">
            <span className="size-2 rounded-full" style={{ background: meta.dot }} />
            {t(meta.key)}
          </span>
        </div>
        <CardHeader className="pt-4">
          <CardTitle className="line-clamp-2 leading-snug group-hover:underline">{form.title}</CardTitle>
        </CardHeader>
      </Link>
      <CardContent className="flex items-center justify-between gap-2 pt-2 pb-3">
        <p className="min-w-0 truncate text-xs text-muted-foreground">
          {form.kind === "page" ? (
            t("forms.pagesCount", { count: form.site?.pages.length ?? 0 })
          ) : (
            <>
              {t("forms.questionsCount", { count: form.questions.length })}
              {" · "}
              {t("forms.responsesCount", { count })}
            </>
          )}
          {form.scope === "campaign" ? <span className="text-zinc-300"> · {campaign?.name ?? t("forms.scopeCampaign")}</span> : null}
        </p>
        <ActionsMenu trigger="ellipsis" items={items} />
      </CardContent>
    </Card>
  )
}
