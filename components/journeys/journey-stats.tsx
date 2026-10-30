"use client"

import { useI18n } from "@/lib/i18n"
import { formatBrl, type Visitor } from "@/lib/mock-data/journeys"
import { Card } from "@/components/ui/card"

export function JourneyStats({
  visitors,
  place,
}: {
  visitors: Visitor[]
  place?: string | null
}) {
  const { locale, t } = useI18n()
  const numberLocale = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR"

  const touches = visitors.reduce((sum, visitor) => sum + visitor.touches.length, 0)
  const purchases = visitors.reduce((sum, visitor) => sum + visitor.orders.length, 0)
  const revenue = visitors.reduce(
    (sum, visitor) => sum + visitor.orders.reduce((orderSum, order) => orderSum + order.value, 0),
    0
  )
  const customers = visitors.filter((visitor) => visitor.status === "customer").length
  const conversion = visitors.length === 0 ? null : Math.round((customers / visitors.length) * 100)

  const items = [
    { label: t("journeys.kpiVisitors"), value: visitors.length.toLocaleString(numberLocale) },
    { label: t("journeys.kpiTouches"), value: touches.toLocaleString(numberLocale) },
    { label: t("journeys.kpiPurchases"), value: purchases.toLocaleString(numberLocale) },
    { label: t("journeys.kpiRevenue"), value: formatBrl(revenue) },
    { label: t("journeys.kpiConversion"), value: conversion === null ? "—" : `${conversion}%` },
  ]

  return (
    <Card className="gap-0 py-0">
      <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-5">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`bg-card px-4 py-3 ${index === items.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}
          >
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-foreground tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
      {place ? (
        <p className="border-t px-4 py-2 text-xs text-muted-foreground">
          {t("journeys.showingPlace", { place })}
        </p>
      ) : null}
    </Card>
  )
}
