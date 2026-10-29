"use client"

import { useMemo, useState } from "react"
import { BatteryFull, Signal, Wifi } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { CreditCost } from "@/components/credits/credit-cost"
import { PUSH_CREDIT_COST } from "@/lib/credits"
import { campaignAudience } from "@/lib/mock-data/community"
import { CREATORS } from "@/lib/mock-data/creators"
import { ORG_LOGOS } from "@/lib/mock-data/users"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { organizationBalance, useCreditsStore } from "@/lib/stores/credits"
import { cn } from "@/lib/utils"

const LIMITS = {
  ios: { title: 50, body: 178 },
  android: { title: 65, body: 110 },
} as const

const LEVELS = ["bronze", "silver", "gold", "platinum"] as const

type Level = (typeof LEVELS)[number]

const LEVEL_KEY: Record<Level, MessageKey> = {
  bronze: "push.level.bronze",
  silver: "push.level.silver",
  gold: "push.level.gold",
  platinum: "push.level.platinum",
}

function isLevel(value: string | undefined): value is Level {
  return value === "bronze" || value === "silver" || value === "gold" || value === "platinum"
}

interface AudienceMember {
  id: string
  name: string
  handle: string
  avatar: string
  photo?: string
  level?: Level
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.15 6.9c-.95 0-2.42-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.21 3.09 3.79 3.04 1.52-.06 2.09-.99 3.94-.99 1.83 0 2.35.99 3.96.95 1.64-.03 2.68-1.48 3.68-2.95 1.16-1.69 1.64-3.33 1.66-3.42-.04-.01-3.18-1.22-3.22-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.62-2.32-4.39-2.38-2-.15-3.68 1.09-4.62 1.09zM15.53 3.83c.84-1.01 1.4-2.43 1.25-3.83-1.21.05-2.66.8-3.53 1.82-.78.9-1.45 2.34-1.27 3.71 1.34.1 2.72-.69 3.56-1.7z"
      />
    </svg>
  )
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.46 11.46 0 0 0-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"
      />
    </svg>
  )
}

