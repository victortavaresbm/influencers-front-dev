"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Archive, ChevronDown, Copy, Plus } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { FormCardPreview } from "@/components/forms/form-card-preview"
import { ActionsMenu, type ActionMenuItem } from "@/components/ui/actions-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { canPublish, type ApplicationForm, type FormStatus } from "@/lib/mock-data/forms"

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
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const forms = useFormStore((state) => state.forms)
  const responses = useFormStore((state) => state.responses)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const [filter, setFilter] = useState<StatusFilter>("all")

  const visible = forms
    .filter((form) => form.organizationId === organizationId)
    .filter((form) => (filter === "all" ? form.status !== "arquivado" : form.status === filter))

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("pages.hubTitle")}
        subtitle={t("pages.hubSubtitle")}
        actions={
          <Button size="sm" type="button" render={<Link href="/forms/new" />}>
            <Plus />
            {t("pages.newFunnel")}
          </Button>
        }
      />
      <div className="space-y-4 p-6">
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
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 py-16 text-center">
            <p className="text-sm text-zinc-500">{t("pages.funnelsEmpty")}</p>
            <Button type="button" variant="outline" size="sm" render={<Link href="/forms/new" />}>
              <Plus />
              {t("pages.newFunnel")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((form) => (
              <FunnelCard key={form.id} form={form} responses={responses} campaigns={campaigns} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FunnelCard({
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
  const setStatus = (status: FormStatus) => {
    if (status === "publicado" && !canPublish(form)) return
    updateForm(form.id, { status })
  }

  const items: ActionMenuItem[] = []
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
      <div className="relative">
        <Link
          href={`/forms/${form.id}`}
          className="group block rounded-t-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <FormCardPreview form={form} />
          <CardHeader className="pt-4">
            <CardTitle className="line-clamp-2 leading-snug group-hover:underline">{form.title}</CardTitle>
          </CardHeader>
        </Link>
        <div className="absolute top-3 right-3 z-10">
          <PageStatusMenu status={form.status} canActivate={canPublish(form)} onChange={setStatus} />
        </div>
      </div>
      <CardContent className="flex items-center justify-between gap-2 pt-2 pb-3">
        <p className="min-w-0 truncate text-xs text-muted-foreground">
          {t("forms.pagesCount", { count: form.site?.pages.length ?? 0 })}
          {" · "}
          {t("forms.responsesCount", { count })}
          {form.scope === "campaign" ? <span className="text-zinc-300"> · {campaign?.name ?? t("forms.scopeCampaign")}</span> : null}
        </p>
        <ActionsMenu trigger="ellipsis" items={items} />
      </CardContent>
    </Card>
  )
}

const STATUS_ORDER: FormStatus[] = ["publicado", "inativo", "rascunho", "arquivado"]

function PageStatusMenu({
  status,
  canActivate,
  onChange,
}: {
  status: FormStatus
  canActivate: boolean
  onChange: (status: FormStatus) => void
}) {
  const { t } = useI18n()
  const meta = STATUS_META[status]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full bg-background/90 px-2.5 font-medium shadow-sm"
            aria-label={`${t("forms.changeStatus")}: ${t(meta.key)}`}
          />
        }
      >
        <span className="size-2 rounded-full" style={{ background: meta.dot }} />
        {t(meta.key)}
        <ChevronDown data-icon="inline-end" className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(value) => {
            if (!value || value === status) return
            onChange(value as FormStatus)
          }}
        >
          {STATUS_ORDER.map((item) => (
            <DropdownMenuRadioItem key={item} value={item} disabled={item === "publicado" && !canActivate}>
              <span className="size-2 rounded-full" style={{ background: STATUS_META[item].dot }} />
              {t(STATUS_META[item].key)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
