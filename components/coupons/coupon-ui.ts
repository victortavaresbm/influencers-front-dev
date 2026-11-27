"use client"
import { apiErrorCode, apiErrorMessage } from "@/lib/api/errors"
import { couponErrorKey, type BadgeTone } from "@/lib/coupons/coupons"
import type { MessageKey } from "@/lib/i18n"
import type { ConnectionView } from "@/lib/integrations/stores"

// The Marca's store connections, loaded once by the page for both tabs.
export interface Connections {
  items: ConnectionView[]
  loaded: boolean
  error: unknown
}

export const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "border-zinc-200 bg-white text-zinc-600",
  muted: "border-transparent bg-zinc-100 text-zinc-500",
  warning: "border-transparent bg-amber-100 text-amber-800",
  success: "border-transparent bg-emerald-100 text-emerald-800",
  danger: "border-transparent bg-red-100 text-red-700",
}

export const DATE_LOCALE = { pt: "pt-BR", en: "en-US", es: "es" } as const

type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string

// The coupon errors first, then the gateway's generic ones.
export function couponErrorText(t: Translate, err: unknown) {
  const key = couponErrorKey(apiErrorCode(err))
  return key ? t(key) : apiErrorMessage(t, err)
}
