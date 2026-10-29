"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { POST_TYPE_LABELS } from "@/components/posts/post-card"
import { formatDateBR } from "@/lib/dates"
import { cn } from "@/lib/utils"
import {
  DAY_HEALTH_LABEL,
  SLOT_STATUS_LABEL,
  closestSlotDate,
  dayHealth,
  describeDay,
  resolveStatus,
  todayIso,
  toIso,
  type ContentSlot,
  type DayHealth,
  type SlotStatus,
} from "@/lib/schedule"

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

const HEALTH_BANNER: Record<DayHealth, string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-950",
  atencao: "border-amber-200 bg-amber-50 text-amber-950",
  atraso: "border-red-200 bg-red-50 text-red-950",
}

const HEALTH_DOT: Record<DayHealth, string> = {
  ok: "bg-emerald-500",
  atencao: "bg-amber-500",
  atraso: "bg-red-500",
}

const STATUS_CHIP: Record<SlotStatus, string> = {
  publicado: "bg-emerald-50 text-emerald-800",
  agendado: "bg-zinc-100 text-zinc-700",
  pendente: "bg-amber-50 text-amber-900",
  atrasado: "bg-red-50 text-red-700",
}

function NetworkIcon({ network }: { network: string }) {
  if (network === "instagram") return <SiInstagram size={12} />
  if (network === "tiktok") return <SiTiktok size={12} />
  if (network === "youtube") return <SiYoutube size={12} />
  return null
}

function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1)
  const lead = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - lead)
  return Array.from({ length: 42 }, (_, index) => (
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
  ))
}

function chipLabel(slot: ContentSlot, audience: "brand" | "creator") {
  const format = POST_TYPE_LABELS[slot.format] ?? slot.format
  if (audience === "creator") return format
  return `${slot.creatorName.split(" ")[0]} · ${format}`
}

