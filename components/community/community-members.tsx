"use client"

import { useMemo, useState } from "react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MembershipBadge } from "@/components/members/membership-badge"
import { campaignAudience } from "@/lib/mock-data/community"
import { SOCIAL_NETWORK_LABEL, type SocialNetwork } from "@/lib/mock-data/campaigns"
import { CREATORS, type CreatorNetwork, type Network } from "@/lib/mock-data/creators"
import { type MembershipRole } from "@/lib/membership"
import { membershipRoleOf, trackedSale, useMembershipStore } from "@/lib/stores/membership"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { useCampaignStore } from "@/lib/stores/campaigns"
import type { Locale } from "@/lib/stores/preferences"
import { cn } from "@/lib/utils"

const LEVELS = ["bronze", "silver", "gold", "platinum"] as const
const NETWORKS: SocialNetwork[] = ["instagram", "tiktok", "youtube"]
type Level = (typeof LEVELS)[number]
type Segment = "active" | "recent" | "quiet" | "ambassador"

const LEVEL_KEY: Record<Level, MessageKey> = {
  bronze: "community.level.bronze",
  silver: "community.level.silver",
  gold: "community.level.gold",
  platinum: "community.level.platinum",
}

const SEGMENTS: { id: Segment; label: MessageKey; help: MessageKey }[] = [
  { id: "active", label: "community.segment.active", help: "community.segment.activeHelp" },
  { id: "recent", label: "community.segment.recent", help: "community.segment.recentHelp" },
  { id: "quiet", label: "community.segment.quiet", help: "community.segment.quietHelp" },
  { id: "ambassador", label: "community.segment.ambassador", help: "community.segment.ambassadorHelp" },
]

const DAY = 86_400_000

function isLevel(value: string | undefined): value is Level {
  return value === "bronze" || value === "silver" || value === "gold" || value === "platinum"
}

function within(iso: string | undefined, days: number) {
  if (!iso) return false
  return Date.now() - new Date(iso).getTime() <= days * DAY
}

function localeTag(locale: Locale) {
  if (locale === "en") return "en"
  if (locale === "es") return "es"
  return "pt-BR"
}

