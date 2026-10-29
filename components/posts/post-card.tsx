"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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

function PostCover({ post }: { post: MonitorPost }) {
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
      <button className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-sm hover:bg-zinc-50">
        <ExternalLink size={12} className="text-zinc-500" />
      </button>
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

export function PostCard({ post }: { post: MonitorPost }) {
  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <PostCover post={post} />
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
