"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AtSign,
  BarChart3,
  Calendar,
  Globe,
  Heart,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  Paperclip,
  Pin,
  Play,
  Smile,
  Type,
  Video,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  COMMUNITY_CATEGORIES,
  visibleCampaignChannels,
  type CommunityAuthor,
  type CommunityMedia,
  type CommunityPost,
} from "@/lib/mock-data/community"
import { CreditCost } from "@/components/credits/credit-cost"
import { PUSH_CREDIT_COST } from "@/lib/credits"
import { useAuthStore } from "@/lib/stores/auth"
import { organizationBalance, useCreditsStore } from "@/lib/stores/credits"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { usePartnerCommunity } from "@/lib/stores/partner-community"
import { useCommunityStore } from "@/lib/stores/community"
import { toast } from "@/components/ui/toast"
import { BrandSide } from "@/components/creator/brand-side"
import { useBrandSearch } from "@/components/creator/brand-shell"
import { useI18n } from "@/lib/i18n"
import type { Locale } from "@/lib/stores/preferences"
import { cn } from "@/lib/utils"

function timeAgo(iso: string, locale: Locale) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(1, Math.round(diff / 60000))
  const format = new Intl.RelativeTimeFormat(locale === "en" ? "en" : locale === "es" ? "es" : "pt-BR", { numeric: "auto" })
  if (minutes < 60) return format.format(-minutes, "minute")
  const hours = Math.round(minutes / 60)
  if (hours < 24) return format.format(-hours, "hour")
  return format.format(-Math.round(hours / 24), "day")
}

function PostMedia({ media, embed = false }: { media: CommunityMedia; embed?: boolean }) {
  const [playing, setPlaying] = useState(embed && media.type === "youtube")

  if (media.type === "youtube" && playing) {
    return (
      <div className="aspect-video overflow-hidden rounded-lg bg-muted" onClick={(event) => event.stopPropagation()}>
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}?autoplay=1`}
          title={media.alt}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (media.type === "youtube") {
    return (
      <button
        type="button"
        className="relative block aspect-video w-full overflow-hidden rounded-lg bg-muted"
        aria-label={media.alt}
        onClick={(event) => {
          event.stopPropagation()
          setPlaying(true)
        }}
      >
        <img
          src={`https://i.ytimg.com/vi/${media.youtubeId}/hqdefault.jpg`}
          alt=""
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-black/70 text-white">
            <Play className="ml-0.5 size-4 fill-current" />
          </span>
        </span>
      </button>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-muted" onClick={(event) => event.stopPropagation()}>
      {media.type === "gif" && (
        <Badge variant="secondary" className="absolute top-2 left-2">GIF</Badge>
      )}
      <img
        src={media.url}
        alt={media.alt}
        className={cn("max-h-80 w-full", media.type === "gif" ? "object-contain" : "object-cover")}
      />
    </div>
  )
}

function Person({ person, size = "default" }: { person: CommunityAuthor; size?: "sm" | "default" | "lg" }) {
  return (
    <Avatar size={size}>
      {person.photo && <AvatarImage src={person.photo} alt="" />}
      <AvatarFallback>{person.avatar}</AvatarFallback>
    </Avatar>
  )
}