function compact(value: number, locale: Locale) {
  return new Intl.NumberFormat(localeTag(locale), { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function money(value: number, locale: Locale) {
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function NetworkMark({ network }: { network: Network }) {
  if (network === "tiktok") return <SiTiktok size={14} className="text-muted-foreground" />
  if (network === "youtube") return <SiYoutube size={14} className="text-muted-foreground" />
  return <SiInstagram size={14} className="text-muted-foreground" />
}

interface MemberRow {
  id: string
  name: string
  handle: string
  avatar: string
  photo?: string
  level?: Level
  joined?: string
  lastPost?: string
  ambassador: boolean
  channel?: CreatorNetwork
  networks: Network[]
  campaignIds: string[]
  posts: number
  reach: number
  engagements: number
  sales: number
  mediaValue: number
  role?: MembershipRole
}

function tagsOf(member: MemberRow): Segment[] {
  const active = member.role === "affiliate" ? member.sales > 0 : within(member.lastPost, 90)
  const tags: Segment[] = [active ? "active" : "quiet"]
  if (within(member.joined, 180)) tags.push("recent")
  if (member.ambassador) tags.push("ambassador")
  return tags
}

export function CommunityMembers({ organizationId }: { organizationId?: string }) {
  const { t, locale } = useI18n()
  const campaigns = useCampaignStore((state) => state.campaigns)
  const roles = useMembershipStore((state) => state.roles)
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("all")
  const [type, setType] = useState("all")
  const [network, setNetwork] = useState("all")
  const [campaignId, setCampaignId] = useState("all")

  const members = useMemo(() => {
    if (!organizationId) return []
    const seen = new Map<string, MemberRow>()
    for (const campaign of campaigns) {
      if (campaign.organizationId !== organizationId) continue
      for (const participant of campaignAudience(campaign)) {
        const profile = CREATORS.find((item) => item.id === participant.creatorId)
        const current = seen.get(participant.creatorId)
        const lastPost = [participant.lastPost, profile?.lastPost, current?.lastPost]
          .filter((value): value is string => Boolean(value))
          .sort()
          .at(-1)
        const levelValue = participant.level ?? profile?.level
        const channel = profile?.networks.slice().sort((a, b) => b.followers - a.followers)[0]
        const next: MemberRow = {
          id: participant.creatorId,
          name: participant.creatorName,
          handle: participant.creatorHandle,
          avatar: participant.avatar,
          photo: profile?.photo,
          level: isLevel(levelValue) ? levelValue : current?.level,
          joined: profile?.joined ?? current?.joined,
          lastPost,
          ambassador: participant.memberType === "ambassador" || profile?.memberType === "ambassador" || Boolean(current?.ambassador),
          channel: channel ?? current?.channel,
          networks: profile?.networks.map((item) => item.network) ?? current?.networks ?? [],
          campaignIds: [...new Set([...(current?.campaignIds ?? []), campaign.id])],
          posts: (current?.posts ?? 0) + (participant.postsDelivered ?? 0),
          reach: (current?.reach ?? 0) + (participant.totalReach ?? 0),
          engagements: (current?.engagements ?? 0) + (participant.totalEngagement ?? 0),
          sales: (current?.sales ?? 0) + trackedSale(participant.creatorId, participant.revenue, participant.couponCode, roles),
          mediaValue: profile?.mediaValue ?? current?.mediaValue ?? 0,
          role: membershipRoleOf(participant.creatorId, roles),
        }
        seen.set(participant.creatorId, next)
      }
    }
    return [...seen.values()].sort((a, b) => b.sales - a.sales || b.reach - a.reach || a.name.localeCompare(b.name, "pt-BR"))
  }, [campaigns, organizationId, roles])

  const networkOptions = NETWORKS.filter((item) => members.some((member) => member.networks.includes(item)))
  const campaignOptions = campaigns
    .filter((campaign) => campaign.organizationId === organizationId && members.some((member) => member.campaignIds.includes(campaign.id)))
    .map((campaign) => [campaign.id, campaign.name] as const)
    .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
  const scoped = members.filter((member) => {
    if (role !== "all" && member.role !== role) return false
    if (network !== "all" && !member.networks.includes(network as Network)) return false
    if (campaignId !== "all" && !member.campaignIds.includes(campaignId)) return false
    return true
  })
  const visible = scoped.filter((member) => {
    if (type !== "all" && !tagsOf(member).includes(type as Segment)) return false
    const text = `${member.name} ${member.handle}`.toLowerCase()
    return text.includes(query.trim().toLowerCase())
  })
  const filtersActive = role !== "all" || type !== "all" || network !== "all" || campaignId !== "all"

  function clearFilters() {
    setRole("all")
    setType("all")
    setNetwork("all")
    setCampaignId("all")
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <Input
        value={query}
        placeholder={t("community.membersSearch")}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={t("community.membersSearch")}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Select value={role} onValueChange={(value) => setRole(value ?? "all")}>
          <SelectTrigger size="sm" className="min-w-36">
            <SelectValue placeholder={t("community.filterRoleAll")}>
              {(value) => {
                if (value === "affiliate") return t("community.affiliate")
                if (value === "creator") return t("community.creator")
                return t("community.filterRoleAll")
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("community.filterRoleAll")}</SelectItem>
            <SelectItem value="affiliate">{t("community.affiliate")}</SelectItem>
            <SelectItem value="creator">{t("community.creator")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(value) => setType(value ?? "all")}>
          <SelectTrigger size="sm" className="min-w-36">
            <SelectValue placeholder={t("community.filterTypeAll")}>
              {(value) => {
                const segment = SEGMENTS.find((item) => item.id === value)
                return segment ? t(segment.label) : t("community.filterTypeAll")
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("community.filterTypeAll")}</SelectItem>
            {SEGMENTS.map((segment) => (
              <SelectItem key={segment.id} value={segment.id}>
                {t(segment.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={network} onValueChange={(value) => setNetwork(value ?? "all")}>
          <SelectTrigger size="sm" className="min-w-36">
            <SelectValue placeholder={t("community.filterNetworkAll")}>
              {(value) => (value && value !== "all" ? SOCIAL_NETWORK_LABEL[value as SocialNetwork] : t("community.filterNetworkAll"))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("community.filterNetworkAll")}</SelectItem>
            {networkOptions.map((item) => (
              <SelectItem key={item} value={item}>
                <NetworkMark network={item} />
                {SOCIAL_NETWORK_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={campaignId} onValueChange={(value) => setCampaignId(value ?? "all")}>
          <SelectTrigger size="sm" className="max-w-56">
            <SelectValue placeholder={t("community.filterCampaignAll")}>
              {(value) => {
                if (!value || value === "all") return t("community.filterCampaignAll")
                return campaignOptions.find(([id]) => id === value)?.[1] ?? t("community.filterCampaignAll")
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("community.filterCampaignAll")}</SelectItem>
            {campaignOptions.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            {t("community.filterClear")}
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SEGMENTS.map((segment) => {
          const count = scoped.filter((member) => tagsOf(member).includes(segment.id)).length
          const on = type === segment.id
          return (
            <Button
              key={segment.id}
              variant={on ? "secondary" : "outline"}
              aria-pressed={on}
              className="h-auto items-start justify-start px-3 py-3 text-left whitespace-normal"
              onClick={() => setType(on ? "all" : segment.id)}
            >
              <span className="flex w-full flex-col gap-1">
                <span className="text-lg font-semibold tabular-nums">{count}</span>
                <span>{t(segment.label)}</span>
                <span className="text-xs font-normal text-muted-foreground">{t(segment.help)}</span>
              </span>
            </Button>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        {visible.length === 1 ? t("community.membersCountOne") : t("community.membersCount", { count: visible.length })}
      </p>
      {members.length === 0 ? (
        <Card className="items-center px-(--card-spacing) py-12 text-center">
          <p className="text-sm text-muted-foreground">{t("community.membersNone")}</p>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="items-center px-(--card-spacing) py-12 text-center">
          <p className="text-sm text-muted-foreground">{t("community.membersEmpty")}</p>
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("community.colCreator")}</TableHead>
                <TableHead>{t("community.colRole")}</TableHead>
                <TableHead>{t("community.colChannel")}</TableHead>
                <TableHead className="text-right">{t("community.colPosts")}</TableHead>
                <TableHead className="text-right">{t("community.colReach")}</TableHead>
                <TableHead className="text-right">{t("community.colEngagements")}</TableHead>
                <TableHead className="text-right">{t("community.colSales")}</TableHead>
                <TableHead className="text-right">{t("community.colValue")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        {member.photo ? <AvatarImage src={member.photo} alt="" /> : null}
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{member.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.handle}
                          {member.level ? ` · ${t(LEVEL_KEY[member.level])}` : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <MembershipBadge role={member.role} />
                  </TableCell>
                  <TableCell>
                    {member.channel ? (
                      <div className="flex items-center gap-2">
                        <NetworkMark network={member.channel.network} />
                        <span className="tabular-nums">{compact(member.channel.followers, locale)}</span>
                        <span className={cn("text-xs text-muted-foreground tabular-nums")}>
                          {member.channel.engagementRate.toLocaleString(localeTag(locale), { maximumFractionDigits: 1 })}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {member.role === "affiliate" ? t("community.notTracked") : compact(member.posts, locale)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {member.role === "affiliate" ? t("community.notTracked") : compact(member.reach, locale)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {member.role === "affiliate" ? t("community.notTracked") : compact(member.engagements, locale)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{money(member.sales, locale)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {member.role === "affiliate" ? t("community.notTracked") : money(member.mediaValue, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
