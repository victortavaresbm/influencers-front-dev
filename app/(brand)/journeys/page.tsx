"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth"
import { TopBar } from "@/components/layout/top-bar"
import { JourneyStats } from "@/components/journeys/journey-stats"
import { OriginMap } from "@/components/journeys/origin-map"
import { JourneyWorkspace } from "@/components/journeys/journey-workspace"
import { VisitorSheet } from "@/components/journeys/visitor-sheet"
import { useI18n } from "@/lib/i18n"
import { aggregateByCity, cityKey, VISITORS } from "@/lib/mock-data/journeys"

export default function JourneysPage() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const selectedVisitorId = searchParams.get("visitor")

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
  const selectedVisitor = visitors.find((visitor) => visitor.id === selectedVisitorId) ?? null

  function openVisitor(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("visitor", id)
    router.replace(`/journeys?${params.toString()}`, { scroll: false })
  }

  function closeVisitor() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("visitor")
    const next = params.toString()
    router.replace(next ? `/journeys?${next}` : "/journeys", { scroll: false })
  }

  if (!user) return null

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("journeys.title")}
        subtitle={t("journeys.subtitle")}
      />

      <div className="flex flex-col gap-6 p-6">
        <JourneyStats visitors={scoped} place={place} />
        <div className="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <OriginMap visitors={visitors} selectedKey={selectedKey} onSelect={setSelectedKey} />
          <JourneyWorkspace visitors={scoped} place={place} onSelectVisitor={openVisitor} />
        </div>
      </div>

      <VisitorSheet
        visitor={selectedVisitor}
        onOpenChange={(open) => {
          if (!open) closeVisitor()
        }}
      />
    </div>
  )
}
