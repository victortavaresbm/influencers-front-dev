"use client"

import { useMemo, useState } from "react"
import { useAuthStore } from "@/lib/stores/auth"
import { TopBar } from "@/components/layout/top-bar"
import { JourneyStats } from "@/components/journeys/journey-stats"
import { OriginMap } from "@/components/journeys/origin-map"
import { PanoramaTable } from "@/components/journeys/panorama-table"
import { VisitorTable } from "@/components/journeys/visitor-table"
import { useI18n } from "@/lib/i18n"
import { aggregateByCity, cityKey, VISITORS } from "@/lib/mock-data/journeys"

export default function JourneysPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const visitors = useMemo(() => {
    if (!user) return []
    return VISITORS.filter((visitor) => visitor.organizationId === user.organizationId)
  }, [user])

  const selected = useMemo(
    () => aggregateByCity(visitors).find((city) => city.key === selectedKey) ?? null,
    [visitors, selectedKey]
  )

  const scoped = useMemo(() => {
    if (!selected) return visitors
    return visitors.filter(
      (visitor) => visitor.location && cityKey(visitor.location.city, visitor.location.state) === selected.key
    )
  }, [visitors, selected])

  const place = selected ? `${selected.city}, ${selected.state}` : null

  if (!user) return null

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("journeys.title")}
        subtitle={t("journeys.subtitle")}
      />

      <div className="flex flex-col gap-6 p-6">
        <JourneyStats visitors={scoped} place={place} />
        <OriginMap visitors={visitors} selectedKey={selectedKey} onSelect={setSelectedKey} />
        <PanoramaTable visitors={scoped} place={place} />
        <VisitorTable visitors={scoped} place={place} />
      </div>
    </div>
  )
}