export function CommunityFeed({ canModerate }: { canModerate: boolean }) {
  const { t, locale } = useI18n()
  const user = useAuthStore((state) => state.user)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const { selectedId: partnerId, selected } = usePartnerCommunity()
  const posts = useCommunityStore((state) => state.posts)
  const comments = useCommunityStore((state) => state.comments)
  const createPost = useCommunityStore((state) => state.createPost)
  const togglePostLike = useCommunityStore((state) => state.togglePostLike)
  const togglePin = useCommunityStore((state) => state.togglePin)
  const addComment = useCommunityStore((state) => state.addComment)
  const toggleCommentLike = useCommunityStore((state) => state.toggleCommentLike)

  const brandQuery = useBrandSearch().trim().toLowerCase()
  const [channelId, setChannelId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [openPostId, setOpenPostId] = useState<string | null>(null)

  const channels = useMemo(() => {
    const visible = visibleCampaignChannels(campaigns, user)
    if (canModerate || !partnerId) return visible
    return visible.filter((campaign) => campaign.organizationId === partnerId)
  }, [campaigns, user, canModerate, partnerId])
  const channel = channels.find((item) => item.id === channelId) ?? null

  useEffect(() => {
    if (channelId && !channels.some((item) => item.id === channelId)) setChannelId(null)
  }, [channelId, channels])

  const me: CommunityAuthor = {
    id: user?.id ?? "guest",
    name: user?.name ?? "Você",
    avatar: user?.avatar ?? "??",
    photo: user?.photo,
    handle: user?.role === "brand" ? (user.organizationName ?? "") : (user?.email ?? ""),
  }

  const scopedPosts = useMemo(() => {
    const allowed = new Set(channels.map((item) => item.id))
    return posts.filter((post) => {
      if (!post.campaignId) return channelId === null
      return post.campaignId === channelId && allowed.has(post.campaignId)
    })
  }, [posts, channelId, channels])

  const visible = useMemo(() => {
    const filtered = categoryId ? scopedPosts.filter((post) => post.categoryId === categoryId) : scopedPosts
    const searched = brandQuery
      ? filtered.filter((post) => `${post.title} ${post.body} ${post.author.name}`.toLowerCase().includes(brandQuery))
      : filtered
    return [...searched].sort(
      (a, b) => Number(b.isPinned) - Number(a.isPinned) || +new Date(b.createdAt) - +new Date(a.createdAt)
    )
  }, [scopedPosts, categoryId, brandQuery])

  const openPost = posts.find((post) => post.id === openPostId) ?? null

  return (
    <>
      <div className="grid w-full items-start gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="flex-row items-center gap-3 px-(--card-spacing)">
            <Person person={me} />
            <Button
              variant="outline"
              className="h-9 flex-1 justify-start px-3 font-normal text-muted-foreground"
              onClick={() => setComposing(true)}
            >
              {t("community.write")}
            </Button>
          </Card>

          <div className="flex flex-col gap-2">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
              <Button
                size="sm"
                variant={channelId === null ? "secondary" : "outline"}
                aria-pressed={channelId === null}
                className="shrink-0"
                onClick={() => setChannelId(null)}
              >
                <Globe className="size-3 stroke-[1.5] text-muted-foreground" />
                {t("community.general")}
              </Button>
              {channels.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={channelId === item.id ? "secondary" : "outline"}
                  aria-pressed={channelId === item.id}
                  aria-label={`${item.name}. ${t("community.private")}`}
                  className="max-w-56 shrink-0"
                  onClick={() => setChannelId(item.id)}
                >
                  <Lock className="size-3 stroke-[1.5] text-muted-foreground" />
                  <span className="truncate">{item.name}</span>
                </Button>
              ))}
            </div>
            {channel && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3 stroke-[1.5]" />
                {t("community.privateHelp")}
              </p>
            )}
          </div>

          <div className="flex flex-nowrap gap-2 overflow-x-auto">
            <Button
              size="sm"
              variant={categoryId === null ? "secondary" : "outline"}
              aria-pressed={categoryId === null}
              className="shrink-0"
              onClick={() => setCategoryId(null)}
            >
              {t("community.all")}
            </Button>
            {COMMUNITY_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                size="sm"
                variant={categoryId === category.id ? "secondary" : "outline"}
                aria-pressed={categoryId === category.id}
                className="shrink-0"
                onClick={() => setCategoryId(category.id)}
              >
                <span aria-hidden>{category.emoji}</span>
                {category.name}
              </Button>
            ))}
          </div>

          {visible.length === 0 ? (
            <Card className="items-center px-(--card-spacing) py-12 text-center">
              <MessageCircle className="text-muted-foreground" />
              <p className="font-medium text-foreground">{t("community.emptyTitle")}</p>
              <p className="text-sm text-muted-foreground">{channel ? t("community.emptyChannel") : t("community.emptyBody")}</p>
            </Card>
          ) : (
            visible.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                commentCount={comments.filter((comment) => comment.postId === post.id).length}
                locale={locale}
                canModerate={canModerate}
                locked={Boolean(post.campaignId)}
                onOpen={() => setOpenPostId(post.id)}
                onLike={() => togglePostLike(post.id)}
                onPin={() => togglePin(post.id)}
              />
            ))
          )}
        </div>
        <BrandSide posts={scopedPosts} />
      </div>

      <ComposerDialog
        open={composing}
        onOpenChange={setComposing}
        privateChannel={channel !== null}
        onPublish={(title, body, nextCategoryId, sendPush) => {
          const organizationId = user?.role === "brand" ? user.organizationId : selected?.id
          if (sendPush) {
            if (!organizationId || !useCreditsStore.getState().spend(organizationId, PUSH_CREDIT_COST)) {
              toast.add({
                type: "error",
                title: t("credits.insufficient"),
                description: t("credits.insufficientBody", { count: PUSH_CREDIT_COST }),
              })
              return false
            }
            const left = organizationBalance(useCreditsStore.getState().balances, organizationId)
            toast.add({
              type: "success",
              title: t("community.pushSent"),
              description: t("credits.spent", { count: PUSH_CREDIT_COST, left }),
            })
          }
          createPost({ title, body, categoryId: nextCategoryId, author: me, campaignId: channel?.id })
          setComposing(false)
          return true
        }}
      />

      <Dialog open={openPost !== null} onOpenChange={(open) => !open && setOpenPostId(null)}>
        <DialogContent className="flex max-h-[min(40rem,calc(100vh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          {openPost && (
            <Thread
              post={openPost}
              locale={locale}
              me={me}
              locked={Boolean(openPost.campaignId)}
              onLikePost={() => togglePostLike(openPost.id)}
              onLikeComment={toggleCommentLike}
              onComment={(body, parentId) => addComment({ postId: openPost.id, parentId, body, author: me })}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function PostCard({
  post,
  commentCount,
  locale,
  canModerate,
  locked,
  onOpen,
  onLike,
  onPin,
}: {
  post: CommunityPost
  commentCount: number
  locale: Locale
  canModerate: boolean
  locked: boolean
  onOpen: () => void
  onLike: () => void
  onPin: () => void
}) {
  const { t } = useI18n()
  const category = COMMUNITY_CATEGORIES.find((item) => item.id === post.categoryId)

  return (
    <Card className="cursor-pointer px-(--card-spacing)" onClick={onOpen}>
      <div className="flex items-center gap-3">
        <Person person={post.author} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {timeAgo(post.createdAt, locale)}
            {category ? ` · ${category.emoji} ${category.name}` : ""}
          </p>
        </div>
        {post.isPinned && <Badge variant="secondary">{t("community.pinned")}</Badge>}
        {canModerate && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-pressed={post.isPinned}
            aria-label={post.isPinned ? t("community.unpin") : t("community.pin")}
            onClick={(event) => {
              event.stopPropagation()
              onPin()
            }}
          >
            <Pin className={cn(post.isPinned && "fill-current")} />
          </Button>
        )}
      </div>
      <div>
        <h3 className="flex items-center gap-1.5 text-base font-semibold">
          {locked && <Lock className="size-3 shrink-0 stroke-[1.5] text-muted-foreground" aria-hidden />}
          <span className="min-w-0">{post.title}</span>
        </h3>
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.body}</p>
      </div>
      {post.media && <PostMedia media={post.media} />}
      <div className="flex items-center gap-2 border-t pt-3" onClick={(event) => event.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={post.likedByMe}
          aria-label={t("community.like")}
          className={cn(post.likedByMe && "text-rose-600")}
          onClick={onLike}
        >
          <Heart className={cn(post.likedByMe && "fill-current")} />
          {post.likeCount}
        </Button>
        <Button variant="ghost" size="sm" aria-label={t("community.comment")} onClick={onOpen}>
          <MessageCircle />
          {commentCount}
        </Button>
      </div>
    </Card>
  )
}

