"use client"

import { useState } from "react"
import { ArrowRight, Baby, Banknote, Briefcase, Car, Clapperboard, Coins, Cpu, Dumbbell, Eye, Gamepad2, Gift, Globe, GraduationCap, HeartPulse, Home, Link2, Lock, Megaphone, MessageCircle, PawPrint, Percent, Plane, Radio, RotateCcw, Shirt, ShoppingBag, Sparkles, Sun, Ticket, Users, UtensilsCrossed, X } from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { CampaignSuccessTargets } from "@/components/campaigns/campaign-success-targets"
import { GuidelineLists } from "@/components/campaigns/guideline-list"
import { AgePills, Choice, ChoiceCards, MultiChoice, MultiChoiceCards, QuestionTitle, Sentence, Token, YesNo } from "@/components/campaigns/wizard/wizard-chrome"
import { BannerCoverField } from "@/components/campaigns/wizard/banner-cover-field"
import { LocationSuggest } from "@/components/campaigns/wizard/location-suggest"
import { StoreProductPicker } from "@/components/campaigns/wizard/store-product-picker"
import { AI_ACCOMPANIMENT_CREDIT_COST } from "@/lib/credits"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import { CONTENT_FORMATS, contentFormatByValue } from "@/lib/campaign-types"
import {
  AGE_RANGES,
  ENGAGEMENT_MIN_OPTIONS,
  NICHE_CATALOG,
  REQUIREMENT_FIELDS,
  STRATEGIES,
  TACTICS,
  availableBannerShowItems,
  communityPath,
  defaultBannerShowItems,
  deriveCampaignType,
  normalizeBannerShowItems,
  primaryBannerFee,
  type BannerShowItem,
} from "@/lib/campaigns/shape"
import { isBudgetNotApplicable } from "@/lib/campaigns/wizard-flow"
import type { WizardStepId } from "@/lib/campaigns/wizard-steps"
import { brandCreatorIds } from "@/lib/discovery/scope"
import { isSocialNetwork, normalizeMentions, type Campaign, type CommissionMode, type ContentFormat, type SocialNetwork } from "@/lib/mock-data/campaigns"
import { CREATORS } from "@/lib/mock-data/creators"
import { TIERS } from "@/lib/audience-tiers"
import type { SeedingProduct } from "@/lib/mock-data/seeding"
import type { WizardDraft } from "@/lib/stores/campaigns"
import { cn } from "@/lib/utils"

function toggleItem<T extends string>(items: T[] | undefined, value: T) {
  const current = items ?? []
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
}

const NETWORKS: { id: SocialNetwork; label: string; description: string; icon: typeof SiInstagram; iconClassName: string }[] = [
  { id: "instagram", label: "Instagram", description: "Reels, Stories e Feed", icon: SiInstagram, iconClassName: "text-[#E4405F]" },
  { id: "tiktok", label: "TikTok", description: "Vídeo curto nativo", icon: SiTiktok, iconClassName: "text-zinc-900" },
  { id: "youtube", label: "YouTube", description: "Vídeo e Shorts", icon: SiYoutube, iconClassName: "text-[#FF0000]" },
]

const NICHE_ICONS = {
  beleza: Sparkles,
  "saude-bem-estar": HeartPulse,
  fitness: Dumbbell,
  moda: Shirt,
  gastronomia: UtensilsCrossed,
  lifestyle: Sun,
  "casa-decoracao": Home,
  "maternidade-familia": Baby,
  pets: PawPrint,
  tecnologia: Cpu,
  games: Gamepad2,
  "financas-negocios": Briefcase,
  educacao: GraduationCap,
  viagem: Plane,
  automotivo: Car,
  "cultura-entretenimento": Clapperboard,
} as const

const NICHE_OPTIONS = NICHE_CATALOG.map((item) => ({
  id: item.id,
  label: item.label,
  description: item.description,
  icon: NICHE_ICONS[item.id],
}))

const LANGUAGE_OPTIONS = [
  { id: "Português", label: "Português", mark: "🇧🇷" },
  { id: "Inglês", label: "Inglês", mark: "🇺🇸" },
  { id: "Espanhol", label: "Espanhol", mark: "🇪🇸" },
  { id: "Francês", label: "Francês", mark: "🇫🇷" },
]

const STRATEGY_ICONS = { alcance: Eye, engajamento: MessageCircle, vendas: ShoppingBag }
const TACTIC_ICONS = { publipost: Megaphone, live: Radio, link: Link2, cupom: Ticket }
const TERM_OPTIONS = [
  { id: "fixo" as const, label: "Fixo", description: "Cachê por post publicado", icon: Banknote },
  { id: "permuta" as const, label: "Permuta", description: "Produto enviado no lugar do cachê", icon: Gift },
  { id: "comissao" as const, label: "Comissão", description: "Percentual ou valor por venda", icon: Percent },
]
const VISIBILITY_OPTIONS = [
  { id: "publica" as const, label: "Pública", description: "Qualquer creator vê na vitrine", icon: Globe },
  { id: "privada" as const, label: "Privada", description: "Fica na comunidade da marca", icon: Users },
  { id: "secreta" as const, label: "Secreta", description: "Só entra quem recebe convite", icon: Lock },
]

