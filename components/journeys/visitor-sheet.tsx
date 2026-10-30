"use client"

import { JourneyTimeline } from "@/components/journeys/journey-timeline"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useI18n } from "@/lib/i18n"
import { visitorDisplayName, type Visitor } from "@/lib/mock-data/journeys"

export function VisitorSheet({
  visitor,
  onOpenChange,
}: {
  visitor: Visitor | null
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useI18n()
  const place = visitor?.location
    ? `${visitor.location.city}, ${visitor.location.state}`
    : null

  return (
    <Sheet open={visitor !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="gap-0 overflow-y-auto p-0">
        {visitor ? (
          <>
            <SheetHeader className="border-b px-5 py-5 pr-14">
              <SheetTitle>{visitorDisplayName(visitor)}</SheetTitle>
              <SheetDescription>
                {place ? `${place} · ${t("journeys.timeline")}` : t("journeys.timeline")}
              </SheetDescription>
            </SheetHeader>
            <div className="p-5">
              <JourneyTimeline visitor={visitor} />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
