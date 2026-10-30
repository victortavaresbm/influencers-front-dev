"use client"

import { useMemo, useState } from "react"
import { Bookmark, ChevronLeft, ChevronRight, Heart, MessageCircle, Play, Send } from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import {
  SOCIAL_NETWORK_LABEL,
  type CampaignMention,
  type ContentFormat,
  type SocialNetwork,
} from "@/lib/mock-data/campaigns"
import { cn } from "@/lib/utils"

type SlideKind = "reels" | "story" | "post" | "video" | "shorts" | "live"

interface Slide {
  id: string
  format: ContentFormat
  network: SocialNetwork
  kind: SlideKind
  label: string
  light: boolean
}

const SLIDES: Slide[] = [
  { id: "instagram-reels", format: "reels", network: "instagram", kind: "reels", label: "Reels", light: false },
  { id: "instagram-story", format: "stories", network: "instagram", kind: "story", label: "Stories", light: false },
  { id: "instagram-post", format: "feed", network: "instagram", kind: "post", label: "Feed", light: true },
  { id: "tiktok-post", format: "tiktok", network: "tiktok", kind: "video", label: "TikTok", light: false },
  { id: "youtube-video", format: "youtube", network: "youtube", kind: "video", label: "Vídeo", light: false },
  { id: "youtube-shorts", format: "shorts", network: "youtube", kind: "shorts", label: "Shorts", light: false },
  { id: "live", format: "live", network: "instagram", kind: "live", label: "Live", light: false },
]

function NetworkGlyph({ network, size = 12, className }: { network: SocialNetwork; size?: number; className?: string }) {
  if (network === "instagram") return <SiInstagram size={size} className={className} />
  if (network === "tiktok") return <SiTiktok size={size} className={className} />
  return <SiYoutube size={size} className={className} />
}

function handlesOf(mentions: CampaignMention[], network: SocialNetwork) {
  return mentions.filter((item) => item.network === network).map((item) => item.handle)
}

