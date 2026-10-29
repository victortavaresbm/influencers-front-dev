"use client"

import { useMemo, useState } from "react"
import { Heart, MessageCircle, Play, Share2 } from "lucide-react"
import { BrandMark } from "@/components/tracking/brand-mark"
import { formatCount, formatMoney } from "@/components/tracking/format"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateBR } from "@/lib/dates"
import type { PostFormat, Signal, TrackedBrand, TrackedPost } from "@/lib/mock-data/tracking"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"

const FORMAT_LABEL: Record<PostFormat, string> = {
  reels: "Reels",
  post_feed: "Post",
  tiktok: "TikTok",
  video_youtube: "YouTube",
}

const SIGNAL_LABEL: Record<Signal, string> = {
  mention: "Menção",
  hashtag: "Hashtag",
  keyword: "Palavra-chave",
  sponsored: "Patrocinado",
  official: "Conta oficial",
}

function NetworkIcon({ network }: { network: TrackedPost["network"] }) {
  if (network === "instagram") return <SiInstagram className="size-3" />
  if (network === "tiktok") return <SiTiktok className="size-3" />
  return <SiYoutube className="size-3" />
}

function PostCover({ post }: { post: TrackedPost }) {
  const [failed, setFailed] = useState(false)
  const video = post.format !== "post_feed"

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
      {!failed ? (
        // Capa remota, com iniciais se o arquivo não carregar.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-zinc-300">
          {post.creatorName.slice(0, 2)}
        </div>
      )}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-700 shadow-sm">
        <NetworkIcon network={post.network} />
        {FORMAT_LABEL[post.format]}
      </div>
      <div className="absolute top-2 right-2 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-zinc-900 shadow-sm">
        {formatMoney(post.emv)}
      </div>
      {video ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-black/55 text-white shadow-sm">
            <Play className="ml-0.5 size-4 fill-white" />
          </span>
        </div>
      ) : null}
      <div className="absolute inset-x-2 bottom-2 rounded-lg bg-card/90 px-2 py-1.5 shadow-sm backdrop-blur-sm">
        <p className="truncate text-xs font-medium text-card-foreground">{post.creatorName}</p>
        <p className="truncate text-xs text-muted-foreground">{post.creatorHandle}</p>
      </div>
    </div>
  )
}

function TrackingPostCard({ post, brand }: { post: TrackedPost; brand?: TrackedBrand }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-sm">
      <PostCover post={post} />
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          {brand ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <BrandMark brand={brand} className="size-5 text-[8px]" />
              <span className="truncate text-xs font-medium text-zinc-800">{brand.name}</span>
            </span>
          ) : (
            <span />
          )}
          <Badge variant="outline">{SIGNAL_LABEL[post.signal]}</Badge>
        </div>
        <p className="line-clamp-2 text-xs text-zinc-500">{post.caption}</p>
        <div className="grid grid-cols-3 gap-1 text-center">
          {[
            { icon: Heart, value: formatCount(post.likes), label: "curtidas" },
            { icon: MessageCircle, value: formatCount(post.comments), label: "coment." },
            { icon: Share2, value: formatCount(post.shares), label: "shares" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <div className="mb-0.5 flex justify-center text-zinc-300">
                <Icon className="size-3" />
              </div>
              <p className="text-xs font-semibold text-zinc-800">{value}</p>
              <p className="text-[10px] text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
          <span className="text-xs text-zinc-400">{formatDateBR(post.publishedAt)}</span>
          <span className="text-xs text-zinc-500">{formatCount(post.reach)} alcance</span>
        </div>
      </div>
    </Card>
  )
}

export function PostsGrid({
  posts,
  brands,
  title = "Publicações rastreadas",
  description = "Pré-visualização do que os sinais capturaram neste recorte.",
  heading = true,
}: {
  posts: TrackedPost[]
  brands: TrackedBrand[]
  title?: string
  description?: string
  heading?: boolean
}) {
  const [order, setOrder] = useState("emv")
  const byId = useMemo(() => new Map(brands.map((brand) => [brand.id, brand])), [brands])
  const ordered = useMemo(() => {
    const next = [...posts]
    if (order === "recent") next.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    else next.sort((a, b) => b.emv - a.emv)
    return next
  }, [order, posts])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        {heading ? (
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">{description}</p>
        )}
        <Select value={order} onValueChange={(value) => setOrder(value || "emv")}>
          <SelectTrigger size="sm" className="w-40" aria-label="Ordenar publicações">
            <SelectValue>
              {(value) => (value === "recent" ? "Mais recentes" : "Maior EMV")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="emv">Maior EMV</SelectItem>
            <SelectItem value="recent">Mais recentes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {ordered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-12 text-center text-sm text-zinc-500">
          Nenhuma publicação combina com as marcas, redes, período e sinais atuais.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ordered.map((post) => (
            <TrackingPostCard key={post.id} post={post} brand={byId.get(post.brandId)} />
          ))}
        </div>
      )}
    </div>
  )
}
