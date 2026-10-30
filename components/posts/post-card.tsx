"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDateBR } from "@/lib/dates"
import type { MonitorPost } from "@/lib/mock-data/metrics"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import {
  Heart, MessageCircle, Share2, Eye, ExternalLink, Play,
  Star, CheckCircle, AlertTriangle, XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

export const POST_TYPE_LABELS: Record<string, string> = {
  reels: "Reels",
  stories: "Stories",
  post_feed: "Post",
  tiktok: "TikTok",
  video_youtube: "YouTube",
}

export const AI_CONFIG = {
  aprovado: { label: "Aprovado", icon: CheckCircle, classes: "text-emerald-600 bg-emerald-50" },
  alerta: { label: "Alerta", icon: AlertTriangle, classes: "text-amber-600 bg-amber-50" },
  reprovado: { label: "Reprovado", icon: XCircle, classes: "text-red-600 bg-red-50" },
} as const

function NetworkIcon({ network, size = 13 }: { network: string; size?: number }) {
  if (network === "instagram") return <SiInstagram size={size} />
  if (network === "tiktok") return <SiTiktok size={size} />
  if (network === "youtube") return <SiYoutube size={size} />
  return null
}

export function AiBadge({ status, score }: { status: MonitorPost["aiStatus"]; score: number }) {
  const cfg = AI_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", cfg.classes)}>
      <Icon size={11} />
      {cfg.label} · {score}%
    </span>
  )
}

export function StarRating({ value }: { value?: number }) {
  if (!value) return <span className="text-xs text-zinc-300">—</span>
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
          className={i < value ? "fill-zinc-800 text-zinc-800" : "text-zinc-200"}
        />
      ))}
    </span>
  )
}

function PostCover({ post, showLink = true }: { post: MonitorPost; showLink?: boolean }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(post.image) && !failed
  const isVideo = post.type === "reels" || post.type === "tiktok" || post.type === "video_youtube"

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
      {showImage ? (
        <img
          src={post.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-zinc-300">
          {post.avatar}
        </div>
      )}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-700 shadow-sm">
        <NetworkIcon network={post.network} />
        {POST_TYPE_LABELS[post.type] ?? post.type}
      </div>
      {showLink ? (
        <span className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-sm">
          <ExternalLink size={12} className="text-zinc-500" />
        </span>
      ) : null}
      {isVideo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white shadow-sm">
            <Play size={18} className="ml-0.5 fill-white" />
          </span>
        </div>
      )}
      <div className="absolute inset-x-2 bottom-2 rounded-lg bg-card/90 px-2 py-1.5 shadow-sm backdrop-blur-sm">
        <p className="truncate text-xs font-medium text-card-foreground">{post.creatorName}</p>
        <p className="truncate text-xs text-muted-foreground">{post.creatorHandle}</p>
      </div>
    </div>
  )
}

export function PostCard({ post, onSelect }: { post: MonitorPost; onSelect?: () => void }) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-sm",
        onSelect && "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onSelect()
              }
            }
          : undefined
      }
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `Abrir conteúdo de ${post.creatorName}` : undefined}
    >
      <PostCover post={post} showLink={!onSelect} />
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <AiBadge status={post.aiStatus} score={post.aiScore} />
          <StarRating value={post.humanRating} />
        </div>
        <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{post.caption}</p>
        {post.aiIssues && post.aiIssues.length > 0 && (
          <div className="mb-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
            {post.aiIssues[0]}{post.aiIssues.length > 1 ? ` +${post.aiIssues.length - 1}` : ""}
          </div>
        )}
        <div className="grid grid-cols-4 gap-1 text-center">
          {[
            { icon: Eye, val: fmt(post.reach), label: "alcance" },
            { icon: Heart, val: fmt(post.likes), label: "curtidas" },
            { icon: MessageCircle, val: fmt(post.comments), label: "coment." },
            { icon: Share2, val: fmt(post.shares), label: "shares" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label}>
              <div className="flex justify-center text-zinc-300 mb-0.5"><Icon size={10} /></div>
              <p className="text-xs font-semibold text-zinc-800">{val}</p>
              <p className="text-[10px] text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-xs text-zinc-400">{formatDateBR(post.publishedAt)}</span>
          <Badge variant="outline" className="text-xs">{post.engagement.toFixed(1)}% eng.</Badge>
        </div>
      </div>
    </Card>
  )
}

export function PostDetailSheet({
  post,
  onOpenChange,
}: {
  post: MonitorPost | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={post !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
        {post ? <PostDetail post={post} /> : null}
      </SheetContent>
    </Sheet>
  )
}

function PostDetail({ post }: { post: MonitorPost }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(post.image) && !failed
  const hasLink = post.url.startsWith("http")

  return (
    <>
      <div className="relative h-44 overflow-hidden bg-zinc-100">
        {showImage ? (
          <img
            src={post.image}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-bold text-zinc-300">
            {post.avatar}
          </div>
        )}
      </div>
      <SheetHeader className="border-b px-5 py-5 pr-14">
        <SheetTitle>{post.creatorName}</SheetTitle>
        <SheetDescription className="flex flex-wrap items-center gap-1.5">
          <NetworkIcon network={post.network} />
          <span>{post.creatorHandle}</span>
          <span>·</span>
          <span>{POST_TYPE_LABELS[post.type] ?? post.type}</span>
          <span>·</span>
          <span>{formatDateBR(post.publishedAt)}</span>
        </SheetDescription>
      </SheetHeader>
      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <AiBadge status={post.aiStatus} score={post.aiScore} />
          <StarRating value={post.humanRating} />
        </div>
        <p className="text-sm leading-relaxed text-zinc-700">{post.aiVerdict}</p>
        {post.aiIssues && post.aiIssues.length > 0 ? (
          <ul className="space-y-1.5">
            {post.aiIssues.map((issue) => (
              <li key={issue} className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
                {issue}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="text-sm leading-relaxed text-zinc-600">{post.caption}</p>
        <div className="grid grid-cols-4 gap-2 rounded-xl border border-zinc-200 p-3 text-center">
          {[
            { icon: Eye, val: fmt(post.reach), label: "Alcance" },
            { icon: Heart, val: fmt(post.likes), label: "Curtidas" },
            { icon: MessageCircle, val: fmt(post.comments), label: "Coment." },
            { icon: Share2, val: fmt(post.shares), label: "Shares" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label}>
              <div className="mb-1 flex justify-center text-zinc-400"><Icon size={14} /></div>
              <p className="text-sm font-semibold text-zinc-900">{val}</p>
              <p className="text-[10px] text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
        {hasLink ? (
          <Button
            variant="outline"
            className="w-full"
            render={<a href={post.url} target="_blank" rel="noreferrer" />}
          >
            Abrir publicação
            <ExternalLink />
          </Button>
        ) : null}
      </div>
    </>
  )
}
