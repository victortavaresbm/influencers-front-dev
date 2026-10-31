"use client"
import { useState } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { useAuthStore } from "@/lib/stores/auth"
import { PAYMENT_ORDERS, FINANCIAL_SUMMARY, type PaymentStatus } from "@/lib/mock-data/financial"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PeriodFilter } from "@/components/ui/period-filter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, CircleDot, DollarSign, TrendingUp, Clock, CheckCircle, Download } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { formatDateBR } from "@/lib/dates"
import { ALL_PERIOD, dateInPeriod, type PeriodValue } from "@/lib/period"

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  pago: "Pago",
  cancelado: "Cancelado",
}

const STATUS_COLORS: Record<PaymentStatus, string> = {
  pendente: "bg-yellow-50 text-yellow-700",
  aprovado: "bg-blue-50 text-blue-700",
  pago: "bg-green-50 text-green-700",
  cancelado: "bg-red-50 text-red-700",
}

type StatusFilter = "all" | "pendente" | "aprovado" | "pago"

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pendente", label: "Pendentes" },
  { key: "aprovado", label: "Aprovadas" },
  { key: "pago", label: "Pagas" },
]

export default function FinancialPage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const [period, setPeriod] = useState<PeriodValue>(ALL_PERIOD)
  const [status, setStatus] = useState<StatusFilter>("all")
  const orders = PAYMENT_ORDERS.filter((p) => p.organizationId === user?.organizationId)
    .filter((order) => dateInPeriod(order.dueDate, period))
  const summary = FINANCIAL_SUMMARY[user?.organizationId as keyof typeof FINANCIAL_SUMMARY]
  const statusOptions = STATUS_OPTIONS.map((option) => ({
    ...option,
    count: option.key === "all" ? orders.length : orders.filter((order) => order.status === option.key).length,
  }))
  const statusLabel = statusOptions.find((option) => option.key === status)?.label ?? "Status"
  const items = orders.filter((order) => status === "all" || order.status === status)

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title={t("pages.financial")}
        subtitle={t("pages.financialSub")}
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={14} /> Exportar
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total contratado", value: `R$ ${summary.totalContracted.toLocaleString("pt-BR")}`, icon: DollarSign },
              { label: "Total pago", value: `R$ ${summary.totalPaid.toLocaleString("pt-BR")}`, icon: CheckCircle },
              { label: "Pendente", value: `R$ ${summary.totalPending.toLocaleString("pt-BR")}`, icon: Clock },
              { label: "Receita gerada", value: `R$ ${summary.totalRevenue.toLocaleString("pt-BR")}`, icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-zinc-400">{label}</p>
                  <Icon size={14} className="text-zinc-300" />
                </div>
                <p className="text-xl font-semibold text-zinc-900">{value}</p>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="px-3 font-normal"
                  aria-pressed={status !== "all"}
                  aria-label="Status da ordem"
                />
              }
            >
              <CircleDot data-icon="inline-start" />
              {status === "all" ? "Status" : statusLabel}
              <ChevronDown data-icon="inline-end" className="text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-52">
              <DropdownMenuRadioGroup value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
                {statusOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.key} value={option.key}>
                    <span className="flex w-full items-center justify-between gap-6">
                      {option.label}
                      <span className="text-xs tabular-nums text-muted-foreground">{option.count}</span>
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        <div>
          {items.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
              {period.preset === "all" ? "Nenhuma ordem nesta categoria." : "Nenhuma ordem neste período."}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {["Creator", "Campanha", "Descrição", "Valor", "Vencimento", "NF", "Status", "Ações"].map((h) => (
                      <th key={h} className="py-2.5 px-4 text-xs font-medium text-zinc-500 bg-zinc-50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((order) => (
                    <tr key={order.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700">
                            {order.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{order.creatorName}</p>
                            <p className="text-xs text-zinc-400">{order.creatorHandle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-zinc-500 max-w-[140px]">
                        <span className="line-clamp-2">{order.campaignName}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-700 max-w-[160px]">
                        <span className="line-clamp-1">{order.description}</span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-zinc-900">
                        R$ {order.amount.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-600">{formatDateBR(order.dueDate)}</td>
                      <td className="py-3 px-4">
                        {order.invoice ? (
                          <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded font-mono">{order.invoice}</code>
                        ) : (
                          <span className="text-zinc-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {order.status === "aprovado" && (
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            Marcar pago
                          </Button>
                        )}
                        {order.status === "pendente" && (
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            Aprovar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