function titledDate(iso: string) {
  const label = new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function campaignHref(audience: "brand" | "creator", campaignId: string) {
  return audience === "creator" ? `/creator/campaigns/${campaignId}` : `/campaigns/${campaignId}`
}

export function ContentCalendar({
  slots,
  audience = "brand",
  campaignId,
}: {
  slots: ContentSlot[]
  audience?: "brand" | "creator"
  campaignId?: string
}) {
  const today = todayIso()
  const [campaignFilter, setCampaignFilter] = useState("all")
  const [cursor, setCursor] = useState(() => {
    const iso = closestSlotDate(slots, today)
    const [year, month] = iso.split("-").map(Number)
    return { year, month: month - 1 }
  })
  const [selected, setSelected] = useState(() => closestSlotDate(slots, today))

  const activeCampaign = campaignId ?? campaignFilter
  const visibleSlots = useMemo(
    () => slots.filter((slot) => activeCampaign === "all" || slot.campaignId === activeCampaign),
    [slots, activeCampaign],
  )
  const byDate = useMemo(() => {
    const grouped = new Map<string, ContentSlot[]>()
    for (const slot of visibleSlots) {
      const list = grouped.get(slot.date) ?? []
      list.push(slot)
      grouped.set(slot.date, list)
    }
    return grouped
  }, [visibleSlots])

  const campaignOptions = useMemo(() => {
    const names = new Map<string, string>()
    for (const slot of slots) names.set(slot.campaignId, slot.campaignName)
    return [...names.entries()]
  }, [slots])

  const cells = monthCells(cursor.year, cursor.month)
  const monthKey = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}`
  const monthSlots = visibleSlots.filter((slot) => slot.date.startsWith(monthKey))
  const monthDays = new Map<string, ContentSlot[]>()
  for (const slot of monthSlots) {
    const list = monthDays.get(slot.date) ?? []
    list.push(slot)
    monthDays.set(slot.date, list)
  }

  const summary = { ok: 0, atencao: 0, atraso: 0, queue: 0 }
  for (const [date, daySlots] of monthDays) {
    const health = dayHealth(daySlots, date, today)
    if (health) summary[health] += 1
  }
  summary.queue = monthSlots.filter((slot) => {
    const status = resolveStatus(slot, today)
    return status === "agendado" || status === "pendente"
  }).length

  const selectedSlots = byDate.get(selected) ?? []
  const selectedHealth = dayHealth(selectedSlots, selected, today)
  const todaySlots = byDate.get(today) ?? []
  const todayHealth = dayHealth(todaySlots, today, today)
  const overdue = visibleSlots.filter((slot) => slot.date < today && resolveStatus(slot, today) === "atrasado").length
  const bannerHealth = overdue > 0 ? "atraso" : todayHealth
  const monthTitle = new Date(cursor.year, cursor.month, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })
  const monthLabel = monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1)

  function openDay(iso: string) {
    setSelected(iso)
    const [year, month] = iso.split("-").map(Number)
    setCursor({ year, month: month - 1 })
  }

  function moveMonth(delta: number) {
    const next = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: next.getFullYear(), month: next.getMonth() })
  }

  return (
    <div className="space-y-4 @container">
      <div className={cn("rounded-xl border px-4 py-3", bannerHealth ? HEALTH_BANNER[bannerHealth] : "border-zinc-200 bg-white text-zinc-700")}>
        <p className="text-sm font-semibold">
          Hoje{todayHealth ? ` · ${DAY_HEALTH_LABEL[todayHealth]}` : ""}
        </p>
        <p className="mt-0.5 text-xs opacity-80">{describeDay(todaySlots, today, today)}</p>
        {overdue > 0 && (
          <p className="mt-1 text-xs opacity-80">
            {overdue === 1
              ? "1 post de um dia anterior não foi publicado."
              : `${overdue} posts de dias anteriores não foram publicados.`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { key: "ok" as const, label: "Dias em dia", hint: "Programados e publicados" },
          { key: "atencao" as const, label: "Atenção", hint: "Pendentes ou fora do briefing" },
          { key: "atraso" as const, label: "Atraso", hint: "Não publicados no dia" },
          { key: "queue" as const, label: "Na fila", hint: "Ainda vão ao ar neste mês" },
        ].map((item) => (
          <Card key={item.key} className="p-3">
            <p className="text-xs text-zinc-400">{item.label}</p>
            <p className="mt-1 text-xl font-semibold text-zinc-900">{summary[item.key]}</p>
            <p className="mt-0.5 text-[11px] text-zinc-400">{item.hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid items-start gap-4 @4xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => openDay(today)}>Hoje</Button>
            <Button variant="outline" size="icon-sm" aria-label="Mês anterior" onClick={() => moveMonth(-1)}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Próximo mês" onClick={() => moveMonth(1)}>
              <ChevronRight />
            </Button>
            <p className="min-w-36 text-sm font-semibold text-zinc-900">{monthLabel}</p>
            {!campaignId && campaignOptions.length > 1 && (
              <Select value={campaignFilter} onValueChange={(value) => setCampaignFilter(value ?? "all")}>
                <SelectTrigger size="sm" className="ml-auto w-full max-w-64">
                  <SelectValue placeholder="Campanha">
                    {(value) => {
                      if (!value || value === "all") return "Todas as campanhas"
                      return campaignOptions.find(([id]) => id === value)?.[1] ?? "Campanha"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as campanhas</SelectItem>
                  {campaignOptions.map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="mb-3 flex flex-wrap gap-3 text-[11px] text-zinc-500">
            {(Object.keys(DAY_HEALTH_LABEL) as DayHealth[]).map((health) => (
              <span key={health} className="inline-flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", HEALTH_DOT[health])} />
                {DAY_HEALTH_LABEL[health]}
              </span>
            ))}
          </div>

          <div className="grid min-w-0 grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="px-1 py-1 text-center text-[11px] font-medium text-zinc-400">{day}</div>
            ))}
            {cells.map((date) => {
              const iso = toIso(date)
              const inMonth = date.getMonth() === cursor.month
              const daySlots = byDate.get(iso) ?? []
              const health = dayHealth(daySlots, iso, today)
              const preview = daySlots.slice(0, 2)
              const extra = daySlots.length - preview.length
              return (
                <Button
                  key={iso}
                  variant="ghost"
                  onClick={() => openDay(iso)}
                  aria-pressed={selected === iso}
                  aria-label={`${formatDateBR(iso)}. ${health ? DAY_HEALTH_LABEL[health] : "Sem posts"}. ${daySlots.length} conteúdos.`}
                  className={cn(
                    "h-auto min-h-24 w-full min-w-0 flex-col items-stretch justify-start gap-0 whitespace-normal rounded-lg border p-1.5 text-left font-normal",
                    inMonth ? "bg-white hover:bg-white" : "bg-zinc-50 hover:bg-zinc-50",
                    selected === iso ? "border-zinc-900" : "border-transparent hover:border-zinc-200",
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[11px]",
                      iso === today && "bg-zinc-900 font-semibold text-white",
                      iso !== today && (inMonth ? "text-zinc-700" : "text-zinc-300"),
                    )}>
                      {date.getDate()}
                    </span>
                    {health && <span className={cn("size-2 rounded-full", HEALTH_DOT[health])} />}
                  </span>
                  <span className="mt-1 space-y-0.5">
                    {preview.map((slot) => {
                      const status = resolveStatus(slot, today)
                      return (
                        <span
                          key={slot.id}
                          className={cn("block truncate rounded px-1 py-0.5 text-[10px] leading-4", STATUS_CHIP[status])}
                        >
                          {chipLabel(slot, audience)}
                        </span>
                      )
                    })}
                    {extra > 0 && <span className="block px-1 text-[10px] text-zinc-400">+{extra}</span>}
                  </span>
                </Button>
              )
            })}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">{titledDate(selected)}</p>
              <p className="mt-1 text-xs text-zinc-500">{describeDay(selectedSlots, selected, today)}</p>
            </div>
            {selectedHealth && (
              <Badge variant="outline" className={cn("shrink-0", HEALTH_BANNER[selectedHealth])}>
                {DAY_HEALTH_LABEL[selectedHealth]}
              </Badge>
            )}
          </div>

          {selectedSlots.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-400">Nenhum conteúdo programado neste dia.</p>
          ) : (
            <ul className="mt-4 max-h-[32rem] space-y-3 overflow-y-auto">
              {selectedSlots.map((slot) => {
                const status = resolveStatus(slot, today)
                return (
                  <li key={slot.id} className="border-t border-zinc-100 pt-3">
                    <div className="flex items-start gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700">
                        {slot.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-zinc-900">{slot.creatorName}</p>
                          <Badge variant="outline" className={cn("shrink-0", STATUS_CHIP[status])}>
                            {SLOT_STATUS_LABEL[status]}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-zinc-400">{slot.creatorHandle}</p>
                        {campaignId ? (
                          <p className="mt-1 text-[11px] text-zinc-500">{slot.campaignName}</p>
                        ) : (
                          <Link href={campaignHref(audience, slot.campaignId)} className="mt-1 block text-[11px] text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">
                            {slot.campaignName}
                          </Link>
                        )}
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-zinc-600">
                          <NetworkIcon network={slot.network} />
                          {POST_TYPE_LABELS[slot.format] ?? slot.format}
                        </p>
                        {slot.note && <p className="mt-1 text-[11px] leading-4 text-zinc-500">{slot.note}</p>}
                        {status === "publicado" && slot.fit === "ressalva" && (
                          <p className="mt-1 text-[11px] text-amber-700">Publicado com ressalva no briefing.</p>
                        )}
                        {status === "publicado" && slot.fit === "fora" && (
                          <p className="mt-1 text-[11px] text-red-700">Publicado fora do briefing.</p>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
