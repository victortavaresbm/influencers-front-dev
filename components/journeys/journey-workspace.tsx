"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PanoramaTable } from "@/components/journeys/panorama-table"
import { VisitorTable } from "@/components/journeys/visitor-table"
import { useI18n } from "@/lib/i18n"
import type { Visitor } from "@/lib/mock-data/journeys"

type WorkspaceTab = "visitors" | "panorama"

export function JourneyWorkspace({
  visitors,
  place,
  onSelectVisitor,
}: {
  visitors: Visitor[]
  place?: string | null
  onSelectVisitor: (id: string) => void
}) {
  const { t } = useI18n()
  const [tab, setTab] = useState<WorkspaceTab>("visitors")

  return (
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      <div className="border-b px-4 py-3">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value === "panorama" ? "panorama" : "visitors")}
        >
          <TabsList>
            <TabsTrigger value="visitors">{t("journeys.visitorList")}</TabsTrigger>
            <TabsTrigger value="panorama">{t("journeys.panorama")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {tab === "visitors" ? (
        <VisitorTable visitors={visitors} place={place} onSelect={onSelectVisitor} />
      ) : (
        <PanoramaTable visitors={visitors} place={place} />
      )}
    </Card>
  )
}
