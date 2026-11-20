"use client"

import { useState } from "react"
import { Monitor, Smartphone } from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { SitePlayer } from "@/components/forms/site-player"
import { GuidelineLists } from "@/components/campaigns/guideline-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { visibilityLabel } from "@/lib/campaign-access"
import { contentFormatByValue } from "@/lib/campaign-types"
import { COMMERCIAL_TERMS, strategyLabel, tacticLabel } from "@/lib/campaigns/shape"
import { TIERS } from "@/lib/audience-tiers"
import { formatDateRangeBR } from "@/lib/dates"
import { useI18n } from "@/lib/i18n"
import { CREATORS } from "@/lib/mock-data/creators"
import { isSocialNetwork, normalizeMentions, SOCIAL_NETWORK_LABEL, type SocialNetwork } from "@/lib/mock-data/campaigns"
import type { ApplicationForm } from "@/lib/mock-data/forms"
import { formatSuccessTarget, successMetricById } from "@/lib/success-metrics"
import type { WizardDraft } from "@/lib/stores/campaigns"
import { cn } from "@/lib/utils"

const NETWORK_ICONS: Record<SocialNetwork, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
}

function money(value?: number) {
  if (!value) return "A definir"
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

function people(value?: number) {
  if (!value) return null
  return value.toLocaleString("pt-BR")
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {children}
    </section>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-400">{children}</p>
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="outline">{item}</Badge>
      ))}
    </div>
  )
}

