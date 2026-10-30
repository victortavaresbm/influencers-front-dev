"use client"

import {
  Eye,
  MousePointerClick,
  PackageCheck,
  ShoppingBag,
  ShoppingCart,
  Tag,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import {
  visitorDisplayName,
  type JourneyEventType,
  type PurchaseRole,
  type Visitor,
} from "@/lib/mock-data/journeys"

const EVENT_ICON: Record<JourneyEventType, React.ElementType> = {
  page_view: Eye,
  view_content: MousePointerClick,
  add_to_cart: ShoppingCart,
  begin_checkout: ShoppingBag,
  purchase: PackageCheck,
}

const EVENT_LABEL: Record<JourneyEventType, string> = {
  page_view: "Visualizou página",
  view_content: "Viu produto",
  add_to_cart: "Adicionou ao carrinho",
  begin_checkout: "Iniciou checkout",
  purchase: "Comprou",
}

const ROLE_COLOR: Record<PurchaseRole, string> = {
  discovery: "bg-blue-100 text-blue-700",
  assist: "bg-amber-100 text-amber-700",
  conversion: "bg-green-100 text-green-700",
}

const ROLE_LABEL: Record<PurchaseRole, string> = {
  discovery: "Descoberta",
  assist: "Assistência",
  conversion: "Conversão",
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function fmtMoney(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function JourneyTimeline({ visitor }: { visitor: Visitor }) {
  const { t } = useI18n()

  const touchMap = new Map(visitor.touches.map((touch) => [touch.id, touch]))

  const allEvents = [
    ...visitor.events.map((e) => ({ kind: "event" as const, at: e.at, data: e })),
    ...visitor.orders.map((o) => ({ kind: "order" as const, at: o.at, data: o })),
  ].sort((a, b) => a.at.localeCompare(b.at))

  return (
    <div className="space-y-6">
      {/* header */}
      <Card className="gap-0 py-0">
        <div className={`grid grid-cols-2 divide-x ${visitor.location ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
          {visitor.location ? (
            <div className="px-4 py-3">
              <p className="text-xs text-zinc-500">{t("journeys.colLocation")}</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-900">
                {visitor.location.city}, {visitor.location.state}
              </p>
            </div>
          ) : null}
          <div className="px-4 py-3">
            <p className="text-xs text-zinc-500">{t("journeys.firstSeen")}</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900">{fmtDate(visitor.firstSeenAt)}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-zinc-500">{t("journeys.lastSeen")}</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900">{fmtDate(visitor.lastSeenAt)}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-zinc-500">{t("journeys.touches")}</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900">
              {visitor.touches.length === 1
                ? t("journeys.touchCount", { count: 1 })
                : t("journeys.touchCountMany", { count: visitor.touches.length })}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-zinc-500">Status</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900">
              {visitor.status === "visitor" && t("journeys.statusVisitor")}
              {visitor.status === "cart" && t("journeys.statusCart")}
              {visitor.status === "checkout" && t("journeys.statusCheckout")}
              {visitor.status === "customer" && t("journeys.statusCustomer")}
              {visitor.status === "abandoned" && t("journeys.statusAbandoned")}
            </p>
          </div>
        </div>
      </Card>

      {/* touches */}
      {visitor.touches.length > 0 ? (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {t("journeys.touches")}
          </h3>
          <div className="flex flex-wrap gap-3">
            {visitor.touches.map((touch, idx) => (
              <div
                key={touch.id}
                className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-xs"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-600">
                      {touch.creatorAvatar}
                    </span>
                    <p className="text-sm font-semibold text-zinc-900">{touch.creatorName}</p>
                    <p className="text-xs text-zinc-400">{touch.creatorHandle}</p>
                  </div>
                  {touch.campaignName ? (
                    <p className="mt-0.5 text-xs text-zinc-500">{touch.campaignName}</p>
                  ) : null}
                  <p className="mt-0.5 text-xs text-zinc-400">{fmtDate(touch.at)}</p>
                  {touch.referrer ? (
                    <p className="mt-0.5 text-xs text-zinc-400">{t("journeys.via", { source: touch.referrer })}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* timeline */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {t("journeys.timeline")}
        </h3>
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-[19px] w-px bg-zinc-200" />
          <div className="space-y-2">
            {allEvents.map((item, idx) => {
              if (item.kind === "event") {
                const ev = item.data
                const Icon = EVENT_ICON[ev.type]
                const touch = ev.touchId ? touchMap.get(ev.touchId) : undefined
                const isPurchase = ev.type === "purchase"
                return (
                  <div key={ev.id} className="flex items-start gap-4 pl-0">
                    <span
                      className={`relative flex size-10 shrink-0 items-center justify-center rounded-full border-2 ${
                        isPurchase
                          ? "border-green-500 bg-green-50 text-green-600"
                          : ev.type === "begin_checkout"
                          ? "border-amber-400 bg-amber-50 text-amber-600"
                          : "border-zinc-200 bg-white text-zinc-500"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 rounded-lg border border-zinc-100 bg-white px-3 py-2 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium ${isPurchase ? "text-green-700" : "text-zinc-900"}`}>
                          {EVENT_LABEL[ev.type]}
                          {ev.productName ? ` · ${ev.productName}` : ""}
                        </p>
                        {ev.value ? (
                          <p className="shrink-0 text-xs font-semibold tabular-nums text-zinc-700">
                            {fmtMoney(ev.value)}
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p className="text-xs text-zinc-400">{fmtDate(ev.at)}</p>
                        {touch ? (
                          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600">
                            {touch.creatorHandle}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              }

              // order
              const order = item.data
              return (
                <div key={order.id} className="flex items-start gap-4 pl-0">
                  <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-green-600 bg-green-600 text-white">
                    <Tag className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-green-800">
                        Pedido {order.externalId}
                        {order.couponCode ? ` · cupom ${order.couponCode}` : ""}
                      </p>
                      <p className="shrink-0 text-sm font-bold tabular-nums text-green-800">
                        {fmtMoney(order.value)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-green-600">{fmtDate(order.at)}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {order.roles.map((role) => (
                        <span
                          key={`${role.creatorId}-${role.role}`}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[role.role]}`}
                        >
                          <span className="flex size-4 items-center justify-center rounded-full bg-white/60 text-[10px] font-bold">
                            {role.creatorAvatar}
                          </span>
                          {role.creatorName} · {ROLE_LABEL[role.role]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
