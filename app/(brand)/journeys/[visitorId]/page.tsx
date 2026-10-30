"use client"

import Link from "next/link"
import { use } from "react"
import { ArrowLeft } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { JourneyTimeline } from "@/components/journeys/journey-timeline"
import { useI18n } from "@/lib/i18n"
import { VISITORS, visitorDisplayName } from "@/lib/mock-data/journeys"

export default function JourneyDetailPage({ params }: { params: Promise<{ visitorId: string }> }) {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const { visitorId } = use(params)

  if (!user) return null

  const visitor = VISITORS.find((v) => v.id === visitorId && v.organizationId === user.organizationId)

  const leading = (
    <Link href="/journeys">
      <Button variant="outline" size="sm">
        <ArrowLeft />
        {t("journeys.back")}
      </Button>
    </Link>
  )

  if (!visitor) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar
          title="Visitante não encontrado"
          subtitle="Escolha um visitante na lista de Jornadas."
          leading={leading}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={visitorDisplayName(visitor)}
        subtitle={
          visitor.location
            ? `${visitor.location.city}, ${visitor.location.state} · ${t("journeys.timeline")}`
            : t("journeys.timeline")
        }
        leading={leading}
      />
      <div className="p-6">
        <JourneyTimeline visitor={visitor} />
      </div>
    </div>
  )
}
