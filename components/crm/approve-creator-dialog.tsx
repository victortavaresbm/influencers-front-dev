"use client"

import { useEffect, useState } from "react"
import { CircleHelp, Clock, ExternalLink, Info, RefreshCw } from "lucide-react"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { CreatorContact } from "@/components/creators/creator-contact"
import { formatDateBR } from "@/lib/dates"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/toast"
import type { Creator } from "@/lib/mock-data/creators"
import { MOCK_USERS } from "@/lib/mock-data/users"

const VOUCHER_PRICES = [
  { id: "frete", label: "Frete grátis" },
  { id: "dez", label: "10% na primeira compra" },
  { id: "trinta", label: "R$ 30 de desconto" },
]

type CouponMode = "automatico" | "personalizado" | "vincular" | "nao_criar"
type CommissionMode = "padrao" | "personalizada" | "nenhuma"
type NoticeMode = "nao" | "padrao" | "personalizado"

export function ApproveCreatorDialog({
  open,
  creators,
  organizationId,
  onOpenChange,
  onApprove,
}: {
  open: boolean
  creators: Creator[]
  organizationId?: string
  onOpenChange: (open: boolean) => void
  onApprove: (ids: string[]) => void
}) {
  const managers = MOCK_USERS.filter((user) => user.role === "brand" && user.organizationId === organizationId)
  const [managerId, setManagerId] = useState("")
  const [couponMode, setCouponMode] = useState<CouponMode>("vincular")
  const [couponCode, setCouponCode] = useState("")
  const [commissionMode, setCommissionMode] = useState<CommissionMode>("padrao")
  const [commission, setCommission] = useState("")
  const [voucher, setVoucher] = useState<"nao" | "sim">("sim")
  const [voucherPrice, setVoucherPrice] = useState("")
  const [notice, setNotice] = useState<NoticeMode>("nao")
  const [noticeMessage, setNoticeMessage] = useState("")
  const [summaryId, setSummaryId] = useState("")

  useEffect(() => {
    if (!open) return
    setManagerId("")
    setCouponMode("vincular")
    setCouponCode("")
    setCommissionMode("padrao")
    setCommission("")
    setVoucher("sim")
    setVoucherPrice("")
    setNotice("nao")
    setNoticeMessage("")
    setSummaryId(creators[0]?.id ?? "")
  }, [open])

  const needsCode = couponMode === "vincular" || couponMode === "personalizado"
  const ready =
    creators.length > 0 &&
    managerId !== "" &&
    (!needsCode || couponCode.trim() !== "") &&
    (couponMode === "nao_criar" || commissionMode !== "personalizada" || commission.trim() !== "") &&
    (voucher === "nao" || voucherPrice !== "") &&
    (notice !== "personalizado" || noticeMessage.trim() !== "")

  const countLabel =
    creators.length === 1
      ? `${creators[0].name} · ${creators[0].handle}`
      : `${creators.length} creators selecionados`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0">
        <form
          className="flex h-full min-h-0 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            if (!ready) return
            onApprove(creators.map((creator) => creator.id))
          }}
        >
          <SheetHeader className="border-b px-5 py-5 pr-14">
            <SheetTitle className="text-xl">Solicitação de Creator</SheetTitle>
            <SheetDescription>{creators.length > 0 ? countLabel : "Nenhum creator selecionado."}</SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="approval" className="min-h-0 flex-1 gap-0">
            <div className="px-5 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="approval">Aprovação</TabsTrigger>
                <TabsTrigger value="summary">Resumo</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="approval" className="min-h-0 overflow-y-auto">
          <TooltipProvider>
            <div className="flex flex-col gap-5 px-5 py-4">
              <section className="grid gap-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-medium text-zinc-900">Tipo de membro</h3>
                  <FieldHint text="Afiliados entram sem limite. Creators usam a cota do plano." />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700">Afiliados</span>
                    <span className="text-zinc-500">Ilimitado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700">Creators</span>
                    <span className="text-zinc-500">174/1000</span>
                  </div>
                </div>
              </section>

              <div className="grid gap-1.5">
                <Label className="gap-1">
                  Gestor(es)
                  <RequiredMark />
                </Label>
                <Select value={managerId} onValueChange={(value) => setManagerId(value ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar gestores...">
                      {(value) => {
                        const manager = managers.find((item) => item.id === value)
                        if (!manager) return <span className="text-muted-foreground">Selecionar gestores...</span>
                        return manager.name
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <section className="grid gap-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-medium text-zinc-900">Cupom</h3>
                  <FieldHint text="O cupom liga as vendas ao creator aprovado." />
                </div>
                <div className="grid gap-2">
                  <p className="text-sm text-zinc-600">Como deseja criar cupom para o creator?</p>
                  <RadioGroup
                    value={couponMode}
                    onValueChange={(value) => setCouponMode(value as CouponMode)}
                    className="grid gap-2"
                  >
                    <Choice value="automatico" label="Automático" />
                    <Choice value="personalizado" label="Personalizado" />
                    <Choice value="vincular" label="Vincular" />
                    <Choice value="nao_criar" label="Não criar" />
                  </RadioGroup>
                </div>

                {couponMode === "vincular" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="coupon-link" className="gap-1">
                      Qual cupom deseja vincular?
                      <RequiredMark />
                    </Label>
                    <Input
                      id="coupon-link"
                      placeholder="Digite o cupom"
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value)}
                    />
                  </div>
                )}

                {couponMode === "personalizado" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="coupon-custom" className="gap-1">
                      Qual código deseja criar?
                      <RequiredMark />
                    </Label>
                    <Input
                      id="coupon-custom"
                      placeholder="Digite o código"
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value)}
                    />
                  </div>
                )}

                {couponMode === "automatico" && (
                  <p className="text-sm text-zinc-500">O código será gerado automaticamente.</p>
                )}

                {couponMode !== "nao_criar" && (
                  <div className="grid gap-2">
                    <p className="text-sm text-zinc-600">Qual comissão deseja utilizar?</p>
                    <RadioGroup
                      value={commissionMode}
                      onValueChange={(value) => setCommissionMode(value as CommissionMode)}
                      className="grid gap-2"
                    >
                      <Choice value="padrao" label="Padrão" />
                      <Choice value="personalizada" label="Personalizada" />
                      <Choice value="nenhuma" label="Nenhuma" />
                    </RadioGroup>
                    {commissionMode === "padrao" && <p className="text-sm text-zinc-500">Padrão: 5%</p>}
                    {commissionMode === "personalizada" && (
                      <div className="grid gap-1.5">
                        <Label htmlFor="commission" className="gap-1">
                          Comissão
                          <RequiredMark />
                        </Label>
                        <Input
                          id="commission"
                          inputMode="decimal"
                          placeholder="5%"
                          value={commission}
                          onChange={(event) => setCommission(event.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-zinc-900">Voucher de boas-vindas</h3>
                  <RadioGroup
                    value={voucher}
                    onValueChange={(value) => setVoucher(value as "nao" | "sim")}
                    className="flex gap-4"
                  >
                    <Choice value="nao" label="Não" />
                    <Choice value="sim" label="Sim" />
                  </RadioGroup>
                </div>
                <p className="text-sm leading-relaxed text-zinc-500">
                  Crie um voucher de boas vindas para os novos creators. O código de uso será gerado aleatoriamente para cada creator.
                </p>
                {voucher === "sim" && (
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="gap-1">
                        Escolha a precificação atribuída ao voucher
                        <RequiredMark />
                      </Label>
                      <ActionsMenu
                        trigger="ellipsis"
                        items={[
                          {
                            label: "Abrir precificações",
                            icon: ExternalLink,
                            onSelect: () =>
                              toast.add({
                                type: "success",
                                title: "Precificações",
                                description: "A lista de vouchers está atualizada.",
                              }),
                          },
                          {
                            label: "Atualizar lista",
                            icon: RefreshCw,
                            onSelect: () => toast.add({ type: "success", title: "Lista atualizada" }),
                          },
                        ]}
                      />
                    </div>
                    <Select value={voucherPrice} onValueChange={(value) => setVoucherPrice(value ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma opção">
                          {(value) => {
                            const price = VOUCHER_PRICES.find((item) => item.id === value)
                            if (!price) return <span className="text-muted-foreground">Selecione uma opção</span>
                            return price.label
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {VOUCHER_PRICES.map((price) => (
                          <SelectItem key={price.id} value={price.id}>
                            {price.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </section>

              <section className="grid gap-3">
                <div className="grid gap-1">
                  <h3 className="text-sm font-medium text-zinc-900">Notificação</h3>
                  <p className="text-sm text-zinc-600">Deseja notificar o(s) creator(s) por email?</p>
                </div>
                <RadioGroup
                  value={notice}
                  onValueChange={(value) => setNotice(value as NoticeMode)}
                  className="grid gap-2"
                >
                  <Choice value="nao" label="Não" />
                  <Choice value="padrao" label="Padrão" />
                  <Choice value="personalizado" label="Personalizado" />
                </RadioGroup>
                {notice === "personalizado" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="notice-message" className="gap-1">
                      Mensagem do e-mail
                      <RequiredMark />
                    </Label>
                    <Textarea
                      id="notice-message"
                      placeholder="Escreva a mensagem do e-mail"
                      value={noticeMessage}
                      onChange={(event) => setNoticeMessage(event.target.value)}
                    />
                  </div>
                )}
              </section>
            </div>
          </TooltipProvider>
            </TabsContent>
            <TabsContent value="summary" className="min-h-0 overflow-y-auto">
              <CreatorSummary
                creators={creators}
                selectedId={summaryId || creators[0]?.id}
                onSelect={setSummaryId}
              />
            </TabsContent>
          </Tabs>

          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!ready}>
              Aprovar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

const TIER_LABELS: Record<Creator["tier"], string> = {
  nano: "Nano",
  micro: "Micro",
  mid: "Mid",
  macro: "Macro",
  mega: "Mega",
}

function profileFmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

function CreatorSummary({
  creators,
  selectedId,
  onSelect,
}: {
  creators: Creator[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  const creator = creators.find((item) => item.id === selectedId) ?? creators[0]
  if (!creator) {
    return <p className="px-5 py-6 text-sm text-zinc-500">Nenhum perfil selecionado.</p>
  }

  const verified = creator.networks.some((network) => network.network === "instagram" && network.verified)

  return (
    <div>
      {creators.length > 1 && (
        <div className="grid gap-1.5 px-5 pt-4">
          <Label>Perfil</Label>
          <Select value={creator.id} onValueChange={(value) => value && onSelect(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o perfil">
                {(value) => creators.find((item) => item.id === value)?.name ?? "Selecione o perfil"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {creators.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-start gap-3 px-5 py-4">
        {creator.photo ? (
          <img src={creator.photo} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700">
            {creator.avatar}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-base font-medium text-zinc-900">
            <span className="truncate">{creator.name}</span>
            {verified && <VerifiedBadge className="size-4" />}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">{creator.handle} · {creator.location}</p>
          <div className="mt-2">
            <CreatorContact email={creator.email} phone={creator.phone} />
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-1 text-xs font-medium",
            creator.status === "available"
              ? "bg-emerald-50 text-emerald-700"
              : creator.status === "in_campaign"
                ? "bg-blue-50 text-blue-700"
                : "bg-red-50 text-red-700"
          )}
        >
          {creator.status === "available" ? "Disponível" : creator.status === "in_campaign" ? "Em campanha" : "Bloqueado"}
        </span>
      </div>

      <div className="grid grid-cols-2 border-y border-zinc-100 sm:grid-cols-4">
        {[
          { label: "Seguidores", value: profileFmt(creator.totalFollowers), badge: "official" as const },
          { label: "Engaj. médio", value: `${creator.avgEngagement.toFixed(1)}%`, badge: "estimated" as const },
          { label: "Score WeSell", value: `${creator.score}/100`, badge: "inferred" as const },
          { label: "Valor mídia", value: `R$ ${profileFmt(creator.mediaValue)}`, badge: "estimated" as const },
        ].map(({ label, value, badge }) => (
          <div key={label} className="border-r border-zinc-100 px-3 py-3 text-center last:border-r-0">
            <p className="text-sm font-semibold text-zinc-900">{value}</p>
            <p className="mb-1 text-[10px] text-zinc-400">{label}</p>
            <SummaryBadge type={badge} />
          </div>
        ))}
      </div>

      <div className="space-y-4 px-5 py-4">
        <p className="text-sm text-zinc-600">{creator.bio}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Tier", value: TIER_LABELS[creator.tier] },
            { label: "Campanhas realizadas", value: creator.pastCampaigns },
            { label: "Total posts", value: creator.totalPosts ?? "—" },
            { label: "Última atividade", value: formatDateBR(creator.lastActivity) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
              <p className="text-xs text-zinc-400">{label}</p>
              <p className="mt-0.5 text-base font-semibold text-zinc-900">{value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {creator.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">Risco de fraude</p>
          <div className="flex items-center gap-3">
            <Progress value={creator.fraudScore * 10} className="h-2 flex-1" />
            <span
              className={cn(
                "text-xs font-medium",
                creator.fraudScore <= 2 ? "text-emerald-600" : creator.fraudScore <= 4 ? "text-yellow-600" : "text-red-600"
              )}
            >
              {creator.fraudScore <= 2 ? "Baixo" : creator.fraudScore <= 4 ? "Médio" : "Alto"}
            </span>
          </div>
        </div>
        {creator.totalSales !== undefined && creator.totalSales > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">Histórico de vendas</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Total vendas", value: `R$ ${creator.totalSales.toLocaleString("pt-BR")}` },
                { label: "Comissão paga", value: `R$ ${(creator.totalCommission ?? 0).toLocaleString("pt-BR")}` },
                { label: "Posts entregues", value: creator.totalPosts ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-zinc-100 bg-zinc-50 p-2 text-center">
                  <p className="text-sm font-semibold text-zinc-900">{value}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryBadge({ type }: { type: "official" | "estimated" | "inferred" }) {
  if (type === "official") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F3FF] px-1.5 py-0.5 text-xs font-semibold text-[#0095F6]">
        <VerifiedBadge className="size-3.5" label="Verificado" />
        Verificado
      </span>
    )
  }

  const cfg = {
    estimated: { label: "Estimado", icon: Info, cls: "bg-zinc-100 text-zinc-600" },
    inferred: { label: "Inferido", icon: Clock, cls: "bg-amber-50 text-amber-700" },
  }[type]
  const Icon = cfg.icon
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium", cfg.cls)}>
      <Icon size={12} /> {cfg.label}
    </span>
  )
}

function RequiredMark() {
  return (
    <>
      <span className="text-red-600" aria-hidden="true">*</span>
      <span className="sr-only">obrigatório</span>
    </>
  )
}

function Choice({ value, label }: { value: string; label: string }) {
  return (
    <Label className="font-normal text-zinc-700">
      <RadioGroupItem value={value} />
      {label}
    </Label>
  )
}

function FieldHint({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button type="button" variant="ghost" size="icon-xs" aria-label={text} />}
      >
        <CircleHelp />
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}