export function CampaignPreview({ draft, form }: { draft: WizardDraft; form?: ApplicationForm }) {
  const { t } = useI18n()
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const formats = draft.formatQuantities ?? []
  const networks = (draft.targetNetworks ?? []).filter(isSocialNetwork)
  const tiers = TIERS.filter((tier) => draft.audienceTiers?.includes(tier.id))
  const mentions = normalizeMentions(draft.mandatoryMentions)
  const invited = CREATORS.filter((creator) => (draft.inviteIds ?? []).includes(creator.id))
  const terms = COMMERCIAL_TERMS.filter((term) => draft.commercialTerms?.includes(term.id))
  const goals = (draft.successTargets ?? []).flatMap((item) => {
    const metric = successMetricById(item.metric)
    if (!metric || !item.target) return []
    return [{ id: item.metric, label: metric.label, value: formatSuccessTarget(metric, item.target) }]
  })
  const compact = device === "mobile"

  const body = (
    <div className={cn("space-y-3", compact ? "p-3" : "p-0")}>
      <Card className="overflow-hidden p-0">
        {draft.coverImage ? (
          <div className="aspect-[2/1] max-h-52 w-full bg-cover bg-center" style={{ backgroundImage: `url(${draft.coverImage})` }} role="img" aria-label="Banner da campanha" />
        ) : null}
        <div className="space-y-3 p-5">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">{draft.niche || "Nicho a definir"}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{draft.name?.trim() || "Campanha sem nome"}</h2>
          <div className="flex flex-wrap gap-1.5">
            {draft.strategy ? <Badge>{strategyLabel(draft.strategy)}</Badge> : null}
            {(draft.tactics ?? []).map((tactic) => (
              <Badge key={tactic} variant="secondary">{tacticLabel(tactic)}</Badge>
            ))}
            <Badge variant="outline">{visibilityLabel(draft.visibility)}</Badge>
          </div>
          {draft.objective ? <p className="text-sm leading-relaxed text-zinc-600">{draft.objective}</p> : null}
        </div>
      </Card>

      <div className={cn("grid grid-cols-2 gap-2", !compact && "sm:grid-cols-4")}>
        {[
          { label: "Orçamento", value: money(draft.budget) },
          { label: "Creators", value: draft.maxInfluencers ? String(draft.maxInfluencers) : "A definir" },
          { label: "Por post", value: money(draft.fixedFeePerPost) },
          { label: "Por influencer", value: draft.perInfluencerFee === "contact" ? "Sob consulta" : money(typeof draft.perInfluencerFee === "number" ? draft.perInfluencerFee : undefined) },
        ].map((item) => (
          <Card key={item.label} size="sm" className="gap-1 px-3 py-3">
            <p className="text-xs text-zinc-400">{item.label}</p>
            <p className="text-sm font-semibold text-zinc-900">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="gap-5 p-5">
        <Section title="Quando">
          <div className={cn("grid gap-3", !compact && "sm:grid-cols-2")}>
            <div>
              <p className="text-xs text-zinc-400">Campanha</p>
              <p className="text-sm text-zinc-800">{formatDateRangeBR(draft.startDate, draft.endDate, "Datas opcionais")}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Candidatura</p>
              <p className="text-sm text-zinc-800">{formatDateRangeBR(draft.applicationStart, draft.applicationEnd, "Sem período")}</p>
            </div>
          </div>
        </Section>

        <Separator />

        <Section title="Público">
          {draft.audienceCountry || draft.audienceAges?.length ? (
            <Chips items={[draft.audienceCountry, ...(draft.audienceAges ?? [])].filter((item): item is string => Boolean(item))} />
          ) : (
            <Empty>Público ainda não definido.</Empty>
          )}
        </Section>

        <Separator />

        <Section title="Creator ideal">
          <Chips items={[
            draft.creatorLocation,
            draft.creatorLanguage,
            ...networks.map((network) => SOCIAL_NETWORK_LABEL[network]),
            ...tiers.map((tier) => tier.label),
            ...(draft.targetNiches ?? []),
            draft.minEngagement ? `${String(draft.minEngagement).replace(".", ",")}%` : undefined,
          ].filter((item): item is string => Boolean(item))} />
          {people(draft.minFollowers) || people(draft.maxFollowers) ? (
            <p className="text-sm text-zinc-600">De {people(draft.minFollowers) ?? "—"} a {people(draft.maxFollowers) ?? "—"} seguidores.</p>
          ) : null}
          {draft.audienceNotes ? <p className="text-sm leading-relaxed text-zinc-600">{draft.audienceNotes}</p> : null}
          {!draft.creatorLocation && !networks.length && !draft.targetNiches?.length ? <Empty>Perfil do creator ainda não definido.</Empty> : null}
        </Section>

        <Separator />

        <Section title="Entrega">
          {formats.length ? (
            <div className="space-y-2">
              {formats.map((item) => {
                const format = contentFormatByValue(item.format)
                const network = format?.network
                const Icon = network ? NETWORK_ICONS[network] : null
                return (
                  <div key={item.format} className="flex items-center justify-between gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 text-zinc-800">
                      {Icon ? <Icon className="size-3.5 text-zinc-500" /> : null}
                      {format?.label ?? item.format}
                    </span>
                    <span className="font-medium text-zinc-900">{item.quantity}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <Empty>Nenhum formato escolhido.</Empty>
          )}
        </Section>

        <Separator />

        <Section title="Condições">
          {terms.length ? (
            <div className="space-y-1.5 text-sm text-zinc-700">
              {terms.map((term) => (
                <p key={term.id}>
                  {term.label}
                  {term.id === "fixo" && draft.fixedFeePerPost ? ` · ${money(draft.fixedFeePerPost)} por post` : ""}
                  {term.id === "comissao" && draft.commission?.mode === "percent" && draft.commission.value ? ` · ${draft.commission.value}%` : ""}
                  {term.id === "comissao" && draft.commission?.mode === "fixed" && draft.commission.value ? ` · ${money(draft.commission.value)}` : ""}
                  {term.id === "comissao" && draft.commission?.mode === "contract" ? " · contrato" : ""}
                </p>
              ))}
            </div>
          ) : (
            <Empty>Nenhuma condição comercial.</Empty>
          )}
          <p className="text-sm text-zinc-500">
            {draft.recommendToMatching ? "A plataforma pode indicar esta campanha." : "Sem recomendação automática."}
            {draft.applicationCap ? ` Sai da vitrine depois de ${draft.applicationCap} candidaturas.` : ""}
          </p>
        </Section>

        <Separator />

        <Section title="Briefing">
          {draft.description ? <p className="text-sm leading-relaxed text-zinc-700">{draft.description}</p> : <Empty>Sem texto de briefing.</Empty>}
          {(draft.productCategories ?? []).length > 0 ? <Chips items={draft.productCategories ?? []} /> : null}
          {(draft.doList?.length || draft.dontList?.length) ? <GuidelineLists doList={draft.doList ?? []} dontList={draft.dontList ?? []} /> : null}
        </Section>

        <Separator />

        <Section title="Metas">
          {goals.length ? (
            <div className={cn("grid gap-2", !compact && "sm:grid-cols-2")}>
              {goals.map((goal) => (
                <div key={goal.id} className="rounded-xl bg-zinc-50 px-3 py-2">
                  <p className="text-xs text-zinc-400">{goal.label}</p>
                  <p className="text-sm font-semibold text-zinc-900">{goal.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <Empty>Nenhuma meta definida.</Empty>
          )}
          <Chips items={[...(draft.mandatoryHashtags ?? []), ...mentions.map((item) => item.handle)]} />
        </Section>

        <Separator />

        <Section title="Convites">
          {invited.length ? (
            <div className="flex flex-wrap gap-2">
              {invited.map((creator) => (
                <span key={creator.id} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 py-1 pr-3 pl-1 text-sm text-zinc-800">
                  <Avatar size="sm">
                    <AvatarImage src={creator.photo} alt="" />
                    <AvatarFallback>{creator.avatar}</AvatarFallback>
                  </Avatar>
                  {creator.name}
                </span>
              ))}
            </div>
          ) : (
            <Empty>Nenhum convite selecionado.</Empty>
          )}
        </Section>
      </Card>

      {form?.site ? <SitePlayer form={form} preview device={device} /> : null}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        <Button type="button" variant={device === "desktop" ? "secondary" : "ghost"} size="sm" onClick={() => setDevice("desktop")}>
          <Monitor />
          {t("forms.previewDesktop")}
        </Button>
        <Button type="button" variant={device === "mobile" ? "secondary" : "ghost"} size="sm" onClick={() => setDevice("mobile")}>
          <Smartphone />
          {t("forms.previewMobile")}
        </Button>
      </div>
      {device === "mobile" ? (
        <div className="flex justify-center py-4">
          <div className="h-[680px] w-[360px] overflow-y-auto rounded-[28px] border border-zinc-200 bg-zinc-50 shadow-sm">{body}</div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl">{body}</div>
      )}
    </div>
  )
}
