"use client"

import { useRef, useState } from "react"
import { ArrowRight, Banknote, Coins, Cpu, Dumbbell, Eye, Gamepad2, Gift, Globe, ImagePlus, Laugh, Link2, Lock, Megaphone, MessageCircle, Percent, Plane, Radio, RotateCcw, Shirt, ShoppingBag, Sparkles, Sun, Ticket, Users, UtensilsCrossed, Wallet, X } from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { CampaignSuccessTargets } from "@/components/campaigns/campaign-success-targets"
import { GuidelineLists } from "@/components/campaigns/guideline-list"
import { AgePills, Choice, MultiChoice, QuestionTitle, Sentence, Token, YesNo } from "@/components/campaigns/wizard/wizard-chrome"
import { AI_ACCOMPANIMENT_CREDIT_COST } from "@/lib/credits"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import { CONTENT_FORMATS, contentFormatByValue } from "@/lib/campaign-types"
import { AGE_RANGES, REQUIREMENT_FIELDS, STRATEGIES, TACTICS, communityPath } from "@/lib/campaigns/shape"
import type { WizardStepId } from "@/lib/campaigns/wizard-steps"
import { brandCreatorIds } from "@/lib/discovery/scope"
import { isSocialNetwork, normalizeMentions, type Campaign, type ContentFormat, type SocialNetwork } from "@/lib/mock-data/campaigns"
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
  { id: "instagram", label: "Instagram", description: "Reels, stories e feed", icon: SiInstagram, iconClassName: "text-[#E4405F]" },
  { id: "tiktok", label: "TikTok", description: "Vídeo curto nativo", icon: SiTiktok, iconClassName: "text-zinc-900" },
  { id: "youtube", label: "YouTube", description: "Vídeo e shorts", icon: SiYoutube, iconClassName: "text-[#FF0000]" },
]

const NICHE_OPTIONS = [
  { id: "beleza", label: "Beleza", description: "Maquiagem, pele e cabelo", icon: Sparkles },
  { id: "moda", label: "Moda", description: "Roupa, calçado e acessório", icon: Shirt },
  { id: "fitness", label: "Fitness", description: "Treino e bem-estar", icon: Dumbbell },
  { id: "gastronomia", label: "Gastronomia", description: "Comida e bebida", icon: UtensilsCrossed },
  { id: "tecnologia", label: "Tecnologia", description: "Produto e software", icon: Cpu },
  { id: "lifestyle", label: "Lifestyle", description: "Rotina e casa", icon: Sun },
  { id: "humor", label: "Humor", description: "Entretenimento leve", icon: Laugh },
  { id: "games", label: "Games", description: "Jogos e cultura gamer", icon: Gamepad2 },
  { id: "finanças", label: "Finanças", description: "Dinheiro e serviços", icon: Wallet },
  { id: "viagem", label: "Viagem", description: "Destino e experiência", icon: Plane },
] as const

