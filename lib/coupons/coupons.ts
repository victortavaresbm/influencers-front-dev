// Pure rules of the Marca's Coupons screen: state badges, the store's
// discount, the code the Marca types and the coupon errors.
import type { StoreDiscount } from "../api/coupons"

export const COUPON_STATES = [
  "pending",
  "active",
  "pending_update",
  "pending_deactivation",
  "deactivated",
  "unsupported",
  "failed",
] as const
export type CouponState = (typeof COUPON_STATES)[number]

export type BadgeTone = "neutral" | "muted" | "warning" | "success" | "danger"

export interface CouponStateBadge {
  labelKey: `coupons.state.${CouponState}` | "coupons.state.unknown"
  tone: BadgeTone
}

const TONE: Record<CouponState, BadgeTone> = {
  pending: "warning",
  active: "success",
  pending_update: "warning",
  pending_deactivation: "muted",
  deactivated: "muted",
  unsupported: "neutral",
  failed: "danger",
}

function isCouponState(value: unknown): value is CouponState {
  return typeof value === "string" && (COUPON_STATES as readonly string[]).includes(value)
}

// A state the screen does not know yet shows as a neutral "other".
export function couponStateBadge(state: string | null | undefined): CouponStateBadge {
  if (!isCouponState(state)) return { labelKey: "coupons.state.unknown", tone: "neutral" }
  return { labelKey: `coupons.state.${state}`, tone: TONE[state] }
}

// Only these states take a new code: the ended ones answer coupon_not_editable.
export function canEditCode(state: string) {
  return state !== "pending_deactivation" && state !== "deactivated"
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const PERCENT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 })

export function formatCents(cents: number): string {
  return BRL.format(cents / 100)
}

// Either ready text or a message key the screen translates.
export type DiscountLabel = { text: string } | { labelKey: "coupons.store.freeShipping" }

export function formatStoreDiscount(discount: StoreDiscount | null | undefined): DiscountLabel {
  const value = discount?.value
  switch (discount?.type) {
    case "percentage":
      return typeof value === "number" ? { text: `${PERCENT.format(value)}%` } : { text: "—" }
    case "fixed":
      return typeof value === "number" ? { text: formatCents(value) } : { text: "—" }
    case "free_shipping":
      return { labelKey: "coupons.store.freeShipping" }
    default:
      return { text: "—" }
  }
}

// Same rule as sales coupon/util/CouponCode.java: letters and digits, 1 to 25,
// stored upper-cased; surrounding blanks are dropped.
const VALID_CODE = /^[A-Z0-9]{1,25}$/

export type CodeCheck =
  | { ok: true; code: string }
  | { ok: false; errorKey: "coupons.code.required" | "coupons.code.invalid" }

export function validateCouponCode(typed: string): CodeCheck {
  const code = typed.trim().toUpperCase()
  if (!code) return { ok: false, errorKey: "coupons.code.required" }
  return VALID_CODE.test(code) ? { ok: true, code } : { ok: false, errorKey: "coupons.code.invalid" }
}

const ERROR_KEY = {
  coupon_code_taken: "coupons.error.codeTaken",
  invalid_coupon_code: "coupons.code.invalid",
  coupon_not_editable: "coupons.error.notEditable",
  coupon_not_found: "coupons.error.notFound",
  connection_not_found: "coupons.error.connectionNotFound",
  store_unavailable: "coupons.error.storeUnavailable",
  invalid_page_cursor: "coupons.error.badCursor",
  forbidden_role: "coupons.error.forbiddenRole",
} as const

export type CouponErrorKey = (typeof ERROR_KEY)[keyof typeof ERROR_KEY]

// The coupon-specific error codes; null leaves the code to the generic API
// messages.
export function couponErrorKey(code: string): CouponErrorKey | null {
  return Object.hasOwn(ERROR_KEY, code) ? ERROR_KEY[code as keyof typeof ERROR_KEY] : null
}

// The API returns only the Creator's id; the short form stays readable.
export function shortId(id: string) {
  return id.length > 8 ? id.slice(0, 8) : id
}
