"use client"

import { Coins } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function CreditCost({ amount }: { amount: number }) {
  const { t } = useI18n()
  const label = amount === 1 ? t("credits.balanceOne") : t("credits.balance", { count: amount })

  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-sm tabular-nums text-muted-foreground" aria-label={label}>
      <Coins className="size-4" aria-hidden />
      {amount}
    </span>
  )
}