const COUNTRY_OPTIONS = [
  { id: "Brasil", label: "Brasil", mark: "🇧🇷", description: "Português, audiência local" },
  { id: "Portugal", label: "Portugal", mark: "🇵🇹", description: "Português europeu" },
  { id: "Estados Unidos", label: "Estados Unidos", mark: "🇺🇸", description: "Inglês" },
  { id: "França", label: "França", mark: "🇫🇷", description: "Francês" },
  { id: "Espanha", label: "Espanha", mark: "🇪🇸", description: "Espanhol" },
  { id: "México", label: "México", mark: "🇲🇽", description: "Espanhol" },
]

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
  const fileRef = useRef<HTMLInputElement>(null)
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
          O nicho é
          <Choice field="niche" value={draft.niche} placeholder="escolher" options={NICHE_OPTIONS.map((item) => ({ ...item }))} onPick={(niche) => onChange({ niche })} pulse={pulse} />
        </Sentence>
        <div className="max-w-xl space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-900">Período da campanha <span className="font-normal text-zinc-500">opcional</span></p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="campaign-start">Início</Label>
                <Input id="campaign-start" data-ai-field="startDate" type="date" lang="pt-BR" value={draft.startDate ?? ""} onChange={(event) => onChange({ startDate: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campaign-end">Fim</Label>
                <Input id="campaign-end" data-ai-field="endDate" type="date" lang="pt-BR" value={draft.endDate ?? ""} onChange={(event) => onChange({ endDate: event.target.value })} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-900">Período de candidatura <span className="font-normal text-zinc-500">opcional</span></p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="application-start">Abre em</Label>
                <Input id="application-start" data-ai-field="applicationStart" type="date" lang="pt-BR" value={draft.applicationStart ?? ""} onChange={(event) => onChange({ applicationStart: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="application-end">Fecha em</Label>
                <Input id="application-end" data-ai-field="applicationEnd" type="date" lang="pt-BR" value={draft.applicationEnd ?? ""} onChange={(event) => onChange({ applicationEnd: event.target.value })} />
              </div>
            </div>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (!file || !file.type.startsWith("image/")) return
          const reader = new FileReader()
          reader.onload = () => onChange({ coverImage: String(reader.result ?? "") })
          reader.readAsDataURL(file)
        }} />
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-900">Banner <span className="font-normal text-zinc-500">1080×1920, opcional</span></p>
          <div className="flex items-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="!h-auto w-36 overflow-hidden rounded-2xl p-0"
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                const file = event.dataTransfer.files?.[0]
                if (!file || !file.type.startsWith("image/")) return
                const reader = new FileReader()
                reader.onload = () => onChange({ coverImage: String(reader.result ?? "") })
                reader.readAsDataURL(file)
              }}
            >
              {draft.coverImage ? (
                <span className="block aspect-[9/16] w-full bg-cover bg-center" style={{ backgroundImage: `url(${draft.coverImage})` }} role="img" aria-label="Prévia do banner" />
              ) : (
                <span className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-2 px-3 text-center text-xs font-medium text-zinc-500">
                  <ImagePlus className="size-5" />
                  Escolher imagem
                </span>
              )}
            </Button>
            {draft.coverImage ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">Toque na imagem para trocar.</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ coverImage: "" })}>Remover</Button>
              </div>
            ) : (
              <p className="max-w-48 text-xs leading-relaxed text-zinc-500">Retrato 9:16. Arraste a imagem ou clique para enviar.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === "strategy") {
    return (
      <div className="space-y-6">
        <QuestionTitle>Qual é a estratégia?</QuestionTitle>
        <Sentence pulse={pulse}>
          Estou lançando esta campanha para
          <Choice
            field="strategy"
            value={draft.strategy}
            placeholder="escolher"
            options={STRATEGIES.map((item) => ({ id: item.id, label: item.label, description: item.description, icon: STRATEGY_ICONS[item.id] }))}
            onPick={(strategy) => onChange({ strategy, objective: STRATEGIES.find((item) => item.id === strategy)?.description })}
            pulse={pulse}
          />
        </Sentence>
      </div>
    )
  }

  if (step === "tactics") {
    return (
      <div className="space-y-6">
        <QuestionTitle>Qual é a tática?</QuestionTitle>
        <Sentence pulse={pulse}>
          A entrega acontece por
          <MultiChoice
            field="tactics"
            values={draft.tactics ?? []}
            placeholder="escolher"
            options={TACTICS.map((item) => ({ id: item.id, label: item.label, description: item.description, icon: TACTIC_ICONS[item.id] }))}
            onToggle={(id) => onChange({ tactics: toggleItem(draft.tactics, id) })}
            pulse={pulse}
          />
        </Sentence>
      </div>
    )
  }

  if (step === "audience") {
    return (
      <div className="space-y-6">
        <QuestionTitle>Quem é o público ideal?</QuestionTitle>
        <Sentence pulse={pulse}>
          Estou mirando pessoas em
          <Choice
            field="audienceCountry"
            value={draft.audienceCountry}
            placeholder="país"
            options={COUNTRY_OPTIONS}
            onPick={(audienceCountry) => onChange({ audienceCountry })}
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
          <Choice field="creatorLocation" value={draft.creatorLocation} placeholder="país" options={COUNTRY_OPTIONS} onPick={(creatorLocation) => onChange({ creatorLocation })} pulse={pulse} />
          que falem
          <Choice field="creatorLanguage" value={draft.creatorLanguage} placeholder="idioma" options={LANGUAGE_OPTIONS} onPick={(creatorLanguage) => onChange({ creatorLanguage })} pulse={pulse} />
        </Sentence>
        <Sentence pulse={pulse}>
          Ativos em
          <MultiChoice
            field="targetNetworks"
            values={(draft.targetNetworks ?? []).filter(isSocialNetwork)}
            placeholder="rede"
            options={NETWORKS.map((item) => ({ id: item.id, label: item.label, description: item.description, icon: item.icon, iconClassName: item.iconClassName }))}
            onToggle={(id) => onChange({ targetNetworks: toggleItem(draft.targetNetworks?.filter(isSocialNetwork), id) })}
            pulse={pulse}
          />
          do porte
          <MultiChoice
            field="audienceTiers"
            values={draft.audienceTiers ?? []}
            placeholder="porte"
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
          <MultiChoice field="targetNiches" values={draft.targetNiches ?? []} placeholder="nicho" options={NICHE_OPTIONS.map((item) => ({ ...item }))} onToggle={(id) => onChange({ targetNiches: toggleItem(draft.targetNiches, id) })} pulse={pulse} />
          com engajamento mínimo de
          <Choice
            field="minEngagement"
            value={draft.minEngagement ? String(draft.minEngagement) : undefined}
            placeholder="%"
            options={[
              { id: "1", label: "1%", description: "Audiência ampla, pouca conversa" },
              { id: "2", label: "2%", description: "Equilíbrio entre alcance e resposta" },
              { id: "3.5", label: "3,5%", description: "Comunidade que comenta e salva" },
              { id: "5", label: "5%", description: "Audiência muito próxima da marca" },
            ]}
            onPick={(id) => onChange({ minEngagement: Number(id) })}
            pulse={pulse}
          />
        </Sentence>
        <div className="flex flex-wrap gap-2">
          {REQUIREMENT_FIELDS.map((field) => (
            <Token key={field.id} selected={(draft.requiredCreatorFields ?? []).includes(field.id)} onClick={() => onChange({ requiredCreatorFields: toggleItem(draft.requiredCreatorFields, field.id) })}>
              Exigir {field.label.toLowerCase()}
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
        <Sentence pulse={pulse}>
          A campanha fica
          <Choice
            field="visibility"
            value={draft.visibility}
            placeholder="escolher"
            options={VISIBILITY_OPTIONS}
            onPick={(visibility) => onChange({ visibility })}
            pulse={pulse}
          />
          na vitrine
        </Sentence>
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
    const limited = draft.applicationCap !== undefined
    return (
      <div className="space-y-6">
        <QuestionTitle>Limitar as candidaturas da vitrine?</QuestionTitle>
        <Sentence pulse={pulse}>
          Tirar a campanha da vitrine depois de
          <YesNo field="applicationCap" value={limited ? true : draft.applicationCap === undefined ? undefined : false} onChange={(next) => onChange({ applicationCap: next ? draft.applicationCap || 100 : undefined })} pulse={pulse} />
          {limited ? (
            <Input className="mx-2 inline-flex h-8 w-24 rounded-full text-center" type="number" min={1} value={draft.applicationCap ?? ""} onChange={(event) => onChange({ applicationCap: event.target.value === "" ? undefined : Number(event.target.value) })} />
          ) : null}
          candidaturas
        </Sentence>
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
    return (
      <div className="space-y-6">
        <QuestionTitle>Quais são as condições comerciais?</QuestionTitle>
        <Sentence pulse={pulse}>
          A campanha paga com
          <MultiChoice
            field="commercialTerms"
            values={draft.commercialTerms ?? []}
            placeholder="escolher"
            options={TERM_OPTIONS}
            onToggle={(id) => onChange({ commercialTerms: toggleItem(draft.commercialTerms, id) })}
            pulse={pulse}
          />
        </Sentence>
      </div>
    )
  }

  if (step === "budget") {
    const terms = draft.commercialTerms ?? []
    return (
      <div className="space-y-6">
        <QuestionTitle>Qual é o orçamento?</QuestionTitle>
        <Sentence pulse={pulse}>
          O teto da campanha é R$
          <Input data-ai-field="budget" className="mx-2 inline-flex h-8 w-32 rounded-full text-center" type="number" min={0} value={draft.budget ?? ""} onChange={(event) => onChange({ budget: event.target.value === "" ? undefined : Number(event.target.value) })} />
          para até
          <Input data-ai-field="maxInfluencers" className="mx-2 inline-flex h-8 w-20 rounded-full text-center" type="number" min={1} value={draft.maxInfluencers ?? ""} onChange={(event) => onChange({ maxInfluencers: event.target.value === "" ? undefined : Number(event.target.value) })} />
          influencers
        </Sentence>
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
          <Sentence pulse={pulse}>
            A comissão é
            <Choice
              field="commission"
              value={draft.commission?.mode}
              placeholder="tipo"
              options={[
                { id: "percent" as const, label: "Percentual", description: "Uma parte de cada venda", icon: Percent },
                { id: "fixed" as const, label: "Valor fixo", description: "Reais por pedido gerado", icon: Banknote },
                { id: "contract" as const, label: "Contrato", description: "Combinado fora da plataforma", icon: Lock },
              ]}
              onPick={(mode) => onChange({ commission: { ...draft.commission, mode } })}
              pulse={pulse}
            />
            {draft.commission?.mode && draft.commission.mode !== "contract" ? (
              <Input className="mx-2 inline-flex h-8 w-24 rounded-full text-center" type="number" min={0} value={draft.commission.value ?? ""} onChange={(event) => onChange({ commission: { mode: draft.commission?.mode ?? "percent", value: event.target.value === "" ? undefined : Number(event.target.value) } })} />
            ) : null}
          </Sentence>
        ) : null}
        <div className="space-y-2">
          <div>
            <Token selected={draft.perInfluencerFee === "contact"} onClick={() => onChange({ perInfluencerFee: draft.perInfluencerFee === "contact" ? undefined : "contact" })}>Entre em contato</Token>
            {draft.perInfluencerFee !== "contact" ? (
              <Input data-ai-field="perInfluencerFee" className="ml-2 inline-flex h-8 w-36 rounded-full text-center" type="number" min={0} placeholder="Valor por influencer" value={typeof draft.perInfluencerFee === "number" ? draft.perInfluencerFee : ""} onChange={(event) => onChange({ perInfluencerFee: event.target.value === "" ? undefined : Number(event.target.value) })} />
            ) : null}
          </div>
          <p className="text-sm text-zinc-500">
            Esse valor (ou “Entre em contato”) aparece no banner da campanha no marketplace.
          </p>
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
        <Sentence pulse={pulse}>
          Os formatos são
          <MultiChoice
            field="formatQuantities"
            values={quantities.map((item) => item.format)}
            placeholder="escolher"
            options={CONTENT_FORMATS.map((format) => {
              const network = NETWORKS.find((item) => item.id === format.network)
              return { id: format.value, label: format.label, description: `${network?.label ?? ""} · ${format.hint}`, icon: network?.icon ?? format.icon, iconClassName: network?.iconClassName }
            })}
            onToggle={toggleFormat}
            pulse={pulse}
          />
        </Sentence>
        {quantities.map((item) => {
          const format = contentFormatByValue(item.format)
          const network = NETWORKS.find((entry) => entry.id === format?.network)
          const Icon = network?.icon
          return (
            <label key={item.format} className="flex items-center gap-3 text-sm">
              {Icon ? <Icon className={cn("size-4", network.iconClassName)} /> : null}
              <span className="w-24">{format?.label}</span>
              <Input className="h-8 w-20 rounded-full text-center" type="number" min={1} value={item.quantity} onChange={(event) => onChange({ formatQuantities: quantities.map((current) => current.format === item.format ? { ...current, quantity: Number(event.target.value) || 1 } : current) })} />
            </label>
          )
        })}
      </div>
    )
  }

  if (step === "metrics") {
    const mentions = normalizeMentions(draft.mandatoryMentions)
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
          <CampaignSuccessTargets networks={(draft.targetNetworks ?? []).filter(isSocialNetwork)} type={draft.type} value={draft.successTargets} onChange={(successTargets) => onChange({ successTargets })} showHeading={false} groups={["alcance", "interacao"]} />
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