export function WizardQuestion({
  step,
  draft,
  organizationId,
  organizationName,
  campaigns,
  pulse,
  onChange,
  onNext,
  onClear,
  canClear,
  filling,
}: {
  step: WizardStepId
  draft: WizardDraft
  organizationId: string
  organizationName: string
  campaigns: Campaign[]
  pulse: boolean
  onChange: (patch: WizardDraft) => void
  onNext?: () => void
  onClear?: () => void
  canClear?: boolean
  filling?: boolean
}) {
  const [tag, setTag] = useState("")
  const [mentionNetwork, setMentionNetwork] = useState<SocialNetwork>("instagram")
  const [query, setQuery] = useState("")

  if (step === "website") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <QuestionTitle>Qual é o site da sua marca?</QuestionTitle>
          <Button type="button" variant="destructive" size="sm" onClick={onClear} disabled={!canClear}>
            <RotateCcw />
            Limpar formulário
          </Button>
        </div>
        <div className="relative max-w-xl">
          <Input
            type="url"
            placeholder="https://www.suamarca.com"
            value={draft.brandWebsite ?? ""}
            onChange={(event) => onChange({ brandWebsite: event.target.value })}
            className="h-12 rounded-xl pr-14 text-base"
          />
          <Button type="button" size="icon" className="absolute top-1.5 right-1.5 rounded-lg" aria-label="Continuar" onClick={onNext} disabled={!draft.brandWebsite?.trim() || filling}>
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Token
            selected={Boolean(draft.aiAccompaniment)}
            onClick={() => onChange({ aiAccompaniment: !draft.aiAccompaniment })}
          >
            <Sparkles className="size-3.5" />
            Acompanhamento com IA
            <span className="inline-flex items-center gap-1 tabular-nums opacity-80" aria-label={`${AI_ACCOMPANIMENT_CREDIT_COST} créditos`}>
              <Coins className="size-3.5" aria-hidden />
              {AI_ACCOMPANIMENT_CREDIT_COST}
            </span>
          </Token>
          <p className="text-xs text-zinc-500">
            {draft.aiAccompaniment
              ? `No Próximo, a IA lê o site e começa a preencher. Usa ${AI_ACCOMPANIMENT_CREDIT_COST} créditos.`
              : `Opcional. Selecione para a IA acompanhar o preenchimento (${AI_ACCOMPANIMENT_CREDIT_COST} créditos).`}
          </p>
        </div>
      </div>
    )
  }

  if (step === "identity") {
    return (
      <div className="space-y-6">
        <QuestionTitle>Qual é o nome e o nicho da campanha?</QuestionTitle>
        <Sentence pulse={pulse}>
          O nome da campanha é
        </Sentence>
        <Input data-ai-field="name" maxLength={90} value={draft.name ?? ""} placeholder="Nome da campanha" className="h-12 max-w-xl rounded-xl text-base" onChange={(event) => onChange({ name: event.target.value })} />
        <Sentence pulse={pulse}>
          Os nichos são
          <MultiChoice
            field="niche"
            values={(draft.niches?.length ? draft.niches : draft.niche ? [draft.niche] : []) as typeof NICHE_OPTIONS[number]["id"][]}
            placeholder="Escolher nichos"
            options={NICHE_OPTIONS}
            onToggle={(id) => {
              const current = draft.niches?.length ? draft.niches : draft.niche ? [draft.niche] : []
              const niches = toggleItem(current, id)
              onChange({ niches, niche: niches.join(" · ") || undefined })
            }}
            pulse={pulse}
          />
        </Sentence>
        <div className="max-w-xl space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-900">Período da campanha <span className="font-normal text-zinc-500">Opcional</span></p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="campaign-start">Início</Label>
                <Input id="campaign-start" data-ai-field="startDate" type="date" lang="pt-BR" value={draft.startDate ?? ""} onChange={(event) => onChange({ startDate: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campaign-end">Fim</Label>
                {draft.endDateNotApplicable ? (
                  <div className="flex h-9 items-center rounded-md border border-dashed border-sky-200 bg-sky-50 px-3 text-sm font-medium text-sky-900">
                    Campanha perpétua
                  </div>
                ) : (
                  <Input
                    id="campaign-end"
                    data-ai-field="endDate"
                    type="date"
                    lang="pt-BR"
                    value={draft.endDate ?? ""}
                    onChange={(event) => onChange({ endDate: event.target.value || undefined, endDateNotApplicable: false })}
                  />
                )}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
              <Checkbox
                checked={Boolean(draft.endDateNotApplicable)}
                onCheckedChange={(checked) => onChange(
                  checked
                    ? { endDateNotApplicable: true, endDate: undefined }
                    : { endDateNotApplicable: false },
                )}
              />
              Não há data de encerramento definida
            </label>
            {draft.endDateNotApplicable ? (
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm leading-relaxed text-sky-950">
                <p className="font-semibold">Campanha perpétua</p>
                <p className="mt-0.5 text-sky-900/80">
                  Sem data de fim, a campanha permanece aberta até você encerrá-la manualmente. Isso aparece na revisão e para o creator.
                </p>
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-900">Período de candidatura <span className="font-normal text-zinc-500">Opcional</span></p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="application-start">Abre em</Label>
                <Input id="application-start" data-ai-field="applicationStart" type="date" lang="pt-BR" value={draft.applicationStart ?? ""} onChange={(event) => onChange({ applicationStart: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="application-end">Fecha em</Label>
                {draft.applicationEndNotApplicable ? (
                  <div className="flex h-9 items-center rounded-md border border-dashed border-zinc-200 px-3 text-sm text-zinc-500">
                    Sem encerramento
                  </div>
                ) : (
                  <Input
                    id="application-end"
                    data-ai-field="applicationEnd"
                    type="date"
                    lang="pt-BR"
                    value={draft.applicationEnd ?? ""}
                    onChange={(event) => onChange({ applicationEnd: event.target.value || undefined, applicationEndNotApplicable: false })}
                  />
                )}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
              <Checkbox
                checked={Boolean(draft.applicationEndNotApplicable)}
                onCheckedChange={(checked) => onChange(
                  checked
                    ? { applicationEndNotApplicable: true, applicationEnd: undefined }
                    : { applicationEndNotApplicable: false },
                )}
              />
              Não há data de encerramento definida
            </label>
          </div>
        </div>
        <BannerCoverField value={draft.coverImage} onChange={(coverImage) => onChange({ coverImage })} />
      </div>
    )
  }

  if (step === "strategy") {
    return (
      <div className="space-y-6">
        <QuestionTitle>Qual é a estratégia?</QuestionTitle>
        <Sentence pulse={pulse}>Estou lançando esta campanha para:</Sentence>
        <ChoiceCards
          field="strategy"
          value={draft.strategy}
          options={STRATEGIES.map((item) => ({ id: item.id, label: item.label, description: item.description, icon: STRATEGY_ICONS[item.id] }))}
          onPick={(strategy) => onChange({ strategy, objective: STRATEGIES.find((item) => item.id === strategy)?.description })}
          pulse={pulse}
        />
      </div>
    )
  }

  if (step === "tactics") {
    return (
      <div className="space-y-6">
        <QuestionTitle>Qual é a tática?</QuestionTitle>
        <Sentence pulse={pulse}>A entrega acontece por:</Sentence>
        <MultiChoiceCards
          field="tactics"
          values={draft.tactics ?? []}
          options={TACTICS.map((item) => ({ id: item.id, label: item.label, description: item.description, icon: TACTIC_ICONS[item.id] }))}
          onToggle={(id) => onChange({ tactics: toggleItem(draft.tactics, id) })}
          pulse={pulse}
        />
      </div>
    )
  }

  if (step === "audience") {
    return (
      <div className="space-y-6">
        <QuestionTitle>Quem é o público ideal?</QuestionTitle>
        <Sentence pulse={pulse}>
          Estou mirando pessoas em
          <LocationSuggest
            field="audienceCountry"
            value={draft.audienceCountry}
            onChange={(audienceCountry) => onChange({ audienceCountry })}
            pulse={pulse}
          />
        </Sentence>
        <div>
          <p className="mb-3 text-sm text-zinc-500">Qual é a faixa de idade?</p>
          <AgePills field="audienceAges" values={draft.audienceAges ?? []} options={AGE_RANGES} onToggle={(age) => onChange({ audienceAges: toggleItem(draft.audienceAges, age) })} pulse={pulse} />
        </div>
      </div>
    )
  }

  if (step === "creator") {
    const previous = campaigns.filter((campaign) => campaign.organizationId === organizationId && campaign.id !== draft.reservedId)
    return (
      <div className="space-y-6">
        <QuestionTitle>Qual é o perfil ideal de creator?</QuestionTitle>
        <Sentence pulse={pulse}>
          Quero creators de
          <LocationSuggest
            field="creatorLocation"
            value={draft.creatorLocation}
            onChange={(creatorLocation) => onChange({ creatorLocation })}
            pulse={pulse}
          />
          que falem
          <Choice field="creatorLanguage" value={draft.creatorLanguage} placeholder="Idioma" options={LANGUAGE_OPTIONS} onPick={(creatorLanguage) => onChange({ creatorLanguage })} pulse={pulse} />
        </Sentence>
        <Sentence pulse={pulse}>
          Ativos em
          <MultiChoice
            field="targetNetworks"
            values={(draft.targetNetworks ?? []).filter(isSocialNetwork)}
            placeholder="Rede"
            options={NETWORKS.map((item) => ({ id: item.id, label: item.label, description: item.description, icon: item.icon, iconClassName: item.iconClassName }))}
            onToggle={(id) => onChange({ targetNetworks: toggleItem(draft.targetNetworks?.filter(isSocialNetwork), id) })}
            pulse={pulse}
          />
          do porte
          <MultiChoice
            field="audienceTiers"
            values={draft.audienceTiers ?? []}
            placeholder="Porte"
            options={TIERS.map((item) => ({ id: item.id, label: item.label, description: item.range, icon: Users }))}
            onToggle={(id) => {
              const audienceTiers = toggleItem(draft.audienceTiers, id)
              const picked = TIERS.filter((item) => audienceTiers.includes(item.id))
              onChange({
                audienceTiers,
                minFollowers: picked.length ? Math.min(...picked.map((item) => item.min)) : 0,
                maxFollowers: picked.length ? Math.max(...picked.map((item) => item.max)) : 0,
              })
            }}
            pulse={pulse}
          />
        </Sentence>
        <div className="space-y-2">
          {NETWORKS.map((network) => {
            const on = (draft.targetNetworks ?? []).includes(network.id)
            const Icon = network.icon
            return (
              <div key={network.id} className={cn("flex items-center gap-3 text-sm", !on && "opacity-40")}>
                <Icon className="size-4" />
                <span className="w-24">{network.label}</span>
                <span className="text-zinc-500">de {draft.minFollowers ? draft.minFollowers.toLocaleString("pt-BR") : "—"} a {draft.maxFollowers ? draft.maxFollowers.toLocaleString("pt-BR") : "—"} seguidores</span>
              </div>
            )
          })}
        </div>
        <Sentence pulse={pulse}>
          No nicho
          <MultiChoice field="targetNiches" values={(draft.targetNiches ?? []) as typeof NICHE_OPTIONS[number]["id"][]} placeholder="Nicho" options={NICHE_OPTIONS} onToggle={(id) => onChange({ targetNiches: toggleItem(draft.targetNiches, id) })} pulse={pulse} />
          com engajamento mínimo de
          <Choice
            field="minEngagement"
            value={typeof draft.minEngagement === "number" ? String(draft.minEngagement) : undefined}
            placeholder="%"
            options={ENGAGEMENT_MIN_OPTIONS.map((item) => ({
              id: item.id,
              label: item.label,
              description: item.description,
            }))}
            onPick={(id) => onChange({ minEngagement: Number(id) })}
            pulse={pulse}
          />
        </Sentence>
        <div className="flex flex-wrap gap-2">
          {REQUIREMENT_FIELDS.map((field) => (
            <Token key={field.id} selected={(draft.requiredCreatorFields ?? []).includes(field.id)} onClick={() => onChange({ requiredCreatorFields: toggleItem(draft.requiredCreatorFields, field.id) })}>
              Exigir {field.label}
            </Token>
          ))}
        </div>
        {previous.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {previous.slice(0, 4).map((campaign) => (
              <Button key={campaign.id} type="button" variant="outline" size="sm" onClick={() => onChange({
                targetNiches: campaign.targetNiches,
                targetNetworks: campaign.targetNetworks.filter(isSocialNetwork),
                minFollowers: campaign.minFollowers,
                maxFollowers: campaign.maxFollowers,
                minEngagement: campaign.minEngagement,
                creatorLocation: campaign.creatorLocation,
                creatorLanguage: campaign.creatorLanguage,
                audienceNotes: campaign.audienceNotes,
                requiredCreatorFields: campaign.requiredCreatorFields,
                commercialTerms: campaign.commercialTerms,
                fixedFeePerPost: campaign.fixedFeePerPost,
                commission: campaign.commission,
              })}>
                Usar preset de {campaign.name}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  if (step === "privacy") {
    return (
      <div className="space-y-6">
        <QuestionTitle>Quem pode ver a campanha?</QuestionTitle>
        <Sentence pulse={pulse}>A campanha fica:</Sentence>
        <ChoiceCards
          field="visibility"
          value={draft.visibility}
          options={VISIBILITY_OPTIONS}
          onPick={(visibility) =>
            onChange(
              visibility === "secreta"
                ? { visibility, recommendToMatching: undefined, applicationCap: undefined }
                : { visibility },
            )
          }
          pulse={pulse}
          columns={3}
        />
      </div>
    )
  }

  if (step === "recommend") {
    return (
      <div className="space-y-6">
        <QuestionTitle>Recomendar a creators compatíveis?</QuestionTitle>
        <Sentence pulse={pulse}>
          Deixar a plataforma indicar esta campanha
          <YesNo field="recommendToMatching" value={draft.recommendToMatching} onChange={(recommendToMatching) => onChange({ recommendToMatching })} pulse={pulse} />
        </Sentence>
      </div>
    )
  }

  if (step === "cap") {
    const decided = draft.applicationCap !== undefined
    const limited = decided && (draft.applicationCap ?? 0) >= 1
    return (
      <div className="space-y-6">
        <QuestionTitle>Limitar as candidaturas da vitrine?</QuestionTitle>
        <YesNo
          field="applicationCap"
          value={decided ? limited : undefined}
          onChange={(next) => onChange({ applicationCap: next ? ((draft.applicationCap ?? 0) >= 1 ? draft.applicationCap : 100) : 0 })}
          pulse={pulse}
        />
        {limited ? (
          <Sentence pulse={pulse}>
            Tirar a campanha da vitrine depois de
            <Input
              className="mx-2 inline-flex h-8 w-24 rounded-full text-center"
              type="number"
              min={1}
              value={draft.applicationCap ?? ""}
              onChange={(event) => {
                const raw = event.target.value
                if (raw === "") {
                  onChange({ applicationCap: 100 })
                  return
                }
                onChange({ applicationCap: Math.max(1, Number(raw) || 1) })
              }}
            />
            candidaturas
          </Sentence>
        ) : null}
      </div>
    )
  }

  if (step === "community") {
    const link = draft.reservedId ? communityPath(organizationId, draft.reservedId) : ""
    return (
      <div className="space-y-4">
        <QuestionTitle>Vínculo com a comunidade de {organizationName || "a marca"}</QuestionTitle>
        <Sentence>O link fica pronto ao salvar e leva o creator até esta campanha.</Sentence>
        {link ? <p className="max-w-xl rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{link}</p> : null}
      </div>
    )
  }

  if (step === "terms") {
    const terms = draft.commercialTerms ?? []
    const hasFixo = terms.includes("fixo")
    const budgetSkipped = isBudgetNotApplicable(draft)
    return (
      <div className="space-y-6">
        <QuestionTitle>Quais são as condições comerciais?</QuestionTitle>
        <Sentence pulse={pulse}>A campanha paga com:</Sentence>
        <MultiChoiceCards
          field="commercialTerms"
          values={terms}
          options={TERM_OPTIONS}
          onToggle={(id) => {
            const next = toggleItem(terms, id)
            const nextHasFixo = next.includes("fixo")
            if (!nextHasFixo) {
              onChange({
                commercialTerms: next,
                budgetNotApplicable: true,
                budget: undefined,
                maxInfluencers: undefined,
              })
              return
            }
            onChange({
              commercialTerms: next,
              ...(id === "fixo" ? { budgetNotApplicable: false } : {}),
            })
          }}
          pulse={pulse}
          columns={3}
        />
        {hasFixo ? (
          <div className="space-y-3 border-t border-zinc-100 pt-5">
            <Sentence pulse={pulse}>
              O teto da campanha é R$
              {budgetSkipped ? (
                <span className="mx-2 text-zinc-500">Não se aplica</span>
              ) : (
                <>
                  <Input
                    data-ai-field="budget"
                    className="mx-2 inline-flex h-8 w-32 rounded-full text-center"
                    type="number"
                    min={0}
                    value={draft.budget ?? ""}
                    onChange={(event) =>
                      onChange({
                        budget: event.target.value === "" ? undefined : Number(event.target.value),
                        budgetNotApplicable: false,
                      })
                    }
                  />
                  para até
                  <Input
                    data-ai-field="maxInfluencers"
                    className="mx-2 inline-flex h-8 w-20 rounded-full text-center"
                    type="number"
                    min={1}
                    value={draft.maxInfluencers ?? ""}
                    onChange={(event) =>
                      onChange({
                        maxInfluencers: event.target.value === "" ? undefined : Number(event.target.value),
                        budgetNotApplicable: false,
                      })
                    }
                  />
                  influencers
                </>
              )}
            </Sentence>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
              <Checkbox
                checked={budgetSkipped}
                onCheckedChange={(checked) =>
                  onChange(
                    checked
                      ? { budgetNotApplicable: true, budget: undefined, maxInfluencers: undefined }
                      : { budgetNotApplicable: false },
                  )
                }
              />
              Não se aplica
            </label>
          </div>
        ) : null}
      </div>
    )
  }

  if (step === "budget") {
    const terms = draft.commercialTerms ?? []
    const commissionModes = draft.commissionModes?.length
      ? draft.commissionModes
      : draft.commission?.mode
        ? [draft.commission.mode]
        : []
    const contractOnly = terms.includes("comissao") && commissionModes.length === 1 && commissionModes[0] === "contract"
    const bannerBlocked = contractOnly
    const percentValue = draft.commissionPercent ?? (draft.commission?.mode === "percent" ? draft.commission.value : undefined)
    const fixedValue = draft.commissionFixed ?? (draft.commission?.mode === "fixed" ? draft.commission.value : undefined)
    const availableItems = availableBannerShowItems({
      commercialTerms: terms,
      commissionModes,
      commission: draft.commission,
    })
    const bannerOffer = bannerBlocked ? "contact" : draft.bannerOffer
    const showingOffer = bannerOffer === "show" && !bannerBlocked
    const selectedItems = showingOffer
      ? normalizeBannerShowItems(
          draft.bannerShowItems?.length
            ? draft.bannerShowItems
            : draft.bannerOfferKind
              ? [
                  ...(availableItems.includes("fixedFee") ? (["fixedFee"] as BannerShowItem[]) : []),
                  ...(draft.bannerOfferKind === "percent" && availableItems.includes("commissionPercent")
                    ? (["commissionPercent"] as BannerShowItem[])
                    : []),
                  ...(draft.bannerOfferKind === "fixed" && availableItems.includes("commissionFixed")
                    ? (["commissionFixed"] as BannerShowItem[])
                    : []),
                ]
              : defaultBannerShowItems(availableItems),
          availableItems,
        )
      : []
    const bothCommissionKinds =
      availableItems.includes("commissionPercent") && availableItems.includes("commissionFixed")
    const canCombineFeeAndCommission =
      availableItems.includes("fixedFee") &&
      (availableItems.includes("commissionPercent") || availableItems.includes("commissionFixed"))

    function bannerFeePatch(items: BannerShowItem[]) {
      const normalized = normalizeBannerShowItems(items, availableItems)
      const amount = primaryBannerFee({
        bannerShowItems: normalized,
        fixedFeePerPost: draft.fixedFeePerPost,
        commissionPercent: percentValue,
        commissionFixed: fixedValue,
        commission: draft.commission,
      })
      const commissionKind = normalized.includes("commissionPercent")
        ? "percent" as const
        : normalized.includes("commissionFixed")
          ? "fixed" as const
          : undefined
      return {
        bannerOffer: "show" as const,
        bannerShowItems: normalized,
        bannerOfferKind: commissionKind,
        perInfluencerFee: typeof amount === "number" ? amount : undefined,
      }
    }

    function enableBannerOffer() {
      onChange(bannerFeePatch(defaultBannerShowItems(availableItems)))
    }

    function toggleBannerItem(item: BannerShowItem) {
      const current = new Set(selectedItems)
      if (current.has(item)) current.delete(item)
      else {
        if (item === "commissionPercent") current.delete("commissionFixed")
        if (item === "commissionFixed") current.delete("commissionPercent")
        current.add(item)
      }
      const next = [...current] as BannerShowItem[]
      if (!next.length) {
        onChange({ bannerOffer: "contact", perInfluencerFee: "contact", bannerShowItems: [], bannerOfferKind: undefined })
        return
      }
      onChange(bannerFeePatch(next))
    }

    function toggleCommission(mode: CommissionMode) {
      const selected = new Set(commissionModes)
      if (mode === "contract") {
        if (selected.has("contract") && selected.size === 1) {
          onChange({ commissionModes: [], commission: undefined })
          return
        }
        onChange({
          commissionModes: ["contract"],
          commission: { mode: "contract" },
          commissionPercent: undefined,
          commissionFixed: undefined,
          bannerOffer: "contact",
          perInfluencerFee: "contact",
          bannerOfferKind: undefined,
          bannerShowItems: [],
        })
        return
      }
      selected.delete("contract")
      if (selected.has(mode)) selected.delete(mode)
      else selected.add(mode)
      const modes = [...selected] as Array<"percent" | "fixed" | "contract">
      const primary = modes.includes("percent") ? "percent" as const : modes.includes("fixed") ? "fixed" as const : undefined
      const nextAvailable = availableBannerShowItems({
        commercialTerms: terms,
        commissionModes: modes,
        commission: primary ? { mode: primary, value: primary === "percent" ? percentValue : fixedValue } : undefined,
      })
      const nextItems = showingOffer
        ? normalizeBannerShowItems(
            draft.bannerShowItems,
            nextAvailable,
            primary === "percent" ? "commissionPercent" : primary === "fixed" ? "commissionFixed" : undefined,
          )
        : []
      onChange({
        commissionModes: modes,
        commission: primary
          ? {
              mode: primary,
              value: primary === "percent" ? percentValue : fixedValue,
            }
          : undefined,
        ...(showingOffer
          ? bannerFeePatch(nextItems.length ? nextItems : defaultBannerShowItems(nextAvailable))
          : {}),
      })
    }

    return (
      <div className="space-y-6">
        <QuestionTitle>Como remunerar e mostrar a oferta?</QuestionTitle>
        {terms.includes("fixo") ? (
          <Sentence pulse={pulse}>
            O valor fixo por post é R$
            <Input
              data-ai-field="fixedFeePerPost"
              className="mx-2 inline-flex h-8 w-28 rounded-full text-center"
              type="number"
              min={1}
              value={draft.fixedFeePerPost ?? ""}
              onChange={(event) => {
                const value = event.target.value === "" ? undefined : Number(event.target.value)
                onChange({
                  fixedFeePerPost: value,
                  ...(showingOffer && selectedItems.includes("fixedFee") && typeof value === "number"
                    ? {
                        perInfluencerFee: primaryBannerFee({
                          bannerShowItems: selectedItems,
                          fixedFeePerPost: value,
                          commissionPercent: percentValue,
                          commissionFixed: fixedValue,
                          commission: draft.commission,
                        }),
                      }
                    : {}),
                })
              }}
            />
          </Sentence>
        ) : null}
        {terms.includes("permuta") ? (
          <div className="space-y-2">
            {(draft.seedingProducts ?? []).map((product) => (
              <div key={product.id} className="flex items-center gap-2">
                <Input
                  className="min-w-0 flex-1"
                  placeholder="Produto enviado"
                  value={product.name}
                  onChange={(event) => onChange({ seedingProducts: (draft.seedingProducts ?? []).map((item) => item.id === product.id ? { ...item, name: event.target.value } : item) })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover ${product.name.trim() || "produto enviado"}`}
                  onClick={() => onChange({ seedingProducts: (draft.seedingProducts ?? []).filter((item) => item.id !== product.id) })}
                >
                  <X />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const product: SeedingProduct = { id: `p-${Date.now()}`, name: "", variants: ["Único"], unitCost: 0, stockForSeeding: 1, stockUsed: 0 }
              onChange({ seedingProducts: [...(draft.seedingProducts ?? []), product] })
            }}>Adicionar produto</Button>
          </div>
        ) : null}
        {terms.includes("comissao") ? (
          <div className="space-y-4">
            <Sentence pulse={pulse}>A comissão é:</Sentence>
            <MultiChoiceCards
              field="commission"
              values={commissionModes}
              options={[
                { id: "percent" as const, label: "Percentual", description: "Uma parte de cada venda", icon: Percent },
                { id: "fixed" as const, label: "Valor fixo", description: "Reais por pedido gerado", icon: Banknote },
                { id: "contract" as const, label: "Contrato", description: "Combinado fora da plataforma", icon: Lock },
              ]}
              onToggle={toggleCommission}
              pulse={pulse}
              columns={3}
            />
            {commissionModes.includes("percent") ? (
              <Sentence pulse={pulse}>
                O percentual é
                <Input
                  className="mx-2 inline-flex h-8 w-24 rounded-full text-center"
                  type="number"
                  min={0}
                  value={percentValue ?? ""}
                  onChange={(event) => {
                    const value = event.target.value === "" ? undefined : Number(event.target.value)
                    onChange({
                      commissionPercent: value,
                      commission: { mode: "percent", value },
                      ...(showingOffer && selectedItems.includes("commissionPercent") && typeof value === "number"
                        ? {
                            perInfluencerFee: primaryBannerFee({
                              bannerShowItems: selectedItems,
                              fixedFeePerPost: draft.fixedFeePerPost,
                              commissionPercent: value,
                              commissionFixed: fixedValue,
                              commission: { mode: "percent", value },
                            }),
                          }
                        : {}),
                    })
                  }}
                />
                %
              </Sentence>
            ) : null}
            {commissionModes.includes("fixed") ? (
              <Sentence pulse={pulse}>
                O valor fixo da comissão é R$
                <Input
                  className="mx-2 inline-flex h-8 w-28 rounded-full text-center"
                  type="number"
                  min={0}
                  value={fixedValue ?? ""}
                  onChange={(event) => {
                    const value = event.target.value === "" ? undefined : Number(event.target.value)
                    onChange({
                      commissionFixed: value,
                      commission: { mode: "fixed", value },
                      ...(showingOffer && selectedItems.includes("commissionFixed") && typeof value === "number"
                        ? {
                            perInfluencerFee: primaryBannerFee({
                              bannerShowItems: selectedItems,
                              fixedFeePerPost: draft.fixedFeePerPost,
                              commissionPercent: percentValue,
                              commissionFixed: value,
                              commission: { mode: "fixed", value },
                            }),
                          }
                        : {}),
                    })
                  }}
                />
              </Sentence>
            ) : null}
            {commissionModes.includes("contract") ? (
              <p className="text-sm text-zinc-500">
                Comissão por contrato: o valor fica combinado fora da plataforma.
              </p>
            ) : null}
          </div>
        ) : null}
        <div className={cn("space-y-3", bannerBlocked && "opacity-50")}>
          <div>
            <p className="text-sm font-medium text-zinc-900">Oferta no banner do marketplace</p>
            <p className="mt-1 text-sm text-zinc-500">
              {bannerBlocked
                ? "Com comissão por contrato, o banner da campanha no marketplace mostra só “Entre em contato” para os influenciadores."
                : canCombineFeeAndCommission
                  ? "Os influenciadores veem isso no banner da campanha no marketplace. Com cachê fixo e comissão, você pode mostrar um, o outro ou os dois. Se houver comissão percentual e fixa, escolha só uma delas."
                  : bothCommissionKinds
                    ? "Os influenciadores veem isso no banner da campanha no marketplace. Com comissão percentual e fixa ativas, mostre apenas uma delas."
                    : "Defina o que os influenciadores veem no banner da campanha no marketplace: a oferta ou “Entre em contato”."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2" data-ai-field="perInfluencerFee">
            <Token
              selected={bannerOffer === "contact"}
              optionId="contact"
              onClick={bannerBlocked ? undefined : () => onChange({
                bannerOffer: "contact",
                perInfluencerFee: "contact",
                bannerShowItems: [],
                bannerOfferKind: undefined,
              })}
            >
              Entre em contato
            </Token>
            <Token
              selected={showingOffer}
              optionId="show"
              onClick={bannerBlocked ? undefined : enableBannerOffer}
            >
              Mostrar oferta aos influenciadores
            </Token>
          </div>
          {showingOffer && availableItems.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">O que mostrar no banner</p>
              <div className="flex flex-wrap gap-2">
                {availableItems.includes("fixedFee") ? (
                  <Token
                    selected={selectedItems.includes("fixedFee")}
                    onClick={() => toggleBannerItem("fixedFee")}
                  >
                    Cachê fixo por post
                    {typeof draft.fixedFeePerPost === "number"
                      ? ` (${draft.fixedFeePerPost.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })})`
                      : ""}
                  </Token>
                ) : null}
                {availableItems.includes("commissionPercent") ? (
                  <Token
                    selected={selectedItems.includes("commissionPercent")}
                    onClick={() => toggleBannerItem("commissionPercent")}
                  >
                    Comissão percentual
                    {percentValue !== undefined ? ` (${String(percentValue).replace(".", ",")}%)` : ""}
                  </Token>
                ) : null}
                {availableItems.includes("commissionFixed") ? (
                  <Token
                    selected={selectedItems.includes("commissionFixed")}
                    onClick={() => toggleBannerItem("commissionFixed")}
                  >
                    Comissão fixa por pedido
                    {fixedValue !== undefined
                      ? ` (${fixedValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })})`
                      : ""}
                  </Token>
                ) : null}
              </div>
              {bothCommissionKinds ? (
                <p className="text-xs text-zinc-500">
                  Comissão percentual e comissão fixa não podem aparecer juntas — selecione só uma.
                </p>
              ) : null}
            </div>
          ) : null}
          {showingOffer ? (
            <p className="text-sm text-zinc-600">
              {selectedItems.length
                ? `No marketplace, os influenciadores veem no banner: ${[
                    selectedItems.includes("fixedFee") && typeof draft.fixedFeePerPost === "number"
                      ? `cachê de ${draft.fixedFeePerPost.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}`
                      : null,
                    selectedItems.includes("commissionPercent") && percentValue !== undefined
                      ? `comissão de ${String(percentValue).replace(".", ",")}%`
                      : null,
                    selectedItems.includes("commissionFixed") && fixedValue !== undefined
                      ? `comissão de ${fixedValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} por pedido`
                      : null,
                  ].filter(Boolean).join(" + ") || "defina os valores acima"}.`
                : "Selecione ao menos um item da oferta para exibir no banner do marketplace."}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  if (step === "brief") {
    return (
      <div className="space-y-5">
        <QuestionTitle>O que o creator precisa contar?</QuestionTitle>
        <MarkdownEditor
          data-ai-field="description"
          value={draft.description ?? ""}
          maxLength={2000}
          placeholder="O que o creator precisa contar"
          onChange={(description) => onChange({ description })}
        />
        <GuidelineLists doList={draft.doList ?? []} dontList={draft.dontList ?? []} pulse={pulse} onChange={onChange} />
        <Input data-ai-field="productCategoriesInput" placeholder="Categoria de produto, Enter para adicionar" value={tag} onChange={(event) => setTag(event.target.value)} onKeyDown={(event) => {
          if (event.key !== "Enter") return
          event.preventDefault()
          const value = tag.trim()
          if (!value) return
          onChange({ productCategories: [...(draft.productCategories ?? []), value] })
          setTag("")
        }} />
        <div data-ai-field="productCategories" className="flex flex-wrap gap-2">
          {(draft.productCategories ?? []).map((item, index, list) => (
            <Token key={item} selected pulse={pulse && index === list.length - 1}>{item}</Token>
          ))}
        </div>
        <StoreProductPicker value={draft.storeProducts ?? []} onChange={(storeProducts) => onChange({ storeProducts })} />
      </div>
    )
  }

  if (step === "scope") {
    const quantities = draft.formatQuantities ?? []
    const toggleFormat = (format: ContentFormat) => {
      const exists = quantities.some((item) => item.format === format)
      const formatQuantities = exists ? quantities.filter((item) => item.format !== format) : [...quantities, { format, quantity: 1 }]
      const network = contentFormatByValue(format)?.network
      const targetNetworks = new Set(draft.targetNetworks ?? [])
      if (network && !exists) targetNetworks.add(network)
      onChange({ formatQuantities, contentFormats: formatQuantities.map((item) => item.format), targetNetworks: [...targetNetworks] })
    }
    return (
      <div className="space-y-5">
        <QuestionTitle>O que o creator entrega?</QuestionTitle>
        <Sentence pulse={pulse}>Os formatos são:</Sentence>
        <MultiChoiceCards
          field="formatQuantities"
          values={quantities.map((item) => item.format)}
          options={CONTENT_FORMATS.map((format) => {
            const network = NETWORKS.find((item) => item.id === format.network)
            return { id: format.value, label: format.label, description: `${network?.label ?? ""} · ${format.hint}`, icon: network?.icon ?? format.icon, iconClassName: network?.iconClassName }
          })}
          onToggle={toggleFormat}
          pulse={pulse}
          columns={3}
        />
        {quantities.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">Quantidade por formato</p>
            {quantities.map((item) => {
              const format = contentFormatByValue(item.format)
              const network = NETWORKS.find((entry) => entry.id === format?.network)
              const Icon = network?.icon
              return (
                <label key={item.format} className="flex items-center gap-3 text-sm">
                  {Icon ? <Icon className={cn("size-4", network?.iconClassName)} /> : null}
                  <span className="w-24">{format?.label}</span>
                  <Input className="h-8 w-20 rounded-full text-center" type="number" min={1} value={item.quantity} onChange={(event) => onChange({ formatQuantities: quantities.map((current) => current.format === item.format ? { ...current, quantity: Number(event.target.value) || 1 } : current) })} />
                </label>
              )
            })}
          </div>
        ) : null}
      </div>
    )
  }

  if (step === "metrics") {
    const mentions = normalizeMentions(draft.mandatoryMentions)
    const campaignType = draft.type ?? deriveCampaignType(draft)
    return (
      <div className="space-y-5">
        <QuestionTitle>O que a campanha precisa alcançar?</QuestionTitle>
        <div data-ai-field="mandatoryHashtags" className="flex flex-wrap gap-2">
          {(draft.mandatoryHashtags ?? []).map((item) => (
            <Token key={item} selected onClick={() => onChange({ mandatoryHashtags: (draft.mandatoryHashtags ?? []).filter((tag) => tag !== item) })}>{item}</Token>
          ))}
          <span data-ai-field="mandatoryMentions" className="contents">
            {mentions.map((item) => (
              <Token key={`${item.network}-${item.handle}`} selected onClick={() => onChange({ mandatoryMentions: mentions.filter((current) => !(current.network === item.network && current.handle === item.handle)) })}>{item.handle}</Token>
            ))}
          </span>
        </div>
        <Input placeholder="#hashtag ou @marca e Enter" value={tag} onChange={(event) => setTag(event.target.value)} onKeyDown={(event) => {
          if (event.key !== "Enter") return
          event.preventDefault()
          const value = tag.trim()
          if (!value) return
          if (value.startsWith("@")) onChange({ mandatoryMentions: [...mentions, { network: mentionNetwork, handle: `@${value.replace(/^@/, "")}` }] })
          else onChange({ mandatoryHashtags: [...(draft.mandatoryHashtags ?? []), `#${value.replace(/^#/, "")}`] })
          setTag("")
        }} />
        <div className="flex gap-2">
          {NETWORKS.map((network) => (
            <Token key={network.id} selected={mentionNetwork === network.id} onClick={() => setMentionNetwork(network.id)}>
              <network.icon className="size-3.5" />
              {network.label}
            </Token>
          ))}
        </div>
        <div data-ai-field="successTargets">
          <CampaignSuccessTargets
            networks={(draft.targetNetworks ?? []).filter(isSocialNetwork)}
            type={campaignType}
            value={draft.successTargets}
            onChange={(successTargets) => onChange({ successTargets })}
            showHeading={false}
          />
        </div>
      </div>
    )
  }

  const ids = brandCreatorIds(organizationId)
  const pool = CREATORS.filter((creator) => ids.size === 0 || ids.has(creator.id))
  const visible = pool.filter((creator) => `${creator.name} ${creator.handle}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
  return (
    <div className="space-y-5">
      <QuestionTitle>Quem já recebe o convite?</QuestionTitle>
      <Input placeholder="Buscar perfil" value={query} onChange={(event) => setQuery(event.target.value)} className="max-w-md" />
      <div className="flex flex-wrap gap-2">
        {visible.map((creator) => (
          <Token key={creator.id} selected={(draft.inviteIds ?? []).includes(creator.id)} onClick={() => onChange({ inviteIds: toggleItem(draft.inviteIds, creator.id) })}>
            <Avatar size="sm" className="-ml-1.5 ring-2 ring-white">
              <AvatarImage src={creator.photo} alt="" />
              <AvatarFallback>{creator.avatar}</AvatarFallback>
            </Avatar>
            {creator.name}
          </Token>
        ))}
      </div>
    </div>
  )
}
