"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { useAuthStore } from "@/lib/stores/auth"
import { CREATORS } from "@/lib/mock-data/creators"
import { CAMPAIGNS } from "@/lib/mock-data/campaigns"
import { PAYMENT_ORDERS, type PaymentStatus } from "@/lib/mock-data/financial"
import { useCreatorPayoutStore, type PixType, type PayoutAccount } from "@/lib/stores/creator-payout"
import { useCreatorSalesStore } from "@/lib/stores/creator-sales"
import { formatDateBR } from "@/lib/dates"
import { useI18n } from "@/lib/i18n"
import { toast } from "@/components/ui/toast"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, BarChart, DonutChart, type CustomTooltipProps } from "@tremor/react"
import { Paperclip, Wallet } from "lucide-react"

type Section = "overview" | "sales" | "payments" | "payout"

const SECTIONS: { id: Section; label: string }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "sales", label: "Vendas" },
  { id: "payments", label: "Recebimentos" },
  { id: "payout", label: "Dados de recebimento" },
]

const PIX_TYPES: { value: PixType; label: string }[] = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "E-mail" },
  { value: "phone", label: "Celular" },
  { value: "random", label: "Chave aleatória" },
]

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; className: string }> = {
  pendente: { label: "A receber", className: "bg-amber-100 text-amber-800" },
  aprovado: { label: "Aprovado", className: "bg-sky-50 text-sky-800" },
  pago: { label: "Recebido", className: "bg-emerald-50 text-emerald-700" },
  cancelado: { label: "Cancelado", className: "bg-red-50 text-red-700" },
}

const PROCESSING_STATUS = { label: "Em processamento", className: "bg-violet-100 text-violet-700" }

const SLICE_COLOR: Record<string, string> = {
  Recebido: "emerald",
  "A receber": "amber",
  "Em processamento": "violet",
}

const SLICE_DOT: Record<string, string> = {
  Recebido: "bg-emerald-500",
  "A receber": "bg-amber-500",
  "Em processamento": "bg-violet-500",
}

const chartClass =
  "h-56 text-xs [&_.recharts-cartesian-axis-tick_text]:fill-zinc-700 dark:[&_.recharts-cartesian-axis-tick_text]:fill-zinc-100 [&_.recharts-tooltip-cursor]:!fill-transparent"

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

function maskKey(value: string) {
  if (value.length <= 4) return value
  return `•••• ${value.slice(-4)}`
}

function monthBucket(iso?: string) {
  if (!iso) return null
  const [year, month] = iso.split("-")
  const index = Number(month) - 1
  if (!year || index < 0 || index > 11) return null
  return { key: `${year}-${month}`, label: `${MONTHS[index]} ${year.slice(2)}` }
}

function RequiredMark() {
  return (
    <>
      <span className="text-red-600" aria-hidden="true">*</span>
      <span className="sr-only">obrigatório</span>
    </>
  )
}

function MoneyTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-zinc-700">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((item) => {
          const value = typeof item.value === "number" ? item.value : Number(item.value)
          if (!Number.isFinite(value)) return null
          const name = String(item.name ?? item.dataKey ?? "")
          return (
            <div key={name} className="flex items-center justify-between gap-6">
              <span className="text-xs text-zinc-600">{name}</span>
              <span className="text-xs font-semibold tabular-nums text-zinc-900">{money(value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function emptyDraft(holder: string): PayoutAccount {
  return { pixType: "cpf", pixKey: "", holder, document: "" }
}

export default function CreatorFinancialPage() {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const creator = CREATORS.find((item) => item.email === user?.email) ?? CREATORS[0]
  const account = useCreatorPayoutStore((state) => state.accounts[creator.id])
  const withdrawals = useCreatorPayoutStore((state) => state.withdrawals)
  const saveAccount = useCreatorPayoutStore((state) => state.saveAccount)
  const requestWithdrawal = useCreatorPayoutStore((state) => state.requestWithdrawal)

  const [section, setSection] = useState<Section>("overview")
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<PayoutAccount>(() => emptyDraft(creator.name))
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [invoiceName, setInvoiceName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const commissionRate = creator.totalSales ? (creator.totalCommission ?? 0) / creator.totalSales : 0
  const sales = CAMPAIGNS.flatMap((campaign) => {
    const participant = campaign.participants.find((item) => item.creatorId === creator.id)
    if (!participant || ((participant.revenue ?? 0) <= 0 && (participant.orders ?? 0) <= 0)) return []
    const revenue = participant.revenue ?? 0
    return [{
      id: campaign.id,
      campaign: campaign.name,
      brand: campaign.organizationName,
      orders: participant.orders ?? 0,
      revenue,
      commission: Math.round(revenue * commissionRate),
      coupon: participant.couponCode,
      date: participant.lastPost,
    }]
  }).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
  const liveSales = useCreatorSalesStore((state) => state.sales).filter((sale) => sale.creatorId === creator.id)
  const salesWithLive = sales.map((item) => {
    const extra = liveSales.filter((sale) => sale.campaignId === item.id)
    if (extra.length === 0) return item
    return {
      ...item,
      orders: item.orders + extra.length,
      revenue: item.revenue + extra.reduce((sum, sale) => sum + sale.revenue, 0),
      commission: item.commission + extra.reduce((sum, sale) => sum + sale.commission, 0),
    }
  })

  const requests = withdrawals.filter((item) => item.creatorId === creator.id)
  const processingIds = new Set(requests.flatMap((item) => item.paymentIds))
  const payments = PAYMENT_ORDERS
    .filter((order) => order.creatorId === creator.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const available = payments.filter(
    (order) => (order.status === "pendente" || order.status === "aprovado") && !processingIds.has(order.id)
  )

  const salesTotal = salesWithLive.reduce((sum, item) => sum + item.revenue, 0)
  const commissionTotal = salesWithLive.reduce((sum, item) => sum + item.commission, 0)
  const received = payments.filter((order) => order.status === "pago").reduce((sum, order) => sum + order.amount, 0)
  const incoming = available.reduce((sum, order) => sum + order.amount, 0)
  const processing = payments
    .filter((order) => processingIds.has(order.id))
    .reduce((sum, order) => sum + order.amount, 0)

  const monthly = [...sales.reduce((map, item) => {
    const bucket = monthBucket(item.date)
    if (!bucket) return map
    const current = map.get(bucket.key) ?? { key: bucket.key, Mês: bucket.label, Vendas: 0, Comissão: 0 }
    current.Vendas += item.revenue
    current.Comissão += item.commission
    map.set(bucket.key, current)
    return map
  }, new Map<string, { key: string; Mês: string; Vendas: number; Comissão: number }>()).values()]
  for (const sale of liveSales) {
    const bucket = monthBucket(sale.at.slice(0, 10))
    if (!bucket) continue
    const current = monthly.find((item) => item.key === bucket.key)
    if (current) {
      current.Vendas += sale.revenue
      current.Comissão += sale.commission
    } else {
      monthly.push({ key: bucket.key, Mês: bucket.label, Vendas: sale.revenue, Comissão: sale.commission })
    }
  }
  monthly.sort((a, b) => a.key.localeCompare(b.key))

  const byBrand = [...salesWithLive.reduce((map, item) => {
    const current = map.get(item.brand) ?? { Marca: item.brand, Vendas: 0, Comissão: 0 }
    current.Vendas += item.revenue
    current.Comissão += item.commission
    map.set(item.brand, current)
    return map
  }, new Map<string, { Marca: string; Vendas: number; Comissão: number }>()).values()]

  const slices = [
    { name: "Recebido", value: received },
    { name: "A receber", value: incoming },
    { name: "Em processamento", value: processing },
  ].filter((item) => item.value > 0)

  const payoutReady = Boolean(draft.pixKey.trim() && draft.holder.trim() && draft.document.trim())
  const showPayoutForm = !account || editing

  useEffect(() => {
    if (withdrawOpen) setInvoiceName(null)
  }, [withdrawOpen])

  const openWithdraw = () => {
    if (!account || available.length === 0) return
    setSection("payments")
    setWithdrawOpen(true)
  }

  const savePayout = (event: FormEvent) => {
    event.preventDefault()
    if (!payoutReady) return
    saveAccount(creator.id, {
      pixType: draft.pixType,
      pixKey: draft.pixKey.trim(),
      holder: draft.holder.trim(),
      document: draft.document.trim(),
    })
    setEditing(false)
    toast.add({
      type: "success",
      title: "PIX salvo",
      description: "Os próximos repasses saem para essa chave.",
    })
  }

  const submitWithdraw = (event: FormEvent) => {
    event.preventDefault()
    if (!account || !invoiceName || available.length === 0) return
    requestWithdrawal({
      id: `wd-${Date.now()}`,
      creatorId: creator.id,
      paymentIds: available.map((order) => order.id),
      amount: incoming,
      invoiceName,
      requestedAt: new Date().toISOString().slice(0, 10),
    })
    toast.add({
      type: "success",
      title: "Saque solicitado",
      description: "A nota fiscal entrou em processamento e o valor segue para o PIX cadastrado.",
    })
    setWithdrawOpen(false)
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("pages.financial")}
        subtitle="Vendas, comissão e o PIX para receber"
        actions={
          account ? (
            <Button type="button" size="sm" disabled={available.length === 0} onClick={openWithdraw}>
              <Wallet data-icon="inline-start" />
              Solicitar saque
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={() => setSection("payout")}>
              Informar PIX
            </Button>
          )
        }
      />

      <div className="w-full p-6 xl:px-[200px]">
        <Tabs
          value={section}
          onValueChange={(value) => {
            if (value === "overview" || value === "sales" || value === "payments" || value === "payout") {
              setSection(value)
            }
          }}
        >
          <TabsList>
            {SECTIONS.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: "Vendas rastreadas", value: money(salesTotal) },
                  { label: "Comissão", value: money(commissionTotal) },
                  { label: "Recebido", value: money(received) },
                  { label: "A receber", value: money(incoming) },
                ].map((item) => (
                  <Card key={item.label} className="p-4">
                    <p className="text-xl font-semibold text-zinc-900">{item.value}</p>
                    <p className="mt-0.5 text-xs text-zinc-600">{item.label}</p>
                  </Card>
                ))}
              </div>

              {liveSales.length > 0 && (
                <Card className="p-4">
                  <h2 className="text-sm font-semibold text-zinc-900">Vendas chegando</h2>
                  <p className="mt-1 text-xs text-zinc-600">Uma nova venda entra a cada 30 segundos, com o cupom e a comissão.</p>
                  <ul className="mt-3 divide-y divide-zinc-200">
                    {liveSales.slice(0, 5).map((sale) => (
                      <li key={sale.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-900">{sale.product}</p>
                          <p className="text-xs text-zinc-600">
                            {sale.brand} · cupom <span className="font-mono font-medium text-zinc-900">{sale.coupon}</span>
                          </p>
                        </div>
                        <p className="shrink-0 text-base font-semibold tabular-nums text-emerald-700">{money(sale.commission)}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card className="p-4">
                <p className="text-sm font-semibold text-zinc-900">Para onde o dinheiro vai</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {account
                    ? `Repasse no PIX ${PIX_TYPES.find((item) => item.value === account.pixType)?.label ?? "PIX"} ${maskKey(account.pixKey)}, titular ${account.holder}.`
                    : "Cadastre o PIX em Dados de recebimento. Sem a chave, o saque não é liberado."}
                  {processing > 0 ? ` ${money(processing)} está em processamento com nota fiscal.` : ""}
                </p>
              </Card>

              <div className="grid gap-4 lg:grid-cols-5">
                <Card className="p-4 lg:col-span-3">
                  <h2 className="text-sm font-semibold text-zinc-900">Vendas e comissão</h2>
                  <p className="mt-1 text-xs text-zinc-600">Por mês, com a taxa desta conta{commissionRate > 0 ? ` (${Math.round(commissionRate * 100)}%)` : ""}.</p>
                  <span className="hidden fill-emerald-500 fill-sky-500 stroke-emerald-500 stroke-sky-500 text-emerald-500 text-sky-500 fill-amber-500 fill-violet-500 text-amber-500 text-violet-500" />
                  {monthly.length === 0 ? (
                    <p className="py-16 text-center text-sm text-zinc-600">Nenhuma venda rastreada ainda.</p>
                  ) : (
                    <AreaChart
                      className={`mt-4 ${chartClass}`}
                      data={monthly}
                      index="Mês"
                      categories={["Vendas", "Comissão"]}
                      colors={["emerald", "sky"]}
                      valueFormatter={(value) => money(value)}
                      showLegend
                      showGridLines={false}
                      yAxisWidth={72}
                      customTooltip={MoneyTooltip}
                    />
                  )}
                </Card>

                <Card className="p-4 lg:col-span-2">
                  <h2 className="text-sm font-semibold text-zinc-900">Recebimentos</h2>
                  <p className="mt-1 text-xs text-zinc-600">O que já entrou, o que dá para sacar e o que está na nota.</p>
                  {slices.length === 0 ? (
                    <p className="py-16 text-center text-sm text-zinc-600">Nenhum valor para receber.</p>
                  ) : (
                    <>
                      <DonutChart
                        className="mt-4 h-44"
                        data={slices}
                        category="value"
                        index="name"
                        colors={slices.map((item) => SLICE_COLOR[item.name] ?? "zinc")}
                        valueFormatter={(value) => money(value)}
                        showLabel={false}
                        customTooltip={MoneyTooltip}
                      />
                      <ul className="mt-4 space-y-2">
                        {slices.map((item) => (
                          <li key={item.name} className="flex items-center justify-between gap-3 text-xs">
                            <span className="flex items-center gap-2 text-zinc-700">
                              <span className={`h-2 w-2 rounded-full ${SLICE_DOT[item.name] ?? "bg-zinc-400"}`} />
                              {item.name}
                            </span>
                            <span className="font-medium tabular-nums text-zinc-900">{money(item.value)}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </Card>
              </div>

              <Card className="p-4">
                <h2 className="text-sm font-semibold text-zinc-900">Por marca</h2>
                <p className="mt-1 text-xs text-zinc-600">Vendas rastreadas ao lado da comissão de cada parceria.</p>
                {byBrand.length === 0 ? (
                  <p className="py-12 text-center text-sm text-zinc-600">Nenhuma campanha com venda.</p>
                ) : (
                  <BarChart
                    className={`mt-4 ${chartClass}`}
                    data={byBrand}
                    index="Marca"
                    categories={["Vendas", "Comissão"]}
                    colors={["emerald", "sky"]}
                    valueFormatter={(value) => money(value)}
                    showLegend
                    showGridLines={false}
                    yAxisWidth={72}
                    customTooltip={MoneyTooltip}
                  />
                )}
              </Card>
          </TabsContent>

          <TabsContent value="sales" className="mt-4">
            <Card className="gap-0 p-0">
              <div className="px-4 py-4">
                <h2 className="text-sm font-semibold text-zinc-900">Histórico de vendas</h2>
                <p className="mt-1 text-xs text-zinc-600">
                  Campanhas com pedido rastreado. A comissão usa a taxa desta conta
                  {commissionRate > 0 ? ` (${Math.round(commissionRate * 100)}%)` : ""}.
                </p>
              </div>
              {salesWithLive.length === 0 ? (
                <p className="border-t border-zinc-200 px-4 py-8 text-center text-sm text-zinc-600">
                  Nenhuma venda rastreada ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead>Vendas</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Cupom</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesWithLive.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-zinc-900">{item.campaign}</TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell>{item.orders}</TableCell>
                        <TableCell>{money(item.revenue)}</TableCell>
                        <TableCell>{money(item.commission)}</TableCell>
                        <TableCell>{item.coupon ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-4 space-y-4">
              {requests.length > 0 && (
                <Card className="gap-0 p-0">
                  <div className="px-4 py-4">
                    <h2 className="text-sm font-semibold text-zinc-900">Saques solicitados</h2>
                    <p className="mt-1 text-xs text-zinc-600">Cada pedido leva a nota fiscal anexada e espera o processamento.</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Nota fiscal</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{formatDateBR(item.requestedAt)}</TableCell>
                          <TableCell className="font-medium text-zinc-900">{money(item.amount)}</TableCell>
                          <TableCell>{item.invoiceName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={PROCESSING_STATUS.className}>{PROCESSING_STATUS.label}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}

              <Card className="gap-0 p-0">
                <div className="px-4 py-4">
                  <h2 className="text-sm font-semibold text-zinc-900">Pagamentos e recebimentos</h2>
                  <p className="mt-1 text-xs text-zinc-600">
                    {account
                      ? `${money(incoming)} disponível para saque. O pedido exige a nota fiscal.`
                      : "Informe o PIX antes de solicitar o saque dos valores a receber."}
                  </p>
                </div>
                {payments.length === 0 ? (
                  <p className="border-t border-zinc-200 px-4 py-8 text-center text-sm text-zinc-600">
                    Nenhum pagamento registrado.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Recebido em</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((order) => {
                        const status = processingIds.has(order.id) ? PROCESSING_STATUS : PAYMENT_STATUS[order.status]
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium text-zinc-900">{order.description}</TableCell>
                            <TableCell>{order.campaignName}</TableCell>
                            <TableCell>{money(order.amount)}</TableCell>
                            <TableCell>{formatDateBR(order.dueDate)}</TableCell>
                            <TableCell>{order.paidAt ? formatDateBR(order.paidAt) : "—"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={status.className}>{status.label}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </Card>
          </TabsContent>

          <TabsContent value="payout" className="mt-4">
            <Card className="p-5">
              {showPayoutForm ? (
                <form className="space-y-4" onSubmit={savePayout}>
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900">Dados para recebimento</h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      O creator e o afiliado informam o PIX para o dinheiro ser enviado. O saque só segue depois disso.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="gap-1">
                        Tipo da chave
                        <RequiredMark />
                      </Label>
                      <Select
                        value={draft.pixType}
                        onValueChange={(value) => {
                          if (value === "cpf" || value === "cnpj" || value === "email" || value === "phone" || value === "random") {
                            setDraft((current) => ({ ...current, pixType: value }))
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value) => PIX_TYPES.find((item) => item.value === value)?.label ?? "CPF"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {PIX_TYPES.map((item) => (
                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="gap-1" htmlFor="pix-key">
                        Chave PIX
                        <RequiredMark />
                      </Label>
                      <Input
                        id="pix-key"
                        value={draft.pixKey}
                        onChange={(event) => setDraft((current) => ({ ...current, pixKey: event.target.value }))}
                        placeholder="A chave que recebe o repasse"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="gap-1" htmlFor="pix-holder">
                        Titular
                        <RequiredMark />
                      </Label>
                      <Input
                        id="pix-holder"
                        value={draft.holder}
                        onChange={(event) => setDraft((current) => ({ ...current, holder: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="gap-1" htmlFor="pix-document">
                        CPF ou CNPJ
                        <RequiredMark />
                      </Label>
                      <Input
                        id="pix-document"
                        value={draft.document}
                        onChange={(event) => setDraft((current) => ({ ...current, document: event.target.value }))}
                        placeholder="Documento do titular"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    {account && (
                      <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                        Cancelar
                      </Button>
                    )}
                    <Button type="submit" disabled={!payoutReady}>Salvar</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">PIX cadastrado</h2>
                      <p className="mt-1 text-sm text-zinc-600">O saque dos valores a receber usa essa chave.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDraft(account)
                        setEditing(true)
                      }}
                    >
                      Alterar
                    </Button>
                  </div>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Tipo", PIX_TYPES.find((item) => item.value === account.pixType)?.label ?? "PIX"],
                      ["Chave", account.pixKey],
                      ["Titular", account.holder],
                      ["Documento", account.document],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-zinc-600">{label}</dt>
                        <dd className="text-sm font-medium text-zinc-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <SheetContent className="gap-0 p-0">
          <form className="flex h-full flex-col" onSubmit={submitWithdraw}>
            <SheetHeader className="border-b pr-14">
              <SheetTitle className="text-xl">Solicitar saque</SheetTitle>
              <SheetDescription>
                Anexe a nota fiscal para o pagamento de {money(incoming)} ser processado no PIX cadastrado.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="rounded-xl border border-zinc-200 p-4">
                <p className="text-xs text-zinc-600">Valor do saque</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">{money(incoming)}</p>
                {account && (
                  <p className="mt-2 text-sm text-zinc-600">
                    Destino: PIX {PIX_TYPES.find((item) => item.value === account.pixType)?.label} {maskKey(account.pixKey)} · {account.holder}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-900">Parcelas incluídas</p>
                <ul className="space-y-2">
                  {available.map((order) => (
                    <li key={order.id} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-zinc-700">{order.description}</span>
                      <span className="shrink-0 font-medium tabular-nums text-zinc-900">{money(order.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1.5">
                <Label className="gap-1">
                  Nota fiscal
                  <RequiredMark />
                </Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.xml,image/png,image/jpeg"
                  className="sr-only"
                  onChange={(event) => setInvoiceName(event.target.files?.[0]?.name ?? null)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                    <Paperclip data-icon="inline-start" />
                    {invoiceName ? "Trocar arquivo" : "Anexar nota fiscal"}
                  </Button>
                  <span className="text-sm text-zinc-600">{invoiceName ?? "PDF, XML ou imagem"}</span>
                </div>
              </div>
            </div>
            <SheetFooter className="flex-row justify-end border-t">
              <Button type="button" variant="outline" onClick={() => setWithdrawOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!invoiceName}>
                Solicitar saque
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
