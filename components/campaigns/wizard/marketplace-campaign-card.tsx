"use client"

import { useState } from "react"
import { BadgeCheck, Sparkles } from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { formatBannerOfferLabel, nicheLabel } from "@/lib/campaigns/shape"
import { isSocialNetwork, SOCIAL_NETWORK_LABEL, type SocialNetwork } from "@/lib/mock-data/campaigns"
import type { WizardDraft } from "@/lib/stores/campaigns"
import { cn } from "@/lib/utils"

const NETWORK_ICONS: Record<SocialNetwork, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
}

function offerBadgeLabel(draft: WizardDraft) {
  const terms = draft.commercialTerms ?? []
  if (terms.includes("permuta") && !terms.includes("fixo") && !terms.includes("comissao")) {
    return "Produto grátis"
  }
  const shown = formatBannerOfferLabel({
    bannerOffer: draft.bannerOffer,
    bannerShowItems: draft.bannerShowItems,
    perInfluencerFee: draft.perInfluencerFee,
    fixedFeePerPost: draft.fixedFeePerPost,
    commissionPercent: draft.commissionPercent,
    commissionFixed: draft.commissionFixed,
    commission: draft.commission,
    commissionModes: draft.commissionModes,
  })
  if (shown && shown !== "—") return shown
  if (terms.includes("permuta")) return "Permuta"
  if (terms.includes("fixo")) return "Fixo"
  if (terms.includes("comissao")) return "Comissão"
  return null
}

function nicheTags(draft: WizardDraft) {
  const fromIds = (draft.niches?.length ? draft.niches : draft.targetNiches ?? [])
    .map((id) => nicheLabel(id) || id)
    .filter(Boolean)
  if (fromIds.length) return fromIds.slice(0, 3)
  if (draft.niche?.trim()) {
    return draft.niche
      .split(/[·|,/]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3)
  }
  return []
}

function coverSlides(draft: WizardDraft) {
  const slides: { id: string; src: string; alt: string }[] = []
  if (draft.coverImage) {
    slides.push({ id: "cover", src: draft.coverImage, alt: "Banner da campanha" })
  }
  for (const product of draft.storeProducts ?? []) {
    if (!product.imageUrl) continue
    slides.push({
      id: `${product.connectionId}:${product.externalProductId}`,
      src: product.imageUrl,
      alt: product.name,
    })
  }
  return slides
}

export function MarketplaceCampaignCard({
  draft,
  organizationName,
  organizationPhoto,
}: {
  draft: WizardDraft
  organizationName: string
  organizationPhoto?: string
}) {
  const [slide, setSlide] = useState(0)
  const slides = coverSlides(draft)
  const active = slides[Math.min(slide, Math.max(slides.length - 1, 0))]
  const brand = organizationName.trim() || draft.research?.company?.name || "Sua marca"
  const initials = brand.slice(0, 2).toUpperCase()
  const offer = offerBadgeLabel(draft)
  const niches = nicheTags(draft)
  const networks = (draft.targetNetworks ?? []).filter(isSocialNetwork)
  const language = draft.creatorLanguage?.trim() || "—"
  const country = draft.creatorLocation?.trim() || draft.audienceCountry?.trim() || "—"
  const title = draft.name?.trim() || "Campanha sem nome"

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Prévia no marketplace</p>
        <p className="mt-0.5 text-sm text-zinc-600">Como o creator vê o card na vitrine.</p>
      </div>

      {/* Card de vitrine: banner panorâmico ~2.45:1 (como no exemplo) */}
      <article className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="relative">
          {/* 5:2 ≈ proporção do exemplo (~2.45:1); altura fixa evita distorcer em containers estreitos */}
          <div className="aspect-[5/2] w-full overflow-hidden bg-zinc-100">
            {active ? (
              <img src={active.src} alt={active.alt} className="size-full object-cover object-center" />
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300">
                <span className="text-2xl font-semibold tracking-tight text-zinc-500">{initials}</span>
              </div>
            )}
          </div>

          {offer ? (
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-1 text-[11px] font-medium text-sky-900 shadow-sm">
              <Sparkles className="size-3" />
              {offer}
            </span>
          ) : null}

          {slides.length > 1 ? (
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Slide ${index + 1}`}
                  className={cn(
                    "size-[6px] rounded-full transition-colors",
                    index === slide ? "bg-white" : "bg-white/55",
                  )}
                  onClick={() => setSlide(index)}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Avatar ~56px sobreposto ~50% na costura banner / conteúdo */}
        <div className="relative px-3.5 pt-0">
          <div className="flex items-end gap-2.5">
            <div className="-mt-7 flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border-[3px] border-white bg-white shadow-sm">
              {organizationPhoto ? (
                <img src={organizationPhoto} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-xs font-bold tracking-tight text-zinc-800">{initials}</span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 pb-0.5">
              <span className="truncate text-[13px] font-medium text-zinc-800">{brand}</span>
              {niches.length ? <span className="text-zinc-300" aria-hidden>|</span> : null}
              {niches.map((niche) => (
                <span
                  key={niche}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] leading-none text-zinc-600"
                >
                  {niche}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 px-3.5 pt-2.5 pb-3.5">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 text-[15px] leading-snug font-bold text-zinc-900">{title}</h3>
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
              <Sparkles className="size-2.5" />
              Nova
            </span>
          </div>

          <div className="border-t border-zinc-100 pt-3">
            <p className="mb-2.5 text-[13px] font-bold text-zinc-900">Requisitos do creator</p>

            <div className="space-y-2.5 text-[13px]">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-zinc-500">Idioma</span>
                <span className="font-medium text-zinc-900">{language}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-zinc-500">País</span>
                <span className="font-medium text-zinc-900">{country}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Redes</span>
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  {networks.length ? (
                    networks.map((network) => {
                      const Icon = NETWORK_ICONS[network]
                      return (
                        <span
                          key={network}
                          title={SOCIAL_NETWORK_LABEL[network]}
                          className="flex size-6 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700"
                        >
                          <Icon className="size-3" />
                        </span>
                      )
                    })
                  ) : (
                    <span className="font-medium text-zinc-400">—</span>
                  )}
                </div>
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white"
                  title="Marca verificada"
                >
                  <BadgeCheck className="size-3.5" />
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-3">
            <button
              type="button"
              disabled
              className="flex h-10 w-full items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white disabled:opacity-100"
            >
              Candidatar-se
            </button>
          </div>
        </div>
      </article>
    </div>
  )
}
