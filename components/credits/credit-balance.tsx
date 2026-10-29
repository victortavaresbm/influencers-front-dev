"use client"

import { useState } from "react"
import { Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CREDIT_PACKS, type CreditPackId } from "@/lib/credits"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { organizationBalance, useCreditsStore } from "@/lib/stores/credits"
import { cn } from "@/lib/utils"

function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }).format(cents / 100)
}

export function CreditBalance() {
  const { t, locale } = useI18n()
  const organizationId = useAuthStore((state) => (state.user?.role === "brand" ? state.user.organizationId : null))
  const balances = useCreditsStore((state) => state.balances)
  const add = useCreditsStore((state) => state.add)
  const [open, setOpen] = useState(false)
  const [packId, setPackId] = useState<CreditPackId>(CREDIT_PACKS[0].id)

  if (!organizationId) return null

  const balance = organizationBalance(balances, organizationId)
  const lang = locale === "en" ? "en" : locale === "es" ? "es" : "pt-BR"
  const label = balance === 1 ? t("credits.balanceOne") : t("credits.balance", { count: balance })

  function buy() {
    const pack = CREDIT_PACKS.find((item) => item.id === packId)
    if (!pack || !organizationId) return
    add(organizationId, pack.credits)
    setOpen(false)
    toast.add({
      type: "success",
      title: t("credits.purchased"),
      description: t("credits.purchasedBody", { count: pack.credits }),
    })
  }

  return (
    <>
      <TooltipProvider delay={300}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`${label}. ${t("credits.buy")}`}
                onClick={() => setOpen(true)}
                className="px-2 tabular-nums text-muted-foreground"
              />
            }
          >
            <Coins />
            <span aria-live="polite">{balance}</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setPackId(CREDIT_PACKS[0].id)
          setOpen(next)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("credits.buyTitle")}</DialogTitle>
            <DialogDescription>{t("credits.buyHelp")}</DialogDescription>
          </DialogHeader>
          <RadioGroup value={packId} onValueChange={(value) => setPackId(value as CreditPackId)} className="grid gap-2">
            {CREDIT_PACKS.map((pack) => (
              <label
                key={pack.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3",
                  packId === pack.id ? "border-primary bg-muted" : "border-border"
                )}
              >
                <RadioGroupItem value={pack.id} />
                <span className="flex-1 text-sm font-medium">{t("credits.balance", { count: pack.credits })}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{money(pack.priceCents, lang)}</span>
              </label>
            ))}
          </RadioGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{t("credits.cancel")}</DialogClose>
            <Button type="button" onClick={buy}>
              {t("credits.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
