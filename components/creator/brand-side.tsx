"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { campaignAudience, type CommunityPost } from "@/lib/mock-data/community"
import { CREATORS } from "@/lib/mock-data/creators"
import { MOCK_USERS, ORG_LOGOS } from "@/lib/mock-data/users"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { usePartnerCommunity } from "@/lib/stores/partner-community"
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

  const ranking = useMemo(() => {
    const scores = new Map<string, { id: string; name: string; avatar: string; likes: number }>()
    for (const member of members) {
      scores.set(member.id, { id: member.id, name: member.name, avatar: member.avatar, likes: 0 })
    }
    const campaignIds = new Set(brandCampaigns.map((campaign) => campaign.id))
    for (const post of posts) {
      if (!post.campaignId || !campaignIds.has(post.campaignId)) continue
      const current = scores.get(post.author.id)
      if (!current) continue
      current.likes += post.likeCount
    }
    return [...scores.values()].sort((a, b) => b.likes - a.likes).slice(0, 3)
  }, [members, posts, brandCampaigns])

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
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t("nav.ranking")}</h2>
          <p className="text-xs text-muted-foreground">{t("brand.likesReceived")}</p>
        </div>
        <ol className="flex flex-col gap-3">
          {ranking.map((item, index) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="w-4 text-sm tabular-nums text-muted-foreground">{index + 1}</span>
              <Avatar size="sm">
                <AvatarFallback>{item.avatar}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
              <span className="text-sm tabular-nums text-muted-foreground">{item.likes}</span>
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
