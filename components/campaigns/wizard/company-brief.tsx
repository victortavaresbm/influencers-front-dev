"use client"

import { AlignLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AutofillSuggestion, CompanyProfile } from "@/lib/campaigns/autofill"
import { strategyLabel, tacticLabel } from "@/lib/campaigns/shape"
import { SOCIAL_NETWORK_LABEL, isSocialNetwork } from "@/lib/mock-data/campaigns"
import { TIERS } from "@/lib/audience-tiers"
import { cn } from "@/lib/utils"

function Fact({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  if (!children) return null
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <div className="flex min-w-0 flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="outline" className="h-auto max-w-full whitespace-normal px-2.5 py-1 text-left leading-snug">
          {item}
        </Badge>
      ))}
    </div>
  )
}

function shortSummary(text: string) {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= 220) return clean
  const cut = clean.slice(0, 220)
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "))
  return `${(stop > 80 ? cut.slice(0, stop + 1) : cut).trim()}…`
}

export function CompanyBrief({
  company,
  suggestion,
}: {
  company: CompanyProfile
  suggestion?: AutofillSuggestion
}) {
  const niche = suggestion?.niche
  const audience = [
    suggestion?.audienceCountry,
    ...(suggestion?.audienceAges ?? []),
  ].filter((item): item is string => Boolean(item))
  const networks = (suggestion?.targetNetworks ?? []).filter(isSocialNetwork).map((item) => SOCIAL_NETWORK_LABEL[item])
  const tiers = TIERS.filter((tier) => suggestion?.audienceTiers?.includes(tier.id)).map((tier) => tier.label)
  const tactics = (suggestion?.tactics ?? []).map((item) => tacticLabel(item)).filter(Boolean)
  const products = (suggestion?.productCategories?.length ? suggestion.productCategories : company.products).slice(0, 8)
  const creator = [
    suggestion?.creatorLocation,
    suggestion?.creatorLanguage,
    ...(suggestion?.targetNiches ?? []).slice(0, 3),
    ...tiers,
  ].filter((item): item is string => Boolean(item))
  const porteLabel = company.porte === "grande" ? "Marca grande" : company.porte === "media" ? "Marca média" : company.porte === "pequena" ? "Marca emergente" : null
  const modeloLabel =
    company.modeloNegocio === "ecommerce_d2c"
      ? "E-commerce próprio"
      : company.modeloNegocio === "app_saas"
        ? "App ou software"
        : company.modeloNegocio === "negocio_local"
          ? "Negócio local"
          : company.modeloNegocio === "servico_b2b"
            ? "Serviço B2B"
            : company.modeloNegocio === "marketplace"
              ? "Marketplace"
              : company.modeloNegocio === "institucional"
                ? "Marca institucional"
                : null
  const abrangenciaLabel =
    company.abrangencia === "local"
      ? "Atuação local"
      : company.abrangencia === "regional"
        ? "Atuação regional"
        : company.abrangencia === "nacional"
          ? "Cobertura nacional"
          : company.abrangencia === "global_br"
            ? "Global com operação no Brasil"
            : null
  const ticketLabel =
    company.ticketMedio === "alto" ? "Ticket alto" : company.ticketMedio === "medio" ? "Ticket médio" : company.ticketMedio === "baixo" ? "Ticket baixo" : null
  const dossier = [porteLabel, modeloLabel, abrangenciaLabel, ticketLabel].filter((item): item is string => Boolean(item))
  const strategyHint = company.recommendedStrategy ? strategyLabel(company.recommendedStrategy) : ""

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
      <div className="flex items-start gap-3 border-b border-zinc-200 px-4 py-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700">
          <AlignLeft className="size-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">{company.name}</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-700">{shortSummary(company.summary)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2">
        <Fact label="Dossiê" className="sm:col-span-2">
          {dossier.length ? <Chips items={dossier} /> : null}
        </Fact>
        <Fact label="Nicho">
          {niche ? <Chips items={[niche]} /> : null}
        </Fact>
        <Fact label="Orientação de estratégia">
          {strategyHint || tactics.length ? (
            <Chips items={[strategyHint ? `Sugestão: ${strategyHint}` : "", ...tactics].filter(Boolean)} />
          ) : null}
        </Fact>
        <Fact label="Público">
          {audience.length || suggestion?.audienceNotes ? (
            <div className="min-w-0 space-y-1.5">
              <Chips items={audience} />
              {suggestion?.audienceNotes ? <p className="text-sm break-words text-zinc-700">{suggestion.audienceNotes}</p> : null}
            </div>
          ) : null}
        </Fact>
        <Fact label="Creator ideal">
          {creator.length || networks.length ? (
            <div className="min-w-0 space-y-1.5">
              <Chips items={[...networks, ...creator]} />
              {suggestion?.minEngagement ? (
                <p className="text-xs text-zinc-500">Engajamento mínimo {String(suggestion.minEngagement).replace(".", ",")}%</p>
              ) : null}
            </div>
          ) : null}
        </Fact>
        <Fact label="Linhas de produto" className="sm:col-span-2">
          {products.length ? <Chips items={products} /> : null}
        </Fact>
        <Fact label="Fonte" className="sm:col-span-2">
          {company.source ? (
            <p className="truncate text-sm text-zinc-600">{company.source.replace(/^https?:\/\//, "")}</p>
          ) : null}
        </Fact>
      </div>
    </div>
  )
}