const COMPOSE_TOOLS = [
  { icon: Smile, label: "Emoji" },
  { icon: AtSign, label: "Menção" },
  { icon: Video, label: "Vídeo" },
  { icon: BarChart3, label: "Enquete" },
  { icon: ImageIcon, label: "Imagem" },
  { icon: Calendar, label: "Data" },
  { icon: Paperclip, label: "Anexo" },
  { icon: Type, label: "Texto" },
] as const

function ComposerDialog({
  open,
  onOpenChange,
  privateChannel,
  onPublish,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  privateChannel: boolean
  onPublish: (title: string, body: string, categoryId: string, sendPush: boolean) => boolean
}) {
  const { t } = useI18n()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [push, setPush] = useState(false)
  const canPublish = title.trim().length > 0 && body.trim().length > 0 && categoryId.length > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setTitle("")
          setBody("")
          setCategoryId("")
          setPush(false)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="px-4 pt-4 pr-12">
          <DialogTitle>{t("community.compose")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!canPublish) return
            const published = onPublish(title.trim(), body.trim(), categoryId, push)
            if (!published) return
          }}
        >
          <div className="px-4 pt-4">
            <Label htmlFor="community-title" className="text-xs text-muted-foreground">
              {t("community.titleField")}
            </Label>
            <Input
              id="community-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("community.titlePlaceholder")}
              className="h-auto border-0 bg-transparent px-0 text-lg shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-lg dark:bg-transparent"
            />
            <Textarea
              id="community-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={t("community.bodyPlaceholder")}
              className="mt-2 min-h-52 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
            />
            <div className="mt-1 flex flex-wrap items-center gap-0.5 text-muted-foreground">
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Emoji">
                <Smile />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Menção">
                <AtSign />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="px-2 text-xs font-semibold" aria-label="GIF">
                GIF
              </Button>
              {COMPOSE_TOOLS.slice(2).map(({ icon: Icon, label }) => (
                <Button key={label} type="button" variant="ghost" size="icon-sm" aria-label={label}>
                  <Icon />
                </Button>
              ))}
            </div>
          </div>

          <div className="mx-4 mt-3 mb-4 flex items-center gap-3 rounded-xl bg-muted px-3 py-3">
            <CreditCost amount={PUSH_CREDIT_COST} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t("community.push")}</p>
              <p className="text-xs text-muted-foreground">{t("community.pushHelp", { count: PUSH_CREDIT_COST })}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              role="switch"
              aria-checked={push}
              aria-label={t("community.push")}
              onClick={() => setPush((current) => !current)}
              className={cn(
                "h-6 w-11 shrink-0 rounded-full p-0.5 hover:bg-transparent",
                push ? "justify-end bg-primary hover:bg-primary" : "justify-start bg-foreground/15 hover:bg-foreground/15"
              )}
            >
              <span className="size-5 rounded-full bg-background shadow-sm" />
            </Button>
          </div>

          {privateChannel && (
            <p className="px-4 pb-3 text-xs text-muted-foreground">{t("community.privateHelp")}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? "")}>
              <SelectTrigger id="community-category" className="h-8 border-0 bg-transparent px-0 shadow-none dark:bg-transparent">
                <SelectValue placeholder={t("community.space")}>
                  {(value) => {
                    const category = COMMUNITY_CATEGORIES.find((item) => item.id === value)
                    if (!category) {
                      return <span className="text-muted-foreground">{t("community.space")}</span>
                    }
                    return (
                      <span className="flex items-center gap-2">
                        <span aria-hidden>{category.emoji}</span>
                        {category.name}
                      </span>
                    )
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COMMUNITY_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <DialogClose render={<Button variant="outline" />}>{t("community.cancel")}</DialogClose>
              {push && <CreditCost amount={PUSH_CREDIT_COST} />}
              <Button type="submit" disabled={!canPublish}>
                {t("community.publish")}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Thread({
  post,
  locale,
  me,
  locked,
  onLikePost,
  onLikeComment,
  onComment,
}: {
  post: CommunityPost
  locale: Locale
  me: CommunityAuthor
  locked: boolean
  onLikePost: () => void
  onLikeComment: (commentId: string) => void
  onComment: (body: string, parentId?: string) => void
}) {
  const { t } = useI18n()
  const allComments = useCommunityStore((state) => state.comments)
  const comments = allComments.filter((comment) => comment.postId === post.id)
  const [body, setBody] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const category = COMMUNITY_CATEGORIES.find((item) => item.id === post.categoryId)
  const roots = comments.filter((comment) => !comment.parentId)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="shrink-0 px-4 pt-4 pr-12 pb-3">
        <div className="flex items-center gap-3">
          <Person person={post.author} />
          <div>
            <DialogTitle>{post.author.name}</DialogTitle>
            <DialogDescription>
              {timeAgo(post.createdAt, locale)}
              {category ? ` · ${category.emoji} ${category.name}` : ""}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-4 [scrollbar-gutter:stable]">
          <div>
            <h3 className="flex items-center gap-1.5 text-base font-semibold">
              {locked && <Lock className="size-3 shrink-0 stroke-[1.5] text-muted-foreground" aria-hidden />}
              <span className="min-w-0">{post.title}</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed">{post.body}</p>
            {post.media && <div className="mt-3"><PostMedia media={post.media} embed /></div>}
          </div>
          <div className="flex items-center gap-2 border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={post.likedByMe}
              aria-label={t("community.like")}
              className={cn(post.likedByMe && "text-rose-600")}
              onClick={onLikePost}
            >
              <Heart className={cn(post.likedByMe && "fill-current")} />
              {post.likeCount}
            </Button>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="size-4" />
              {comments.length} {t("community.comments").toLowerCase()}
            </span>
          </div>

          {roots.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">{t("community.noComments")}</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {roots.map((comment) => (
                <li key={comment.id} className="grid gap-2">
                  <CommentRow
                    comment={comment}
                    locale={locale}
                    onLike={() => onLikeComment(comment.id)}
                    onReply={() => {
                      setReplyTo(comment.id)
                      setReply("")
                    }}
                  />
                  {comments
                    .filter((item) => item.parentId === comment.id)
                    .map((child) => (
                      <div key={child.id} className="pl-8">
                        <CommentRow comment={child} locale={locale} onLike={() => onLikeComment(child.id)} />
                      </div>
                    ))}
                  {replyTo === comment.id && (
                    <form
                      className="grid gap-2 pl-8"
                      onSubmit={(event) => {
                        event.preventDefault()
                        if (!reply.trim()) return
                        onComment(reply.trim(), comment.id)
                        setReply("")
                        setReplyTo(null)
                      }}
                    >
                      <Textarea value={reply} placeholder={t("community.reply")} onChange={(event) => setReply(event.target.value)} />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                          {t("community.cancel")}
                        </Button>
                        <Button type="submit" size="sm" disabled={!reply.trim()}>
                          {t("community.reply")}
                        </Button>
                      </div>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
      </div>

      <form
        className="grid shrink-0 gap-2 border-t px-4 py-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (!body.trim()) return
          onComment(body.trim())
          setBody("")
        }}
      >
        <Label htmlFor="community-comment" className="sr-only">
          {t("community.writeComment")}
        </Label>
        <Textarea
          id="community-comment"
          value={body}
          placeholder={t("community.writeComment")}
          onChange={(event) => setBody(event.target.value)}
        />
        <div className="flex items-center justify-end gap-2">
          <Person person={me} size="sm" />
          <Button type="submit" size="sm" disabled={!body.trim()}>
            {t("community.comment")}
          </Button>
        </div>
      </form>
    </div>
  )
}

function CommentRow({
  comment,
  locale,
  onLike,
  onReply,
}: {
  comment: { id: string; author: CommunityAuthor; body: string; createdAt: string; likeCount: number; likedByMe: boolean; media?: CommunityMedia }
  locale: Locale
  onLike: () => void
  onReply?: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="flex gap-3">
      <Person person={comment.author} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{comment.author.name}</span>{" "}
          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt, locale)}</span>
        </p>
        <p className="mt-1 text-sm leading-relaxed">{comment.body}</p>
        {comment.media && <div className="mt-2"><PostMedia media={comment.media} /></div>}
        <div className="mt-1 flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            aria-pressed={comment.likedByMe}
            aria-label={t("community.like")}
            className={cn(comment.likedByMe && "text-rose-600")}
            onClick={onLike}
          >
            <Heart className={cn(comment.likedByMe && "fill-current")} />
            {comment.likeCount}
          </Button>
          {onReply && (
            <Button variant="ghost" size="xs" onClick={onReply}>
              {t("community.reply")}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