function clip(text: string, max: number) {
  const value = text.trim()
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trimEnd()}…`
}

function StatusBar({ light = false, safe = false }: { light?: boolean; safe?: boolean }) {
  return (
    <div
      className={cn(
        "text-[10px] font-medium",
        light ? "text-white" : "text-zinc-900",
        safe
          ? "grid h-10 shrink-0 grid-cols-[1fr_2.75rem_1fr] items-center bg-white px-3"
          : "flex items-center justify-between px-4 pt-2",
      )}
    >
      <span>9:41</span>
      {safe ? <span aria-hidden /> : null}
      <span className={cn("flex items-center gap-1", safe && "justify-end")}>
        <Signal className="size-3" />
        <Wifi className="size-3" />
        <BatteryFull className="size-3.5" />
      </span>
    </div>
  )
}

function AppBackdrop({ logo, name }: { logo?: string; name: string }) {
  return (
    <div className="flex h-full flex-col bg-zinc-100">
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2">
        {logo ? (
          <img src={logo} alt="" className="size-6 rounded-md object-cover" />
        ) : (
          <span className="flex size-6 items-center justify-center rounded-md bg-zinc-900 text-[9px] font-bold text-white">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="text-xs font-semibold text-zinc-900">{name}</span>
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="h-2 w-2/3 rounded-full bg-zinc-200" />
          <div className="mt-2 h-2 w-full rounded-full bg-zinc-100" />
          <div className="mt-1.5 h-2 w-4/5 rounded-full bg-zinc-100" />
        </div>
        <div className="h-16 rounded-xl bg-white shadow-sm" />
      </div>
    </div>
  )
}

function NotificationIcon({ src, label, shape }: { src?: string; label: string; shape: "ios" | "android" }) {
  const radius = shape === "ios" ? "rounded-[5px]" : "rounded-full"
  if (src) {
    return <img src={src} alt="" className={cn("size-5 shrink-0 object-cover", radius)} />
  }
  return (
    <span className={cn("flex size-5 shrink-0 items-center justify-center bg-zinc-900 text-[8px] font-bold text-white", radius)}>
      {label.slice(0, 2).toUpperCase()}
    </span>
  )
}

function PhoneShell({
  camera,
  children,
}: {
  camera: "island" | "hole"
  children: React.ReactNode
}) {
  return (
    <div className="w-[220px] shrink-0 rounded-[2rem] border-[9px] border-zinc-900 bg-zinc-900 shadow-xl">
      <div className="relative h-[440px] overflow-hidden rounded-[1.35rem] bg-zinc-100">
        {camera === "island" ? (
          <div className="absolute top-2 left-1/2 z-30 h-5 w-16 -translate-x-1/2 rounded-full bg-black" />
        ) : (
          <div className="absolute top-3.5 left-1/2 z-30 size-3 -translate-x-1/2 rounded-full bg-zinc-950 ring-[3px] ring-white" />
        )}
        {children}
      </div>
    </div>
  )
}

function useCommunityAudience(organizationId: string | undefined) {
  const campaigns = useCampaignStore((state) => state.campaigns)
  return useMemo(() => {
    if (!organizationId) return []
    const seen = new Map<string, AudienceMember>()
    for (const campaign of campaigns) {
      if (campaign.organizationId !== organizationId) continue
      for (const participant of campaignAudience(campaign)) {
        if (seen.has(participant.creatorId)) continue
        const profile = CREATORS.find((item) => item.id === participant.creatorId)
        const level = participant.level ?? profile?.level
        seen.set(participant.creatorId, {
          id: participant.creatorId,
          name: participant.creatorName,
          handle: participant.creatorHandle,
          avatar: participant.avatar,
          photo: profile?.photo,
          level: isLevel(level) ? level : undefined,
        })
      }
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  }, [campaigns, organizationId])
}

export function PushStudio() {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [arrival, setArrival] = useState(0)
  const [query, setQuery] = useState("")
  const [level, setLevel] = useState<string>("all")
  const [picked, setPicked] = useState<string[] | null>(null)
  const [pickedOrg, setPickedOrg] = useState(user?.organizationId ?? "")
  const members = useCommunityAudience(user?.organizationId)
  const organizationId = user?.organizationId ?? ""

  if (pickedOrg !== organizationId) {
    setPickedOrg(organizationId)
    setPicked(null)
    setQuery("")
    setLevel("all")
  }

  const appIcon = organizationId ? ORG_LOGOS[organizationId]?.icon ?? user?.orgLogo : user?.orgLogo
  const appName = t("push.app")
  const hasText = Boolean(title.trim() || body.trim())
  const iosTitle = clip(title, LIMITS.ios.title)
  const iosBody = clip(body, LIMITS.ios.body)
  const androidTitle = clip(title, LIMITS.android.title)
  const androidBody = clip(body, LIMITS.android.body)
  const memberIds = useMemo(() => new Set(members.map((member) => member.id)), [members])
  const selectedIds = (picked ?? members.map((member) => member.id)).filter((id) => memberIds.has(id))
  const selected = new Set(selectedIds)
  const filtering = query.trim().length > 0 || level !== "all"
  const visible = members.filter((member) => {
    if (level !== "all" && member.level !== level) return false
    const text = `${member.name} ${member.handle}`.toLowerCase()
    return text.includes(query.trim().toLowerCase())
  })
  const visibleIds = visible.map((member) => member.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const availableLevels = LEVELS.filter((item) => members.some((member) => member.level === item))

  function toggle(id: string, on: boolean) {
    const next = new Set(selectedIds)
    if (on) next.add(id)
    else next.delete(id)
    setPicked([...next])
  }

  function toggleVisible(on: boolean) {
    const next = new Set(selectedIds)
    for (const id of visibleIds) {
      if (on) next.add(id)
      else next.delete(id)
    }
    setPicked([...next])
  }

  function changeLevel(value: string) {
    setLevel(value)
    if (value === "all") {
      setPicked(null)
      return
    }
    setPicked(members.filter((member) => member.level === value).map((member) => member.id))
  }

  function create() {
    if (!title.trim() || !organizationId || selectedIds.length === 0) return
    const recipients = selectedIds.filter((id) => memberIds.has(id))
    if (recipients.length === 0) return
    const spent = useCreditsStore.getState().spend(organizationId, PUSH_CREDIT_COST)
    if (!spent) {
      toast.add({
        type: "error",
        title: t("credits.insufficient"),
        description: t("credits.insufficientBody", { count: PUSH_CREDIT_COST }),
      })
      return
    }
    setArrival((value) => value + 1)
    const left = organizationBalance(useCreditsStore.getState().balances, organizationId)
    toast.add({
      type: "success",
      title: t("push.created"),
      description: t("push.sentTo", { count: recipients.length, credits: PUSH_CREDIT_COST, left }),
    })
  }

  return (
    <div className="grid items-start gap-6 p-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{t("nav.push")}</CardTitle>
          <CardDescription>{t("push.note")}</CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-4 px-(--card-spacing)">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="push-title">{t("push.titleLabel")}</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {title.length}/{LIMITS.android.title}
              </span>
            </div>
            <Input
              id="push-title"
              value={title}
              maxLength={LIMITS.android.title}
              placeholder={t("push.titlePlaceholder")}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="push-body">{t("push.bodyLabel")}</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {body.length}/{LIMITS.ios.body}
              </span>
            </div>
            <Textarea
              id="push-body"
              value={body}
              maxLength={LIMITS.ios.body}
              placeholder={t("push.bodyPlaceholder")}
              onChange={(event) => setBody(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="push-audience">{t("push.audience")}</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {selectedIds.length === 1 ? t("push.selectedOne") : t("push.selected", { count: selectedIds.length })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t("push.audienceHelp")}</p>
            {members.length === 0 ? (
              <p className="rounded-lg border border-input px-3 py-6 text-center text-sm text-muted-foreground">
                {t("push.noCommunity")}
              </p>
            ) : (
              <>
                <Input
                  id="push-audience"
                  value={query}
                  placeholder={t("push.search")}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <RadioGroup
                  value={level}
                  aria-label={t("push.levelLabel")}
                  className="grid grid-cols-2 gap-2"
                  onValueChange={(value) => changeLevel(value)}
                >
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <RadioGroupItem value="all" />
                    {t("push.levelAll")}
                  </label>
                  {availableLevels.map((item) => (
                    <label key={item} className="flex cursor-pointer items-center gap-2 text-sm">
                      <RadioGroupItem value={item} />
                      {t(LEVEL_KEY[item])}
                    </label>
                  ))}
                </RadioGroup>
                <ScrollArea className="h-52 rounded-lg border border-input">
                  {visible.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("push.emptyMembers")}</p>
                  ) : (
                    <ul className="flex flex-col p-1">
                      <li>
                        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                          <Checkbox
                            checked={allVisibleSelected}
                            onCheckedChange={(checked) => toggleVisible(checked === true)}
                          />
                          <span className="text-sm font-medium">
                            {filtering ? t("push.selectVisible") : t("push.selectAll")}
                          </span>
                        </label>
                      </li>
                      {visible.map((member) => (
                        <li key={member.id}>
                          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                            <Checkbox
                              checked={selected.has(member.id)}
                              onCheckedChange={(checked) => toggle(member.id, checked === true)}
                            />
                            <Avatar size="sm">
                              {member.photo ? <AvatarImage src={member.photo} alt="" /> : null}
                              <AvatarFallback>{member.avatar}</AvatarFallback>
                            </Avatar>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{member.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {member.handle}
                                {member.level ? ` · ${t(LEVEL_KEY[member.level])}` : ""}
                              </span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollArea>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 self-start">
            <CreditCost amount={PUSH_CREDIT_COST} />
            <Button type="button" disabled={!title.trim() || selectedIds.length === 0} onClick={create}>
              {t("push.create")}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t("push.preview")}</h2>
        </div>
        <div className="flex flex-wrap items-start justify-center gap-8">
          <figure className="flex flex-col items-center gap-3">
            <PhoneShell camera="island">
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-300 to-zinc-500" />
              <StatusBar light />
              <p className="relative mt-8 text-center text-4xl font-semibold tracking-tight text-white">9:41</p>
              <div
                key={`ios-${arrival}`}
                className={cn("absolute inset-x-2 top-36 z-10 animate-in duration-700 fade-in slide-in-from-top-6", !hasText && "opacity-80")}
              >
                <div className="rounded-2xl bg-white/90 p-2.5 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-1.5">
                    <NotificationIcon src={appIcon} label={appName} shape="ios" />
                    <span className="text-[10px] font-medium text-zinc-500">{appName}</span>
                    <span className="ml-auto text-[10px] text-zinc-400">{t("push.now")}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[12px] font-semibold text-zinc-900">
                    {iosTitle || t("push.titlePlaceholder")}
                  </p>
                  <p className="line-clamp-4 text-[11px] leading-snug text-zinc-600">
                    {iosBody || t("push.bodyPlaceholder")}
                  </p>
                </div>
              </div>
            </PhoneShell>
            <figcaption className="max-w-[220px] text-center">
              <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-foreground">
                <AppleIcon className="size-4" />
                {t("push.ios")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("push.iosLimit", { title: LIMITS.ios.title, body: LIMITS.ios.body })}
              </p>
            </figcaption>
          </figure>

          <figure className="flex flex-col items-center gap-3">
            <PhoneShell camera="hole">
              <div className="flex h-full flex-col">
                <StatusBar safe />
                <div className="relative min-h-0 flex-1">
                  <AppBackdrop logo={appIcon} name={appName} />
                  <div
                    key={`android-${arrival}`}
                    className="absolute inset-x-2 top-2 z-10 animate-in duration-700 fade-in slide-in-from-top-6"
                  >
                    <div className="rounded-2xl bg-white p-2.5 shadow-lg">
                      <div className="flex items-center gap-1.5">
                        <NotificationIcon src={appIcon} label={appName} shape="android" />
                        <span className="text-[10px] text-zinc-500">{appName}</span>
                        <span className="text-[10px] text-zinc-400">· {t("push.now")}</span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[12px] font-semibold text-zinc-900">
                        {androidTitle || t("push.titlePlaceholder")}
                      </p>
                      <p className="line-clamp-2 text-[11px] leading-snug text-zinc-600">
                        {androidBody || t("push.bodyPlaceholder")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PhoneShell>
            <figcaption className="max-w-[220px] text-center">
              <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-foreground">
                <AndroidIcon className="size-4 text-[#3DDC84]" />
                {t("push.android")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("push.androidLimit", { title: LIMITS.android.title, body: LIMITS.android.body })}
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  )
}
