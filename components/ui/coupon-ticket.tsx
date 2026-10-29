"use client"

import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function CouponTicket({
  code,
  size = "sm",
  className,
}: {
  code: string
  size?: "sm" | "md"
  className?: string
}) {
  const { t } = useI18n()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      return
    }
    toast.add({
      type: "success",
      title: t("coupon.copied"),
      description: code,
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size === "md" ? "sm" : "xs"}
      title={code}
      aria-label={`${t("coupon.copy")}: ${code}`}
      onClick={(event) => {
        event.stopPropagation()
        void copy()
      }}
      className={cn("max-w-full min-w-0", className)}
    >
      <span className="truncate font-mono tracking-wide">{code}</span>
      <Copy data-icon="inline-end" />
    </Button>
  )
}
