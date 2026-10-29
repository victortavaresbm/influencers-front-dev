"use client"

import { useMemo } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { ContentCalendar } from "@/components/calendar/content-calendar"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { buildSchedule } from "@/lib/schedule"

export default function BrandCalendarPage() {
  const user = useAuthStore((s) => s.user)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const slots = useMemo(
    () => buildSchedule(campaigns).filter((slot) => slot.organizationId === user?.organizationId),
    [campaigns, user?.organizationId],
  )

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Calendário"
        subtitle="Programação das campanhas e acompanhamento do que está saindo no ar."
      />
      <div className="p-6">
        <ContentCalendar slots={slots} audience="brand" />
      </div>
    </div>
  )
}