export function SocialPreviewCarousel({
  campaignName,
  hashtags,
  mentions,
  formats,
}: {
  campaignName?: string
  hashtags: string[]
  mentions: CampaignMention[]
  formats: ContentFormat[]
}) {
  const slides = useMemo(() => {
    const selected = new Set(formats)
    return SLIDES.filter((slide) => selected.has(slide.format))
  }, [formats])

  const [slideId, setSlideId] = useState(slides[0]?.id ?? SLIDES[0].id)
  const found = slides.findIndex((slide) => slide.id === slideId)
  const index = found === -1 ? 0 : found
  const slide = slides[index] ?? slides[0]

  if (!slide) {
    return (
      <section className="rounded-2xl bg-zinc-50 px-3 py-4" aria-label="Pré-visualização de stories e posts">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Pré-visualização</p>
        <div className="mt-3">
          <Phone light>
            <div className="flex h-full items-center justify-center px-5 text-center text-[11px] leading-relaxed text-zinc-500">
              Marque um formato para pré-visualizar só esse modelo.
            </div>
          </Phone>
        </div>
      </section>
    )
  }

  const here = handlesOf(mentions, slide.network)
  const elsewhere = mentions.find((item) => item.network !== slide.network)
  const title = campaignName?.trim() || "Sua campanha"

  const go = (delta: number) => {
    if (slides.length < 2) return
    const next = (index + delta + slides.length) % slides.length
    setSlideId(slides[next].id)
  }

  return (
    <section
      className="rounded-2xl bg-zinc-50 px-3 py-4"
      aria-roledescription="carrossel"
      aria-label="Pré-visualização de stories e posts"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault()
          go(1)
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          go(-1)
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Pré-visualização</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-zinc-900" aria-live="polite">
            <NetworkGlyph network={slide.network} size={13} />
            {SOCIAL_NETWORK_LABEL[slide.network]} · {slide.label}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label="Formato anterior"
            disabled={slides.length < 2}
            onClick={() => go(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Próximo formato"
            disabled={slides.length < 2}
            onClick={() => go(1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <Phone light={slide.light}>
          <Screen
            slide={slide}
            title={title}
            hashtags={hashtags}
            mentions={here}
          />
        </Phone>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {slides.map((item, dot) => (
          <button
            key={item.id}
            type="button"
            aria-label={`${SOCIAL_NETWORK_LABEL[item.network]} ${item.label}`}
            aria-current={item.id === slide.id}
            onClick={() => setSlideId(item.id)}
            className={cn("h-1.5 rounded-full transition-all", item.id === slide.id ? "w-4 bg-zinc-900" : "w-1.5 bg-zinc-300")}
          >
            <span className="sr-only">{dot + 1}</span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500">
        {here.length > 0
          ? `Nesta rede: ${here.join(" ")}`
          : elsewhere
            ? `Sem menção de ${SOCIAL_NETWORK_LABEL[slide.network]}. ${elsewhere.handle} fica só no ${SOCIAL_NETWORK_LABEL[elsewhere.network]}.`
            : "A menção aparece só na rede em que foi cadastrada."}
      </p>
    </section>
  )
}

function Phone({ light, children }: { light: boolean; children: React.ReactNode }) {
  return (
    <div
      data-keep-theme
      className={cn(
        "relative mx-auto h-[468px] w-[228px] overflow-hidden rounded-[1.75rem] border-[6px] border-zinc-900 shadow-[0_18px_36px_-20px_rgba(0,0,0,0.55)]",
        light ? "bg-white" : "bg-zinc-950"
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-8 items-center justify-center">
        <div className="h-[18px] w-[72px] rounded-full bg-black" />
      </div>
      <div
        className={cn(
          "pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-1 w-16 -translate-x-1/2 rounded-full",
          light ? "bg-zinc-900/70" : "bg-white/80"
        )}
      />
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}

function Screen({
  slide,
  title,
  hashtags,
  mentions,
}: {
  slide: Slide
  title: string
  hashtags: string[]
  mentions: string[]
}) {
  if (slide.kind === "story") {
    return (
      <StoryScreen
        network={slide.network}
        title={title}
        hashtags={hashtags}
        mentions={mentions}
      />
    )
  }
  if (slide.kind === "reels") {
    return <ReelsScreen title={title} hashtags={hashtags} mentions={mentions} />
  }
  if (slide.kind === "live") {
    return <LiveScreen title={title} hashtags={hashtags} mentions={mentions} />
  }
  if (slide.network === "instagram") {
    return <InstagramPost title={title} hashtags={hashtags} mentions={mentions} />
  }
  if (slide.network === "tiktok") {
    return <TikTokPost title={title} hashtags={hashtags} mentions={mentions} />
  }
  if (slide.kind === "shorts") {
    return <YouTubeShorts title={title} hashtags={hashtags} mentions={mentions} />
  }
  return <YouTubeVideo title={title} hashtags={hashtags} mentions={mentions} />
}

function StoryScreen({
  network,
  title,
  hashtags,
  mentions,
}: {
  network: SocialNetwork
  title: string
  hashtags: string[]
  mentions: string[]
}) {
  const label = SOCIAL_NETWORK_LABEL[network]
  return (
    <div
      className={cn(
        "relative h-full",
        network === "instagram"
          ? "bg-gradient-to-b from-orange-200 via-rose-500 to-zinc-950"
          : "bg-gradient-to-b from-cyan-900 via-zinc-900 to-black"
      )}
    >
      <div className="absolute -top-6 -right-8 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute top-[30%] right-6 left-6 overflow-hidden rounded-2xl bg-white/15 p-2.5">
        <div className="h-24 rounded-xl bg-gradient-to-br from-white/70 to-white/10" />
        <p className="mt-2 truncate text-[11px] font-semibold text-white">{title}</p>
      </div>
      <StoryChrome />
      <div className="absolute inset-x-3 bottom-14 z-20 flex max-h-[42%] flex-col items-center justify-end gap-1.5 overflow-hidden">
        <RequirementStickers networkLabel={label} hashtags={hashtags} mentions={mentions} />
      </div>
      <div className="absolute inset-x-2.5 bottom-5 z-20 flex items-center gap-1.5">
        <div className="h-7 flex-1 rounded-full border border-white/80 px-2.5 text-[10px] leading-7 text-white/90">
          {network === "instagram" ? "Enviar mensagem" : "Responder"}
        </div>
        <Heart size={14} className="text-white" />
        <Send size={14} className="text-white" />
      </div>
    </div>
  )
}

function StoryChrome() {
  return (
    <>
      <div className="absolute inset-x-2 top-9 z-20 flex gap-1">
        <span className="h-0.5 flex-1 rounded-full bg-white" />
        <span className="h-0.5 flex-1 rounded-full bg-white/35" />
        <span className="h-0.5 flex-1 rounded-full bg-white/35" />
      </div>
      <div className="absolute inset-x-2.5 top-12 z-20 flex items-center gap-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[9px] font-bold text-zinc-800">C</span>
        <span className="text-[11px] font-semibold text-white">seu.creator</span>
        <span className="text-[10px] text-white/70">2h</span>
      </div>
    </>
  )
}

function RequirementStickers({
  networkLabel,
  hashtags,
  mentions,
}: {
  networkLabel: string
  hashtags: string[]
  mentions: string[]
}) {
  const shownMentions = mentions.slice(0, 2)
  const shownTags = hashtags.slice(0, 3)
  const extra = mentions.length - shownMentions.length + Math.max(0, hashtags.length - shownTags.length)
  return (
    <>
      {shownMentions.length === 0 ? (
        <span className="rounded-lg border border-dashed border-white/70 bg-black/20 px-2 py-1 text-[11px] text-white/90">
          Menção do {networkLabel}
        </span>
      ) : (
        shownMentions.map((handle, index) => (
          <span
            key={handle}
            className="rounded-lg bg-white px-2.5 py-1 text-[12px] font-semibold text-zinc-900 shadow-md"
            style={{ transform: `rotate(${index % 2 === 0 ? -3 : 2}deg)` }}
          >
            {handle}
          </span>
        ))
      )}
      {shownTags.length === 0 ? (
        <span className="rounded-full border border-dashed border-white/70 bg-black/20 px-2 py-0.5 text-[11px] text-white/90">
          Hashtags da campanha
        </span>
      ) : (
        shownTags.map((tag) => (
          <span key={tag} className="max-w-full truncate rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-zinc-900 shadow">
            {tag}
          </span>
        ))
      )}
      {extra > 0 && <span className="text-[10px] font-medium text-white/80">+{extra}</span>}
    </>
  )
}

function ReelsScreen({ title, hashtags, mentions }: { title: string; hashtags: string[]; mentions: string[] }) {
  const tags = hashtags.slice(0, 3)
  return (
    <div className="relative h-full bg-gradient-to-b from-fuchsia-700 via-rose-600 to-orange-500">
      <div className="absolute top-10 right-3 left-3 h-28 rounded-2xl bg-white/20" />
      <Play size={28} className="absolute top-[42%] left-1/2 -translate-x-1/2 text-white/90" />
      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-3 text-white">
        <Heart size={16} />
        <MessageCircle size={16} />
        <Send size={16} />
      </div>
      <div className="absolute inset-x-2.5 bottom-6 pr-8 text-white">
        <p className="text-[11px] font-semibold">seu.creator</p>
        <p className="mt-1 text-[11px] leading-snug">
          {title}{" "}
          {mentions.map((handle) => (
            <span key={handle} className="font-semibold">
              {handle}{" "}
            </span>
          ))}
          {tags.map((tag) => (
            <span key={tag} className="font-semibold">
              {tag}{" "}
            </span>
          ))}
          {mentions.length === 0 && <span className="text-white/70">Menção do Instagram na legenda.</span>}
        </p>
      </div>
    </div>
  )
}

function LiveScreen({ title, hashtags, mentions }: { title: string; hashtags: string[]; mentions: string[] }) {
  const tags = hashtags.slice(0, 2)
  return (
    <div className="relative h-full bg-gradient-to-b from-zinc-700 via-zinc-900 to-black text-white">
      <div className="absolute inset-x-2.5 top-10 z-20 flex items-center gap-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[9px] font-bold text-zinc-800">C</span>
        <span className="min-w-0 truncate text-[11px] font-semibold">seu.creator</span>
        <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wide">AO VIVO</span>
      </div>
      <div className="absolute top-[22%] right-6 left-6 overflow-hidden rounded-2xl bg-white/10 p-2.5">
        <div className="h-24 rounded-xl bg-gradient-to-br from-white/50 to-white/10" />
        <p className="mt-2 truncate text-[11px] font-semibold">{title}</p>
      </div>
      <div className="absolute inset-x-2.5 bottom-6">
        <p className="text-[11px] leading-snug">
          {mentions.map((handle) => (
            <span key={handle} className="font-semibold">
              {handle}{" "}
            </span>
          ))}
          {tags.map((tag) => (
            <span key={tag} className="font-semibold">
              {tag}{" "}
            </span>
          ))}
          {mentions.length === 0 && <span className="text-white/70">Menção da live na oferta.</span>}
        </p>
        <div className="mt-2 h-7 rounded-full border border-white/70 px-2.5 text-[10px] leading-7 text-white/90">
          Comentar
        </div>
      </div>
    </div>
  )
}

function InstagramPost({ title, hashtags, mentions }: { title: string; hashtags: string[]; mentions: string[] }) {
  const tags = hashtags.slice(0, 6)
  return (
    <div className="flex h-full flex-col bg-white pt-8 text-zinc-900">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-300 to-rose-500" />
        <span className="min-w-0">
          <span className="block text-[11px] leading-none font-semibold">seu.creator</span>
          <span className="mt-0.5 block text-[9px] text-zinc-400">Parceria paga</span>
        </span>
      </div>
      <div className="relative h-[168px] bg-gradient-to-br from-amber-100 via-rose-200 to-orange-300">
        <span className="absolute bottom-2 left-2 max-w-[80%] truncate rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-zinc-800">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2.5 px-2.5 py-2 text-zinc-800">
        <Heart size={15} />
        <MessageCircle size={15} />
        <Send size={15} />
        <Bookmark size={15} className="ml-auto" />
      </div>
      <p className="px-2.5 text-[11px] font-semibold">1.284 curtidas</p>
      <p className="mt-1 px-2.5 text-[11px] leading-snug">
        <span className="font-semibold">seu.creator </span>
        {title}{" "}
        {mentions.map((handle) => (
          <span key={handle} className="font-medium text-[#00376b]">
            {handle}{" "}
          </span>
        ))}
        {tags.map((tag) => (
          <span key={tag} className="text-[#00376b]">
            {tag}{" "}
          </span>
        ))}
        {mentions.length === 0 && (
          <span className="text-zinc-400">Adicione a menção do Instagram para ela entrar na legenda.</span>
        )}
      </p>
    </div>
  )
}

function TikTokPost({ title, hashtags, mentions }: { title: string; hashtags: string[]; mentions: string[] }) {
  const tags = hashtags.slice(0, 4)
  return (
    <div className="relative h-full bg-gradient-to-b from-zinc-700 via-zinc-900 to-black">
      <div className="absolute top-16 -left-6 h-28 w-28 rounded-full bg-fuchsia-500/30 blur-2xl" />
      <div className="absolute top-28 right-8 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
      <Play size={28} className="absolute top-[38%] left-1/2 -translate-x-1/2 text-white/80" />
      <div className="absolute right-2 bottom-24 flex flex-col items-center gap-3 text-white">
        <span className="h-7 w-7 rounded-full border border-white bg-zinc-800" />
        <Heart size={16} />
        <MessageCircle size={16} />
        <Send size={16} />
      </div>
      <div className="absolute inset-x-2.5 bottom-8 z-10 pr-8 text-white">
        <p className="text-[11px] font-semibold">@seu.creator</p>
        <p className="mt-1 text-[11px] leading-snug">
          {title}{" "}
          {mentions.map((handle) => (
            <span key={handle} className="font-semibold">
              {handle}{" "}
            </span>
          ))}
          {tags.map((tag) => (
            <span key={tag} className="font-semibold">
              {tag}{" "}
            </span>
          ))}
          {mentions.length === 0 && <span className="text-white/60">Menção do TikTok na legenda.</span>}
        </p>
        <p className="mt-1 text-[10px] text-white/70">♪ som original</p>
      </div>
    </div>
  )
}

function YouTubeShorts({ title, hashtags, mentions }: { title: string; hashtags: string[]; mentions: string[] }) {
  const tags = hashtags.slice(0, 3)
  return (
    <div className="relative h-full bg-zinc-950">
      <div className="absolute top-16 right-3 left-3 h-40 rounded-xl bg-gradient-to-br from-red-900/80 via-zinc-800 to-zinc-900" />
      <p className="absolute top-10 left-3 z-20 text-[10px] font-bold tracking-wide text-white">Shorts</p>
      <div className="absolute right-2 bottom-28 flex flex-col items-center gap-3 text-white">
        <Heart size={16} />
        <MessageCircle size={16} />
        <Send size={16} />
      </div>
      <div className="absolute inset-x-2.5 bottom-8 pr-8 text-white">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="h-5 w-5 shrink-0 rounded-full bg-red-600" />
          <span className="min-w-0 truncate text-[11px] font-semibold">@seu.creator</span>
        </div>
        <p className="text-[11px] leading-snug">
          {title}{" "}
          {mentions.map((handle) => (
            <span key={handle} className="font-semibold">
              {handle}{" "}
            </span>
          ))}
          {tags.map((tag) => (
            <span key={tag} className="font-semibold">
              {tag}{" "}
            </span>
          ))}
          {mentions.length === 0 && <span className="text-white/60">Menção do YouTube aqui.</span>}
        </p>
      </div>
    </div>
  )
}

function YouTubeVideo({ title, hashtags, mentions }: { title: string; hashtags: string[]; mentions: string[] }) {
  const tags = hashtags.slice(0, 5)
  return (
    <div className="flex h-full flex-col bg-white pt-8 text-zinc-900">
      <div className="relative h-[128px] bg-gradient-to-br from-red-800 via-zinc-700 to-zinc-900">
        <span className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white">
          <Play size={14} className="ml-0.5" />
        </span>
      </div>
      <div className="px-2.5 py-2">
        <p className="line-clamp-2 text-[12px] leading-snug font-semibold">{title}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-6 w-6 rounded-full bg-red-600" />
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-medium">seu.creator</span>
            <span className="block text-[9px] text-zinc-400">12 mil inscritos</span>
          </span>
        </div>
        <div className="mt-2 rounded-lg bg-zinc-100 px-2 py-1.5 text-[11px] leading-snug text-zinc-700">
          {mentions.map((handle) => (
            <span key={handle} className="font-medium text-[#065fd4]">
              {handle}{" "}
            </span>
          ))}
          {tags.map((tag) => (
            <span key={tag} className="text-[#065fd4]">
              {tag}{" "}
            </span>
          ))}
          {mentions.length === 0 && hashtags.length === 0 && (
            <span className="text-zinc-400">A descrição leva a menção do YouTube e as hashtags.</span>
          )}
          {mentions.length === 0 && hashtags.length > 0 && (
            <span className="text-zinc-400">Sem menção do YouTube nesta descrição.</span>
          )}
        </div>
      </div>
    </div>
  )
}
