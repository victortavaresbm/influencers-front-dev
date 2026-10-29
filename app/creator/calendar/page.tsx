"use client"

import { useMemo } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { ContentCalendar } from "@/components/calendar/content-calendar"
import { CREATORS } from "@/lib/mock-data/creators"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { buildSchedule } from "@/lib/schedule"

export default function CreatorCalendarPage() {
  const user = useAuthStore((s) => s.user)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const creatorId = CREATORS.find((creator) => creator.email === user?.email)?.id
  const slots = useMemo(
    () => buildSchedule(campaigns).filter((slot) => slot.creatorId === creatorId),
    [campaigns, creatorId],
  )

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Calendário"
        subtitle="Seus posts programados e o que já foi publicado nas campanhas."
      />
      <div className="p-6">
        <ContentCalendar slots={slots} audience="creator" />
      </div>
    </div>
  )
}
