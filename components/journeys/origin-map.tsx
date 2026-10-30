"use client"

import { useMemo, useState } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BRAZIL_PATHS, BRAZIL_VIEWBOX, projectBrazil } from "@/lib/geo/brazil"
import { useI18n } from "@/lib/i18n"
import { aggregateByCity, formatBrl, type CityAccess, type Visitor } from "@/lib/mock-data/journeys"
import { cn } from "cn"

function accessCopy(t: ReturnType<typeof useI18n>["t"], count: number) {
  return count === 1 ? t("journeys.accessOne", { count }) : t("journeys.accessMany", { count })
}

function purchaseCopy(t: ReturnType<typeof useI18n>["t"], count: number) {
  return count === 1 ? t("journeys.purchaseOne", { count }) : t("journeys.purchaseMany", { count })
}

export function OriginMap({
  visitors,
  selectedKey,
  onSelect,
}: {
  visitors: Visitor[]
  selectedKey: string | null
  onSelect: (key: string | null) => void
}) {
  const { t } = useI18n()
  const cities = useMemo(() => aggregateByCity(visitors), [visitors])
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const maxVisitors = cities[0]?.visitors ?? 1
  const active = cities.find((city) => city.key === (hoverKey ?? selectedKey)) ?? null
  const selected = cities.find((city) => city.key === selectedKey) ?? null

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <MapPin className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("journeys.originTitle")}</h2>
          </div>
        </div>
        {selected ? (
          <Button variant="outline" size="sm" onClick={() => onSelect(null)}>
            {t("journeys.clearPlace")}
            <span className="text-muted-foreground">{selected.city}</span>
          </Button>
        ) : null}
      </div>

      {cities.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-muted-foreground">{t("journeys.originEmpty")}</p>
      ) : (
        <div className="flex flex-col">
          <div className="border-b bg-muted/50">
            <div className="relative mx-auto aspect-[420/460] w-full max-w-[220px]">
              <svg
                viewBox={`0 0 ${BRAZIL_VIEWBOX.width} ${BRAZIL_VIEWBOX.height}`}
                className="absolute inset-0 size-full"
                role="img"
                aria-label={t("journeys.originTitle")}
              >
                {BRAZIL_PATHS.map((d) => (
                  <path
                    key={d.slice(0, 18)}
                    d={d}
                    className="fill-background stroke-border"
                    strokeWidth={1.35}
                    strokeLinejoin="round"
                  />
                ))}
              </svg>

              {cities.map((city) => {
                const point = projectBrazil(city.lat, city.lng)
                const dot = 6 + Math.sqrt(city.visitors / maxVisitors) * 8
                const hit = dot + 10
                const isSelected = city.key === selectedKey
                const isHovered = city.key === hoverKey
                const dimmed = Boolean(selectedKey) && !isSelected && !isHovered
                return (
                  <Button
                    key={city.key}
                    variant="ghost"
                    aria-label={`${city.city}, ${city.state}. ${accessCopy(t, city.visitors)}`}
                    aria-pressed={isSelected}
                    onMouseEnter={() => setHoverKey(city.key)}
                    onMouseLeave={() => setHoverKey((current) => (current === city.key ? null : current))}
                    onFocus={() => setHoverKey(city.key)}
                    onBlur={() => setHoverKey((current) => (current === city.key ? null : current))}
                    onClick={() => onSelect(isSelected ? null : city.key)}
                    className="absolute rounded-full p-0 hover:bg-transparent active:translate-y-0"
                    style={{
                      left: `calc(${point.x * 100}% - ${hit / 2}px)`,
                      top: `calc(${point.y * 100}% - ${hit / 2}px)`,
                      width: hit,
                      height: hit,
                      zIndex: isHovered || isSelected ? 30 : city.visitors,
                    }}
                  >
                    {city.visitors === maxVisitors ? (
                      <span className="absolute inset-1 animate-ping rounded-full bg-foreground/15" />
                    ) : null}
                    <span
                      className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_0_4px_color-mix(in_oklch,var(--foreground)_14%,transparent)] transition-all",
                        (isSelected || isHovered) && "scale-110 shadow-[0_0_0_6px_color-mix(in_oklch,var(--foreground)_24%,transparent)]",
                        dimmed && "opacity-30"
                      )}
                      style={{ width: dot, height: dot }}
                    />
                  </Button>
                )
              })}

              {active ? <CityTip city={active} /> : null}
            </div>
            <p className="px-4 pb-3 text-center text-[11px] text-muted-foreground">{t("journeys.originLegend")}</p>
          </div>

          <div className="flex min-h-0 flex-col">
            <p className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground">{t("journeys.cities")}</p>
            <ScrollArea className="h-48">
              <div className="flex flex-col gap-0.5 px-2 pb-3">
                {cities.map((city, index) => {
                  const isSelected = city.key === selectedKey
                  return (
                    <Button
                      key={city.key}
                      variant={isSelected ? "secondary" : "ghost"}
                      aria-pressed={isSelected}
                      onMouseEnter={() => setHoverKey(city.key)}
                      onMouseLeave={() => setHoverKey((current) => (current === city.key ? null : current))}
                      onClick={() => onSelect(isSelected ? null : city.key)}
                      className="h-auto w-full items-stretch justify-start overflow-hidden px-2 py-2 text-left whitespace-normal"
                    >
                      <span className="w-5 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-sm font-medium text-foreground">
                            {city.city}
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">{city.state}</span>
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {accessCopy(t, city.visitors)}
                          </span>
                        </span>
                        <span className="mt-1.5 flex items-center gap-3">
                          <Progress
                            value={(city.visitors / maxVisitors) * 100}
                            className="min-w-0 flex-1 gap-0"
                          />
                          <span className="w-20 shrink-0 text-right text-xs text-foreground tabular-nums">
                            {city.revenue > 0 ? formatBrl(city.revenue) : "—"}
                          </span>
                        </span>
                      </span>
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </Card>
  )
}

function CityTip({ city }: { city: CityAccess }) {
  const { t } = useI18n()
  const point = projectBrazil(city.lat, city.lng)
  const below = point.y < 0.22
  const left = Math.min(78, Math.max(22, point.x * 100))

  return (
    <div
      className="pointer-events-none absolute z-40 w-44 -translate-x-1/2"
      style={{ left: `${left}%`, top: `${point.y * 100}%` }}
    >
      <div
        className={cn(
          "rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-lg",
          below ? "mt-6" : "-translate-y-[calc(100%+1.5rem)]"
        )}
      >
        <p className="text-sm font-medium">{city.city}</p>
        <p className="text-xs text-muted-foreground">{city.state}</p>
        <p className="mt-1.5 text-xs">{accessCopy(t, city.visitors)}</p>
        <p className="text-xs text-muted-foreground">
          {purchaseCopy(t, city.purchases)}
          {city.revenue > 0 ? ` · ${formatBrl(city.revenue)}` : ""}
        </p>
      </div>
    </div>
  )
}
