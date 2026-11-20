"use client"
import { useState } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useAuthStore } from "@/lib/stores/auth"
import { CREATORS } from "@/lib/mock-data/creators"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Search } from "lucide-react"
import { CampaignTypeBadge } from "@/components/campaigns/campaign-type-badge"
import { creatorCanApply } from "@/lib/campaign-access"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n } from "@/lib/i18n"
import { stripMarkdown } from "@/lib/markdown"

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

export default function CreatorOpportunitiesPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const forms = useFormStore((s) => s.forms)
  const responses = useFormStore((s) => s.responses)
  const creator = CREATORS.find((c) => c.email === user?.email) ?? CREATORS[0]
  const [search, setSearch] = useState("")

  const openCampaigns = campaigns.filter((c) => {
    if (!creatorCanApply(c, creator.id, campaigns)) return false
    if (!search) return true
    const query = search.toLowerCase()
    return c.name.toLowerCase().includes(query) || c.organizationName.toLowerCase().includes(query)
  })

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("nav.opportunities")} subtitle={t("pages.opportunities")} />

      <div className="space-y-4 p-6">
        <div className="relative max-w-md">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Buscar campanhas..."
            className="h-8 pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">{t("forms.campaignsTab")}</TabsTrigger>
            <TabsTrigger value="brands">{t("forms.brandsTab")}</TabsTrigger>
          </TabsList>
          <TabsContent value="campaigns">
            {openCampaigns.length === 0 ? (
              <div className="py-16 text-center text-sm text-zinc-400">Nenhuma campanha aberta no momento.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {openCampaigns.map((c) => {
                  const form = forms.find((item) => item.id === c.formId && item.status === "publicado")
                  const sent = !!form && responses.some((response) => response.formId === form.id && response.creatorId === creator.id)
                  return (
                    <Card key={c.id} className="overflow-hidden transition-shadow hover:shadow-sm">
                      <div className="flex h-24 items-center justify-center bg-zinc-900">
                        <span className="text-3xl font-bold text-zinc-700">{c.organizationName.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <Link href={`/creator/campaigns/${c.id}`} className="line-clamp-2 text-sm font-semibold text-zinc-900">
                            {c.name}
                          </Link>
                          <span className="flex shrink-0 flex-col items-end gap-1">
                            <CampaignTypeBadge type={c.type} strategy={c.strategy} tactics={c.tactics} />
                            {c.visibility === "privada" ? <Badge variant="secondary">Comunidade</Badge> : null}
                          </span>
                        </div>
                        <p className="mb-3 line-clamp-2 text-xs text-zinc-500">{stripMarkdown(c.description)}</p>
                        <div className="mb-3 grid grid-cols-3 gap-2 border-y border-zinc-100 py-2 text-center">
                          <div>
                            <p className="text-xs font-semibold text-zinc-800">{fmt(c.minFollowers)}+</p>
                            <p className="text-[10px] text-zinc-400">seguidores</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-800">{c.minEngagement}%+</p>
                            <p className="text-[10px] text-zinc-400">engajamento</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-800">{c.participants.length}</p>
                            <p className="text-[10px] text-zinc-400">selecionados</p>
                          </div>
                        </div>
                        {form && sent ? (
                          <Badge variant="secondary">{t("forms.sent")}</Badge>
                        ) : form ? (
                          <Link href={form.site ? `/lp/${form.id}` : `/creator/apply/${form.id}?return=/creator/opportunities`}>
                            <Button size="sm" className="w-full text-xs">{t("forms.apply")}</Button>
                          </Link>
                        ) : (
                          <Link href={`/creator/campaigns/${c.id}`}>
                            <Button size="sm" className="w-full text-xs">{t("forms.seeDetails")}</Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="brands">
            <BrandForms search={search} creatorId={creator.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function BrandForms({ search, creatorId }: { search: string; creatorId: string }) {
  const { t } = useI18n()
  const forms = useFormStore((state) => state.forms)
  const responses = useFormStore((state) => state.responses)
  const query = search.trim().toLowerCase()
  const open = forms.filter((form) => {
    if (form.scope !== "brand" || form.status !== "publicado") return false
    if (!query) return true
    return form.title.toLowerCase().includes(query) || form.organizationName.toLowerCase().includes(query)
  })

  if (open.length === 0) {
    return <div className="py-16 text-center text-sm text-zinc-400">{t("forms.noBrandForms")}</div>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {open.map((form) => {
        const sent = responses.some((response) => response.formId === form.id && response.creatorId === creatorId)
        return (
          <Card key={form.id} className="p-4">
            <p className="text-xs text-zinc-400">{form.organizationName}</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{form.title}</p>
            {form.description ? <p className="mt-2 line-clamp-3 text-xs text-zinc-500">{form.description}</p> : null}
            <div className="mt-4">
              {sent ? (
                <Badge variant="secondary">{t("forms.sent")}</Badge>
              ) : (
                <Link href={form.site ? `/lp/${form.id}` : `/creator/apply/${form.id}?return=/creator/opportunities`}>
                  <Button size="sm">{t("forms.apply")}</Button>
                </Link>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
