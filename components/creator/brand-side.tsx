"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Sparkles, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { campaignAudience, type CommunityPost } from "@/lib/mock-data/community"
import { CREATORS } from "@/lib/mock-data/creators"
import { MOCK_USERS, ORG_LOGOS } from "@/lib/mock-data/users"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { usePartnerCommunity } from "@/lib/stores/partner-community"
import { useEngagementStore } from "@/lib/stores/engagement"
import { scoreEvents } from "@/lib/community-engagement"
import { useI18n } from "@/lib/i18n"

const LEVEL: Record<string, string> = {
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  platinum: "Platina",
}

export function BrandSide({ posts }: { posts: CommunityPost[] }) {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const { selected } = usePartnerCommunity()
  const [membersOpen, setMembersOpen] = useState(false)
  const creator = CREATORS.find((item) => item.email === user?.email)
  const brand = selected ?? (user?.role === "brand" && user.organizationId
    ? { id: user.organizationId, name: user.organizationName, logo: user.orgLogo ?? ORG_LOGOS[user.organizationId]?.logo }
    : null)

  const brandCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.organizationId === brand?.id),
    [campaigns, brand?.id]
  )
  const cover = brandCampaigns.find((campaign) => campaign.coverImage)?.coverImage
  const tagline = brand ? ORG_LOGOS[brand.id]?.tagline : undefined
  const admins = MOCK_USERS.filter((item) => item.role === "brand" && item.organizationId === brand?.id).length
  const level = user?.role === "brand" ? (user.plan ?? "Admin") : LEVEL[creator?.level ?? "bronze"]
  const rankingHref = user?.role === "brand" ? "/ranking" : "/creator/ranking"

  const members = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; avatar: string; photo?: string; handle: string }>()
    for (const campaign of brandCampaigns) {
      for (const participant of campaignAudience(campaign)) {
        if (seen.has(participant.creatorId)) continue
        const profile = CREATORS.find((item) => item.id === participant.creatorId)
        seen.set(participant.creatorId, {
          id: participant.creatorId,
          name: participant.creatorName,
          avatar: participant.avatar,
          photo: profile?.photo,
          handle: participant.creatorHandle,
        })
      }
    }
    return [...seen.values()]
  }, [brandCampaigns])

  const allEngagementEvents = useEngagementStore((s) => s.events)

  const ranking = useMemo(() => {
    const orgId = brand?.id ?? ""
    const orgEvents = allEngagementEvents.filter((e) => e.organizationId === orgId)
    const scores = scoreEvents(orgEvents, 30)
    return members
      .map((member) => ({
        ...member,
        pts: scores.get(member.id)?.total ?? 0,
      }))
      .sort((a, b) => b.pts - a.pts)
      .slice(0, 3)
  }, [members, allEngagementEvents, brand?.id])

  if (!brand) return null

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-36">
      <Card className="overflow-hidden !pt-0">
        <div className="h-28 bg-muted">
          {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="px-(--card-spacing) pb-(--card-spacing)">
          {brand.logo ? (
            <img
              src={ORG_LOGOS[brand.id]?.icon ?? brand.logo}
              alt={brand.name}
              className="-mt-8 size-16 rounded-2xl border-4 border-background object-cover shadow-sm"
            />
          ) : (
            <span className="-mt-8 flex size-16 items-center justify-center rounded-full border-4 border-background bg-primary text-lg font-semibold text-primary-foreground">
              {brand.name.slice(0, 2)}
            </span>
          )}
          <h2 className="mt-3 text-lg font-semibold text-foreground">{brand.name}</h2>
          {tagline && <p className="text-sm text-muted-foreground">{tagline}</p>}
          <p className="mt-5 text-sm font-medium text-foreground">{t("brand.pageContent")}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-semibold tabular-nums">{members.length}</p>
              <p className="text-[11px] text-muted-foreground">{t("brand.members")}</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{admins}</p>
              <p className="text-[11px] text-muted-foreground">{t("brand.admins")}</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{level}</p>
              <p className="text-[11px] text-muted-foreground">{t("brand.yourLevel")}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((member) => (
                <Avatar key={member.id} size="sm" className="ring-2 ring-background">
                  {member.photo && <AvatarImage src={member.photo} alt="" />}
                  <AvatarFallback>{member.avatar}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMembersOpen((open) => !open)}>
              <Users />
              {t("brand.seeMembers")}
            </Button>
          </div>
          {membersOpen && (
            <ul className="mt-3 flex flex-col gap-2">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-2">
                  <Avatar size="sm">
                    {member.photo && <AvatarImage src={member.photo} alt="" />}
                    <AvatarFallback>{member.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.handle}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card className="px-(--card-spacing)">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-foreground">{t("nav.ranking")}</h2>
        </div>
        <ol className="flex flex-col gap-2">
          {ranking.map((item, index) => (
            <li
              key={item.id}
              className="podium-card flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60"
              style={{ "--podium-delay": `${index * 100}ms` } as React.CSSProperties}
            >
              <span
                className={[
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  index === 0 ? "bg-amber-400 text-amber-900" : index === 1 ? "bg-zinc-300 text-zinc-700" : "bg-amber-700/60 text-white",
                ].join(" ")}
              >
                {index + 1}
              </span>
              <Avatar size="sm">
                {item.photo && <AvatarImage src={item.photo} alt="" />}
                <AvatarFallback>{item.avatar}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
              <span className="text-xs font-bold tabular-nums text-muted-foreground">
                {item.pts.toLocaleString("pt-BR")} pts
              </span>
            </li>
          ))}
        </ol>
        <Button variant="ghost" className="w-full" render={<Link href={rankingHref} />}>
          {t("brand.seeRanking")}
        </Button>
      </Card>
    </div>
  )
}
